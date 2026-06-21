'use client';

import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Shield,
  Users,
  Lightbulb,
  Heart,
  BookOpen,
  Palette,
  Music,
  Zap,
  Star,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen pt-24 pb-16 flex items-center justify-center overflow-hidden"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 opacity-100"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 pointer-events-none"></div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          {/* Badge */}
          <div className="inline-block mb-6 px-4 py-2 bg-amber-100/60 rounded-full border border-amber-200/50 backdrop-blur-sm">
            <span className="text-sm font-semibold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
              Welcome to Excellence in Early Education
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
              Gokul Buds
            </span>
            <br />
            <span className="text-gray-900">Preschool</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl text-gray-700 mb-8 leading-relaxed max-w-2xl mx-auto font-light">
            Nurturing Young Minds with <span className="font-semibold text-amber-600">Love & Care</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              onClick={() => window.location.href = '/admissions'}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Admissions Now Open
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => window.location.href = '/contact'}
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg rounded-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              Get in Touch
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
            <div className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-amber-100/30">
              <p className="text-3xl font-bold text-amber-600">50+</p>
              <p className="text-sm text-gray-600 mt-1">Happy Students</p>
            </div>
            <div className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-amber-100/30">
              <p className="text-3xl font-bold text-orange-600">10+</p>
              <p className="text-sm text-gray-600 mt-1">Expert Teachers</p>
            </div>
            <div className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-amber-100/30">
              <p className="text-3xl font-bold text-rose-600">5+</p>
              <p className="text-sm text-gray-600 mt-1">Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">About Gokul Buds</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mb-8"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl p-8 h-64 flex items-center justify-center">
              <p className="text-6xl text-center">🌱</p>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                Gokul Buds Preschool is a premier educational institution in Tirupati dedicated to providing the highest quality early childhood education. We believe in nurturing every child's potential through a blend of traditional values and modern educational practices.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our experienced team of educators focuses on creating a warm, safe, and stimulating environment where children can learn, play, and grow. We emphasize holistic development, combining academics with activities that foster creativity, emotional intelligence, and social skills.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-gray-700">State-of-the-art facilities with safety as our top priority</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700">Trained and certified educators with years of experience</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                  <span className="text-gray-700">Activity-based learning approach aligned with modern pedagogy</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-us" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Why Choose Gokul Buds?</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mb-8"></div>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We are committed to providing the best environment for your child's growth and development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Safe Environment Card */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-50/30">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 text-white">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Safe Environment</h3>
              <p className="text-gray-600">
                CCTV surveillance, trained staff, and safety protocols ensure your child is always protected.
              </p>
            </Card>

            {/* Experienced Teachers Card */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-50/30">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center mb-6 text-white">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Experienced Teachers</h3>
              <p className="text-gray-600">
                Our certified educators bring passion and expertise to create engaging learning experiences.
              </p>
            </Card>

            {/* Activity-Based Learning Card */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl bg-gradient-to-br from-green-50 to-green-50/30">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center mb-6 text-white">
                <Lightbulb className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Activity-Based Learning</h3>
              <p className="text-gray-600">
                Hands-on activities and play-based learning help children develop critical thinking skills.
              </p>
            </Card>

            {/* Holistic Development Card */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-50/30">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-500 rounded-2xl flex items-center justify-center mb-6 text-white">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Holistic Development</h3>
              <p className="text-gray-600">
                We nurture academic, social, emotional, and physical development equally.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Our Programs</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mb-8"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: 'Day Care', icon: '🌅', desc: 'For infants 3+ months' },
              { name: 'Nursery', icon: '🎨', desc: 'Age 1-2 years' },
              { name: 'LKG', icon: '📚', desc: 'Lower KG' },
              { name: 'UKG', icon: '✏️', desc: 'Upper KG' },
              { name: 'Grade 1-5', icon: '🎓', desc: 'Primary education' },
            ].map((program, index) => (
              <Card
                key={index}
                className="p-6 border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 text-center group cursor-pointer transform hover:-translate-y-2"
              >
                <p className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {program.icon}
                </p>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{program.name}</h3>
                <p className="text-sm text-gray-600">{program.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Our Facilities</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mb-8"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: 'Smart Classrooms', icon: <Zap className="w-8 h-8" />, desc: 'Interactive learning spaces with modern technology' },
              { name: 'Safe Campus', icon: <Shield className="w-8 h-8" />, desc: 'Secure, child-friendly environment with CCTV monitoring' },
              { name: 'Activity Areas', icon: <Palette className="w-8 h-8" />, desc: 'Dedicated spaces for art, music, and creative play' },
              { name: 'Indoor/Outdoor Play', icon: <Music className="w-8 h-8" />, desc: 'Spacious grounds for physical activities and sports' },
            ].map((facility, index) => (
              <Card
                key={index}
                className="p-8 border-0 shadow-md hover:shadow-xl transition-shadow duration-300 rounded-2xl bg-white"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center text-amber-600 flex-shrink-0">
                    {facility.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{facility.name}</h3>
                    <p className="text-gray-600">{facility.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Admissions Section */}
      <section id="admissions" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Admissions Now Open!</h2>
          <p className="text-lg sm:text-xl mb-8 text-white/90">
            Limited seats available for the upcoming academic year. Join our growing community of young learners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/admissions">
              <Button
                size="lg"
                className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full font-semibold"
              >
                Apply Now
              </Button>
            </a>
            <Button
              onClick={() => window.location.href = '/contact'}
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white/20 hover:text-white px-8 py-6 text-lg rounded-full"
            >
              Schedule a Tour
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Parent Testimonials</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mb-8"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Mrs. Priya Sharma',
                role: 'Parent of Arjun (UKG)',
                text: 'Gokul Buds has been wonderful for Arjun\'s development. The teachers are caring and professional, and we can see the positive changes in his confidence and social skills.',
                rating: 5,
              },
              {
                name: 'Mr. Rajesh Kumar',
                role: 'Parent of Anaya (Nursery)',
                text: 'The facilities are excellent and the safety measures give us peace of mind. Anaya loves coming to school every day!',
                rating: 5,
              },
              {
                name: 'Mrs. Neelam Patel',
                role: 'Parent of Vihaan (LKG)',
                text: 'We are impressed with the holistic approach to education. Vihaan\'s curiosity and love for learning have grown tremendously.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="p-8 border-0 shadow-md hover:shadow-xl transition-shadow duration-300 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/30"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array(testimonial.rating)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-amber-400 text-amber-400"
                      />
                    ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Get in Touch</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mb-8"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Reach out to us
              </h3>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center text-white flex-shrink-0 mt-1">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Location</h4>
                  <p className="text-gray-600">
                    # 12-72 Kshathriya Nagar, Avilala
                    <br />
                    Tirupati - 517507, AP
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center text-white flex-shrink-0 mt-1">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Phone</h4>
                  <a
                    href="tel:+917330907774"
                    className="text-amber-600 hover:text-amber-700 transition-colors block"
                  >
                    +91 73309 07774
                  </a>
                  <a
                    href="tel:+917330937775"
                    className="text-amber-600 hover:text-amber-700 transition-colors block"
                  >
                    +91 73309 37775
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center text-white flex-shrink-0 mt-1">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Email</h4>
                  <a
                    href="mailto:info@gokulbuds.com"
                    className="text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    info@gokulbuds.com
                  </a>
                </div>
              </div>
            </div>

            {/* Google Map */}
            <div className="rounded-2xl overflow-hidden shadow-lg h-80 bg-gray-200">
              <iframe
                title="Gokul Buds Preschool Location"
                src="https://www.google.com/maps?q=13.6105168,79.4299906&z=16&hl=en&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
