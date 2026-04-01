import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({
      type: type as 'signup' | 'email',
      token_hash,
    })

    if (!error) {
      const response = NextResponse.redirect(new URL(next, request.url))
      // Copy cookies to the redirect response
      request.cookies.getAll().forEach(({ name, value }) => {
        response.cookies.set(name, value)
      })
      return response
    }
  }

  // If verification fails, redirect to login with error
  return NextResponse.redirect(new URL('/login', request.url))
}
