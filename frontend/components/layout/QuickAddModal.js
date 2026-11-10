'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CheckSquare, Wallet, Sparkles, Clock } from 'lucide-react';

export const QuickAddModal = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('task');
  const [loading, setLoading] = useState(false);

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskCategory, setTaskCategory] = useState('Work');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Habit form state
  const [habitTitle, setHabitTitle] = useState('');
  const [habitCategory, setHabitCategory] = useState('Health');

  // Transaction form state
  const [txnTitle, setTxnTitle] = useState('');
  const [txnAmount, setTxnAmount] = useState('');
  const [txnType, setTxnType] = useState('expense');
  const [txnCategory, setTxnCategory] = useState('General');

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    setLoading(true);
    try {
      await api.post('/productivity/tasks', {
        title: taskTitle,
        priority: taskPriority,
        category: taskCategory,
        dueDate: taskDueDate || null,
      });
      showToast('Task added successfully', 'success');
      setTaskTitle('');
      onClose();
      window.location.reload();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    setLoading(true);
    try {
      await api.post('/habits', {
        title: habitTitle,
        category: habitCategory,
        frequency: 'daily',
      });
      showToast('Habit created successfully', 'success');
      setHabitTitle('');
      onClose();
      window.location.reload();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTxn = async (e) => {
    e.preventDefault();
    if (!txnTitle.trim() || !txnAmount) return;
    setLoading(true);
    try {
      await api.post('/expenses/transactions', {
        title: txnTitle,
        amount: Number(txnAmount),
        type: txnType,
        category: txnCategory,
      });
      showToast('Transaction logged successfully', 'success');
      setTxnTitle('');
      setTxnAmount('');
      onClose();
      window.location.reload();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Action">
      {/* Switcher Tabs */}
      <div className="flex p-1 bg-[#F0F2F5] rounded-full mb-6 max-w-sm mx-auto">
        <button
          onClick={() => setActiveTab('task')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-full transition-all ${
            activeTab === 'task'
              ? 'bg-[#111315] text-white shadow-sm'
              : 'text-[#686E77] hover:text-[#111315]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Task
        </button>
        <button
          onClick={() => setActiveTab('habit')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-full transition-all ${
            activeTab === 'habit'
              ? 'bg-[#111315] text-white shadow-sm'
              : 'text-[#686E77] hover:text-[#111315]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Habit
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-full transition-all ${
            activeTab === 'expense'
              ? 'bg-[#111315] text-white shadow-sm'
              : 'text-[#686E77] hover:text-[#111315]'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" /> Finance
        </button>
      </div>

      {activeTab === 'task' && (
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Task Title *</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Complete quarterly product review"
              className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
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
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Due Date</label>
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
            />
          </div>
          <div className="pt-3 flex justify-end gap-2.5">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Create Task
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'habit' && (
        <form onSubmit={handleCreateHabit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Habit Title *</label>
            <input
              type="text"
              required
              value={habitTitle}
              onChange={(e) => setHabitTitle(e.target.value)}
              placeholder="e.g. Read 20 pages every day"
              className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Category</label>
            <select
              value={habitCategory}
              onChange={(e) => setHabitCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
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
          <div className="pt-3 flex justify-end gap-2.5">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="lime" loading={loading}>
              Create Habit
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'expense' && (
        <form onSubmit={handleCreateTxn} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Type</label>
              <div className="flex p-1 bg-[#F0F2F5] rounded-full">
                <button
                  type="button"
                  onClick={() => setTxnType('expense')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    txnType === 'expense' ? 'bg-[#FF5722] text-white shadow-xs' : 'text-[#686E77]'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTxnType('income')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    txnType === 'income' ? 'bg-[#10B981] text-white shadow-xs' : 'text-[#686E77]'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Amount (₹) *</label>
              <input
                type="number"
                required
                value={txnAmount}
                onChange={(e) => setTxnAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Description *</label>
            <input
              type="text"
              required
              value={txnTitle}
              onChange={(e) => setTxnTitle(e.target.value)}
              placeholder="e.g. Domain Renewal or Client Payment"
              className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Category</label>
            <input
              type="text"
              value={txnCategory}
              onChange={(e) => setTxnCategory(e.target.value)}
              placeholder="Category"
              className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
            />
          </div>
          <div className="pt-3 flex justify-end gap-2.5">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Save Transaction
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
