'use client';

import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

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

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: '+91 73309 07774 / 37775',
      link: 'tel:+917330907774',
    },
    {
      icon: Mail,
      title: 'Email',
      details: 'info@gokulbuds.com',
      link: 'mailto:info@gokulbuds.com',
    },
    {
      icon: MapPin,
      title: 'Address',
      details: '# 12-72 Kshathriya Nagar, Avilala, Tirupati - 517507',
      link: 'https://maps.app.goo.gl/sdBRc3XiKf7ySeRB7',
    },
  ];

  const officeHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 5:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 1:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We&apos;d love to hear from you. Get in touch with us for any inquiries or questions.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <a
                  key={info.title}
                  href={info.link}
                  className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100/50 hover:scale-105 cursor-pointer"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{info.title}</h3>
                  <p className="text-gray-700 font-semibold">{info.details}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Map and Hours */}
      <section className="py-16 px-4 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Google Map */}
          <div className="md:col-span-2 bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100/50">
            <iframe
              title="Gokul Buds Preschool Location"
              src="https://www.google.com/maps?q=13.6105168,79.4299906&z=16&hl=en&output=embed"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span># 12-72 Kshathriya Nagar, Avilala, Tirupati</span>
              </div>
              <a
                href="https://maps.app.goo.gl/sdBRc3XiKf7ySeRB7"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 whitespace-nowrap ml-2"
              >
                Open in Maps
              </a>
            </div>
          </div>

          {/* Sidebar - Hours & Social */}
          <div className="space-y-6">
            {/* Office Hours */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100/50">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-amber-600" />
                <h3 className="text-2xl font-bold text-gray-800">Office Hours</h3>
              </div>
              <div className="space-y-4">
                {officeHours.map((hour, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    <p className="font-semibold text-gray-800">{hour.day}</p>
                    <p className="text-gray-600 text-sm">{hour.hours}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100/50">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Follow Us</h3>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/thegokulbuds"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <InstagramIcon className="w-6 h-6" />
                </a>
                <a
                  href="https://www.facebook.com/share/1EGFKE1Rj6/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <FacebookIcon className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
