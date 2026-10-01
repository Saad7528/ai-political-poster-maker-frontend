'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { LogIn, UserPlus, Sparkles, Loader2, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isRegister) {
        if (!name) {
          setErrorMsg('অনুগ্রহ করে আপনার পুরো নাম প্রদান করুন।');
          setLoading(false);
          return;
        }
        const res = await api.register({ name, emailOrPhone, password });
        if (res.success && res.data) {
          login(res.data.token, res.data.user);
          router.push('/studio');
        } else {
          setErrorMsg(res.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
        }
      } else {
        const res = await api.login({ emailOrPhone, password });
        if (res.success && res.data) {
          login(res.data.token, res.data.user);
          router.push('/studio');
        } else {
          setErrorMsg(res.message || 'লগইন ব্যর্থ হয়েছে।');
        }
      }
    } catch {
      setErrorMsg('সার্ভার কানেকশন ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 font-bengali">
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 via-rose-600 to-amber-500 text-white shadow-md mb-2">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {isRegister ? 'নতুন অ্যাকাউন্ট খুলুন' : 'অ্যাকাউন্টে লগইন করুন'}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            পোস্টার তৈরি ও সেভ করতে আপনার অ্যাকাউন্টে সাইন ইন করুন
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                আপনার পুরো নাম
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: আলহাজ্ব মো: রফিকুল ইসলাম"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              ইমেইল বা ফোন নম্বর
            </label>
            <input
              type="text"
              required
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="user@example.com বা 017XXXXXXXX"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              পাসওয়ার্ড
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-rose-600 to-amber-500 hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRegister ? (
              <UserPlus className="w-4 h-4" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>{isRegister ? 'অ্যাকাউন্ট তৈরি করুন' : 'লগইন করুন'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg(null);
            }}
            className="text-xs text-emerald-600 dark:text-amber-400 hover:underline font-bold"
          >
            {isRegister
              ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন'
              : 'অ্যাকাউন্ট নেই? নতুন অ্যাকাউন্ট তৈরি করুন'}
          </button>
        </div>
      </div>
    </div>
  );
}
