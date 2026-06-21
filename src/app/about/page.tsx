'use client';

import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Heart, Shield, Lightbulb, Sprout, HandshakeIcon } from 'lucide-react';

export default function AboutPage() {
  const coreValues = [
    {
      id: 1,
      title: 'Love & Care',
      description: 'We provide a nurturing environment where every child feels loved and valued.',
      icon: Heart,
      color: 'from-red-400 to-rose-400',
    },
    {
      id: 2,
      title: 'Safety First',
      description: 'Child safety is our top priority with secure campus and trained staff.',
      icon: Shield,
      color: 'from-blue-400 to-cyan-400',
    },
    {
      id: 3,
      title: 'Activity-Based Learning',
      description: 'Learning through play and hands-on activities for better development.',
      icon: Lightbulb,
      color: 'from-yellow-400 to-amber-400',
    },
    {
      id: 4,
      title: 'Holistic Growth',
      description: 'We focus on physical, emotional, social, and cognitive development.',
      icon: Sprout,
      color: 'from-green-400 to-teal-400',
    },
    {
      id: 5,
      title: 'Parent Partnership',
      description: 'Strong collaboration with parents for consistent child development.',
      icon: HandshakeIcon,
      color: 'from-purple-400 to-pink-400',
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
              About Gokul Buds
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nurturing young minds with love, care, and quality education since our establishment in Tirupati
            </p>
          </div>
        </div>
      </section>

      {/* School Story */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-12 shadow-sm border border-amber-100/50">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Gokul Buds Preschool stands as a beacon of quality early childhood education in Tirupati, Andhra Pradesh.
              We are committed to providing a premier preschool experience where young children can flourish academically,
              socially, and emotionally. Our school is built on the foundation of creating a warm, inclusive, and stimulating
              environment that respects each child's unique developmental journey.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              With a team of dedicated educators and modern facilities, we ensure that every child receives personalized
              attention and guidance. Our curriculum is designed to foster curiosity, creativity, and critical thinking,
              preparing children for a bright future ahead.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 px-4 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Vision & Mission</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Vision Card */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-teal-100/50 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To be the most trusted preschool in Tirupati, known for developing confident, creative, and compassionate
                young learners who are prepared to succeed in an ever-changing world.
              </p>
            </div>

            {/* Mission Card */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100/50 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a2 2 0 002-2V5h8v2a2 2 0 002 2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To provide an engaging, nurturing, and safe learning environment that fosters holistic development through
                activity-based learning, strong values, and meaningful partnerships with families.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Principal Message */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-800 mb-3">Message from the Principal</h2>
            <p className="text-lg text-gray-500">Leading young minds towards a brighter future</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-gray-100/50 overflow-hidden">
            <div className="flex flex-col md:flex-row gap-0">
              {/* Photo Column */}
              <div className="md:w-2/5 bg-gradient-to-br from-amber-50 to-orange-50 p-8 md:p-10 flex flex-col items-center justify-center">
                <div className="relative">
                  <img
                    src="/images/principal/Navya.jpeg"
                    alt="Principal of Gokul Buds Preschool"
                    className="w-64 h-72 object-cover rounded-2xl shadow-xl"
                    loading="lazy"
                  />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full px-5 py-2 shadow-lg border border-amber-100">
                    <span className="text-amber-600 text-xl">✦</span>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <h3 className="text-xl font-bold text-gray-800">Mrs. Navya</h3>
                  <p className="text-sm text-amber-600 font-semibold mt-1">Principal</p>
                  <p className="text-sm text-gray-500">Gokul Buds Preschool</p>
                </div>
              </div>

              {/* Message Column */}
              <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                <div className="mb-6">
                  <svg className="w-10 h-10 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-gray-700 leading-relaxed mb-5 text-lg">
                  At Gokul Buds Preschool, we believe that every child is unique and deserves an education that
                  celebrates their individuality. Our mission is to create a space where children can explore,
                  discover, and grow at their own pace, supported by a team of caring professionals and loving families.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  We are committed to building a foundation of confidence, curiosity, and compassion that will
                  serve our children throughout their lives. Thank you for choosing Gokul Buds as part of your
                  child's educational journey.
                </p>
                <div className="mt-2">
                  <p className="text-amber-600 font-bold text-lg">— Mrs. Navya</p>
                  <p className="text-gray-400 text-sm">Principal, Gokul Buds Preschool</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.id}
                  className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100/50 hover:scale-105"
                >
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
