'use client';

import { useState } from 'react';
import { Project, ProjectSubsection } from '@/types';
import { uploadImage, getProjectImagePath, getProjectSubsectionImagePath, getProjectNavigationImagePath } from '@/lib/storage';
import { updateProfile } from '@/lib/firestore';
import { generateSlug } from '@/lib/utils';
import Image from 'next/image';

interface ProjectManagementProps {
  projects: Project[];
  onUpdate: () => void;
  onMessage: (type: 'success' | 'error', text: string) => void;
}

export default function ProjectManagement({ projects, onUpdate, onMessage }: ProjectManagementProps) {
  const [uploadingProjectImage, setUploadingProjectImage] = useState<{ projectId: string; type: 'thumbnail' | 'header' } | null>(null);
  const [uploadingSubsectionImage, setUploadingSubsectionImage] = useState<{ projectId: string; subsectionId: string; type: 'header' | 'collage' | 'navigation' } | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingSubsection, setEditingSubsection] = useState<{ projectId: string; subsection: ProjectSubsection } | null>(null);

  // Helper to remove undefined values from objects (Firestore doesn't accept undefined)
  const removeUndefined = (obj: any): any => {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) return obj.map(removeUndefined);
    if (typeof obj !== 'object') return obj;
    const cleaned: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        cleaned[key] = removeUndefined(obj[key]);
      }
    }
    return cleaned;
  };

  const handleProjectImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    projectId: string,
    type: 'thumbnail' | 'header'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onMessage('error', 'Please select an image file');
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onMessage('error', 'Image size must be less than 10MB');
      e.target.value = '';
      return;
    }

    setUploadingProjectImage({ projectId, type });
    try {
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${type}-${Date.now()}-${sanitizedFileName}`;
      const imagePath = getProjectImagePath(projectId, fileName);
      const imageUrl = await uploadImage(file, imagePath);

      const currentProjects = projects || [];
      const projectIndex = currentProjects.findIndex(p => p.id === projectId);
      
      let updatedProjects: Project[];
      if (projectIndex >= 0) {
        updatedProjects = [...currentProjects];
        if (type === 'thumbnail') {
          updatedProjects[projectIndex] = { ...updatedProjects[projectIndex], imageUrl };
        } else {
          updatedProjects[projectIndex] = { ...updatedProjects[projectIndex], headerGraphicUrl: imageUrl };
        }
      } else {
        const newProject: Project = {
          id: projectId,
          imageUrl: type === 'thumbnail' ? imageUrl : '',
          headerGraphicUrl: type === 'header' ? imageUrl : undefined,
          title: '',
          subsections: [],
          order: currentProjects.length,
        };
        updatedProjects = [...currentProjects, newProject];
      }

      const cleanedProjects = removeUndefined(updatedProjects);
      await updateProfile({ projects: cleanedProjects });
      onUpdate();
      onMessage('success', 'Project image uploaded successfully!');
    } catch (error) {
      console.error('Project image upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      onMessage('error', `Upload failed: ${errorMessage}`);
    } finally {
      setUploadingProjectImage(null);
      e.target.value = '';
    }
  };

  const handleProjectUpdate = async (project: Project) => {
    try {
      const currentProjects = projects || [];
      const projectIndex = currentProjects.findIndex(p => p.id === project.id);
      
      let updatedProjects: Project[];
      if (projectIndex >= 0) {
        updatedProjects = [...currentProjects];
        updatedProjects[projectIndex] = project;
      } else {
        updatedProjects = [...currentProjects, project];
      }

      const cleanedProjects = removeUndefined(updatedProjects);
      await updateProfile({ projects: cleanedProjects });
      onUpdate();
      setEditingProject(null);
      onMessage('success', 'Project updated successfully!');
    } catch (error) {
      onMessage('error', 'Failed to update project');
    }
  };

  const handleProjectDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This will delete all subsections and images.')) return;

    try {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      await updateProfile({ projects: updatedProjects });
      onUpdate();
      onMessage('success', 'Project deleted successfully!');
    } catch (error) {
      onMessage('error', 'Failed to delete project');
    }
  };

  const handleSubsectionImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    projectId: string,
    subsectionId: string,
    type: 'header' | 'collage' | 'navigation'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onMessage('error', 'Please select an image file');
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onMessage('error', 'Image size must be less than 10MB');
      e.target.value = '';
      return;
    }

    setUploadingSubsectionImage({ projectId, subsectionId, type });
    try {
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${type}-${Date.now()}-${sanitizedFileName}`;
      const imagePath = type === 'navigation' 
        ? getProjectNavigationImagePath(projectId, subsectionId, fileName)
        : getProjectSubsectionImagePath(projectId, subsectionId, fileName);
      const imageUrl = await uploadImage(file, imagePath);

      const currentProjects = projects || [];
      const projectIndex = currentProjects.findIndex(p => p.id === projectId);
      if (projectIndex < 0) {
        throw new Error('Project not found');
      }

      const project = currentProjects[projectIndex];
      const subsectionIndex = project.subsections.findIndex(s => s.id === subsectionId);
      
      let updatedSubsections: ProjectSubsection[];
      if (subsectionIndex >= 0) {
        updatedSubsections = [...project.subsections];
        if (type === 'header') {
          updatedSubsections[subsectionIndex] = { ...updatedSubsections[subsectionIndex], headerImageUrl: imageUrl };
        } else if (type === 'navigation') {
          updatedSubsections[subsectionIndex] = { ...updatedSubsections[subsectionIndex], navigationImageUrl: imageUrl };
        } else {
          updatedSubsections[subsectionIndex] = {
            ...updatedSubsections[subsectionIndex],
            images: [...(updatedSubsections[subsectionIndex].images || []), imageUrl],
          };
        }
      } else {
        const newSubsection: ProjectSubsection = {
          id: subsectionId,
          title: '',
          headerImageUrl: type === 'header' ? imageUrl : undefined,
          navigationImageUrl: type === 'navigation' ? imageUrl : undefined,
          images: type === 'collage' ? [imageUrl] : [],
          order: project.subsections.length,
        };
        updatedSubsections = [...project.subsections, newSubsection];
      }

      const updatedProjects = [...currentProjects];
      updatedProjects[projectIndex] = { ...project, subsections: updatedSubsections };

      const cleanedProjects = removeUndefined(updatedProjects);
      await updateProfile({ projects: cleanedProjects });
      onUpdate();
      onMessage('success', 'Subsection image uploaded successfully!');
    } catch (error) {
      console.error('Subsection image upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      onMessage('error', `Upload failed: ${errorMessage}`);
    } finally {
      setUploadingSubsectionImage(null);
      e.target.value = '';
    }
  };

  const handleSubsectionUpdate = async (projectId: string, subsection: ProjectSubsection) => {
    try {
      const currentProjects = projects || [];
      const projectIndex = currentProjects.findIndex(p => p.id === projectId);
      if (projectIndex < 0) {
        throw new Error('Project not found');
      }

      const project = currentProjects[projectIndex];
      const subsectionIndex = project.subsections.findIndex(s => s.id === subsection.id);
      
      let updatedSubsections: ProjectSubsection[];
      if (subsectionIndex >= 0) {
        updatedSubsections = [...project.subsections];
        updatedSubsections[subsectionIndex] = subsection;
      } else {
        updatedSubsections = [...project.subsections, subsection];
      }

      const updatedProjects = [...currentProjects];
      updatedProjects[projectIndex] = { ...project, subsections: updatedSubsections };

      const cleanedProjects = removeUndefined(updatedProjects);
      await updateProfile({ projects: cleanedProjects });
      onUpdate();
      setEditingSubsection(null);
      onMessage('success', 'Subsection updated successfully!');
    } catch (error) {
      onMessage('error', 'Failed to update subsection');
    }
  };

  const handleSubsectionImageDelete = async (projectId: string, subsectionId: string, imageIndex: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const currentProjects = projects || [];
      const projectIndex = currentProjects.findIndex(p => p.id === projectId);
      if (projectIndex < 0) return;

      const project = currentProjects[projectIndex];
      const subsectionIndex = project.subsections.findIndex(s => s.id === subsectionId);
      if (subsectionIndex < 0) return;

      const subsection = project.subsections[subsectionIndex];
      const updatedImages = subsection.images.filter((_, i) => i !== imageIndex);

      const updatedSubsections = [...project.subsections];
      updatedSubsections[subsectionIndex] = { ...subsection, images: updatedImages };

      const updatedProjects = [...currentProjects];
      updatedProjects[projectIndex] = { ...project, subsections: updatedSubsections };

      const cleanedProjects = removeUndefined(updatedProjects);
      await updateProfile({ projects: cleanedProjects });
      onUpdate();
      onMessage('success', 'Image deleted successfully!');
    } catch (error) {
      onMessage('error', 'Failed to delete image');
    }
  };

  const handleSubsectionDelete = async (projectId: string, subsectionId: string) => {
    if (!confirm('Are you sure you want to delete this subsection?')) return;

    try {
      const currentProjects = projects || [];
      const projectIndex = currentProjects.findIndex(p => p.id === projectId);
      if (projectIndex < 0) return;

      const project = currentProjects[projectIndex];
      const updatedSubsections = project.subsections.filter(s => s.id !== subsectionId);

      const updatedProjects = [...currentProjects];
      updatedProjects[projectIndex] = { ...project, subsections: updatedSubsections };

      const cleanedProjects = removeUndefined(updatedProjects);
      await updateProfile({ projects: cleanedProjects });
      onUpdate();
      onMessage('success', 'Subsection deleted successfully!');
    } catch (error) {
      onMessage('error', 'Failed to delete subsection');
    }
  };

  const addSubsection = (projectId: string) => {
    const currentProjects = projects || [];
    const projectIndex = currentProjects.findIndex(p => p.id === projectId);
    if (projectIndex < 0) return;

    const project = currentProjects[projectIndex];
    const newSubsection: ProjectSubsection = {
      id: `subsection-${Date.now()}`,
      title: '',
      images: [],
      order: project.subsections.length,
    };

    const updatedSubsections = [...project.subsections, newSubsection];
    const updatedProjects = [...currentProjects];
    updatedProjects[projectIndex] = { ...project, subsections: updatedSubsections };

    const cleanedProjects = removeUndefined(updatedProjects);
    updateProfile({ projects: cleanedProjects }).then(() => {
      onUpdate();
      onMessage('success', 'Subsection added!');
    }).catch(() => {
      onMessage('error', 'Failed to add subsection');
    });
  };

  return (
    <div className="border-t pt-4 mt-6">
      <h3 className="text-lg font-semibold mb-4">Projects</h3>
      <p className="text-sm text-gray-600 mb-4">
        Manage up to 3 projects. Each project can have a header graphic and 2-3 subsections with multiple images.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
        <p className="text-sm font-semibold text-blue-900 mb-1">Recommended Dimensions:</p>
                  <p className="text-xs text-blue-700">
                    <strong>Project Thumbnail:</strong> 1200×900px (4:3 ratio)<br />
                    <strong>Header Graphic:</strong> 1920×600px (wide banner)<br />
                    <strong>Subsection Header:</strong> 1200×600px (2:1 ratio)<br />
                    <strong>Navigation Image:</strong> 1200×600px (2:1 ratio) - displayed in diagonal navigation section<br />
                    <strong>Collage Images:</strong> Any size (will be displayed in grid with standard spacing)
                  </p>
      </div>

      {[1, 2, 3].map((num) => {
        const projectId = `project-${num}`;
        const existingProject = projects?.find(p => p.id === projectId);
        
        return (
          <div key={projectId} className="mb-8 p-6 border-2 border-gray-300 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Project {num}</h4>
              {existingProject && (
                <button
                  onClick={() => handleProjectDelete(projectId)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete Project
                </button>
              )}
            </div>

            {editingProject?.id === projectId ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const title = (formData.get('title') as string) || '';
                  const project: Project = {
                    id: projectId,
                    imageUrl: editingProject.imageUrl || '',
                    headerGraphicUrl: editingProject.headerGraphicUrl,
                    title,
                    slug: editingProject.slug || generateSlug(title),
                    description: (formData.get('description') as string) || undefined,
                    subsections: editingProject.subsections || [],
                    order: num - 1,
                  };
                  handleProjectUpdate(project);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={existingProject?.title || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    onChange={(e) => {
                      // Auto-generate slug from title
                      if (editingProject) {
                        setEditingProject({
                          ...editingProject,
                          title: e.target.value,
                          slug: generateSlug(e.target.value),
                        });
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    defaultValue={existingProject?.description || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save Project
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Project Thumbnail */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Thumbnail (4:3 ratio)
                  </label>
                  {existingProject?.imageUrl ? (
                    <div className="relative aspect-[4/3] w-full max-w-xs mb-2 rounded overflow-hidden border-2 border-gray-200">
                      <Image
                        src={existingProject.imageUrl}
                        alt="Project thumbnail"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] w-full max-w-xs mb-2 rounded bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <p className="text-gray-400 text-sm">No thumbnail</p>
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProjectImageUpload(e, projectId, 'thumbnail')}
                      disabled={uploadingProjectImage?.projectId === projectId && uploadingProjectImage.type === 'thumbnail'}
                      className="hidden"
                    />
                    <span className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm">
                      {uploadingProjectImage?.projectId === projectId && uploadingProjectImage.type === 'thumbnail' ? 'Uploading...' : existingProject?.imageUrl ? 'Change Thumbnail' : 'Upload Thumbnail'}
                    </span>
                  </label>
                </div>

                {/* Project Header Graphic */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Header Graphic (for project page)
                  </label>
                  {existingProject?.headerGraphicUrl ? (
                    <div className="relative w-full h-32 mb-2 rounded overflow-hidden border-2 border-gray-200">
                      <Image
                        src={existingProject.headerGraphicUrl}
                        alt="Header graphic"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 80vw"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 mb-2 rounded bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <p className="text-gray-400 text-sm">No header graphic</p>
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProjectImageUpload(e, projectId, 'header')}
                      disabled={uploadingProjectImage?.projectId === projectId && uploadingProjectImage.type === 'header'}
                      className="hidden"
                    />
                    <span className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm">
                      {uploadingProjectImage?.projectId === projectId && uploadingProjectImage.type === 'header' ? 'Uploading...' : existingProject?.headerGraphicUrl ? 'Change Header' : 'Upload Header Graphic'}
                    </span>
                  </label>
                </div>

                {/* Project Details */}
                {existingProject && (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Title:</strong> {existingProject.title || 'Not set'}
                      </p>
                      {existingProject.description && (
                        <p className="text-sm text-gray-600">
                          <strong>Description:</strong> {existingProject.description}
                        </p>
                      )}
                      <button
                        onClick={() => setEditingProject(existingProject)}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit Project Details
                      </button>
                    </div>

                    {/* Subsections */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-md font-semibold">Subsections (2-3 recommended)</h5>
                        {existingProject.subsections.length < 3 && (
                          <button
                            onClick={() => addSubsection(projectId)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            + Add Subsection
                          </button>
                        )}
                      </div>

                      {existingProject.subsections.map((subsection, subIndex) => (
                        <div key={subsection.id} className="mb-6 p-4 border border-gray-200 rounded-lg bg-white">
                          {editingSubsection?.projectId === projectId && editingSubsection.subsection.id === subsection.id ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const updatedSubsection: ProjectSubsection = {
                                  ...subsection,
                                  title: (formData.get('title') as string) || '',
                                };
                                handleSubsectionUpdate(projectId, updatedSubsection);
                              }}
                              className="space-y-3"
                            >
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                                <input
                                  type="text"
                                  name="title"
                                  defaultValue={subsection.title || ''}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingSubsection(null)}
                                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="flex justify-between items-center mb-3">
                                <h6 className="font-semibold">{subsection.title || `Subsection ${subIndex + 1}`}</h6>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingSubsection({ projectId, subsection })}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    Edit Title
                                  </button>
                                  <button
                                    onClick={() => handleSubsectionDelete(projectId, subsection.id)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              {/* Subsection Header Image */}
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Subsection Header Image
                                </label>
                                {subsection.headerImageUrl ? (
                                  <div className="relative w-full h-32 mb-2 rounded overflow-hidden border-2 border-gray-200">
                                    <Image
                                      src={subsection.headerImageUrl}
                                      alt="Subsection header"
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full h-32 mb-2 rounded bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                                    <p className="text-gray-400 text-sm">No header image</p>
                                  </div>
                                )}
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleSubsectionImageUpload(e, projectId, subsection.id, 'header')}
                                    disabled={uploadingSubsectionImage?.projectId === projectId && uploadingSubsectionImage.subsectionId === subsection.id && uploadingSubsectionImage.type === 'header'}
                                    className="hidden"
                                  />
                                  <span className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm">
                                    {uploadingSubsectionImage?.projectId === projectId && uploadingSubsectionImage.subsectionId === subsection.id && uploadingSubsectionImage.type === 'header' ? 'Uploading...' : subsection.headerImageUrl ? 'Change Header' : 'Upload Header Image'}
                                  </span>
                                </label>
                              </div>

                              {/* Navigation Image */}
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Navigation Image (for image navigation section)
                                </label>
                                {subsection.navigationImageUrl ? (
                                  <div className="relative w-full h-32 mb-2 rounded overflow-hidden border-2 border-gray-200">
                                    <Image
                                      src={subsection.navigationImageUrl}
                                      alt="Navigation image"
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full h-32 mb-2 rounded bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                                    <p className="text-gray-400 text-sm">No navigation image</p>
                                  </div>
                                )}
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleSubsectionImageUpload(e, projectId, subsection.id, 'navigation')}
                                    disabled={uploadingSubsectionImage?.projectId === projectId && uploadingSubsectionImage.subsectionId === subsection.id && uploadingSubsectionImage.type === 'navigation'}
                                    className="hidden"
                                  />
                                  <span className="inline-block bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors text-sm">
                                    {uploadingSubsectionImage?.projectId === projectId && uploadingSubsectionImage.subsectionId === subsection.id && uploadingSubsectionImage.type === 'navigation' ? 'Uploading...' : subsection.navigationImageUrl ? 'Change Navigation Image' : 'Upload Navigation Image'}
                                  </span>
                                </label>
                              </div>

                              {/* Collage Images */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Collage Images ({subsection.images?.length || 0} uploaded)
                                </label>
                                <label className="cursor-pointer mb-3 block">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleSubsectionImageUpload(e, projectId, subsection.id, 'collage')}
                                    disabled={uploadingSubsectionImage?.projectId === projectId && uploadingSubsectionImage.subsectionId === subsection.id && uploadingSubsectionImage.type === 'collage'}
                                    className="hidden"
                                  />
                                  <span className="inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm">
                                    {uploadingSubsectionImage?.projectId === projectId && uploadingSubsectionImage.subsectionId === subsection.id && uploadingSubsectionImage.type === 'collage' ? 'Uploading...' : '+ Add Image to Collage'}
                                  </span>
                                </label>
                                {subsection.images && subsection.images.length > 0 && (
                                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                    {subsection.images.map((imageUrl, imgIndex) => (
                                      <div key={imgIndex} className="relative group">
                                        <div className="relative aspect-square w-full rounded overflow-hidden border-2 border-gray-200">
                                          <Image
                                            src={imageUrl}
                                            alt={`Collage image ${imgIndex + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 33vw, 25vw"
                                          />
                                        </div>
                                        <button
                                          onClick={() => handleSubsectionImageDelete(projectId, subsection.id, imgIndex)}
                                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                          aria-label={`Delete image ${imgIndex + 1}`}
                                        >
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

