'use client';

export default function Navigation() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => scrollToSection('bio')}
            className="text-xl font-bold text-white drop-shadow-lg hover:text-gray-200 transition-colors"
          >
            Portfolio
          </button>
          <div className="flex gap-6">
            <button
              onClick={() => scrollToSection('bio')}
              className="text-white drop-shadow-lg hover:text-gray-200 transition-colors"
            >
              About
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

