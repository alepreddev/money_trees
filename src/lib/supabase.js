import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno de Supabase.\n' +
    'Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env.local\n' +
    'Consulta: https://app.supabase.com → Tu Proyecto → Settings → API'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
