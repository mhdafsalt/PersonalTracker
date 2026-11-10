'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, Bell, Plus, Sparkles, User, Settings, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

export const Navbar = ({ onOpenMobile, onOpenQuickAdd }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [greeting, setGreeting] = useState('Welcome back');
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    // Dynamic greeting based on hour
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Current formatted date
    const d = new Date();
    setCurrentDateStr(
      d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    );

    // Fetch unread notifications
    api.get('/notifications')
      .then((res) => {
        if (res.success && res.data) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 backdrop-blur-md border-b border-[#E9E8E1]">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-[#777D75] hover:text-[#252923] hover:bg-[#FAF8F5] rounded-xl transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-semibold text-[#252923]">
              {greeting}, <span className="text-[#6B8F71]">{user?.name?.split(' ')[0] || 'Member'}</span>
            </h1>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#6B8F71]" />
            <span className="hidden sm:inline-block text-xs text-[#777D75]">{currentDateStr}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Quick Add Button */}
        <Button onClick={onOpenQuickAdd} size="sm" icon={Plus} className="shadow-sm">
          <span className="hidden sm:inline">Quick Add</span>
          <span className="sm:hidden">Add</span>
        </Button>

        {/* Notifications Icon with Badge */}
        <Link
          href="/notifications"
          className="relative p-2 text-[#777D75] hover:text-[#252923] hover:bg-[#FAF8F5] rounded-xl transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D96C6C] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D96C6C]" />
            </span>
          )}
        </Link>

        {/* Profile Link */}
        <Link
          href="/settings"
          className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#6B8F71]/30 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-[#E5E1D5] text-[#252923] font-semibold flex items-center justify-center text-xs overflow-hidden border border-[#E9E8E1]">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name?.charAt(0) || 'U'}</span>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};

