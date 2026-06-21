'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/auth-context'

const ROLE_REDIRECT: Record<string, string> = {
  admin: '/admin',
  teacher: '/teacher',
  parent: '/parent',
}

export default function SignupPage() {
  const router = useRouter()
  const { signUp, profile, loading: authLoading } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'teacher' | 'parent'>('parent')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && profile) {
      router.replace(ROLE_REDIRECT[profile.role] ?? '/')
    }
  }, [authLoading, profile, router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsSubmitting(true)
    try {
      await signUp(email, password, fullName, role)
      // isSubmitting stays true — useEffect above redirects once profile is set
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed. Please try again.'
      setError(message)
      setIsSubmitting(false)
    }
  }

  if (authLoading || profile) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 opacity-90" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-teal-300 to-cyan-400" />
              <div className="absolute inset-4 rounded-full bg-yellow-100" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-amber-600 dark:text-amber-400 font-medium">Join Gokul Buds Preschool</p>
        </div>

        <Card className="p-8 border-2 border-amber-100 dark:border-amber-900/30 shadow-lg dark:bg-gray-800/50">
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">I am a</Label>
              <Tabs value={role} onValueChange={(v) => setRole(v as 'teacher' | 'parent')}>
                <TabsList className="grid w-full grid-cols-2">
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
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</Label>
              <Input id="fullName" type="text" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-2" disabled={isSubmitting} />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" disabled={isSubmitting} />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</Label>
              <Input id="password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2" disabled={isSubmitting} />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-2" disabled={isSubmitting} />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2">
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-600 dark:text-amber-400 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
