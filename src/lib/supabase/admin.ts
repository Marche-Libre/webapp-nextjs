import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PRIVATE_SUPABASE_SECRET_KEY ??
    process.env.NEXT_PRIVATE_SUPABASE_PASSWORD;

  if (!supabaseUrl || !secretKey) {
    throw new Error(
      "Configuration Supabase admin manquante : définissez SUPABASE_SERVICE_ROLE_KEY côté serveur.",
    );
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
