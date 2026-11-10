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
import { formatDate } from '../../utils/format';
import {
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function GoalTrackerPage() {
  const { showToast } = useToast();
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [type, setType] = useState('short-term');
  const [targetDate, setTargetDate] = useState('');
  const [milestonesText, setMilestonesText] = useState('');

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      if (res.success) {
        setGoals(res.data.goals);
        setStats(res.data.stats);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title.trim() || !targetDate) return;

    const milestones = milestonesText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((t) => ({ title: t, completed: false }));

    try {
      await api.post('/goals', {
        title,
        description,
        category,
        type,
        targetDate,
        milestones,
      });
      showToast('Goal created successfully', 'success');
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setTargetDate('');
      setMilestonesText('');
      fetchGoals();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleMilestone = async (goal, milestoneIndex) => {
    const updatedMilestones = [...goal.milestones];
    updatedMilestones[milestoneIndex].completed = !updatedMilestones[milestoneIndex].completed;

    try {
      await api.put(`/goals/${goal._id}`, {
        milestones: updatedMilestones,
      });
      showToast('Milestone updated!', 'success');
      fetchGoals();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      showToast('Goal deleted', 'success');
      fetchGoals();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredGoals = filterType === 'All' ? goals : goals.filter((g) => g.type === filterType);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Goal Tracker</h1>
            <p className="text-sm text-slate-500 mt-1">
              Define vision, track short & long-term ambitions, and conquer incremental milestones.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
            Create Goal
          </Button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Goals"
            value={stats.totalGoals ?? 0}
            subtitle="Short & long term"
            icon={Target}
            color="#10B981"
          />
          <StatCard
            title="Active Goals"
            value={stats.activeGoals ?? 0}
            subtitle="Under active execution"
            icon={Clock}
            color="#D6A24A"
          />
          <StatCard
            title="Completed"
            value={stats.completedGoals ?? 0}
            subtitle="Accomplished goals"
            icon={CheckCircle2}
            color="#4F9B72"
          />
          <StatCard
            title="Overdue"
            value={stats.overdueGoals ?? 0}
            subtitle="Past target deadline"
            icon={AlertTriangle}
            color="#D96C6C"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {['All', 'short-term', 'long-term'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                filterType === t
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {t === 'All' ? 'All Goals' : `${t} Goals`}
            </button>
          ))}
        </div>

        {/* Goals List */}
        {filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGoals.map((goal) => {
              const isPast = new Date(goal.targetDate) < new Date() && goal.status !== 'Completed';
              return (
                <Card key={goal._id} hover className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={goal.type === 'short-term' ? 'sage' : 'warning'} size="sm">
                            {goal.type}
                          </Badge>
                          <Badge variant="default" size="sm">{goal.category}</Badge>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mt-2">{goal.title}</h3>
                        {goal.description && (
                          <p className="text-xs text-slate-500 mt-1">{goal.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-semibold text-emerald-600">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-50 rounded-full h-2 border border-slate-200">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Milestones Checklist */}
                    {goal.milestones && goal.milestones.length > 0 && (
                      <div className="mt-4 space-y-2 border-t border-slate-200 pt-3">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          Milestones ({goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length})
                        </span>
                        {goal.milestones.map((m, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleToggleMilestone(goal, idx)}
                            className="flex items-center gap-2.5 text-xs cursor-pointer select-none p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={m.completed}
                              readOnly
                              className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                            />
                            <span className={m.completed ? 'line-through text-slate-500' : 'text-slate-900 font-medium'}>
                              {m.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className={`flex items-center gap-1.5 ${isPast ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                      <Calendar className="w-3.5 h-3.5" /> Target: {formatDate(goal.targetDate)}
                    </span>
                    <Badge variant={goal.status === 'Completed' ? 'success' : 'sage'} size="sm">
                      {goal.status}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Target}
            title="No goals found"
            description="Define your personal or professional roadmap with measurable target dates."
            actionLabel="Create Goal"
            onAction={() => setIsModalOpen(true)}
          />
        )}

        {/* Modal: Create Goal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Goal"
        >
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Goal Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Launch Commercial SaaS MVP"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why is this goal important?"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="short-term">Short-Term (&lt; 3 months)</option>
                  <option value="long-term">Long-Term (1+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="Career">Career</option>
                  <option value="Health">Health</option>
                  <option value="Finance">Finance</option>
                  <option value="Learning">Learning</option>
                  <option value="Personal">Personal</option>
                  <option value="Creative">Creative</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Target Date *</label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Milestones (one per line)
              </label>
              <textarea
                rows={3}
                value={milestonesText}
                onChange={(e) => setMilestonesText(e.target.value)}
                placeholder="Step 1: Write technical specification&#10;Step 2: Build prototype&#10;Step 3: User testing"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Goal</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

