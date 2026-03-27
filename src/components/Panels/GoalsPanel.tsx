/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StickyNote, Target, Flag, Rocket, Plus, Trash2, Check, X, Edit2 } from 'lucide-react';
import { db, OperationType, handleFirestoreError } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface GoalsPanelProps {
  goals: string[];
  uid: string;
  isPresentationMode?: boolean;
}

export const GoalsPanel: React.FC<GoalsPanelProps> = ({ goals, uid, isPresentationMode = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoals, setEditedGoals] = useState<string[]>(goals);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, path), {
        goals: editedGoals
      });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    setEditedGoals([...editedGoals, "New Goal"]);
  };

  const removeItem = (index: number) => {
    setEditedGoals(editedGoals.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, value: string) => {
    const newGoals = [...editedGoals];
    newGoals[index] = value;
    setEditedGoals(newGoals);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
            <StickyNote size={24} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Future Aspirations</h2>
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
                <button onClick={() => { setIsEditing(false); setEditedGoals(goals); }} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(isEditing ? editedGoals : goals).map((goal, index) => (
          <div 
            key={index} 
            className="group p-8 rounded-3xl bg-yellow-50 border border-yellow-100 shadow-sm hover:shadow-md transition-all relative flex flex-col items-center text-center space-y-4"
          >
            {isEditing && (
              <button onClick={() => removeItem(index)} className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 z-10">
                <Trash2 size={14} />
              </button>
            )}
            
            <div className="w-16 h-16 rounded-2xl bg-yellow-100 text-yellow-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              {index === 0 ? <Target size={32} /> : index === 1 ? <Rocket size={32} /> : <Flag size={32} />}
            </div>
            {isEditing ? (
              <textarea 
                value={goal}
                onChange={(e) => updateItem(index, e.target.value)}
                className="text-xl font-bold text-gray-900 bg-transparent border-b border-yellow-500 focus:outline-none w-full text-center min-h-[60px]"
                placeholder="Your goal..."
              />
            ) : (
              <h3 className="text-xl font-bold text-gray-900">{goal}</h3>
            )}
            <p className="text-yellow-600 text-sm font-medium uppercase tracking-widest">Goal & Objective</p>
          </div>
        ))}
        {isEditing && (
          <button 
            onClick={addItem}
            className="p-8 rounded-3xl border border-dashed border-yellow-200 text-yellow-600 hover:bg-yellow-50 transition-all font-bold flex flex-col items-center justify-center space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center">
              <Plus size={32} />
            </div>
            <span>Add Goal</span>
          </button>
        )}
      </div>
    </div>
  );
};
