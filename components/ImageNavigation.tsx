'use client';

import { ProjectSubsection } from '@/types';
import Image from 'next/image';

interface ImageNavigationProps {
  projectId: string;
  subsections: ProjectSubsection[];
}

export default function ImageNavigation({ projectId, subsections }: ImageNavigationProps) {
  const handleClick = (subsectionId: string) => {
    const element = document.getElementById(`subsection-${projectId}-${subsectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Sort by order
  const sortedSubsections = [...subsections].sort((a, b) => (a.order || 0) - (b.order || 0));

  if (sortedSubsections.length === 0) {
    return null;
  }

  // Get clip-path for diagonal sections
  const getClipPath = (index: number, total: number) => {
    if (total === 2) {
      // Diagonal split: left section goes from top-left to middle-right
      if (index === 0) {
        return 'polygon(0% 0%, 100% 0%, 50% 100%, 0% 100%)';
      } else {
        return 'polygon(100% 0%, 100% 100%, 50% 100%, 0% 0%)';
      }
    } else if (total === 3) {
      // Three sections with diagonal dividers
      if (index === 0) {
        return 'polygon(0% 0%, 66.66% 0%, 33.33% 100%, 0% 100%)';
      } else if (index === 1) {
        return 'polygon(66.66% 0%, 100% 0%, 100% 100%, 33.33% 100%)';
      } else {
        return 'polygon(33.33% 100%, 100% 100%, 100% 0%, 66.66% 0%)';
      }
    }
    return 'none';
  };

  return (
    <div className="max-w-6xl mx-auto mb-12">
      <div className="relative h-48 md:h-64 bg-gray-100 rounded-lg overflow-hidden">
        {/* Diagonal divider lines using SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" preserveAspectRatio="none">
          {sortedSubsections.length === 2 && (
            <line
              x1="50%"
              y1="0%"
              x2="0%"
              y2="100%"
              stroke="#9ca3af"
              strokeWidth="2"
            />
          )}
          {sortedSubsections.length === 3 && (
            <>
              <line
                x1="33.33%"
                y1="100%"
                x2="66.66%"
                y2="0%"
                stroke="#9ca3af"
                strokeWidth="2"
              />
              <line
                x1="66.66%"
                y1="0%"
                x2="100%"
                y2="100%"
                stroke="#9ca3af"
                strokeWidth="2"
              />
            </>
          )}
        </svg>
        <div className="absolute inset-0 flex">
          {sortedSubsections.map((subsection, index) => {
            return (
              <div
                key={subsection.id}
                className="relative flex-1"
                style={{ clipPath: getClipPath(index, sortedSubsections.length) }}
              >
                <button
                  onClick={() => handleClick(subsection.id)}
                  className="w-full h-full bg-gray-100 hover:opacity-90 transition-opacity duration-300 flex items-center justify-center group relative z-10 overflow-hidden"
                >
                  {subsection.navigationImageUrl ? (
                    <>
                      <Image
                        src={subsection.navigationImageUrl}
                        alt={subsection.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <span className="text-white text-xl md:text-2xl font-semibold drop-shadow-lg">
                          {subsection.title}
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-xl md:text-2xl font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                      {subsection.title}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
