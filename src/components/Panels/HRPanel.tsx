/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Briefcase, Target, Zap, Heart, ShieldCheck, Sparkles, Star, Award } from 'lucide-react';
import { UserProfile } from '../../types';

interface HRPanelProps {
  user: UserProfile;
}

export const HRPanel: React.FC<HRPanelProps> = ({ user }) => {
  const highlights = [
    { icon: <Target className="text-blue-500" />, title: "Goal Oriented", desc: "Focused on delivering measurable results." },
    { icon: <Zap className="text-amber-500" />, title: "Quick Learner", desc: "Adaptable to new technologies." },
    { icon: <ShieldCheck className="text-emerald-500" />, title: "Reliable", desc: "Consistent performance and ethics." },
    { icon: <Sparkles className="text-purple-500" />, title: "Creative", desc: "Innovative problem solver." },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block p-2 rounded-xl bg-indigo-50 text-indigo-600 mb-2"
        >
          <Briefcase size={24} />
        </motion.div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Why Hire Me?</h2>
        <p className="text-gray-600 max-w-xl mx-auto leading-relaxed text-sm">
          A quick overview of my professional value proposition.
        </p>
      </div>

      {/* Core Strengths Grid */}
      <div className="grid grid-cols-2 gap-4">
        {highlights.map((item, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
            <p className="text-gray-500 leading-tight text-xs">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats / Summary Section */}
      <div className="p-6 rounded-3xl bg-indigo-600 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={60} />
        </div>
        
        <div className="relative z-10 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-black">{user.skills.length}+</div>
            <div className="text-indigo-100 font-bold uppercase tracking-widest text-[10px]">Skills</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black">{user.projects.length}+</div>
            <div className="text-indigo-100 font-bold uppercase tracking-widest text-[10px]">Projects</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black">{user.achievements.length}+</div>
            <div className="text-indigo-100 font-bold uppercase tracking-widest text-[10px]">Milestones</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Ready to build something great?</h3>
        <div className="flex justify-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
            <Star size={14} className="text-amber-500" />
            Passionate
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
            <Heart size={14} className="text-red-500" />
            Dedicated
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
            <Award size={14} className="text-indigo-500" />
            Excellence
          </div>
        </div>
      </div>
    </div>
  );
};
