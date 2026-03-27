/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Laptop, 
  BookOpen, 
  Coffee, 
  Smartphone, 
  Headphones, 
  StickyNote, 
  Image as ImageIcon, 
  Library, 
  Clock,
  Briefcase,
  X,
  RotateCcw
} from 'lucide-react';
import { DeskObject } from './DeskObject';
import { DeskSection, UserProfile } from '../types';
import { cn } from '../lib/utils';

// Panel components (will be created next)
import { ProjectsPanel } from './Panels/ProjectsPanel';
import { SkillsPanel } from './Panels/SkillsPanel';
import { AboutPanel } from './Panels/AboutPanel';
import { ContactPanel } from './Panels/ContactPanel';
import { HobbiesPanel } from './Panels/HobbiesPanel';
import { GoalsPanel } from './Panels/GoalsPanel';
import { AchievementsPanel } from './Panels/AchievementsPanel';
import { EducationPanel } from './Panels/EducationPanel';
import { TimelinePanel } from './Panels/TimelinePanel';
import { HRPanel } from './Panels/HRPanel';
import { HelpPanel } from './Panels/HelpPanel';
import { HelpCircle, Palette } from 'lucide-react';
import { ThemeType } from '../types';

interface DeskProps {
  user: UserProfile;
  isPresentationMode?: boolean;
  activeSection?: DeskSection;
  setActiveSection?: (section: DeskSection) => void;
  theme?: ThemeType;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
}

