export interface Profile {
  id?: string;
  name: string;
  title: string;
  bio: string;
  email?: string;
  location?: string;
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

export interface BioContainer {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  linkUrl?: string;
  linkType?: 'url' | 'section' | 'modal';
  order?: number;
}

export interface ProfileData extends Profile {
  socialLinks?: SocialLinks;
  profileImages?: string[]; // Array of image URLs for the carousel
  bioContainers?: BioContainer[]; // Array of bio primary containers (max 3)
}

