'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Download,
  DollarSign,
  Bell,
  Shield,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  // Profile Form
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Preferences
  const [habitReminders, setHabitReminders] = useState(true);
  const [taskDueAlerts, setTaskDueAlerts] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
      setCurrency(user.currency || 'INR');
      if (user.preferences) {
        setHabitReminders(user.preferences.habitReminders !== false);
        setTaskDueAlerts(user.preferences.taskDueAlerts !== false);
      }
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      await updateProfile({
        name,
        bio,
        avatar,
        currency,
        preferences: {
          habitReminders,
          taskDueAlerts,
        },
      });
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setLoadingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      showToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await api.get('/dashboard');
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `personal_tracker_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Personal data exported as JSON backup', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Settings & Preferences</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal profile, preferred currency, security credentials, and data backups.
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
            <User className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-base text-slate-900">Personal Profile</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#E5E1D5] overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center font-bold text-lg text-slate-900">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{name.charAt(0) || 'U'}</span>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Bio / Headline</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer & Creative Director"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Default Currency Symbol</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white font-medium"
              >
                <option value="INR">INR — Indian Rupee (₹)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="GBP">GBP — British Pound (£)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" loading={loadingProfile}>
                Save Profile
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Card */}
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
            <Lock className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-base text-slate-900">Security & Password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" loading={loadingPassword} variant="secondary">
                Update Password
              </Button>
            </div>
          </form>
        </Card>

        {/* Data Backup & Export Card */}
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
            <Download className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-base text-slate-900">Data Ownership & Export</h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Export Personal Records</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Download a complete JSON snapshot of your habits, transactions, tasks, and creative projects.
              </p>
            </div>
            <Button onClick={handleExportData} variant="outline" icon={Download} size="sm">
              Export Backup
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

