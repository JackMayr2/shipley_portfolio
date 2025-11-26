'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProjectBySlug } from '@/lib/firestore';
import { Project } from '@/types';
import Navigation from '@/components/Navigation';
import ProjectPage from '@/components/ProjectPage';

export default function ProjectRoute() {
  const params = useParams();
  const slug = params.slug as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      try {
        // Decode the slug in case it's URL encoded
        let decodedSlug = slug;
        try {
          decodedSlug = decodeURIComponent(slug);
        } catch (e) {
          // If decoding fails, use the original slug
          decodedSlug = slug;
        }
        
        const projectData = await getProjectBySlug(decodedSlug);
        if (projectData) {
          setProject(projectData);
        } else {
          console.error('Project not found for slug:', decodedSlug);
          setError(`Project not found for slug: ${decodedSlug}`);
        }
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    }
    
    if (slug) {
      loadProject();
    } else {
      setLoading(false);
      setError('No slug provided');
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The project you are looking for does not exist.'}</p>
          <a href="/" className="text-blue-600 hover:text-blue-800 underline">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <ProjectPage project={project} />
    </main>
  );
}

