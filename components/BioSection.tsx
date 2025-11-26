'use client';

import { ProfileData } from '@/types';
import ImageCarousel from './ImageCarousel';

interface BioSectionProps {
  profile: ProfileData | null;
}

export default function BioSection({ profile }: BioSectionProps) {
  if (!profile) {
    return (
      <section id="bio" className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl w-full text-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="bio" className="min-h-screen flex items-center justify-center px-6 pt-24 pb-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl w-full">
        {/* Name and Title - Above */}
        <div className="text-center mb-8">
          {profile.name && (
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">
              {profile.name}
            </h1>
          )}
          {profile.title && (
            <h2 className="text-2xl md:text-3xl text-gray-600 font-light">
              {profile.title}
            </h2>
          )}
        </div>

        {/* Image Carousel - Middle */}
        {profile.profileImages && profile.profileImages.length > 0 && (
          <div className="mb-12">
            <ImageCarousel images={profile.profileImages} interval={5000} />
          </div>
        )}

        {/* Bio - Below */}
        <div className="prose prose-lg max-w-none text-center">
          {profile.bio && (
            <p className="text-gray-700 leading-relaxed text-lg">
              {profile.bio}
            </p>
          )}
          {profile.location && (
            <p className="text-gray-500 mt-4">{profile.location}</p>
          )}
        </div>
      </div>
    </section>
  );
}

