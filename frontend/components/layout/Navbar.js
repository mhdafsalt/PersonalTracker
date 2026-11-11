'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ArrowRight,
  CheckSquare,
  Wallet,
  Clock,
  Dumbbell,
  GraduationCap,
  BookOpen,
  Timer,
  Target,
  Compass,
  Users2,
  Briefcase,
  Ticket,
  BarChart3,
  Calendar,
  Settings,
  Bell,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const Navbar = ({ onToggleSidebar, onOpenQuickAdd }) => {
  const { user } = useAuth();
  const pathname = usePathname();

  const [unreadCount, setUnreadCount] = useState(0);
  const [isModulesOpen, setIsModulesOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    api.get('/notifications')
      .then((res) => {
        if (res.success && res.data) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsModulesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsModulesOpen(false);
  }, [pathname]);

  const modulesList = [
    { name: 'Habit Tracker', href: '/habits', icon: CheckSquare, desc: 'Streaks & daily rituals' },
    { name: 'Expense Tracker', href: '/expenses', icon: Wallet, desc: 'Finances & savings goals' },
    { name: 'Productivity', href: '/productivity', icon: Clock, desc: 'Tasks & Pomodoro timer' },
    { name: 'Fitness Tracker', href: '/fitness', icon: Dumbbell, desc: 'Workouts & health vitals' },
    { name: 'Study Tracker', href: '/study', icon: GraduationCap, desc: 'Course hours & exams' },
    { name: 'Reading Tracker', href: '/reading', icon: BookOpen, desc: 'Bookshelf & page goals' },
    { name: 'Time Tracker', href: '/time', icon: Timer, desc: 'Live stopwatch & billing' },
    { name: 'Goal Tracker', href: '/goals', icon: Target, desc: 'Short & long-term targets' },
    { name: 'Travel Planner', href: '/travel', icon: Compass, desc: 'Trips & packing checklist' },
    { name: 'Orbit & Calls', href: '/orbit', icon: Users2, desc: 'VIP contacts & follow-ups' },
    { name: 'Design Studio', href: '/graphic-design', icon: Briefcase, desc: 'Client projects & billing' },
    { name: 'Programs & Events', href: '/events', icon: Ticket, desc: 'Workshops & meetups' },
  ];

  return (
    <header className="sticky top-2 sm:top-5 z-40 w-full mb-4 sm:mb-6 pointer-events-none flex justify-center">
      <div className="pointer-events-auto w-[95vw] max-w-[95vw] mx-auto flex items-center justify-between gap-2 sm:gap-3">

        {/* ================= LEFT: BRAND LOGO (NEVER WRAPS ON MOBILE) ================= */}
        <Link
          href="/"
          className="flex items-center gap-1.5 sm:gap-2.5 group select-none py-1 shrink-0"
        >
          {/* Dual Slanted Bars + Coral Dot Mark */}
          <svg
            viewBox="0 0 22 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[18px] h-[15px] sm:w-[22px] sm:h-[18px] shrink-0 transition-transform group-hover:scale-105"
          >
            {/* Slash 1 */}
            <line
              x1="3.8"
              y1="15.5"
              x2="8.2"
              y2="2.5"
              stroke="#000000"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
            {/* Slash 2 */}
            <line
              x1="10.8"
              y1="15.5"
              x2="15.2"
              y2="2.5"
              stroke="#000000"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
            {/* Coral Accent Dot */}
            <rect
              x="15.2"
              y="12"
              width="4.2"
              height="4.2"
              rx="1.2"
              fill="#FF533D"
            />
          </svg>

          {/* Brand Name - Responsive & Single-line Guaranteed */}
          <span className="font-bold text-[14px] sm:text-[17px] md:text-[19px] tracking-[-0.03em] text-[#000000] leading-none whitespace-nowrap">
            <span className="hidden min-[380px]:inline">Personal </span>Tracker
          </span>
        </Link>

        {/* ================= RIGHT: FLOATING WHITE CAPSULE ================= */}
        <div className="flex items-center shrink-0">
          <div className="bg-white rounded-full border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-2.5 sm:px-5 md:px-6 py-1 sm:py-1.5 flex items-center gap-2 sm:gap-4 md:gap-6 transition-all">

            {/* 1. Modules Dropdown (All Screen Sizes) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsModulesOpen((prev) => !prev)}
                className={`flex items-center gap-1 cursor-pointer select-none text-xs sm:text-[13px] md:text-[14px] font-medium transition-colors ${
                  isModulesOpen || pathname === '/'
                    ? 'text-black font-semibold'
                    : 'text-[#374151] hover:text-black'
                }`}
                aria-expanded={isModulesOpen}
              >
                <span>Modules</span>
                <ChevronDown
                  size={12}
                  strokeWidth={2.2}
                  className={`text-[#6B7280] transition-transform duration-200 ${
                    isModulesOpen ? 'rotate-180 text-black' : ''
                  }`}
                />
              </button>

              {/* Floating Dropdown Panel (Responsive on Mobile & Desktop) */}
              {isModulesOpen && (
                <>
                  {/* Backdrop for mobile */}
                  <div
                    className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40 sm:hidden"
                    onClick={() => setIsModulesOpen(false)}
                  />

                  {/* Panel */}
                  <div className="fixed inset-x-3.5 top-14 max-h-[80vh] overflow-hidden flex flex-col sm:static sm:absolute sm:inset-auto sm:top-full sm:left-0 sm:right-auto sm:max-h-none sm:w-80 mt-2 sm:mt-3 bg-white rounded-3xl border border-black/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.16)] p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 border-b border-black/[0.05] mb-2 flex items-center justify-between shrink-0">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280]">
                        All 18 Modules & Hubs
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsModulesOpen(false);
                          if (onToggleSidebar) onToggleSidebar();
                        }}
                        className="text-[10px] font-semibold text-black bg-black/[0.05] hover:bg-black/[0.1] px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                      >
                        <SlidersHorizontal size={10} />
                        <span>Drawer Menu</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-1 overflow-y-auto pr-1 flex-1 max-h-[340px] sm:max-h-[360px]">
                      <Link
                        href="/"
                        onClick={() => setIsModulesOpen(false)}
                        className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all ${
                          pathname === '/'
                            ? 'bg-black text-white shadow-xs'
                            : 'hover:bg-black/[0.04] text-[#1f2937]'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                            pathname === '/' ? 'bg-white/20 text-white' : 'bg-black/[0.05] text-black'
                          }`}
                        >
                          <BarChart3 size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold leading-snug">Main Dashboard</p>
                          <p className={`text-[10px] truncate ${pathname === '/' ? 'text-white/70' : 'text-[#6B7280]'}`}>
                            Central productivity hub
                          </p>
                        </div>
                      </Link>

                      {modulesList.map((m) => {
                        const Icon = m.icon;
                        const isActive = pathname.startsWith(m.href);
                        return (
                          <Link
                            key={m.name}
                            href={m.href}
                            onClick={() => setIsModulesOpen(false)}
                            className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all ${
                              isActive
                                ? 'bg-black text-white shadow-xs'
                                : 'hover:bg-black/[0.04] text-[#1f2937]'
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                                isActive ? 'bg-white/20 text-white' : 'bg-black/[0.05] text-black'
                              }`}
                            >
                              <Icon size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold leading-snug truncate">
                                {m.name}
                              </p>
                              <p
                                className={`text-[10px] truncate ${
                                  isActive ? 'text-white/70' : 'text-[#6B7280]'
                                }`}
                              >
                                {m.desc}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Bottom Footer inside Dropdown */}
                    <div className="mt-2 pt-2 border-t border-black/[0.05] flex items-center justify-between px-2 text-[11px] text-[#6B7280] shrink-0">
                      <Link
                        href="/notifications"
                        onClick={() => setIsModulesOpen(false)}
                        className="flex items-center gap-1.5 hover:text-black transition-colors"
                      >
                        <Bell size={12} />
                        <span>Notifications ({unreadCount})</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsModulesOpen(false)}
                        className="flex items-center gap-1 hover:text-black transition-colors"
                      >
                        <Settings size={12} />
                        <span>{user?.name || 'Settings'}</span>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 2. Projects with Red "New" Badge (Tablet & Desktop: hidden on mobile) */}
            <Link
              href="/graphic-design/projects"
              className={`hidden sm:flex items-center gap-1.5 text-[13px] sm:text-[14px] font-medium transition-colors select-none ${
                pathname.startsWith('/graphic-design/projects') || pathname.startsWith('/creative')
                  ? 'text-black font-semibold'
                  : 'text-[#374151] hover:text-black'
              }`}
            >
              <span>Projects</span>
              <span className="bg-[#FF533D] text-white text-[9px] font-bold px-1.5 py-[2px] rounded-full uppercase leading-none tracking-wide shadow-xs">
                New
              </span>
            </Link>

            {/* 3. Calendar (md and up) */}
            <Link
              href="/calendar"
              className={`hidden md:block text-[13px] sm:text-[14px] font-medium transition-colors select-none ${
                pathname.startsWith('/calendar')
                  ? 'text-black font-semibold'
                  : 'text-[#374151] hover:text-black'
              }`}
            >
              Calendar
            </Link>

            {/* 4. Analytics (lg and up) */}
            <Link
              href="/analytics"
              className={`hidden lg:block text-[13px] sm:text-[14px] font-medium transition-colors select-none ${
                pathname.startsWith('/analytics')
                  ? 'text-black font-semibold'
                  : 'text-[#374151] hover:text-black'
              }`}
            >
              Analytics
            </Link>

            {/* 5. Notifications Bell Icon (All Screen Sizes) */}
            <Link
              href="/notifications"
              aria-label="Notifications"
              title="Notifications"
              className="relative p-1 text-[#6B7280] hover:text-black transition-colors rounded-full shrink-0"
            >
              <Bell size={14} className="sm:w-[15px] sm:h-[15px]" strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#FF533D] ring-2 ring-white" />
              )}
            </Link>

            {/* 6. Signature Black Pill Button: "Quick Add" (Adaptive size on mobile) */}
            <button
              type="button"
              onClick={onOpenQuickAdd}
              aria-label="Quick Add Activity"
              className="bg-[#000000] hover:bg-neutral-900 active:scale-95 text-white font-semibold pl-2.5 sm:pl-3.5 pr-1 sm:pr-1.5 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 transition-all shadow-sm group shrink-0"
            >
              <span className="hidden sm:inline text-xs sm:text-[13px]">Quick Add</span>
              <span className="sm:hidden text-[11px] leading-none">Add</span>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-black flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5 shadow-xs">
                <ArrowRight size={10} strokeWidth={2.6} className="sm:w-[11px] sm:h-[11px]" />
              </div>
            </button>

          </div>
        </div>

      </div>
    </header>
  );
};
