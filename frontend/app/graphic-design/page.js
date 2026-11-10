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
      <div className="space-y-6 sm:space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252923] tracking-tight">Graphic Design Studio</h1>
              <Badge variant="sage" size="sm">Agency Workspace</Badge>
            </div>
            <p className="text-sm text-[#777D75] mt-1">
              Manage client relationships, brand identities, vector deliverables, and payments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/graphic-design/clients">
              <Button variant="secondary" icon={Users2}>
                Client Registry
              </Button>
            </Link>
            <Link href="/graphic-design/projects">
              <Button icon={Plus}>
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
            color="#6B8F71"
          />
          <StatCard
            title="Design Projects"
            value={stats.totalProjects ?? 0}
            subtitle={`${stats.inProgress ?? 0} in active production`}
            icon={Briefcase}
            color="#A7B99B"
          />
          <StatCard
            title="Total Invoiced"
            value={formatCurrency(totalBilled, currency)}
            subtitle={`${formatCurrency(totalPaid, currency)} collected`}
            icon={DollarSign}
            color="#4F9B72"
          />
          <StatCard
            title="Pending Receivables"
            value={formatCurrency(totalPending, currency)}
            subtitle={`${stats.pendingPaymentsCount ?? 0} unpaid balances`}
            icon={AlertCircle}
            color="#D6A24A"
          />
        </div>

        {/* Two Pillars Banner Cards: Clients & Projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card hover className="bg-gradient-to-br from-white to-[#FAF8F5] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#6B8F71]/15 text-[#6B8F71] flex items-center justify-center">
                  <Users2 className="w-5 h-5" />
                </div>
                <Badge variant="sage" size="sm">{clients.length} Registered</Badge>
              </div>
              <h3 className="font-bold text-xl text-[#252923] mt-3">Client Registry</h3>
              <p className="text-xs text-[#777D75] mt-1">
                Maintain client company directory, brand guidelines, contacts, and view every associated project.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#E9E8E1]">
              <Link href="/graphic-design/clients">
                <Button className="w-full" variant="secondary" icon={ArrowRight}>
                  Open Client Registry
                </Button>
              </Link>
            </div>
          </Card>

          <Card hover className="bg-gradient-to-br from-white to-[#FAF8F5] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#A7B99B]/20 text-[#6B8F71] flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <Badge variant="sage" size="sm">{stats.totalProjects ?? 0} Projects</Badge>
              </div>
              <h3 className="font-bold text-xl text-[#252923] mt-3">Design Projects Tracker</h3>
              <p className="text-xs text-[#777D75] mt-1">
                Track logo designs, brand identities, social banners, revision versions, and milestones.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#E9E8E1]">
              <Link href="/graphic-design/projects">
                <Button className="w-full" icon={ArrowRight}>
                  Open Projects Tracker
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Design Projects Production Feed */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E9E8E1] flex items-center justify-between bg-[#FAF8F5]/60">
            <div>
              <h3 className="font-semibold text-base text-[#252923]">Active Design Production</h3>
              <p className="text-xs text-[#777D75]">Latest creative projects across all client accounts.</p>
            </div>
            <Link href="/graphic-design/projects">
              <Button size="sm" variant="ghost">View All Projects</Button>
            </Link>
          </div>

          {recentProjects.length > 0 ? (
            <div className="divide-y divide-[#E9E8E1]">
              {recentProjects.map((proj) => (
                <div key={proj._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5]/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#6B8F71]/15 text-[#6B8F71] flex items-center justify-center shrink-0 mt-0.5">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm sm:text-base text-[#252923]">{proj.title}</h4>
                        <Badge variant="sage" size="sm">{proj.category}</Badge>
                      </div>
                      <p className="text-xs text-[#777D75] mt-0.5">
                        Client: <span className="font-medium text-[#252923]">{proj.client?.name || 'Client'}</span>
                        {proj.deadline && ` • Due ${formatDate(proj.deadline)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right text-xs">
                      <span className="font-semibold text-[#252923] block">{formatCurrency(proj.pricing, currency)}</span>
                      <span className={`text-[11px] ${proj.paymentStatus === 'Paid' ? 'text-[#4F9B72]' : 'text-[#D6A24A]'}`}>
                        {proj.paymentStatus}
                      </span>
                    </div>
                    <Badge variant={proj.status === 'Completed' ? 'success' : 'sage'} size="sm">
                      {proj.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-8 text-center text-xs text-[#777D75]">No design projects active yet.</p>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

