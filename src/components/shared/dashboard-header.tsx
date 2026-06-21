'use client'

import { Bell, Moon, Sun, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from '@/contexts/theme-context'
import { useAuth } from '@/contexts/auth-context'

interface DashboardHeaderProps {
  title: string
  userName?: string
  userInitials?: string
}

export function DashboardHeader({ title, userName = 'User', userInitials = 'U' }: DashboardHeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { signOut } = useAuth()

  const notifications = [
    { id: '1', message: 'New attendance record submitted', time: '5m ago', read: false },
    { id: '2', message: 'Homework assignment due tomorrow', time: '30m ago', read: false },
    { id: '3', message: 'Class schedule updated', time: '2h ago', read: true },
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-amber-100/20 dark:border-gray-800">
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-gray-600 dark:text-gray-400 hover:text-amber-600">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
              </div>
              <ScrollArea className="h-64">
                {notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b last:border-0 ${!n.read ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''}`}>
                    <p className="text-sm">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                ))}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-gray-600 dark:text-gray-400 hover:text-amber-600">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-auto p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/10">
                <Avatar className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500">
                  <AvatarFallback className="text-white font-semibold text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium text-gray-900 dark:text-white">
                  {userName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <User className="w-4 h-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
