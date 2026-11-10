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
  Compass,
  MapPin,
  Calendar,
  CheckSquare,
  Wallet,
  Plus,
  Trash2,
  Heart,
  Luggage,
} from 'lucide-react';

export default function TravelPlannerPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  // Modals
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Trip form
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(30000);
  const [isWishlist, setIsWishlist] = useState(false);

  // Trip Expense form
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Stay');

  const fetchTrips = async () => {
    try {
      const res = await api.get('/travel');
      if (res.success) {
        setTrips(res.data.trips);
        setStats(res.data.stats);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim() || !startDate || !endDate) return;
    try {
      await api.post('/travel', {
        title,
        destination,
        description,
        coverImage,
        startDate,
        endDate,
        budget: Number(budget),
        status: isWishlist ? 'Planning' : 'Upcoming',
      });
      showToast('Trip itinerary scheduled!', 'success');
      setIsTripModalOpen(false);
      setTitle('');
      setDestination('');
      setDescription('');
      setCoverImage('');
      fetchTrips();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!selectedTrip || !expenseTitle.trim() || !expenseAmount) return;
    try {
      await api.post(`/travel/${selectedTrip._id}/expenses`, {
        title: expenseTitle,
        amount: Number(expenseAmount),
        category: expenseCategory,
      });
      showToast('Expense recorded', 'success');
      setIsExpenseModalOpen(false);
      setExpenseTitle('');
      setExpenseAmount('');
      fetchTrips();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleTogglePacking = async (tripId, itemId) => {
    try {
      await api.post(`/travel/${tripId}/packing/${itemId}/toggle`, {});
      fetchTrips();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteTrip = async (id) => {
    if (!confirm('Delete this trip plan?')) return;
    try {
      await api.delete(`/travel/${id}`);
      showToast('Trip plan deleted', 'success');
      fetchTrips();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredTrips = trips.filter((t) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Wishlist') return t.status === 'Planning';
    return t.status === activeTab;
  });

  const currency = user?.currency || 'INR';

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">Exploration & Expeditions</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight">Travel Planner</h1>
            <p className="text-xs sm:text-sm text-[#686E77] mt-1">
              Organize expeditions, packing checklists, itineraries, and vacation budgets.
            </p>
          </div>
          <Button onClick={() => setIsTripModalOpen(true)} variant="primary" icon={Plus}>
            Plan New Trip
          </Button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Trips"
            value={stats.totalTrips ?? 0}
            subtitle="Lifetime adventures"
            icon={Compass}
            trend="12"
          />
          <StatCard
            title="Upcoming Trips"
            value={stats.upcomingCount ?? 0}
            subtitle="Scheduled getaways"
            icon={Luggage}
            trend="04"
          />
          <StatCard
            title="Wishlist"
            value={stats.wishlistCount ?? 0}
            subtitle="Dream destinations"
            icon={Heart}
            trend="08"
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(stats.totalExpense ?? 0, currency)}
            subtitle="Trip outlays recorded"
            icon={Wallet}
            trend="15"
          />
        </div>

        {/* Tab Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F0F2F5] rounded-full max-w-fit overflow-x-auto scrollbar-none">
          {['All', 'Upcoming', 'Planning', 'Completed', 'Wishlist'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-[#111315] text-white shadow-xs'
                  : 'text-[#686E77] hover:text-[#111315]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Trips Grid */}
        {filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => {
              const tripExpensesTotal = (trip.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
              const packedCount = (trip.packingList || []).filter((p) => p.packed).length;
              const totalPacking = (trip.packingList || []).length;

              return (
                <Card key={trip._id} className="flex flex-col justify-between overflow-hidden p-0">
                  <div>
                    {/* Cover image or fallback */}
                    <div className="h-44 w-full relative bg-[#F0F2F5] overflow-hidden">
                      {trip.coverImage ? (
                        <img
                          src={trip.coverImage}
                          alt={trip.destination}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#686E77] bg-[#F7F8FA]">
                          <Compass className="w-8 h-8 text-[#111315]" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex gap-1">
                        <Badge variant="lime" size="xs" className="shadow-xs">
                          {trip.status}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-[#111315]/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#D4F648]" /> {trip.destination}
                      </div>
                    </div>

                    <div className="p-5 space-y-3.5">
                      <div>
                        <h3 className="font-extrabold text-lg text-[#111315]">{trip.title}</h3>
                        {trip.description && (
                          <p className="text-xs text-[#686E77] mt-1">{trip.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#686E77]">
                        <Calendar className="w-3.5 h-3.5 text-[#111315]" />
                        <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                      </div>

                      {/* Budget & Spend */}
                      <div className="p-3.5 rounded-2xl bg-[#F7F8FA] border border-[#E5E8ED] space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#686E77] font-medium">Budget:</span>
                          <span className="font-extrabold text-[#111315]">{formatCurrency(trip.budget, currency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#686E77] font-medium">Expenses Logged:</span>
                          <span className="font-bold text-[#FF5722]">{formatCurrency(tripExpensesTotal, currency)}</span>
                        </div>
                      </div>

                      {/* Packing Checklist Preview */}
                      {trip.packingList && trip.packingList.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-[#686E77]">Packing List</span>
                            <span className="text-[#111315]">{packedCount}/{totalPacking} Packed</span>
                          </div>
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {trip.packingList.map((item) => (
                              <div
                                key={item._id}
                                onClick={() => handleTogglePacking(trip._id, item._id)}
                                className="flex items-center gap-2 text-xs cursor-pointer p-1 rounded-lg hover:bg-[#F7F8FA]"
                              >
                                <input
                                  type="checkbox"
                                  checked={item.packed}
                                  readOnly
                                  className="rounded text-[#111315] focus:ring-0 cursor-pointer w-3.5 h-3.5"
                                />
                                <span className={item.packed ? 'line-through text-[#686E77]' : 'text-[#111315] font-medium'}>
                                  {item.item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border-t border-[#E5E8ED] bg-[#F7F8FA] flex items-center justify-between">
                    <Button
                      onClick={() => {
                        setSelectedTrip(trip);
                        setIsExpenseModalOpen(true);
                      }}
                      size="sm"
                      variant="secondary"
                    >
                      + Add Expense
                    </Button>
                    <button
                      onClick={() => handleDeleteTrip(trip._id)}
                      className="w-8 h-8 rounded-full hover:bg-[#FF5722]/10 flex items-center justify-center text-[#686E77] hover:text-[#FF5722] transition-colors"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Compass}
            title="No trips found"
            description="Start planning your next getaway, hiking expedition, or workation."
            actionLabel="Plan a Trip"
            onAction={() => setIsTripModalOpen(true)}
          />
        )}

        {/* Modal: Plan Trip */}
        <Modal
          isOpen={isTripModalOpen}
          onClose={() => setIsTripModalOpen(false)}
          title="Plan New Trip"
        >
          <form onSubmit={handleCreateTrip} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Destination *</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Manali, Himachal Pradesh or Tokyo, Japan"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Trip Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Autumn Retreat & Highland Trails"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Start Date *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">End Date *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Budget ({currency})</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Cover Image URL</label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Notes & Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Hotel booking details, flights, and activities..."
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsTripModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">Create Trip Plan</Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Add Trip Expense */}
        <Modal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          title={`Add Expense to ${selectedTrip?.destination || 'Trip'}`}
        >
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Expense Title *</label>
              <input
                type="text"
                required
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                placeholder="e.g. Hotel Deposit or Train Tickets"
                className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Amount ({currency}) *</label>
                <input
                  type="number"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-white"
                >
                  <option value="Stay">Stay & Lodging</option>
                  <option value="Transport">Transport & Flights</option>
                  <option value="Food">Food & Dining</option>
                  <option value="Activities">Activities & Tours</option>
                  <option value="Shopping">Shopping & Misc</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E5E8ED]">
              <Button type="button" variant="secondary" onClick={() => setIsExpenseModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">Save Expense</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
