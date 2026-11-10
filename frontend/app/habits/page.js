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
import {
  CheckSquare,
  Plus,
  Flame,
  Award,
  Calendar as CalendarIcon,
  Trash2,
  Edit2,
  Check,
  Sparkles,
} from 'lucide-react';

export default function HabitTrackerPage() {
  const { showToast } = useToast();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [frequency, setFrequency] = useState('daily');
  const [color, setColor] = useState('#10B981');

  const categories = ['All', 'Health', 'Productivity', 'Mindfulness', 'Learning', 'Fitness', 'Finance', 'General'];

  const fetchHabits = async () => {
    try {
      const res = await api.get('/habits');
      if (res.success) {
        setHabits(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const openCreateModal = () => {
    setEditingHabit(null);
    setTitle('');
    setDescription('');
    setCategory('General');
    setFrequency('daily');
    setColor('#10B981');
    setIsModalOpen(true);
  };

  const openEditModal = (h) => {
    setEditingHabit(h);
    setTitle(h.title);
    setDescription(h.description || '');
    setCategory(h.category || 'General');
    setFrequency(h.frequency || 'daily');
    setColor(h.color || '#10B981');
    setIsModalOpen(true);
  };

  const handleSaveHabit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (editingHabit) {
        await api.put(`/habits/${editingHabit._id}`, {
          title,
          description,
          category,
          frequency,
          color,
        });
        showToast('Habit updated successfully', 'success');
      } else {
        await api.post('/habits', {
          title,
          description,
          category,
          frequency,
          color,
        });
        showToast('New habit created!', 'success');
      }
      setIsModalOpen(false);
      fetchHabits();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    try {
      await api.delete(`/habits/${id}`);
      showToast('Habit deleted', 'success');
      fetchHabits();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleDate = async (id, dateStr) => {
    try {
      const res = await api.post(`/habits/${id}/toggle`, { date: dateStr });
      if (res.success) {
        setHabits((prev) => prev.map((h) => (h._id === id ? res.data : h)));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Generate the last 7 days for the weekly habit grid
  const past7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    past7Days.push({
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dayNum: d.getDate(),
      isToday: i === 0,
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const filteredHabits = selectedCategory === 'All'
    ? habits
    : habits.filter((h) => h.category === selectedCategory);

  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => h.completedDates && h.completedDates.includes(todayStr)).length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-7">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">Daily Discipline</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight">Habit Tracker</h1>
            <p className="text-xs sm:text-sm text-[#686E77] mt-1">
              Build lasting consistency, monitor daily streaks, and stay disciplined.
            </p>
          </div>
          <Button onClick={openCreateModal} variant="primary" icon={Plus}>
            Create New Habit
          </Button>
        </div>

        {/* Metric Bento Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Habits"
            value={totalHabits}
            subtitle={`${habits.filter((h) => h.active).length} currently active`}
            icon={CheckSquare}
            trend="12"
          />
          <StatCard
            title="Done Today"
            value={`${completedToday}/${totalHabits}`}
            subtitle={`${completionRate}% completion today`}
            icon={Award}
            trend="08"
          />
          <StatCard
            title="Best Streak"
            value={`${bestStreak} days`}
            subtitle="All-time personal record"
            icon={Flame}
            trend="24"
          />
          <StatCard
            title="Consistency"
            value={`${completionRate}%`}
            subtitle="Today's goal progress"
            icon={Sparkles}
            trend="15"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#111315] text-white shadow-xs'
                  : 'bg-white text-[#686E77] hover:text-[#111315] hover:bg-[#F2F4F7] border border-[#E5E8ED]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Habits Checklist & Weekly Matrix */}
        <Card className="overflow-hidden p-0 sm:p-0">
          <div className="p-5 sm:p-6 border-b border-[#E5E8ED] flex items-center justify-between bg-[#F7F8FA]">
            <div>
              <h3 className="font-bold text-base text-[#111315]">Habits Matrix</h3>
              <p className="text-xs text-[#686E77] mt-0.5">Click any day to mark habit completed or undone.</p>
            </div>
            <span className="text-xs font-bold text-[#111315] bg-[#D4F648] px-3.5 py-1 rounded-full shadow-xs">
              Weekly Overview
            </span>
          </div>

          {filteredHabits.length > 0 ? (
            <div className="divide-y divide-[#E5E8ED]">
              {filteredHabits.map((habit) => {
                const isDoneToday = habit.completedDates && habit.completedDates.includes(todayStr);
                return (
                  <div
                    key={habit._id}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F7F8FA]/60 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <button
                        onClick={() => handleToggleDate(habit._id, todayStr)}
                        className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                          isDoneToday
                            ? 'bg-[#111315] border-[#111315] text-[#D4F648] shadow-xs'
                            : 'border-[#C5CAD3] bg-white hover:border-[#111315]'
                        }`}
                        title="Mark today"
                      >
                        {isDoneToday && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-bold text-sm sm:text-base ${isDoneToday ? 'text-[#686E77] line-through' : 'text-[#111315]'}`}>
                            {habit.title}
                          </h4>
                          <Badge variant="default" size="xs">
                            {habit.category}
                          </Badge>
                        </div>
                        {habit.description && (
                          <p className="text-xs text-[#686E77] mt-0.5">{habit.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-[#686E77]">
                          <span className="flex items-center gap-1 font-semibold text-[#FF5722]">
                            <Flame className="w-3.5 h-3.5 fill-current" /> {habit.currentStreak || 0} streak
                          </span>
                          <span>•</span>
                          <span>Longest: {habit.longestStreak || 0} days</span>
                        </div>
                      </div>
                    </div>

                    {/* 7-Day Matrix */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <div className="flex items-center gap-1.5 bg-[#F0F2F5] p-1.5 rounded-full border border-[#E5E8ED]">
                        {past7Days.map((day) => {
                          const isDone = habit.completedDates && habit.completedDates.includes(day.dateStr);
                          return (
                            <button
                              key={day.dateStr}
                              onClick={() => handleToggleDate(habit._id, day.dateStr)}
                              title={`${day.dateStr} — ${isDone ? 'Completed' : 'Missed'}`}
                              className={`w-7 h-8 rounded-full flex flex-col items-center justify-center text-[10px] transition-all ${
                                isDone
                                  ? 'bg-[#111315] text-[#D4F648] font-bold shadow-xs'
                                  : day.isToday
                                  ? 'border border-[#111315] text-[#111315] bg-white'
                                  : 'text-[#686E77] hover:bg-white'
                              }`}
                            >
                              <span className="font-semibold">{day.dayName}</span>
                              <span className="text-[9px] opacity-80">{day.dayNum}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 pl-2 border-l border-[#E5E8ED]">
                        <button
                          onClick={() => openEditModal(habit)}
                          className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-[#686E77] hover:text-[#111315] border border-transparent hover:border-[#E5E8ED] transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteHabit(habit._id)}
                          className="w-8 h-8 rounded-full hover:bg-[#FF5722]/10 flex items-center justify-center text-[#686E77] hover:text-[#FF5722] border border-transparent hover:border-[#FF5722]/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={CheckSquare}
              title="No habits found"
              description={selectedCategory === 'All' ? 'You haven’t created any habits yet. Start with your first habit!' : `No habits found in the "${selectedCategory}" category.`}
              actionLabel="Create Habit"
              onAction={openCreateModal}
            />
          )}
        </Card>

        {/* Create/Edit Habit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingHabit ? 'Edit Habit' : 'Create New Habit'}
        >
          <form onSubmit={handleSaveHabit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Habit Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Read 20 pages, 30 min workout, Drink 3L water"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why is this habit important to you?"
                rows={2}
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                >
                  {categories.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="selected_days">Selected Days</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingHabit ? 'Save Changes' : 'Create Habit'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
