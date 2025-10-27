import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    // Store cookies that will be set during exchangeCodeForSession
    const authCookies: Array<{ name: string; value: string; options?: object }> = []
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Capture cookies that Supabase wants to set
            cookiesToSet.forEach(({ name, value, options }) => {
              authCookies.push({ name, value, options })
            })
          },
        },
      }
    )

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user has an organization
        const { data: memberships } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .limit(1)

        // If no organization exists, create one
        if (!memberships || memberships.length === 0) {
          // Create organization using the service role client
          const { createClient } = await import('@/lib/supabase/server-client')
          const adminSupabase = await createClient()
          
          const { data: orgData, error: orgError } = await adminSupabase
            .from('organizations')
            .insert({})
            .select()
            .single()

          if (!orgError && orgData) {
            // Create organization membership
            const { error: memberError } = await adminSupabase
              .from('organization_members')
              .insert({
                organization_id: orgData.id,
                user_id: user.id,
                role: 'admin',
              })

            if (memberError) {
              console.error('Failed to create organization membership:', memberError)
            }

            // Create user profile
            const { error: profileError } = await adminSupabase
              .from('profiles')
              .upsert({
                id: user.id,
                name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                email: user.email || '',
              })

            if (profileError) {
              console.error('Failed to create profile:', profileError)
            }
          }
        }
      }

      // Create redirect response
      const redirect = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      
      // Set all the auth cookies that Supabase wants to set
      authCookies.forEach(({ name, value, options }) => {
        redirect.cookies.set(name, value, options || {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        })
      })
      
      return redirect
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=auth_callback_error', requestUrl.origin))
}

