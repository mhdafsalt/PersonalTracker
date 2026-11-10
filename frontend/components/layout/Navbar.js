'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const Navbar = ({ onToggleSidebar, onOpenQuickAdd }) => {
  const { user } = useAuth();
  const pathname = usePathname();

  const [unreadCount, setUnreadCount] = useState(0);
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const now = new Date();
    setCurrentDateStr(
      now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).toUpperCase()
    );

    api.get('/notifications')
      .then((res) => {
        if (res.success && res.data) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { name: 'Dashboard', href: '/' },
    { name: 'Habits', href: '/habits' },
    { name: 'Expenses', href: '/expenses' },
    { name: 'Productivity', href: '/productivity' },
    { name: 'Travel', href: '/travel' },
    { name: 'Orbit', href: '/orbit' },
  ];

  const isLinkActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-3 sm:top-4 z-40 w-full px-3 sm:px-6 mb-5 pointer-events-none">
      <div className="pointer-events-auto max-w-7xl mx-auto h-[62px] flex items-center justify-between px-3 sm:px-5 mira-glass-pill border border-white/80 shadow-[0_12px_32px_rgba(15,17,15,0.06)]">

        {/* LEFT: Brand / Kicker */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#0f110f] text-[#d7f43a] flex items-center justify-center font-mono font-bold text-xs tracking-tight shadow-sm transition-transform group-hover:scale-105">
              PT
            </div>
            <div className="hidden sm:block">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6b6b68] block">
                {currentDateStr || 'PERSONAL TRACKER'}
              </span>
              <span className="text-xs font-semibold text-[#0f110f] tracking-tight">
                Personal Tracker
              </span>
            </div>
          </Link>
        </div>

        {/* CENTER: Floating Pill Tabs (Mira style) */}
        <nav className="hidden md:flex items-center bg-[#0f110f]/[0.04] p-1 rounded-full border border-black/[0.02]">
          {navLinks.map((tab) => {
            const active = isLinkActive(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 select-none ${
                  active
                    ? 'bg-[#0f110f] text-white shadow-sm'
                    : 'text-[#4a4a47] hover:text-[#0f110f] hover:bg-white/50'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: Quick Add, Notifications, 3-Line Hamburger Menu, Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">

          {/* Quick Add Pill */}
          <button
            onClick={onOpenQuickAdd}
            aria-label="Quick add"
            className="flex items-center gap-1.5 h-9 px-3.5 sm:px-4 rounded-full bg-[#0f110f] text-white hover:bg-[#252923] active:scale-95 transition-all text-xs font-medium shadow-sm"
          >
            <Plus size={15} strokeWidth={2.4} className="text-[#d7f43a]" />
            <span className="hidden sm:inline">Add</span>
          </button>

          {/* 1. Notifications Pill */}
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/70 hover:bg-white text-[#0f110f] border border-[#e8e8e5] transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <Bell size={16} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff8a4a] ring-2 ring-white" />
            )}
          </Link>

          {/* 2. 3-LINE HAMBURGER MENU BUTTON (BETWEEN NOTIFICATION ICON & PROFILE) */}
          <button
            onClick={onToggleSidebar}
            aria-label="Open sidebar menu"
            title="All Modules & Navigation"
            className="w-9 h-9 flex flex-col items-center justify-center gap-[3.5px] rounded-full bg-white/70 hover:bg-white text-[#0f110f] border border-[#e8e8e5] transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <span className="w-3.5 h-[1.8px] bg-[#0f110f] rounded-full transition-all" />
            <span className="w-3.5 h-[1.8px] bg-[#0f110f] rounded-full transition-all" />
            <span className="w-3.5 h-[1.8px] bg-[#0f110f] rounded-full transition-all" />
          </button>

          {/* 3. Profile Pill */}
          <Link
            href="/settings"
            aria-label="User settings"
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-white/70 hover:bg-white border border-[#e8e8e5] transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-[#0f110f] text-white font-mono font-medium text-xs">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <span className="hidden xl:inline text-xs font-medium text-[#0f110f] max-w-[80px] truncate">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
          </Link>

        </div>

      </div>
    </header>
  );
};
