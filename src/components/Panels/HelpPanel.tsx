/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, MousePointer2, ZoomIn, Edit3, Eye, LogOut, Info } from 'lucide-react';
import { motion } from 'motion/react';

export const HelpPanel: React.FC = () => {
  const steps = [
    {
      icon: <MousePointer2 className="text-blue-500" />,
      title: "Explore",
      desc: "Click objects to zoom in."
    },
    {
      icon: <ZoomIn className="text-amber-500" />,
      title: "Zoom",
      desc: "Camera focuses automatically."
    },
    {
      icon: <Edit3 className="text-indigo-500" />,
      title: "Edit",
      desc: "Toggle 'Edit Mode' to customize."
    },
    {
      icon: <Eye className="text-emerald-500" />,
      title: "Present",
      desc: "Clean view for recruiters."
    },
    {
      icon: <Info className="text-purple-500" />,
      title: "HR View",
      desc: "Specialized professional summary."
    }
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-4">
      <div className="text-center space-y-2">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block p-2 rounded-xl bg-slate-100 text-slate-600 mb-2"
        >
          <HelpCircle size={24} />
        </motion.div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">How to Use</h2>
        <p className="text-gray-600 max-w-xl mx-auto leading-relaxed text-sm">
          A quick guide to navigate your digital workspace.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
              {step.icon}
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-gray-900">{step.title}</h3>
              <p className="text-gray-500 leading-tight text-[11px]">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 text-white text-center space-y-2">
        <h3 className="text-lg font-bold">Pro Tip</h3>
        <p className="text-slate-400 text-xs">
          Use your mouse wheel to zoom manually in a new tab!
        </p>
      </div>
    </div>
  );
};
