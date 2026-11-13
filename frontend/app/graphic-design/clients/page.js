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
} from 'lucide-react';

export default function ClientRegistryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

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
    try {
      await api.delete(`/design/clients/${id}`);
      showToast('Client removed', 'success');
      fetchClients();
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
              <Link href="/graphic-design" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Client Registry</h1>
            <p className="text-sm text-slate-500 mt-1">
              Directory of design clients, brand specifications, project history, and billing records.
            </p>
          </div>
          <Button onClick={() => setIsClientModalOpen(true)} icon={Plus}>
            Add Client
          </Button>
        </div>

        {/* Clients Grid */}
        {clients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <Card key={client._id} hover className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                        {client.company || 'CLIENT'}
                      </span>
                      <h3 className="font-bold text-lg text-slate-900 mt-0.5">{client.name}</h3>
                      {client.brandName && (
                        <p className="text-xs text-slate-500">Brand: {client.brandName}</p>
                      )}
                    </div>
                    <Badge variant={client.status === 'Active' ? 'success' : 'default'} size="sm">
                      {client.status}
                    </Badge>
                  </div>

                  {/* Financials & Projects info */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Associated Projects:</span>
                      <span className="font-semibold text-slate-900">{client.projectsCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Billed:</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(client.totalBilled || 0, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pending Payment:</span>
                      <span className="font-semibold text-rose-600">
                        {formatCurrency(client.pendingPayment || 0, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Contact channels */}
                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    {client.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <Button
                    onClick={() => handleOpenClientDetails(client)}
                    size="sm"
                    variant="secondary"
                    icon={FolderOpen}
                  >
                    View Projects ({client.projectsCount || 0})
                  </Button>
                  <button
                    onClick={() => handleDeleteClient(client._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
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
              <label className="block text-xs font-medium text-slate-500 mb-1">Contact Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rohan Verma"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Nordic Craft"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Company Entity</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Nordic Craft Ltd."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@brand.com"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Requirements & Guidelines</label>
              <textarea
                rows={2}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Preferred color aesthetics, brand values..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
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
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-base text-slate-900">
                    {selectedClientDetails.client.brandName || selectedClientDetails.client.name}
                  </h4>
                  <Badge variant="sage" size="sm">{selectedClientDetails.client.status}</Badge>
                </div>
                {selectedClientDetails.client.requirements && (
                  <p className="text-slate-500">{selectedClientDetails.client.requirements}</p>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 font-semibold text-xs text-slate-900">
                  <span>Total Billed: {formatCurrency(selectedClientDetails.financials?.totalBilled, currency)}</span>
                  <span className="text-rose-600">
                    Pending: {formatCurrency(selectedClientDetails.financials?.pendingPayment, currency)}
                  </span>
                </div>
              </div>

              {/* Interconnected Associated Projects */}
              <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-3">
                  Associated Design Projects ({selectedClientDetails.projects?.length || 0})
                </h4>

                {selectedClientDetails.projects && selectedClientDetails.projects.length > 0 ? (
                  <div className="space-y-3">
                    {selectedClientDetails.projects.map((proj) => (
                      <div
                        key={proj._id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-600/50 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-sm text-slate-900">{proj.title}</h5>
                            <Badge variant="sage" size="sm">{proj.category}</Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Pricing: {formatCurrency(proj.pricing, currency)} • Status: {proj.status}
                          </p>
                        </div>
                        <Badge
                          variant={proj.paymentStatus === 'Paid' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {proj.paymentStatus}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No design projects created for this client yet.</p>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200">
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

