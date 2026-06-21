'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card }  from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/auth-context'
import { SchoolLogo } from '@/components/shared/school-logo'

const ROLE_REDIRECT: Record<string, string> = {
  admin: '/admin',
  teacher: '/teacher',
  parent: '/parent',
}

export default function LoginPage() {
  const router = useRouter()
  const { signIn, profile, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'parent'>('parent')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect when profile is available
  useEffect(() => {
    if (!authLoading && profile) {
      const dest = ROLE_REDIRECT[profile.role] ?? '/'
      console.log('[Login] Redirecting to', dest, 'role:', profile.role)
      router.replace(dest)
    }
  }, [authLoading, profile, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    try {
      console.log('[Login] Calling signIn for:', email)
      const userProfile = await signIn(email, password)
      console.log('[Login] signIn resolved — role:', userProfile.role)
      const dest = ROLE_REDIRECT[userProfile.role] ?? '/'
      console.log('[Login] Navigating to:', dest)
      // Keep isSubmitting true so the "Redirecting..." UI stays visible during navigation.
      await router.replace(dest)
      console.log('[Login] navigation complete')
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? 'Login failed. Please try again.'
      console.error('[Login] signIn threw:', message)
      setError(message)
      setIsSubmitting(false)
    }
    // NOTE: finally intentionally omitted — isSubmitting stays true until the
    // route change unmounts this page, so the spinner doesn't flicker back to the form.
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-gray-500 text-sm">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <SchoolLogo size="lg" />
        </div>

        <Card className="p-8 border-2 border-amber-100 dark:border-amber-900/30 shadow-lg dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-6">
            Sign in to your account
          </h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">I am a</Label>
              <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as 'admin' | 'teacher' | 'parent')}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                  <TabsTrigger value="teacher">Teacher</TabsTrigger>
                  <TabsTrigger value="parent">Parent</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2"
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2"
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2"
            >
              {isSubmitting ? 'Signing in...' : 'Login'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-amber-600 dark:text-amber-400 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
