'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Sparkles, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('demo@personaltracker.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back!', 'success');
      router.push('/');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md mb-3">
            P
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Personal Tracker</h1>
          <p className="text-xs text-slate-500 mt-1">Sign in to your centralized operating system</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-medium">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50/50"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Sign In to Dashboard
            </Button>
          </form>

          {/* Demo account hint */}
          <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
            <span className="font-semibold text-slate-900 block">Preloaded Demo Account:</span>
            <span>demo@personaltracker.com • password123</span>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-emerald-600 hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

