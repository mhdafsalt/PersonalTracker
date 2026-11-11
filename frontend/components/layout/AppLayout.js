'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { QuickAddModal } from './QuickAddModal';

export const AppLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  useEffect(() => {
    // If authentication check has completed and no active user session exists, redirect to login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // While checking auth token, show a clean, elegant loading indicator
  if (loading) {
    return (
      <div className="min-h-screen bg-[#efefee] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0f110f] text-white flex items-center justify-center font-bold text-sm shadow-md animate-pulse">
            PT
          </div>
          <p className="text-xs font-mono text-[#6b6b68] uppercase tracking-widest animate-pulse">
            Synchronizing Personal Tracker...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, prevent child components from firing unauthenticated requests
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#efefee] text-[#0f110f] relative overflow-x-hidden font-sans">
      {/* Mira Ambient Glowing Blobs */}
      <div className="mira-blob-lime" aria-hidden="true" />
      <div className="mira-blob-grey" aria-hidden="true" />

      {/* Slide-over Drawer for All 18 Modules */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Centered Content Canvas */}
      <div className="flex flex-col min-h-screen transition-all duration-300 relative z-10">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        />
        <main className="flex-1 w-[95vw] max-w-[95vw] mx-auto pb-14">
          {children}
        </main>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </div>
  );
};
