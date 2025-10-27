import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
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
          const orgName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'My Organization'
          
          // Create organization using the service role client
          const { createClient } = await import('@/lib/supabase/server-client')
          const adminSupabase = await createClient()
          
          const { data: orgData, error: orgError } = await adminSupabase
            .from('organizations')
            .insert({ name: orgName })
            .select()
            .single()

          if (!orgError && orgData) {
            // Create organization membership
            await adminSupabase
              .from('organization_members')
              .insert({
                organization_id: orgData.id,
                user_id: user.id,
                role: 'admin',
              })

            // Create user profile
            await adminSupabase
              .from('profiles')
              .upsert({
                id: user.id,
                name: user.user_metadata?.full_name || user.email || '',
                email: user.email || '',
              })
          }
        }
      }

      // Redirect to dashboard after successful authentication
      return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=auth_callback_error', requestUrl.origin))
}

