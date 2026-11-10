'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { Card } from '../../../components/ui/Card';
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
  Users2,
  Briefcase,
  Mail,
  Phone,
  Building,
  Plus,
  Trash2,
  FolderOpen,
  ArrowLeft,
  DollarSign,
  Search,
} from 'lucide-react';

export default function ClientRegistryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClientDetails, setSelectedClientDetails] = useState(null);

  // Form
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [requirements, setRequirements] = useState('');
  const [notes, setNotes] = useState('');

  const fetchClients = async () => {
    try {
      const res = await api.get('/design/clients');
      if (res.success) setClients(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.post('/design/clients', {
        name,
        brandName: brandName || name,
        company,
        email,
        phone,
        requirements,
        notes,
      });
      showToast('Client registered', 'success');
      setIsClientModalOpen(false);
      setName('');
      setBrandName('');
      setEmail('');
      setCompany('');
      setPhone('');
      setRequirements('');
      setNotes('');
      fetchClients();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenClientDetails = async (client) => {
    try {
      const res = await api.get(`/design/clients/${client._id}`);
      if (res.success) {
        setSelectedClientDetails(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteClient = async (id) => {
    if (!confirm('Delete this client and all their design projects?')) return;
    try {
      await api.delete(`/design/clients/${id}`);
      showToast('Client removed', 'success');
      fetchClients();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const currency = user?.currency || 'INR';

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <p className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">Creative Partners & Accounts</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight">Client Registry</h1>
            <p className="text-xs sm:text-sm text-[#686E77] mt-1">
              Directory of design clients, brand specifications, project history, and billing records.
            </p>
          </div>
          <Button onClick={() => setIsClientModalOpen(true)} icon={Plus}>
            Add Client
          </Button>
        </div>

        {/* Search Bar & Client Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C939F]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients, brands, companies..."
              className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-full bg-white border border-[#E5E8ED] text-[#111315] placeholder-[#8C939F] focus:outline-none focus:border-[#111315]"
            />
          </div>
          <div className="text-xs font-semibold text-[#686E77] flex items-center gap-2">
            <span>Total Accounts:</span>
            <Badge variant="lime" size="xs">{clients.length}</Badge>
          </div>
        </div>

        {/* Clients Grid */}
        {filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClients.map((client) => (
              <Card key={client._id} className="flex flex-col justify-between group hover:border-[#111315]/40 transition-all">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#686E77] uppercase tracking-wider">
                        {client.company || 'CLIENT ENTITY'}
                      </span>
                      <h3 className="font-extrabold text-lg text-[#111315] mt-0.5 leading-snug">{client.name}</h3>
                      {client.brandName && (
                        <p className="text-xs text-[#686E77] font-medium">Brand: {client.brandName}</p>
                      )}
                    </div>
                    <Badge variant={client.status === 'Active' ? 'lime' : 'default'} size="xs">
                      {client.status || 'Active'}
                    </Badge>
                  </div>

                  {/* Financials & Projects info pill container */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-[#F7F8FA] border border-[#E5E8ED] space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#686E77] font-medium">Associated Projects:</span>
                      <span className="font-extrabold text-[#111315]">{client.projectsCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#686E77] font-medium">Total Billed:</span>
                      <span className="font-extrabold text-[#111315]">{formatCurrency(client.totalBilled || 0, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-[#E5E8ED]">
                      <span className="text-[#686E77] font-medium">Pending Payment:</span>
                      <span className="font-extrabold text-[#FF5722]">
                        {formatCurrency(client.pendingPayment || 0, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Contact channels */}
                  <div className="mt-3 space-y-1.5 text-xs text-[#686E77]">
                    {client.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-[#111315] shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#111315] shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-[#E5E8ED] flex items-center justify-between gap-2">
                  <Button
                    onClick={() => handleOpenClientDetails(client)}
                    size="sm"
                    variant="secondary"
                    icon={FolderOpen}
                  >
                    Projects ({client.projectsCount || 0})
                  </Button>
                  <button
                    onClick={() => handleDeleteClient(client._id)}
                    className="w-8 h-8 rounded-full bg-[#F0F2F5] text-[#8C939F] hover:text-[#FF5722] hover:bg-red-50 flex items-center justify-center transition-colors"
                    title="Delete Client"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users2}
            title="No clients found"
            description="Register clients to link with creative projects, briefs, and billing records."
            actionLabel="Add Client"
            onAction={() => setIsClientModalOpen(true)}
          />
        )}

        {/* Modal: Add Client */}
        <Modal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          title="Add New Client"
        >
          <form onSubmit={handleCreateClient} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#111315] mb-1.5">Contact Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rohan Verma"
                className="w-full px-3.5 py-2 text-xs font-medium rounded-2xl border border-[#E5E8ED] bg-[#F7F8FA] focus:bg-white focus:outline-none focus:border-[#111315]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#111315] mb-1.5">Brand Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Nordic Craft"
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-2xl border border-[#E5E8ED] bg-[#F7F8FA] focus:bg-white focus:outline-none focus:border-[#111315]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111315] mb-1.5">Company Entity</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Nordic Craft Ltd."
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-2xl border border-[#E5E8ED] bg-[#F7F8FA] focus:bg-white focus:outline-none focus:border-[#111315]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#111315] mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@brand.com"
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-2xl border border-[#E5E8ED] bg-[#F7F8FA] focus:bg-white focus:outline-none focus:border-[#111315]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111315] mb-1.5">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-2xl border border-[#E5E8ED] bg-[#F7F8FA] focus:bg-white focus:outline-none focus:border-[#111315]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111315] mb-1.5">Requirements & Guidelines</label>
              <textarea
                rows={2}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Preferred color aesthetics, brand values..."
                className="w-full px-3.5 py-2 text-xs font-medium rounded-2xl border border-[#E5E8ED] bg-[#F7F8FA] focus:bg-white focus:outline-none focus:border-[#111315]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsClientModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Register Client</Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Interconnected Client Profile Details & All Projects */}
        <Modal
          isOpen={!!selectedClientDetails}
          onClose={() => setSelectedClientDetails(null)}
          title={`Client Profile: ${selectedClientDetails?.client?.name || ''}`}
          maxWidth="max-w-2xl"
        >
          {selectedClientDetails && (
            <div className="space-y-5">
              {/* Client Header Info */}
              <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E5E8ED] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-base text-[#111315]">
                    {selectedClientDetails.client.brandName || selectedClientDetails.client.name}
                  </h4>
                  <Badge variant="lime" size="xs">{selectedClientDetails.client.status || 'Active'}</Badge>
                </div>
                {selectedClientDetails.client.requirements && (
                  <p className="text-[#686E77]">{selectedClientDetails.client.requirements}</p>
                )}
                <div className="flex justify-between pt-2 border-t border-[#E5E8ED] font-bold text-xs text-[#111315]">
                  <span>Total Billed: {formatCurrency(selectedClientDetails.financials?.totalBilled, currency)}</span>
                  <span className="text-[#FF5722]">
                    Pending: {formatCurrency(selectedClientDetails.financials?.pendingPayment, currency)}
                  </span>
                </div>
              </div>

              {/* Interconnected Associated Projects */}
              <div>
                <h4 className="font-bold text-sm text-[#111315] mb-3">
                  Associated Design Projects ({selectedClientDetails.projects?.length || 0})
                </h4>

                {selectedClientDetails.projects && selectedClientDetails.projects.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedClientDetails.projects.map((proj) => (
                      <div
                        key={proj._id}
                        className="p-3.5 rounded-2xl border border-[#E5E8ED] bg-white hover:border-[#111315]/40 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-sm text-[#111315]">{proj.title}</h5>
                            <Badge variant="default" size="xs">{proj.category}</Badge>
                          </div>
                          <p className="text-xs text-[#686E77] mt-0.5 font-medium">
                            Pricing: {formatCurrency(proj.pricing, currency)} • Status: {proj.status}
                          </p>
                        </div>
                        <Badge
                          variant={proj.paymentStatus === 'Paid' ? 'lime' : 'warning'}
                          size="xs"
                        >
                          {proj.paymentStatus}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#686E77]">No design projects created for this client yet.</p>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-[#E5E8ED]">
                <Button onClick={() => setSelectedClientDetails(null)} variant="secondary">
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}
