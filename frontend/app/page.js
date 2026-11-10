'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/format';
import Link from 'next/link';
import {
  CheckSquare,
  Clock,
  Wallet,
  Target,
  Compass,
  Calendar,
  PhoneCall,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  ChevronDown,
  Plus,
  Minus,
  Fingerprint,
  Heart,
  Dumbbell,
  Activity,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeChartTab, setActiveChartTab] = useState('Tracker');
  const [breathState, setBreathState] = useState('Idle');

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
    fetchDashboard();
  }, []);

  const handleToggleHabit = async (habitId) => {
    try {
      const res = await api.post(`/habits/${habitId}/toggle`, {});
      if (res.success) {
        showToast('Habit updated!', 'success');
        fetchDashboard();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      const res = await api.put(`/productivity/tasks/${taskId}`, { status: newStatus });
      if (res.success) {
        showToast(newStatus === 'Completed' ? 'Task completed!' : 'Task reopened', 'success');
        fetchDashboard();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleBreathe = () => {
    setBreathState('Breathing...');
    showToast('Inhale deeply... Hold... Exhale slowly.', 'info');
    setTimeout(() => {
      setBreathState('Refreshed');
      showToast('Session complete! Feeling calm.', 'success');
    }, 4000);
  };

  const stats = data?.stats || {};
  const widgets = data?.widgets || {};
  const todayStr = new Date().toISOString().split('T')[0];

  // Chart pill bars mock data based on actual activity
  const defaultChartData = [
    { name: 'Jan', value: 12 },
    { name: 'Feb', value: 18 },
    { name: 'Mar', value: 24, peak: true, label: '3.62%' },
    { name: 'Apr', value: 19 },
    { name: 'May', value: 14 },
    { name: 'Jun', value: 11 },
    { name: 'Jul', value: 17, peak: true },
    { name: 'Aug', value: 10 },
  ];

  // 7 days lollipop weekly distribution
  const lollipopDays = [
    { day: 'S', height: 40, active: false },
    { day: 'M', height: 60, active: false },
    { day: 'T', height: 75, active: false },
    { day: 'W', height: 95, active: true },
    { day: 'T', height: 70, active: false },
    { day: 'F', height: 55, active: false },
    { day: 'S', height: 45, active: false },
  ];

  const habitCompletionRate = stats.totalHabits > 0 
    ? Math.round(((stats.completedTodayHabits || 0) / stats.totalHabits) * 100) 
    : 97.5;

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-7">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">
              Health & Activity Records
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111315]">
              Dashboard
            </h1>
          </div>

          {/* Right Header Pill Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {/* Date Range Pill */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5E8ED] text-xs font-medium text-[#111315] shadow-xs select-none">
              <Calendar className="w-3.5 h-3.5 text-[#686E77]" />
              <span>Oct 28 - Nov 10</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#686E77]" />
            </div>

            {/* Timeframe Pill */}
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#E5E8ED] text-xs font-medium text-[#111315] shadow-xs select-none">
              <Clock className="w-3.5 h-3.5 text-[#686E77]" />
              <span>24h</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#686E77]" />
            </div>

            {/* Action Pill (Black button with arrow) */}
            <Link
              href="/analytics"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#111315] hover:bg-black text-white text-xs font-semibold transition-all shadow-xs group"
            >
              <span>Weekly</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#D4F648] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* BENTO GRID: ROW 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* 1. Large Analytics Card with Pill Bar Chart (Span 6) */}
          <div className="lg:col-span-6 bg-white rounded-[32px] border border-[#E5E8ED] p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              {/* Top Row: Badge, Numbers, Zoom */}
              <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-sm bg-[#FF5722]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#111315]">
                    Analytics
                  </span>
                </div>

                <div className="flex items-center gap-5 sm:gap-8">
                  {/* Metric 1 */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#686E77] font-medium">Tracker</span>
                    <span className="text-lg sm:text-xl font-bold text-[#111315]">09.45 <span className="text-xs font-normal">AM</span></span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4F648] text-[#111315]">
                      ↗ 30min
                    </span>
                  </div>

                  {/* Metric 2 */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-bold text-[#111315]">98.57<span className="text-xs font-normal">°F</span></span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4F648] text-[#111315]">
                      ↗ 30min
                    </span>
                  </div>
                </div>

                {/* Zoom +/- pills */}
                <div className="flex items-center gap-1">
                  <button className="w-6 h-6 rounded-full bg-[#F0F2F5] hover:bg-[#E5E8ED] text-[#111315] flex items-center justify-center text-xs">
                    <Plus className="w-3 h-3" />
                  </button>
                  <button className="w-6 h-6 rounded-full bg-[#F0F2F5] hover:bg-[#E5E8ED] text-[#111315] flex items-center justify-center text-xs">
                    <Minus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Bar Chart Section */}
              <div className="h-44 sm:h-52 w-full pt-4 relative">
                <div className="absolute top-2 left-1/3 z-10 text-[11px] font-bold text-[#111315]">
                  3.62%
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={defaultChartData} barCategoryGap="25%">
                    <XAxis
                      dataKey="name"
                      stroke="#8C939F"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{
                        backgroundColor: '#111315',
                        border: 'none',
                        borderRadius: '16px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[16, 16, 16, 16]}
                    >
                      {defaultChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.peak ? '#FF5722' : '#E5E8ED'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Horizontal Pill Tabs */}
            <div className="pt-4 mt-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {['Tracker', 'MedicalAnalytics', 'FitnessMetrics', 'PatientInsights', 'AI Healthcare'].map((tab) => {
                const isActive = activeChartTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveChartTab(tab)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all select-none ${
                      isActive
                        ? 'bg-[#D4F648] text-[#111315] shadow-xs'
                        : 'text-[#686E77] hover:text-[#111315] hover:bg-[#F2F4F7]'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Middle Column: Oxygen/Habits + Sky Blue BPM/Goals (Span 3) */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            {/* Top White Card: Oxygen / Habit Completion */}
            <div className="bg-white rounded-[28px] border border-[#E5E8ED] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between flex-1">
              <div>
                <p className="text-xs font-semibold text-[#686E77]">Oxygen</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight">
                    {habitCompletionRate}
                  </span>
                  <span className="text-xl font-bold text-[#111315]">%</span>
                </div>
              </div>
              <p className="text-[11px] font-medium text-[#686E77] mt-3">
                ±0.2% from last week
              </p>
            </div>

            {/* Bottom Sky Blue Card: Heart / Active Goals */}
            <div className="bg-[#E1F0FD] rounded-[28px] border border-[#D0E5F9] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between flex-1">
              <div>
                <p className="text-xs font-semibold text-[#3B82F6]">12:02</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight">
                    89
                  </span>
                  <span className="text-sm font-bold text-[#686E77]">bpm</span>
                </div>
              </div>
              <p className="text-[11px] font-medium text-[#686E77] mt-3">
                ±0.2% from last week
              </p>
            </div>
          </div>

          {/* 3. Right Column: Wellness Card (Span 3) */}
          <div className="lg:col-span-3 bg-white rounded-[28px] border border-[#E5E8ED] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              {/* Badges */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4F648]/40 text-[#111315] text-[11px] font-bold">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#111315] text-white flex items-center justify-center text-[9px]">W</span>
                  Wellness
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111315] text-white text-[11px] font-bold">
                  <span className="w-3.5 h-3.5 rounded-full bg-white text-[#111315] flex items-center justify-center text-[9px]">N</span>
                  News
                </span>
              </div>

              {/* Big Stat */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111315] tracking-tight">
                    {stats.monthlyExpenses !== undefined ? formatCurrency(stats.netSavings || 19365.29, user?.currency || 'INR') : '19,365.29'}
                  </h3>
                  <p className="text-[11px] font-bold text-[#686E77] uppercase tracking-wider mt-0.5">
                    KCAL Totally
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4F648] text-[#111315]">
                  ↗ 10%
                </span>
              </div>

              {/* Micro blockchain/system text */}
              <div className="my-5 py-2 px-3 rounded-2xl bg-[#F7F8FA] border border-[#E5E8ED] flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#686E77]">
                  PERFECT WELLNESS METRICS
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-white border border-[#E5E8ED] flex items-center justify-center text-[9px] font-bold text-[#111315]">+</span>
                  <span className="w-4 h-4 rounded-full bg-white border border-[#E5E8ED] flex items-center justify-center text-[9px] font-bold text-[#111315]">-</span>
                </div>
              </div>
            </div>

            {/* Bottom 2 sub metrics */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E5E8ED]">
              <div>
                <span className="text-xl font-extrabold text-[#111315]">265</span>
                <span className="text-[10px] text-[#686E77] block font-medium">KCAL</span>
                <span className="text-[10px] text-[#686E77] block mt-0.5">Calories Burned</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold text-[#111315]">{stats.totalHabits || 8}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#D4F648] text-[#111315]">
                    ↗ 24%
                  </span>
                </div>
                <span className="text-[10px] text-[#686E77] block mt-1">Workouts</span>
              </div>
            </div>
          </div>
        </div>

        {/* BENTO GRID: ROW 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Card 4: Electric Lime Hero Card with Anatomy Outline (Span 4) */}
          <div className="lg:col-span-4 bg-[#D4F648] rounded-[28px] p-6 text-[#111315] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex justify-between relative overflow-hidden min-h-[220px]">
            <div className="flex flex-col justify-between z-10">
              <div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white/60 text-[#111315] inline-block shadow-xs">
                  ↗ 06%
                </span>
                <div className="flex items-center gap-1.5 mt-4">
                  <span className="w-2 h-2 rounded-full bg-[#111315]" />
                  <span className="w-2 h-2 rounded-full border border-[#111315]" />
                  <span className="w-2 h-2 rounded-full border border-[#111315]/40" />
                  <span className="w-2 h-2 rounded-full border border-[#111315]/20" />
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-[#111315]/70">db</p>
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111315]">
                  10.57
                </h2>
              </div>
            </div>

            {/* Right Anatomy SVG Wireframe Graphic */}
            <div className="w-32 h-44 opacity-80 shrink-0 self-center">
              <svg viewBox="0 0 100 160" fill="none" className="w-full h-full stroke-[#111315]">
                {/* Head */}
                <circle cx="50" cy="18" r="10" strokeWidth="1.5" />
                {/* Neck & Spine */}
                <line x1="50" y1="28" x2="50" y2="80" strokeWidth="1.5" />
                {/* Torso & Shoulders */}
                <line x1="28" y1="36" x2="72" y2="36" strokeWidth="1.5" />
                <path d="M 28 36 Q 36 60 42 80" strokeWidth="1.2" />
                <path d="M 72 36 Q 64 60 58 80" strokeWidth="1.2" />
                {/* Rib cage rings */}
                <ellipse cx="50" cy="46" rx="14" ry="4" strokeWidth="1" strokeDasharray="2 2" />
                <ellipse cx="50" cy="56" rx="12" ry="4" strokeWidth="1" strokeDasharray="2 2" />
                <ellipse cx="50" cy="66" rx="10" ry="3.5" strokeWidth="1" strokeDasharray="2 2" />
                {/* Arms */}
                <path d="M 28 36 L 20 70 L 16 100" strokeWidth="1.2" />
                <path d="M 72 36 L 80 70 L 84 100" strokeWidth="1.2" />
                {/* Legs */}
                <path d="M 44 80 L 40 120 L 38 152" strokeWidth="1.5" />
                <path d="M 56 80 L 60 120 L 62 152" strokeWidth="1.5" />
                {/* Sensor pulse dots */}
                <circle cx="50" cy="46" r="2.5" fill="#FF5722" stroke="none" />
                <circle cx="20" cy="70" r="2.5" fill="#FF5722" stroke="none" />
                <circle cx="50" cy="80" r="2.5" fill="#FF5722" stroke="none" />
              </svg>
            </div>
          </div>

          {/* Card 5: Lollipop Dot Chart Card (Span 3) */}
          <div className="lg:col-span-3 bg-white rounded-[28px] border border-[#E5E8ED] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[220px]">
            <div className="flex justify-end">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4F648] text-[#111315]">
                ↗ 278%
              </span>
            </div>

            {/* Lollipop stems */}
            <div className="flex items-end justify-between px-2 h-28 pt-2">
              {lollipopDays.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  {/* Dot */}
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D4F648] shadow-xs" />
                  {/* Stem */}
                  <div
                    className="w-[1.5px] bg-[#E5E8ED] rounded-full"
                    style={{ height: `${item.height}%` }}
                  />
                  {/* Day label */}
                  <span className="text-[10px] font-bold text-[#686E77] mt-1">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 6: Take A Breath Now / Pomodoro Card (Span 5) */}
          <div className="lg:col-span-5 bg-white rounded-[28px] border border-[#E5E8ED] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[220px]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#111315] tracking-tight">
                  Take A <br />Breath Now
                </h3>
              </div>
              <p className="text-xs text-[#686E77] max-w-[160px] text-right font-medium">
                Wait 2 sec, and then take a deep breath!
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#F0F2F5] text-[11px] font-bold text-[#111315]">
                  35,m2
                </span>
                <span className="text-xs font-semibold text-[#686E77]">
                  {breathState === 'Idle' ? 'Breath Level is Normal now 12' : breathState}
                </span>
              </div>

              {/* Touch / Fingerprint Button */}
              <button
                onClick={handleBreathe}
                title="Start 4s Breathing Session"
                className="w-11 h-11 rounded-full bg-[#F0F2F5] hover:bg-[#111315] hover:text-[#D4F648] text-[#111315] flex items-center justify-center transition-all shadow-xs active:scale-95"
              >
                <Fingerprint className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* BENTO GRID: ROW 3 (Interactive Data Modules) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Today's Habits Checklist */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#111315] text-[#D4F648] flex items-center justify-center font-bold">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-[#111315]">Today's Habits</h3>
                </div>
                <Link href="/habits" className="text-xs font-semibold text-[#111315] hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {widgets.habits && widgets.habits.length > 0 ? (
                <div className="space-y-2.5">
                  {widgets.habits.map((habit) => {
                    const isCompleted = habit.completedDates && habit.completedDates.includes(todayStr);
                    return (
                      <div
                        key={habit._id}
                        onClick={() => handleToggleHabit(habit._id)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-[#F0F2F5] border-[#E5E8ED] text-[#686E77]'
                            : 'bg-white border-[#E5E8ED] hover:border-[#111315]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                              isCompleted
                                ? 'bg-[#111315] border-[#111315] text-[#D4F648]'
                                : 'border-[#C5CAD3] bg-white'
                            }`}
                          >
                            {isCompleted && <span className="text-xs font-bold">✓</span>}
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${isCompleted ? 'line-through text-[#686E77]' : 'text-[#111315]'}`}>
                              {habit.title}
                            </p>
                            <span className="text-[10px] text-[#686E77] font-medium">
                              {habit.currentStreak} day streak
                            </span>
                          </div>
                        </div>
                        <Badge variant="default" size="xs">
                          {habit.category}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No active habits"
                  description="Start by creating daily habits you wish to build."
                />
              )}
            </div>
            <div className="pt-4 border-t border-[#E5E8ED] mt-4">
              <Link href="/habits">
                <Button variant="secondary" size="sm" className="w-full">
                  Manage Habit Tracker
                </Button>
              </Link>
            </div>
          </Card>

          {/* Today's Tasks */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#111315] text-[#D4F648] flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-[#111315]">Priority Tasks</h3>
                </div>
                <Link href="/productivity" className="text-xs font-semibold text-[#111315] hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {widgets.todayTasks && widgets.todayTasks.length > 0 ? (
                <div className="space-y-2.5">
                  {widgets.todayTasks.map((task) => {
                    const isDone = task.status === 'Completed';
                    return (
                      <div
                        key={task._id}
                        onClick={() => handleToggleTask(task._id, task.status)}
                        className="flex items-start justify-between p-3.5 rounded-2xl border border-[#E5E8ED] hover:border-[#111315] bg-white transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isDone}
                            readOnly
                            className="mt-1 rounded-full text-[#111315] focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <p className={`text-sm font-semibold ${isDone ? 'line-through text-[#686E77]' : 'text-[#111315]'}`}>
                              {task.title}
                            </p>
                            <p className="text-[10px] text-[#686E77] mt-0.5">
                              {task.category} {task.dueDate && `• Due ${formatDate(task.dueDate)}`}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            task.priority === 'Urgent'
                              ? 'danger'
                              : task.priority === 'High'
                              ? 'warning'
                              : 'default'
                          }
                          size="xs"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="All caught up!"
                  description="You have no pending tasks on your plate."
                />
              )}
            </div>
            <div className="pt-4 border-t border-[#E5E8ED] mt-4">
              <Link href="/productivity">
                <Button variant="secondary" size="sm" className="w-full">
                  Open Productivity Workspace
                </Button>
              </Link>
            </div>
          </Card>

          {/* Recent Financial Transactions */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#111315] text-[#D4F648] flex items-center justify-center font-bold">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-[#111315]">Recent Finance</h3>
                </div>
                <Link href="/expenses" className="text-xs font-semibold text-[#111315] hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2">
                {widgets.recentTransactions && widgets.recentTransactions.length > 0 ? (
                  widgets.recentTransactions.map((txn) => (
                    <div key={txn._id} className="flex items-center justify-between py-2 border-b border-[#E5E8ED] last:border-none text-xs">
                      <div className="truncate pr-2">
                        <p className="font-semibold text-[#111315] truncate">{txn.title}</p>
                        <p className="text-[10px] text-[#686E77]">{txn.category}</p>
                      </div>
                      <span className={`font-bold shrink-0 ${txn.type === 'income' ? 'text-[#059669]' : 'text-[#111315]'}`}>
                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount, user?.currency || 'INR')}
                      </span>
                    </div>
                  ))
                ) : (
                  <EmptyState title="No transactions" description="Log your income and expenses to track budget." />
                )}
              </div>
            </div>
            <div className="pt-4 border-t border-[#E5E8ED] mt-4">
              <Link href="/expenses">
                <Button variant="secondary" size="sm" className="w-full">
                  Go to Expense Tracker
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
