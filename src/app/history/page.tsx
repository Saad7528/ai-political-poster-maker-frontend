'use client';

import React, { useState, useEffect } from 'react';
import { IPoster } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { History, Trash2, Calendar, Loader2, Sparkles, Layers } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const { user, token, demoLogin } = useAuth();
  const [posters, setPosters] = useState<IPoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthRequired, setIsAuthRequired] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('poster_token') : null) || '';
      const activeUser = user || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('poster_user') || 'null') : null);

      if (!activeToken || !activeUser) {
        setIsAuthRequired(true);
        setLoading(false);
        return;
      }

      setIsAuthRequired(false);
      setLoading(true);
      try {
        const userId = activeUser?.id || activeUser?._id;
        const res = await api.getUserPosters(userId, activeToken);
        if (res.success && res.data) {
          setPosters(res.data);
        }
      } catch (err: unknown) {
        console.error('Failed to load posters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, token]);

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি সত্যিই এই পোস্টারটি মুছে ফেলতে চান?')) return;
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('poster_token') : null) || '';
      await api.deletePoster(id, activeToken);
      setPosters((prev) => prev.filter((p) => p._id !== id));
    } catch (err: unknown) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-bengali">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-600 dark:text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              আমার সংরক্ষিত পোস্টারসমূহ
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            আপনার অ্যাকাউন্টে পূর্বে তৈরিকৃত সকল পোস্টারের ইতিহাস ও পুনরায় ডাউনলোডের তালিকা
          </p>
        </div>

        <Link
          href="/studio"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-rose-600 to-amber-500 text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>নতুন পোস্টার তৈরি করুন</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-amber-500" />
          <p className="text-xs">পোস্টার হিস্ট্রি লোড হচ্ছে...</p>
        </div>
      ) : isAuthRequired ? (
        <div className="p-10 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900/80 border-2 border-emerald-500/30 dark:border-amber-400/30 space-y-5 max-w-md mx-auto shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-amber-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-amber-400">
            <History className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              পোস্টার হিস্ট্রি দেখতে লগইন আবশ্যক
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              পোস্টার হিস্ট্রি হলো আপনার ব্যক্তিগত সংরক্ষিত পোস্টারের তালিকা। আপনার তৈরিকৃত পোস্টার দেখতে ও নিরাপদে সেভ রাখতে অ্যাকাউন্টে লগইন থাকা প্রয়োজন।
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/auth?redirect=/history"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <span>লগইন / রেজিস্টার করুন</span>
            </Link>
            <button
              type="button"
              onClick={async () => {
                await demoLogin();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 text-xs font-bold transition-all"
            >
              <span>ডেমো অ্যাকাউন্ট দিয়ে দেখুন</span>
            </button>
          </div>
        </div>
      ) : posters.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">এখনও কোনো পোস্টার সেভ করা হয়নি</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            পোস্টার স্টুডিওতে গিয়ে আপনার প্রথম রাজনৈতিক পোস্টারটি তৈরি করে সেভ করুন।
          </p>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Layers className="w-4 h-4" />
            <span>পোস্টার স্টুডিও খুলুন</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posters.map((poster) => (
            <div
              key={poster._id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:border-amber-400/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(poster.createdAt).toLocaleDateString('bn-BD')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    {poster.status}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-1">
                    {poster.formData?.candidateName || 'প্রার্থী'}
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-amber-300 line-clamp-1 font-bold">
                    {poster.formData?.designation} — {poster.formData?.organizationOrParty}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                    "{poster.formData?.headline}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDelete(poster._id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link
                  href={`/studio?posterId=${poster._id}`}
                  className="flex-1 text-center py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold transition-colors"
                >
                  স্টুডিওতে খুলুন
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
