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
      showToast('Contact added to Orbit', 'success');
      setIsContactModalOpen(false);
      setName('');
      setPhone('');
      setEmail('');
      setOrganization('');
      setJobTitle('');
      fetchOrbit();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLogCall = async (e) => {
    e.preventDefault();
    if (!selectedContactForCall || !callPurpose.trim()) return;
    try {
      await api.post('/orbit/calls', {
        contact: selectedContactForCall._id,
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
      await api.put(`/orbit/contacts/${contact._id}`, { isImportant: !contact.isImportant });
      fetchOrbit();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!confirm('Delete this contact?')) return;
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
      <div className="space-y-6 sm:space-y-7">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">Connections & Calls</span>
              <span className="text-[10px] bg-[#D4F648] text-[#111315] px-2.5 py-0.5 rounded-full font-extrabold shadow-xs">
                CRM
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight mt-0.5">ORBIT</h1>
            <p className="text-xs sm:text-sm text-[#686E77] mt-1">
              Personal communication management to cultivate relationships and track key follow-ups.
            </p>
          </div>
          <Button onClick={() => setIsContactModalOpen(true)} variant="primary" icon={Plus}>
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
            trend="18"
          />
          <StatCard
            title="Calls Recorded"
            value={stats.totalCalls ?? 0}
            subtitle="Communication logs"
            icon={PhoneCall}
            trend="24"
          />
          <StatCard
            title="Pending Follow-ups"
            value={stats.upcomingFollowUps ?? 0}
            subtitle="Scheduled touchpoints"
            icon={Calendar}
            trend="06"
          />
        </div>

        {/* Section View Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex p-1 bg-[#F0F2F5] rounded-full max-w-fit">
            <button
              onClick={() => setActiveView('contacts')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeView === 'contacts'
                  ? 'bg-[#111315] text-white shadow-xs'
                  : 'text-[#686E77] hover:text-[#111315]'
              }`}
            >
              Contacts ({contacts.length})
            </button>
            <button
              onClick={() => setActiveView('calls')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeView === 'calls'
                  ? 'bg-[#111315] text-white shadow-xs'
                  : 'text-[#686E77] hover:text-[#111315]'
              }`}
            >
              Call Manager ({calls.length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#686E77] absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, organization..."
              className="pl-9.5 pr-4 py-2 text-xs rounded-full border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white w-full sm:w-64 shadow-xs"
            />
          </div>
        </div>

        {/* VIEW 1: CONTACTS REGISTRY */}
        {activeView === 'contacts' && (
          <div className="space-y-4">
            {/* Category filter pills */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F0F2F5] rounded-full max-w-fit overflow-x-auto scrollbar-none">
              {['All', 'Professional', 'Client', 'VIP', 'Personal', 'Family'].map((c) => (
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

            {contacts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {contacts.map((contact) => (
                  <Card key={contact._id} className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#111315] text-[#D4F648] border border-[#E5E8ED] shrink-0 flex items-center justify-center font-extrabold text-sm overflow-hidden">
                            {contact.avatar ? (
                              <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{contact.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-extrabold text-base text-[#111315]">{contact.name}</h4>
                              <button
                                onClick={() => handleToggleImportant(contact)}
                                className={`p-0.5 rounded transition-colors ${
                                  contact.isImportant ? 'text-[#FF5722]' : 'text-[#C5CAD3] hover:text-[#FF5722]'
                                }`}
                                title="Star contact"
                              >
                                <Star className={`w-3.5 h-3.5 ${contact.isImportant ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                            <p className="text-xs text-[#686E77]">
                              {contact.jobTitle ? `${contact.jobTitle} • ` : ''}
                              {contact.organization || contact.category}
                            </p>
                          </div>
                        </div>

                        <Badge
                          variant={
                            contact.category === 'VIP'
                              ? 'lime'
                              : contact.category === 'Client'
                              ? 'dark'
                              : 'default'
                          }
                          size="xs"
                        >
                          {contact.category}
                        </Badge>
                      </div>

                      {/* Contact Channels */}
                      <div className="mt-4 space-y-1.5 text-xs text-[#686E77]">
                        {contact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-[#111315]" />
                            <a href={`tel:${contact.phone}`} className="hover:text-[#111315] font-medium">
                              {contact.phone}
                            </a>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-[#111315]" />
                            <a href={`mailto:${contact.email}`} className="hover:text-[#111315] font-medium truncate">
                              {contact.email}
                            </a>
                          </div>
                        )}
                        {contact.lastContactedDate && (
                          <p className="text-[11px] text-[#686E77] pt-1">
                            Last Contacted: {formatDate(contact.lastContactedDate)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-[#E5E8ED] flex items-center justify-between">
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
                        className="w-8 h-8 rounded-full hover:bg-[#FF5722]/10 flex items-center justify-center text-[#686E77] hover:text-[#FF5722] transition-colors"
                        title="Delete Contact"
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
            <div className="p-4 sm:p-5 border-b border-[#E5E8ED] flex items-center justify-between bg-[#F7F8FA]">
              <div>
                <h3 className="font-bold text-base text-[#111315]">Call History & Follow-ups</h3>
                <p className="text-xs text-[#686E77] mt-0.5">
                  Record of client calls, investor conversations, and follow-up deadlines.
                </p>
              </div>
            </div>

            {calls.length > 0 ? (
              <div className="divide-y divide-[#E5E8ED]">
                {calls.map((call) => (
                  <div key={call._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F7F8FA]/60 transition-colors">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#111315] text-[#D4F648] flex items-center justify-center shrink-0 mt-0.5">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm sm:text-base text-[#111315]">
                            {call.contact?.name || 'Contact'}
                          </h4>
                          <Badge variant="default" size="xs">
                            {call.type} • {call.durationMinutes} min
                          </Badge>
                        </div>
                        <p className="text-xs text-[#111315] font-semibold mt-0.5">Purpose: {call.purpose}</p>
                        {call.notes && <p className="text-xs text-[#686E77] mt-0.5">{call.notes}</p>}
                        <span className="text-[11px] text-[#686E77] block mt-1">
                          Called on {formatDate(call.date)}
                        </span>
                      </div>
                    </div>

                    {/* Follow-up info & button */}
                    {call.followUpDate && (
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right text-xs">
                          <span className="text-[#686E77] block">Follow-up Due:</span>
                          <span className="font-bold text-[#111315]">{formatDate(call.followUpDate)}</span>
                        </div>
                        {call.followUpStatus === 'Pending' ? (
                          <Button onClick={() => handleCompleteFollowUp(call._id)} size="sm" variant="primary">
                            Mark Done
                          </Button>
                        ) : (
                          <Badge variant="lime" size="xs">Followed up</Badge>
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Organization</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Company name"
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Personal / Business Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key context, shared interests, deal status..."
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsContactModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">Save Contact</Button>
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Call Type</label>
                <select
                  value={callType}
                  onChange={(e) => setCallType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                >
                  <option value="Outgoing">Outgoing</option>
                  <option value="Incoming">Incoming</option>
                  <option value="Missed">Missed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Duration (minutes)</label>
                <input
                  type="number"
                  value={callDuration}
                  onChange={(e) => setCallDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Call Purpose *</label>
              <input
                type="text"
                required
                value={callPurpose}
                onChange={(e) => setCallPurpose(e.target.value)}
                placeholder="e.g. Q3 Partnership Sync or Retainer Review"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Discussion Notes</label>
              <textarea
                rows={2}
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Action items agreed upon..."
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Schedule Follow-up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsCallModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">Save Call Record</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
