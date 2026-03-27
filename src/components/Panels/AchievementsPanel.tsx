/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, Trophy, Star, Medal, Plus, Trash2, Check, X, Edit2 } from 'lucide-react';
import { Achievement } from '../../types';
import { db, OperationType, handleFirestoreError } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface AchievementsPanelProps {
  achievements: Achievement[];
  uid: string;
  isPresentationMode?: boolean;
}

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ achievements, uid, isPresentationMode = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAchievements, setEditedAchievements] = useState<Achievement[]>(achievements);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, path), {
        achievements: editedAchievements
      });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    setEditedAchievements([...editedAchievements, {
      id: Math.random().toString(36).substr(2, 9),
      title: "New Achievement",
      date: "2024",
      description: "Describe your achievement."
    }]);
  };

  const removeItem = (id: string) => {
    setEditedAchievements(editedAchievements.filter(a => a.id !== id));
  };

  const updateItem = (id: string, field: keyof Achievement, value: string) => {
    setEditedAchievements(editedAchievements.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-gray-600 border border-gray-100 shadow-sm">
            <Award size={24} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Milestones & Achievements</h2>
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
                <button onClick={() => { setIsEditing(false); setEditedAchievements(achievements); }} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
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
        {(isEditing ? editedAchievements : achievements).map((achievement, index) => (
          <div 
            key={achievement.id} 
            className="group p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all relative flex items-center gap-8"
          >
            {isEditing && (
              <button onClick={() => removeItem(achievement.id)} className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 z-10">
                <Trash2 size={14} />
              </button>
            )}
            
            <div className="w-20 h-20 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              {index === 0 ? <Trophy size={40} className="text-amber-500" /> : index === 1 ? <Medal size={40} className="text-blue-500" /> : <Star size={40} className="text-indigo-500" />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                {isEditing ? (
                  <input 
                    value={achievement.title}
                    onChange={(e) => updateItem(achievement.id, 'title', e.target.value)}
                    className="text-2xl font-bold text-gray-900 bg-transparent border-b border-indigo-500 focus:outline-none w-full"
                    placeholder="Achievement Title"
                  />
                ) : (
                  <h3 className="text-2xl font-bold text-gray-900">{achievement.title}</h3>
                )}
                
                {isEditing ? (
                  <input 
                    value={achievement.date}
                    onChange={(e) => updateItem(achievement.id, 'date', e.target.value)}
                    className="px-4 py-1 rounded-full bg-slate-100 text-slate-500 text-sm font-bold bg-transparent border-b border-indigo-500 focus:outline-none ml-4"
                    placeholder="Date"
                  />
                ) : (
                  <span className="px-4 py-1 rounded-full bg-slate-100 text-slate-500 text-sm font-bold">{achievement.date}</span>
                )}
              </div>
              
              {isEditing ? (
                <textarea 
                  value={achievement.description}
                  onChange={(e) => updateItem(achievement.id, 'description', e.target.value)}
                  className="text-gray-600 text-lg leading-relaxed bg-transparent border border-gray-200 rounded-lg p-2 focus:outline-none w-full min-h-[60px]"
                  placeholder="Describe your achievement."
                />
              ) : (
                <p className="text-gray-600 text-lg leading-relaxed">{achievement.description}</p>
              )}
            </div>
          </div>
        ))}
        {isEditing && (
          <button 
            onClick={addItem}
            className="p-8 rounded-3xl border border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-all font-bold flex flex-col items-center justify-center space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Plus size={32} />
            </div>
            <span>Add Achievement</span>
          </button>
        )}
      </div>
    </div>
  );
};
