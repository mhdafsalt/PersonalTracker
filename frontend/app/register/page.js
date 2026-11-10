'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { User, Lock, Mail } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      showToast('Registration successful! Welcome to Personal Tracker', 'success');
      router.push('/');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#6B8F71] text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md mb-3">
            P
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#252923]">Join Personal Tracker</h1>
          <p className="text-xs text-[#777D75] mt-1">Start organizing your personal and professional life</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-3xl border border-[#E9E8E1] p-6 sm:p-8 shadow-medium">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#777D75] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#777D75] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-[#FAF8F5]/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#777D75] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#777D75] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-[#FAF8F5]/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#777D75] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777D75] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#E9E8E1] focus:outline-none focus:border-[#6B8F71] bg-[#FAF8F5]/50"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-xs text-[#777D75] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#6B8F71] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

