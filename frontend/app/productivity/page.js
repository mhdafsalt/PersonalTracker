'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Calendar,
  Flame,
  Search,
  Check,
} from 'lucide-react';

export default function ProductivityPage() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [focusSessions, setFocusSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Task Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Work');
  const [dueDate, setDueDate] = useState('');

  // Pomodoro Timer State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('pomodoro'); // 'pomodoro' | 'short_break'
  const timerRef = useRef(null);

  const fetchTasks = async () => {
    try {
      let query = '';
      if (statusFilter !== 'All') query += `status=${statusFilter}&`;
      if (priorityFilter !== 'All') query += `priority=${priorityFilter}&`;
      if (search) query += `search=${encodeURIComponent(search)}&`;

      const res = await api.get(`/productivity/tasks?${query}`);
      if (res.success) {
        setTasks(res.data.tasks);
        setStats(res.data.stats);
      }

      const focusRes = await api.get('/productivity/focus');
      if (focusRes.success) {
        setFocusSessions(focusRes.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, search]);

  // Timer Tick
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timerMode]);

  const handleTimerComplete = async () => {
    showToast(`${timerMode === 'pomodoro' ? 'Focus sprint' : 'Break'} complete!`, 'success');
    if (timerMode === 'pomodoro') {
      try {
        await api.post('/productivity/focus', {
          durationMinutes: 25,
          taskTitle: 'Deep Work Sprint',
        });
        fetchTasks();
      } catch (err) {}
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(timerMode === 'pomodoro' ? 25 * 60 : 5 * 60);
  };

  const setMode = (mode) => {
    setTimerMode(mode);
    setIsTimerRunning(false);
    setTimerSeconds(mode === 'pomodoro' ? 25 * 60 : 5 * 60);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.post('/productivity/tasks', {
        title,
        description,
        priority,
        category,
        dueDate: dueDate || null,
      });
      showToast('Task added successfully', 'success');
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      fetchTasks();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/productivity/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/productivity/tasks/${taskId}`);
      showToast('Task removed', 'success');
      fetchTasks();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">Task Execution & Deep Work</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight">Productivity Tracker</h1>
            <p className="text-xs sm:text-sm text-[#686E77] mt-1">
              Organize priority tasks, execute deep work sessions, and avoid burnout.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} variant="primary" icon={Plus}>
            Create Task
          </Button>
        </div>

        {/* 4 Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks ?? 0}
            subtitle={`${stats.pendingTasks ?? 0} pending`}
            icon={Clock}
            trend="10"
          />
          <StatCard
            title="Completed Tasks"
            value={stats.completedTasks ?? 0}
            subtitle={`${stats.productivityRate ?? 0}% completion rate`}
            icon={CheckCircle2}
            trend="18"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgressTasks ?? 0}
            subtitle="Under active work"
            icon={Flame}
            trend="05"
          />
          <StatCard
            title="Overdue Tasks"
            value={stats.overdueTasks ?? 0}
            subtitle="Requires attention"
            icon={AlertTriangle}
            trend="00"
          />
        </div>

        {/* Pomodoro Focus Timer Card (Bento Style) */}
        <Card className="p-6 sm:p-7 border border-[#E5E8ED] bg-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#D4F648] text-[#111315] inline-block shadow-xs">
                Pomodoro Focus Engine
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#111315] tracking-tight">
                {timerMode === 'pomodoro' ? '25-Minute Deep Focus Sprint' : '5-Minute Rest & Recharge'}
              </h3>
              <p className="text-xs text-[#686E77]">
                Block distractions and direct complete concentration onto one task.
              </p>
            </div>

            {/* Timer Display */}
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight text-[#111315]">
                {formatTimer(timerSeconds)}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  icon={isTimerRunning ? Pause : Play}
                  variant={isTimerRunning ? 'danger' : 'primary'}
                  size="sm"
                >
                  {isTimerRunning ? 'Pause' : 'Start Focus'}
                </Button>
                <Button onClick={resetTimer} variant="secondary" size="sm" icon={RotateCcw}>
                  Reset
                </Button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-1 bg-[#F0F2F5] rounded-full">
              <button
                onClick={() => setMode('pomodoro')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  timerMode === 'pomodoro'
                    ? 'bg-[#111315] text-white shadow-xs'
                    : 'text-[#686E77] hover:text-[#111315]'
                }`}
              >
                Focus (25m)
              </button>
              <button
                onClick={() => setMode('short_break')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  timerMode === 'short_break'
                    ? 'bg-[#111315] text-white shadow-xs'
                    : 'text-[#686E77] hover:text-[#111315]'
                }`}
              >
                Break (5m)
              </button>
            </div>
          </div>
        </Card>

        {/* Task List & Filters */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E5E8ED] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#F7F8FA]">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F0F2F5] rounded-full">
              {['All', 'Pending', 'In Progress', 'Completed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    statusFilter === s ? 'bg-[#111315] text-white shadow-xs' : 'text-[#686E77] hover:text-[#111315]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#686E77] absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="pl-9.5 pr-4 py-2 text-xs rounded-full border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white w-full md:w-60 shadow-xs"
              />
            </div>
          </div>

          {tasks.length > 0 ? (
            <div className="divide-y divide-[#E5E8ED]">
              {tasks.map((task) => {
                const isDone = task.status === 'Completed';
                const isOverdue = !isDone && task.dueDate && new Date(task.dueDate) < new Date();
                return (
                  <div
                    key={task._id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7F8FA]/60 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleStatusChange(task._id, isDone ? 'Pending' : 'Completed')}
                        className={`w-6 h-6 mt-0.5 rounded-full border flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-[#111315] border-[#111315] text-[#D4F648] shadow-xs'
                            : 'border-[#C5CAD3] bg-white hover:border-[#111315]'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm sm:text-base font-bold ${isDone ? 'line-through text-[#686E77]' : 'text-[#111315]'}`}>
                            {task.title}
                          </h4>
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
                        {task.description && (
                          <p className="text-xs text-[#686E77] mt-0.5">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#686E77]">
                          <span className="font-semibold">{task.category}</span>
                          {task.dueDate && (
                            <>
                              <span>•</span>
                              <span className={isOverdue ? 'text-[#FF5722] font-bold' : ''}>
                                Due: {formatDate(task.dueDate)} {isOverdue && '(Overdue)'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#E5E8ED] bg-white text-[#111315] focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="w-8 h-8 rounded-full hover:bg-[#FF5722]/10 flex items-center justify-center text-[#686E77] hover:text-[#FF5722] transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="No tasks found"
              description="Keep your day structured and productive by adding prioritized tasks."
              actionLabel="Create Task"
              onAction={() => setIsModalOpen(true)}
            />
          )}
        </Card>

        {/* Create Task Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Task"
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Task Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Finish client brand design presentation"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key requirements or notes..."
                rows={2}
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Work, Study, Personal..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Task
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
