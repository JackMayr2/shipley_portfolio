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

export interface ProfileData extends Profile {
  socialLinks?: SocialLinks;
}

