'use client';

import { useState } from 'react';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function AdmissionsPage() {
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    phone: '',
    childName: '',
    childAge: '',
    program: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { number: '1', title: 'Submit Inquiry', description: 'Fill out the inquiry form with your details' },
    { number: '2', title: 'Campus Visit', description: 'Schedule a visit to explore our facilities' },
    { number: '3', title: 'Application', description: 'Complete the admission application form' },
    { number: '4', title: 'Enrollment', description: 'Finalize enrollment and join Gokul Buds' },
  ];

  const documents = [
    'Birth Certificate',
    'Passport-sized photographs (4)',
    'Parent/Guardian ID proof',
    'Address proof',
    'Health certificate',
    'Vaccination records',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    const supabase = createClient();
    
    const payload = {
      parent_name: formData.parentName,
      email: formData.email,
      phone: formData.phone,
      child_name: formData.childName,
      child_age: formData.childAge,
      program: formData.program,
      message: formData.message || null,
    };

    console.log('[Admissions] Submitting inquiry:', payload);

    const { data, error } = await supabase.from('admission_inquiries').insert(payload).select();

    if (error) {
      console.error('[Admissions] Insert error:', error.message, '| code:', error.code);
      setSubmitError(error.message);
      setIsSubmitting(false);
      return;
    }

    console.log('[Admissions] Insert success:', data);
    setSubmitted(true);
    setFormData({
      parentName: '',
      email: '',
      phone: '',
      childName: '',
      childAge: '',
      program: '',
      message: '',
    });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              Admissions
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our learning community and give your child the best start in life
            </p>
          </div>
        </div>
      </section>

      {/* Admission Steps */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Admission Process</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50 text-center hover:shadow-xl transition-all duration-300 h-full">
                  <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 text-amber-500">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content - Two Columns */}
      <section className="py-16 px-4 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100/50">
              {!submitted ? (
                <>
                  <h2 className="text-3xl font-bold text-gray-800 mb-8">Inquiry Form</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Parent Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Parent/Guardian Name *</label>
                      <input
                        type="text"
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="Enter your name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="Enter your email"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    {/* Child Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Child&apos;s Name *</label>
                      <input
                        type="text"
                        name="childName"
                        value={formData.childName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="Enter child's name"
                      />
                    </div>

                    {/* Child Age */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Child&apos;s Age *</label>
                      <input
                        type="number"
                        name="childAge"
                        value={formData.childAge}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="Enter age in years"
                      />
                    </div>

                    {/* Program */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Select Program *</label>
                      <select
                        name="program"
                        value={formData.program}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none transition-colors bg-white"
                      >
                        <option value="">Choose a program</option>
                        <option value="daycare">Day Care (1.5-3 years)</option>
                        <option value="nursery">Nursery (3 years)</option>
                        <option value="lkg">LKG (4 years)</option>
                        <option value="ukg">UKG (5 years)</option>
                        <option value="grade1-5">Grade 1-5 (6-10 years)</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Message</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none transition-colors resize-none h-32"
                        placeholder="Any questions or special requirements"
                      />
                    </div>

                    {/* Error */}
                    {submitError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-700">{submitError}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white font-bold py-3"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                  <p className="text-gray-600 mb-6">
                    Your inquiry has been submitted successfully. We&apos;ll get back to you shortly.
                  </p>
                  <p className="text-amber-600 font-semibold">Expected Response: Within 24 hours</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Contact & Documents */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100/50">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <Phone className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a href="tel:+917330907774" className="text-gray-800 font-semibold hover:text-amber-600 block">
                      +91 73309 07774
                    </a>
                    <a href="tel:+917330937775" className="text-gray-800 font-semibold hover:text-amber-600 block">
                      +91 73309 37775
                    </a>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <Mail className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a href="mailto:admissions@gokulbuds.com" className="text-gray-800 font-semibold hover:text-amber-600">
                      admissions@gokulbuds.com
                    </a>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <MapPin className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-gray-800 font-semibold"># 12-72 Kshathriya Nagar, Avilala</p>
                    <p className="text-gray-600 text-sm">Tirupati - 517507, AP</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Required */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100/50">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Documents Required</h3>
              <ul className="space-y-3">
                {documents.map((doc, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
