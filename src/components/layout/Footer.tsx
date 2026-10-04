'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Printer, CheckCircle, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Hide footer completely on Admin Panel & Auth Page
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) {
    return null;
  }

  return (
    <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 font-bengali text-xs py-12 mt-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="AI Political Poster Maker"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-base font-black text-slate-900 dark:text-white font-bengali">
                  পোস্টার<span className="text-emerald-600 dark:text-emerald-400">মেকার</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bengali">
                  বাংলাদেশি ডিজিটাল রাজনৈতিক ও নির্বাচনী পোস্টার প্ল্যাটফর্ম
                </p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-md">
              বাংলাদেশের রাজনৈতিক কর্মী, নেতৃবৃন্দ ও নির্বাচনী প্রচারণার জন্য গুগল জেমিনি এআই চালিত প্রথম স্বয়ংক্রিয় হাই-রেজুলেশন পোস্টার মেকার প্ল্যাটফর্ম।
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] border border-emerald-500/20">
                <CheckCircle className="w-3 h-3" /> নির্ভুল বাংলা টাইপোগ্রাফি
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] border border-amber-500/20">
                <Printer className="w-3 h-3" /> ৩০০ DPI প্রিন্ট রেডি এক্সপোর্ট
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
              দ্রুত লিঙ্ক
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/templates" className="hover:text-emerald-600 dark:hover:text-amber-400 transition-colors">
                  টেমপ্লেট গ্যালারি
                </Link>
              </li>
              <li>
                <Link href="/studio" className="hover:text-emerald-600 dark:hover:text-amber-400 transition-colors">
                  পোস্টার স্টুডিও ও কাস্টমাইজার
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-emerald-600 dark:hover:text-amber-400 transition-colors">
                  সংরক্ষিত পোস্টার হিস্ট্রি
                </Link>
              </li>
            </ul>
          </div>

          {/* Guidelines */}
          <div className="space-y-2">
            <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
              নীতিমালা ও সহায়তা
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              এই প্ল্যাটফর্মটি শুধুমাত্র গঠনমূলক রাজনৈতিক প্রচারণা, নির্বাচনী কার্যক্রম ও জাতীয় দিবসের শুভেচ্ছার জন্য উন্মুক্ত।
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} AI Political Poster Maker. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            দেশপ্রেম ও উন্নত প্রযুক্তির সমন্বয়ে নির্মিত
          </p>
        </div>
      </div>
    </footer>
  );
};
