import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yuvclpcaocohflcqiite.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1dmNscGNhb2NvaGZsY3FpaXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NjAyNTEsImV4cCI6MjA5MjEzNjI1MX0.d6fH1KnA4fQcHEogl-0qDV2fhPE9G7Esx1cPDCTyvFo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
