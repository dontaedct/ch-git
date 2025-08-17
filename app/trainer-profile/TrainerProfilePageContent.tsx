'use client';

import { useState } from "react";
import { Trainer } from "@/lib/supabase/types";
import Link from 'next/link';

interface TrainerProfilePageContentProps {
  initialProfile: Partial<Trainer>;
}

export function TrainerProfilePageContent({ initialProfile }: TrainerProfilePageContentProps) {
  const [profile, setProfile] = useState<Partial<Trainer>>(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true);
    setMessage(null);

    try {
      const formDataObj = Object.fromEntries(formData.entries());
      const method = profile.id ? 'PUT' : 'POST';
      const url = profile.id ? `/api/trainer-profile` : '/api/trainer-profile';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObj),
      });
      
      const result = await response.json();
      if (result.ok) {
        setMessage({ type: 'success', text: 'Profile saved successfully!' });
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: result.error ?? 'Failed to save profile' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  const addSpecialty = () => {
    setProfile(prev => ({
      ...prev,
      specialties: [...(prev.specialties ?? []), '']
    }));
  };

  const removeSpecialty = (index: number) => {
    setProfile(prev => ({
      ...prev,
      specialties: prev.specialties?.filter((_, i) => i !== index) ?? []
    }));
  };

  const updateSpecialty = (index: number, value: string) => {
    setProfile(prev => ({
      ...prev,
      specialties: prev.specialties?.map((s, i) => i === index ? value : s) ?? []
    }));
  };

  const addCertification = () => {
    setProfile(prev => ({
      ...prev,
      certifications: [...(prev.certifications ?? []), '']
    }));
  };

  const removeCertification = (index: number) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) ?? []
    }));
  };

  const updateCertification = (index: number, value: string) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications?.map((c, i) => i === index ? value : c) ?? []
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-900">Trainer Profile</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/sessions" className="text-gray-600 hover:text-gray-900 transition-colors">
                Sessions
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-display font-bold text-gray-900 mb-4">
            {profile.id ? 'Edit Your Profile' : 'Complete Your Trainer Profile'}
          </h1>
          <p className="text-body text-gray-600 max-w-2xl mx-auto">
            Showcase your expertise and build trust with potential clients. A complete profile helps you stand out in the coaching community.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Form */}
        <div className="max-w-4xl mx-auto">
          <div className="card card-hover p-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <form action={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-headline font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Basic Information
                </h2>
                
                <div className="space-y-2">
                  <label htmlFor="business_name" className="text-sm font-medium text-gray-700">
                    Business Name *
                  </label>
                  <input
                    id="business_name"
                    name="business_name"
                    type="text"
                    value={profile.business_name ?? ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, business_name: e.target.value }))}
                    placeholder="Your Coaching Business Name"
                    className="input w-full focus-ring"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profile.bio ?? ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell potential clients about your coaching philosophy and approach..."
                    rows={4}
                    className="input w-full focus-ring"
                  />
                </div>
              </div>

              {/* Specialties */}
              <div className="space-y-6">
                <h2 className="text-headline font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Specialties *
                </h2>
                
                <div className="space-y-4">
                  {profile.specialties?.map((specialty, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        name={`specialty_${index}`}
                        type="text"
                        value={specialty}
                        onChange={(e) => updateSpecialty(index, e.target.value)}
                        placeholder="e.g., Weight Loss, Strength Training, Nutrition"
                        className="input flex-1 focus-ring"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecialty(index)}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                   
                  <button
                    type="button"
                    onClick={addSpecialty}
                    className="btn-ghost flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Specialty
                  </button>
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-6">
                <h2 className="text-headline font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Certifications
                </h2>
                
                <div className="space-y-4">
                  {profile.certifications?.map((cert, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        name={`certification_${index}`}
                        type="text"
                        value={cert}
                        onChange={(e) => updateCertification(index, e.target.value)}
                        placeholder="e.g., NASM Personal Trainer, Precision Nutrition Level 1"
                        className="input flex-1 focus-ring"
                      />
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                   
                  <button
                    type="button"
                    onClick={addCertification}
                    className="btn-ghost flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Certification
                  </button>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-6">
                <h2 className="text-headline font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Additional Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="years_experience" className="text-sm font-medium text-gray-700">
                      Years of Experience
                    </label>
                    <input
                      id="years_experience"
                      name="years_experience"
                      type="number"
                      value={profile.years_experience ?? ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, years_experience: parseInt(e.target.value) ?? null }))}
                      min="0"
                      max="50"
                      placeholder="5"
                      className="input w-full focus-ring"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="hourly_rate" className="text-sm font-medium text-gray-700">
                      Hourly Rate ($)
                    </label>
                    <input
                      id="hourly_rate"
                      name="hourly_rate"
                      type="number"
                      value={profile.hourly_rate ?? ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, hourly_rate: parseInt(e.target.value) ?? null }))}
                      min="0"
                      placeholder="75"
                      className="input w-full focus-ring"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    value={profile.website ?? ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                    className="input w-full focus-ring"
                  />
                </div>
              </div>

              {/* Hidden fields for form submission */}
              {profile.specialties?.map((specialty, index) => (
                <input key={index} type="hidden" name="specialties" value={specialty} />
              ))}
              {profile.certifications?.map((cert, index) => (
                <input key={index} type="hidden" name="certifications" value={cert} />
              ))}

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      {profile.id ? 'Update Profile' : 'Create Profile'}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
