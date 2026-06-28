-- ============================================================
-- MONEY TREES — Script SQL Maestro
-- ============================================================
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- Este script crea todas las tablas, triggers, funciones
-- y políticas RLS necesarias para la aplicación.
-- ============================================================

-- ============================================================
-- 1. TABLA: profiles
-- Perfil del usuario, sincronizado con auth.users via trigger
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  preferred_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 2. FUNCIÓN + TRIGGER: Auto-crear perfil al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Eliminar trigger si existe para evitar duplicados
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. TABLA: accounts (Cuentas / Billeteras)
-- Tipos: cash, checking, savings, credit_card
-- credit_card permite balance negativo (deuda)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'checking', 'savings', 'credit_card')),
  balance NUMERIC(15, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  icon TEXT DEFAULT '💰',
  color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propias cuentas"
  ON public.accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propias cuentas"
  ON public.accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias cuentas"
  ON public.accounts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias cuentas"
  ON public.accounts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. TABLA: categories (Categorías de transacciones)
-- type: 'income' o 'expense' — estrictamente separados
-- user_id NULL = categoría global del sistema
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT DEFAULT '📋',
  color TEXT DEFAULT '#8b5cf6',
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Los usuarios ven sus categorías propias + las globales del sistema
CREATE POLICY "Usuarios ven sus categorías y las del sistema"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id OR is_system = TRUE);

CREATE POLICY "Usuarios pueden crear categorías propias"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "Usuarios pueden actualizar sus categorías"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id AND is_system = FALSE)
  WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "Usuarios pueden eliminar sus categorías"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id AND is_system = FALSE);

-- ============================================================
-- 5. TABLA: transactions (Motor de flujo de caja)
-- Tipos: income, expense, transfer
-- transfer requiere to_account_id y NO requiere category_id
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Reglas de integridad:
  -- Transferencias DEBEN tener cuenta destino y NO categoría
  -- Ingresos/Gastos NO deben tener cuenta destino y DEBEN tener categoría
  CONSTRAINT valid_transfer CHECK (
    (type = 'transfer' AND to_account_id IS NOT NULL AND category_id IS NULL)
    OR
    (type != 'transfer' AND to_account_id IS NULL AND category_id IS NOT NULL)
  )
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus propias transacciones"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear transacciones"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus transacciones"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus transacciones"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 6. FUNCIÓN + TRIGGER: Actualizar balance al insertar transacción
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_account_balance_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.type = 'income' THEN
    UPDATE public.accounts SET balance = balance + NEW.amount, updated_at = NOW()
    WHERE id = NEW.account_id;

  ELSIF NEW.type = 'expense' THEN
    UPDATE public.accounts SET balance = balance - NEW.amount, updated_at = NOW()
    WHERE id = NEW.account_id;

  ELSIF NEW.type = 'transfer' THEN
    -- Restar de cuenta origen
    UPDATE public.accounts SET balance = balance - NEW.amount, updated_at = NOW()
    WHERE id = NEW.account_id;
    -- Sumar a cuenta destino
    UPDATE public.accounts SET balance = balance + NEW.amount, updated_at = NOW()
    WHERE id = NEW.to_account_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_transaction_insert ON public.transactions;

CREATE TRIGGER on_transaction_insert
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_account_balance_on_insert();

-- ============================================================
-- 7. FUNCIÓN + TRIGGER: Revertir balance al eliminar transacción
-- ============================================================
CREATE OR REPLACE FUNCTION public.revert_account_balance_on_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.type = 'income' THEN
    UPDATE public.accounts SET balance = balance - OLD.amount, updated_at = NOW()
    WHERE id = OLD.account_id;

  ELSIF OLD.type = 'expense' THEN
    UPDATE public.accounts SET balance = balance + OLD.amount, updated_at = NOW()
    WHERE id = OLD.account_id;

  ELSIF OLD.type = 'transfer' THEN
    UPDATE public.accounts SET balance = balance + OLD.amount, updated_at = NOW()
    WHERE id = OLD.account_id;
    UPDATE public.accounts SET balance = balance - OLD.amount, updated_at = NOW()
    WHERE id = OLD.to_account_id;
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_transaction_delete ON public.transactions;

CREATE TRIGGER on_transaction_delete
  AFTER DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.revert_account_balance_on_delete();

-- ============================================================
-- 8. TABLA: budgets (Presupuestos mensuales por categoría)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  amount_limit NUMERIC(15, 2) NOT NULL CHECK (amount_limit > 0),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Un presupuesto por categoría por mes/año
  UNIQUE (user_id, category_id, month, year)
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus presupuestos"
  ON public.budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus presupuestos"
  ON public.budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus presupuestos"
  ON public.budgets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan sus presupuestos"
  ON public.budgets FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 9. TABLA: saving_goals (Metas de ahorro / Fondo de emergencia)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saving_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(15, 2) DEFAULT 0.00,
  target_date DATE,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#10b981',
  is_emergency_fund BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.saving_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus metas"
  ON public.saving_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus metas"
  ON public.saving_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus metas"
  ON public.saving_goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan sus metas"
  ON public.saving_goals FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 10. CATEGORÍAS GLOBALES DEL SISTEMA (Seed Data)
-- ============================================================
INSERT INTO public.categories (name, type, icon, color, is_system) VALUES
  -- Ingresos
  ('Salario', 'income', '💼', '#10b981', TRUE),
  ('Freelance', 'income', '💻', '#06b6d4', TRUE),
  ('Inversiones', 'income', '📈', '#8b5cf6', TRUE),
  ('Regalos', 'income', '🎁', '#f59e0b', TRUE),
  ('Otros Ingresos', 'income', '💵', '#6366f1', TRUE),
  -- Gastos
  ('Alimentación', 'expense', '🍔', '#ef4444', TRUE),
  ('Transporte', 'expense', '🚗', '#f97316', TRUE),
  ('Vivienda', 'expense', '🏠', '#8b5cf6', TRUE),
  ('Servicios', 'expense', '💡', '#eab308', TRUE),
  ('Salud', 'expense', '🏥', '#ec4899', TRUE),
  ('Educación', 'expense', '📚', '#6366f1', TRUE),
  ('Entretenimiento', 'expense', '🎬', '#a855f7', TRUE),
  ('Ropa', 'expense', '👕', '#14b8a6', TRUE),
  ('Suscripciones', 'expense', '📱', '#f43f5e', TRUE),
  ('Otros Gastos', 'expense', '📋', '#64748b', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ✅ Script completado
-- ============================================================
