import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { hasPublicEnv, readPublicEnv } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  if (!hasPublicEnv()) {
    return NextResponse.next({
      request
    });
  }

  const env = readPublicEnv();
  let response = NextResponse.next({
    request
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  await supabase.auth.getSession();

  return response;
}
