import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadImage(file: File, path: string): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage not initialized. Please check your configuration.');
  }
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function deleteImage(path: string): Promise<void> {
  if (!storage) {
    throw new Error('Firebase Storage not initialized. Please check your configuration.');
  }
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

export function getImagePath(designId: string, fileName: string): string {
  return `designs/${designId}/${fileName}`;
}

