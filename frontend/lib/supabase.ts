import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('Supabase configuration:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  urlPrefix: supabaseUrl?.substring(0, 30),
  keyPrefix: supabaseKey?.substring(0, 20)
});

if (!supabaseUrl || !supabaseKey) {
  const errorMsg = `Faltan variables de entorno de Supabase: URL=${!!supabaseUrl}, KEY=${!!supabaseKey}`;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

export const supabase = createClient(supabaseUrl, supabaseKey);