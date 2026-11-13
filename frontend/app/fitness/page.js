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
  Dumbbell,
  Flame,
  Activity,
  Heart,
  Plus,
  Trash2,
  Scale,
  Footprints,
  Droplets,
  Moon,
} from 'lucide-react';

export default function FitnessTrackerPage() {
  const { showToast } = useToast();
  const [workouts, setWorkouts] = useState([]);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Workout form
  const [exerciseName, setExerciseName] = useState('');
  const [category, setCategory] = useState('Strength');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(12);
  const [weightKg, setWeightKg] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(250);

  // Daily record form
  const [dailyWeight, setDailyWeight] = useState(72.5);
  const [dailySteps, setDailySteps] = useState(8000);
  const [dailyWater, setDailyWater] = useState(2.5);
  const [dailySleep, setDailySleep] = useState(7.5);

  const fetchFitness = async () => {
    try {
      const res = await api.get('/fitness/workouts');
      if (res.success) {
        setWorkouts(res.data.workouts);
        setRecords(res.data.records);
        setStats(res.data.stats);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFitness();
  }, []);

  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;
    try {
      await api.post('/fitness/workouts', {
        exerciseName,
        category,
        durationMinutes: Number(durationMinutes),
        sets: Number(sets),
        reps: Number(reps),
        weightKg: Number(weightKg),
        caloriesBurned: Number(caloriesBurned),
      });
      showToast('Workout logged!', 'success');
      setIsWorkoutModalOpen(false);
      setExerciseName('');
      fetchFitness();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLogRecord = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fitness/records', {
        weight: Number(dailyWeight),
        steps: Number(dailySteps),
        waterLiters: Number(dailyWater),
        sleepHours: Number(dailySleep),
      });
      showToast('Daily health vitals logged!', 'success');
      setIsRecordModalOpen(false);
      fetchFitness();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteWorkout = async (id) => {
    try {
      await api.delete(`/fitness/workouts/${id}`);
      showToast('Workout removed', 'success');
      fetchFitness();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Fitness Tracker</h1>
            <p className="text-sm text-slate-500 mt-1">
              Log strength training, cardio routines, steps, body weight, and hydration.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsRecordModalOpen(true)} variant="secondary" icon={Scale}>
              Log Vitals
            </Button>
            <Button onClick={() => setIsWorkoutModalOpen(true)} icon={Plus}>
              Log Workout
            </Button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Workouts"
            value={stats.totalWorkouts ?? 0}
            subtitle={`${stats.totalDurationMinutes ?? 0} mins logged`}
            icon={Dumbbell}
            color="#10B981"
          />
          <StatCard
            title="Calories Burned"
            value={`${stats.totalCalories ?? 0} kcal`}
            subtitle="Estimated energy expenditure"
            icon={Flame}
            color="#D96C6C"
          />
          <StatCard
            title="Current Weight"
            value={stats.currentWeight ? `${stats.currentWeight} kg` : '--'}
            subtitle="Latest bodyweight log"
            icon={Scale}
            color="#D6A24A"
          />
          <StatCard
            title="Today's Steps"
            value={stats.todaySteps ? stats.todaySteps.toLocaleString() : '0'}
            subtitle="Goal: 10,000 steps"
            icon={Footprints}
            color="#4F9B72"
          />
        </div>

        {/* Daily Vitals Summary Bar */}
        {records && records.length > 0 && (
          <Card className="bg-slate-50/80 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" /> Latest Recorded Vitals
              </h3>
              <span className="text-[11px] text-slate-500">Date: {records[0].date}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <Scale className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Weight</p>
                <p className="text-base font-bold text-slate-900">{records[0].weight || '--'} kg</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <Footprints className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Steps</p>
                <p className="text-base font-bold text-slate-900">{records[0].steps || 0}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <Droplets className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Water Intake</p>
                <p className="text-base font-bold text-slate-900">{records[0].waterLiters || 0} L</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <Moon className="w-4 h-4 text-[#8DA382] mx-auto mb-1" />
                <p className="text-xs text-slate-500">Sleep Hours</p>
                <p className="text-base font-bold text-slate-900">{records[0].sleepHours || 0} hrs</p>
              </div>
            </div>
          </Card>
        )}

        {/* Workout History List */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
            <div>
              <h3 className="font-semibold text-base text-slate-900">Recent Workouts</h3>
              <p className="text-xs text-slate-500">Full logs of exercises, sets, and calories.</p>
            </div>
            <Button onClick={() => setIsWorkoutModalOpen(true)} size="sm" icon={Plus}>
              Log Workout
            </Button>
          </div>

          {workouts.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {workouts.map((w) => (
                <div key={w._id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm sm:text-base text-slate-900">{w.exerciseName}</h4>
                        <Badge variant="sage" size="sm">{w.category}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>Duration: {w.durationMinutes} min</span>
                        {w.sets > 0 && <span>• {w.sets} sets × {w.reps} reps</span>}
                        {w.weightKg > 0 && <span>• {w.weightKg} kg</span>}
                        <span>• {w.caloriesBurned} kcal</span>
                        <span>• {formatDate(w.date)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteWorkout(w._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Dumbbell}
              title="No workouts recorded"
              description="Log your daily strength training, cardio or yoga sessions."
              actionLabel="Add Workout"
              onAction={() => setIsWorkoutModalOpen(true)}
            />
          )}
        </Card>

        {/* Modal: Log Workout */}
        <Modal
          isOpen={isWorkoutModalOpen}
          onClose={() => setIsWorkoutModalOpen(false)}
          title="Log Workout"
        >
          <form onSubmit={handleCreateWorkout} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Exercise Name *</label>
              <input
                type="text"
                required
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="e.g. Barbell Squats or 5K Trail Run"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50"
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
                  <option value="Strength">Strength</option>
                  <option value="Cardio">Cardio</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Duration (mins)</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Sets</label>
                <input
                  type="number"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Reps</label>
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Estimated Calories (kcal)</label>
              <input
                type="number"
                value={caloriesBurned}
                onChange={(e) => setCaloriesBurned(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsWorkoutModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Log Workout</Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Log Vitals */}
        <Modal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          title="Log Today's Health Vitals"
        >
          <form onSubmit={handleLogRecord} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dailyWeight}
                  onChange={(e) => setDailyWeight(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Daily Steps</label>
                <input
                  type="number"
                  value={dailySteps}
                  onChange={(e) => setDailySteps(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Water Intake (Liters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dailyWater}
                  onChange={(e) => setDailyWater(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Sleep (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={dailySleep}
                  onChange={(e) => setDailySleep(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsRecordModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Health Vitals</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

