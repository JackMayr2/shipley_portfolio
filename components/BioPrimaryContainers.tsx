'use client';

import { useRouter } from 'next/navigation';
import { Project } from '@/types';
import { generateSlug } from '@/lib/utils';
import Image from 'next/image';

interface BioPrimaryContainersProps {
  projects: Project[];
}

export default function BioPrimaryContainers({ projects }: BioPrimaryContainersProps) {
  const router = useRouter();

  if (!projects || projects.length === 0) {
    return null;
  }

  const handleClick = (project: Project) => {
    const slug = project.slug || generateSlug(project.title);
    router.push(`/project/${slug}`);
  };

  // Sort by order if provided
  const sortedProjects = [...projects].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-6 md:px-12">
      {sortedProjects.slice(0, 3).map((project) => (
        <div
          key={project.id}
          onClick={() => handleClick(project)}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:opacity-90"
        >
          <Image
            src={project.imageUrl}
            alt={project.title || 'Project'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {(project.title || project.description) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-6">
              {project.title && (
                <h3 className="text-white text-lg md:text-xl font-semibold mb-1">
                  {project.title}
                </h3>
              )}
              {project.description && (
                <p className="text-white/90 text-sm md:text-base">
                  {project.description}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

