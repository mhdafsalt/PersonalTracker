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
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navigation = [
    {
      group: 'Overview',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Calendar', href: '/calendar', icon: Calendar },
        { name: 'Notifications', href: '/notifications', icon: Bell },
      ],
    },
    {
      group: 'Personal Management',
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

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#252923]/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white border-r border-[#E9E8E1] transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-[#E9E8E1]">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-[#6B8F71] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              P
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-bold text-base tracking-tight text-[#252923]">PERSONAL</span>
                <span className="text-xs ml-1 font-semibold text-[#6B8F71] uppercase tracking-wider block -mt-1">
                  Tracker
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 text-[#777D75] hover:text-[#252923] hover:bg-[#FAF8F5] rounded-lg transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigation.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#777D75]/80 mb-2">
                  {section.group}
                </p>
              )}
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#6B8F71]/15 text-[#6B8F71] font-semibold'
                        : 'text-[#777D75] hover:bg-[#FAF8F5] hover:text-[#252923]'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.name : ''}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#6B8F71]' : 'text-[#777D75]'}`} />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-[#E9E8E1] bg-[#FAF8F5]">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-2`}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-[#E5E1D5] text-[#252923] font-semibold flex items-center justify-center shrink-0 border border-[#E9E8E1] overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              {!collapsed && (
                <div className="truncate">
                  <p className="text-xs font-semibold text-[#252923] truncate">{user?.name || 'Personal User'}</p>
                  <p className="text-[11px] text-[#777D75] truncate">{user?.email || 'demo@tracker.com'}</p>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 text-[#777D75] hover:text-[#D96C6C] hover:bg-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

