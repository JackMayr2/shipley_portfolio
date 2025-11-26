'use client';

import { Design } from '@/types';
import Image from 'next/image';
import { useState } from 'react';

interface ProjectSectionProps {
  designs: Design[];
}

export default function ProjectSection({ designs }: ProjectSectionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Group designs by category
  const designsByCategory = designs.reduce((acc, design) => {
    const category = design.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(design);
    return acc;
  }, {} as Record<string, Design[]>);

  const categories = Object.keys(designsByCategory);

  if (designs.length === 0) {
    return (
      <section id="projects" className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-6xl w-full text-center">
          <h2 className="text-4xl font-bold mb-8 text-gray-900">Projects</h2>
          <p className="text-gray-500">No projects to display yet.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="projects" className="min-h-screen px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center text-gray-900">
            Projects
          </h2>
          
          {categories.map((category) => (
            <div key={category} className="mb-20">
              <h3 className="text-2xl font-semibold mb-8 text-gray-800 border-b-2 border-gray-200 pb-2">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {designsByCategory[category].map((design) => (
                  <div
                    key={design.id}
                    className="group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                    onClick={() => setSelectedImage(design.imageUrl)}
                  >
                    <div className="relative aspect-square w-full">
                      <Image
                        src={design.imageUrl}
                        alt={design.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-4 bg-white">
                      <h4 className="font-semibold text-gray-900 mb-1">{design.title}</h4>
                      {design.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{design.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <div className="relative max-w-7xl max-h-full">
            <Image
              src={selectedImage}
              alt="Full size"
              width={1200}
              height={1200}
              className="max-w-full max-h-[90vh] object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}

