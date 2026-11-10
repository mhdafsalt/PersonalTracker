'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { QuickAddModal } from './QuickAddModal';

export const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#efefee] text-[#0f110f] relative overflow-hidden font-sans">
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
        <main className="flex-1 px-4 sm:px-6 md:px-8 pb-14 max-w-7xl w-full mx-auto">
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
