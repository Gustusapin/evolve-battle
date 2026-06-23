// ============================================================================
// Client Supabase para o navegador (Client Components).
// Use este client em qualquer componente marcado com "use client".
// ============================================================================
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
