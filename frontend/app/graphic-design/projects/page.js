'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { Card } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../..//components/ui/EmptyState';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDate } from '../../../utils/format';
import Link from 'next/link';
import {
  Palette,
  Briefcase,
  Users2,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowLeft,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export default function DesignProjectsTrackerPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({});
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Brand Identity');
  const [deadline, setDeadline] = useState('');
  const [pricing, setPricing] = useState(25000);
  const [advancePayment, setAdvancePayment] = useState(12500);
  const [brief, setBrief] = useState('');

  const fetchProjects = async () => {
    try {
      let query = '';
      if (statusFilter !== 'All') query += `status=${statusFilter}&`;
      if (categoryFilter !== 'All') query += `category=${categoryFilter}&`;

      const [projRes, clientRes] = await Promise.all([
        api.get(`/design/projects?${query}`),
        api.get('/design/clients'),
      ]);

      if (projRes.success) {
        setProjects(projRes.data.projects);
        setStats(projRes.data.stats);
      }
      if (clientRes.success) {
        setClients(clientRes.data);
        if (clientRes.data.length > 0 && !selectedClient) {
          setSelectedClient(clientRes.data[0]._id);
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, categoryFilter]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!selectedClient || !title.trim()) return;
    try {
      await api.post('/design/projects', {
        client: selectedClient,
        title,
        description,
        category,
        deadline: deadline || null,
        pricing: Number(pricing),
        advancePayment: Number(advancePayment),
        brief,
      });
      showToast('Design project created', 'success');
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      fetchProjects();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/design/projects/${id}`, { status });
      showToast('Project status updated', 'success');
      fetchProjects();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('Delete this design project?')) return;
    try {
      await api.delete(`/design/projects/${id}`);
      showToast('Project removed', 'success');
      fetchProjects();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const currency = user?.currency || 'INR';

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/graphic-design" className="text-xs text-[#6B8F71] hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#252923] tracking-tight">Design Projects Tracker</h1>
            <p className="text-sm text-[#777D75] mt-1">
              Deliverables, client review statuses, payment milestones, and design deadlines.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
            Create Design Project
          </Button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Projects"
            value={stats.totalProjects ?? 0}
            subtitle="Commissioned works"
            icon={Briefcase}
            color="#6B8F71"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress ?? 0}
            subtitle="Active design production"
            icon={Clock}
            color="#D6A24A"
          />
          <StatCard
            title="Under Client Review"
            value={stats.awaitingApproval ?? 0}
            subtitle="Awaiting client approval"
            icon={AlertCircle}
            color="#A7B99B"
          />
          <StatCard
            title="Completed Projects"
            value={stats.completed ?? 0}
            subtitle="Approved and delivered"
            icon={CheckCircle2}
            color="#4F9B72"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'New', 'In Progress', 'Review', 'Completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                statusFilter === s
                  ? 'bg-[#6B8F71] text-white shadow-sm'
                  : 'bg-white text-[#777D75] hover:bg-[#FAF8F5] border border-[#E9E8E1]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Projects Cards Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <Card key={proj._id} hover className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-[#6B8F71] uppercase tracking-wider">
                        {proj.category}
                      </span>
                      <h3 className="font-bold text-lg text-[#252923] mt-0.5">{proj.title}</h3>
                      <p className="text-xs text-[#777D75]">
                        Client: <span className="font-semibold text-[#252923]">{proj.client?.name || 'Client'}</span>
                      </p>
                    </div>
                    <Badge variant={proj.status === 'Completed' ? 'success' : 'sage'} size="sm">
                      {proj.status}
                    </Badge>
                  </div>

                  {proj.brief && (
                    <p className="text-xs text-[#777D75] mt-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E9E8E1]">
                      {proj.brief}
                    </p>
                  )}

                  {/* Financials & Deadline */}
                  <div className="mt-4 p-3 rounded-xl bg-[#FAF8F5] border border-[#E9E8E1] space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#777D75]">Project Pricing:</span>
                      <span className="font-bold text-[#252923]">{formatCurrency(proj.pricing, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777D75]">Advance Paid:</span>
                      <span className="font-semibold text-[#4F9B72]">{formatCurrency(proj.advancePayment, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777D75]">Remaining:</span>
                      <span className="font-semibold text-[#D96C6C]">{formatCurrency(proj.remainingPayment, currency)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E9E8E1] flex items-center justify-between text-xs">
                  <select
                    value={proj.status}
                    onChange={(e) => handleStatusChange(proj._id, e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-[#E9E8E1] bg-white text-[#252923] font-medium"
                  >
                    <option value="New">New</option>
                    <option value="Brief Received">Brief Received</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Revision">Revision</option>
                    <option value="Approved">Approved</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <button
                    onClick={() => handleDeleteProject(proj._id)}
                    className="p-1.5 text-[#777D75] hover:text-[#D96C6C] rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Palette}
            title="No design projects found"
            description="Create client design commissions, brand identities, or UI designs."
            actionLabel="New Design Project"
            onAction={() => setIsModalOpen(true)}
          />
        )}

        {/* Modal: Create Design Project */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Design Project"
        >
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#777D75] mb-1">Select Client *</label>
              <select
                required
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
              >
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.brandName || c.company || 'Client'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#777D75] mb-1">Project Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Brand Identity & Logo Guidelines"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-[#FAF8F5]/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#777D75] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
                >
                  <option value="Logo Design">Logo Design</option>
                  <option value="Brand Identity">Brand Identity</option>
                  <option value="Social Media Design">Social Media Design</option>
                  <option value="Poster Design">Poster Design</option>
                  <option value="Banner Design">Banner Design</option>
                  <option value="Business Card">Business Card</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Packaging Design">Packaging Design</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#777D75] mb-1">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#777D75] mb-1">Pricing ({currency}) *</label>
                <input
                  type="number"
                  required
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#777D75] mb-1">Advance Payment ({currency})</label>
                <input
                  type="number"
                  value={advancePayment}
                  onChange={(e) => setAdvancePayment(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#777D75] mb-1">Design Brief & Deliverables</label>
              <textarea
                rows={2}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Scope, export formats, revision parameters..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Project</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

