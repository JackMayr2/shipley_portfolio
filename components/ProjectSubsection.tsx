'use client';

import { ProjectSubsection as ProjectSubsectionType } from '@/types';
import Image from 'next/image';
import ImageCollage from './ImageCollage';

interface ProjectSubsectionProps {
  projectId: string;
  subsection: ProjectSubsectionType;
}

export default function ProjectSubsection({ projectId, subsection }: ProjectSubsectionProps) {
  return (
    <section
      id={`subsection-${projectId}-${subsection.id}`}
      className="relative w-full min-h-screen bg-white snap-start snap-center py-12 md:py-20"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Subsection Title */}
        <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 md:mb-12">
          {subsection.title}
        </h3>

        {/* Header Image */}
        {subsection.headerImageUrl && (
          <div className="relative w-full h-[30vh] md:h-[40vh] mb-12 rounded-lg overflow-hidden">
            <Image
              src={subsection.headerImageUrl}
              alt={subsection.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
        )}

        {/* Image Collage */}
        {subsection.images && subsection.images.length > 0 && (
          <ImageCollage images={subsection.images} />
        )}
      </div>
    </section>
  );
}

