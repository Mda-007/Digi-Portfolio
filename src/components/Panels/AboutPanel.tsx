/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Briefcase, MapPin, Edit2, Check, X } from 'lucide-react';
import { JobRole, UserProfile } from '../../types';
import { db, OperationType, handleFirestoreError } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface AboutPanelProps {
  name: string;
  about: string;
  role: JobRole;
  uid: string;
  isPresentationMode?: boolean;
}

export const AboutPanel: React.FC<AboutPanelProps> = ({ name, about, role, uid, isPresentationMode = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedAbout, setEditedAbout] = useState(about);
  const [editedRole, setEditedRole] = useState(role);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, path), {
        name: editedName,
        about: editedAbout,
        role: editedRole
      });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <User size={32} />
          </div>
          <div>
            {isEditing ? (
              <input 
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-3xl font-bold text-gray-900 bg-white border-b-2 border-blue-500 focus:outline-none w-full"
              />
            ) : (
              <h2 className="text-3xl font-bold text-gray-900">{name}</h2>
            )}
            <div className="flex items-center gap-2 text-gray-500 font-medium mt-1">
              <Briefcase size={16} />
              {isEditing ? (
                <select 
                  value={editedRole}
                  onChange={(e) => setEditedRole(e.target.value as JobRole)}
                  className="bg-white border-b border-gray-300 focus:outline-none"
                >
                  <option value="Developer">Developer</option>
                  <option value="Designer">Designer</option>
                  <option value="Student">Student</option>
                  <option value="Manager">Manager</option>
                  <option value="Artist">Artist</option>
                </select>
              ) : (
                <span>{role}</span>
              )}
            </div>
          </div>
        </div>
        
        {!isPresentationMode && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                >
                  <Check size={20} />
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <Edit2 size={20} />
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="prose prose-slate max-w-none">
        {isEditing ? (
          <textarea 
            value={editedAbout}
            onChange={(e) => setEditedAbout(e.target.value)}
            rows={6}
            className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-lg leading-relaxed text-gray-700"
          />
        ) : (
          <p className="text-lg leading-relaxed text-gray-700">
            {about}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-3 text-gray-600">
          <MapPin size={18} className="text-blue-500" />
          <span>Based in San Francisco, CA</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <Briefcase size={18} className="text-blue-500" />
          <span>Open to new opportunities</span>
        </div>
      </div>
    </div>
  );
};
