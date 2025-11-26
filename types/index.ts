export interface Profile {
  id?: string;
  name: string;
  title: string;
  bio: string;
  email?: string;
  phone?: string;
  location?: string;
  location2?: string; // For "Open to Relocation" or second location
}

export interface Design {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  imageUrl: string;
  createdAt: Date;
  order?: number;
}

export interface SocialLinks {
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  behance?: string;
  dribbble?: string;
  website?: string;
}

export interface ProjectSubsection {
  id: string;
  title: string;
  headerImageUrl?: string;
  navigationImageUrl?: string; // Image for the navigation section
  images: string[]; // Array of image URLs for collage
  order?: number;
}

export interface Project {
  id: string;
  imageUrl: string; // Thumbnail for bio container
  title: string;
  slug?: string; // URL-friendly identifier for routing
  description?: string;
  headerGraphicUrl?: string; // Header graphic for project page
  subsections: ProjectSubsection[]; // 2-3 subsections (e.g., jerseys, social, organizational)
  order?: number;
}

export interface ProfileData extends Profile {
  socialLinks?: SocialLinks;
  profileImages?: string[]; // Array of image URLs for the carousel
  projects?: Project[]; // Array of projects (replaces bioContainers)
}

