'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/format';
import Link from 'next/link';
import {
  Briefcase,
  Users2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  DollarSign,
  Palette,
} from 'lucide-react';

export default function GraphicDesignStudioPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [clients, setClients] = useState([]);
  const [projectsData, setProjectsData] = useState({ projects: [], stats: {} });
  const [loading, setLoading] = useState(true);

  const fetchStudio = async () => {
    try {
      const [clientsRes, projectsRes] = await Promise.all([
        api.get('/design/clients'),
        api.get('/design/projects'),
      ]);
      if (clientsRes.success) setClients(clientsRes.data);
      if (projectsRes.success) setProjectsData(projectsRes.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudio();
  }, []);

  const currency = user?.currency || 'INR';
  const stats = projectsData.stats || {};
  const recentProjects = (projectsData.projects || []).slice(0, 5);

  const totalBilled = clients.reduce((sum, c) => sum + (c.totalBilled || 0), 0);
  const totalPaid = clients.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
  const totalPending = totalBilled - totalPaid;

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-7">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">Creative Agency Workspace</span>
              <span className="text-[10px] bg-[#D4F648] text-[#111315] px-2.5 py-0.5 rounded-full font-extrabold shadow-xs">
                PRO
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight mt-0.5">Graphic Design Studio</h1>
            <p className="text-xs sm:text-sm text-[#686E77] mt-1">
              Manage client relationships, brand identities, vector deliverables, and payments.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/graphic-design/clients">
              <Button variant="secondary" icon={Users2}>
                Client Registry
              </Button>
            </Link>
            <Link href="/graphic-design/projects">
              <Button variant="primary" icon={Plus}>
                Design Projects
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Clients"
            value={clients.length}
            subtitle={`${clients.filter((c) => c.status === 'Active').length} active retainers`}
            icon={Users2}
            trend="14"
          />
          <StatCard
            title="Design Projects"
            value={stats.totalProjects ?? 0}
            subtitle={`${stats.inProgress ?? 0} in active production`}
            icon={Briefcase}
            trend="20"
          />
          <StatCard
            title="Total Invoiced"
            value={formatCurrency(totalBilled, currency)}
            subtitle={`${formatCurrency(totalPaid, currency)} collected`}
            icon={DollarSign}
            trend="25"
          />
          <StatCard
            title="Pending Receivables"
            value={formatCurrency(totalPending, currency)}
            subtitle={`${stats.pendingPaymentsCount ?? 0} unpaid balances`}
            icon={AlertCircle}
            trend="08"
          />
        </div>

        {/* Two Pillars Banner Cards: Clients & Projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-full bg-[#111315] text-[#D4F648] flex items-center justify-center font-bold">
                  <Users2 className="w-5 h-5" />
                </div>
                <Badge variant="default" size="xs">{clients.length} Registered</Badge>
              </div>
              <h3 className="font-extrabold text-xl text-[#111315] mt-4">Client Registry</h3>
              <p className="text-xs text-[#686E77] mt-1.5 leading-relaxed">
                Maintain client company directory, brand guidelines, contacts, and view every associated project.
              </p>
            </div>
            <div className="pt-4 mt-5 border-t border-[#E5E8ED]">
              <Link href="/graphic-design/clients">
                <Button className="w-full" variant="secondary" icon={ArrowRight}>
                  Open Client Registry
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-full bg-[#111315] text-[#D4F648] flex items-center justify-center font-bold">
                  <Palette className="w-5 h-5" />
                </div>
                <Badge variant="lime" size="xs">{stats.totalProjects ?? 0} Projects</Badge>
              </div>
              <h3 className="font-extrabold text-xl text-[#111315] mt-4">Design Projects Tracker</h3>
              <p className="text-xs text-[#686E77] mt-1.5 leading-relaxed">
                Track logo designs, brand identities, social banners, revision versions, and milestones.
              </p>
            </div>
            <div className="pt-4 mt-5 border-t border-[#E5E8ED]">
              <Link href="/graphic-design/projects">
                <Button className="w-full" variant="primary" icon={ArrowRight}>
                  Open Projects Tracker
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Design Projects Production Feed */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E5E8ED] flex items-center justify-between bg-[#F7F8FA]">
            <div>
              <h3 className="font-bold text-base text-[#111315]">Active Design Production</h3>
              <p className="text-xs text-[#686E77] mt-0.5">Latest creative projects across all client accounts.</p>
            </div>
            <Link href="/graphic-design/projects">
              <Button size="sm" variant="ghost">View All Projects</Button>
            </Link>
          </div>

          {recentProjects.length > 0 ? (
            <div className="divide-y divide-[#E5E8ED]">
              {recentProjects.map((proj) => (
                <div key={proj._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7F8FA]/60 transition-colors">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#111315] text-[#D4F648] flex items-center justify-center shrink-0 mt-0.5">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-[#111315]">{proj.title}</h4>
                        <Badge variant="default" size="xs">{proj.category}</Badge>
                      </div>
                      <p className="text-xs text-[#686E77] mt-0.5">
                        Client: <span className="font-bold text-[#111315]">{proj.client?.name || 'Client'}</span>
                        {proj.deadline && ` • Due ${formatDate(proj.deadline)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right text-xs">
                      <span className="font-extrabold text-[#111315] block">{formatCurrency(proj.pricing, currency)}</span>
                      <span className={`text-[10px] font-bold ${proj.paymentStatus === 'Paid' ? 'text-[#059669]' : 'text-[#FF5722]'}`}>
                        {proj.paymentStatus}
                      </span>
                    </div>
                    <Badge variant={proj.status === 'Completed' ? 'lime' : 'default'} size="xs">
                      {proj.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-8 text-center text-xs text-[#686E77]">No design projects active yet.</p>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
