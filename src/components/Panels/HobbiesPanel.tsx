/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Headphones, Music, Camera, Code, Coffee, Palette, Plus, Trash2, Check, X, Edit2 } from 'lucide-react';
import { db, OperationType, handleFirestoreError } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface HobbiesPanelProps {
  hobbies: string[];
  uid: string;
  isPresentationMode?: boolean;
}

export const HobbiesPanel: React.FC<HobbiesPanelProps> = ({ hobbies, uid, isPresentationMode = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedHobbies, setEditedHobbies] = useState<string[]>(hobbies);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, path), {
        hobbies: editedHobbies
      });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    setEditedHobbies([...editedHobbies, "New Hobby"]);
  };

  const removeItem = (index: number) => {
    setEditedHobbies(editedHobbies.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, value: string) => {
    const newHobbies = [...editedHobbies];
    newHobbies[index] = value;
    setEditedHobbies(newHobbies);
  };

  const hobbyIcons: Record<string, React.ReactNode> = {
    'Music': <Music size={24} />,
    'Photography': <Camera size={24} />,
    'Coding': <Code size={24} />,
    'Coffee': <Coffee size={24} />,
    'Art': <Palette size={24} />,
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Headphones size={24} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Beyond the Desk</h2>
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
                <button onClick={() => { setIsEditing(false); setEditedHobbies(hobbies); }} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {(isEditing ? editedHobbies : hobbies).map((hobby, index) => (
          <div 
            key={index} 
            className="group p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all relative flex flex-col items-center text-center space-y-4"
          >
            {isEditing && (
              <button onClick={() => removeItem(index)} className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 z-10">
                <Trash2 size={14} />
              </button>
            )}
            
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              {hobbyIcons[hobby] || <Headphones size={24} />}
            </div>
            {isEditing ? (
              <input 
                value={hobby}
                onChange={(e) => updateItem(index, e.target.value)}
                className="text-xl font-bold text-gray-900 bg-transparent border-b border-indigo-500 focus:outline-none w-full text-center"
                placeholder="Hobby Name"
              />
            ) : (
              <h3 className="text-xl font-bold text-gray-900">{hobby}</h3>
            )}
            <p className="text-gray-500 text-sm font-medium">Passion & Interest</p>
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
            <span>Add Hobby</span>
          </button>
        )}
      </div>
    </div>
  );
};
