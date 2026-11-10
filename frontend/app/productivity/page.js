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
    showToast(`${timerMode === 'pomodoro' ? 'Focus Session' : 'Break'} Completed!`, 'success');
    try {
      if (timerMode === 'pomodoro') {
        await api.post('/productivity/focus', {
          durationMinutes: 25,
          sessionType: 'pomodoro',
        });
        fetchTasks();
      }
    } catch (err) {}
  };

  const setMode = (mode) => {
    setTimerMode(mode);
    setIsTimerRunning(false);
    setTimerSeconds(mode === 'pomodoro' ? 25 * 60 : 5 * 60);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(timerMode === 'pomodoro' ? 25 * 60 : 5 * 60);
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
      showToast('Task added', 'success');
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setDueDate('');
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#252923] tracking-tight">Productivity Tracker</h1>
            <p className="text-sm text-[#777D75] mt-1">
              Organize priority tasks, execute deep work sessions, and avoid burnout.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
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
            color="#6B8F71"
          />
          <StatCard
            title="Completed Tasks"
            value={stats.completedTasks ?? 0}
            subtitle={`${stats.productivityRate ?? 0}% completion rate`}
            icon={CheckCircle2}
            color="#4F9B72"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgressTasks ?? 0}
            subtitle="Under active work"
            icon={Flame}
            color="#D6A24A"
          />
          <StatCard
            title="Overdue Tasks"
            value={stats.overdueTasks ?? 0}
            subtitle="Requires attention"
            icon={AlertTriangle}
            color="#D96C6C"
          />
        </div>

        {/* Pomodoro Timer Banner Card */}
        <Card className="bg-gradient-to-r from-white via-[#FAF8F5] to-white border border-[#E9E8E1] p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B8F71]">
                Pomodoro Focus Engine
              </span>
              <h3 className="text-xl font-bold text-[#252923]">
                {timerMode === 'pomodoro' ? '25-Minute Deep Focus Sprint' : '5-Minute Rest & Recharge'}
              </h3>
              <p className="text-xs text-[#777D75]">
                Block distractions and direct complete concentration onto one task.
              </p>
            </div>

            {/* Timer Display */}
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-[#252923]">
                {formatTimer(timerSeconds)}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  icon={isTimerRunning ? Pause : Play}
                  size="sm"
                  className={isTimerRunning ? 'bg-[#D6A24A]' : 'bg-[#6B8F71]'}
                >
                  {isTimerRunning ? 'Pause' : 'Start Focus'}
                </Button>
                <Button onClick={resetTimer} variant="secondary" size="sm" icon={RotateCcw}>
                  Reset
                </Button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex gap-2">
              <button
                onClick={() => setMode('pomodoro')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  timerMode === 'pomodoro'
                    ? 'bg-[#6B8F71] text-white shadow-sm'
                    : 'bg-white text-[#777D75] border border-[#E9E8E1]'
                }`}
              >
                Focus (25m)
              </button>
              <button
                onClick={() => setMode('short_break')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  timerMode === 'short_break'
                    ? 'bg-[#4F9B72] text-white shadow-sm'
                    : 'bg-white text-[#777D75] border border-[#E9E8E1]'
                }`}
              >
                Short Break (5m)
              </button>
            </div>
          </div>
        </Card>

        {/* Task List & Filters */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E9E8E1] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#FAF8F5]/60">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#777D75]">Status:</span>
              {['All', 'Pending', 'In Progress', 'Completed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === s ? 'bg-[#6B8F71] text-white' : 'bg-white text-[#777D75] border border-[#E9E8E1]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#777D75] absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white w-full md:w-56"
              />
            </div>
          </div>

          {tasks.length > 0 ? (
            <div className="divide-y divide-[#E9E8E1]">
              {tasks.map((task) => {
                const isDone = task.status === 'Completed';
                const isOverdue = !isDone && task.dueDate && new Date(task.dueDate) < new Date();
                return (
                  <div
                    key={task._id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5]/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={(e) => handleStatusChange(task._id, e.target.checked ? 'Completed' : 'Pending')}
                        className="mt-1 rounded text-[#6B8F71] focus:ring-0 cursor-pointer w-4 h-4"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm sm:text-base font-medium ${isDone ? 'line-through text-[#777D75]' : 'text-[#252923]'}`}>
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
                            size="sm"
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-xs text-[#777D75] mt-0.5">{task.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#777D75]">
                          <span className="font-medium text-[#252923]">{task.category}</span>
                          {task.dueDate && (
                            <>
                              <span>•</span>
                              <span className={`flex items-center gap-1 ${isOverdue ? 'text-[#D96C6C] font-semibold' : ''}`}>
                                <Calendar className="w-3.5 h-3.5" /> Due {formatDate(task.dueDate)}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span>🍅 {task.pomodorosCompleted || 0} / {task.pomodorosEstimated || 1} Pomodoros</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-[#E9E8E1] bg-white text-[#252923] focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-1.5 text-[#777D75] hover:text-[#D96C6C] rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="No tasks match criteria"
              description="Keep up with your goals by organizing your daily agenda."
              actionLabel="Add New Task"
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
              <label className="block text-xs font-medium text-[#777D75] mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Architect API pagination and filtering"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-[#FAF8F5]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#777D75] mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add subtasks or instructions..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#777D75] mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#777D75] mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#777D75] mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Task</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

