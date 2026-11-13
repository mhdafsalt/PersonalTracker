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
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Habit Tracker</h1>
            <p className="text-sm text-slate-500 mt-1">
              Build lasting consistency, monitor daily streaks, and stay disciplined.
            </p>
          </div>
          <Button onClick={openCreateModal} icon={Plus}>
            Create New Habit
          </Button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Habits"
            value={totalHabits}
            subtitle={`${habits.filter((h) => h.active).length} currently active`}
            icon={CheckSquare}
            color="#10B981"
          />
          <StatCard
            title="Done Today"
            value={`${completedToday}/${totalHabits}`}
            subtitle={`${completionRate}% completion today`}
            icon={Award}
            color="#4F9B72"
          />
          <StatCard
            title="Best Streak"
            value={`${bestStreak} days`}
            subtitle="All-time personal record"
            icon={Flame}
            color="#D6A24A"
          />
          <StatCard
            title="Consistency"
            value={`${completionRate}%`}
            subtitle="Today's goal progress"
            icon={Sparkles}
            color="#10B981"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Habits Checklist & Weekly Matrix */}
        <Card className="overflow-hidden p-0 sm:p-0">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-semibold text-base text-slate-900">Habits Matrix</h3>
              <p className="text-xs text-slate-500 mt-0.5">Click any day to mark habit completed or undone.</p>
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-600/10 px-3 py-1 rounded-full">
              Weekly Overview
            </span>
          </div>

          {filteredHabits.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {filteredHabits.map((habit) => {
                const isDoneToday = habit.completedDates && habit.completedDates.includes(todayStr);
                return (
                  <div
                    key={habit._id}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/30 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <button
                        onClick={() => handleToggleDate(habit._id, todayStr)}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                          isDoneToday
                            ? 'bg-emerald-500 border-[#4F9B72] text-white shadow-sm'
                            : 'border-[#D5CFBF] bg-white hover:border-emerald-600'
                        }`}
                        title="Mark today"
                      >
                        {isDoneToday && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold text-sm sm:text-base ${isDoneToday ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {habit.title}
                          </h4>
                          <Badge variant="sage" size="sm">
                            {habit.category}
                          </Badge>
                        </div>
                        {habit.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{habit.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium text-amber-600">
                            <Flame className="w-3.5 h-3.5 fill-current" /> {habit.currentStreak || 0} streak
                          </span>
                          <span>•</span>
                          <span>Longest: {habit.longestStreak || 0} days</span>
                        </div>
                      </div>
                    </div>

                    {/* 7-Day Matrix */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                        {past7Days.map((day) => {
                          const isDone = habit.completedDates && habit.completedDates.includes(day.dateStr);
                          return (
                            <button
                              key={day.dateStr}
                              onClick={() => handleToggleDate(habit._id, day.dateStr)}
                              title={`${day.dateStr} — ${isDone ? 'Completed' : 'Missed'}`}
                              className={`w-7 h-8 rounded-lg flex flex-col items-center justify-center text-[10px] transition-all ${
                                isDone
                                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                                  : day.isToday
                                  ? 'border border-emerald-600 text-emerald-600 bg-white'
                                  : 'text-slate-500 hover:bg-[#EFECE4]'
                              }`}
                            >
                              <span>{day.dayName}</span>
                              <span className="text-[9px] opacity-80">{day.dayNum}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => openEditModal(habit)}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteHabit(habit._id)}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors"
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
              icon={CheckSquare}
              title="No habits found"
              description="Create a habit to build discipline and monitor your progress over time."
              actionLabel="Create First Habit"
              onAction={openCreateModal}
            />
          )}
        </Card>

        {/* Modal for creating / editing habit */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingHabit ? 'Edit Habit' : 'Create New Habit'}
        >
          <form onSubmit={handleSaveHabit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Habit Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Read 20 pages every day"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why is this habit important to you?"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="Health">Health</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Mindfulness">Mindfulness</option>
                  <option value="Learning">Learning</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Finance">Finance</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="selected_days">Selected Days</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingHabit ? 'Save Changes' : 'Create Habit'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

