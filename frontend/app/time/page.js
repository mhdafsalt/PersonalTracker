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
    if (!activeTimer) return;
    try {
      const res = await api.put(`/time/${activeTimer._id}/stop`, {});
      if (res.success) {
        showToast('Time entry saved!', 'success');
        fetchTimeData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateManual = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await api.post('/time/manual', {
        title: newTitle,
        category: newCategory,
        durationMinutes: Number(newDuration),
        billable: isBillable,
      });
      showToast('Manual entry logged', 'success');
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
      showToast('Entry removed', 'success');
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#252923] tracking-tight">Time Tracker</h1>
            <p className="text-sm text-[#777D75] mt-1">
              Track billable client hours, design sessions, deep work, and daily activities.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
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
            color="#6B8F71"
          />
          <StatCard
            title="Productive Hours"
            value={`${stats.productiveHours ?? 0} hrs`}
            subtitle="Work, Study, Design"
            icon={Clock}
            color="#4F9B72"
          />
          <StatCard
            title="Total Time Entries"
            value={stats.entriesCount ?? 0}
            subtitle="Recorded timeline blocks"
            icon={Briefcase}
            color="#D6A24A"
          />
        </div>

        {/* Live Stopwatch Tracker Banner */}
        <Card className="bg-white border-2 border-[#6B8F71]/30 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full md:w-auto">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B8F71] block mb-1">
                {activeTimer ? 'Timer Active & Running' : 'Start New Activity'}
              </span>
              {activeTimer ? (
                <div>
                  <h3 className="text-xl font-bold text-[#252923]">{activeTimer.title}</h3>
                  <Badge variant="sage" size="sm" className="mt-1">
                    {activeTimer.category}
                  </Badge>
                </div>
              ) : (
                <form onSubmit={handleStartTimer} className="flex flex-col sm:flex-row gap-2 mt-1">
                  <input
                    type="text"
                    value={timerTitle}
                    onChange={(e) => setTimerTitle(e.target.value)}
                    placeholder="What are you working on?"
                    className="px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-[#FAF8F5]/50 w-full sm:w-64"
                  />
                  <select
                    value={timerCategory}
                    onChange={(e) => setTimerCategory(e.target.value)}
                    className="px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
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
              <div className="text-4xl sm:text-5xl font-mono font-bold text-[#252923] tracking-wider">
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
                <Button onClick={handleStartTimer} icon={Play} size="lg">
                  Start Timer
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Category Breakdown Chart */}
        {categoryBreakdown.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-[#6B8F71]" />
              <h3 className="font-semibold text-base text-[#252923]">Time Distribution by Category</h3>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown}>
                  <XAxis dataKey="name" stroke="#777D75" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#777D75" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E9E8E1',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="hours" fill="#6B8F71" radius={[4, 4, 0, 0]} name="Hours Logged" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Timeline Log Table */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E9E8E1] flex items-center justify-between bg-[#FAF8F5]/60">
            <div>
              <h3 className="font-semibold text-base text-[#252923]">Activity Timeline</h3>
              <p className="text-xs text-[#777D75]">Recorded activities with start and stop timestamps.</p>
            </div>
          </div>

          {entries.length > 0 ? (
            <div className="divide-y divide-[#E9E8E1]">
              {entries.map((entry) => (
                <div key={entry._id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#FAF8F5]/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#6B8F71]/15 text-[#6B8F71] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm sm:text-base text-[#252923]">{entry.title}</h4>
                        <Badge variant="sage" size="sm">{entry.category}</Badge>
                        {entry.billable && <Badge variant="warning" size="sm">Billable</Badge>}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#777D75]">
                        <span>Duration: {entry.durationMinutes} mins ({(entry.durationMinutes / 60).toFixed(1)} hrs)</span>
                        <span>• Started {formatDate(entry.startTime)} at {formatTime(entry.startTime)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry._id)}
                    className="p-1.5 text-[#777D75] hover:text-[#D96C6C] rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
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
              <label className="block text-xs font-medium text-[#777D75] mb-1">Activity Title *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Client Design Sprint or Bug Triage"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-[#FAF8F5]/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#777D75] mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
                >
                  <option value="Work">Work</option>
                  <option value="Design">Design</option>
                  <option value="Study">Study</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#777D75] mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="billable"
                checked={isBillable}
                onChange={(e) => setIsBillable(e.target.checked)}
                className="rounded text-[#6B8F71] focus:ring-0"
              />
              <label htmlFor="billable" className="text-xs text-[#252923]">
                Mark as billable client time
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Log Time</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

