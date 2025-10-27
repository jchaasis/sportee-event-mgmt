import { createUserClient } from './server-client'

/**
 * Gets the current authenticated user from the session
 */
export async function getCurrentUser() {
  const supabase = await createUserClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

/**
 * Gets the current session
 */
export async function getSession() {
  const supabase = await createUserClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    return null
  }
  
  return session
}

/**
 * Signs out the current user
 */
export async function signOut() {
  const supabase = await createUserClient()
  await supabase.auth.signOut()
}

