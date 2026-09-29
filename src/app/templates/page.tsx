'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ITemplate } from '@/types';
import { api } from '@/lib/api';
import { ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'সবগুলো টেমপ্লেট' },
  { id: 'election_campaign', label: '🗳️ নির্বাচনী প্রচার' },
  { id: 'bijoy_dibosh', label: '🟢🔴 মহান বিজয় দিবস' },
  { id: 'eid_celebration', label: '🌙 পবিত্র ঈদ ও উৎসব' },
  { id: 'shok_dibosh', label: '🖤 শোক দিবস / দোয়া মাহফিল' },
  { id: 'pohela_boishakh', label: '🎨 পহেলা বৈশাখ / নববর্ষ' },
  { id: 'ekushey_february', label: '🌸 ভাষা শহীদ দিবস' },
  { id: 'shuvechcha', label: '📢 সমাবেশ ও শুভেচ্ছা' },
];

function TemplatePreviewCard({ tpl }: { tpl: ITemplate }) {
  const bg = tpl.layoutConfig?.colorScheme?.background || '#042f2e';
  const primary = tpl.layoutConfig?.colorScheme?.primary || '#006a4e';
  const accent = tpl.layoutConfig?.colorScheme?.accent || '#ffd700';
  const bodyText = tpl.layoutConfig?.colorScheme?.bodyTextColor || '#ffffff';
  const occasion = tpl.occasionType;

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-xl dark:hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between space-y-4 group">
      <div className="space-y-3">
        {/* Dynamic Themed Visual Card Frame */}
        <div
          className="w-full h-64 rounded-2xl p-3.5 flex flex-col justify-between relative overflow-hidden border border-white/10 shadow-lg select-none"
          style={{ backgroundColor: bg }}
        >
          {/* Visual Occasion Specific Background Accents */}
          {occasion === 'shok_dibosh' && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black pointer-events-none">
              <div className="absolute top-2 right-2 text-2xl opacity-20">🕯️</div>
              <div className="absolute bottom-2 left-2 text-2xl opacity-15">🖤</div>
            </div>
          )}

          {occasion === 'pohela_boishakh' && (
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff18_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-400/20 blur-xl" />
              <div className="absolute top-2 right-2 text-xl opacity-40">🌺</div>
              <div className="absolute bottom-2 left-2 text-xl opacity-30">🎨</div>
            </div>
          )}

          {occasion === 'eid_celebration' && (
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 via-transparent to-black/80 pointer-events-none">
              <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full bg-amber-400/15 blur-2xl" />
              <div className="absolute top-2 right-2 text-2xl opacity-40">🌙</div>
              <div className="absolute top-3 right-8 text-xs text-amber-300/40">✨</div>
              <div className="absolute bottom-2 left-2 text-xl opacity-30">🕌</div>
            </div>
          )}

          {occasion === 'bijoy_dibosh' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-rose-600/35 blur-sm" />
              <div className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded bg-rose-600/80 text-white">
                ১৬ই ডিসেম্বর
              </div>
            </div>
          )}

          {occasion === 'ekushey_february' && (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-zinc-900 to-black pointer-events-none">
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-rose-600/20 blur-lg" />
              <div className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-rose-300 border border-zinc-700">
                ২১শে ফেব্রুয়ারি
              </div>
              <div className="absolute bottom-2 left-2 text-xl opacity-20">অ আ ক খ</div>
            </div>
          )}

          {occasion === 'election_campaign' && (
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-blue-950/40 pointer-events-none">
              <div className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
                ভোট দিন
              </div>
              <div className="absolute bottom-2 left-2 text-xl opacity-25">🗳️</div>
            </div>
          )}

          {occasion === 'shuvechcha' && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/60 pointer-events-none">
              <div className="absolute top-2 right-2 text-base opacity-40">📢</div>
              <div className="absolute bottom-2 left-2 text-base opacity-30">✊</div>
            </div>
          )}

          {/* Top Header Bar */}
          <div className="relative z-10 flex items-center justify-between text-[10px] font-bold text-amber-200/90 border-b border-white/10 pb-1.5">
            <span className="truncate">বিসমিল্লাহির রাহমানির রাহিম</span>
            {/* 2 Leader Portrait Silhouette Dots */}
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full border border-amber-300/60 bg-black/40 flex items-center justify-center text-[7px] text-amber-200">
                👤
              </div>
              <div className="w-5 h-5 rounded-full border border-amber-300/60 bg-black/40 flex items-center justify-center text-[7px] text-amber-200">
                👤
              </div>
            </div>
          </div>

          {/* Main Headline & Subheadline Center */}
          <div className="relative z-10 text-center px-1 my-auto space-y-1">
            <h4
              className="text-xs sm:text-sm font-black drop-shadow-md line-clamp-2 leading-snug"
              style={{ color: '#ffffff' }}
            >
              {tpl.layoutConfig?.defaultHeadline}
            </h4>
            {tpl.layoutConfig?.defaultSubheadline && (
              <p
                className="text-[10px] font-semibold line-clamp-1 opacity-90"
                style={{ color: accent }}
              >
                {tpl.layoutConfig.defaultSubheadline}
              </p>
            )}
          </div>

          {/* Bottom Candidate & Slogan Strip */}
          <div className="relative z-10 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-white/10 flex items-center justify-between text-[9px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-4 h-4 rounded-full bg-emerald-500/30 flex items-center justify-center text-[8px] text-white flex-shrink-0">
                ⭐
              </div>
              <span className="text-slate-200 font-bold truncate">
                {tpl.layoutConfig?.defaultSlogan ? tpl.layoutConfig.defaultSlogan.slice(0, 24) + '...' : 'প্রার্থীর নাম ও প্রতীক'}
              </span>
            </div>
            <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded bg-white/10 text-white/80 whitespace-nowrap ml-1">
              স্লট
            </span>
          </div>
        </div>

        {/* Info Titles */}
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
            {tpl.banglaTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
            {tpl.title}
          </p>
        </div>
      </div>

      {/* Sleek, Smart Action Button with dynamic theme */}
      <Link
        href={`/studio?templateId=${tpl._id}`}
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl theme-btn-primary font-bold text-xs group/btn active:scale-95"
      >
        <span>এই টেমপ্লেট স্টুডিওতে খুলুন</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}

