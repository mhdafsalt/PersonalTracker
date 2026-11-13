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
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/format';
import {
  Ticket,
  Calendar,
  Users2,
  MapPin,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

export default function EventsPortalPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Event form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Workshop');
  const [location, setLocation] = useState('Online');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(25000);

  // Participant form
  const [pName, setPName] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pRole, setPRole] = useState('Attendee');

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      if (res.success) {
        setEvents(res.data.events);
        setStats(res.data.stats);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) return;
    try {
      await api.post('/events', {
        title,
        description,
        category,
        location,
        startDate,
        endDate,
        budget: Number(budget),
      });
      showToast('Event created successfully', 'success');
      setIsEventModalOpen(false);
      setTitle('');
      setDescription('');
      fetchEvents();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !pName.trim()) return;
    try {
      await api.post(`/events/${selectedEvent._id}/participants`, {
        name: pName,
        email: pEmail,
        role: pRole,
      });
      showToast('Participant registered', 'success');
      setIsParticipantModalOpen(false);
      setPName('');
      setPEmail('');
      fetchEvents();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      showToast('Event deleted', 'success');
      fetchEvents();
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
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Programs & Events Portal</h1>
            <p className="text-sm text-slate-500 mt-1">
              Host workshops, webinars, hackathons, and community meetups with participant registers.
            </p>
          </div>
          <Button onClick={() => setIsEventModalOpen(true)} icon={Plus}>
            Create Program / Event
          </Button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Events"
            value={stats.totalEvents ?? 0}
            subtitle="Programs organized"
            icon={Ticket}
            color="#10B981"
          />
          <StatCard
            title="Upcoming"
            value={stats.upcomingCount ?? 0}
            subtitle="Scheduled ahead"
            icon={Calendar}
            color="#D6A24A"
          />
          <StatCard
            title="Total Participants"
            value={stats.totalParticipants ?? 0}
            subtitle="Registered attendees"
            icon={Users2}
            color="#4F9B72"
          />
          <StatCard
            title="Completed"
            value={stats.completedCount ?? 0}
            subtitle="Concluded programs"
            icon={CheckCircle2}
            color="#10B981"
          />
        </div>

        {/* Events Grid */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((ev) => (
              <Card key={ev._id} hover className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="sage" size="sm">{ev.category}</Badge>
                        <Badge variant="default" size="sm">{ev.status}</Badge>
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 mt-2">{ev.title}</h3>
                      {ev.description && (
                        <p className="text-xs text-slate-500 mt-1">{ev.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(ev._id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Dates & Location */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2 text-slate-900 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{formatDate(ev.startDate)} - {formatDate(ev.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{ev.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Budget: {formatCurrency(ev.budget, currency)}</span>
                    </div>
                  </div>

                  {/* Schedule items */}
                  {ev.schedule && ev.schedule.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Schedule
                      </span>
                      {ev.schedule.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs p-1.5 rounded-lg bg-slate-50/80 border border-slate-200">
                          <span className="font-medium text-slate-900">{item.title}</span>
                          <span className="text-emerald-600 font-semibold">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Participants Count */}
                  <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-200">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <Users2 className="w-3.5 h-3.5 text-emerald-600" />
                      {ev.participants ? ev.participants.length : 0} Attendees Registered
                    </span>
                    <Button
                      onClick={() => {
                        setSelectedEvent(ev);
                        setIsParticipantModalOpen(true);
                      }}
                      size="sm"
                      variant="secondary"
                    >
                      + Add Attendee
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Ticket}
            title="No events found"
            description="Create your first program, hackathon, or training workshop."
            actionLabel="Create Event"
            onAction={() => setIsEventModalOpen(true)}
          />
        )}

        {/* Modal: Create Event */}
        <Modal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          title="Create New Event / Program"
        >
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Full-Stack SaaS Architecture Masterclass"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="Workshop">Workshop</option>
                  <option value="Conference">Conference</option>
                  <option value="Webinar">Webinar</option>
                  <option value="Meetup">Meetup</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Online / Zoom or Bangalore"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Budget ({currency})</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Overview, syllabus, agenda..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsEventModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Publish Event</Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Add Participant */}
        <Modal
          isOpen={isParticipantModalOpen}
          onClose={() => setIsParticipantModalOpen(false)}
          title={`Register Attendee: ${selectedEvent?.title || 'Event'}`}
        >
          <form onSubmit={handleAddParticipant} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Attendee Name *</label>
              <input
                type="text"
                required
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                placeholder="Full name"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  value={pEmail}
                  onChange={(e) => setPEmail(e.target.value)}
                  placeholder="attendee@example.com"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                <select
                  value={pRole}
                  onChange={(e) => setPRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="Attendee">Attendee</option>
                  <option value="Speaker">Speaker</option>
                  <option value="Organizer">Organizer</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsParticipantModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Confirm Registration</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

