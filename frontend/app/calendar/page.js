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
    { id: 'task', name: 'Tasks', color: '#111315' },
    { id: 'habit', name: 'Habits', color: '#10B981' },
    { id: 'goal', name: 'Goals', color: '#D4F648' },
    { id: 'travel', name: 'Trips', color: '#0284C7' },
    { id: 'event', name: 'Events', color: '#8B5CF6' },
    { id: 'call', name: 'Follow-ups', color: '#FF5722' },
    { id: 'design', name: 'Design Deadlines', color: '#F59E0B' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-7">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">Schedule & Agendas</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight">Central Calendar</h1>
            <p className="text-xs sm:text-sm text-[#686E77] mt-1">
              Synchronized master agenda combining tasks, travel dates, deadlines, and events.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button onClick={() => setCurrentMonth(new Date())} variant="secondary" size="sm">
              Today
            </Button>
            <div className="flex items-center bg-white rounded-full border border-[#E5E8ED] p-1 shadow-xs">
              <button
                onClick={prevMonth}
                className="w-8 h-8 rounded-full text-[#686E77] hover:text-[#111315] hover:bg-[#F2F4F7] flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 text-xs font-bold text-[#111315] min-w-[130px] text-center">
                {monthName}
              </span>
              <button
                onClick={nextMonth}
                className="w-8 h-8 rounded-full text-[#686E77] hover:text-[#111315] hover:bg-[#F2F4F7] flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F0F2F5] rounded-full max-w-fit overflow-x-auto scrollbar-none">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterType === t.id
                  ? 'bg-[#111315] text-white shadow-xs'
                  : 'text-[#686E77] hover:text-[#111315]'
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
          <div className="grid grid-cols-7 border-b border-[#E5E8ED] bg-[#F7F8FA] text-center text-[11px] font-bold uppercase tracking-wider text-[#686E77] py-3">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#E5E8ED]">
            {/* Blank leading days */}
            {[...Array(firstDayOfMonth)].map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[90px] sm:min-h-[115px] bg-[#F7F8FA]/30 p-2" />
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
                  className={`min-h-[90px] sm:min-h-[115px] p-2.5 transition-colors cursor-pointer hover:bg-[#F7F8FA]/70 flex flex-col justify-between ${
                    isToday ? 'bg-[#D4F648]/10 ring-1 ring-inset ring-[#D4F648]' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-xs font-extrabold flex items-center justify-center rounded-full w-6 h-6 ${
                        isToday ? 'bg-[#111315] text-[#D4F648]' : 'text-[#111315]'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-[#111315] bg-[#D4F648] px-2 py-0.5 rounded-full shadow-xs">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event pills preview */}
                  <div className="space-y-1 mt-1.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="text-[10px] truncate px-2 py-0.5 rounded-full font-semibold border"
                        style={{
                          backgroundColor: `${ev.color}15`,
                          color: '#111315',
                          borderColor: `${ev.color}35`,
                        }}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-[#686E77] pl-1 font-bold block">
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
                    className="p-3.5 rounded-2xl border border-[#E5E8ED] bg-[#F7F8FA] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                        <h4 className="font-bold text-sm text-[#111315]">{ev.title}</h4>
                      </div>
                      <p className="text-xs text-[#686E77] mt-1 pl-4.5">
                        Category: <span className="capitalize font-medium text-[#111315]">{ev.type}</span> • Status: {ev.status}
                      </p>
                    </div>
                    {ev.priority && (
                      <Badge variant={ev.priority === 'Urgent' ? 'danger' : 'default'} size="xs">
                        {ev.priority}
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#686E77] py-6 text-center">
                  No scheduled items or deadlines on this date.
                </p>
              )}
              <div className="flex justify-end pt-3 border-t border-[#E5E8ED]">
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
