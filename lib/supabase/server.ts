import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// One per request: Server Components can't set cookies, so `setAll` is left
// as a no-op there (handled instead by refreshing the session in proxy.ts).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component; ignored because proxy.ts
            // refreshes the session cookie on every request.
          }
        },
      },
    },
  );
}
