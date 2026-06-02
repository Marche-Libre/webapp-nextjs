import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.NEXT_PRIVATE_SUPABASE_PASWWORD;

  if (!supabaseUrl || !secretKey) {
    throw new Error("Configuration Supabase admin manquante");
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
