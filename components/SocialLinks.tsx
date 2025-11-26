'use client';

import { SocialLinks as SocialLinksType } from '@/types';

interface SocialLinksProps {
  socialLinks?: SocialLinksType;
}

export default function SocialLinks({ socialLinks }: SocialLinksProps) {
  if (!socialLinks) {
    return null;
  }

  const links = [
    { key: 'linkedin', label: 'LinkedIn', url: socialLinks.linkedin },
    { key: 'instagram', label: 'Instagram', url: socialLinks.instagram },
    { key: 'twitter', label: 'Twitter', url: socialLinks.twitter },
    { key: 'behance', label: 'Behance', url: socialLinks.behance },
    { key: 'dribbble', label: 'Dribbble', url: socialLinks.dribbble },
    { key: 'website', label: 'Website', url: socialLinks.website },
  ].filter(link => link.url);

  if (links.length === 0) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-semibold mb-6 text-center">Connect</h3>
        <div className="flex flex-wrap justify-center gap-6">
          {links.map((link) => (
            <a
              key={link.key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200 underline decoration-2 underline-offset-4 hover:decoration-white"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

