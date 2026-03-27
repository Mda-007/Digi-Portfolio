/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Clock, Briefcase, Calendar, Plus, Trash2, Check, X, Edit2 } from 'lucide-react';
import { TimelineItem } from '../../types';
import { db, OperationType, handleFirestoreError } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface TimelinePanelProps {
  timeline: TimelineItem[];
  uid: string;
  isPresentationMode?: boolean;
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({ timeline, uid, isPresentationMode = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTimeline, setEditedTimeline] = useState<TimelineItem[]>(timeline);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, path), {
        timeline: editedTimeline
      });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    setEditedTimeline([...editedTimeline, {
      id: Math.random().toString(36).substr(2, 9),
      year: "2024",
      title: "New Role",
      company: "Company Name",
      description: "Describe your responsibilities."
    }]);
  };

  const removeItem = (id: string) => {
    setEditedTimeline(editedTimeline.filter(t => t.id !== id));
  };

  const updateItem = (id: string, field: keyof TimelineItem, value: string) => {
    setEditedTimeline(editedTimeline.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-gray-600 border border-gray-100 shadow-sm">
            <Clock size={24} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Professional Timeline</h2>
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
                <button onClick={() => { setIsEditing(false); setEditedTimeline(timeline); }} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
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

      <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
        {(isEditing ? editedTimeline : timeline).map((item, index) => (
          <div 
            key={item.id} 
            className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}
          >
            {isEditing && (
              <button onClick={() => removeItem(item.id)} className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 z-10">
                <Trash2 size={14} />
              </button>
            )}
            
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-transform group-hover:scale-110">
              <Briefcase size={18} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all relative">
              <div className="flex items-center justify-between space-x-2 mb-1">
                {isEditing ? (
                  <input 
                    value={item.title}
                    onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                    className="font-bold text-slate-900 text-xl bg-transparent border-b border-indigo-500 focus:outline-none w-full"
                    placeholder="Role Title"
                  />
                ) : (
                  <div className="font-bold text-slate-900 text-xl">{item.title}</div>
                )}
                
                {isEditing ? (
                  <input 
                    value={item.year}
                    onChange={(e) => updateItem(item.id, 'year', e.target.value)}
                    className="font-bold text-indigo-500 text-sm bg-transparent border-b border-indigo-500 focus:outline-none ml-4"
                    placeholder="Year"
                  />
                ) : (
                  <time className="font-bold text-indigo-500 text-sm">{item.year}</time>
                )}
              </div>
              
              {isEditing ? (
                <input 
                  value={item.company}
                  onChange={(e) => updateItem(item.id, 'company', e.target.value)}
                  className="text-slate-500 font-bold text-sm mb-4 uppercase tracking-widest bg-transparent border-b border-indigo-200 focus:outline-none w-full"
                  placeholder="Company Name"
                />
              ) : (
                <div className="text-slate-500 font-bold text-sm mb-4 uppercase tracking-widest">{item.company}</div>
              )}
              
              {isEditing ? (
                <textarea 
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  className="text-slate-600 leading-relaxed bg-transparent border border-gray-200 rounded-lg p-2 focus:outline-none w-full min-h-[60px]"
                  placeholder="Describe your role."
                />
              ) : (
                <div className="text-slate-600 leading-relaxed">{item.description}</div>
              )}
            </div>
          </div>
        ))}
        {isEditing && (
          <button 
            onClick={addItem}
            className="relative flex items-center justify-center w-full py-4 rounded-3xl border border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-all font-bold gap-2"
          >
            <Plus size={20} /> Add Timeline Item
          </button>
        )}
      </div>
    </div>
  );
};
