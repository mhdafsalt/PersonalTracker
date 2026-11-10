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
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/format';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  Plus,
  Trash2,
  Filter,
  Search,
  PieChart as PieChartIcon,
  Target,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function ExpenseTrackerPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Modals
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Transaction form
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('General');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Savings goal form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTargetAmount, setGoalTargetAmount] = useState('');
  const [goalCurrentAmount, setGoalCurrentAmount] = useState('');

  const fetchExpenses = async () => {
    try {
      let query = '';
      if (typeFilter !== 'All') query += `type=${typeFilter}&`;
      if (search) query += `search=${encodeURIComponent(search)}&`;

      const res = await api.get(`/expenses/transactions?${query}`);
      if (res.success) {
        setTransactions(res.data.transactions);
        setSummary(res.data.summary);
      }

      const goalsRes = await api.get('/expenses/savings-goals');
      if (goalsRes.success) {
        setSavingsGoals(goalsRes.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [typeFilter, search]);

  const handleCreateTxn = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    try {
      await api.post('/expenses/transactions', {
        title,
        amount: Number(amount),
        type,
        category,
        paymentMethod,
      });
      showToast('Transaction added', 'success');
      setIsTxnModalOpen(false);
      setTitle('');
      setAmount('');
      fetchExpenses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteTxn = async (id) => {
    if (!confirm('Delete this transaction record?')) return;
    try {
      await api.delete(`/expenses/transactions/${id}`);
      showToast('Transaction deleted', 'success');
      fetchExpenses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!goalTitle.trim() || !goalTargetAmount) return;
    try {
      await api.post('/expenses/savings-goals', {
        title: goalTitle,
        targetAmount: Number(goalTargetAmount),
        currentAmount: Number(goalCurrentAmount) || 0,
      });
      showToast('Savings goal created', 'success');
      setIsGoalModalOpen(false);
      setGoalTitle('');
      setGoalTargetAmount('');
      setGoalCurrentAmount('');
      fetchExpenses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const COLORS = ['#111315', '#D4F648', '#FF5722', '#0284C7', '#10B981', '#F59E0B'];

  const chartData = summary.categoryExpenses
    ? Object.entries(summary.categoryExpenses).map(([name, value]) => ({ name, value }))
    : [];

  const currency = user?.currency || 'INR';

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-7">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">Capital & Balances</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight">Expense Tracker</h1>
            <p className="text-xs sm:text-sm text-[#686E77] mt-1">
              Track cash flow, monthly budgets, and personal savings goals in {currency} (₹).
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button onClick={() => setIsGoalModalOpen(true)} variant="secondary" icon={PiggyBank}>
              New Goal
            </Button>
            <Button onClick={() => setIsTxnModalOpen(true)} variant="primary" icon={Plus}>
              Log Transaction
            </Button>
          </div>
        </div>

        {/* 4 Financial Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Balance"
            value={formatCurrency(summary.totalBalance ?? 0, currency)}
            subtitle="Current net liquidity"
            icon={Wallet}
            trend="14"
          />
          <StatCard
            title="Total Income"
            value={formatCurrency(summary.totalIncome ?? 0, currency)}
            subtitle="All recorded earnings"
            icon={ArrowUpRight}
            trend="22"
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(summary.totalExpenses ?? 0, currency)}
            subtitle="All outflows"
            icon={ArrowDownLeft}
            trend="08"
          />
          <StatCard
            title="Net Savings"
            value={formatCurrency(summary.totalSavings ?? 0, currency)}
            subtitle="Available surplus"
            icon={PiggyBank}
            trend="10"
          />
        </div>

        {/* Mid Row: Savings Goals & Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Savings Goals Widget */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#111315] text-[#D4F648] flex items-center justify-center font-bold">
                  <PiggyBank className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-[#111315]">Savings & Reserve Goals</h3>
              </div>
              <Button onClick={() => setIsGoalModalOpen(true)} variant="ghost" size="sm" icon={Plus}>
                Add Goal
              </Button>
            </div>

            {savingsGoals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savingsGoals.map((goal) => {
                  const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                  return (
                    <div key={goal._id} className="p-4 rounded-2xl border border-[#E5E8ED] bg-[#F7F8FA] space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-[#111315]">{goal.title}</h4>
                          <span className="text-[11px] text-[#686E77]">{goal.category}</span>
                        </div>
                        <Badge variant={pct >= 100 ? 'lime' : 'default'} size="xs">
                          {pct}%
                        </Badge>
                      </div>
                      <div className="w-full bg-white rounded-full h-2 border border-[#E5E8ED]">
                        <div
                          className="bg-[#111315] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#111315]">{formatCurrency(goal.currentAmount, currency)}</span>
                        <span className="text-[#686E77]">Target: {formatCurrency(goal.targetAmount, currency)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={PiggyBank}
                title="No savings goals"
                description="Set aside funds for an emergency fund, travel, or hardware upgrades."
                actionLabel="Create Goal"
                onAction={() => setIsGoalModalOpen(true)}
              />
            )}
          </Card>

          {/* Expense Category Chart */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#111315] text-[#D4F648] flex items-center justify-center font-bold">
                  <PieChartIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-[#111315]">Category Outflows</h3>
              </div>

              {chartData.length > 0 ? (
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={5}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => formatCurrency(val, currency)}
                        contentStyle={{
                          backgroundColor: '#111315',
                          border: 'none',
                          borderRadius: '16px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-[#686E77] py-12 text-center">No expense categories to chart.</p>
              )}
            </div>

            <div className="space-y-2 pt-3 border-t border-[#E5E8ED]">
              {chartData.slice(0, 3).map((item, idx) => (
                <div key={item.name} className="flex justify-between text-xs">
                  <span className="flex items-center gap-2 text-[#686E77]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    {item.name}
                  </span>
                  <span className="font-bold text-[#111315]">{formatCurrency(item.value, currency)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Transactions Table & Filters */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E5E8ED] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F7F8FA]">
            <div className="flex items-center gap-1.5 p-1 bg-[#F0F2F5] rounded-full">
              <button
                onClick={() => setTypeFilter('All')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  typeFilter === 'All' ? 'bg-[#111315] text-white shadow-xs' : 'text-[#686E77] hover:text-[#111315]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  typeFilter === 'expense' ? 'bg-[#FF5722] text-white shadow-xs' : 'text-[#686E77] hover:text-[#111315]'
                }`}
              >
                Expenses
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  typeFilter === 'income' ? 'bg-[#10B981] text-white shadow-xs' : 'text-[#686E77] hover:text-[#111315]'
                }`}
              >
                Income
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#686E77] absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions..."
                className="pl-9.5 pr-4 py-2 text-xs rounded-full border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white w-full sm:w-60 shadow-xs"
              />
            </div>
          </div>

          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F7F8FA] text-[#686E77] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E8ED]">
                  <tr>
                    <th className="px-5 py-3">Transaction</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E8ED]">
                  {transactions.map((txn) => (
                    <tr key={txn._id} className="hover:bg-[#F7F8FA]/60 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-[#111315]">
                        {txn.title}
                        {txn.description && (
                          <span className="block text-[11px] text-[#686E77] font-normal">{txn.description}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[#686E77] font-medium">{txn.category}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant="default" size="xs">
                          {txn.paymentMethod || 'UPI'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-[#686E77]">{formatDate(txn.date)}</td>
                      <td className="px-5 py-3.5 text-right font-bold">
                        <span className={txn.type === 'income' ? 'text-[#059669]' : 'text-[#111315]'}>
                          {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount, currency)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleDeleteTxn(txn._id)}
                          className="w-8 h-8 rounded-full hover:bg-[#FF5722]/10 flex items-center justify-center text-[#686E77] hover:text-[#FF5722] mx-auto transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Wallet}
              title="No transactions found"
              description="Log income or daily expenses to track your financial balance."
              actionLabel="Add Transaction"
              onAction={() => setIsTxnModalOpen(true)}
            />
          )}
        </Card>

        {/* Modal: Log Transaction */}
        <Modal
          isOpen={isTxnModalOpen}
          onClose={() => setIsTxnModalOpen(false)}
          title="Log Transaction"
        >
          <form onSubmit={handleCreateTxn} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 bg-[#F0F2F5] p-1 rounded-full">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-1.5 text-xs font-semibold rounded-full transition-all ${
                  type === 'expense' ? 'bg-[#FF5722] text-white shadow-xs' : 'text-[#686E77]'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-1.5 text-xs font-semibold rounded-full transition-all ${
                  type === 'income' ? 'bg-[#10B981] text-white shadow-xs' : 'text-[#686E77]'
                }`}
              >
                Income
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Figma Subscription, Client Milestone"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="General"
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
              >
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsTxnModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Transaction
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: New Savings Goal */}
        <Modal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          title="Create Savings Goal"
        >
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Goal Title *</label>
              <input
                type="text"
                required
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g. Mac Studio M3, Europe Trip"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Target Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={goalTargetAmount}
                  onChange={(e) => setGoalTargetAmount(e.target.value)}
                  placeholder="100000"
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Current Saved (₹)</label>
                <input
                  type="number"
                  value={goalCurrentAmount}
                  onChange={(e) => setGoalCurrentAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsGoalModalOpen(false)}>
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
