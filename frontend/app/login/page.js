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
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('demo@personaltracker.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-[#EDEFF2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Logo */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-full bg-[#111315] text-[#D4F648] font-bold text-xl flex items-center justify-center mx-auto shadow-sm mb-3">
            ✦
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111315]">Personal Tracker</h1>
          <p className="text-xs text-[#686E77] mt-1">Sign in to your centralized operating system</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[32px] border border-[#E5E8ED] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#686E77] absolute left-4 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10.5 pr-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#686E77] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#686E77] absolute left-4 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10.5 pr-4 py-2.5 text-sm rounded-2xl border border-[#E5E8ED] focus:outline-none focus:border-[#111315] bg-[#F7F8FA]"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} variant="primary" className="w-full mt-3" size="lg">
              Sign In to Dashboard
            </Button>
          </form>

          {/* Demo account hint */}
          <div className="mt-6 p-3.5 rounded-2xl bg-[#F7F8FA] border border-[#E5E8ED] text-xs text-[#686E77] text-center">
            <span className="font-bold text-[#111315] block">Preloaded Demo Account:</span>
            <span className="font-medium">demo@personaltracker.com • password123</span>
          </div>

          <p className="text-center text-xs text-[#686E77] mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-[#111315] hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
