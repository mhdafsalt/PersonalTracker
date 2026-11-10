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
  const [isPackingModalOpen, setIsPackingModalOpen] = useState(false);
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

  // Packing item form
  const [packingItem, setPackingItem] = useState('');

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
        isWishlist,
      });
      showToast('Trip added to planner!', 'success');
      setIsTripModalOpen(false);
      setTitle('');
      setDestination('');
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
      showToast('Trip expense logged!', 'success');
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
      await api.put(`/travel/${tripId}/packing/${itemId}`, {});
      fetchTrips();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteTrip = async (id) => {
    if (!confirm('Delete this trip?')) return;
    try {
      await api.delete(`/travel/${id}`);
      showToast('Trip deleted', 'success');
      fetchTrips();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const currency = user?.currency || 'INR';
  const filteredTrips =
    activeTab === 'All'
      ? trips
      : activeTab === 'Wishlist'
      ? trips.filter((t) => t.isWishlist)
      : trips.filter((t) => t.status === activeTab);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Travel Planner</h1>
            <p className="text-sm text-slate-500 mt-1">
              Organize expeditions, packing checklists, itineraries, and vacation budgets.
            </p>
          </div>
          <Button onClick={() => setIsTripModalOpen(true)} icon={Plus}>
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
            color="#10B981"
          />
          <StatCard
            title="Upcoming Trips"
            value={stats.upcomingCount ?? 0}
            subtitle="Scheduled getaways"
            icon={Luggage}
            color="#4F9B72"
          />
          <StatCard
            title="Wishlist"
            value={stats.wishlistCount ?? 0}
            subtitle="Dream destinations"
            icon={Heart}
            color="#D6A24A"
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(stats.totalExpense ?? 0, currency)}
            subtitle="Trip outlays recorded"
            icon={Wallet}
            color="#10B981"
          />
        </div>

        {/* Tab Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['All', 'Upcoming', 'Planning', 'Completed', 'Wishlist'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
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
                <Card key={trip._id} hover className="flex flex-col justify-between overflow-hidden p-0">
                  <div>
                    {/* Cover image or fallback */}
                    <div className="h-44 w-full relative bg-slate-50 overflow-hidden">
                      {trip.coverImage ? (
                        <img
                          src={trip.coverImage}
                          alt={trip.destination}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-[#EFECE4]">
                          <Compass className="w-8 h-8 text-emerald-600" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex gap-1">
                        <Badge variant="sage" size="sm" className="backdrop-blur-md bg-white/90">
                          {trip.status}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white text-xs font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {trip.destination}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{trip.title}</h3>
                        {trip.description && (
                          <p className="text-xs text-slate-500 mt-1">{trip.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                      </div>

                      {/* Budget & Spend */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Budget:</span>
                          <span className="font-semibold text-slate-900">{formatCurrency(trip.budget, currency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Expenses Logged:</span>
                          <span className="font-semibold text-rose-600">{formatCurrency(tripExpensesTotal, currency)}</span>
                        </div>
                      </div>

                      {/* Packing Checklist Preview */}
                      {trip.packingList && trip.packingList.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-500">Packing List</span>
                            <span className="text-emerald-600">{packedCount}/{totalPacking} Packed</span>
                          </div>
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {trip.packingList.map((item) => (
                              <div
                                key={item._id}
                                onClick={() => handleTogglePacking(trip._id, item._id)}
                                className="flex items-center gap-2 text-xs cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={item.packed}
                                  readOnly
                                  className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                                />
                                <span className={item.packed ? 'line-through text-slate-500' : 'text-slate-900'}>
                                  {item.item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
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
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4 h-4" />
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
              <label className="block text-xs font-medium text-slate-500 mb-1">Destination *</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Manali, Himachal Pradesh or Tokyo, Japan"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Trip Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Autumn Retreat & Highland Trails"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
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

            <div className="grid grid-cols-2 gap-3">
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
                <label className="block text-xs font-medium text-slate-500 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Notes & Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Hotel booking details, flights, and activities..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsTripModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Trip Plan</Button>
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
              <label className="block text-xs font-medium text-slate-500 mb-1">Expense Title *</label>
              <input
                type="text"
                required
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                placeholder="e.g. Hotel Deposit or Train Tickets"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Amount ({currency}) *</label>
                <input
                  type="number"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="₹ 5000"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="Stay">Stay & Lodging</option>
                  <option value="Transport">Transport & Flights</option>
                  <option value="Food">Food & Dining</option>
                  <option value="Activities">Activities & Tours</option>
                  <option value="Shopping">Shopping & Misc</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsExpenseModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Expense</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

