'use client';

import React, { useState, useEffect } from 'react';
import { IPoster } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  History,
  Trash2,
  Calendar,
  Loader2,
  Sparkles,
  Layers,
  Download,
  Eye,
  Edit3,
  X,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function HistoryPage() {
  const { user, token, demoLogin } = useAuth();
  const [posters, setPosters] = useState<IPoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthRequired, setIsAuthRequired] = useState(false);
  const [previewPoster, setPreviewPoster] = useState<IPoster | null>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    poster: IPoster | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    poster: null,
    isLoading: false,
  });

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

  const promptDelete = (poster: IPoster) => {
    setDeleteModal({
      isOpen: true,
      poster,
      isLoading: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.poster) return;
    const targetId = deleteModal.poster._id;
    setDeleteModal((prev) => ({ ...prev, isLoading: true }));

    // Optimistic UI state update
    setPosters((prev) => prev.filter((p) => p._id !== targetId));
    if (previewPoster?._id === targetId) setPreviewPoster(null);

    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('poster_token') : null) || '';
      await api.deletePoster(targetId, activeToken);
      toast.success('পোস্টারটি সফলভাবে মুছে ফেলা হয়েছে!');
    } catch (err: unknown) {
      console.error('Delete failed:', err);
      toast.error('পোস্টার ডিলিট করতে সমস্যা হয়েছে।');
    } finally {
      setDeleteModal({ isOpen: false, poster: null, isLoading: false });
    }
  };

  const handleDownloadImage = (poster: IPoster) => {
    if (!poster.generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = poster.generatedImageUrl;
    link.download = `poster-${poster.formData?.candidateName || 'political'}-${Date.now()}.png`;
    link.click();
    toast.info('ছবি ডাউনলোড শুরু হয়েছে');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-bengali">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 theme-text-accent" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              আমার সংরক্ষিত পোস্টারসমূহ
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            আপনার অ্যাকাউন্টে পূর্বে তৈরিকৃত সকল পোস্টারের ইতিহাস, ভিজ্যুয়াল ডিজাইন ও পুনরায় এডিটের তালিকা
          </p>
        </div>

        <Link
          href="/studio"
          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl theme-btn-primary text-xs font-bold active:scale-95 transition-all"
        >
          <span>নতুন পোস্টার তৈরি করুন</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin theme-text-accent" />
          <p className="text-xs">পোস্টার হিস্ট্রি লোড হচ্ছে...</p>
        </div>
      ) : isAuthRequired ? (
        <div className="p-10 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900/80 border-2 theme-border space-y-5 max-w-md mx-auto shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-2xl theme-subtle-bg border theme-border flex items-center justify-center">
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
          <div className="flex items-center justify-center pt-2">
            <Link
              href="/auth?redirect=/history"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl theme-btn-primary text-xs font-bold transition-all active:scale-95"
            >
              <span>লগইন / রেজিস্টার করুন</span>
            </Link>
          </div>
        </div>
      ) : posters.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">এখনও কোনো পোস্টার সেভ করা হয়নি</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            পোস্টার স্টুডিওতে গিয়ে আপনার প্রথম রাজনৈতিক পোস্টারটি ডিজাইন করে সেভ করুন।
          </p>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl theme-btn-primary text-xs font-bold transition-all active:scale-95"
          >
            <Layers className="w-4 h-4" />
            <span>পোস্টার স্টুডিও খুলুন</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posters.map((poster) => {
            const hasImage = Boolean(poster.generatedImageUrl && poster.generatedImageUrl.length > 20);
            const candidateName = poster.formData?.candidateName || 'প্রার্থী';
            const designation = poster.formData?.designation || '';
            const party = poster.formData?.organizationOrParty || '';
            const headline = poster.formData?.headline || '';

            return (
              <div
                key={poster._id}
                className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Poster Visual Preview Container */}
                <div className="relative aspect-[3/4] bg-slate-950 overflow-hidden cursor-pointer">
                  {hasImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={poster.generatedImageUrl}
                      alt={candidateName}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      onClick={() => setPreviewPoster(poster)}
                    />
                  ) : (
                    <div
                      onClick={() => setPreviewPoster(poster)}
                      className="w-full h-full flex flex-col justify-between p-5 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white relative border-4 border-amber-400/30"
                    >
                      <div className="text-center space-y-1">
                        <span className="text-[10px] text-amber-300 font-bold tracking-wider">
                          {poster.formData?.religiousHeader || 'বিসমিল্লাহির রাহমানির রাহিম'}
                        </span>
                        <h4 className="text-sm font-black text-white line-clamp-1">
                          {headline}
                        </h4>
                      </div>

                      <div className="flex flex-col items-center justify-center my-auto">
                        {poster.candidatePhotoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={poster.candidatePhotoUrl}
                            alt={candidateName}
                            className="w-28 h-28 object-cover rounded-full border-4 border-amber-400 shadow-xl"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-amber-400/50 flex items-center justify-center text-amber-300 font-black text-2xl">
                            {candidateName.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="text-center space-y-0.5 bg-black/60 backdrop-blur-sm p-2.5 rounded-xl border border-amber-400/30">
                        <p className="text-xs font-black text-amber-300 line-clamp-1">
                          {candidateName}
                        </p>
                        <p className="text-[10px] text-slate-300 line-clamp-1">
                          {designation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Overlay Action Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center gap-1 shadow-sm">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      {new Date(poster.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold theme-bg-primary text-white backdrop-blur-md shadow-sm">
                      {poster.status === 'completed' ? 'সম্পূর্ণ' : poster.status}
                    </span>
                  </div>

                  {/* Hover Quick View Overlay */}
                  <button
                    type="button"
                    onClick={() => setPreviewPoster(poster)}
                    className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold"
                  >
                    <Eye className="w-5 h-5 text-amber-400" />
                    <span>বড় করে দেখুন</span>
                  </button>
                </div>

                {/* Poster Meta Info */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-1">
                      {candidateName}
                    </h3>
                    <p className="text-xs theme-text-accent line-clamp-1 font-bold">
                      {designation} {party ? `— ${party}` : ''}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 italic">
                      "{headline}"
                    </p>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => promptDelete(poster)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {hasImage && (
                      <button
                        type="button"
                        onClick={() => handleDownloadImage(poster)}
                        className="p-2 rounded-xl text-slate-400 hover:theme-text-accent hover:theme-subtle-bg transition-colors"
                        title="ছবি ডাউনলোড করুন"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}

                    <Link
                      href={`/studio?posterId=${poster._id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl theme-btn-primary text-xs font-bold transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>স্টুডিওতে খুলুন ও এডিট করুন</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {previewPoster && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewPoster(null)}
        >
          <div
            className="relative max-w-xl w-full bg-slate-900 rounded-3xl p-4 border border-slate-700 shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-white">
              <div>
                <h3 className="text-sm font-black line-clamp-1">
                  {previewPoster.formData?.candidateName}
                </h3>
                <p className="text-[11px] text-amber-400">
                  {previewPoster.formData?.designation} — {previewPoster.formData?.organizationOrParty}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPoster(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center rounded-2xl bg-black/50 p-2">
              {previewPoster.generatedImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewPoster.generatedImageUrl}
                  alt={previewPoster.formData?.candidateName || 'Poster'}
                  className="max-h-[65vh] object-contain rounded-xl shadow-2xl"
                />
              ) : (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <p className="text-xs">পোস্টারের প্রিভিউ ইমেজ উপস্থিত নেই।</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              {previewPoster.generatedImageUrl && (
                <button
                  type="button"
                  onClick={() => handleDownloadImage(previewPoster)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl theme-btn-primary text-xs font-bold transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>ডাউনলোড করুন</span>
                </button>
              )}

              <Link
                href={`/studio?posterId=${previewPoster._id}`}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md"
              >
                <Edit3 className="w-4 h-4" />
                <span>স্টুডিওতে কাস্টমাইজ করুন</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, poster: null, isLoading: false })}
        onConfirm={handleConfirmDelete}
        title="পোস্টারটি মুছে ফেলতে চান?"
        description="এই পোস্টারটি আপনার অ্যাকাউন্ট ও হিস্ট্রি থেকে স্থায়ীভাবে মুছে ফেলা হবে।"
        confirmText="হ্যাঁ, মুছে ফেলুন"
        cancelText="বাতিল"
        isDestructive={true}
        isLoading={deleteModal.isLoading}
        itemPreview={
          deleteModal.poster
            ? {
                title: deleteModal.poster.formData?.candidateName,
                subtitle: deleteModal.poster.formData?.headline || deleteModal.poster.formData?.designation,
                imageUrl: deleteModal.poster.generatedImageUrl,
              }
            : undefined
        }
      />
    </div>
  );
}
