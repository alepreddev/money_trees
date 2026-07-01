# Plan de Implementación: App de Finanzas Personales

Este documento es la hoja de ruta interactiva para el desarrollo de la aplicación web de finanzas utilizando **React.js** y **Supabase (PostgreSQL)**. El desarrollo está estructurado en fases incrementales para asegurar estabilidad y orden.

## 📌 Principios de Diseño del Sistema
- **Fricción Cero:** El flujo de registro de transacciones debe requerir el mínimo de clics posibles.
- **Consistencia de Datos:** El backend (PostgreSQL) gestiona de forma estricta los cálculos lógicos críticos (balances y triggers).
- **Seguridad y Aislamiento:** Uso mandatorio de **pnpm** para mitigar riesgos en la cadena de suministro de paquetes y políticas **RLS** para restringir accesos en base de datos.

---

## 🛠️ Fase 1: Configuración del Entorno e Infraestructura Base
- [x] **1.1 Inicialización del Proyecto Frontend**
  - Crear el proyecto React mediante Vite utilizando pnpm: `pnpm create vite@latest . --template react`.
  - Configurar las variables de entorno (`.env.local`) con las credenciales de Supabase (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`).
- [x] **1.2 Despliegue de la Base de Datos en Supabase**
  - Ejecutar el script SQL maestro en el SQL Editor de Supabase para crear las tablas (`profiles`, `accounts`, `categories`, `budgets`, `transactions`, `saving_goals`).
  - Habilitar y verificar las políticas de seguridad **Row Level Security (RLS)** en todas las tablas.
- [x] **1.3 Cliente de Conexión**
  - Instalar el SDK oficial de Supabase mediante pnpm: `pnpm add @supabase/supabase-js`.
  - Crear el archivo centralizado de inicialización en `src/lib/supabase.js`.

---

## 🔐 Fase 2: Módulo de Autenticación y Perfil de Usuario
- [x] **2.1 Lógica de Sesión en React**
  - Crear un Contexto de React (`AuthContext.jsx`) para monitorear globalmente el estado del usuario (`user`, `session`, `loading`).
- [x] **2.2 Formularios de Acceso**
  - Crear las vistas funcionales de **Registro (Sign Up)** y **Inicio de Sesión (Log In)** conectadas a `supabase.auth`.
- [x] **2.3 Sincronización de Perfiles**
  - Validar que el Trigger de PostgreSQL inserte automáticamente una fila en `public.profiles` cuando un nuevo usuario se registra.

---

## 🏦 Fase 3: Gestión de Entidades (Cuentas y Categorías)
- [x] **3.1 Módulo de Cuentas (Billeteras)**
  - Crear componentes funcionales para listar las cuentas actuales y sus balances correspondientes.
  - Formulario de creación de cuenta especificando tipo (`cash`, `checking`, `savings`, `credit_card`).
- [x] **3.2 Módulo de Categorías**
  - Crear la lógica para listar las categorías asignadas al usuario y las categorías globales del sistema.
  - Implementar formulario funcional para añadir categorías personalizadas (filtrando estrictamente por tipo `income` o `expense`).

---

## 📝 Fase 4: El Motor de Transacciones (Flujo de Caja)
- [x] **4.1 Formulario de Transacción Rápida (Fricción Cero)**
  - Diseñar la lógica del formulario unificado que capture: Monto, Tipo, Cuenta Origen, Categoría, Descripción y Fecha.
  - Si el tipo es `transfer`, habilitar de manera condicional el campo `to_account_id` (Cuenta Destino) y deshabilitar el campo de categorías.
- [x] **4.2 Historial del Flujo de Caja**
  - Crear una vista de historial cronológico general.
  - Implementar filtros lógicos del lado del cliente/servidor por: Mes actual, Cuenta y Tipo de Transacción.
- [x] **4.3 Triggers de Automatización en DB**
  - Crear funciones en PostgreSQL para que, al insertar una transacción, se actualice el campo `balance` de la cuenta asociada de forma automática.

---

## 🎯 Fase 5: Estabilidad, Presupuestos y Metas
- [x] **5.1 Sistema de Presupuestos Mensuales**
  - Crear la vista de asignación de techos de gasto mensuales por categoría.
  - Calcular matemáticamente la suma de gastos del mes actual frente al límite del presupuesto para mostrar porcentajes de consumo.
- [x] **5.2 Asistente Financiero 50/30/20**
  - Crear un componente que capture los ingresos totales esperados del mes y desglose automáticamente las metas sugeridas en Necesidades (50%), Deseos (30%) y Ahorro (20%).
- [x] **5.3 Metas de Ahorro y Fondo de Emergencia**
  - Crear sección para configurar la meta del Fondo de Emergencia (Gastos fijos recurrentes × 3 o 6 meses).
  - Lógica para simular el desvío de dinero de cuentas reales hacia "huchas virtuales" de metas de ahorro.

---

## 📊 Fase 6: Dashboard, Analíticas y Cierre
- [ ] **6.1 Métricas Clave del Dashboard Principal**
  - Implementar lógica para consolidar de un vistazo: Balance Neto Total (Suma de activos menos deudas), Ingresos del Mes, Gastos del Mes y Flujo de Caja Neto.
- [ ] **6.2 Reportes Gráficos**
  - Preparar los arreglos de datos estructurados para alimentar gráficos (ej. Distribución porcentual de gastos por categoría y evolución temporal de ingresos vs gastos).
- [ ] **6.3 Pruebas de Consistencia de Datos**
  - Realizar auditorías de transacciones: verificar que al borrar un gasto el saldo de la cuenta regrese a la normalidad y que las transferencias no alteren el patrimonio global.
