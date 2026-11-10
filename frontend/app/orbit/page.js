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
  Users2,
  PhoneCall,
  Calendar,
  Star,
  Plus,
  Trash2,
  Search,
  Mail,
  Phone,
  Building,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

export default function OrbitPage() {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [calls, setCalls] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [activeView, setActiveView] = useState('contacts'); // 'contacts' | 'calls'

  // Modals
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [selectedContactForCall, setSelectedContactForCall] = useState(null);

  // Contact form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [category, setCategory] = useState('Professional');
  const [isImportant, setIsImportant] = useState(false);
  const [notes, setNotes] = useState('');
  const [avatar, setAvatar] = useState('');

  // Call form
  const [callDuration, setCallDuration] = useState(15);
  const [callType, setCallType] = useState('Outgoing');
  const [callPurpose, setCallPurpose] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const fetchOrbit = async () => {
    try {
      let query = '';
      if (categoryFilter !== 'All') query += `category=${categoryFilter}&`;
      if (search) query += `search=${encodeURIComponent(search)}&`;

      const res = await api.get(`/orbit?${query}`);
      if (res.success) {
        setContacts(res.data.contacts);
        setCalls(res.data.calls);
        setStats(res.data.stats);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrbit();
  }, [categoryFilter, search]);

  const handleCreateContact = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.post('/orbit/contacts', {
        name,
        phone,
        email,
        organization,
        jobTitle,
        category,
        isImportant,
        notes,
        avatar,
      });
      showToast('Contact saved to Orbit registry', 'success');
      setIsContactModalOpen(false);
      setName('');
      setPhone('');
      setEmail('');
      setOrganization('');
      fetchOrbit();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLogCall = async (e) => {
    e.preventDefault();
    if (!selectedContactForCall) return;
    try {
      await api.post('/orbit/calls', {
        contactId: selectedContactForCall._id,
        durationMinutes: Number(callDuration),
        type: callType,
        purpose: callPurpose,
        notes: callNotes,
        followUpDate: followUpDate || null,
      });
      showToast('Call logged successfully', 'success');
      setIsCallModalOpen(false);
      setCallPurpose('');
      setCallNotes('');
      setFollowUpDate('');
      fetchOrbit();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleImportant = async (contact) => {
    try {
      await api.put(`/orbit/contacts/${contact._id}`, {
        isImportant: !contact.isImportant,
      });
      fetchOrbit();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!confirm('Delete this contact and all their call records?')) return;
    try {
      await api.delete(`/orbit/contacts/${id}`);
      showToast('Contact removed', 'success');
      fetchOrbit();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCompleteFollowUp = async (callId) => {
    try {
      await api.put(`/orbit/calls/${callId}`, { followUpStatus: 'Completed' });
      showToast('Follow-up marked as completed!', 'success');
      fetchOrbit();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">ORBIT</h1>
              <span className="text-xs bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-semibold">
                Connections & Calls
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Personal CRM & manual communication management to cultivate relationships and follow-ups.
            </p>
          </div>
          <Button onClick={() => setIsContactModalOpen(true)} icon={Plus}>
            Add Contact
          </Button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Contacts"
            value={stats.totalContacts ?? 0}
            subtitle="Registered network"
            icon={Users2}
            color="#10B981"
          />
          <StatCard
            title="Calls Recorded"
            value={stats.totalCalls ?? 0}
            subtitle="Communication logs"
            icon={PhoneCall}
            color="#4F9B72"
          />
          <StatCard
            title="Pending Follow-ups"
            value={stats.upcomingFollowUps ?? 0}
            subtitle="Scheduled touchpoints"
            icon={Calendar}
            color="#D6A24A"
          />
        </div>

        {/* Section View Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('contacts')}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeView === 'contacts'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Contacts Registry ({contacts.length})
            </button>
            <button
              onClick={() => setActiveView('calls')}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeView === 'calls'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Call Manager ({calls.length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, organization..."
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white w-full sm:w-64"
            />
          </div>
        </div>

        {/* VIEW 1: CONTACTS REGISTRY */}
        {activeView === 'contacts' && (
          <div className="space-y-4">
            {/* Category filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['All', 'Professional', 'Client', 'VIP', 'Personal', 'Family'].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    categoryFilter === c
                      ? 'bg-[#252923] text-white'
                      : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {contacts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts.map((contact) => (
                  <Card key={contact._id} hover className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#E5E1D5] overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center font-bold text-slate-900">
                            {contact.avatar ? (
                              <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{contact.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-base text-slate-900">{contact.name}</h4>
                              <button
                                onClick={() => handleToggleImportant(contact)}
                                className={`p-0.5 rounded transition-colors ${
                                  contact.isImportant ? 'text-amber-600' : 'text-[#D5CFBF] hover:text-amber-600'
                                }`}
                                title="Star contact"
                              >
                                <Star className={`w-4 h-4 ${contact.isImportant ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                            <p className="text-xs text-slate-500">
                              {contact.jobTitle ? `${contact.jobTitle} • ` : ''}
                              {contact.organization || contact.category}
                            </p>
                          </div>
                        </div>

                        <Badge
                          variant={
                            contact.category === 'VIP'
                              ? 'warning'
                              : contact.category === 'Client'
                              ? 'sage'
                              : 'default'
                          }
                          size="sm"
                        >
                          {contact.category}
                        </Badge>
                      </div>

                      {/* Contact Channels */}
                      <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                        {contact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <a href={`tel:${contact.phone}`} className="hover:text-slate-900">
                              {contact.phone}
                            </a>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-emerald-600" />
                            <a href={`mailto:${contact.email}`} className="hover:text-slate-900 truncate">
                              {contact.email}
                            </a>
                          </div>
                        )}
                        {contact.lastContactedDate && (
                          <p className="text-[11px] text-slate-500 pt-1">
                            Last Contacted: {formatDate(contact.lastContactedDate)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                      <Button
                        onClick={() => {
                          setSelectedContactForCall(contact);
                          setIsCallModalOpen(true);
                        }}
                        size="sm"
                        variant="secondary"
                        icon={PhoneCall}
                      >
                        Log Call
                      </Button>
                      <button
                        onClick={() => handleDeleteContact(contact._id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete Contact"
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
                title="No contacts found"
                description="Add colleagues, VIP advisors, or clients to your Orbit rolodex."
                actionLabel="Add Contact"
                onAction={() => setIsContactModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* VIEW 2: CALL MANAGER */}
        {activeView === 'calls' && (
          <Card className="p-0 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
              <div>
                <h3 className="font-semibold text-base text-slate-900">Call History & Follow-ups</h3>
                <p className="text-xs text-slate-500">
                  Manual record of client calls, investor conversations, and follow-up deadlines.
                </p>
              </div>
            </div>

            {calls.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {calls.map((call) => (
                  <div key={call._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm sm:text-base text-slate-900">
                            {call.contact?.name || 'Contact'}
                          </h4>
                          <Badge variant={call.type === 'Incoming' ? 'sage' : 'default'} size="sm">
                            {call.type} • {call.durationMinutes} min
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-900 font-medium mt-0.5">Purpose: {call.purpose}</p>
                        {call.notes && <p className="text-xs text-slate-500 mt-0.5">{call.notes}</p>}
                        <span className="text-[11px] text-slate-500 block mt-1">
                          Called on {formatDate(call.date)}
                        </span>
                      </div>
                    </div>

                    {/* Follow-up info & button */}
                    {call.followUpDate && (
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right text-xs">
                          <span className="text-slate-500 block">Follow-up Due:</span>
                          <span className="font-semibold text-slate-900">{formatDate(call.followUpDate)}</span>
                        </div>
                        {call.followUpStatus === 'Pending' ? (
                          <Button onClick={() => handleCompleteFollowUp(call._id)} size="sm">
                            Mark Done
                          </Button>
                        ) : (
                          <Badge variant="success" size="sm">Followed up</Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={PhoneCall}
                title="No calls recorded"
                description="Click 'Log Call' on any contact in Orbit to track touchpoints."
              />
            )}
          </Card>
        )}

        {/* Modal: Add Contact */}
        <Modal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          title="Add New Contact to Orbit"
        >
          <form onSubmit={handleCreateContact} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Organization</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Company name"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="Professional">Professional</option>
                  <option value="Client">Client</option>
                  <option value="VIP">VIP</option>
                  <option value="Personal">Personal</option>
                  <option value="Family">Family</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Personal / Business Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key context, shared interests, deal status..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsContactModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Contact</Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Log Call */}
        <Modal
          isOpen={isCallModalOpen}
          onClose={() => setIsCallModalOpen(false)}
          title={`Log Call: ${selectedContactForCall?.name || 'Contact'}`}
        >
          <form onSubmit={handleLogCall} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Call Type</label>
                <select
                  value={callType}
                  onChange={(e) => setCallType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="Outgoing">Outgoing</option>
                  <option value="Incoming">Incoming</option>
                  <option value="Missed">Missed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={callDuration}
                  onChange={(e) => setCallDuration(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Call Purpose *</label>
              <input
                type="text"
                required
                value={callPurpose}
                onChange={(e) => setCallPurpose(e.target.value)}
                placeholder="e.g. Q3 Partnership Sync or Retainer Review"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Discussion Notes</label>
              <textarea
                rows={2}
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Action items agreed upon..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Schedule Follow-up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsCallModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Call Record</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

