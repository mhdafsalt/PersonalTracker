'use client';

import React, { useEffect } from 'react';
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
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({
  isOpen,
  setIsOpen,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const open = isOpen !== undefined ? isOpen : isMobileOpen;
  const close = () => {
    if (setIsOpen) setIsOpen(false);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) close();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Prevent background scroll when sidebar drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  // Navigation Items (All 18 Modules)
  const navigation = [
    {
      group: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Calendar', href: '/calendar', icon: Calendar },
        { name: 'Notifications', href: '/notifications', icon: Bell },
      ],
    },
    {
      group: 'PERSONAL MANAGEMENT',
      items: [
        { name: 'Habit Tracker', href: '/habits', icon: CheckSquare },
        { name: 'Expense Tracker', href: '/expenses', icon: Wallet },
        { name: 'Productivity', href: '/productivity', icon: Clock },
        { name: 'Fitness Tracker', href: '/fitness', icon: Dumbbell },
        { name: 'Study Tracker', href: '/study', icon: GraduationCap },
        { name: 'Reading Tracker', href: '/reading', icon: BookOpen },
        { name: 'Time Tracker', href: '/time', icon: Timer },
        { name: 'Goal Tracker', href: '/goals', icon: Target },
      ],
    },
    {
      group: 'TRAVEL & CONNECTIONS',
      items: [
        { name: 'Travel Planner', href: '/travel', icon: Compass },
        { name: 'Orbit & Calls', href: '/orbit', icon: Users2 },
      ],
    },
    {
      group: 'CREATIVE WORKSPACE',
      items: [
        { name: 'Creative Projects', href: '/creative', icon: Palette },
        { name: 'Graphic Design Studio', href: '/graphic-design', icon: Briefcase },
      ],
    },
    {
      group: 'PROGRAMS & EVENTS',
      items: [
        { name: 'Programs & Events', href: '/events', icon: Ticket },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  const isActiveRoute = (href) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* BACKDROP OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-[#0f110f]/40 backdrop-blur-sm transition-opacity"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* SLIDE-OVER DRAWER (From Right) */}
      <aside
        style={{ backgroundColor: '#ffffff' }}
        className={`
          fixed top-0 bottom-0 right-0 z-50
          w-[310px] sm:w-[350px] max-w-[88vw]
          flex flex-col
          bg-white
          border-l border-[#e8e8e5]
          shadow-[-16px_0_48px_rgba(15,17,15,0.12)]
          transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : 'translate-x-full pointer-events-none'}
        `}
      >
        {/* TOP CLOSE ACTION (NO CLUNKY HEADER BAR) */}
        <div className="flex items-center justify-end px-5 pt-4 pb-1 shrink-0">
          <button
            onClick={close}
            aria-label="Close menu"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f1f1ef] hover:bg-[#e8e8e5] text-[#6b6b68] hover:text-[#0f110f] transition-all active:scale-95 shadow-sm"
          >
            <X size={16} />
          </button>
        </div>

        {/* NAVIGATION LIST (SCROLLABLE ON SOLID WHITE BG) */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-5 bg-white">
          {navigation.map((section) => (
            <div key={section.group} className="space-y-1">
              <p className="px-3 font-mono text-[10px] font-semibold tracking-[0.14em] text-[#6b6b68] uppercase mb-1.5">
                {section.group}
              </p>

              {section.items.map((item) => {
                const active = isActiveRoute(item.href);
                const IconComponent = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={`
                      flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all duration-150 select-none
                      ${
                        active
                          ? 'bg-[#0f110f] text-white shadow-sm'
                          : 'text-[#252923] hover:text-[#0f110f] hover:bg-[#f6f6f5]'
                      }
                    `}
                  >
                    <IconComponent
                      size={16}
                      className={`shrink-0 ${active ? 'text-[#d7f43a]' : 'text-[#6b6b68]'}`}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* FOOTER USER PROFILE & LOGOUT */}
        <div className="p-4 border-t border-[#ececea] bg-[#faf9f6] shrink-0">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/settings"
              onClick={close}
              className="flex items-center gap-2.5 min-w-0 hover:opacity-85 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-[#0f110f] text-white font-mono font-medium text-xs flex items-center justify-center shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#0f110f] truncate">
                  {user?.name || 'Personal User'}
                </p>
                <p className="font-mono text-[10px] text-[#6b6b68] truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </Link>

            <button
              onClick={() => {
                close();
                logout();
              }}
              title="Log out"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#6b6b68] hover:text-[#d96c6c] hover:bg-[#ffe5e5] transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