export const Desk: React.FC<DeskProps> = ({ 
  user, 
  isPresentationMode = false, 
  activeSection: externalActiveSection, 
  setActiveSection: setExternalActiveSection,
  theme = 'classic',
  onUpdateProfile
}) => {
  const [internalActiveSection, setInternalActiveSection] = useState<DeskSection>(null);
  
  const activeSection = externalActiveSection !== undefined ? externalActiveSection : internalActiveSection;
  const setActiveSection = setExternalActiveSection !== undefined ? setExternalActiveSection : setInternalActiveSection;

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const deskRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);

  // Psychologically accurate roadmap for HR:
  // 1. About Me (Who?) -> 2. Skills (What?) -> 3. Projects (Proof) -> 4. Timeline (Where?) -> 5. HR View (Summary)
  const defaultObjects = [
    { id: 'coffee' as DeskSection, icon: <Coffee size={32} />, label: 'About Me', x: 600, y: 750, color: 'bg-white', rotation: 5 },
    { id: 'notebook' as DeskSection, icon: <BookOpen size={40} />, label: 'Skills', x: 850, y: 700, color: 'bg-amber-50', rotation: -10 },
    { id: 'laptop' as DeskSection, icon: <Laptop size={48} />, label: 'Projects', x: 1100, y: 750, color: 'bg-slate-100', rotation: 0 },
    { id: 'clock' as DeskSection, icon: <Clock size={32} />, label: 'Timeline', x: 1350, y: 700, color: 'bg-white', rotation: 10 },
    { id: 'books' as DeskSection, icon: <Library size={48} />, label: 'Education', x: 1550, y: 750, color: 'bg-emerald-50', rotation: 0 },
    { id: 'headphones' as DeskSection, icon: <Headphones size={40} />, label: 'Hobbies', x: 650, y: 1000, color: 'bg-indigo-50', rotation: -20 },
    { id: 'photo-frame' as DeskSection, icon: <ImageIcon size={40} />, label: 'Journey', x: 800, y: 500, color: 'bg-white', rotation: -5 },
    { id: 'sticky-notes' as DeskSection, icon: <StickyNote size={32} />, label: 'Goals', x: 1400, y: 500, color: 'bg-yellow-100', rotation: 5 },
    { id: 'phone' as DeskSection, icon: <Smartphone size={32} />, label: 'Contact', x: 1500, y: 1000, color: 'bg-zinc-800 text-white', rotation: 15 },
    { id: 'hr' as DeskSection, icon: <Briefcase size={32} />, label: 'HR View', x: 1100, y: 1050, color: 'bg-indigo-600 text-white', rotation: 0 },
    { id: 'help' as DeskSection, icon: <HelpCircle size={32} />, label: 'Help', x: 1700, y: 1100, color: 'bg-blue-500 text-white', rotation: -8 },
  ];

  const getLayoutPositions = (layout: string) => {
    const centerX = 1000;
    const centerY = 750;
    const spacing = 300;

    switch (layout) {
      case 'roadmap':
        return defaultObjects.reduce((acc, obj, i) => {
          acc[obj.id] = {
            x: 400 + (i * 250),
            y: 750 + Math.sin(i * 0.8) * 200
          };
          return acc;
        }, {} as any);
      case 'circular':
        return defaultObjects.reduce((acc, obj, i) => {
          const angle = (i / defaultObjects.length) * Math.PI * 2;
          acc[obj.id] = {
            x: centerX + Math.cos(angle) * 500,
            y: centerY + Math.sin(angle) * 400
          };
          return acc;
        }, {} as any);
      case 'grid':
        return defaultObjects.reduce((acc, obj, i) => {
          const cols = 4;
          acc[obj.id] = {
            x: 500 + (i % cols) * 350,
            y: 500 + Math.floor(i / cols) * 300
          };
          return acc;
        }, {} as any);
      default:
        return user.iconPositions || {};
    }
  };

  const layoutPositions = getLayoutPositions(user.layout || 'custom');

  const objects = defaultObjects.map(obj => {
    const pos = layoutPositions[obj.id as string];
    return pos ? { ...obj, x: pos.x, y: pos.y } : obj;
  });

  const handleDragEnd = (id: DeskSection, x: number, y: number) => {
    // Clamp to desk-surface boundaries (2000x1500)
    const margin = 120;
    const clampedX = Math.max(margin, Math.min(2000 - margin, x));
    const clampedY = Math.max(margin, Math.min(1500 - margin, y));

    if (onUpdateProfile && id) {
      const newPositions = {
        ...(user.iconPositions || {}),
        [id as string]: { x: clampedX, y: clampedY }
      };
      
      // If user moves an icon, we switch to custom layout so the position persists
      onUpdateProfile({ 
        iconPositions: newPositions,
        layout: 'custom'
      });
    }
  };

  const themeStyles = {
    classic: { bg: 'bg-slate-200', surface: 'bg-slate-50', text: 'text-slate-900', border: 'border-slate-400' },
    dark: { bg: 'bg-zinc-950', surface: 'bg-zinc-900', text: 'text-zinc-100', border: 'border-zinc-800' },
    nature: { bg: 'bg-emerald-950', surface: 'bg-emerald-900', text: 'text-emerald-50', border: 'border-emerald-800' },
    ocean: { bg: 'bg-sky-950', surface: 'bg-sky-900', text: 'text-sky-50', border: 'border-sky-800' },
    sunset: { bg: 'bg-orange-950', surface: 'bg-orange-900', text: 'text-orange-50', border: 'border-orange-800' },
  };

  const surfaceStyles = {
    solid: '',
    wood: 'bg-[url("https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop")] bg-cover bg-center opacity-100 brightness-90 contrast-110',
    marble: 'bg-[url("https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=2070&auto=format&fit=crop")] bg-cover bg-center opacity-100 brightness-105',
    glass: 'backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl',
  };

  const fontStyles = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  };

  const currentTheme = themeStyles[theme || 'classic'];
  const currentFont = fontStyles[user.font || 'sans'];
  const currentSurface = surfaceStyles[user.surface || 'solid'];
  const showLabels = user.showLabels ?? true;

  const RoadmapPath = ({ objects }: { objects: any[] }) => {
    if (user.layout !== 'roadmap' || objects.length < 2) return null;
    
    // Sort by X to create a logical flow
    const sorted = [...objects].sort((a, b) => a.x - b.x);
    let d = `M ${sorted[0].x + 75} ${sorted[0].y + 75}`;
    
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i-1];
      const curr = sorted[i];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) / 2;
      const cp2y = curr.y;
      d += ` C ${cp1x + 75} ${cp1y + 75}, ${cp2x + 75} ${cp2y + 75}, ${curr.x + 75} ${curr.y + 75}`;
    }

    return (
      <svg className={cn("absolute inset-0 pointer-events-none overflow-visible z-0 transition-colors duration-700", currentTheme.text)} style={{ width: 2000, height: 1500 }}>
        <motion.path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray="20 20"
          className="opacity-40"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>
    );
  };

  const handleObjectClick = (id: DeskSection) => {
    const obj = objects.find(o => o.id === id);
    if (obj) {
      setActiveSection(id);
      const centerX = 1000;
      const centerY = 750;
      setOffset({
        x: (centerX - obj.x),
        y: (centerY - obj.y)
      });
      setZoom(2.5);
    }
  };

  useEffect(() => {
    if (externalActiveSection) {
      handleObjectClick(externalActiveSection);
    } else if (externalActiveSection === null) {
      resetView();
    }
  }, [externalActiveSection]);

  const resetView = () => {
    setActiveSection(null);
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  };

  const renderPanel = () => {
    if (!activeSection) return null;

    const panels: Record<string, React.ReactNode> = {
      'laptop': <ProjectsPanel projects={user.projects} uid={user.uid} isPresentationMode={isPresentationMode} />,
      'notebook': <SkillsPanel skills={user.skills} uid={user.uid} isPresentationMode={isPresentationMode} />,
      'coffee': <AboutPanel about={user.about} name={user.name} role={user.role} uid={user.uid} isPresentationMode={isPresentationMode} />,
      'phone': <ContactPanel contact={user.contact} uid={user.uid} isPresentationMode={isPresentationMode} />,
      'headphones': <HobbiesPanel hobbies={user.hobbies} uid={user.uid} isPresentationMode={isPresentationMode} />,
      'sticky-notes': <GoalsPanel goals={user.goals} uid={user.uid} isPresentationMode={isPresentationMode} />,
      'photo-frame': <AchievementsPanel achievements={user.achievements} uid={user.uid} isPresentationMode={isPresentationMode} />,
      'books': <EducationPanel education={user.education} uid={user.uid} isPresentationMode={isPresentationMode} />,
      'clock': <TimelinePanel timeline={user.timeline} uid={user.uid} isPresentationMode={isPresentationMode} />,
      'hr': <HRPanel user={user} />,
      'help': <HelpPanel />,
    };

    return (
      <motion.div 
        className="panel-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={resetView}
      >
        <motion.div 
          className="panel-content glass"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={resetView}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <X size={24} />
          </button>
          {panels[activeSection]}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className={cn("desk-container transition-colors duration-700", currentTheme.bg, currentFont)} onClick={resetView}>
      {/* Background Grid for depth */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }} 
      />

      <motion.div 
        className="desk-surface"
        ref={surfaceRef}
        animate={{
          scale: zoom,
          x: offset.x * zoom,
          y: offset.y * zoom,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 150, mass: 0.8 }}
      >
        {/* Desk Surface Texture */}
        <div className={cn("absolute inset-0 rounded-[40px] border-[32px] shadow-[inset_0_0_80px_rgba(0,0,0,0.4)] transition-colors duration-700 overflow-hidden", currentTheme.surface, currentTheme.border)}>
          <div className={cn("absolute inset-0 pointer-events-none transition-all duration-700", currentSurface)} />
          {/* Edge Highlight */}
          <div className="absolute inset-0 border-8 border-white/20 rounded-[12px] pointer-events-none" />
          <div className="absolute inset-0 border-8 border-black/10 rounded-[12px] pointer-events-none translate-x-1 translate-y-1" />
          {/* Visual Boundary Border */}
          <div className="absolute inset-4 border-2 border-dashed border-white/10 rounded-[32px] pointer-events-none" />
        </div>
        <RoadmapPath objects={objects} />
        {objects.map((obj) => (
          <DeskObject
            key={obj.id}
            {...obj}
            isActive={activeSection === obj.id}
            onClick={handleObjectClick}
            onDragEnd={handleDragEnd}
            showLabels={showLabels}
            dragConstraints={surfaceRef}
            zoom={zoom}
          />
        ))}
      </motion.div>

      {/* UI Overlay */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-[200]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetView}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-full glass font-medium transition-all shadow-lg pointer-events-auto",
            activeSection ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <RotateCcw size={18} />
          Reset View
        </motion.button>
      </div>

      <AnimatePresence>
        {renderPanel()}
      </AnimatePresence>
    </div>
  );
};
