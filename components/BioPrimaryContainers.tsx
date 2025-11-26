'use client';

import { BioContainer } from '@/types';
import Image from 'next/image';

interface BioPrimaryContainersProps {
  containers: BioContainer[];
}

export default function BioPrimaryContainers({ containers }: BioPrimaryContainersProps) {
  if (!containers || containers.length === 0) {
    return null;
  }

  const handleClick = (container: BioContainer) => {
    if (!container.linkUrl) return;

    if (container.linkType === 'section') {
      const element = document.getElementById(container.linkUrl);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (container.linkType === 'url') {
      window.open(container.linkUrl, '_blank', 'noopener,noreferrer');
    } else if (container.linkType === 'modal') {
      // Modal functionality can be added later if needed
      console.log('Modal not implemented yet');
    }
  };

  // Sort by order if provided
  const sortedContainers = [...containers].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-6 md:px-12">
      {sortedContainers.slice(0, 3).map((container) => (
        <div
          key={container.id}
          onClick={() => handleClick(container)}
          className={`relative aspect-[4/3] w-full overflow-hidden rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
            container.linkUrl ? 'hover:opacity-90' : ''
          }`}
        >
          <Image
            src={container.imageUrl}
            alt={container.title || 'Bio container'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {(container.title || container.description) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-6">
              {container.title && (
                <h3 className="text-white text-lg md:text-xl font-semibold mb-1">
                  {container.title}
                </h3>
              )}
              {container.description && (
                <p className="text-white/90 text-sm md:text-base">
                  {container.description}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

