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
    if (!confirm('Delete this transaction?')) return;
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
      showToast('Savings goal saved', 'success');
      setIsGoalModalOpen(false);
      setGoalTitle('');
      setGoalTargetAmount('');
      setGoalCurrentAmount('');
      fetchExpenses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Pie chart calculation for expense categories
  const expenseCatMap = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expenseCatMap[t.category] = (expenseCatMap[t.category] || 0) + t.amount;
    });

  const chartData = Object.keys(expenseCatMap).map((k) => ({
    name: k,
    value: expenseCatMap[k],
  }));

  const COLORS = ['#6B8F71', '#A7B99B', '#D6A24A', '#4F9B72', '#D96C6C', '#8DA382'];
  const currency = user?.currency || 'INR';

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#252923] tracking-tight">Expense Tracker</h1>
            <p className="text-sm text-[#777D75] mt-1">
              Track cash flow, monthly budgets, and personal savings goals in {currency} (₹).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsGoalModalOpen(true)} variant="secondary" icon={PiggyBank}>
              New Goal
            </Button>
            <Button onClick={() => setIsTxnModalOpen(true)} icon={Plus}>
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
            color="#6B8F71"
          />
          <StatCard
            title="Total Income"
            value={formatCurrency(summary.totalIncome ?? 0, currency)}
            subtitle="All recorded earnings"
            icon={ArrowUpRight}
            color="#4F9B72"
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(summary.totalExpenses ?? 0, currency)}
            subtitle="All outflows"
            icon={ArrowDownLeft}
            color="#D96C6C"
          />
          <StatCard
            title="Net Savings"
            value={formatCurrency(summary.totalSavings ?? 0, currency)}
            subtitle="Available surplus"
            icon={PiggyBank}
            color="#D6A24A"
          />
        </div>

        {/* Mid Row: Savings Goals & Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Savings Goals Widget */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#D6A24A]/15 text-[#D6A24A] flex items-center justify-center">
                  <PiggyBank className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-base text-[#252923]">Savings & Reserve Goals</h3>
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
                    <div key={goal._id} className="p-4 rounded-xl border border-[#E9E8E1] bg-[#FAF8F5]/60 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-sm text-[#252923]">{goal.title}</h4>
                          <span className="text-[11px] text-[#777D75]">{goal.category}</span>
                        </div>
                        <Badge variant={pct >= 100 ? 'success' : 'sage'} size="sm">
                          {pct}%
                        </Badge>
                      </div>
                      <div className="w-full bg-white rounded-full h-2 border border-[#E9E8E1]">
                        <div
                          className="bg-[#6B8F71] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-[#252923]">{formatCurrency(goal.currentAmount, currency)}</span>
                        <span className="text-[#777D75]">Target: {formatCurrency(goal.targetAmount, currency)}</span>
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
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#6B8F71]/15 text-[#6B8F71] flex items-center justify-center">
                  <PieChartIcon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-base text-[#252923]">Category Outflows</h3>
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
                        paddingAngle={4}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => formatCurrency(val, currency)}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E9E8E1',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-[#777D75] py-12 text-center">No expense categories to chart.</p>
              )}
            </div>

            <div className="space-y-1.5 pt-3 border-t border-[#E9E8E1]">
              {chartData.slice(0, 3).map((item, idx) => (
                <div key={item.name} className="flex justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-[#777D75]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    {item.name}
                  </span>
                  <span className="font-semibold text-[#252923]">{formatCurrency(item.value, currency)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Transactions Table & Filters */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E9E8E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5]/60">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTypeFilter('All')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  typeFilter === 'All' ? 'bg-[#6B8F71] text-white' : 'bg-white text-[#777D75] border border-[#E9E8E1]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  typeFilter === 'expense' ? 'bg-[#D96C6C] text-white' : 'bg-white text-[#777D75] border border-[#E9E8E1]'
                }`}
              >
                Expenses
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  typeFilter === 'income' ? 'bg-[#4F9B72] text-white' : 'bg-white text-[#777D75] border border-[#E9E8E1]'
                }`}
              >
                Income
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#777D75] absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white w-full sm:w-56"
              />
            </div>
          </div>

          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#FAF8F5] text-[#777D75] uppercase text-[11px] font-semibold border-b border-[#E9E8E1]">
                  <tr>
                    <th className="px-5 py-3">Transaction</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E8E1]">
                  {transactions.map((txn) => (
                    <tr key={txn._id} className="hover:bg-[#FAF8F5]/40 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-[#252923]">
                        {txn.title}
                        {txn.description && (
                          <span className="block text-[11px] text-[#777D75] font-normal">{txn.description}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[#777D75]">{txn.category}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant="default" size="sm">
                          {txn.paymentMethod || 'UPI'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-[#777D75]">{formatDate(txn.date)}</td>
                      <td className="px-5 py-3.5 text-right font-semibold">
                        <span className={txn.type === 'income' ? 'text-[#4F9B72]' : 'text-[#252923]'}>
                          {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount, currency)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleDeleteTxn(txn._id)}
                          className="p-1.5 text-[#777D75] hover:text-[#D96C6C] rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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
            <div className="grid grid-cols-2 gap-2 bg-[#FAF8F5] p-1 rounded-xl border border-[#E9E8E1]">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  type === 'expense' ? 'bg-white text-[#D96C6C] shadow-sm' : 'text-[#777D75]'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  type === 'income' ? 'bg-white text-[#4F9B72] shadow-sm' : 'text-[#777D75]'
                }`}
              >
                Income
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#777D75] mb-1">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Workspace Rent or Consulting Retainer"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-[#FAF8F5]/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#777D75] mb-1">Amount ({currency}) *</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="₹ 5000"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#777D75] mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Design, Software, Food"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#777D75] mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
              >
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsTxnModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Transaction</Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Savings Goal */}
        <Modal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          title="New Savings Goal"
        >
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#777D75] mb-1">Goal Name *</label>
              <input
                type="text"
                required
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g. Emergency Fund or New M4 Mac"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-[#FAF8F5]/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#777D75] mb-1">Target Amount ({currency}) *</label>
                <input
                  type="number"
                  required
                  value={goalTargetAmount}
                  onChange={(e) => setGoalTargetAmount(e.target.value)}
                  placeholder="₹ 150000"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#777D75] mb-1">Current Saved ({currency})</label>
                <input
                  type="number"
                  value={goalCurrentAmount}
                  onChange={(e) => setGoalCurrentAmount(e.target.value)}
                  placeholder="₹ 25000"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsGoalModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Savings Goal</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