function TemplateCardSkeleton() {
  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4 animate-pulse">
      <div className="space-y-3">
        {/* Card Poster Frame Skeleton */}
        <div className="w-full h-64 rounded-2xl p-4 bg-slate-100 dark:bg-slate-800/60 flex flex-col justify-between relative overflow-hidden border border-slate-200/60 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded-md" />
            <div className="flex gap-1.5">
              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
          <div className="space-y-2 text-center my-auto flex flex-col items-center">
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md" />
            <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-md" />
          </div>
          <div className="h-7 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
        {/* Info Titles skeleton */}
        <div className="space-y-2 pt-1">
          <div className="h-4 w-3/5 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-3 w-2/5 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
      </div>
      {/* Button skeleton */}
      <div className="h-10 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

function TemplatesContent() {
  const searchParams = useSearchParams();
  const initialOccasion = searchParams.get('occasion') || 'all';

  const [selectedOccasion, setSelectedOccasion] = useState(initialOccasion);
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const res = await api.getTemplates(selectedOccasion);
        if (res.success && res.data) {
          setTemplates(res.data);
        }
      } catch (err: unknown) {
        console.error('Failed to load templates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [selectedOccasion]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-bengali">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
       
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
          রেডিমেড রাজনৈতিক পোস্টার টেমপ্লেট লাইব্রেরি
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          আপনার পছন্দের টেমপ্লেটটি নির্বাচন করে সরাসরি পোস্টার স্টুডিওতে কাস্টমাইজ করুন
        </p>
      </div>

      {/* Category Pills Filter with Smart Clean Styling */}
      <div className="flex items-center sm:justify-center overflow-x-auto no-scrollbar gap-2 pb-2 sm:pb-0 px-1 sm:px-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedOccasion(cat.id)}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all font-bengali whitespace-nowrap flex-shrink-0 active:scale-95 ${
              selectedOccasion === cat.id
                ? 'theme-btn-primary shadow-md'
                : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading Skeleton / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <TemplateCardSkeleton key={i} />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-xs">
          এই ক্যাটাগরিতে কোনো টেমপ্লেট পাওয়া যায়নি।
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <TemplatePreviewCard key={tpl._id} tpl={tpl} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500 dark:text-slate-400">লোড হচ্ছে...</div>}>
      <TemplatesContent />
    </Suspense>
  );
}
