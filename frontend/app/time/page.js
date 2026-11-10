'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatTime } from '../../utils/format';
import {
  Timer,
  Play,
  Square,
  Clock,
  Plus,
  Trash2,
  PieChart as PieChartIcon,
  Briefcase,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function TimeTrackerPage() {
  const { showToast } = useToast();
  const [entries, setEntries] = useState([]);
  const [activeTimer, setActiveTimer] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Live seconds elapsed for running timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Manual Entry Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Work');
  const [newDuration, setNewDuration] = useState(60);
  const [isBillable, setIsBillable] = useState(true);

  // Live Timer Title Form
  const [timerTitle, setTimerTitle] = useState('');
  const [timerCategory, setTimerCategory] = useState('Work');

  const fetchTimeData = async () => {
    try {
      const res = await api.get('/time');
      if (res.success) {
        setEntries(res.data.entries);
        setActiveTimer(res.data.activeTimer);
        setCategoryBreakdown(res.data.categoryBreakdown);
        setStats(res.data.stats);

        if (res.data.activeTimer) {
          const diffSec = Math.floor((new Date() - new Date(res.data.activeTimer.startTime)) / 1000);
          setElapsedSeconds(Math.max(0, diffSec));
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeData();
  }, []);

  // Interval for active running timer
  useEffect(() => {
    let interval = null;
    if (activeTimer) {
      interval = setInterval(() => {
        const diffSec = Math.floor((new Date() - new Date(activeTimer.startTime)) / 1000);
        setElapsedSeconds(Math.max(0, diffSec));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const handleStartTimer = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/time/start', {
        title: timerTitle || 'Working Session',
        category: timerCategory,
      });
      if (res.success) {
        showToast('Timer started!', 'success');
        setTimerTitle('');
        fetchTimeData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStopTimer = async () => {
    try {
      const res = await api.post('/time/stop', {});
      if (res.success) {
        showToast('Timer stopped & recorded', 'success');
        fetchTimeData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateManual = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDuration) return;
    try {
      await api.post('/time/manual', {
        title: newTitle,
        category: newCategory,
        durationMinutes: Number(newDuration),
        billable: isBillable,
      });
      showToast('Time entry saved', 'success');
      setIsModalOpen(false);
      setNewTitle('');
      fetchTimeData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!confirm('Delete this time entry?')) return;
    try {
      await api.delete(`/time/${id}`);
      showToast('Time entry removed', 'success');
      fetchTimeData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const formatElapsed = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">Efficiency & Work Hours</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight">Time Tracker</h1>
            <p className="text-xs sm:text-sm text-[#686E77] mt-1">
              Track billable client hours, design sessions, deep work, and daily activities.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} variant="primary" icon={Plus}>
            Manual Entry
          </Button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Tracked Time"
            value={`${stats.totalHours ?? 0} hrs`}
            subtitle="All logged activities"
            icon={Timer}
            trend="14"
          />
          <StatCard
            title="Productive Hours"
            value={`${stats.productiveHours ?? 0} hrs`}
            subtitle="Work, Study, Design"
            icon={Clock}
            trend="18"
          />
          <StatCard
            title="Total Time Entries"
            value={stats.entriesCount ?? 0}
            subtitle="Recorded timeline blocks"
            icon={Briefcase}
            trend="08"
          />
        </div>

        {/* Live Stopwatch Tracker Banner */}
        <Card className="p-6 sm:p-7 border border-[#E5E8ED] bg-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full md:w-auto">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#111315] block mb-1.5 px-3 py-1 rounded-full bg-[#D4F648] max-w-fit shadow-xs">
                {activeTimer ? 'Timer Active & Running' : 'Start New Activity'}
              </span>
              {activeTimer ? (
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#111315]">{activeTimer.title}</h3>
                  <Badge variant="default" size="xs" className="mt-1">
                    {activeTimer.category}
                  </Badge>
                </div>
              ) : (
                <form onSubmit={handleStartTimer} className="flex flex-col sm:flex-row gap-2.5 mt-2">
                  <input
                    type="text"
                    value={timerTitle}
                    onChange={(e) => setTimerTitle(e.target.value)}
                    placeholder="What are you working on?"
                    className="px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA] w-full sm:w-64"
                  />
                  <select
                    value={timerCategory}
                    onChange={(e) => setTimerCategory(e.target.value)}
                    className="px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                  >
                    <option value="Work">Work</option>
                    <option value="Design">Design</option>
                    <option value="Study">Study</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Personal">Personal</option>
                  </select>
                </form>
              )}
            </div>

            {/* Stopwatch Display */}
            <div className="flex flex-col items-center">
              <div className="text-4xl sm:text-5xl font-mono font-extrabold text-[#111315] tracking-wider">
                {activeTimer ? formatElapsed(elapsedSeconds) : '00:00:00'}
              </div>
            </div>

            {/* Start / Stop Button */}
            <div>
              {activeTimer ? (
                <Button onClick={handleStopTimer} variant="danger" icon={Square} size="lg">
                  Stop Timer
                </Button>
              ) : (
                <Button onClick={handleStartTimer} variant="primary" icon={Play} size="lg">
                  Start Timer
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Category Breakdown Chart */}
        {categoryBreakdown.length > 0 && (
          <Card>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#111315] text-[#D4F648] flex items-center justify-center font-bold">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-[#111315]">Time Distribution by Category</h3>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown}>
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
          </Card>
        )}

        {/* Timeline Log Table */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E5E8ED] flex items-center justify-between bg-[#F7F8FA]">
            <div>
              <h3 className="font-bold text-base text-[#111315]">Activity Timeline</h3>
              <p className="text-xs text-[#686E77] mt-0.5">Recorded activities with start and stop timestamps.</p>
            </div>
          </div>

          {entries.length > 0 ? (
            <div className="divide-y divide-[#E5E8ED]">
              {entries.map((entry) => (
                <div key={entry._id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#F7F8FA]/60 transition-colors">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#111315] text-[#D4F648] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-[#111315]">{entry.title}</h4>
                        <Badge variant="default" size="xs">{entry.category}</Badge>
                        {entry.billable && <Badge variant="lime" size="xs">Billable</Badge>}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#686E77]">
                        <span className="font-bold text-[#111315]">{entry.durationMinutes} mins ({(entry.durationMinutes / 60).toFixed(1)} hrs)</span>
                        <span>• Started {formatDate(entry.startTime)} at {formatTime(entry.startTime)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry._id)}
                    className="w-8 h-8 rounded-full hover:bg-[#FF5722]/10 flex items-center justify-center text-[#686E77] hover:text-[#FF5722] transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Timer}
              title="No time entries recorded"
              description="Start the timer or add a manual time block."
              actionLabel="Add Entry"
              onAction={() => setIsModalOpen(true)}
            />
          )}
        </Card>

        {/* Modal: Manual Entry */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Manual Time Entry"
        >
          <form onSubmit={handleCreateManual} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Activity Title *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Client Design Sprint or Bug Triage"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                >
                  <option value="Work">Work</option>
                  <option value="Design">Design</option>
                  <option value="Study">Study</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Duration (minutes)</label>
                <input
                  type="number"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="billable"
                checked={isBillable}
                onChange={(e) => setIsBillable(e.target.checked)}
                className="rounded text-[#111315] focus:ring-0 w-4 h-4"
              />
              <label htmlFor="billable" className="text-xs font-semibold text-[#111315]">
                Mark as billable client time
              </label>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">Log Time</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
