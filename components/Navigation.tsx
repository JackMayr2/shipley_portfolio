'use client';

export default function Navigation() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => scrollToSection('bio')}
            className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
          >
            Portfolio
          </button>
          <div className="flex gap-6">
            <button
              onClick={() => scrollToSection('bio')}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('projects')}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Projects
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

