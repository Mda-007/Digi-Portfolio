/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Plus, Trash2, Check, X, Edit2 } from 'lucide-react';
import { Skill } from '../../types';
import { db, OperationType, handleFirestoreError } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface SkillsPanelProps {
  skills: Skill[];
  uid: string;
  isPresentationMode?: boolean;
}

export const SkillsPanel: React.FC<SkillsPanelProps> = ({ skills, uid, isPresentationMode = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSkills, setEditedSkills] = useState<Skill[]>(skills);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, path), {
        skills: editedSkills
      });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    setEditedSkills([...editedSkills, { category: "New Category", items: ["Skill"] }]);
  };

  const removeCategory = (index: number) => {
    setEditedSkills(editedSkills.filter((_, i) => i !== index));
  };

  const updateCategoryName = (index: number, name: string) => {
    const newSkills = [...editedSkills];
    newSkills[index].category = name;
    setEditedSkills(newSkills);
  };

  const addItem = (catIndex: number) => {
    const newSkills = [...editedSkills];
    newSkills[catIndex].items.push("New Skill");
    setEditedSkills(newSkills);
  };

  const removeItem = (catIndex: number, itemIndex: number) => {
    const newSkills = [...editedSkills];
    newSkills[catIndex].items = newSkills[catIndex].items.filter((_, i) => i !== itemIndex);
    setEditedSkills(newSkills);
  };

  const updateItem = (catIndex: number, itemIndex: number, value: string) => {
    const newSkills = [...editedSkills];
    newSkills[catIndex].items[itemIndex] = value;
    setEditedSkills(newSkills);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <BookOpen size={24} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Skills & Expertise</h2>
        </div>

        {!isPresentationMode && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button onClick={addCategory} className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                  <Plus size={20} />
                </button>
                <button onClick={handleSave} disabled={saving} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors">
                  <Check size={20} />
                </button>
                <button onClick={() => { setIsEditing(false); setEditedSkills(skills); }} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {(isEditing ? editedSkills : skills).map((skill, catIdx) => (
          <div key={catIdx} className="space-y-4 p-6 rounded-2xl bg-white/50 border border-gray-100 relative">
            {isEditing && (
              <button onClick={() => removeCategory(catIdx)} className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 z-10">
                <Trash2 size={14} />
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {isEditing ? (
                <input 
                  value={skill.category}
                  onChange={(e) => updateCategoryName(catIdx, e.target.value)}
                  className="text-lg font-bold text-gray-800 uppercase tracking-widest bg-transparent border-b border-amber-500 focus:outline-none w-full"
                />
              ) : (
                <h3 className="text-lg font-bold text-gray-800 uppercase tracking-widest">
                  {skill.category}
                </h3>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {skill.items.map((item, itemIdx) => (
                <div 
                  key={itemIdx} 
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all relative group"
                >
                  <CheckCircle2 size={18} className="text-amber-500 shrink-0" />
                  {isEditing ? (
                    <div className="flex items-center gap-1 w-full">
                      <input 
                        value={item}
                        onChange={(e) => updateItem(catIdx, itemIdx, e.target.value)}
                        className="text-gray-700 font-medium bg-transparent focus:outline-none w-full"
                      />
                      <button onClick={() => removeItem(catIdx, itemIdx)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-700 font-medium">{item}</span>
                  )}
                </div>
              ))}
              {isEditing && (
                <button 
                  onClick={() => addItem(catIdx)}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-amber-200 text-amber-600 hover:bg-amber-50 transition-all text-sm font-bold"
                >
                  <Plus size={16} /> Add Skill
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
