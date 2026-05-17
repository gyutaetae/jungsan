import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../types/database";

let browserClient: SupabaseClient<Database> | null = null;

export function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  browserClient ??= createClient<Database>(supabaseUrl, supabaseAnonKey);
  return browserClient;
}
