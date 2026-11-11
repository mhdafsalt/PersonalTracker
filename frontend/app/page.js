'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/format';

import {
  CheckSquare,
  Clock,
  Wallet,
  Target,
  Briefcase,
  Compass,
  PhoneCall,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Zap,
  Activity,
  CalendarDays,
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [currentDateStr, setCurrentDateStr] = useState('');

  // Fetch Dashboard Data
  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [user]);

  useEffect(() => {
    const now = new Date();
    setCurrentDateStr(
      now.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).toUpperCase()
    );
  }, []);

  // Toggle Habit
  const handleToggleHabit = async (habitId) => {
    try {
      const res = await api.post(`/habits/${habitId}/toggle`, {});
      if (res.success) {
        showToast('Habit status updated', 'success');
        fetchDashboard();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Toggle Task
  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      const res = await api.put(`/productivity/tasks/${taskId}`, { status: newStatus });
      if (res.success) {
        showToast(
          newStatus === 'Completed' ? 'Task marked completed' : 'Task reopened',
          'success'
        );
        fetchDashboard();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const stats = data?.stats || {};
  const widgets = data?.widgets || {};
  const todayStr = new Date().toISOString().split('T')[0];
  const currency = user?.currency || 'INR';

  // Dynamic 7-day selector from backend
  const daysOfWeek = widgets.daysOfWeek && widgets.daysOfWeek.length > 0 ? widgets.daysOfWeek : (() => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      list.push({
        day: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        date: d.toISOString().split('T')[0],
        score: 0,
        active: i === 0,
      });
    }
    return list;
  })();

  // Dynamic metric calculations
  const totalH = stats.totalHabits || 0;
  const doneH = stats.completedTodayHabits || 0;
  const habitPct = totalH > 0 ? Math.round((doneH / totalH) * 100) : 0;
  const momentumScore = stats.momentumScore !== undefined ? stats.momentumScore : (totalH > 0 ? habitPct : 0);

  const focusDisplay = stats.todayFocusMinutes > 0
    ? `${Math.floor(stats.todayFocusMinutes / 60)}h ${stats.todayFocusMinutes % 60}m`
    : stats.weeklyStudyHours > 0
      ? `${stats.weeklyStudyHours}h`
      : '0h 0m';

  const focusProgressWidth = `${Math.min(100, Math.round(((stats.todayFocusMinutes || (stats.weeklyStudyHours * 60) || 0) / 240) * 100))}%`;
  const taskProgressWidth = `${stats.totalTasks > 0 ? Math.round(((stats.completedTasks || 0) / stats.totalTasks) * 100) : 0}%`;
  const budgetProgressWidth = `${stats.monthlyIncome > 0 ? Math.min(100, Math.round(((stats.monthlyExpenses || 0) / stats.monthlyIncome) * 100)) : stats.monthlyExpenses > 0 ? 50 : 0}%`;

  const focusStageWidth = `${stats.focusPct ?? (stats.todayFocusMinutes > 0 ? 40 : 25)}%`;
  const habitStageWidth = `${stats.habitPct ?? (habitPct > 0 ? habitPct : 25)}%`;
  const taskStageWidth = `${stats.taskPct ?? (stats.totalTasks > 0 ? 25 : 20)}%`;
  const restStageWidth = `${stats.restPct ?? 25}%`;

  const readinessStatus = momentumScore >= 80 ? 'Optimal Flow' : momentumScore >= 50 ? 'Steady Pace' : 'Building Rhythm';
  const readinessDescription = momentumScore >= 80
    ? 'All personal habits and focus rhythms are synchronized.'
    : momentumScore >= 50
      ? 'Good progress today with active routines in motion.'
      : 'Start completing today\'s habits and tasks to build momentum.';

  const savingsRateText = (stats.monthlyIncome > 0 && stats.monthlyExpenses > 0)
    ? `${Math.max(0, Math.round(((stats.monthlyIncome - stats.monthlyExpenses) / stats.monthlyIncome) * 100))}% rate`
    : stats.netSavings > 0
      ? 'Positive'
      : stats.monthlyExpenses > 0
        ? 'Deficit'
        : 'Balanced';

  return (
    <AppLayout>
      <div className="space-y-8 sm:space-y-10">

        {/* ======================================================== */}
        {/* 1. MIRA TITLE ROW & WEEK PILL SELECTOR */}
        {/* ======================================================== */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2">
          {/* Heading */}
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#d7f43a]" />
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b6b68]">
                {currentDateStr ? `${currentDateStr} · ` : ''}CALM DASHBOARD
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.04em] text-[#0f110f] leading-tight">
              {momentumScore}% Momentum.{' '}
              <span className="text-[#94948f] font-normal block sm:inline">
                All personal systems running optimal.
              </span>
            </h1>
          </div>

          {/* Week Selector Pills (Mira-style) */}
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-white/80 border border-[#e8e8e5] shadow-sm backdrop-blur-md self-start lg:self-auto max-w-full overflow-x-auto">
            {daysOfWeek.map((item, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-full transition-all duration-200 select-none cursor-pointer ${item.active
                    ? 'bg-[#0f110f] text-white shadow-sm'
                    : 'text-[#6b6b68] hover:text-[#0f110f] hover:bg-[#f1f1ef]'
                  }`}
              >
                <span className="font-mono text-[10px] uppercase font-semibold leading-none">
                  {item.day}
                </span>
                <span className={`font-mono text-[11px] mt-0.5 leading-none ${item.active ? 'text-[#d7f43a] font-bold' : 'text-[#4a4a47]'}`}>
                  {item.score}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 2. HERO BENTO GRID (SPOTLIGHT DARK CARD + READINESS CARD) */}
        {/* ======================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">

          {/* SPOTLIGHT DARK CARD: Energy & Focus Flow (Mira Sleep Stages equivalent) */}
          <div className="lg:col-span-7 xl:col-span-8 bg-[#0f110f] text-white rounded-[32px] p-6 sm:p-8 relative overflow-hidden border border-white/10 shadow-[0_16px_40px_rgba(15,17,15,0.14)] flex flex-col justify-between min-h-[360px]">
            {/* Glowing Lime Ambient Blob */}
            <div className="mira-dark-glow" aria-hidden="true" />

            {/* Header */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#d7f43a] font-semibold">
                  MOMENTUM STAGES
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mt-1">
                  Focus &amp; Daily Rhythm
                </h2>
                <p className="text-xs text-white/60 mt-1 max-w-md">
                  Active deep work, physical wellness, and habit streaks synchronized.
                </p>
              </div>

              {/* Swatch Key */}
              <div className="flex items-center flex-wrap gap-3 p-1.5 rounded-full bg-white/[0.06] border border-white/10 px-3 py-1 self-start sm:self-auto text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-white/80">
                  <span className="w-2 h-2 rounded-full bg-[#d7f43a]" /> Focus
                </span>
                <span className="flex items-center gap-1.5 text-white/80">
                  <span className="w-2 h-2 rounded-full bg-[#8fd94e]" /> Habits
                </span>
                <span className="flex items-center gap-1.5 text-white/80">
                  <span className="w-2 h-2 rounded-full bg-[#ff8a4a]" /> Tasks
                </span>
              </div>
            </div>

            {/* Stage Bar Visualization */}
            <div className="relative z-10 my-8">
              <div className="h-6 w-full rounded-full bg-white/[0.08] p-1 flex items-center gap-1 border border-white/10 overflow-hidden">
                <div style={{ width: focusStageWidth }} className="h-full rounded-full bg-[#d7f43a] transition-all duration-700" title={`Focus (${focusStageWidth})`} />
                <div style={{ width: habitStageWidth }} className="h-full rounded-full bg-[#8fd94e] transition-all duration-700" title={`Habits (${habitStageWidth})`} />
                <div style={{ width: taskStageWidth }} className="h-full rounded-full bg-[#ff8a4a] transition-all duration-700" title={`Tasks (${taskStageWidth})`} />
                <div style={{ width: restStageWidth }} className="h-full rounded-full bg-white/20 transition-all duration-700" title={`Rest (${restStageWidth})`} />
              </div>

              {/* Timeline markers */}
              <div className="flex justify-between font-mono text-[10px] text-white/40 mt-2 px-1">
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
                <span>23:00</span>
              </div>
            </div>

            {/* Micro Stats Row */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
              <div>
                <p className="font-mono text-[10px] uppercase text-white/50 tracking-wider">
                  Deep Focus
                </p>
                <p className="text-xl font-semibold text-white mt-0.5">
                  {focusDisplay}
                </p>
                <span className="font-mono text-[10px] text-[#d7f43a] inline-flex items-center gap-0.5 mt-0.5">
                  {stats.todayFocusMinutes > 0 ? `${stats.todayFocusMinutes}m today` : `${stats.weeklyStudyHours || 0}h weekly`}
                </span>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase text-white/50 tracking-wider">
                  Habit Consistency
                </p>
                <p className="text-xl font-semibold text-white mt-0.5">
                  {habitPct}%
                </p>
                <span className="font-mono text-[10px] text-[#8fd94e] inline-flex items-center gap-0.5 mt-0.5">
                  {stats.completedTodayHabits ?? 0}/{stats.totalHabits ?? 0} Done
                </span>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase text-white/50 tracking-wider">
                  Tasks Pending
                </p>
                <p className="text-xl font-semibold text-white mt-0.5">
                  {stats.pendingTasks ?? 0}
                </p>
                <span className="font-mono text-[10px] text-[#ff8a4a] inline-flex items-center gap-0.5 mt-0.5">
                  {stats.totalTasks ?? 0} Total
                </span>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase text-white/50 tracking-wider">
                  Savings Rate
                </p>
                <p className="text-xl font-semibold text-white mt-0.5">
                  {formatCurrency(stats.netSavings ?? 0, currency)}
                </p>
                <span className="font-mono text-[10px] text-white/60 inline-flex items-center gap-0.5 mt-0.5">
                  {savingsRateText}
                </span>
              </div>
            </div>
          </div>

          {/* READINESS & SCORE CARD (Mira Sleep Score equivalent) */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-[32px] p-6 sm:p-8 border border-[#e8e8e5] shadow-[0_4px_24px_rgba(15,17,15,0.03)] flex flex-col justify-between">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6b6b68] font-semibold">
                  READINESS SCORE
                </span>
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-[#f1f7da] text-[#3f7a1e] border border-[#e1efc5]">
                  {readinessStatus}
                </span>
              </div>

              {/* Big Score Display */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-semibold tracking-[-0.05em] text-[#0f110f]">
                  {momentumScore}
                </span>
                <span className="font-mono text-sm text-[#94948f]">
                  / 100
                </span>
              </div>
              <p className="text-xs text-[#6b6b68] mt-1">
                {readinessDescription}
              </p>
            </div>

            {/* Factors Progress Bars (Mira style) */}
            <div className="my-6 space-y-4">
              {/* Duration / Focus */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-medium text-[#0f110f]">Daily Focus</span>
                  <span className="font-mono text-[#6b6b68]">{focusDisplay}</span>
                </div>
                <div className="h-1.5 w-full bg-[#f1f1ef] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0f110f] rounded-full" style={{ width: focusProgressWidth }} />
                </div>
              </div>

              {/* Habit Completion */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-medium text-[#0f110f]">Habit Checklist</span>
                  <span className="font-mono text-[#6b6b68]">{doneH} / {totalH} ({habitPct}%)</span>
                </div>
                <div className="h-1.5 w-full bg-[#f1f1ef] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8fd94e] rounded-full" style={{ width: `${habitPct}%` }} />
                </div>
              </div>

              {/* Tasks Completion */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-medium text-[#0f110f]">Task Velocity</span>
                  <span className="font-mono text-[#6b6b68]">
                    {stats.completedTasks ?? 0} Done
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#f1f1ef] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0f110f] rounded-full" style={{ width: taskProgressWidth }} />
                </div>
              </div>

              {/* Budget Health */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-medium text-[#0f110f]">Budget Health</span>
                  <span className="font-mono text-[#6b6b68]">
                    {formatCurrency(stats.monthlyExpenses ?? 0, currency)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#f1f1ef] rounded-full overflow-hidden">
                  <div className="h-full bg-[#3f7a1e] rounded-full" style={{ width: budgetProgressWidth }} />
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <div className="pt-2">
              <Link href="/analytics">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  Inspect System Metrics
                  <ChevronRight size={14} />
                </Button>
              </Link>
            </div>
          </div>

        </section>

        {/* ======================================================== */}
        {/* 3. FOUR BENTO METRIC STAT CARDS */}
        {/* ======================================================== */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

          {/* Monthly Finance */}
          {/* Monthly Finance */}
         {/* Monthly Finance */}
<div className="flex flex-col justify-between relative overflow-hidden rounded-2xl border border-[#e8e7e2] bg-white p-5 transition-all duration-300 hover:border-[#d5d3cb]">

  <div className="flex items-start justify-between">
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#888780]">
        MONTHLY EXPENSE
      </p>

      <h3 className="text-2xl sm:text-3xl font-semibold text-[#171815] mt-2 tracking-tight">
        {formatCurrency(stats.monthlyExpenses ?? 0, currency)}
      </h3>
    </div>

    <div className="w-11 h-11 rounded-xl bg-[#f5f4ef] border border-[#eeede7] flex items-center justify-center text-[#252720]">
      <Wallet size={19} strokeWidth={1.7} />
    </div>
  </div>

  <div className="mt-6 pt-4 border-t border-[#eeede8] flex items-center justify-between">
    <span className="text-[11px] font-medium text-[#888780] uppercase tracking-wider">
      Net Savings
    </span>

    <span className="text-sm font-semibold text-[#252720] tracking-tight">
      {formatCurrency(stats.netSavings ?? 0, currency)}
    </span>
  </div>

</div>


          {/* Active Habits */}
          <Card hover className="flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#6b6b68]">
                  ACTIVE HABITS
                </p>
                <h3 className="text-2xl sm:text-3xl font-semibold text-[#0f110f] mt-1 tracking-tight">
                  {stats.totalHabits ?? 0}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#f1f1ef] flex items-center justify-center text-[#0f110f]">
                <CheckSquare size={16} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#f1f7da] text-[#3f7a1e]">
                {stats.completedTodayHabits ?? 0} done today
              </span>
            </div>
          </Card>



          {/* Today's Tasks */}
          <Card hover className="flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#6b6b68]">
                  FOCUS TASKS
                </p>
                <h3 className="text-2xl sm:text-3xl font-semibold text-[#0f110f] mt-1 tracking-tight">
                  {stats.totalTasks ?? 0}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#f1f1ef] flex items-center justify-center text-[#0f110f]">
                <Clock size={16} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#ffd9c7] text-[#b4501e]">
                {stats.pendingTasks ?? 0} pending
              </span>
            </div>
          </Card>

          {/* Goals & Projects */}
          <Card hover className="flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#6b6b68]">
                  ACTIVE GOALS
                </p>
                <h3 className="text-2xl sm:text-3xl font-semibold text-[#0f110f] mt-1 tracking-tight">
                  {stats.activeGoalsCount ?? 0}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#f1f1ef] flex items-center justify-center text-[#0f110f]">
                <Target size={16} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#f1f7da] text-[#3f7a1e]">
                {stats.totalActiveProjects ?? 0} projects
              </span>
            </div>
          </Card>
        </section>

        {/* ======================================================== */}
        {/* 4. TODAY'S HABITS / PRIORITY TASKS / ACTIVITY CHART */}
        {/* ======================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* TODAY'S HABITS CHECKLIST */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#ececea]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#f1f1ef] flex items-center justify-center text-[#0f110f]">
                    <CheckSquare size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0f110f]">
                      Today&apos;s Habits
                    </h3>
                    <p className="font-mono text-[10px] text-[#6b6b68]">
                      Click to toggle status
                    </p>
                  </div>
                </div>

                <Link href="/habits" className="text-xs font-medium text-[#6b6b68] hover:text-[#0f110f] flex items-center">
                  All <ChevronRight size={13} />
                </Link>
              </div>

              {widgets.habits?.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {widgets.habits.slice(0, 5).map((habit) => {
                    const isCompleted = habit.completedDates?.includes(todayStr);

                    return (
                      <div
                        key={habit._id}
                        onClick={() => handleToggleHabit(habit._id)}
                        className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-150 border select-none ${isCompleted
                            ? 'bg-[#f6f6f5] border-[#ececea]'
                            : 'bg-white border-[#e8e8e5] hover:border-[#d2d2ce]'
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors border ${isCompleted
                                ? 'bg-[#0f110f] border-[#0f110f] text-[#d7f43a]'
                                : 'bg-white border-[#d2d2ce]'
                              }`}
                          >
                            {isCompleted && <span className="text-xs font-bold">✓</span>}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs font-medium truncate ${isCompleted ? 'line-through text-[#94948f]' : 'text-[#0f110f]'}`}>
                              {habit.title}
                            </p>
                            <span className="font-mono text-[10px] text-[#6b6b68]">
                              {habit.currentStreak || 0} streak
                            </span>
                          </div>
                        </div>

                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#f1f1ef] text-[#6b6b68]">
                          {habit.category || 'General'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No habits logged"
                  description="Add daily habits you wish to track."
                />
              )}
            </div>

            <div className="pt-4 border-t border-[#ececea] mt-5">
              <Link href="/habits">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  Open Habit Tracker
                </Button>
              </Link>
            </div>
          </Card>

          {/* PRIORITY TASKS */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#ececea]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#f1f1ef] flex items-center justify-center text-[#0f110f]">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0f110f]">
                      Priority Tasks
                    </h3>
                    <p className="font-mono text-[10px] text-[#6b6b68]">
                      Active work queue
                    </p>
                  </div>
                </div>

                <Link href="/productivity" className="text-xs font-medium text-[#6b6b68] hover:text-[#0f110f] flex items-center">
                  All <ChevronRight size={13} />
                </Link>
              </div>

              {widgets.todayTasks?.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {widgets.todayTasks.slice(0, 5).map((task) => {
                    const isDone = task.status === 'Completed';

                    return (
                      <div
                        key={task._id}
                        onClick={() => handleToggleTask(task._id, task.status)}
                        className={`flex items-start justify-between p-3 rounded-2xl cursor-pointer transition-all duration-150 border select-none ${isDone
                            ? 'bg-[#f6f6f5] border-[#ececea]'
                            : 'bg-white border-[#e8e8e5] hover:border-[#d2d2ce]'
                          }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isDone}
                            readOnly
                            className="mt-0.5 rounded-full accent-[#0f110f] cursor-pointer"
                          />
                          <div className="min-w-0">
                            <p className={`text-xs font-medium truncate ${isDone ? 'line-through text-[#94948f]' : 'text-[#0f110f]'}`}>
                              {task.title}
                            </p>
                            <p className="font-mono text-[10px] text-[#6b6b68] mt-0.5">
                              {task.category}
                              {task.dueDate && ` • ${formatDate(task.dueDate)}`}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${task.priority === 'Urgent'
                              ? 'bg-[#ffe5e5] text-[#d96c6c]'
                              : task.priority === 'High'
                                ? 'bg-[#ffd9c7] text-[#b4501e]'
                                : 'bg-[#f1f1ef] text-[#6b6b68]'
                            }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="Queue is clear"
                  description="You have no pending tasks today."
                />
              )}
            </div>

            <div className="pt-4 border-t border-[#ececea] mt-5">
              <Link href="/productivity">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  Open Productivity Workspace
                </Button>
              </Link>
            </div>
          </Card>

          {/* WEEKLY ACTIVITY BAR CHART */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#ececea]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#f1f1ef] flex items-center justify-center text-[#0f110f]">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0f110f]">
                      Weekly Activity
                    </h3>
                    <p className="font-mono text-[10px] text-[#6b6b68]">
                      Habits &amp; tasks velocity
                    </p>
                  </div>
                </div>

                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#f1f1ef] text-[#6b6b68]">
                  Past 7 Days
                </span>
              </div>

              <div className="h-48 w-full pt-4">
                {widgets.weeklyActivityChart?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={widgets.weeklyActivityChart} barGap={4}>
                      <XAxis
                        dataKey="day"
                        stroke="#94948f"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        fontFamily="Geist Mono, monospace"
                      />
                      <YAxis
                        stroke="#94948f"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        fontFamily="Geist Mono, monospace"
                      />
                      <Tooltip
                        cursor={{ fill: '#f1f1ef' }}
                        contentStyle={{
                          backgroundColor: '#0f110f',
                          color: '#ffffff',
                          borderColor: '#232723',
                          borderRadius: '16px',
                          fontSize: '11px',
                          fontFamily: 'Geist Mono, monospace',
                          boxShadow: '0 12px 30px rgba(15,17,15,0.15)',
                        }}
                      />
                      <Bar
                        dataKey="habits"
                        fill="#0f110f"
                        radius={[4, 4, 0, 0]}
                        name="Habits"
                      />
                      <Bar
                        dataKey="tasks"
                        fill="#8fd94e"
                        radius={[4, 4, 0, 0]}
                        name="Tasks"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    title="No activity data"
                    description="Complete actions to populate charts."
                  />
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#ececea] mt-5">
              <Link href="/analytics">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  Detailed System Analytics
                </Button>
              </Link>
            </div>
          </Card>

        </section>

        {/* ======================================================== */}
        {/* 5. PERSONAL WORKSPACE: FINANCE, GOALS, TRAVEL, ORBIT */}
        {/* ======================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6b6b68]">
                CONNECTED WORKSPACE
              </p>
              <h2 className="text-xl font-semibold text-[#0f110f] tracking-tight">
                Finances, Goals, Travel &amp; Orbit
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {/* Recent Finance */}
            <Card className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#ececea]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#f1f1ef] flex items-center justify-center text-[#0f110f]">
                      <Wallet size={14} />
                    </div>
                    <span className="text-xs font-semibold text-[#0f110f]">Recent Finance</span>
                  </div>
                  <Link href="/expenses" className="font-mono text-[10px] text-[#6b6b68] hover:text-[#0f110f]">
                    View all
                  </Link>
                </div>

                <div className="space-y-2.5 mt-3">
                  {widgets.recentTransactions?.length > 0 ? (
                    widgets.recentTransactions.slice(0, 4).map((txn) => (
                      <div key={txn._id} className="flex items-center justify-between text-xs py-1">
                        <div className="truncate pr-2">
                          <p className="font-medium text-[#0f110f] truncate">{txn.title}</p>
                          <span className="font-mono text-[10px] text-[#6b6b68]">{txn.category}</span>
                        </div>
                        <span className={`font-mono text-xs font-semibold ${txn.type === 'income' ? 'text-[#3f7a1e]' : 'text-[#0f110f]'}`}>
                          {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount, currency)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#94948f]">No recent transactions.</p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#ececea] mt-4">
                <Link href="/expenses">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    Open Expenses
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Active Goals */}
            <Card className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#ececea]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#f1f1ef] flex items-center justify-center text-[#0f110f]">
                      <Target size={14} />
                    </div>
                    <span className="text-xs font-semibold text-[#0f110f]">Active Goals</span>
                  </div>
                  <Link href="/goals" className="font-mono text-[10px] text-[#6b6b68] hover:text-[#0f110f]">
                    View all
                  </Link>
                </div>

                <div className="space-y-3 mt-3">
                  {widgets.activeGoals?.length > 0 ? (
                    widgets.activeGoals.slice(0, 3).map((goal) => (
                      <div key={goal._id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="truncate font-medium text-[#0f110f]">{goal.title}</span>
                          <span className="font-mono text-[11px] font-semibold text-[#0f110f]">{goal.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#f1f1ef] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0f110f] rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, Number(goal.progress) || 0))}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#94948f]">No goals logged yet.</p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#ececea] mt-4">
                <Link href="/goals">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    Open Goal Tracker
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Upcoming Travel */}
            <Card className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#ececea]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#f1f1ef] flex items-center justify-center text-[#0f110f]">
                      <Compass size={14} />
                    </div>
                    <span className="text-xs font-semibold text-[#0f110f]">Upcoming Trips</span>
                  </div>
                  <Link href="/travel" className="font-mono text-[10px] text-[#6b6b68] hover:text-[#0f110f]">
                    View all
                  </Link>
                </div>

                <div className="space-y-2 mt-3">
                  {widgets.upcomingTrips?.length > 0 ? (
                    widgets.upcomingTrips.slice(0, 2).map((trip) => (
                      <div key={trip._id} className="p-2.5 rounded-xl bg-[#f6f6f5] border border-[#ececea] text-xs">
                        <p className="font-semibold text-[#0f110f] truncate">{trip.destination}</p>
                        <p className="font-mono text-[10px] text-[#6b6b68] mt-0.5">
                          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant="default" size="sm">{trip.status}</Badge>
                          <span className="font-mono text-[10px] text-[#6b6b68]">
                            {formatCurrency(trip.budget, currency)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#94948f]">No trips planned.</p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#ececea] mt-4">
                <Link href="/travel">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    Open Travel Planner
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Orbit Follow-ups */}
            <Card className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#ececea]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#f1f1ef] flex items-center justify-center text-[#0f110f]">
                      <PhoneCall size={14} />
                    </div>
                    <span className="text-xs font-semibold text-[#0f110f]">Orbit Calls</span>
                  </div>
                  <Link href="/orbit" className="font-mono text-[10px] text-[#6b6b68] hover:text-[#0f110f]">
                    View all
                  </Link>
                </div>

                <div className="space-y-2 mt-3">
                  {widgets.upcomingFollowUps?.length > 0 ? (
                    widgets.upcomingFollowUps.slice(0, 2).map((call) => (
                      <div key={call._id} className="p-2.5 rounded-xl bg-[#f6f6f5] border border-[#ececea] text-xs">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-[#0f110f] truncate">{call.contact?.name || 'Contact'}</p>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#ffd9c7] text-[#b4501e]">
                            Follow-up
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6b6b68] truncate mt-0.5">{call.purpose || 'Check-in'}</p>
                        <p className="font-mono text-[10px] text-[#0f110f] font-medium mt-1">
                          Due: {formatDate(call.followUpDate)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#94948f]">No pending call reminders.</p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#ececea] mt-4">
                <Link href="/orbit">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    Open Orbit CRM
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>

      </div>
    </AppLayout>
  );
}
