'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { QuickAddModal } from './QuickAddModal';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileMenuDrawer } from './MobileMenuDrawer';

export const AppLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsQuickAddOpen(true);
    window.addEventListener('pt-open-quickadd', handler);
    return () => window.removeEventListener('pt-open-quickadd', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#121316] lg:bg-[#F7F5F0] text-[#E0E2E8] lg:text-[#252923] transition-colors">
      {/* Desktop Sidebar */}
      <Sidebar isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        {/* Desktop Navbar (hidden on mobile, mobile has native header) */}
        <div className="hidden lg:block">
          <Navbar
            onOpenMobile={() => setIsMobileMenuOpen(true)}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          />
        </div>

        {/* Page Content with safe mobile padding for bottom dock */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-28 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Floating Bottom Dock */}
      <MobileBottomNav
        onOpenMenu={() => setIsMobileMenuOpen(true)}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      {/* Mobile Slide-up Menu Drawer with all 18 modules */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </div>
  );
};
