import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

// Standard Vite Environment Access
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Wir prüfen, ob die Keys existieren.
// Falls sie fehlen (z.B. noch nicht in .env eingetragen), ist supabase null.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * ANLEITUNG:
 * Erstelle eine Datei namens .env im Hauptverzeichnis und füge deine Keys hinzu:
 * 
 * VITE_SUPABASE_URL=https://dein-projekt.supabase.co
 * VITE_SUPABASE_ANON_KEY=dein-key
 */