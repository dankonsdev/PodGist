import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AuthPage() {
  console.log("AuthPage component rendered")
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check for existing user
    const { data } = supabase.auth.getUser()
    setUser(data?.user || null)

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user)
          router.push('/dashboard')
        }
        if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [router])

  if (user) {
    return <div>Already logged in. Redirecting...</div>
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Sign in to Podcast App</h1>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google']}
        redirectTo={`${process.env.NEXT_PUBLIC_URL}/dashboard`}
      />
    </div>
  )
} 