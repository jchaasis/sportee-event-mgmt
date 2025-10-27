'use server'

import { createUserClient, createClient } from '@/lib/supabase/server-client'
import { signupSchema, loginSchema } from '@/lib/validations'
import { ActionResult, createSuccessResult, createErrorResult, handleServerError } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

/**
 * Sign up a new user with email and password
 */
export async function signUp(formData: FormData): Promise<ActionResult> {
  try {
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      organizationName: formData.get('organizationName') as string,
    }

    // Validate input
    const validated = signupSchema.parse(rawData)

    const supabase = await createUserClient()

    // 1. Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
    })

    if (signUpError) {
      return createErrorResult(signUpError.message)
    }

    if (!authData.user) {
      return createErrorResult('Failed to create user')
    }

    // 2. Get the service role client for elevated privileges
    const adminSupabase = await createClient()

    // 3. Create or get the organization
    const { data: orgData, error: orgError } = await adminSupabase
      .from('organizations')
      .insert({
        name: validated.organizationName,
      })
      .select()
      .single()

    if (orgError) {
      return createErrorResult(`Failed to create organization: ${orgError.message}`)
    }

    // 4. Create organization membership
    const { error: memberError } = await adminSupabase
      .from('organization_members')
      .insert({
        organization_id: orgData.id,
        user_id: authData.user.id,
        role: 'admin',
      })

    if (memberError) {
      return createErrorResult(`Failed to create membership: ${memberError.message}`)
    }

    // 5. Create user profile
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name: validated.name,
        email: validated.email,
      })

    if (profileError && profileError.code !== '23505') {
      // Ignore duplicate key errors for profiles
      return createErrorResult(`Failed to create profile: ${profileError.message}`)
    }

    revalidatePath('/')
    return createSuccessResult({ userId: authData.user.id })
  } catch (error) {
    return createErrorResult(handleServerError(error))
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(formData: FormData): Promise<ActionResult> {
  try {
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    // Validate input
    const validated = loginSchema.parse(rawData)

    const supabase = await createUserClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    })

    if (error) {
      return createErrorResult(error.message)
    }

    revalidatePath('/')
    return createSuccessResult(null)
  } catch (error) {
    return createErrorResult(handleServerError(error))
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<ActionResult> {
  try {
    const supabase = await createUserClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) {
      return createErrorResult(error.message)
    }

    // Return the OAuth URL to redirect the user
    return createSuccessResult({ url: data.url })
  } catch (error) {
    return createErrorResult(handleServerError(error))
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<ActionResult> {
  try {
    const supabase = await createUserClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return createErrorResult(error.message)
    }

    revalidatePath('/')
    return createSuccessResult(null)
  } catch (error) {
    return createErrorResult(handleServerError(error))
  }
}

