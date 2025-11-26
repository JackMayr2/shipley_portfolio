import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { ProfileData, Design, Project } from '@/types';
import { generateSlug } from './utils';

const PROFILE_COLLECTION = 'profile';
const DESIGNS_COLLECTION = 'designs';
const PROFILE_DOC_ID = 'main';

export async function getProfile(): Promise<ProfileData | null> {
  if (!db) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  try {
    const profileRef = doc(db, PROFILE_COLLECTION, PROFILE_DOC_ID);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      return { id: profileSnap.id, ...profileSnap.data() } as ProfileData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

export async function updateProfile(data: Partial<ProfileData>): Promise<void> {
  if (!db) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  try {
    const profileRef = doc(db, PROFILE_COLLECTION, PROFILE_DOC_ID);
    await setDoc(profileRef, data, { merge: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export async function getDesigns(): Promise<Design[]> {
  if (!db) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  try {
    const designsRef = collection(db, DESIGNS_COLLECTION);
    const q = query(designsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Design;
    });
  } catch (error) {
    console.error('Error fetching designs:', error);
    throw error;
  }
}

export async function createDesign(design: Omit<Design, 'id' | 'createdAt'>): Promise<string> {
  if (!db) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  try {
    const designsRef = collection(db, DESIGNS_COLLECTION);
    const newDesignRef = doc(designsRef);
    
    await setDoc(newDesignRef, {
      ...design,
      createdAt: Timestamp.now(),
      order: design.order || 0,
    });
    
    return newDesignRef.id;
  } catch (error) {
    console.error('Error creating design:', error);
    throw error;
  }
}

export async function updateDesign(id: string, data: Partial<Design>): Promise<void> {
  if (!db) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  try {
    const designRef = doc(db, DESIGNS_COLLECTION, id);
    await setDoc(designRef, data, { merge: true });
  } catch (error) {
    console.error('Error updating design:', error);
    throw error;
  }
}

export async function deleteDesign(id: string): Promise<void> {
  if (!db) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  try {
    const designRef = doc(db, DESIGNS_COLLECTION, id);
    await deleteDoc(designRef);
  } catch (error) {
    console.error('Error deleting design:', error);
    throw error;
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!db) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  try {
    const profile = await getProfile();
    if (!profile || !profile.projects) {
      console.log('No profile or projects found');
      return null;
    }
    
    // Decode slug in case it's URL encoded
    let decodedSlug = slug;
    try {
      decodedSlug = decodeURIComponent(slug).toLowerCase().trim();
    } catch (e) {
      decodedSlug = slug.toLowerCase().trim();
    }
    
    // Find project by slug, or by generated slug from title (for backwards compatibility)
    const project = profile.projects.find(p => {
      if (!p.title) return false;
      const projectSlug = (p.slug || generateSlug(p.title)).toLowerCase().trim();
      const titleSlug = generateSlug(p.title).toLowerCase().trim();
      return projectSlug === decodedSlug || titleSlug === decodedSlug;
    });
    
    if (!project) {
      console.log('Available projects:', profile.projects.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug || generateSlug(p.title || ''),
        generatedSlug: generateSlug(p.title || '')
      })));
      console.log('Looking for slug:', decodedSlug);
    }
    
    return project || null;
  } catch (error) {
    console.error('Error fetching project by slug:', error);
    throw error;
  }
}

