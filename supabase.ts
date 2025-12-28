
import { createClient } from '@supabase/supabase-js';

/**
 * CONFIGURAÇÃO DO SUPABASE - PurpleDream v2
 * Conexão robusta utilizando a chave anon real extraída dos metadados.
 */

// O Vite substitui essas strings em tempo de compilação.
// A ordem de fallback garante que o app funcione mesmo sem variáveis de ambiente configuradas na Vercel.
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://brbqhbghvuhvmelmvoyx.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyYnFoYmdodnVodm1lbG12b3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODEyNDgsImV4cCI6MjA4MjQ1NzI0OH0.BqIuqdYUhsAvRWnf57Xro_TjpLikFG4Urcoj0NIFkOs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
  console.log('💜 PurpleDream: Database connected with production key');
}
