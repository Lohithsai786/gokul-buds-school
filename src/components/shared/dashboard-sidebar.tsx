'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, LogOut, LayoutDashboard, Users, UsersRound, GraduationCap, School, CheckSquare, IndianRupee, BookOpen, ClipboardList, Clock, Megaphone, MessageCircle, MessagesSquare, Settings, BarChart3, FileEdit, FileText, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'

interface DashboardSidebarProps {
  role: 'admin' | 'teacher' | 'parent'
  userName?: string
}

const navigationItems = {
  admin: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Students', href: '/admin/students', icon: GraduationCap },
    { label: 'Teachers', href: '/admin/teachers', icon: Users },
    { label: 'Parents', href: '/admin/parents', icon: UsersRound },
    { label: 'Classes', href: '/admin/classes', icon: School },
    { label: 'Admissions', href: '/admin/admissions', icon: FileEdit },
    { label: 'Inquiries', href: '/admin/inquiries', icon: Inbox },
    { label: 'Groups', href: '/admin/groups', icon: MessagesSquare },
    { label: 'Attendance', href: '/admin/attendance', icon: CheckSquare },
    { label: 'Fees', href: '/admin/fees', icon: IndianRupee },
    { label: 'Homework', href: '/admin/homework', icon: BookOpen },
    { label: 'Exams', href: '/admin/exams', icon: ClipboardList },
    { label: 'Timetable', href: '/admin/timetable', icon: Clock },
    { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
    { label: 'Messages', href: '/admin/messages', icon: MessageCircle },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ],
  teacher: [
    { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    { label: 'Classes', href: '/teacher/classes', icon: School },
    { label: 'Attendance', href: '/teacher/attendance', icon: CheckSquare },
    { label: 'Homework', href: '/teacher/homework', icon: BookOpen },
    { label: 'Groups', href: '/teacher/groups', icon: MessagesSquare },
    { label: 'Exams', href: '/teacher/exams', icon: ClipboardList },
    { label: 'Timetable', href: '/teacher/timetable', icon: Clock },
    { label: 'Announcements', href: '/teacher/announcements', icon: Megaphone },
    { label: 'Messages', href: '/teacher/messages', icon: MessageCircle },
  ],
  parent: [
    { label: 'Dashboard', href: '/parent', icon: LayoutDashboard },
    { label: 'Profile', href: '/parent/profile', icon: FileText },
    { label: 'Attendance', href: '/parent/attendance', icon: CheckSquare },
    { label: 'Homework', href: '/parent/homework', icon: BookOpen },
    { label: 'Groups', href: '/parent/groups', icon: MessagesSquare },
    { label: 'Results', href: '/parent/results', icon: BarChart3 },
    { label: 'Fees', href: '/parent/fees', icon: IndianRupee },
    { label: 'Timetable', href: '/parent/timetable', icon: Clock },
    { label: 'Messages', href: '/parent/messages', icon: MessageCircle },
  ],
}

function SidebarContent({ role, userName, onClose }: DashboardSidebarProps & { onClose?: () => void }) {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const items = navigationItems[role]

  const handleLogout = async () => {
    onClose?.()
    await signOut()
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="p-5 border-b border-amber-100/30 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 opacity-90" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-teal-300 to-cyan-400" />
            <div className="absolute inset-4 rounded-full bg-yellow-100" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Gokul Buds</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Preschool</p>
          </div>
        </Link>
        {userName && (
          <div className="mt-4 pt-4 border-t border-amber-100/30 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Welcome,</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{userName}</p>
            <span className="inline-block mt-2 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 capitalize">
              {role}
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 text-amber-700 dark:text-amber-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-amber-600 dark:text-amber-400' : '')} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-amber-100/30 dark:border-gray-800">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full gap-2 border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}

export function DashboardSidebar({ role, userName }: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <aside className="hidden md:flex md:w-64 bg-white dark:bg-gray-900 border-r border-amber-100/30 dark:border-gray-800 flex-col">
        <SidebarContent role={role} userName={userName} />
      </aside>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden fixed top-4 left-4 z-40">
          <Button variant="ghost" size="icon" className="text-amber-600 bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-lg shadow-sm">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent role={role} userName={userName} onClose={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
