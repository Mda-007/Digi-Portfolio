/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ExternalLink, Github, Folder, Plus, Trash2, Check, X } from 'lucide-react';
import { Project } from '../../types';
import { db, OperationType, handleFirestoreError } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface ProjectsPanelProps {
  projects: Project[];
  uid: string;
  isPresentationMode?: boolean;
}

export const ProjectsPanel: React.FC<ProjectsPanelProps> = ({ projects, uid, isPresentationMode = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProjects, setEditedProjects] = useState<Project[]>(projects);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, path), {
        projects: editedProjects
      });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setSaving(false);
    }
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: "New Project",
      description: "Project description goes here.",
      tags: ["Tag"],
      link: ""
    };
    setEditedProjects([...editedProjects, newProject]);
  };

  const removeProject = (id: string) => {
    setEditedProjects(editedProjects.filter(p => p.id !== id));
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    setEditedProjects(editedProjects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Folder size={24} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Featured Projects</h2>
        </div>
        
        {!isPresentationMode && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button 
                  onClick={addProject}
                  className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                  title="Add Project"
                >
                  <Plus size={20} />
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                >
                  <Check size={20} />
                </button>
                <button 
                  onClick={() => { setIsEditing(false); setEditedProjects(projects); }}
                  className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-bold text-sm"
              >
                Edit Projects
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(isEditing ? editedProjects : projects).map((project) => (
          <div 
            key={project.id} 
            className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 relative"
          >
            {isEditing && (
              <button 
                onClick={() => removeProject(project.id)}
                className="absolute -top-2 -right-2 p-2 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors z-10"
              >
                <Trash2 size={16} />
              </button>
            )}

            <div className="flex justify-between items-start mb-4">
              {isEditing ? (
                <input 
                  value={project.title}
                  onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                  className="text-xl font-bold text-gray-900 border-b border-blue-500 focus:outline-none w-full mr-4"
                />
              ) : (
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
              )}
              {!isEditing && (
                <div className="flex gap-2">
                  {project.link && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                  <a 
                    href="#" 
                    className="p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Github size={18} />
                  </a>
                </div>
              )}
            </div>
            
            {isEditing ? (
              <textarea 
                value={project.description}
                onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none text-gray-600 text-sm mb-4"
                rows={3}
              />
            ) : (
              <p className="text-gray-600 mb-6 line-clamp-3">
                {project.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, tIdx) => (
                <span 
                  key={tIdx} 
                  className="px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
              {isEditing && (
                <button 
                  onClick={() => {
                    const newTag = prompt("Enter new tag:");
                    if (newTag) updateProject(project.id, 'tags', [...project.tags, newTag]);
                  }}
                  className="px-3 py-1 rounded-full bg-blue-50 text-blue-500 text-xs font-bold"
                >
                  + Tag
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
