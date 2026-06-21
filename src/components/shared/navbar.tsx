'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { SchoolLogo } from './school-logo'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Programs', href: '/programs' },
  { name: 'Facilities', href: '/facilities' },
{ name: 'Admissions', href: '/admissions' },
  { name: 'Contact', href: '/contact' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex-shrink-0">
            <SchoolLogo size="sm" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-950/10'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                size="sm"
                className="hidden sm:flex gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Button>
            </Link>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-amber-600">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-6 pt-8">
                  <Link href="/" onClick={() => setIsOpen(false)}>
                    <SchoolLogo size="sm" />
                  </Link>

                  <div className="flex flex-col gap-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                          pathname === item.href
                            ? 'text-amber-600 bg-amber-50'
                            : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50/50'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <Link href="/login" className="w-full block" onClick={() => setIsOpen(false)}>
                      <Button className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                        <LogIn className="w-4 h-4" />
                        Login
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
