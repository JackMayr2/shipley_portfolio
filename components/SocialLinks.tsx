'use client';

import { ProfileData } from '@/types';

interface SocialLinksProps {
  profile: ProfileData | null;
}

export default function SocialLinks({ profile }: SocialLinksProps) {
  if (!profile) {
    return null;
  }

  const hasContent = 
    profile.socialLinks?.linkedin ||
    profile.location ||
    profile.location2 ||
    profile.email ||
    profile.phone;

  if (!hasContent) {
    return null;
  }

  return (
    <footer className="relative w-full min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 snap-start snap-center flex items-center justify-center">
      {/* Blurred background overlay similar to header */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
      
      <div className="relative z-10 max-w-4xl mx-auto w-full px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
          {/* LinkedIn */}
          {profile.socialLinks?.linkedin && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Connect</h3>
              <a
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 hover:text-blue-600 transition-colors duration-200 underline decoration-2 underline-offset-4 hover:decoration-blue-600"
              >
                LinkedIn
              </a>
            </div>
          )}

          {/* Location */}
          {(profile.location || profile.location2) && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Location</h3>
              <div className="space-y-1">
                {profile.location && (
                  <p className="text-gray-900">{profile.location}</p>
                )}
                {profile.location2 && (
                  <p className="text-gray-900">{profile.location2}</p>
                )}
              </div>
            </div>
          )}

          {/* Contact Info */}
          {(profile.email || profile.phone) && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Contact</h3>
              <div className="space-y-1">
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-gray-900 hover:text-blue-600 transition-colors duration-200 block"
                  >
                    {profile.email}
                  </a>
                )}
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="text-gray-900 hover:text-blue-600 transition-colors duration-200 block"
                  >
                    {profile.phone}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

