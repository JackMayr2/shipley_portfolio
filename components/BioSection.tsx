'use client';

import { useState, useEffect, useRef } from 'react';
import { ProfileData } from '@/types';
import ImageCarousel from './ImageCarousel';
import BioPrimaryContainers from './BioPrimaryContainers';

interface BioSectionProps {
  profile: ProfileData | null;
}

export default function BioSection({ profile }: BioSectionProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!carouselRef.current || !bioRef.current) return;

      const carouselRect = carouselRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Start fading when carousel bottom reaches middle of viewport
      // Complete fade when carousel is fully scrolled past
      const carouselBottom = carouselRect.bottom;
      const fadeStartPoint = viewportHeight * 0.5; // Middle of viewport
      const fadeEndPoint = 0; // When carousel top reaches top of viewport
      
      // Calculate progress: 0 when carousel bottom is at fadeStartPoint, 1 when at fadeEndPoint
      let progress = 0;
      if (carouselBottom <= fadeStartPoint) {
        if (carouselBottom <= fadeEndPoint) {
          progress = 1;
        } else {
          // Linear interpolation between fadeStartPoint and fadeEndPoint
          progress = 1 - (carouselBottom - fadeEndPoint) / (fadeStartPoint - fadeEndPoint);
        }
      }
      
      setScrollProgress(Math.min(1, Math.max(0, progress)));
    };

    // Use requestAnimationFrame for smoother performance
    let ticking = false;
    const optimizedScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', optimizedScroll);
  }, []);

  if (!profile) {
    return (
      <section id="bio" className="relative w-full h-screen bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </section>
    );
  }

  const carouselOpacity = 1 - scrollProgress;
  const bioOpacity = scrollProgress;

  return (
    <>
      {/* Full-screen Image Carousel with fade effect */}
      {profile.profileImages && profile.profileImages.length > 0 ? (
        <section 
          id="bio-carousel" 
          ref={carouselRef}
          className="relative w-full h-screen"
          style={{ opacity: carouselOpacity, transition: 'opacity 0.3s ease-out' }}
        >
          <ImageCarousel images={profile.profileImages} interval={5000} />
        </section>
      ) : (
        <section 
          id="bio-carousel" 
          ref={carouselRef}
          className="relative w-full h-screen bg-gray-200 flex items-center justify-center"
          style={{ opacity: carouselOpacity, transition: 'opacity 0.3s ease-out' }}
        >
          <p className="text-gray-400">No images available</p>
        </section>
      )}

      {/* Bio Section with fade-in effect */}
      <section 
        ref={bioRef}
        id="bio" 
        className="relative w-full min-h-screen bg-white"
        style={{ opacity: bioOpacity, transition: 'opacity 0.3s ease-out' }}
      >
        {/* Bio Primary Containers */}
        {profile.bioContainers && profile.bioContainers.length > 0 && (
          <div className="pt-20 pb-12">
            <BioPrimaryContainers containers={profile.bioContainers} />
          </div>
        )}

        {/* Bio Text */}
        {(profile.bio || profile.location) && (
          <div className="px-6 py-12 md:py-20">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none text-center">
                {profile.bio && (
                  <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                    {profile.bio}
                  </p>
                )}
                {profile.location && (
                  <p className="text-gray-500 mt-4">{profile.location}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

