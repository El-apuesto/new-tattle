import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zhzdehswlygmhbdsrhax.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoemRlaHN3bHlnbWhiZHNyaGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjA3MzAsImV4cCI6MjA3NjEzNjczMH0.arjiy5jDcydkzFpJbqsruOhn1o9Guqu1Rcw8bcL2mbo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
