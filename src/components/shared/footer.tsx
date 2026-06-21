import Link from 'next/link'
import { MapPin, Phone, Mail } from 'lucide-react'
import { SchoolLogo } from './school-logo'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="mb-4">
              <SchoolLogo size="sm" onDark />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              A friendly, welcoming preschool where children are happy and enjoy learning in Tirupati.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { name: 'Home', href: '/' },
                { name: 'About Us', href: '/about' },
                { name: 'Programs', href: '/programs' },
                { name: 'Admissions', href: '/admissions' },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Resources</h4>
            <ul className="space-y-2">
              {[
                { name: 'Facilities', href: '/facilities' },
                { name: 'Contact Us', href: '/contact' },
                { name: 'Login', href: '/login' },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-300"># 12-72 Kshathriya Nagar</p>
                  <p className="text-xs text-gray-500">Avilala, Tirupati - 517507, AP</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <a href="mailto:info@gokulbuds.com" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
                  info@gokulbuds.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <a href="tel:+917330907774" className="text-sm text-gray-400 hover:text-amber-400 transition-colors block">
                    +91 73309 07774
                  </a>
                  <a href="tel:+917330937775" className="text-sm text-gray-400 hover:text-amber-400 transition-colors block">
                    +91 73309 37775
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Gokul Buds Preschool. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/thegokulbuds"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-800 text-gray-400 hover:bg-gradient-to-r hover:from-amber-400 hover:to-pink-400 hover:text-white transition-all duration-300"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>
            <a
              href="https://www.facebook.com/share/1EGFKE1Rj6/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-800 text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
