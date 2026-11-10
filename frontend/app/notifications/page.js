'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Clock,
  Compass,
  PhoneCall,
  Check,
  AlertTriangle,
} from 'lucide-react';

export default function NotificationsPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      fetchNotifications();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all', {});
      showToast('All notifications marked as read', 'success');
      fetchNotifications();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteNotif = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredNotifs = filter === 'Unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Automated reminders for pending tasks, habit streaks, upcoming trips, and client calls.
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllRead} variant="secondary" size="sm" icon={Check}>
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {['All', 'Unread'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {f === 'Unread' ? `Unread (${unreadCount})` : 'All Notifications'}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <Card className="p-0 overflow-hidden">
          {filteredNotifs.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {filteredNotifs.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                    !n.isRead ? 'bg-slate-50/80' : 'hover:bg-slate-50/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        n.type === 'task'
                          ? 'bg-rose-500/15 text-rose-600'
                          : n.type === 'trip'
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : n.type === 'call'
                          ? 'bg-amber-500/15 text-amber-600'
                          : 'bg-emerald-600/15 text-emerald-600'
                      }`}
                    >
                      {n.type === 'task' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : n.type === 'trip' ? (
                        <Compass className="w-4 h-4" />
                      ) : n.type === 'call' ? (
                        <PhoneCall className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm sm:text-base font-semibold ${!n.isRead ? 'text-slate-900' : 'text-slate-500'}`}>
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-slate-500">{formatDate(n.createdAt)}</span>
                        {n.link && (
                          <Link href={n.link} className="text-emerald-600 font-medium hover:underline">
                            View details →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(n._id)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg transition-colors"
                        title="Mark as Read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotif(n._id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="You're completely up to date. You will be alerted when deadlines or reminders approach."
            />
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

