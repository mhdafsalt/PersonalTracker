'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { Card } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
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
      setBrief('');
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
      <div className="space-y-6 sm:space-y-7">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Link
                href="/graphic-design"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-[#E5E8ED] text-[#686E77] hover:text-[#111315] hover:border-[#111315] transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio
              </Link>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">Production & Commissions</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight">Design Projects Tracker</h1>
            <p className="text-xs sm:text-sm text-[#686E77] mt-1">
              Deliverables, client review statuses, payment milestones, and design deadlines.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
            Create Design Project
          </Button>
        </div>

        {/* 4 Bento Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Projects"
            value={stats.totalProjects ?? 0}
            subtitle="Commissioned works"
            icon={Briefcase}
            trend="12"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress ?? 0}
            subtitle="Active design production"
            icon={Clock}
            trend="08"
          />
          <StatCard
            title="Under Review"
            value={stats.awaitingApproval ?? 0}
            subtitle="Awaiting client approval"
            icon={AlertCircle}
          />
          <StatCard
            title="Completed"
            value={stats.completed ?? 0}
            subtitle="Approved and delivered"
            icon={CheckCircle2}
            trend="24"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F0F2F5] rounded-full max-w-fit overflow-x-auto scrollbar-none">
          {['All', 'New', 'In Progress', 'Review', 'Completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === s
                  ? 'bg-[#111315] text-white shadow-xs'
                  : 'text-[#686E77] hover:text-[#111315]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Projects Cards Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj) => (
              <Card key={proj._id} className="flex flex-col justify-between group hover:border-[#111315]/40 transition-all">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#686E77] uppercase tracking-wider">
                        {proj.category}
                      </span>
                      <h3 className="font-extrabold text-lg text-[#111315] mt-0.5 leading-snug">{proj.title}</h3>
                      <p className="text-xs text-[#686E77] font-medium">
                        Client: <span className="font-bold text-[#111315]">{proj.client?.name || 'Client'}</span>
                      </p>
                    </div>
                    <Badge variant={proj.status === 'Completed' ? 'lime' : 'default'} size="xs">
                      {proj.status}
                    </Badge>
                  </div>

                  {proj.brief && (
                    <p className="text-xs text-[#686E77] mt-3 bg-[#F7F8FA] p-3 rounded-2xl border border-[#E5E8ED] font-medium">
                      {proj.brief}
                    </p>
                  )}

                  {/* Financials & Deadline */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-[#F7F8FA] border border-[#E5E8ED] space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#686E77] font-medium">Project Pricing:</span>
                      <span className="font-extrabold text-[#111315]">{formatCurrency(proj.pricing, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#686E77] font-medium">Advance Paid:</span>
                      <span className="font-bold text-[#111315]">{formatCurrency(proj.advancePayment, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-[#E5E8ED]">
                      <span className="text-[#686E77] font-medium">Remaining:</span>
                      <span className="font-extrabold text-[#FF5722]">{formatCurrency(proj.remainingPayment, currency)}</span>
                    </div>
                    {proj.deadline && (
                      <div className="flex justify-between items-center text-[11px] text-[#686E77] pt-1">
                        <span>Deadline:</span>
                        <span className="font-semibold text-[#111315]">{formatDate(proj.deadline)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-[#E5E8ED] flex items-center justify-between gap-2 text-xs">
                  <select
                    value={proj.status}
                    onChange={(e) => handleStatusChange(proj._id, e.target.value)}
                    className="px-3 py-1.5 rounded-full border border-[#E5E8ED] bg-[#F7F8FA] text-[#111315] font-semibold text-xs focus:outline-none focus:border-[#111315]"
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
                    className="w-8 h-8 rounded-full bg-[#F0F2F5] text-[#8C939F] hover:text-[#FF5722] hover:bg-red-50 flex items-center justify-center transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
              <label className="block text-xs font-semibold text-[#111315] mb-1.5">Select Client *</label>
              <select
                required
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium rounded-2xl border border-[#E5E8ED] bg-[#F7F8FA] focus:bg-white focus:outline-none focus:border-[#111315]"
              >
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.brandName || c.company || 'Client'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111315] mb-1.5">Project Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Brand Identity & Logo Guidelines"
                className="w-full px-3.5 py-2 text-xs font-medium rounded-2xl border border-[#E5E8ED] bg-[#F7F8FA] focus:bg-white focus:outline-none focus:border-[#111315]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#111315] mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-2xl border border-[#E5E8ED] bg-[#F7F8FA] focus:bg-white focus:outline-none focus:border-[#111315]"
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
                <label className="block text-xs font-semibold text-[#111315] mb-1.5">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-2xl border border-[#E5E8ED] bg-[#F7F8FA] focus:bg-white focus:outline-none focus:border-[#111315]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#111315] mb-1.5">Pricing ({currency}) *</label>
                <input
                  type="number"
                  required
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-2xl border border-[#E5E8ED] bg-[#F7F8FA] focus:bg-white focus:outline-none focus:border-[#111315]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111315] mb-1.5">Advance Payment ({currency})</label>
                <input
                  type="number"
                  value={advancePayment}
                  onChange={(e) => setAdvancePayment(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-2xl border border-[#E5E8ED] bg-[#F7F8FA] focus:bg-white focus:outline-none focus:border-[#111315]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111315] mb-1.5">Design Brief & Deliverables</label>
              <textarea
                rows={2}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Scope, export formats, revision parameters..."
                className="w-full px-3.5 py-2 text-xs font-medium rounded-2xl border border-[#E5E8ED] bg-[#F7F8FA] focus:bg-white focus:outline-none focus:border-[#111315]"
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
