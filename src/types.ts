/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type JobRole = 'Developer' | 'Designer' | 'Student' | 'Manager' | 'Artist';

export interface Project {
  id: string;
  title: string;
  description: string;
  link?: string;
  tags: string[];
}

export interface Skill {
  category: string;
  items: string[];
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
}

export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  company: string;
  description: string;
}

export type ThemeType = 'classic' | 'dark' | 'nature' | 'ocean' | 'sunset';
export type FontType = 'sans' | 'serif' | 'mono';
export type SurfaceType = 'solid' | 'wood' | 'marble' | 'glass';

export type DeskLayout = 'custom' | 'roadmap' | 'circular' | 'grid';

export interface UserProfile {
  name: string;
  about: string;
  role: JobRole;
  skills: Skill[];
  projects: Project[];
  education: Education[];
  goals: string[];
  achievements: Achievement[];
  timeline: TimelineItem[];
  hobbies: string[];
  contact: {
    email: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  theme?: ThemeType;
  font?: FontType;
  surface?: SurfaceType;
  showLabels?: boolean;
  uid: string;
  iconPositions?: Record<string, { x: number; y: number }>;
  layout?: DeskLayout;
  photoUrl?: string;
}

export type DeskSection = 
  | 'laptop' 
  | 'notebook' 
  | 'coffee' 
  | 'phone' 
  | 'headphones' 
  | 'sticky-notes' 
  | 'photo-frame' 
  | 'books' 
  | 'clock'
  | 'hr'
  | 'help'
  | null;
