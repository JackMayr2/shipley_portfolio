'use client';

import { ProjectSubsection } from '@/types';

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

  // Create diagonal divider layout based on number of subsections
  const getGridClass = () => {
    if (sortedSubsections.length === 2) {
      return 'grid-cols-2';
    }
    return 'grid-cols-3';
  };

  // Get clip-path for diagonal sections
  const getClipPath = (index: number, total: number) => {
    if (total === 2) {
      return index === 0 
        ? 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)'
        : 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)';
    } else if (total === 3) {
      if (index === 0) {
        return 'polygon(0% 0%, 33.33% 0%, 33.33% 100%, 0% 100%)';
      } else if (index === 1) {
        return 'polygon(33.33% 0%, 66.66% 0%, 66.66% 100%, 33.33% 100%)';
      } else {
        return 'polygon(66.66% 0%, 100% 0%, 100% 100%, 66.66% 100%)';
      }
    }
    return 'none';
  };

  return (
    <div className="max-w-6xl mx-auto mb-12">
      <div className="relative h-32 md:h-48 bg-gray-100 rounded-lg overflow-hidden">
        {/* Diagonal divider lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" preserveAspectRatio="none">
          {sortedSubsections.length === 2 && (
            <line
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
              stroke="#9ca3af"
              strokeWidth="2"
            />
          )}
          {sortedSubsections.length === 3 && (
            <>
              <line
                x1="33.33%"
                y1="0%"
                x2="33.33%"
                y2="100%"
                stroke="#9ca3af"
                strokeWidth="2"
              />
              <line
                x1="66.66%"
                y1="0%"
                x2="66.66%"
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
                  className="w-full h-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center group relative z-10"
                >
                  <span className="text-xl md:text-2xl font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                    {subsection.title}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

