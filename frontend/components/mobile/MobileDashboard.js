'use client';

import React, { useState } from 'react';
import { MobileHeader } from './MobileHeader';
import { formatDate } from '../../utils/format';
import Link from 'next/link';
import {
  ArrowUpRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Users2,
  Sparkles,
  ChevronRight,
  Flame,
} from 'lucide-react';

export const MobileDashboard = ({ data, onOpenQuickAdd, onToggleHabit, onToggleTask }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');

  const stats = data?.stats || {};
  const widgets = data?.widgets || {};
  const tasks = widgets.todayTasks || [];
  const habits = widgets.habits || [];

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'Completed') return t.status === 'Completed';
    if (activeFilter === 'In progress') return t.status === 'In Progress' || t.status === 'Pending';
    return true;
  });

  const totalTasksCount = stats.totalTasks ?? tasks.length;
  const completedCount = stats.completedTasks ?? 0;
  const inProgressCount = stats.pendingTasks ?? (totalTasksCount - completedCount);

  return (
    <div className="space-y-6 text-white pb-6">
      {/* Mobile Header with Profile, Action Button, and Weekly Date Strip */}
      <MobileHeader
        onOpenQuickAdd={onOpenQuickAdd}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* 3 Modern Metric Cards Cluster (Matching Image Phone 1) */}
      <div className="space-y-3">
        {/* Main Big Task Card */}
        <div className="p-5 rounded-[28px] bg-[#1C1E24] border border-white/5 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-4xl font-extrabold text-white tracking-tight leading-none">
                {totalTasksCount.toString().padStart(2, '0')}
              </span>
              <p className="text-xs font-semibold text-[#8A909E] mt-1.5">Current Task</p>
            </div>

            {/* Circular Arrow Button */}
            <Link
              href="/productivity"
              className="w-9 h-9 rounded-full bg-[#D2F542] text-[#121316] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            >
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </Link>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#8A909E] bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D2F542]" />
              Active Timeline Cycle
            </span>
          </div>
        </div>

        {/* Two Half Cards: Completed & In Progress */}
        <div className="grid grid-cols-2 gap-3">
          {/* Completed Card */}
          <div className="p-4 rounded-[26px] bg-[#1C1E24] border border-white/5 flex flex-col justify-between min-h-[115px]">
            <div className="flex justify-between items-start">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {completedCount.toString().padStart(2, '0')}
              </span>
              <div className="w-7 h-7 rounded-full bg-[#D2F542] text-[#121316] flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#8A909E]">Completed</p>
              <div className="flex items-center gap-1 text-[10px] text-[#8A909E] mt-1">
                <CheckCircle2 className="w-3 h-3 text-[#D2F542]" />
                <span>{completedCount} tasks done</span>
              </div>
            </div>
          </div>

          {/* In Progress Card */}
          <div className="p-4 rounded-[26px] bg-[#1C1E24] border border-white/5 flex flex-col justify-between min-h-[115px]">
            <div className="flex justify-between items-start">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {inProgressCount.toString().padStart(2, '0')}
              </span>
              <div className="w-7 h-7 rounded-full bg-[#D2F542] text-[#121316] flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#8A909E]">In progress</p>
              <div className="flex items-center gap-1 text-[10px] text-[#8A909E] mt-1">
                <Flame className="w-3 h-3 text-[#D6A24A]" />
                <span>{inProgressCount} active sprints</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Active Hero Banner Card (Matching Image Phone 2) */}
      <div className="p-6 rounded-[30px] bg-gradient-to-br from-[#1C1E24] to-[#16181D] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8A909E]">
            PRO ACTIVE
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-8 h-8 rounded-full bg-[#4D62E5] text-white text-xs font-bold flex items-center justify-center">
              ({stats.totalActiveProjects ?? 12})
            </span>
            <div className="w-8 h-8 rounded-full bg-[#D2F542] text-[#121316] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
            Take Charge Of <br />
            Your Activity
          </h2>
          <p className="text-xs text-[#8A909E] mt-1.5 leading-relaxed">
            Organize tasks effortlessly, cultivate habits, and collaborate with your clients and network.
          </p>
        </div>

        {/* Dual Gauge & Productivity Bar Mini-Widgets */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Time Saved Gauge */}
          <div className="p-3.5 rounded-2xl bg-[#242731]/70 border border-white/5 space-y-2">
            <span className="text-[10px] text-[#8A909E] font-semibold block">Time logged</span>
            <div className="flex flex-col items-center py-1">
              <span className="text-2xl font-black text-white">
                {stats.weeklyStudyHours ? `${stats.weeklyStudyHours}h` : '26h'}
              </span>
              <span className="text-[10px] text-[#8A909E]">Hours this cycle</span>
            </div>
            <div className="text-[9px] text-[#D2F542] font-semibold bg-[#D2F542]/10 py-1 px-2 rounded-full text-center">
              Productivity +25%
            </div>
          </div>

          {/* Productivity Mini Chart */}
          <div className="p-3.5 rounded-2xl bg-[#242731]/70 border border-white/5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#8A909E] font-semibold">Productivity</span>
              <span className="text-[11px] font-bold text-[#D2F542]">78%</span>
            </div>
            {/* Visual Vertical Bars matching screenshot */}
            <div className="flex items-end justify-between h-14 pt-2 px-1">
              {[40, 65, 90, 75, 100, 60].map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-2.5 rounded-full ${
                      i >= 2 && i <= 4 ? 'bg-[#D2F542]' : 'bg-[#3A3E4A]'
                    }`}
                    style={{ height: `${(h / 100) * 44}px` }}
                  />
                  <span className="text-[7px] text-[#8A909E]">
                    {['J', 'F', 'M', 'A', 'M', 'J'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Pills Strip (Matching Image Phone 3) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveFilter('All')}
            className={`py-2 px-4 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeFilter === 'All'
                ? 'bg-[#D2F542] text-[#121316] shadow-sm'
                : 'bg-[#1C1E24] text-[#8A909E] border border-white/5'
            }`}
          >
            All task ({totalTasksCount})
          </button>
          <button
            onClick={() => setActiveFilter('Completed')}
            className={`py-2 px-4 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeFilter === 'Completed'
                ? 'bg-[#D2F542] text-[#121316] shadow-sm'
                : 'bg-[#1C1E24] text-[#8A909E] border border-white/5'
            }`}
          >
            Completed ({completedCount.toString().padStart(2, '0')})
          </button>
          <button
            onClick={() => setActiveFilter('In progress')}
            className={`py-2 px-4 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeFilter === 'In progress'
                ? 'bg-[#D2F542] text-[#121316] shadow-sm'
                : 'bg-[#1C1E24] text-[#8A909E] border border-white/5'
            }`}
          >
            In progress ({inProgressCount.toString().padStart(2, '0')})
          </button>
        </div>

        {/* Tasks List Cards with Progress Bar (Matching Image Phone 3) */}
        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const isCompleted = task.status === 'Completed';
              const progressPct = isCompleted ? 100 : task.pomodorosCompleted ? Math.round((task.pomodorosCompleted / (task.pomodorosEstimated || 1)) * 100) : 65;

              return (
                <div
                  key={task._id}
                  className="p-5 rounded-[26px] bg-[#1C1E24] border border-white/5 shadow-md space-y-3.5 hover:border-white/15 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={`text-base font-bold ${isCompleted ? 'line-through text-[#8A909E]' : 'text-white'}`}>
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-[#8A909E] mt-0.5">
                        {task.dueDate ? `Deadline: ${formatDate(task.dueDate)}` : 'Category: ' + task.category}
                      </p>
                    </div>

                    {/* High/Medium Priority Pill */}
                    <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/15 text-white shrink-0">
                      {task.priority || 'Medium'} Priority
                    </span>
                  </div>

                  {/* Progress Line with % */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[11px] text-[#8A909E] font-medium">Progress</span>
                      <span className="text-[11px] font-bold text-white">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-[#2A2E38] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#D2F542] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom Card Row: Avatars & Comments / Check */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-[#6B8F71] border-2 border-[#1C1E24] flex items-center justify-center text-[10px] font-bold">
                        A
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#4D62E5] border-2 border-[#1C1E24] flex items-center justify-center text-[9px] font-bold text-white">
                        +2
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] text-[#8A909E]">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{task.pomodorosEstimated || 1}</span>
                      </div>
                      <button
                        onClick={() => onToggleTask && onToggleTask(task._id, task.status)}
                        className={`text-xs px-3 py-1 rounded-full font-bold transition-all ${
                          isCompleted
                            ? 'bg-[#D2F542] text-[#121316]'
                            : 'bg-white/5 border border-white/10 text-[#8A909E] hover:text-white'
                        }`}
                      >
                        {isCompleted ? 'Done ✓' : 'Mark Done'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 rounded-[26px] bg-[#1C1E24] border border-white/5 text-center text-xs text-[#8A909E]">
              No tasks under this filter. Tap "Create new task" above.
            </div>
          )}
        </div>
      </div>

      {/* Manage Your Projects Section (Matching Image Phone 1 Bottom) */}
      <div className="p-5 rounded-[28px] bg-[#1C1E24] border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-base text-white">Manage your projects</h4>
          <span className="w-7 h-7 rounded-full bg-white/10 text-white text-xs font-bold flex items-center justify-center">
            ({stats.totalActiveProjects ?? 12})
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8A909E] font-medium">Studio & Creative:</span>
            <div className="flex items-center -space-x-2">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-[#2A2E38] border-2 border-[#1C1E24] flex items-center justify-center text-[10px] font-bold text-white">
                  P{i + 1}
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/graphic-design"
            className="text-xs font-bold text-[#D2F542] flex items-center gap-1 hover:underline"
          >
            Open Studio <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
