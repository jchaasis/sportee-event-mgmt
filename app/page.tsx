import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/auth-helpers'

export default async function HomePage() {
  const user = await getCurrentUser()

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
