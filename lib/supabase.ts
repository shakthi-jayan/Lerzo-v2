
import { createClient } from '@supabase/supabase-js';

// These environment variables are provided by the user
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key is missing!");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
