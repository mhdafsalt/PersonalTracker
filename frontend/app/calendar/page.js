'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckSquare,
  Target,
  Compass,
  Briefcase,
  Ticket,
  PhoneCall,
  GraduationCap,
} from 'lucide-react';

export default function CentralCalendarPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [selectedDayStr, setSelectedDayStr] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchCalendar = async () => {
    try {
      const res = await api.get('/calendar');
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  // Calendar month calculation
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map events to date strings (YYYY-MM-DD)
  const eventsByDate = {};
  events.forEach((ev) => {
    if (filterType !== 'All' && ev.type !== filterType) return;
    const dateKey = ev.date;
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push(ev);
  });

  const handleDayClick = (dayNum) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayEvs = eventsByDate[dStr] || [];
    setSelectedDayStr(dStr);
    setSelectedDayEvents(dayEvs);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const types = [
    { id: 'All', name: 'All' },
    { id: 'task', name: 'Tasks', color: '#10B981' },
    { id: 'habit', name: 'Habits', color: '#4F9B72' },
    { id: 'goal', name: 'Goals', color: '#D6A24A' },
    { id: 'travel', name: 'Trips', color: '#8DA382' },
    { id: 'event', name: 'Events', color: '#547359' },
    { id: 'call', name: 'Follow-ups', color: '#D96C6C' },
    { id: 'design', name: 'Design Deadlines', color: '#3B82F6' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Central Calendar</h1>
            <p className="text-sm text-slate-500 mt-1">
              Synchronized master agenda combining tasks, travel dates, deadlines, and events.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setCurrentMonth(new Date())} variant="secondary" size="sm">
              Today
            </Button>
            <div className="flex items-center bg-white rounded-xl border border-slate-200 p-0.5">
              <button
                onClick={prevMonth}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-semibold text-slate-900 min-w-[120px] text-center">
                {monthName}
              </span>
              <button
                onClick={nextMonth}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterType === t.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {t.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />}
              {t.name}
            </button>
          ))}
        </div>

        {/* Master Month Calendar Grid */}
        <Card className="p-0 overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-500 py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200">
            {/* Blank leading days */}
            {[...Array(firstDayOfMonth)].map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[90px] sm:min-h-[110px] bg-slate-50/30 p-2" />
            ))}

            {/* Days of current month */}
            {[...Array(daysInMonth)].map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = eventsByDate[dateStr] || [];
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dayNum}
                  onClick={() => handleDayClick(dayNum)}
                  className={`min-h-[90px] sm:min-h-[110px] p-2 sm:p-2.5 transition-colors cursor-pointer hover:bg-slate-50/60 flex flex-col justify-between ${
                    isToday ? 'bg-emerald-600/5 ring-1 ring-inset ring-[#6B8F71]/30' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-xs font-semibold flex items-center justify-center rounded-full w-6 h-6 ${
                        isToday ? 'bg-emerald-600 text-white' : 'text-slate-900'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-600/10 px-1.5 py-0.5 rounded-full">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event pills preview */}
                  <div className="space-y-1 mt-1.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="text-[10px] truncate px-1.5 py-0.5 rounded font-medium border"
                        style={{
                          backgroundColor: `${ev.color}15`,
                          color: ev.color,
                          borderColor: `${ev.color}30`,
                        }}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-slate-500 pl-1 font-medium block">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Modal: Selected Day Events Details */}
        <Modal
          isOpen={!!selectedDayEvents}
          onClose={() => setSelectedDayEvents(null)}
          title={`Agenda: ${formatDate(selectedDayStr)}`}
        >
          {selectedDayEvents && (
            <div className="space-y-3">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                        <h4 className="font-semibold text-sm text-slate-900">{ev.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 pl-4.5">
                        Category: <span className="capitalize">{ev.type}</span> • Status: {ev.status}
                      </p>
                    </div>
                    {ev.priority && (
                      <Badge variant={ev.priority === 'Urgent' ? 'danger' : 'default'} size="sm">
                        {ev.priority}
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No scheduled items or deadlines on this date.
                </p>
              )}
              <div className="flex justify-end pt-3 border-t border-slate-200">
                <Button onClick={() => setSelectedDayEvents(null)} variant="secondary">
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

