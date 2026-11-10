'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Bell, MessageSquare, Plus, ChevronDown } from 'lucide-react';

export const MobileHeader = ({ onOpenQuickAdd, selectedDate, onSelectDate }) => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('Good Evening!');
  const [dates, setDates] = useState([]);

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting('Good Morning!');
    else if (hr < 18) setGreeting('Good Afternoon!');
    else setGreeting('Good Evening!');

    // Generate weekly date strip around today
    const days = [];
    for (let i = -2; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        fullDateStr: d.toISOString().split('T')[0],
        dayNum: d.getDate(),
        monthShort: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday: i === 0,
      });
    }
    setDates(days);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const activeDate = selectedDate || todayStr;

  return (
    <div className="space-y-4">
      {/* Top Profile Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/settings" className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#242731] border border-white/10 flex items-center justify-center font-bold text-white text-base">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name?.charAt(0) || 'U'}</span>
              )}
            </div>
          </Link>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight leading-none">
              Hello, {user?.name?.split(' ')[0] || 'Member'}
            </h2>
            <p className="text-xs text-[#8A909E] mt-1 font-medium">{greeting}</p>
          </div>
        </div>

        {/* Right Icon Actions with Badges */}
        <div className="flex items-center gap-2">
          <Link
            href="/orbit"
            className="w-10 h-10 rounded-full bg-[#1C1E24] border border-white/10 flex items-center justify-center text-[#8A909E] hover:text-white relative"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#4D62E5] absolute top-2 right-2 ring-2 ring-[#1C1E24]" />
          </Link>

          <Link
            href="/notifications"
            className="w-10 h-10 rounded-full bg-[#1C1E24] border border-white/10 flex items-center justify-center text-[#8A909E] hover:text-white relative"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#D96C6C] absolute top-2 right-2 ring-2 ring-[#1C1E24]" />
          </Link>
        </div>
      </div>

      {/* Main Full-Width Pill Action Button */}
      <button
        onClick={onOpenQuickAdd}
        className="w-full py-3.5 px-5 bg-[#D2F542] hover:bg-[#c2e438] active:scale-[0.98] text-[#121316] font-bold text-sm rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#D2F542]/10 transition-all"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>Create new task</span>
      </button>

      {/* Task Overview + Weekly Date Strip */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white tracking-tight">Task overview</h3>
          <div className="flex items-center gap-1 text-xs font-semibold text-[#4D62E5] bg-[#4D62E5]/15 border border-[#4D62E5]/30 px-3 py-1 rounded-full">
            <span>Weekly</span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>

        {/* Horizontal Scroll of Days */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {dates.map((d) => {
            const isSelected = activeDate === d.fullDateStr;
            return (
              <button
                key={d.fullDateStr}
                onClick={() => onSelectDate && onSelectDate(d.fullDateStr)}
                className={`flex-1 min-w-[52px] py-2.5 px-2 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
                  isSelected
                    ? 'bg-[#D2F542] text-[#121316] font-bold shadow-md shadow-[#D2F542]/10'
                    : 'bg-[#1C1E24] border border-white/5 text-[#8A909E] hover:border-white/20'
                }`}
              >
                <span className={`text-xs ${isSelected ? 'font-extrabold text-[#121316]' : 'text-white font-bold'}`}>
                  {d.dayNum}
                </span>
                <span className="text-[10px] mt-0.5 opacity-80 uppercase font-medium">
                  {d.monthShort}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

