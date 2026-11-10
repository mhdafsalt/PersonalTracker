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
  const COLORS = ['#10B981', '#3B82F6', '#D6A24A', '#4F9B72', '#D96C6C', '#8DA382'];

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
      <div className="space-y-6 sm:space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">
              Cross-module intelligence, financial margins, habit consistency, and study trends.
            </p>
          </div>

          {/* Time range switcher */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  timeRange === t.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
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
            color="#4F9B72"
          />
          <StatCard
            title="Productivity Ratio"
            value={`${productivity.completionRate ?? 0}%`}
            subtitle={`${productivity.completedTasks ?? 0} of ${productivity.totalTasks ?? 0} tasks done`}
            icon={Clock}
            color="#10B981"
          />
          <StatCard
            title="Total Study Hours"
            value={`${study.totalStudyHours ?? 0} hrs`}
            subtitle="Deep learning sessions"
            icon={GraduationCap}
            color="#34D399"
          />
          <StatCard
            title="Design Revenue"
            value={formatCurrency(creative.designBilled ?? 0, currency)}
            subtitle={`${creative.totalDesignProjects ?? 0} client projects`}
            icon={Briefcase}
            color="#D6A24A"
          />
        </div>

        {/* Visual Charts Grid: Financial Outflows & Study Subject Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Financial Outflows */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-base text-slate-900">Expense Category Breakdown</h3>
                </div>
                <Badge variant="sage" size="sm">
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
                        paddingAngle={4}
                      >
                        {financials.expenseByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => formatCurrency(val, currency)}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-16 text-center">No expenses in this timeframe.</p>
              )}
            </div>

            {financials.expenseByCategory && (
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-200">
                {financials.expenseByCategory.map((item, idx) => (
                  <div key={item.name} className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      {item.name}
                    </span>
                    <span className="font-semibold text-slate-900">{formatCurrency(item.value, currency)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Chart 2: Study Subject Distribution */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-base text-slate-900">Study Hours by Subject</h3>
                </div>
                <Badge variant="sage" size="sm">
                  {study.totalStudyHours ?? 0} Total Hours
                </Badge>
              </div>

              {study.studyBySubject && study.studyBySubject.length > 0 ? (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={study.studyBySubject}>
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="hours" fill="#10B981" radius={[6, 6, 0, 0]} name="Hours Logged" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-16 text-center">No study hours in this timeframe.</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
              <span>Goal: 40 hrs / month</span>
              <span className="font-semibold text-slate-900">{study.totalStudyHours ?? 0} hrs completed</span>
            </div>
          </Card>
        </div>

        {/* Detailed Metrics Table: Cross-Module Summary */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/60">
            <h3 className="font-semibold text-base text-slate-900">System Performance Matrix</h3>
            <p className="text-xs text-slate-500">Aggregated summary across your personal management database.</p>
          </div>

          <div className="divide-y divide-slate-200 text-xs sm:text-sm">
            <div className="p-4 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Average Habit Streak
              </span>
              <span className="font-bold text-slate-900">{habits.avgStreak ?? 0} consecutive days</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-rose-600" /> Fitness Energy Burn
              </span>
              <span className="font-bold text-slate-900">{fitness.totalCaloriesBurned ?? 0} kcal burned</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" /> Literature & Reading Progress
              </span>
              <span className="font-bold text-slate-900">{reading.totalPagesRead ?? 0} pages completed</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" /> Overall Goal Milestone Progression
              </span>
              <span className="font-bold text-slate-900">{goals.avgGoalProgress ?? 0}% achieved</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" /> Total Time Tracked in App
              </span>
              <span className="font-bold text-slate-900">{time.totalTrackedHours ?? 0} hours</span>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

