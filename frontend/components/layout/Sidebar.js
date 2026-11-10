'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Bell,
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
  Palette,
  Briefcase,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
  Maximize2,
  Minimize2,
  X,
  Layers,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const navigation = [
    {
      group: 'Overview',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard, tag: 'Main' },
        { name: 'Calendar', href: '/calendar', icon: Calendar },
        { name: 'Notifications', href: '/notifications', icon: Bell },
      ],
    },
    {
      group: 'Personal Management',
      items: [
        { name: 'Habit Tracker', href: '/habits', icon: CheckSquare, tag: 'Daily' },
        { name: 'Expense Tracker', href: '/expenses', icon: Wallet, tag: 'Finance' },
        { name: 'Productivity', href: '/productivity', icon: Clock, tag: 'Focus' },
        { name: 'Fitness Tracker', href: '/fitness', icon: Dumbbell, tag: 'Health' },
        { name: 'Study Tracker', href: '/study', icon: GraduationCap },
        { name: 'Reading Tracker', href: '/reading', icon: BookOpen },
        { name: 'Time Tracker', href: '/time', icon: Timer },
        { name: 'Goal Tracker', href: '/goals', icon: Target },
      ],
    },
    {
      group: 'Travel & Connections',
      items: [
        { name: 'Travel Planner', href: '/travel', icon: Compass },
        { name: 'Orbit & Calls', href: '/orbit', icon: Users2 },
      ],
    },
    {
      group: 'Creative Workspace',
      items: [
        { name: 'Creative Projects', href: '/creative', icon: Palette },
        { name: 'Graphic Design Studio', href: '/graphic-design', icon: Briefcase },
      ],
    },
    {
      group: 'Programs & Events',
      items: [
        { name: 'Programs & Events', href: '/events', icon: Ticket },
      ],
    },
    {
      group: 'System',
      items: [
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  // Primary dock shortcuts matching the reference image layout
  const dockShortcuts = [
    { name: 'Dashboard', href: '/', icon: Sparkles, code: '✦' },
    { name: 'Habit Tracker', href: '/habits', icon: CheckSquare, code: 'SpO2' },
    { name: 'Productivity', href: '/productivity', icon: Clock, code: 'Px' },
    { name: 'Fitness', href: '/fitness', icon: Dumbbell, code: 'BMD' },
    { name: 'Expenses', href: '/expenses', icon: Wallet, code: 'Pulse' },
    { name: 'Study & Reading', href: '/study', icon: GraduationCap, code: '🎧' },
  ];

  return (
    <>
      {/* 1. Left Floating Capsule Dock (Desktop) */}
      <aside className="hidden lg:flex fixed left-5 top-24 bottom-6 flex-col justify-between items-center z-40 select-none pointer-events-auto">
        {/* Main Capsule */}
        <div className="w-13 rounded-full bg-white border border-[#E5E8ED] shadow-[0_4px_24px_rgba(0,0,0,0.04)] py-4 px-1.5 flex flex-col items-center gap-2.5">
          {dockShortcuts.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className={`w-10 h-10 rounded-full flex flex-col items-center justify-center text-xs font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#111315] text-[#D4F648] shadow-sm'
                    : 'text-[#686E77] hover:text-[#111315] hover:bg-[#F2F4F7]'
                }`}
              >
                {item.code ? (
                  <span className={`text-[11px] font-bold tracking-tighter ${isActive ? 'text-white' : 'text-[#686E77]'}`}>
                    {item.code}
                  </span>
                ) : (
                  <Icon className="w-4 h-4" />
                )}

                {/* Hover Tooltip */}
                <span className="absolute left-14 px-2.5 py-1 rounded-full bg-[#111315] text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* Drawer trigger (solid black circle with layers icon) */}
          <button
            onClick={() => setIsMobileOpen(true)}
            title="Browse All 18 Modules"
            className="w-10 h-10 rounded-full bg-[#111315] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm group relative"
          >
            <Layers className="w-4 h-4 text-[#D4F648]" />
            <span className="absolute left-14 px-2.5 py-1 rounded-full bg-[#111315] text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
              All Modules
            </span>
          </button>
        </div>

        {/* Bottom Mini Capsule */}
        <div className="w-13 rounded-full bg-white border border-[#E5E8ED] shadow-[0_4px_24px_rgba(0,0,0,0.04)] py-2 px-1.5 flex flex-col items-center gap-1.5">
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="w-10 h-10 rounded-full text-[#686E77] hover:text-[#111315] hover:bg-[#F2F4F7] flex items-center justify-center transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={logout}
            title="Logout"
            className="w-10 h-10 rounded-full text-[#686E77] hover:text-[#FF5722] hover:bg-[#FF5722]/10 flex items-center justify-center transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. Full Drawer Modal / Drawer Overlay (All 18 Modules) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#111315]/40 backdrop-blur-md transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="relative z-50 w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden border-r border-[#E5E8ED] animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="p-5 border-b border-[#E5E8ED] flex items-center justify-between bg-[#F7F8FA]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#111315] text-[#D4F648] flex items-center justify-center font-bold text-sm shadow-sm">
                  ✦
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#111315] tracking-tight">Personal Tracker</h3>
                  <p className="text-[11px] text-[#686E77] uppercase tracking-wider font-medium">All 18 Modules</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#E5E8ED] text-[#686E77] hover:text-[#111315] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {navigation.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#686E77]/80 mb-2">
                    {section.group}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-[#111315] text-white font-semibold shadow-sm'
                              : 'text-[#111315] hover:bg-[#F0F2F5]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4F648]' : 'text-[#686E77]'}`} />
                            <span>{item.name}</span>
                          </div>
                          {item.tag && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                isActive ? 'bg-[#D4F648] text-[#111315]' : 'bg-[#E5E8ED] text-[#686E77]'
                              }`}
                            >
                              {item.tag}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Profile & Logout */}
            <div className="p-4 border-t border-[#E5E8ED] bg-[#F7F8FA]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white border border-[#E5E8ED] text-[#111315] font-bold flex items-center justify-center text-xs overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>{user?.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#111315] truncate">{user?.name || 'Personal Member'}</p>
                    <p className="text-[11px] text-[#686E77] truncate">{user?.email || 'demo@tracker.com'}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-[#686E77] hover:text-[#FF5722] hover:bg-white rounded-full transition-colors border border-transparent hover:border-[#E5E8ED]"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
