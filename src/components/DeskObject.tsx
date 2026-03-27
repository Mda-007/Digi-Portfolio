/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { DeskSection } from '@/src/types';

interface DeskObjectProps {
  id: DeskSection;
  icon: React.ReactNode;
  label: string;
  x: number;
  y: number;
  rotation?: number;
  isActive: boolean;
  onClick: (id: DeskSection) => void;
  onDragEnd?: (id: DeskSection, x: number, y: number) => void;
  color?: string;
  showLabels?: boolean;
  dragConstraints?: React.RefObject<Element>;
  zoom?: number;
}

export const DeskObject: React.FC<DeskObjectProps> = ({
  id,
  icon,
  label,
  x,
  y,
  rotation = 0,
  isActive,
  onClick,
  onDragEnd,
  color = 'bg-white',
  showLabels = true,
  dragConstraints,
  zoom = 1
}) => {
  const isDragging = useRef(false);
  const posX = useMotionValue(x);
  const posY = useMotionValue(y);

  // Physics for tilting during drag
  const rotateX = useSpring(0, { stiffness: 300, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 30 });
  const lift = useSpring(0, { stiffness: 400, damping: 40 });

  // Sync motion values with props when not dragging
  useEffect(() => {
    if (!isDragging.current) {
      posX.set(x);
      posY.set(y);
    }
  }, [x, y, posX, posY]);

  const handleDrag = (_: any, info: any) => {
    // Add a slight tilt based on velocity for a "physical" feel
    rotateX.set(info.velocity.y / 100);
    rotateY.set(-info.velocity.x / 100);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={dragConstraints}
      dragElastic={0}
      onTapStart={() => {
        isDragging.current = false;
      }}
      onDragStart={() => {
        isDragging.current = true;
        lift.set(1);
      }}
      onDrag={handleDrag}
      onDragEnd={(_, info) => {
        lift.set(0);
        rotateX.set(0);
        rotateY.set(0);

        if (!dragConstraints?.current) return;
        
        const rect = dragConstraints.current.getBoundingClientRect();
        
        // Pixel-perfect coordinate calculation using absolute point
        // Subtracting half-width (approx 80px) to center the drop
        const newX = (info.point.x - rect.left) / zoom - 80;
        const newY = (info.point.y - rect.top) / zoom - 80;

        // Clamp to desk boundaries with safety margin
        const clampedX = Math.max(40, Math.min(1800, newX));
        const clampedY = Math.max(40, Math.min(1300, newY));

        posX.set(clampedX);
        posY.set(clampedY);

        // Block tap event briefly
        setTimeout(() => {
          isDragging.current = false;
        }, 150);
        
        if (onDragEnd) {
          onDragEnd(id, clampedX, clampedY);
        }
      }}
      style={{
        left: posX,
        top: posY,
        rotate: rotation,
        rotateX,
        rotateY,
        perspective: 1000,
        x: 0,
        y: 0,
      }}
      animate={{
        scale: isActive ? 1.1 : 1,
        zIndex: isActive ? 50 : 1,
      }}
      whileDrag={{ 
        scale: 1.2,
        zIndex: 100,
      }}
      transition={{ 
        type: 'spring', 
        damping: 25, 
        stiffness: 200,
      }}
      className={cn(
        "desk-object absolute w-40 h-40 flex flex-col items-center justify-center rounded-3xl shadow-xl border border-white/40 group cursor-grab active:cursor-grabbing transition-colors duration-300",
        color,
        isActive ? "ring-4 ring-blue-500/50" : "hover:scale-105"
      )}
      onTap={(e) => {
        if (isDragging.current) return;
        e.stopPropagation();
        onClick(id);
      }}
    >
      {/* Ghost shadow that stays "on the desk" during drag */}
      <motion.div 
        className="absolute inset-0 bg-black/10 rounded-3xl blur-md -z-10"
        style={{ scale: useTransform(lift, [0, 1], [1, 0.8]), opacity: lift }}
      />

      <div className="text-slate-800 mb-2 pointer-events-none drop-shadow-md scale-125">
        {icon}
      </div>
      {showLabels && (
        <span className="px-3 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[11px] font-black uppercase tracking-[0.15em] text-slate-950 shadow-md border border-white/60 whitespace-nowrap pointer-events-none">
          {label}
        </span>
      )}
      
      {/* Physical details - subtle highlights */}
      <div className="absolute inset-0 border-t border-white/40 rounded-3xl pointer-events-none" />
      <div className="absolute inset-0 border-b border-black/10 rounded-3xl pointer-events-none" />
      
      {/* Drop Pulse Effect */}
      <motion.div 
        className="absolute inset-0 rounded-3xl border-4 border-blue-400/0 pointer-events-none"
        animate={isDragging.current ? { scale: 1, opacity: 0 } : { scale: [1, 1.2], opacity: [0, 0.5, 0] }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
};
