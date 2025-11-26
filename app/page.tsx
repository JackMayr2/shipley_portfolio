'use client';

import { useEffect, useState } from 'react';
import { getProfile, getDesigns } from '@/lib/firestore';
import { ProfileData, Design } from '@/types';
import Navigation from '@/components/Navigation';
import BioSection from '@/components/BioSection';
import ProjectSection from '@/components/ProjectSection';
import SocialLinks from '@/components/SocialLinks';

export default function Home() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileData, designsData] = await Promise.all([
          getProfile(),
          getDesigns(),
        ]);
        setProfile(profileData);
        setDesigns(designsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <BioSection profile={profile} />
      <ProjectSection designs={designs} />
      <SocialLinks socialLinks={profile?.socialLinks} />
    </main>
  );
}
