import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const cookiesToSet: Array<{ name: string; value: string }> = []
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToStore) {
            cookiesToStore.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              cookiesToSet.push({ name, value })
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
            } else {
              console.log('Successfully created organization membership')
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
            } else {
              console.log('Successfully created user profile')
            }
          } else if (orgError) {
            console.error('Failed to create organization:', orgError)
          }
        }
      }

      // Redirect to dashboard after successful authentication with cookies in the response
      const redirectResponse = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      cookiesToSet.forEach(({ name, value }) => {
        redirectResponse.cookies.set(name, value)
      })
      return redirectResponse
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=auth_callback_error', requestUrl.origin))
}

