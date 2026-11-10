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
  Palette,
  Sparkles,
  Trophy,
  Plus,
  Trash2,
  Calendar,
  Star,
  CheckCircle2,
} from 'lucide-react';

export default function CreativeProjectsPage() {
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Design');
  const [deadline, setDeadline] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [portfolioWorthy, setPortfolioWorthy] = useState(true);

  const fetchCreative = async () => {
    try {
      const res = await api.get('/creative');
      if (res.success) {
        setProjects(res.data.projects);
        setStats(res.data.stats);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreative();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const skills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      await api.post('/creative', {
        title,
        description,
        category,
        deadline: deadline || null,
        skills,
        coverImage,
        portfolioWorthy,
      });
      showToast('Project created', 'success');
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setCoverImage('');
      fetchCreative();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateProgress = async (id, newProgress) => {
    try {
      await api.put(`/creative/${id}`, {
        progress: newProgress,
        status: newProgress >= 100 ? 'Completed' : 'In Progress',
      });
      fetchCreative();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.delete(`/creative/${id}`);
      showToast('Project removed', 'success');
      fetchCreative();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filtered = categoryFilter === 'All'
    ? projects
    : projects.filter((p) => p.category === categoryFilter);

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">Side Ventures & Showcase</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight">Creative Projects</h1>
            <p className="text-xs sm:text-sm text-[#686E77] mt-1">
              Curate portfolio pieces, side projects, and design experiments.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} variant="primary" icon={Plus}>
            New Project
          </Button>
        </div>

        {/* 4 Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Projects"
            value={stats.totalProjects ?? 0}
            subtitle="Creative catalog"
            icon={Palette}
            trend="12"
          />
          <StatCard
            title="In Active Work"
            value={stats.inProgress ?? 0}
            subtitle="Under development"
            icon={Sparkles}
            trend="06"
          />
          <StatCard
            title="Completed Works"
            value={stats.completed ?? 0}
            subtitle="Shipped creations"
            icon={CheckCircle2}
            trend="16"
          />
          <StatCard
            title="Portfolio Ready"
            value={stats.portfolioProjects ?? 0}
            subtitle="Showcase quality"
            icon={Trophy}
            trend="20"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F0F2F5] rounded-full max-w-fit overflow-x-auto scrollbar-none">
          {['All', 'Design', 'Coding', 'Writing', 'Art', 'Video', 'Music'].map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === c
                  ? 'bg-[#111315] text-white shadow-xs'
                  : 'text-[#686E77] hover:text-[#111315]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((proj) => (
              <Card key={proj._id} className="flex flex-col justify-between overflow-hidden p-0">
                <div>
                  <div className="h-44 w-full relative bg-[#F0F2F5] overflow-hidden">
                    {proj.coverImage ? (
                      <img
                        src={proj.coverImage}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#686E77] bg-[#F7F8FA]">
                        <Palette className="w-8 h-8 text-[#111315]" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-1">
                      <Badge variant="lime" size="xs">
                        {proj.status}
                      </Badge>
                      {proj.portfolioWorthy && (
                        <span className="p-1 rounded-full bg-white text-[#FF5722] shadow-xs" title="Portfolio Worthy">
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3.5">
                    <div>
                      <span className="text-[10px] font-extrabold text-[#111315] uppercase tracking-wider bg-[#F0F2F5] px-2 py-0.5 rounded-full">
                        {proj.category}
                      </span>
                      <h3 className="font-extrabold text-lg text-[#111315] mt-2">{proj.title}</h3>
                      {proj.description && (
                        <p className="text-xs text-[#686E77] mt-1">{proj.description}</p>
                      )}
                    </div>

                    {/* Skills pills */}
                    {proj.skills && proj.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold bg-[#F0F2F5] text-[#111315] border border-[#E5E8ED] px-2.5 py-0.5 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Progress Slider */}
                    <div className="pt-2 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#686E77] font-medium">Progress</span>
                        <span className="font-bold text-[#111315]">{proj.progress || 0}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={proj.progress || 0}
                        onChange={(e) => handleUpdateProgress(proj._id, Number(e.target.value))}
                        className="w-full accent-[#111315] cursor-pointer h-1.5 bg-[#F0F2F5] rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-[#E5E8ED] bg-[#F7F8FA] flex items-center justify-between text-xs text-[#686E77]">
                  <span className="font-medium">
                    {proj.deadline ? `Deadline: ${formatDate(proj.deadline)}` : 'No hard deadline'}
                  </span>
                  <button
                    onClick={() => handleDeleteProject(proj._id)}
                    className="w-8 h-8 rounded-full hover:bg-[#FF5722]/10 flex items-center justify-center text-[#686E77] hover:text-[#FF5722] transition-colors"
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
            title="No creative projects recorded"
            description="Start documenting your designs, side projects, and open source creations."
            actionLabel="Add Project"
            onAction={() => setIsModalOpen(true)}
          />
        )}

        {/* Modal: Add Project */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="New Creative Project"
        >
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Project Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Minimalist Modular Iconography Kit"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Project brief, scope, and objectives..."
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                >
                  <option value="Design">Design</option>
                  <option value="Coding">Coding</option>
                  <option value="Writing">Writing</option>
                  <option value="Art">Art</option>
                  <option value="Video">Video</option>
                  <option value="Music">Music</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Skills (comma-separated)</label>
              <input
                type="text"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="Figma, Typography, SVG, React"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Cover Image URL</label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="portfolio"
                checked={portfolioWorthy}
                onChange={(e) => setPortfolioWorthy(e.target.checked)}
                className="rounded text-[#111315] focus:ring-0 w-4 h-4"
              />
              <label htmlFor="portfolio" className="text-xs font-semibold text-[#111315]">
                Highlight as Portfolio-Worthy Project
              </label>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">Create Project</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
