
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

// SICHERE VARIANTE: Zugriff auf Environment Variables
const getEnv = (key: string) => {
  // Prüfen ob import.meta existiert und ob env existiert
  const env = (import.meta as any)?.env || {};
  return env[key];
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Wir prüfen, ob die Keys existieren, um Abstürze zu vermeiden.
// Falls sie fehlen, ist supabase null und die App nutzt die Mock-Daten (siehe contexts.tsx).
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * ANLEITUNG ZUR SICHERHEIT:
 * 
 * 1. Der 'supabaseAnonKey' ist zwar im Browser sichtbar, aber das ist okay.
 *    Sicherheit entsteht durch "Row Level Security" (RLS) in der Datenbank selbst.
 *    
 * 2. Gehe in Supabase -> Authentication -> Policies
 *    Erstelle Regeln wie: "Users can only view their own bookings."
 *    
 * 3. NIEMALS den 'service_role' Key hier verwenden! Nur den 'anon' Key.
 */
