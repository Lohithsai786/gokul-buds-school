'use client';

import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Shield, Home, Lightbulb, Laptop, Gamepad2, Flower } from 'lucide-react';

export default function FacilitiesPage() {
  const facilities = [
    {
      id: 1,
      title: 'Safe Campus',
      description: 'State-of-the-art security systems, CCTV surveillance, trained security staff, and safe play areas.',
      icon: Shield,
      color: 'from-blue-400 to-cyan-400',
    },
    {
      id: 2,
      title: 'Child-Friendly Environment',
      description: 'Designed with child psychology in mind, colorful classrooms, comfortable seating, and welcoming spaces.',
      icon: Home,
      color: 'from-rose-400 to-pink-400',
    },
    {
      id: 3,
      title: 'Activity-Based Learning',
      description: 'Well-equipped activity centers for play-based learning, art, music, and creative development.',
      icon: Lightbulb,
      color: 'from-yellow-400 to-amber-400',
    },
    {
      id: 4,
      title: 'Smart Classrooms',
      description: 'Modern teaching aids, interactive learning tools, audiovisual equipment, and age-appropriate resources.',
      icon: Laptop,
      color: 'from-purple-400 to-indigo-400',
    },
    {
      id: 5,
      title: 'Indoor Activities',
      description: 'Basketball court, indoor play areas, music rooms, art studios, and special activity zones.',
      icon: Gamepad2,
      color: 'from-orange-400 to-red-400',
    },
    {
      id: 6,
      title: 'Outdoor Activities',
      description: 'Spacious playground, green gardens, open play areas, and outdoor learning spaces.',
      icon: Flower,
      color: 'from-green-400 to-teal-400',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              Our Facilities
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              World-class infrastructure designed for safe, engaging, and joyful learning
            </p>
          </div>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility) => {
              const Icon = facility.icon;
              return (
                <div
                  key={facility.id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100/50 hover:scale-105 cursor-pointer"
                >
                  {/* Gradient Top */}
                  <div className={`h-2 bg-gradient-to-r ${facility.color}`}></div>

                  {/* Card Content */}
                  <div className="p-8">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${facility.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{facility.title}</h3>

                    {/* Description */}
                    <p className="text-gray-700 leading-relaxed">{facility.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="py-16 px-4 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-12 shadow-lg border border-teal-100/50">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Why Choose Our Facilities?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'Regular maintenance and cleanliness',
                'Age-appropriate equipment and materials',
                'Well-trained and certified staff',
                'Regular safety inspections',
                'Healthy and nutritious meals',
                'Inclusive facilities for all children',
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">✓</span>
                  </div>
                  <p className="text-gray-700 font-medium">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-12">
          <h2 className="text-4xl font-bold text-white mb-4">Experience Our Campus</h2>
          <p className="text-white/90 text-lg mb-8">
            Visit us to see our wonderful facilities and meet our dedicated team
          </p>
          <button
            className="bg-white text-orange-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-xl transition-all duration-300 text-lg"
            onClick={() => window.location.href = '/admissions'}
          >
            Schedule Your Visit
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
