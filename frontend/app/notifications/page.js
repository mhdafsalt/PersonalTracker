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
      <div className="space-y-6 sm:space-y-7">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#686E77]">Activity Alerts</span>
              {unreadCount > 0 && (
                <span className="bg-[#111315] text-[#D4F648] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                  {unreadCount} New
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111315] tracking-tight mt-0.5">Notification Center</h1>
            <p className="text-xs sm:text-sm text-[#686E77] mt-1">
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
        <div className="flex items-center gap-1.5 p-1 bg-[#F0F2F5] rounded-full max-w-fit">
          {['All', 'Unread'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-[#111315] text-white shadow-xs'
                  : 'text-[#686E77] hover:text-[#111315]'
              }`}
            >
              {f === 'Unread' ? `Unread (${unreadCount})` : 'All Notifications'}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <Card className="p-0 overflow-hidden">
          {filteredNotifs.length > 0 ? (
            <div className="divide-y divide-[#E5E8ED]">
              {filteredNotifs.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                    !n.isRead ? 'bg-[#F7F8FA]' : 'hover:bg-[#F7F8FA]/60'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#111315] text-[#D4F648] flex items-center justify-center shrink-0 mt-0.5">
                      {n.type === 'task' ? (
                        <AlertTriangle className="w-4 h-4 text-[#FF5722]" />
                      ) : n.type === 'trip' ? (
                        <Compass className="w-4 h-4 text-[#0284C7]" />
                      ) : n.type === 'call' ? (
                        <PhoneCall className="w-4 h-4 text-[#D4F648]" />
                      ) : (
                        <Bell className="w-4 h-4 text-white" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm sm:text-base font-bold ${!n.isRead ? 'text-[#111315]' : 'text-[#686E77]'}`}>
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#FF5722]" />
                        )}
                      </div>
                      <p className="text-xs text-[#686E77] mt-1 leading-relaxed">{n.message}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-[#686E77] font-medium">{formatDate(n.createdAt)}</span>
                        {n.link && (
                          <Link href={n.link} className="text-[#111315] font-bold hover:underline">
                            View details →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(n._id)}
                        className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-[#686E77] hover:text-[#111315] transition-colors"
                        title="Mark as Read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotif(n._id)}
                      className="w-8 h-8 rounded-full hover:bg-[#FF5722]/10 flex items-center justify-center text-[#686E77] hover:text-[#FF5722] transition-colors"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
