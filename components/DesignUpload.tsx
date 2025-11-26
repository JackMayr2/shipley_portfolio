'use client';

import { useState } from 'react';
import { uploadImage, getImagePath } from '@/lib/storage';
import { createDesign, updateDesign } from '@/lib/firestore';
import { Design } from '@/types';

interface DesignUploadProps {
  onUploadComplete: () => void;
}

export default function DesignUpload({ onUploadComplete }: DesignUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If no file is selected, we can still create a design without an image
    if (!file) {
      setError('Please select an image file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Helper function to remove undefined values
      const removeUndefined = (obj: any): any => {
        if (obj === null || obj === undefined) return obj;
        if (Array.isArray(obj)) return obj.map(removeUndefined);
        if (typeof obj === 'object') {
          const cleaned: any = {};
          for (const key in obj) {
            if (obj[key] !== undefined) {
              cleaned[key] = removeUndefined(obj[key]);
            }
          }
          return cleaned;
        }
        return obj;
      };

      // Create design document first to get ID
      const designData: Omit<Design, 'id' | 'createdAt'> = {
        title: title || undefined,
        description: description || undefined,
        category: category || undefined,
        imageUrl: '', // Temporary placeholder
        order: 0,
      };

      // Remove undefined values before sending to Firestore
      const cleanedData = removeUndefined(designData);

      const designId = await createDesign(cleanedData as Omit<Design, 'id' | 'createdAt'>);
      
      // Upload image with the design ID
      const imagePath = getImagePath(designId, file.name);
      const imageUrl = await uploadImage(file, imagePath);
      
      // Update design with the actual image URL
      await updateDesign(designId, { imageUrl });

      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setCategory('');
      setPreview(null);
      
      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload design');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Upload New Design</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {preview && (
            <div className="mt-4">
              <img
                src={preview}
                alt="Preview"
                className="max-w-xs max-h-48 object-contain rounded"
              />
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Sports Graphics, Logos, Branding"
          />
        </div>
        
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload Design'}
        </button>
      </form>
    </div>
  );
}

