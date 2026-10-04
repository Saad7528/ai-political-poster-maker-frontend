'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Layers,
  Printer,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export default function HomePage() {
  const categories = [
    {
      id: 'election_campaign',
      name: 'জাতীয় সংসদ ও মেয়র নির্বাচন',
      desc: 'সাংসদ, মেয়র, চেয়ারম্যান ও কাউন্সিলর প্রার্থীদের নির্বাচনী পোস্টার',
      icon: '🗳️',
    },
    {
      id: 'bijoy_dibosh',
      name: 'মহান বিজয় দিবস ও জাতীয় দিবস',
      desc: '১৬ই ডিসেম্বর ও ২৬শে মার্চের রক্তিম শুভেচ্ছা ব্যানার',
      icon: '🟢🔴',
    },
    {
      id: 'eid_celebration',
      name: 'পবিত্র ঈদ ও উৎসবের শুভেচ্ছা',
      desc: 'ঈদুল ফিতর ও ঈদুল আযহার দৃষ্টিনন্দন মোবারকবাদ পোস্টার',
      icon: '🌙',
    },
    {
      id: 'shok_dibosh',
      name: 'শোক দিবস ও স্মরণসভা',
      desc: 'মরহুম জাতীয় ও স্থানীয় নেতাদের স্মরণে শোক ও দোয়া মাহফিল',
      icon: '🖤',
    },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-3xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto font-bengali">
          মুহূর্তেই তৈরি করুন <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-300">
            খাঁটি বাংলাদেশি রাজনৈতিক পোস্টার
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-bengali">
          নির্বাচনী প্রচারণা, জাতীয় দিবস কিংবা ঈদ শুভেচ্ছা—প্রার্থীর তথ্য ও ছবি দিয়ে এক ক্লিকেই তৈরি করুন ৩০০ DPI হাই-রেজুলেশন প্রিন্ট-রেডি পোস্টার।
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/studio"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base shadow-xl shadow-emerald-600/20 transition-all active:scale-95 font-bengali"
          >
            <Sparkles className="w-5 h-5 fill-current" />
            <span>পোস্টার স্টুডিওতে ডিজাইন শুরু করুন</span>
          </Link>

          <Link
            href="/templates"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-base transition-all font-bengali shadow-sm"
          >
            <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>টেমপ্লেট গ্যালারি দেখুন</span>
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left font-bengali">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">নির্ভুল বাংলা বানান</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">১০০% স্পষ্ট বাংলা ফন্ট</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">৩০০ DPI প্রিন্ট ফাইল</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">HD PNG ও PDF এক্সপোর্ট</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">জেমিনি এআই স্লোগান</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">স্বয়ংক্রিয় কপিরাইটিং</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">প্রকৃত নেতার ছবি</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">আসল ছবি ও প্রতীক অক্ষত</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-bengali">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            জনপ্রিয় পোস্টার ক্যাটাগরি
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            আপনার প্রয়োজনীয় ইভেন্ট সিলেক্ট করে সরাসরি পোস্টার তৈরি শুরু করুন
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/templates?occasion=${cat.id}`}
              className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:border-amber-400/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="text-3xl">{cat.icon}</div>
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-amber-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>টেমপ্লেটগুলো দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
