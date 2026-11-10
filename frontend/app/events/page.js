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
      showToast('Attendee registered', 'success');
      setIsParticipantModalOpen(false);
      setPName('');
      setPEmail('');
      fetchEvents();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Delete this event record?')) return;
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
      <div className="space-y-6 sm:space-y-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">Conferences & Masterclasses</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight">Programs & Events</h1>
            <p className="text-xs sm:text-sm text-[#686E77] mt-1">
              Host workshops, manage speaker schedules, and track attendee rosters.
            </p>
          </div>
          <Button onClick={() => setIsEventModalOpen(true)} variant="primary" icon={Plus}>
            Create Event
          </Button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Events"
            value={stats.totalEvents ?? 0}
            subtitle="Conducted & planned"
            icon={Ticket}
            trend="12"
          />
          <StatCard
            title="Upcoming"
            value={stats.upcomingCount ?? 0}
            subtitle="Scheduled ahead"
            icon={Calendar}
            trend="04"
          />
          <StatCard
            title="Total Participants"
            value={stats.totalParticipants ?? 0}
            subtitle="Registered attendees"
            icon={Users2}
            trend="28"
          />
          <StatCard
            title="Completed"
            value={stats.completedCount ?? 0}
            subtitle="Concluded programs"
            icon={CheckCircle2}
            trend="10"
          />
        </div>

        {/* Events Grid */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((ev) => (
              <Card key={ev._id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="lime" size="xs">{ev.category}</Badge>
                        <Badge variant="default" size="xs">{ev.status}</Badge>
                      </div>
                      <h3 className="font-extrabold text-lg text-[#111315] mt-2.5">{ev.title}</h3>
                      {ev.description && (
                        <p className="text-xs text-[#686E77] mt-1">{ev.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(ev._id)}
                      className="w-8 h-8 rounded-full hover:bg-[#FF5722]/10 flex items-center justify-center text-[#686E77] hover:text-[#FF5722] transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Dates & Location */}
                  <div className="mt-5 p-4 rounded-2xl bg-[#F7F8FA] border border-[#E5E8ED] space-y-2 text-xs text-[#686E77]">
                    <div className="flex items-center gap-2 text-[#111315] font-bold">
                      <Calendar className="w-3.5 h-3.5 text-[#111315]" />
                      <span>{formatDate(ev.startDate)} - {formatDate(ev.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#111315]" />
                      <span>{ev.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-[#111315]" />
                      <span>Budget: {formatCurrency(ev.budget, currency)}</span>
                    </div>
                  </div>

                  {/* Schedule items */}
                  {ev.schedule && ev.schedule.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                      <span className="text-[10px] font-bold text-[#686E77] uppercase tracking-wider block">
                        Schedule
                      </span>
                      {ev.schedule.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs p-2 rounded-xl bg-[#F7F8FA] border border-[#E5E8ED]">
                          <span className="font-semibold text-[#111315]">{item.title}</span>
                          <span className="text-[#111315] font-extrabold">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Participants Count */}
                  <div className="mt-5 flex items-center justify-between text-xs pt-3.5 border-t border-[#E5E8ED]">
                    <span className="text-[#686E77] flex items-center gap-1.5 font-semibold">
                      <Users2 className="w-3.5 h-3.5 text-[#111315]" />
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Event Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Full-Stack SaaS Architecture Masterclass"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
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
                  <option value="Workshop">Workshop</option>
                  <option value="Conference">Conference</option>
                  <option value="Webinar">Webinar</option>
                  <option value="Meetup">Meetup</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Online / Zoom or Bangalore"
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Start Date *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">End Date *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Budget ({currency})</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Overview, syllabus, agenda..."
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsEventModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">Publish Event</Button>
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Attendee Name *</label>
              <input
                type="text"
                required
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                placeholder="Full name"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Email</label>
                <input
                  type="email"
                  value={pEmail}
                  onChange={(e) => setPEmail(e.target.value)}
                  placeholder="attendee@example.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Role</label>
                <select
                  value={pRole}
                  onChange={(e) => setPRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] bg-white"
                >
                  <option value="Attendee">Attendee</option>
                  <option value="Speaker">Speaker</option>
                  <option value="Organizer">Organizer</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsParticipantModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">Confirm Registration</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
