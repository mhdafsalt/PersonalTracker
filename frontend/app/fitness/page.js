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
      showToast('Daily vitals saved!', 'success');
      setIsRecordModalOpen(false);
      fetchFitness();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteWorkout = async (id) => {
    if (!confirm('Delete this workout record?')) return;
    try {
      await api.delete(`/fitness/workouts/${id}`);
      showToast('Workout deleted', 'success');
      fetchFitness();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">Biometrics & Health</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight">Fitness Tracker</h1>
            <p className="text-xs sm:text-sm text-[#686E77] mt-1">
              Log strength sessions, monitor daily steps, and record bodyweight progress.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button onClick={() => setIsRecordModalOpen(true)} variant="secondary" icon={Activity}>
              Record Vitals
            </Button>
            <Button onClick={() => setIsWorkoutModalOpen(true)} variant="primary" icon={Plus}>
              Log Workout
            </Button>
          </div>
        </div>

        {/* 4 Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Workouts"
            value={stats.totalWorkouts ?? 0}
            subtitle={`${stats.weeklyWorkouts ?? 0} logged this week`}
            icon={Dumbbell}
            trend="24"
          />
          <StatCard
            title="Calories Burned"
            value={`${stats.totalCalories ?? 0} kcal`}
            subtitle="Estimated energy expenditure"
            icon={Flame}
            trend="16"
          />
          <StatCard
            title="Current Weight"
            value={stats.currentWeight ? `${stats.currentWeight} kg` : '--'}
            subtitle="Latest bodyweight log"
            icon={Scale}
            trend="02"
          />
          <StatCard
            title="Today's Steps"
            value={stats.todaySteps ? stats.todaySteps.toLocaleString() : '0'}
            subtitle="Goal: 10,000 steps"
            icon={Footprints}
            trend="20"
          />
        </div>

        {/* Daily Vitals Summary Bar */}
        {records && records.length > 0 && (
          <Card className="p-5 sm:p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-[#111315] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4F648]" />
                Latest Recorded Vitals
              </h3>
              <span className="text-xs font-semibold text-[#686E77]">Date: {records[0].date}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-[#E5E8ED]">
                <Scale className="w-4 h-4 text-[#FF5722] mx-auto mb-1.5" />
                <p className="text-[11px] font-semibold text-[#686E77] uppercase tracking-wider">Weight</p>
                <p className="text-lg font-extrabold text-[#111315] mt-0.5">{records[0].weight || '--'} kg</p>
              </div>
              <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-[#E5E8ED]">
                <Footprints className="w-4 h-4 text-[#111315] mx-auto mb-1.5" />
                <p className="text-[11px] font-semibold text-[#686E77] uppercase tracking-wider">Steps</p>
                <p className="text-lg font-extrabold text-[#111315] mt-0.5">{records[0].steps || 0}</p>
              </div>
              <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-[#E5E8ED]">
                <Droplets className="w-4 h-4 text-[#0284C7] mx-auto mb-1.5" />
                <p className="text-[11px] font-semibold text-[#686E77] uppercase tracking-wider">Water Intake</p>
                <p className="text-lg font-extrabold text-[#111315] mt-0.5">{records[0].waterLiters || 0} L</p>
              </div>
              <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-[#E5E8ED]">
                <Moon className="w-4 h-4 text-[#8B5CF6] mx-auto mb-1.5" />
                <p className="text-[11px] font-semibold text-[#686E77] uppercase tracking-wider">Sleep Hours</p>
                <p className="text-lg font-extrabold text-[#111315] mt-0.5">{records[0].sleepHours || 0} hrs</p>
              </div>
            </div>
          </Card>
        )}

        {/* Workout History List */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E5E8ED] flex items-center justify-between bg-[#F7F8FA]">
            <div>
              <h3 className="font-bold text-base text-[#111315]">Recent Workouts</h3>
              <p className="text-xs text-[#686E77] mt-0.5">Full logs of exercises, sets, and calories.</p>
            </div>
            <Button onClick={() => setIsWorkoutModalOpen(true)} size="sm" variant="secondary" icon={Plus}>
              Log Workout
            </Button>
          </div>

          {workouts.length > 0 ? (
            <div className="divide-y divide-[#E5E8ED]">
              {workouts.map((w) => (
                <div key={w._id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#F7F8FA]/60 transition-colors">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#111315] text-[#D4F648] flex items-center justify-center shrink-0 mt-0.5">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-[#111315]">{w.exerciseName}</h4>
                        <Badge variant="default" size="xs">{w.category}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#686E77]">
                        <span className="font-semibold text-[#111315]">{w.durationMinutes} min</span>
                        {w.sets > 0 && <span>• {w.sets} sets × {w.reps} reps</span>}
                        {w.weightKg > 0 && <span>• {w.weightKg} kg</span>}
                        <span>• {w.caloriesBurned} kcal</span>
                        <span>• {formatDate(w.date)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteWorkout(w._id)}
                    className="w-8 h-8 rounded-full hover:bg-[#FF5722]/10 flex items-center justify-center text-[#686E77] hover:text-[#FF5722] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Dumbbell}
              title="No workouts recorded"
              description="Keep your fitness journey moving forward by logging exercises."
              actionLabel="Log Workout"
              onAction={() => setIsWorkoutModalOpen(true)}
            />
          )}
        </Card>

        {/* Modal: Log Workout */}
        <Modal
          isOpen={isWorkoutModalOpen}
          onClose={() => setIsWorkoutModalOpen(false)}
          title="Log Workout Session"
        >
          <form onSubmit={handleCreateWorkout} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Exercise Name *</label>
              <input
                type="text"
                required
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="e.g. Incline Bench Press, 5K Run, Deadlifts"
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
                  <option value="Strength">Strength</option>
                  <option value="Cardio">Cardio</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Mobility">Mobility</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Duration (mins)</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Sets</label>
                <input
                  type="number"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Reps</label>
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Weight (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Calories Burned (kcal)</label>
              <input
                type="number"
                value={caloriesBurned}
                onChange={(e) => setCaloriesBurned(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsWorkoutModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Workout
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Daily Vitals */}
        <Modal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          title="Log Daily Vitals"
        >
          <form onSubmit={handleLogRecord} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Body Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dailyWeight}
                  onChange={(e) => setDailyWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Steps Count</label>
                <input
                  type="number"
                  value={dailySteps}
                  onChange={(e) => setDailySteps(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Water Intake (L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dailyWater}
                  onChange={(e) => setDailyWater(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Sleep (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={dailySleep}
                  onChange={(e) => setDailySleep(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsRecordModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Vitals
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
