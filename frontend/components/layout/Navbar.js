'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  Bell,
  Plus,
  Sparkles,
  Heart,
  RefreshCw,
  Activity,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const Navbar = ({ onOpenMobile, onOpenQuickAdd }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUnread = () => {
    setIsRefreshing(true);
    api.get('/notifications')
      .then((res) => {
        if (res.success && res.data) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      })
      .catch(() => {})
      .finally(() => {
        setTimeout(() => setIsRefreshing(false), 500);
      });
  };

  useEffect(() => {
    // Current formatted date matching Orbix "Sat, 26 Aug"
    const d = new Date();
    setCurrentDateStr(
      d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    );
    fetchUnread();
  }, []);

  return (
    <header className="sticky top-3 z-30 flex items-center justify-between px-3 sm:px-6 py-2 my-2 transition-all">
      {/* Left: Studio/Brand Pill + Circular Control Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Brand Pill Dropdown */}
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white border border-[#E5E8ED] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-[#111315]/20 transition-all select-none"
        >
          <div className="w-6 h-6 rounded-full bg-[#111315] text-[#D4F648] flex items-center justify-center text-xs font-bold shrink-0">
            ✦
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-[#111315] tracking-tight flex items-center gap-1">
              Personal Tracker
              <ChevronDown className="w-3 h-3 text-[#686E77]" />
            </div>
            <div className="text-[10px] text-[#686E77] font-medium -mt-0.5">
              Operating System
            </div>
          </div>
        </Link>

        {/* Small Circular Quick Action Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Activity / Fitness shortcut */}
          <Link
            href="/fitness"
            title="Fitness & Health"
            className="w-9 h-9 rounded-full bg-white border border-[#E5E8ED] text-[#111315] hover:bg-[#F2F4F7] flex items-center justify-center transition-all shadow-xs"
          >
            <Activity className="w-4 h-4 text-[#686E77]" />
          </Link>

          {/* Refresh icon */}
          <button
            onClick={fetchUnread}
            title="Refresh Data"
            className="w-9 h-9 rounded-full bg-white border border-[#E5E8ED] text-[#111315] hover:bg-[#F2F4F7] flex items-center justify-center transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#686E77] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Quick Add Pill */}
          <button
            onClick={onOpenQuickAdd}
            title="Quick Add Task, Habit or Expense"
            className="w-9 h-9 rounded-full bg-white border border-[#E5E8ED] text-[#111315] hover:bg-[#D4F648] hover:border-[#D4F648] flex items-center justify-center transition-all shadow-xs group"
          >
            <Plus className="w-4 h-4 text-[#111315] group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Right: Circular Pills + Date Pill + Black Circular Menu Button */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Heart / Favorites */}
        <Link
          href="/goals"
          title="Goals & Targets"
          className="hidden md:flex w-9 h-9 rounded-full bg-white border border-[#E5E8ED] text-[#686E77] hover:text-[#FF5722] hover:bg-[#F2F4F7] items-center justify-center transition-all shadow-xs"
        >
          <Heart className="w-4 h-4" />
        </Link>

        {/* Sparkles / Studio */}
        <Link
          href="/creative"
          title="Creative Workspace"
          className="hidden sm:flex w-9 h-9 rounded-full bg-white border border-[#E5E8ED] text-[#686E77] hover:text-[#111315] hover:bg-[#F2F4F7] items-center justify-center transition-all shadow-xs"
        >
          <Sparkles className="w-4 h-4" />
        </Link>

        {/* Date + Notification Badge Pill */}
        <Link
          href="/notifications"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E8ED] text-xs font-medium text-[#111315] hover:border-[#111315]/20 shadow-xs transition-all"
        >
          <Bell className="w-3.5 h-3.5 text-[#686E77]" />
          <span className="hidden sm:inline text-xs font-semibold">{currentDateStr}</span>
          <span className="w-5 h-5 rounded-full bg-[#111315] text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </Link>

        {/* User Avatar Circle */}
        <Link
          href="/settings"
          title="Profile & Settings"
          className="w-9 h-9 rounded-full bg-white border border-[#E5E8ED] overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-[#111315]/20 transition-all shadow-xs"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-[#111315]">{user?.name?.charAt(0) || 'U'}</span>
          )}
        </Link>

        {/* Black Circular Menu Pill (Toggle drawer / mobile menu) */}
        <button
          onClick={onOpenMobile}
          title="Toggle Navigation Menu"
          className="w-9 h-9 rounded-full bg-[#111315] hover:bg-black text-white flex items-center justify-center transition-transform active:scale-95 shadow-sm"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
