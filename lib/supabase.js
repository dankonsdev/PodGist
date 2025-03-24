import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a Supabase client with the service role key for server operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Create a Supabase client with the anon key for client operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 