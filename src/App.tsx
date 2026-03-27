/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Desk } from './components/Desk';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, Github, Twitter, Linkedin, LogOut, Loader2 } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, db, User, OperationType, handleFirestoreError } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { Eye, Edit3, HelpCircle, Palette, Settings, Type as FontIcon, Layers, Check } from 'lucide-react';
import { cn } from './lib/utils';
import { DeskSection, ThemeType, FontType, SurfaceType, UserProfile } from './types';

const DEFAULT_USER: UserProfile = {
  name: "New User",
  about: "Welcome to your new digital desk! Click on objects to explore and edit your profile.",
  role: "Developer",
  skills: [
    { category: "Frontend", items: ["React", "TypeScript"] },
    { category: "Backend", items: ["Node.js"] },
  ],
  projects: [
    { id: "1", title: "My First Project", description: "This is a sample project. You can edit this in the projects panel.", tags: ["Sample"], link: "" },
  ],
  education: [
    { institution: "University of Life", degree: "B.S. in Curiosity", year: "2020 - 2024" },
  ],
  goals: ["Learn something new every day"],
  achievements: [
    { id: "1", title: "Started a Portfolio", date: "Today", description: "Created a personalized interactive portfolio." },
  ],
  timeline: [
    { id: "1", year: "2024", title: "Explorer", company: "The World", description: "Started exploring the digital landscape." },
  ],
  hobbies: ["Coding", "Coffee"],
  contact: {
    email: "",
  },
  theme: 'classic',
  font: 'sans',
  surface: 'solid',
  showLabels: true,
  uid: "",
  iconPositions: {},
  layout: 'custom',
  photoUrl: ""
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [activeSection, setActiveSection] = useState<DeskSection>(null);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);

  const themes: { id: ThemeType; label: string; color: string }[] = [
    { id: 'classic', label: 'Classic', color: 'bg-slate-200' },
    { id: 'dark', label: 'Dark', color: 'bg-zinc-900' },
    { id: 'nature', label: 'Nature', color: 'bg-emerald-900' },
    { id: 'ocean', label: 'Ocean', color: 'bg-sky-900' },
    { id: 'sunset', label: 'Sunset', color: 'bg-orange-900' },
  ];

  const fonts: { id: FontType; label: string }[] = [
    { id: 'sans', label: 'Sans Serif' },
    { id: 'serif', label: 'Serif' },
    { id: 'mono', label: 'Monospace' },
  ];

  const surfaces: { id: SurfaceType; label: string }[] = [
    { id: 'solid', label: 'Solid' },
    { id: 'wood', label: 'Wood Grain' },
    { id: 'marble', label: 'Marble' },
    { id: 'glass', label: 'Glass' },
  ];

  const themeStyles: Record<ThemeType, { bg: string; surface: string; text: string; border: string }> = {
    classic: { bg: 'bg-slate-200', surface: 'bg-slate-50', text: 'text-slate-900', border: 'border-slate-400' },
    dark: { bg: 'bg-zinc-950', surface: 'bg-zinc-900', text: 'text-zinc-100', border: 'border-zinc-800' },
    nature: { bg: 'bg-emerald-950', surface: 'bg-emerald-900', text: 'text-emerald-50', border: 'border-emerald-800' },
    ocean: { bg: 'bg-sky-950', surface: 'bg-sky-900', text: 'text-sky-50', border: 'border-sky-800' },
    sunset: { bg: 'bg-orange-950', surface: 'bg-orange-900', text: 'text-orange-50', border: 'border-orange-800' },
  };

  const currentTheme = themeStyles[profile?.theme || 'classic'];

  const handleUpdatePreference = async (updates: Partial<UserProfile>) => {
    if (!profile || !user) return;
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    const path = `users/${user.uid}`;
    await setDoc(doc(db, path), newProfile).catch(err => handleFirestoreError(err, OperationType.WRITE, path));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setIsAuthReady(true);
      if (!authUser) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    const path = `users/${user.uid}`;
    const unsubscribe = onSnapshot(doc(db, path), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        setProfile({ ...data, theme: data.theme || 'classic' });
      } else {
        // Create initial profile if it doesn't exist
        const initialProfile = { 
          ...DEFAULT_USER, 
          name: user.displayName || "New User",
          contact: { ...DEFAULT_USER.contact, email: user.email || "" },
          uid: user.uid 
        };
        setDoc(doc(db, path), initialProfile).catch(err => handleFirestoreError(err, OperationType.WRITE, path));
        setProfile(initialProfile);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);

  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        setAuthError("The sign-in popup was closed before completion. Please try again and keep the window open.");
      } else if (error.code === 'auth/blocked-at-request-time') {
        setAuthError("The sign-in popup was blocked by your browser. Please allow popups for this site.");
      } else {
        setAuthError("An error occurred during sign-in. Please try again.");
      }
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // In a real app, we'd upload to Firebase Storage. 
    // For this demo, we'll use a FileReader to get a base64 string.
    const reader = new FileReader();
    reader.onloadend = () => {
      handleUpdatePreference({ photoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence mode="wait">
        {!user ? (
            <motion.div 
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-100 to-slate-200"
            >
              <div className="w-full max-w-md p-8 rounded-3xl glass shadow-2xl space-y-8">
                <div className="text-center space-y-2">
                  <h1 className="text-4xl font-black tracking-tighter text-slate-900">MY DIGI PORTFOLIO</h1>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Interactive Portfolio System</p>
                </div>

                <div className="space-y-4">
                  {authError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                      {authError}
                    </div>
                  )}
                  <button 
                    onClick={handleGoogleSignIn}
                    className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    Continue with Google
                  </button>
                </div>

                <div className="flex items-center gap-4 py-4">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Social Links</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <button className="flex items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                    <Github size={20} />
                  </button>
                  <button className="flex items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                    <Linkedin size={20} />
                  </button>
                  <button className="flex items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                    <Twitter size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="desk"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="fixed top-8 left-8 z-[300] pointer-events-none">
                <h1 className={cn("text-2xl font-black tracking-tighter transition-colors duration-700", currentTheme.text)}>MY DIGI PORTFOLIO</h1>
                <p className="text-sm opacity-60 font-medium uppercase tracking-widest">Interactive Portfolio</p>
                
                {/* Photo Upload Section */}
                <div className="mt-4 pointer-events-auto flex flex-col gap-2">
                  <div className="relative group w-20 h-20">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg bg-white/10 backdrop-blur-sm">
                      {profile?.photoUrl ? (
                        <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/40">
                          <UserPlus size={32} />
                        </div>
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      <Edit3 size={20} className="text-white" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="fixed top-8 right-8 z-[300] flex items-center gap-3">
                {/* Theme Selector */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowThemeSelector(!showThemeSelector);
                      setShowCustomize(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full glass font-bold transition-all shadow-md",
                      showThemeSelector ? "bg-white text-indigo-600" : "text-slate-600 hover:bg-white"
                    )}
                  >
                    <Palette size={18} />
                    Theme
                  </button>
                  
                  <AnimatePresence>
                    {showThemeSelector && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 p-3 rounded-2xl glass shadow-2xl border border-white/20 min-w-[160px] space-y-1"
                      >
                        {themes.map(t => (
                          <button
                            key={t.id}
                            onClick={() => {
                              handleUpdatePreference({ theme: t.id });
                              setShowThemeSelector(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-white/40 text-sm font-bold",
                              profile?.theme === t.id ? "bg-white/60 text-slate-900" : "text-slate-600"
                            )}
                          >
                            <div className={cn("w-4 h-4 rounded-full border border-black/10", t.color)} />
                            {t.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Customize Selector */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowCustomize(!showCustomize);
                      setShowThemeSelector(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full glass font-bold transition-all shadow-md",
                      showCustomize ? "bg-white text-indigo-600" : "text-slate-600 hover:bg-white"
                    )}
                  >
                    <Settings size={18} />
                    Customize
                  </button>
                  
                  <AnimatePresence>
                    {showCustomize && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 p-4 rounded-3xl glass shadow-2xl border border-white/20 min-w-[240px] space-y-6"
                      >
                        {/* Font Selection */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                            <FontIcon size={14} />
                            Typography
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            {fonts.map(f => (
                              <button
                                key={f.id}
                                onClick={() => handleUpdatePreference({ font: f.id })}
                                className={cn(
                                  "flex items-center justify-between px-3 py-2 rounded-xl transition-all text-sm font-bold",
                                  profile?.font === f.id ? "bg-white/60 text-slate-900" : "text-slate-600 hover:bg-white/40"
                                )}
                              >
                                {f.label}
                                {profile?.font === f.id && <Check size={14} />}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Surface Selection */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                            <Layers size={14} />
                            Desk Surface
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            {surfaces.map(s => (
                              <button
                                key={s.id}
                                onClick={() => handleUpdatePreference({ surface: s.id })}
                                className={cn(
                                  "flex items-center justify-between px-3 py-2 rounded-xl transition-all text-sm font-bold",
                                  profile?.surface === s.id ? "bg-white/60 text-slate-900" : "text-slate-600 hover:bg-white/40"
                                )}
                              >
                                {s.label}
                                {profile?.surface === s.id && <Check size={14} />}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Layout Selection */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                            <Palette size={14} />
                            Icon Arrangement
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {(['custom', 'roadmap', 'circular', 'grid'] as const).map(l => (
                              <button
                                key={l}
                                onClick={() => handleUpdatePreference({ layout: l })}
                                className={cn(
                                  "flex items-center justify-center px-3 py-2 rounded-xl transition-all text-xs font-bold capitalize",
                                  profile?.layout === l ? "bg-white/60 text-slate-900" : "text-slate-600 hover:bg-white/40"
                                )}
                              >
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Label Toggle Removed as per request to show labels permanently */}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={() => setActiveSection('help')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full glass text-blue-600 font-bold hover:bg-blue-50 transition-all shadow-md border border-blue-100"
                >
                  <HelpCircle size={18} />
                  How to Use
                </button>
                <button 
                  onClick={() => setIsPresentationMode(!isPresentationMode)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full font-black transition-all shadow-xl border-2",
                    isPresentationMode 
                      ? "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white border-white/50 scale-110 shadow-purple-500/20" 
                      : "bg-white/90 text-slate-700 hover:bg-white border-slate-200"
                  )}
                >
                  {isPresentationMode ? <Eye size={18} className="animate-pulse" /> : <Edit3 size={18} />}
                  {isPresentationMode ? "Presentation Mode" : "Edit Mode"}
                </button>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-full glass text-red-600 font-bold hover:bg-red-50 transition-all shadow-md border border-red-100"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
                {profile && (
                  <Desk 
                    user={profile} 
                    isPresentationMode={isPresentationMode} 
                    activeSection={activeSection} 
                    setActiveSection={setActiveSection}
                    theme={profile.theme}
                    onUpdateProfile={handleUpdatePreference}
                  />
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
