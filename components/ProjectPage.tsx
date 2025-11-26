'use client';

import { Project } from '@/types';
import Image from 'next/image';
import ImageNavigation from './ImageNavigation';
import ProjectSubsection from './ProjectSubsection';

interface ProjectPageProps {
  project: Project;
}

export default function ProjectPage({ project }: ProjectPageProps) {
  return (
    <section
      id={`project-${project.id}`}
      className="relative w-full min-h-screen bg-white snap-start"
    >
      {/* Header Graphic */}
      {project.headerGraphicUrl && (
        <div className="relative w-full h-[40vh] md:h-[50vh]">
          <Image
            src={project.headerGraphicUrl}
            alt={project.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      )}

      {/* Project Title */}
      <div className="px-6 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
            {project.title}
          </h2>
          {project.description && (
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
              {project.description}
            </p>
          )}
        </div>
      </div>

      {/* Image Navigation */}
      {project.subsections && project.subsections.length > 0 && (
        <div className="px-6 pb-8">
          <ImageNavigation projectId={project.id} subsections={project.subsections} />
        </div>
      )}

      {/* Project Subsections */}
      {project.subsections && project.subsections.map((subsection) => (
        <ProjectSubsection
          key={subsection.id}
          projectId={project.id}
          subsection={subsection}
        />
      ))}
    </section>
  );
}

