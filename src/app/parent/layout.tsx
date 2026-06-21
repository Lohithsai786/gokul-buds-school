'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardSidebar, DashboardHeader } from '@/components/shared'
import { useAuth } from '@/contexts/auth-context'

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && !loading) {
      if (!user || !profile) {
        router.replace('/login')
        return
      }
      if (profile.role !== 'parent') {
        const redirectMap = { admin: '/admin', teacher: '/teacher' }
        router.replace(redirectMap[profile.role as 'admin' | 'teacher'] || '/login')
      }
    }
  }, [user, profile, loading, mounted, router])

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 animate-spin" />
            <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-900" />
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile || profile.role !== 'parent') return null

  const userInitials = profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P'

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <DashboardSidebar role="parent" userName={profile.full_name} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Parent Portal" userName={profile.full_name || 'Parent'} userInitials={userInitials} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
