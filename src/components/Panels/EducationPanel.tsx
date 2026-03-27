/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Library, GraduationCap, School, BookOpen, Plus, Trash2, Check, X, Edit2 } from 'lucide-react';
import { Education } from '../../types';
import { db, OperationType, handleFirestoreError } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface EducationPanelProps {
  education: Education[];
  uid: string;
  isPresentationMode?: boolean;
}

export const EducationPanel: React.FC<EducationPanelProps> = ({ education, uid, isPresentationMode = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEducation, setEditedEducation] = useState<Education[]>(education);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, path), {
        education: editedEducation
      });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    setEditedEducation([...editedEducation, {
      institution: "New Institution",
      degree: "Degree Name",
      year: "2020 - 2024"
    }]);
  };

  const removeItem = (index: number) => {
    setEditedEducation(editedEducation.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof Education, value: string) => {
    const newEdu = [...editedEducation];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setEditedEducation(newEdu);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Library size={24} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Education & Learning</h2>
        </div>

        {!isPresentationMode && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button onClick={addItem} className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                  <Plus size={20} />
                </button>
                <button onClick={handleSave} disabled={saving} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors">
                  <Check size={20} />
                </button>
                <button onClick={() => { setIsEditing(false); setEditedEducation(education); }} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                  <X size={20} />
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                <Edit2 size={20} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {(isEditing ? editedEducation : education).map((edu, index) => (
          <div 
            key={index} 
            className="group p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all relative"
          >
            {isEditing && (
              <button onClick={() => removeItem(index)} className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 z-10">
                <Trash2 size={14} />
              </button>
            )}
            
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                {index === 0 ? <GraduationCap size={40} /> : index === 1 ? <School size={40} /> : <BookOpen size={40} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  {isEditing ? (
                    <input 
                      value={edu.institution}
                      onChange={(e) => updateItem(index, 'institution', e.target.value)}
                      className="text-2xl font-bold text-gray-900 bg-transparent border-b border-emerald-500 focus:outline-none w-full"
                      placeholder="Institution Name"
                    />
                  ) : (
                    <h3 className="text-2xl font-bold text-gray-900">{edu.institution}</h3>
                  )}
                  
                  {isEditing ? (
                    <input 
                      value={edu.year}
                      onChange={(e) => updateItem(index, 'year', e.target.value)}
                      className="px-4 py-1 rounded-full bg-emerald-100 text-emerald-600 text-sm font-bold bg-transparent border-b border-emerald-500 focus:outline-none ml-4"
                      placeholder="Year"
                    />
                  ) : (
                    <span className="px-4 py-1 rounded-full bg-emerald-100 text-emerald-600 text-sm font-bold">{edu.year}</span>
                  )}
                </div>
                
                {isEditing ? (
                  <input 
                    value={edu.degree}
                    onChange={(e) => updateItem(index, 'degree', e.target.value)}
                    className="text-gray-600 text-xl font-medium bg-transparent border-b border-emerald-200 focus:outline-none w-full"
                    placeholder="Degree Name"
                  />
                ) : (
                  <p className="text-gray-600 text-xl font-medium">{edu.degree}</p>
                )}
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-2">Academic Qualification</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
