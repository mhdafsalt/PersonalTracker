'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  Wallet,
  Menu,
  Plus,
} from 'lucide-react';

export const MobileBottomNav = ({ onOpenMenu, onOpenQuickAdd }) => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: LayoutDashboard },
    { name: 'Tasks', href: '/productivity', icon: Clock },
    { name: 'Habits', href: '/habits', icon: CheckSquare },
    { name: 'Expenses', href: '/expenses', icon: Wallet },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden px-4 pb-4 pt-1 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto bg-[#1C1E24]/95 backdrop-blur-xl border border-white/10 rounded-[28px] shadow-2xl px-3 py-2 flex items-center justify-between">
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-[#D2F542]'
                  : 'text-[#8A909E] hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-1">{item.name}</span>
            </Link>
          );
        })}

        {/* Center Floating Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="w-12 h-12 rounded-full bg-[#D2F542] text-[#121316] flex items-center justify-center shadow-lg transform -translate-y-2 hover:scale-105 active:scale-95 transition-all"
          title="Quick Add"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-[#D2F542]'
                  : 'text-[#8A909E] hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-1">{item.name}</span>
            </Link>
          );
        })}

        {/* Menu Drawer Toggle */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[#8A909E] hover:text-white transition-all"
          title="All Modules"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Menu</span>
        </button>
      </div>
    </div>
  );
};

