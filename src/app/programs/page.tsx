'use client';

import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProgramsPage() {
  const programs = [
    {
      id: 1,
      name: 'Day Care',
      ageRange: '1.5 - 3 years',
      description: 'Foundation for early development with care and basic activities.',
      features: [
        'Safe and secure environment',
        'Trained caregivers',
        'Age-appropriate activities',
        'Nutritious meals',
        'Parent communication',
      ],
      color: 'from-rose-400 to-red-400',
      lightColor: 'from-rose-50 to-red-50',
    },
    {
      id: 2,
      name: 'Nursery',
      ageRange: '3 years',
      description: 'Introduction to structured learning with play-based activities.',
      features: [
        'Curriculum-based learning',
        'Creative play',
        'Social interaction',
        'Language development',
        'Fine motor skills',
      ],
      color: 'from-orange-400 to-amber-400',
      lightColor: 'from-orange-50 to-amber-50',
    },
    {
      id: 3,
      name: 'Lower Kindergarten (LKG)',
      ageRange: '4 years',
      description: 'Pre-academic skills development with focus on foundational concepts.',
      features: [
        'Alphabet and number basics',
        'Reading readiness',
        'Writing practice',
        'STEM introduction',
        'Cooperative play',
      ],
      color: 'from-amber-400 to-yellow-400',
      lightColor: 'from-amber-50 to-yellow-50',
    },
    {
      id: 4,
      name: 'Upper Kindergarten (UKG)',
      ageRange: '5 years',
      description: 'Advanced learning skills with emphasis on academic and social readiness.',
      features: [
        'Reading and phonics',
        'Mathematics fundamentals',
        'Science exploration',
        'Art and music',
        'School preparation',
      ],
      color: 'from-teal-400 to-cyan-400',
      lightColor: 'from-teal-50 to-cyan-50',
    },
    {
      id: 5,
      name: 'Grade 1-5',
      ageRange: '6 - 10 years',
      description: 'Comprehensive primary education with structured academics and holistic development.',
      features: [
        'Core academics (Math, English, Science)',
        'Language proficiency',
        'Critical thinking',
        'Extracurricular activities',
        'Life skills',
      ],
      color: 'from-purple-400 to-pink-400',
      lightColor: 'from-purple-50 to-pink-50',
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
              Our Programs
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Carefully designed programs for every stage of early childhood development
            </p>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <div
                key={program.id}
                className={`group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100/50 hover:scale-105 ${
                  programs.length % 2 === 1 && index === programs.length - 1 ? 'lg:col-span-2 lg:w-1/2 lg:mx-auto' : ''
                }`}
              >
                {/* Gradient Header */}
                <div className={`h-24 bg-gradient-to-r ${program.color}`}></div>

                {/* Card Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{program.name}</h3>
                  <p className={`text-sm font-semibold bg-gradient-to-r ${program.color} bg-clip-text text-transparent mb-3`}>
                    Ages: {program.ageRange}
                  </p>
                  <p className="text-gray-700 mb-6 leading-relaxed">{program.description}</p>

                  {/* Features List */}
                  <div className="space-y-3 mb-6">
                    {program.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Link href="/admissions" className="block w-full">
                    <Button className={`w-full bg-gradient-to-r ${program.color} hover:opacity-90 text-white font-semibold`}>
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Join Gokul Buds?</h2>
          <p className="text-xl text-white/90 mb-8">
            Find the perfect program for your child and start their educational journey with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admissions">
              <Button className="bg-white text-orange-600 hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-full">
                Schedule a Campus Visit
              </Button>
            </Link>
            <Button
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white/20 font-bold text-lg px-8 py-6 rounded-full"
              onClick={() => alert('Brochure coming soon. Please contact us at admissions@gokulbuds.com for details.')}
            >
              Download Brochure
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
