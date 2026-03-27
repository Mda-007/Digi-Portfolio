/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Linkedin, Github, Twitter, Send, Check, X, Edit2 } from 'lucide-react';
import { UserProfile } from '../../types';
import { db, OperationType, handleFirestoreError } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface ContactPanelProps {
  contact: UserProfile['contact'];
  uid: string;
  isPresentationMode?: boolean;
}

export const ContactPanel: React.FC<ContactPanelProps> = ({ contact, uid, isPresentationMode = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState(contact);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, path), {
        contact: editedContact
      });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof UserProfile['contact'], value: string) => {
    setEditedContact({ ...editedContact, [field]: value });
  };

  const contactItems = [
    { icon: <Mail size={24} />, label: 'Email', value: (isEditing ? editedContact.email : contact.email), link: `mailto:${contact.email}`, field: 'email' as const, color: 'bg-blue-50 text-blue-600' },
    { icon: <Linkedin size={24} />, label: 'LinkedIn', value: 'Connect on LinkedIn', link: (isEditing ? editedContact.linkedin : contact.linkedin), field: 'linkedin' as const, color: 'bg-indigo-50 text-indigo-600' },
    { icon: <Github size={24} />, label: 'GitHub', value: 'Follow on GitHub', link: (isEditing ? editedContact.github : contact.github), field: 'github' as const, color: 'bg-slate-50 text-slate-600' },
    { icon: <Twitter size={24} />, label: 'Twitter', value: 'Follow on Twitter', link: (isEditing ? editedContact.twitter : contact.twitter), field: 'twitter' as const, color: 'bg-sky-50 text-sky-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
            <Send size={24} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Let's Connect</h2>
        </div>

        {!isPresentationMode && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors">
                  <Check size={20} />
                </button>
                <button onClick={() => { setIsEditing(false); setEditedContact(contact); }} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
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
        {contactItems.map((item) => (
          <div 
            key={item.label} 
            className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-6 relative"
          >
            <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{item.label}</h3>
              {isEditing ? (
                <input 
                  value={item.link || ''}
                  onChange={(e) => updateField(item.field, e.target.value)}
                  className="text-gray-500 text-sm font-medium bg-transparent border-b border-zinc-500 focus:outline-none w-full"
                  placeholder={`Your ${item.label} URL`}
                />
              ) : (
                <p className="text-gray-500 text-sm font-medium truncate">{item.link || 'Not provided'}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 p-8 rounded-3xl bg-zinc-900 text-white flex flex-col items-center text-center space-y-4">
        <h3 className="text-2xl font-bold">Ready to start a project?</h3>
        <p className="text-zinc-400 max-w-md">
          I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.
        </p>
        <a 
          href={`mailto:${contact.email}`}
          className="px-8 py-3 rounded-full bg-white text-zinc-900 font-bold hover:bg-zinc-200 transition-colors"
        >
          Get in Touch
        </a>
      </div>
    </div>
  );
};
