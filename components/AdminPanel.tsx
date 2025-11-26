'use client';

import { useState, useEffect } from 'react';
import { ProfileData, Design, BioContainer } from '@/types';
import { getProfile, updateProfile, getDesigns, updateDesign, deleteDesign } from '@/lib/firestore';
import { deleteImage, uploadImage, getProfileImagePath, getBioContainerImagePath } from '@/lib/storage';
import DesignUpload from './DesignUpload';
import Image from 'next/image';

export default function AdminPanel() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'designs'>('profile');
  const [editingDesign, setEditingDesign] = useState<Design | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [uploadingBioContainer, setUploadingBioContainer] = useState<string | null>(null);
  const [editingBioContainer, setEditingBioContainer] = useState<BioContainer | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, designsData] = await Promise.all([
        getProfile(),
        getDesigns(),
      ]);
      setProfile(profileData);
      setDesigns(designsData);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to remove undefined values from objects
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

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const profileData: Partial<ProfileData> = {
      name: (formData.get('name') as string) || undefined,
      title: (formData.get('title') as string) || undefined,
      bio: (formData.get('bio') as string) || undefined,
      email: (formData.get('email') as string) || undefined,
      location: (formData.get('location') as string) || undefined,
      socialLinks: {
        linkedin: (formData.get('linkedin') as string) || undefined,
        instagram: (formData.get('instagram') as string) || undefined,
        twitter: (formData.get('twitter') as string) || undefined,
        behance: (formData.get('behance') as string) || undefined,
        dribbble: (formData.get('dribbble') as string) || undefined,
        website: (formData.get('website') as string) || undefined,
      },
    };

    // Remove undefined values before sending to Firestore
    const cleanedData = removeUndefined(profileData);

    try {
      await updateProfile(cleanedData);
      setProfile({ ...profile, ...cleanedData } as ProfileData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  const handleDesignUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingDesign) return;

    const formData = new FormData(e.currentTarget);
    const designData: Partial<Design> = {
      title: (formData.get('title') as string) || undefined,
      description: (formData.get('description') as string) || undefined,
      category: (formData.get('category') as string) || undefined,
    };

    // Remove undefined values before sending to Firestore
    const cleanedData = removeUndefined(designData);

    try {
      await updateDesign(editingDesign.id, cleanedData);
      await loadData();
      setEditingDesign(null);
      setMessage({ type: 'success', text: 'Design updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update design' });
    }
  };

  const handleDesignDelete = async (id: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this design?')) return;

    try {
      // Extract path from URL (simplified - in production, store path separately)
      await deleteDesign(id);
      await loadData();
      setMessage({ type: 'success', text: 'Design deleted successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete design' });
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      e.target.value = '';
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 10MB' });
      e.target.value = '';
      return;
    }

    setUploadingProfileImage(true);
    try {
      // Sanitize filename to remove special characters
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `profile-${Date.now()}-${sanitizedFileName}`;
      const imagePath = getProfileImagePath(fileName);
      const imageUrl = await uploadImage(file, imagePath);

      const currentImages = profile?.profileImages || [];
      const updatedImages = [...currentImages, imageUrl];

      await updateProfile({ profileImages: updatedImages });
      await loadData();
      setMessage({ type: 'success', text: 'Profile image uploaded successfully!' });
    } catch (error) {
      console.error('Profile image upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile image';
      setMessage({ type: 'error', text: `Upload failed: ${errorMessage}` });
    } finally {
      setUploadingProfileImage(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleProfileImageDelete = async (imageUrl: string, index: number) => {
    if (!confirm('Are you sure you want to delete this profile image?')) return;

    try {
      const currentImages = profile?.profileImages || [];
      const updatedImages = currentImages.filter((_, i) => i !== index);

      await updateProfile({ profileImages: updatedImages });
      await loadData();
      setMessage({ type: 'success', text: 'Profile image deleted successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete profile image' });
    }
  };

  const handleBioContainerUpload = async (e: React.ChangeEvent<HTMLInputElement>, containerId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 10MB' });
      e.target.value = '';
      return;
    }

    setUploadingBioContainer(containerId);
    try {
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `bio-container-${containerId}-${Date.now()}-${sanitizedFileName}`;
      const imagePath = getBioContainerImagePath(fileName);
      const imageUrl = await uploadImage(file, imagePath);

      const currentContainers = profile?.bioContainers || [];
      const containerIndex = currentContainers.findIndex(c => c.id === containerId);
      
      let updatedContainers: BioContainer[];
      if (containerIndex >= 0) {
        updatedContainers = [...currentContainers];
        updatedContainers[containerIndex] = { ...updatedContainers[containerIndex], imageUrl };
      } else {
        updatedContainers = [...currentContainers, { id: containerId, imageUrl, order: currentContainers.length }];
      }

      await updateProfile({ bioContainers: updatedContainers });
      await loadData();
      setMessage({ type: 'success', text: 'Bio container image uploaded successfully!' });
    } catch (error) {
      console.error('Bio container upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setMessage({ type: 'error', text: `Upload failed: ${errorMessage}` });
    } finally {
      setUploadingBioContainer(null);
      e.target.value = '';
    }
  };

  const handleBioContainerUpdate = async (container: BioContainer) => {
    try {
      const currentContainers = profile?.bioContainers || [];
      const containerIndex = currentContainers.findIndex(c => c.id === container.id);
      
      let updatedContainers: BioContainer[];
      if (containerIndex >= 0) {
        updatedContainers = [...currentContainers];
        updatedContainers[containerIndex] = container;
      } else {
        updatedContainers = [...currentContainers, container];
      }

      await updateProfile({ bioContainers: updatedContainers });
      await loadData();
      setEditingBioContainer(null);
      setMessage({ type: 'success', text: 'Bio container updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update bio container' });
    }
  };

  const handleBioContainerDelete = async (containerId: string) => {
    if (!confirm('Are you sure you want to delete this bio container?')) return;

    try {
      const currentContainers = profile?.bioContainers || [];
      const updatedContainers = currentContainers.filter(c => c.id !== containerId);

      await updateProfile({ bioContainers: updatedContainers });
      await loadData();
      setMessage({ type: 'success', text: 'Bio container deleted successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete bio container' });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {message && (
          <div
            className={`mb-4 p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
            <button
              onClick={() => setMessage(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'profile'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('designs')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'designs'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Designs
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={profile?.name || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={profile?.title || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  defaultValue={profile?.bio || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={profile?.email || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  defaultValue={profile?.location || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-semibold mb-4">Social Links</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      defaultValue={profile?.socialLinks?.linkedin || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="url"
                      name="instagram"
                      defaultValue={profile?.socialLinks?.instagram || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter
                    </label>
                    <input
                      type="url"
                      name="twitter"
                      defaultValue={profile?.socialLinks?.twitter || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Behance
                    </label>
                    <input
                      type="url"
                      name="behance"
                      defaultValue={profile?.socialLinks?.behance || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dribbble
                    </label>
                    <input
                      type="url"
                      name="dribbble"
                      defaultValue={profile?.socialLinks?.dribbble || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      defaultValue={profile?.socialLinks?.website || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-semibold mb-4">Profile Images</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload multiple images to create a carousel in your bio section. Images will automatically transition every 5 seconds.
                </p>
                
                {/* Upload New Image */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload New Profile Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    disabled={uploadingProfileImage}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                  {uploadingProfileImage && (
                    <p className="text-sm text-gray-500 mt-2">Uploading...</p>
                  )}
                </div>

                {/* Existing Images */}
                {profile?.profileImages && profile.profileImages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Profile Images ({profile.profileImages.length})
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {profile.profileImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <div className="relative aspect-square w-full rounded-lg overflow-hidden border-2 border-gray-200">
                            <Image
                              src={imageUrl}
                              alt={`Profile image ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            />
                          </div>
                          <button
                            onClick={() => handleProfileImageDelete(imageUrl, index)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                            aria-label={`Delete image ${index + 1}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bio Primary Containers */}
              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-semibold mb-4">Bio Primary Containers</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload up to 3 clickable photo containers that appear below the carousel. Each container can link to a URL, section, or modal.
                </p>
                
                {[1, 2, 3].map((num) => {
                  const containerId = `container-${num}`;
                  const existingContainer = profile?.bioContainers?.find(c => c.id === containerId);
                  
                  return (
                    <div key={containerId} className="mb-6 p-4 border border-gray-200 rounded-lg">
                      <h4 className="text-md font-semibold mb-3">Container {num}</h4>
                      
                      {editingBioContainer?.id === containerId ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const container: BioContainer = {
                              id: containerId,
                              imageUrl: editingBioContainer.imageUrl || '',
                              title: (formData.get('title') as string) || undefined,
                              description: (formData.get('description') as string) || undefined,
                              linkUrl: (formData.get('linkUrl') as string) || undefined,
                              linkType: (formData.get('linkType') as 'url' | 'section' | 'modal') || undefined,
                              order: num - 1,
                            };
                            handleBioContainerUpdate(container);
                          }}
                          className="space-y-3"
                        >
                          {existingContainer?.imageUrl && (
                            <div className="relative aspect-video w-full mb-3 rounded overflow-hidden">
                              <Image
                                src={existingContainer.imageUrl}
                                alt="Container preview"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                              />
                            </div>
                          )}
                          <input
                            type="text"
                            name="title"
                            placeholder="Title (optional)"
                            defaultValue={existingContainer?.title || ''}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <textarea
                            name="description"
                            placeholder="Description (optional)"
                            defaultValue={existingContainer?.description || ''}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <select
                            name="linkType"
                            defaultValue={existingContainer?.linkType || 'url'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="url">External URL</option>
                            <option value="section">Section (scroll to ID)</option>
                            <option value="modal">Modal (coming soon)</option>
                          </select>
                          <input
                            type="text"
                            name="linkUrl"
                            placeholder="Link URL or Section ID"
                            defaultValue={existingContainer?.linkUrl || ''}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingBioContainer(null)}
                              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          {existingContainer?.imageUrl ? (
                            <div className="relative aspect-video w-full mb-3 rounded overflow-hidden border-2 border-gray-200">
                              <Image
                                src={existingContainer.imageUrl}
                                alt={existingContainer.title || `Container ${num}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video w-full mb-3 rounded bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                              <p className="text-gray-400 text-sm">No image uploaded</p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <label className="flex-1 cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleBioContainerUpload(e, containerId)}
                                disabled={uploadingBioContainer === containerId}
                                className="hidden"
                              />
                              <span className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center">
                                {uploadingBioContainer === containerId ? 'Uploading...' : existingContainer ? 'Change Image' : 'Upload Image'}
                              </span>
                            </label>
                            {existingContainer && (
                              <>
                                <button
                                  onClick={() => setEditingBioContainer(existingContainer)}
                                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                                >
                                  Edit Details
                                </button>
                                <button
                                  onClick={() => handleBioContainerDelete(containerId)}
                                  className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                          {existingContainer && (
                            <div className="mt-2 text-sm text-gray-600">
                              {existingContainer.title && <p><strong>Title:</strong> {existingContainer.title}</p>}
                              {existingContainer.linkUrl && <p><strong>Link:</strong> {existingContainer.linkUrl}</p>}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Profile
              </button>
            </form>
          </div>
        )}

        {activeTab === 'designs' && (
          <div className="space-y-6">
            <DesignUpload onUploadComplete={loadData} />
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Manage Designs</h2>
              
              {editingDesign ? (
                <form onSubmit={handleDesignUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingDesign.title || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      defaultValue={editingDesign.description || ''}
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
                      name="category"
                      defaultValue={editingDesign.category || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingDesign(null)}
                      className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {designs.map((design) => (
                    <div key={design.id} className="border rounded-lg p-4">
                      <div className="relative aspect-square w-full mb-3">
                        <Image
                          src={design.imageUrl}
                          alt={design.title || 'Design'}
                          fill
                          className="object-cover rounded"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      {design.title && (
                        <h4 className="font-semibold mb-1">{design.title}</h4>
                      )}
                      {design.category && (
                        <p className="text-sm text-gray-600 mb-2">{design.category}</p>
                      )}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setEditingDesign(design)}
                          className="flex-1 bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDesignDelete(design.id, design.imageUrl)}
                          className="flex-1 bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

