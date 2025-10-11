import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://fsoczxlarrlecnbwghdz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb2N6eGxhcnJsZWNuYndnaGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MDQ1MjQsImV4cCI6MjA3MTk4MDUyNH0.557q-NH83skLzDHxszUE1B_KwGJWaaLZY-Aw05LS_OE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});