'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/format';
import {
  BarChart3,
  TrendingUp,
  Wallet,
  Clock,
  Dumbbell,
  GraduationCap,
  BookOpen,
  Target,
  Briefcase,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/analytics?timeRange=${timeRange}`);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const currency = user?.currency || 'INR';
  const COLORS = ['#111315', '#D4F648', '#FF5722', '#0284C7', '#10B981', '#F59E0B'];

  const financials = data?.financials || {};
  const habits = data?.habits || {};
  const productivity = data?.productivity || {};
  const fitness = data?.fitness || {};
  const study = data?.study || {};
  const reading = data?.reading || {};
  const time = data?.time || {};
  const goals = data?.goals || {};
  const creative = data?.creative || {};

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-7">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">Intelligence & Metrics</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight">Reports & Analytics</h1>
            <p className="text-xs sm:text-sm text-[#686E77] mt-1">
              Cross-module intelligence, financial margins, habit consistency, and study trends.
            </p>
          </div>

          {/* Time range switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F0F2F5] rounded-full max-w-fit overflow-x-auto scrollbar-none">
            {[
              { id: 'today', name: 'Today' },
              { id: 'week', name: 'This Week' },
              { id: 'month', name: 'This Month' },
              { id: 'year', name: 'This Year' },
              { id: 'all', name: 'All Time' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  timeRange === t.id
                    ? 'bg-[#111315] text-white shadow-xs'
                    : 'text-[#686E77] hover:text-[#111315]'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Top 4 Macro Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Net Cashflow"
            value={formatCurrency(financials.netSavings ?? 0, currency)}
            subtitle={`${formatCurrency(financials.totalIncome ?? 0, currency)} total income`}
            icon={Wallet}
            trend="14"
          />
          <StatCard
            title="Productivity Ratio"
            value={`${productivity.completionRate ?? 0}%`}
            subtitle={`${productivity.completedTasks ?? 0} of ${productivity.totalTasks ?? 0} tasks done`}
            icon={Clock}
            trend="22"
          />
          <StatCard
            title="Total Study Hours"
            value={`${study.totalStudyHours ?? 0} hrs`}
            subtitle="Deep learning sessions"
            icon={GraduationCap}
            trend="10"
          />
          <StatCard
            title="Design Revenue"
            value={formatCurrency(creative.designBilled ?? 0, currency)}
            subtitle={`${creative.totalDesignProjects ?? 0} client projects`}
            icon={Briefcase}
            trend="18"
          />
        </div>

        {/* Visual Charts Grid: Financial Outflows & Study Subject Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Financial Outflows */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#111315] text-[#D4F648] flex items-center justify-center font-bold">
                    <PieChartIcon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-[#111315]">Expense Category Breakdown</h3>
                </div>
                <Badge variant="lime" size="xs">
                  {formatCurrency(financials.totalExpenses ?? 0, currency)} total
                </Badge>
              </div>

              {financials.expenseByCategory && financials.expenseByCategory.length > 0 ? (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={financials.expenseByCategory}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {financials.expenseByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => formatCurrency(val, currency)}
                        contentStyle={{
                          backgroundColor: '#111315',
                          border: 'none',
                          borderRadius: '16px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-[#686E77] py-16 text-center">No expenses in this timeframe.</p>
              )}
            </div>

            {financials.expenseByCategory && (
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[#E5E8ED]">
                {financials.expenseByCategory.map((item, idx) => (
                  <div key={item.name} className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[#686E77]">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      {item.name}
                    </span>
                    <span className="font-bold text-[#111315]">{formatCurrency(item.value, currency)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Chart 2: Study Subject Distribution */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#111315] text-[#D4F648] flex items-center justify-center font-bold">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-[#111315]">Study Hours by Subject</h3>
                </div>
                <Badge variant="default" size="xs">
                  {study.totalStudyHours ?? 0} Total Hours
                </Badge>
              </div>

              {study.studyBySubject && study.studyBySubject.length > 0 ? (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={study.studyBySubject} barGap={6}>
                      <XAxis dataKey="name" stroke="#8C939F" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#8C939F" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111315',
                          border: 'none',
                          borderRadius: '16px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="hours" fill="#111315" radius={[12, 12, 0, 0]} name="Hours Logged" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-[#686E77] py-16 text-center">No study hours in this timeframe.</p>
              )}
            </div>

            <div className="pt-4 border-t border-[#E5E8ED] text-xs text-[#686E77] flex justify-between font-medium">
              <span>Goal: 40 hrs / month</span>
              <span className="font-bold text-[#111315]">{study.totalStudyHours ?? 0} hrs completed</span>
            </div>
          </Card>
        </div>

        {/* Detailed Metrics Table: Cross-Module Summary */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E5E8ED] bg-[#F7F8FA]">
            <h3 className="font-bold text-base text-[#111315]">System Performance Matrix</h3>
            <p className="text-xs text-[#686E77] mt-0.5">Aggregated summary across your personal management database.</p>
          </div>

          <div className="divide-y divide-[#E5E8ED] text-xs sm:text-sm">
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <span className="text-[#686E77] flex items-center gap-2.5 font-medium">
                <TrendingUp className="w-4 h-4 text-[#111315]" /> Average Habit Streak
              </span>
              <span className="font-extrabold text-[#111315]">{habits.avgStreak ?? 0} consecutive days</span>
            </div>
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <span className="text-[#686E77] flex items-center gap-2.5 font-medium">
                <Dumbbell className="w-4 h-4 text-[#FF5722]" /> Fitness Energy Burn
              </span>
              <span className="font-extrabold text-[#111315]">{fitness.totalCaloriesBurned ?? 0} kcal burned</span>
            </div>
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <span className="text-[#686E77] flex items-center gap-2.5 font-medium">
                <BookOpen className="w-4 h-4 text-[#0284C7]" /> Literature & Reading Progress
              </span>
              <span className="font-extrabold text-[#111315]">{reading.totalPagesRead ?? 0} pages completed</span>
            </div>
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <span className="text-[#686E77] flex items-center gap-2.5 font-medium">
                <Target className="w-4 h-4 text-[#10B981]" /> Overall Goal Milestone Progression
              </span>
              <span className="font-extrabold text-[#111315]">{goals.avgGoalProgress ?? 0}% achieved</span>
            </div>
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <span className="text-[#686E77] flex items-center gap-2.5 font-medium">
                <Clock className="w-4 h-4 text-[#111315]" /> Total Time Tracked in App
              </span>
              <span className="font-extrabold text-[#111315]">{time.totalTrackedHours ?? 0} hours</span>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
