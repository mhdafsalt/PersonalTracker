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
      setSkillsText('');
      fetchCreative();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateProgress = async (id, progress) => {
    try {
      const status = progress >= 100 ? 'Completed' : 'In Progress';
      await api.put(`/creative/${id}`, { progress, status });
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

  const filtered = categoryFilter === 'All' ? projects : projects.filter((p) => p.category === categoryFilter);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#252923] tracking-tight">Creative & Extracurricular Projects</h1>
            <p className="text-sm text-[#777D75] mt-1">
              Showcase design systems, open-source repositories, photography, and portfolio-worthy ventures.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
            New Project
          </Button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Projects"
            value={stats.totalProjects ?? 0}
            subtitle="Creative endeavors"
            icon={Palette}
            color="#6B8F71"
          />
          <StatCard
            title="Active"
            value={stats.activeProjects ?? 0}
            subtitle="Under active craft"
            icon={Sparkles}
            color="#D6A24A"
          />
          <StatCard
            title="Completed"
            value={stats.completedProjects ?? 0}
            subtitle="Shipped works"
            icon={CheckCircle2}
            color="#4F9B72"
          />
          <StatCard
            title="Portfolio Ready"
            value={stats.portfolioProjects ?? 0}
            subtitle="Showcase quality"
            icon={Trophy}
            color="#6B8F71"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['All', 'Design', 'Coding', 'Writing', 'Art', 'Video', 'Music'].map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === c
                  ? 'bg-[#6B8F71] text-white shadow-sm'
                  : 'bg-white text-[#777D75] hover:bg-[#FAF8F5] border border-[#E9E8E1]'
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
              <Card key={proj._id} hover className="flex flex-col justify-between overflow-hidden p-0">
                <div>
                  <div className="h-44 w-full relative bg-[#FAF8F5] overflow-hidden">
                    {proj.coverImage ? (
                      <img
                        src={proj.coverImage}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#777D75] bg-[#EFECE4]">
                        <Palette className="w-8 h-8 text-[#6B8F71]" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-1">
                      <Badge variant="sage" size="sm" className="bg-white/90 backdrop-blur-md">
                        {proj.status}
                      </Badge>
                      {proj.portfolioWorthy && (
                        <span className="p-1 rounded-full bg-white/90 text-[#D6A24A] shadow-xs" title="Portfolio Worthy">
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-[11px] font-semibold text-[#6B8F71] uppercase tracking-wider">
                        {proj.category}
                      </span>
                      <h3 className="font-bold text-lg text-[#252923] mt-0.5">{proj.title}</h3>
                      {proj.description && (
                        <p className="text-xs text-[#777D75] mt-1">{proj.description}</p>
                      )}
                    </div>

                    {/* Skills pills */}
                    {proj.skills && proj.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium bg-[#FAF8F5] text-[#252923] border border-[#E9E8E1] px-2 py-0.5 rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Progress Slider */}
                    <div className="pt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#777D75]">Progress</span>
                        <span className="font-semibold text-[#6B8F71]">{proj.progress || 0}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={proj.progress || 0}
                        onChange={(e) => handleUpdateProgress(proj._id, Number(e.target.value))}
                        className="w-full accent-[#6B8F71] cursor-pointer h-1.5 bg-[#FAF8F5] rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-[#E9E8E1] bg-[#FAF8F5]/50 flex items-center justify-between text-xs text-[#777D75]">
                  <span>
                    {proj.deadline ? `Deadline: ${formatDate(proj.deadline)}` : 'No hard deadline'}
                  </span>
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
              <label className="block text-xs font-medium text-[#777D75] mb-1">Project Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Minimalist Modular Iconography Kit"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-[#FAF8F5]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#777D75] mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Project brief, scope, and objectives..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
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
                  <option value="Design">Design</option>
                  <option value="Coding">Coding</option>
                  <option value="Writing">Writing</option>
                  <option value="Art">Art</option>
                  <option value="Video">Video</option>
                  <option value="Music">Music</option>
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

            <div>
              <label className="block text-xs font-medium text-[#777D75] mb-1">Skills (comma-separated)</label>
              <input
                type="text"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="Figma, Typography, SVG, React"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#777D75] mb-1">Cover Image URL</label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="portfolio"
                checked={portfolioWorthy}
                onChange={(e) => setPortfolioWorthy(e.target.checked)}
                className="rounded text-[#6B8F71] focus:ring-0"
              />
              <label htmlFor="portfolio" className="text-xs text-[#252923]">
                Highlight as Portfolio-Worthy Project
              </label>
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

