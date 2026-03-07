import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com Service Role Key - apenas para uso em API routes (ex.: webhooks).
 * NUNCA exponha no client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
