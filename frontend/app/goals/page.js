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

  const filteredGoals = filterType === 'All'
    ? goals
    : goals.filter((g) => g.type === filterType);

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">Long-Term Vision & Milestones</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight">Goal Tracker</h1>
            <p className="text-xs sm:text-sm text-[#686E77] mt-1">
              Architect quarterly ambitions, break down milestones, and hit target deadlines.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} variant="primary" icon={Plus}>
            Create Goal
          </Button>
        </div>

        {/* 4 Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Goals"
            value={stats.totalGoals ?? 0}
            subtitle={`${stats.activeGoals ?? 0} active now`}
            icon={Target}
            trend="14"
          />
          <StatCard
            title="In Progress"
            value={stats.activeGoals ?? 0}
            subtitle="Under active execution"
            icon={Clock}
            trend="08"
          />
          <StatCard
            title="Completed"
            value={stats.completedGoals ?? 0}
            subtitle="Accomplished goals"
            icon={CheckCircle2}
            trend="20"
          />
          <StatCard
            title="Overdue"
            value={stats.overdueGoals ?? 0}
            subtitle="Past target deadline"
            icon={AlertTriangle}
            trend="00"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F0F2F5] rounded-full max-w-fit">
          {['All', 'short-term', 'long-term'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all ${
                filterType === t
                  ? 'bg-[#111315] text-white shadow-xs'
                  : 'text-[#686E77] hover:text-[#111315]'
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
                <Card key={goal._id} className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={goal.type === 'short-term' ? 'lime' : 'default'} size="xs">
                            {goal.type}
                          </Badge>
                          <Badge variant="default" size="xs">{goal.category}</Badge>
                        </div>
                        <h3 className="font-extrabold text-lg text-[#111315] mt-2.5">{goal.title}</h3>
                        {goal.description && (
                          <p className="text-xs text-[#686E77] mt-1">{goal.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="w-8 h-8 rounded-full hover:bg-[#FF5722]/10 flex items-center justify-center text-[#686E77] hover:text-[#FF5722] transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#686E77] font-medium">Progress</span>
                        <span className="font-extrabold text-[#111315]">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-[#F0F2F5] rounded-full h-2 border border-[#E5E8ED]">
                        <div
                          className="bg-[#111315] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Milestones Checklist */}
                    {goal.milestones && goal.milestones.length > 0 && (
                      <div className="mt-5 space-y-2 border-t border-[#E5E8ED] pt-3.5">
                        <span className="text-[10px] font-bold text-[#686E77] uppercase tracking-wider block">
                          Milestones ({goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length})
                        </span>
                        {goal.milestones.map((m, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleToggleMilestone(goal, idx)}
                            className="flex items-center gap-2.5 text-xs cursor-pointer select-none p-2 rounded-xl hover:bg-[#F7F8FA] transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={m.completed}
                              readOnly
                              className="rounded text-[#111315] focus:ring-0 cursor-pointer w-4 h-4"
                            />
                            <span className={m.completed ? 'line-through text-[#686E77]' : 'text-[#111315] font-semibold'}>
                              {m.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#686E77] pt-4 border-t border-[#E5E8ED] mt-5">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      Target: {formatDate(goal.targetDate)}
                    </span>
                    <Badge variant={goal.status === 'Completed' ? 'lime' : isPast ? 'danger' : 'default'} size="xs">
                      {isPast ? 'Overdue' : goal.status}
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
            description="Set tangible short-term or long-term targets to stay inspired."
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Goal Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Launch SaaS Product MVP"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why does achieving this goal matter?"
                rows={2}
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Horizon</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                >
                  <option value="short-term">Short-Term (&lt; 3 mo)</option>
                  <option value="long-term">Long-Term (1+ yr)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Target Completion Date *</label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">
                Milestones (one per line)
              </label>
              <textarea
                value={milestonesText}
                onChange={(e) => setMilestonesText(e.target.value)}
                placeholder={"Design UI in Figma\nBuild backend API\nDeploy production demo"}
                rows={3}
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-[#F7F8FA]"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Goal
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
