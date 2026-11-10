'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { StatCard } from '../components/ui/StatCard';
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
  GraduationCap,
  Briefcase,
  Compass,
  Calendar,
  PhoneCall,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
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

  const stats = data?.stats || {};
  const widgets = data?.widgets || {};
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#6B8F71] to-[#547359] text-white p-6 sm:p-8 shadow-medium">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#CFDEC8]" />
              <span>Personal Operating System</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Centralized Personal Tracker
            </h2>
            <p className="mt-2 text-white/90 text-sm sm:text-base leading-relaxed">
              Track your daily habits, productivity focus, finances, fitness records, travel itineraries,
              and creative client studio from one unified dashboard.
            </p>
          </div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        </div>

        {/* 6 Key Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            title="Active Habits"
            value={stats.totalHabits ?? 0}
            subtitle={`${stats.completedTodayHabits ?? 0} done today`}
            icon={CheckSquare}
            color="#6B8F71"
          />
          <StatCard
            title="Today's Tasks"
            value={stats.totalTasks ?? 0}
            subtitle={`${stats.pendingTasks ?? 0} remaining`}
            icon={Clock}
            color="#A7B99B"
          />
          <StatCard
            title="Monthly Expense"
            value={formatCurrency(stats.monthlyExpenses ?? 0, user?.currency || 'INR')}
            subtitle={`${formatCurrency(stats.netSavings ?? 0, user?.currency || 'INR')} net savings`}
            icon={Wallet}
            color="#D96C6C"
          />
          <StatCard
            title="Active Goals"
            value={stats.activeGoalsCount ?? 0}
            subtitle="In progress"
            icon={Target}
            color="#D6A24A"
          />
          <StatCard
            title="Study Hours"
            value={`${stats.weeklyStudyHours ?? 0}h`}
            subtitle="Logged this week"
            icon={GraduationCap}
            color="#4F9B72"
          />
          <StatCard
            title="Active Projects"
            value={stats.totalActiveProjects ?? 0}
            subtitle="Creative & client"
            icon={Briefcase}
            color="#6B8F71"
          />
        </div>

        {/* Middle Section: Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Habits Checklist */}
          <Card className="lg:col-span-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#6B8F71]/15 text-[#6B8F71] flex items-center justify-center">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-base text-[#252923]">Today's Habits</h3>
                </div>
                <Link href="/habits" className="text-xs font-medium text-[#6B8F71] hover:underline flex items-center gap-0.5">
                  View all <ChevronRight className="w-3 h-3" />
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
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-[#FAF8F5] border-[#4F9B72]/30 text-[#252923]'
                            : 'bg-white border-[#E9E8E1] hover:border-[#6B8F71]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              isCompleted
                                ? 'bg-[#4F9B72] border-[#4F9B72] text-white'
                                : 'border-[#D5CFBF] bg-white'
                            }`}
                          >
                            {isCompleted && <span className="text-xs font-bold">✓</span>}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${isCompleted ? 'line-through text-[#777D75]' : 'text-[#252923]'}`}>
                              {habit.title}
                            </p>
                            <span className="text-[11px] text-[#777D75]">
                              {habit.currentStreak} day streak
                            </span>
                          </div>
                        </div>
                        <Badge variant="sage" size="sm">
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
            <div className="pt-4 border-t border-[#E9E8E1] mt-4">
              <Link href="/habits">
                <Button variant="secondary" size="sm" className="w-full">
                  Manage Habit Tracker
                </Button>
              </Link>
            </div>
          </Card>

          {/* Today's Tasks */}
          <Card className="lg:col-span-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#A7B99B]/20 text-[#6B8F71] flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-base text-[#252923]">Priority Tasks</h3>
                </div>
                <Link href="/productivity" className="text-xs font-medium text-[#6B8F71] hover:underline flex items-center gap-0.5">
                  View all <ChevronRight className="w-3 h-3" />
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
                        className="flex items-start justify-between p-3 rounded-xl border border-[#E9E8E1] hover:border-[#6B8F71]/50 bg-white transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isDone}
                            readOnly
                            className="mt-1 rounded text-[#6B8F71] focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <p className={`text-sm font-medium ${isDone ? 'line-through text-[#777D75]' : 'text-[#252923]'}`}>
                              {task.title}
                            </p>
                            <p className="text-[11px] text-[#777D75] mt-0.5">
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
                          size="sm"
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
            <div className="pt-4 border-t border-[#E9E8E1] mt-4">
              <Link href="/productivity">
                <Button variant="secondary" size="sm" className="w-full">
                  Open Productivity Workspace
                </Button>
              </Link>
            </div>
          </Card>

          {/* Weekly Activity Trends Chart */}
          <Card className="lg:col-span-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#4F9B72]/15 text-[#4F9B72] flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-base text-[#252923]">Weekly Activity</h3>
                </div>
                <Badge variant="sage" size="sm">Past 7 Days</Badge>
              </div>

              <div className="h-48 w-full pt-2">
                {widgets.weeklyActivityChart && widgets.weeklyActivityChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={widgets.weeklyActivityChart} barGap={4}>
                      <XAxis dataKey="day" stroke="#777D75" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#777D75" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E9E8E1',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="habits" fill="#6B8F71" radius={[4, 4, 0, 0]} name="Habits Done" />
                      <Bar dataKey="tasks" fill="#A7B99B" radius={[4, 4, 0, 0]} name="Tasks Done" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="No chart data" description="Complete habits or tasks to view charts." />
                )}
              </div>
            </div>
            <div className="pt-4 border-t border-[#E9E8E1] mt-4">
              <Link href="/analytics">
                <Button variant="secondary" size="sm" className="w-full">
                  Detailed Reports & Analytics
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Lower Row: Financials, Upcoming Trips, Events, Follow-ups */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Recent Financial Transactions */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-[#252923] flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#6B8F71]" /> Recent Finance
                </h4>
                <Link href="/expenses" className="text-xs text-[#6B8F71] hover:underline">
                  All
                </Link>
              </div>
              <div className="space-y-2">
                {widgets.recentTransactions && widgets.recentTransactions.length > 0 ? (
                  widgets.recentTransactions.map((txn) => (
                    <div key={txn._id} className="flex items-center justify-between py-1.5 border-b border-[#E9E8E1]/60 last:border-none text-xs">
                      <div className="truncate pr-2">
                        <p className="font-medium text-[#252923] truncate">{txn.title}</p>
                        <p className="text-[10px] text-[#777D75]">{txn.category}</p>
                      </div>
                      <span className={`font-semibold shrink-0 ${txn.type === 'income' ? 'text-[#4F9B72]' : 'text-[#252923]'}`}>
                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount, user?.currency || 'INR')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#777D75]">No transactions recorded.</p>
                )}
              </div>
            </div>
            <div className="pt-3 border-t border-[#E9E8E1] mt-3">
              <Link href="/expenses">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  Go to Expense Tracker
                </Button>
              </Link>
            </div>
          </Card>

          {/* Active Goals */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-[#252923] flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#D6A24A]" /> Active Goals
                </h4>
                <Link href="/goals" className="text-xs text-[#6B8F71] hover:underline">
                  All
                </Link>
              </div>
              <div className="space-y-3">
                {widgets.activeGoals && widgets.activeGoals.length > 0 ? (
                  widgets.activeGoals.map((goal) => (
                    <div key={goal._id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-[#252923] truncate pr-2">{goal.title}</span>
                        <span className="font-semibold text-[#6B8F71] shrink-0">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-[#FAF8F5] rounded-full h-1.5 border border-[#E9E8E1]">
                        <div
                          className="bg-[#6B8F71] h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#777D75]">No active goals yet.</p>
                )}
              </div>
            </div>
            <div className="pt-3 border-t border-[#E9E8E1] mt-3">
              <Link href="/goals">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  Go to Goal Tracker
                </Button>
              </Link>
            </div>
          </Card>

          {/* Upcoming Trips */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-[#252923] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#4F9B72]" /> Upcoming Travel
                </h4>
                <Link href="/travel" className="text-xs text-[#6B8F71] hover:underline">
                  All
                </Link>
              </div>
              <div className="space-y-2">
                {widgets.upcomingTrips && widgets.upcomingTrips.length > 0 ? (
                  widgets.upcomingTrips.map((trip) => (
                    <div key={trip._id} className="p-2.5 rounded-xl border border-[#E9E8E1] bg-[#FAF8F5]/60 text-xs">
                      <p className="font-semibold text-[#252923] truncate">{trip.destination}</p>
                      <p className="text-[11px] text-[#777D75] mt-0.5">
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <Badge variant="sage" size="sm">{trip.status}</Badge>
                        <span className="text-[11px] text-[#252923] font-medium">
                          Budget: {formatCurrency(trip.budget, user?.currency || 'INR')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#777D75]">No upcoming trips planned.</p>
                )}
              </div>
            </div>
            <div className="pt-3 border-t border-[#E9E8E1] mt-3">
              <Link href="/travel">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  Open Travel Planner
                </Button>
              </Link>
            </div>
          </Card>

          {/* Upcoming Follow-ups (Orbit Call Manager) */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-[#252923] flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#6B8F71]" /> Orbit Follow-ups
                </h4>
                <Link href="/orbit" className="text-xs text-[#6B8F71] hover:underline">
                  All
                </Link>
              </div>
              <div className="space-y-2">
                {widgets.upcomingFollowUps && widgets.upcomingFollowUps.length > 0 ? (
                  widgets.upcomingFollowUps.map((call) => (
                    <div key={call._id} className="p-2 rounded-xl border border-[#E9E8E1] bg-[#FAF8F5]/60 text-xs">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-[#252923] truncate">{call.contact?.name || 'Contact'}</p>
                        <Badge variant="warning" size="sm">Follow up</Badge>
                      </div>
                      <p className="text-[11px] text-[#777D75] mt-0.5 truncate">{call.purpose || 'Call'}</p>
                      <p className="text-[10px] text-[#6B8F71] mt-1 font-medium">
                        Due: {formatDate(call.followUpDate)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#777D75]">No pending call follow-ups.</p>
                )}
              </div>
            </div>
            <div className="pt-3 border-t border-[#E9E8E1] mt-3">
              <Link href="/orbit">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  Open Orbit Connections
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

