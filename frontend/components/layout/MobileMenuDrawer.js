'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
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
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileMenuDrawer = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const sections = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Central Calendar', href: '/calendar', icon: Calendar },
        { name: 'Notifications', href: '/notifications', icon: Bell },
      ],
    },
    {
      title: 'Personal Management',
      items: [
        { name: 'Habit Tracker', href: '/habits', icon: CheckSquare },
        { name: 'Expense Tracker', href: '/expenses', icon: Wallet },
        { name: 'Productivity & Focus', href: '/productivity', icon: Clock },
        { name: 'Fitness & Vitals', href: '/fitness', icon: Dumbbell },
        { name: 'Study & Courses', href: '/study', icon: GraduationCap },
        { name: 'Reading Library', href: '/reading', icon: BookOpen },
        { name: 'Time Tracker', href: '/time', icon: Timer },
        { name: 'Goal Roadmap', href: '/goals', icon: Target },
      ],
    },
    {
      title: 'Travel & Orbit',
      items: [
        { name: 'Travel Planner', href: '/travel', icon: Compass },
        { name: 'Orbit & Calls', href: '/orbit', icon: Users2 },
      ],
    },
    {
      title: 'Creative Studio',
      items: [
        { name: 'Creative Projects', href: '/creative', icon: Palette },
        { name: 'Graphic Design Studio', href: '/graphic-design', icon: Briefcase },
        { name: 'Client Registry', href: '/graphic-design/clients', icon: Users2 },
        { name: 'Projects Tracker', href: '/graphic-design/projects', icon: Briefcase },
      ],
    },
    {
      title: 'Events & System',
      items: [
        { name: 'Programs & Events', href: '/events', icon: Ticket },
        { name: 'Reports & Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Settings & Export', href: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modern Slide-up Panel */}
      <div className="relative bg-[#1C1E24] border-t border-white/10 rounded-t-[32px] p-5 max-h-[85vh] flex flex-col z-10 shadow-2xl text-white">
        {/* Header handle & close */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D2F542] text-[#121316] font-bold flex items-center justify-center text-sm">
              {user?.avatar ? (
                <img src={user.avatar} alt="User" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span>{user?.name?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{user?.name || 'Personal User'}</h3>
              <p className="text-[11px] text-[#8A909E]">{user?.email || 'demo@tracker.com'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#8A909E] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modules Grid */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A909E] px-1">
                {sec.title}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {sec.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-xs font-semibold ${
                        isActive
                          ? 'bg-[#D2F542] text-[#121316] border-[#D2F542]'
                          : 'bg-[#242731]/60 border-white/5 text-[#E0E2E8] hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#121316]' : 'text-[#D2F542]'}`} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Logout */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <Link
            href="/settings"
            onClick={onClose}
            className="text-xs text-[#8A909E] hover:text-white font-medium flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4" /> App Settings
          </Link>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="text-xs text-[#D96C6C] hover:text-red-400 font-semibold flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
