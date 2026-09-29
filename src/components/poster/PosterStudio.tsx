'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ITemplate, IPosterFormData, ITopLeader, IAISloganResponse, PosterArchetype, ICandidatePhotoAdjustments } from '@/types';
import { BANGLADESHI_POLITICAL_PARTIES, IPartyInfo } from '@/data/politicalParties';
import { PosterCanvas, PosterCanvasHandle } from './PosterCanvas';
import { PartySymbolSelector } from './PartySymbolSelector';
import { TopLeadersUploader } from './TopLeadersUploader';
import { CandidatePhotoUploader } from './CandidatePhotoUploader';
import { AISloganGenerator } from './AISloganGenerator';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { compressImage } from '@/lib/imageCompressor';

import {
  Sparkles,
  Save,
  Loader2,
  CheckCircle2,
  Layers,
  MapPin,
  User,
  Zap,
  LogIn,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'react-toastify';

interface PosterStudioProps {
  initialTemplate?: ITemplate | null;
}

export const PosterStudio: React.FC<PosterStudioProps> = ({ initialTemplate }) => {
  const searchParams = useSearchParams();
  const templateIdParam = searchParams.get('templateId');
  const posterIdParam = searchParams.get('posterId');
  const canvasRef = useRef<PosterCanvasHandle>(null);

  const { user, token } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<ITemplate | null>(initialTemplate || null);

  const [formData, setFormData] = useState<IPosterFormData>({
    candidateName: 'মো: রফিকুল ইসলাম',
    designation: 'যুগ্ম সাধারণ সম্পাদক',
    organizationOrParty: 'বাংলাদেশ জাতীয়তাবাদী দল (বিএনপি)',
    unionOrThana: 'কেন্দুয়া উপজেলা',
    district: 'নেত্রকোণা',
    constituencyName: 'নেত্রকোণা-৩ (কেন্দুয়া-আটপাড়া)',
    headline: 'মহান বিজয় দিবস সফল হোক',
    subheadline: 'বীর শহীদদের প্রতি বিনম্র শ্রদ্ধা ও রক্তিম শুভেচ্ছা',
    slogan: 'স্বাধীনতার চেতনায় গড়ব মোরা নতুন বাংলাদেশ',
    quote: 'পরিবর্তন ও উন্নয়নের অঙ্গীকার নিয়ে জনতার পাশে',
    creditLine: 'প্রচারে: সচেতন নাগরিক সমাজ ও সর্বস্তরের দেশপ্রেমিক জনতা',
    selectedPartyKey: 'bnp',
    archetype: 'gemini_ai_masterpiece',
    candidatePosition: 'bottom-center',
  });

  const [topLeaders, setTopLeaders] = useState<(ITopLeader & { scale?: number; posX?: number; posY?: number })[]>([
    { url: '', name: 'শহীদ রাষ্ট্রপতি জিয়াউর রহমান', title: 'স্বাধীনতার ঘোষক ও প্রতিষ্ঠাতা', scale: 1, posX: 0, posY: 0 },
    { url: '', name: 'বেগম খালেদা জিয়া', title: 'সাবেক তিনবারের সফল প্রধানমন্ত্রী', scale: 1, posX: 0, posY: 0 },
  ]);

  const handleAddLeader = () => {
    if (topLeaders.length >= 4) return;
    setTopLeaders((prev) => [
      ...prev,
      {
        url: '',
        name: `শীর্ষ নেতা ${prev.length + 1}`,
        title: 'সম্মানিত নেতৃত্ব',
        scale: 1,
        posX: 0,
        posY: 0,
      },
    ]);
  };

  const handleRemoveLeader = (index: number) => {
    if (topLeaders.length <= 1) return;
    setTopLeaders((prev) => prev.filter((_, i) => i !== index));
  };

  const [candidatePhotoUrl, setCandidatePhotoUrl] = useState<string>('');
  const [partySymbolUrl, setPartySymbolUrl] = useState<string>('/symbols/dhaner_shish.svg');
  const [candidateAdjustments, setCandidateAdjustments] = useState<ICandidatePhotoAdjustments>({
    scale: 1.85,
    posX: 0,
    posY: 25,
    frameStyle: 'cutout',
    enableGlow: true,
  });

  const [generating, setGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Restore saved draft on mount if available and no posterIdParam
  useEffect(() => {
    if (!posterIdParam && typeof window !== 'undefined') {
      try {
        const savedDraft = localStorage.getItem('poster_studio_draft');
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.formData) setFormData(parsed.formData);
          if (parsed.topLeaders && parsed.topLeaders.length > 0) setTopLeaders(parsed.topLeaders);
          if (parsed.candidatePhotoUrl) setCandidatePhotoUrl(parsed.candidatePhotoUrl);
          if (parsed.partySymbolUrl) setPartySymbolUrl(parsed.partySymbolUrl);
          if (parsed.candidateAdjustments) setCandidateAdjustments(parsed.candidateAdjustments);
        }
      } catch (err) {
        console.warn('Draft recovery failed:', err);
      }
    }
  }, [posterIdParam]);

  // Load template on mount
  useEffect(() => {
    if (templateIdParam) {
      api.getTemplateById(templateIdParam).then((res) => {
        if (res.success && res.data) {
          const tpl = res.data;
          setSelectedTemplate(tpl);
          setFormData((prev) => ({
            ...prev,
            headline: tpl.layoutConfig?.defaultHeadline || prev.headline,
            subheadline: tpl.layoutConfig?.defaultSubheadline || prev.subheadline,
            slogan: tpl.layoutConfig?.defaultSlogan || prev.slogan,
            archetype: tpl.archetype || prev.archetype,
          }));
        }
      }).catch(console.error);
    } else if (!selectedTemplate) {
      api.getTemplates().then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setSelectedTemplate(res.data[0]);
        }
      }).catch(console.error);
    }
  }, [templateIdParam]);

  // Load poster if posterIdParam exists
  useEffect(() => {
    if (posterIdParam) {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('poster_token') : null) || '';
      api.getPosterById(posterIdParam, activeToken).then((res) => {
        if (res.success && res.data) {
          const poster = res.data;
          if (poster.formData) {
            setFormData((prev) => ({
              ...prev,
              ...poster.formData,
            }));
            if (poster.formData.candidateAdjustments) {
              setCandidateAdjustments(poster.formData.candidateAdjustments);
            }
          }
          if (poster.candidateAdjustments) {
            setCandidateAdjustments(poster.candidateAdjustments);
          }
          if (poster.topLeadersPhotos && poster.topLeadersPhotos.length > 0) {
            setTopLeaders(poster.topLeadersPhotos);
          }
          if (poster.candidatePhotoUrl) {
            setCandidatePhotoUrl(poster.candidatePhotoUrl);
          }
          if (poster.partySymbolUrl) {
            setPartySymbolUrl(poster.partySymbolUrl);
          }
          if (poster.templateId) {
            if (typeof poster.templateId === 'object' && poster.templateId !== null) {
              setSelectedTemplate(poster.templateId as ITemplate);
            } else {
              api.getTemplateById(poster.templateId as string).then((tRes) => {
                if (tRes.success && tRes.data) setSelectedTemplate(tRes.data);
              }).catch(console.error);
            }
          }
        }
      }).catch(console.error);
    }
  }, [posterIdParam, token]);

  const handleSelectParty = (party: IPartyInfo) => {
    setFormData((prev) => ({
      ...prev,
      selectedPartyKey: party.id,
      organizationOrParty: party.banglaName || party.name,
    }));
    setPartySymbolUrl(party.symbolUrl);

    if (party.defaultLeaders && party.defaultLeaders.length > 0) {
      const newLeaders = party.defaultLeaders.slice(0, 2).map((dl) => ({
        url: '',
        name: dl.name,
        title: dl.title,
        scale: 1,
        posX: 0,
        posY: 0,
      }));
      setTopLeaders(newLeaders);
    }
  };

  const handleApplyAIResult = (result: IAISloganResponse) => {
    setFormData((prev) => ({
      ...prev,
      headline: result.primaryHeadline || prev.headline,
      subheadline: result.subheadline || prev.subheadline,
      slogan: result.slogan || prev.slogan,
      quote: result.quote || prev.quote,
      creditLine: result.creditLine || prev.creditLine,
      candidateName: result.candidateName || prev.candidateName,
      designation: result.designation || prev.designation,
      organizationOrParty: result.organizationOrParty || prev.organizationOrParty,
    }));
  };

  const handleSavePoster = async () => {
    setSuccessMessage('');
    setErrorMessage('');

    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('poster_token') : null) || '';
    const activeUser = user || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('poster_user') || 'null') : null);

    // If user is not logged in, prompt to login without saving automatically
    if (!activeToken || !activeUser) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            'poster_studio_draft',
            JSON.stringify({
              formData,
              topLeaders,
              candidatePhotoUrl,
              partySymbolUrl,
              candidateAdjustments,
              templateId: selectedTemplate?._id,
            })
          );
        } catch {
          // ignore
        }
      }
      setErrorMessage('পোস্টার হিস্ট্রিতে সেভ করতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।');
      setAuthModalOpen(true);
      return;
    }

    setGenerating(true);

    try {
      const templateId = selectedTemplate?._id || '67a100000000000000000001';

      // 1. Snapshot full visual poster for history gallery display
      let snapshotUrl = '';
      if (canvasRef.current?.getSnapshotUrl) {
        try {
          snapshotUrl = await canvasRef.current.getSnapshotUrl();
        } catch (e) {
          console.warn('Canvas snapshot failed:', e);
        }
      }

      // 2. Compress Candidate Photo if Base64
      const optimizedCandidatePhoto = candidatePhotoUrl
        ? await compressImage(candidatePhotoUrl, 1000, 1400, 0.85)
        : '';

      // 3. Compress Top Leaders Photos if Base64
      const optimizedLeaders = await Promise.all(
        topLeaders.map(async (leader) => ({
          ...leader,
          url: leader.url ? await compressImage(leader.url, 600, 600, 0.85) : '',
        }))
      );

      // 4. Compress Party Symbol if Base64
      const optimizedSymbol = partySymbolUrl
        ? await compressImage(partySymbolUrl, 400, 400, 0.9)
        : '';

      const res = await api.createPoster(
        {
          templateId,
          formData: {
            ...formData,
            candidateAdjustments,
          },
          candidateAdjustments,
          topLeadersPhotos: optimizedLeaders,
          candidatePhotoUrl: optimizedCandidatePhoto,
          partySymbolUrl: optimizedSymbol,
          generatedImageUrl: snapshotUrl || '',
          aiEnhanced: true,
        },
        activeToken
      );

      if (res.success) {
        // Clear saved draft once successfully saved
        if (typeof window !== 'undefined') {
          localStorage.removeItem('poster_studio_draft');
        }
        setSuccessMessage('পোস্টারটি সফলভাবে তৈরি ও আপনার অ্যাকাউন্টের হিস্ট্রিতে সংরক্ষিত হয়েছে!');
        toast.success('পোস্টারটি সফলভাবে হিস্ট্রিতে সেভ করা হয়েছে!');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        let msg = res.message || 'পোস্টার সেভ করতে সমস্যা হয়েছে।';
        if (msg.toLowerCase().includes('entity too large') || msg.toLowerCase().includes('payload')) {
          msg = 'ছবির সাইজ অনেক বড় ছিল। ছবিগুলো অপ্টিমাইজ করা হয়েছে, দয়া করে আবার "সেভ করুন" বাটনে ক্লিক করুন।';
        } else if (msg.toLowerCase().includes('token') || msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('অননুমোদিত') || msg.toLowerCase().includes('মেয়াদোত্তীর্ণ')) {
          msg = 'আপনার লগইন সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে আবার লগইন করুন।';
          setAuthModalOpen(true);
        }
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (e: unknown) {
      const rawMsg = e instanceof Error ? e.message : 'Save error';
      console.error('Save error:', rawMsg);
      if (rawMsg.toLowerCase().includes('entity too large') || rawMsg.toLowerCase().includes('payload')) {
        const msg = 'ছবির ফাইল সাইজ বড়। স্বয়ংক্রিয়ভাবে কম্প্রেস করা হয়েছে, আবার সেভ করুন।';
        setErrorMessage(msg);
        toast.warning(msg);
      } else {
        const msg = 'সার্ভার কানেকশনে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।';
        setErrorMessage(msg);
        toast.error(msg);
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-bengali">
            পোস্টার স্টুডিও ও কাস্টমাইজার
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-bengali mt-1">
            টেক্সট, ছবি ও প্রতীক কাস্টমাইজ করুন এবং লাইভ ক্যানভাস প্রিভিউ দেখে এক্সপোর্ট করুন
          </p>
        </div>

        <button
          type="button"
          onClick={handleSavePoster}
          disabled={generating}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl theme-btn-primary font-bold text-sm transition-all font-bengali disabled:opacity-50 active:scale-95"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>পোস্টার হিস্ট্রিতে সেভ করুন</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl theme-subtle-bg border theme-border flex items-center justify-between gap-3 text-sm font-bengali font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <a
            href="/history"
            className="px-3 py-1 rounded-xl theme-btn-primary text-xs transition-colors shadow-sm"
          >
            আমার হিস্ট্রি দেখুন →
          </a>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-rose-700 dark:text-rose-400 text-sm font-bengali font-bold">
          <div className="flex items-center gap-2">
            <span>⚠️ {errorMessage}</span>
          </div>
          {errorMessage.includes('লগইন') && (
            <a
              href="/auth?redirect=/studio"
              className="px-3.5 py-1.5 rounded-xl theme-btn-primary text-xs transition-colors shadow-sm whitespace-nowrap"
            >
              লগইন করুন →
            </a>
          )}
        </div>
      )}

      {/* 2-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Controls: 7 Columns */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Generator Box */}
          <AISloganGenerator
            occasionType={selectedTemplate?.occasionType || 'election_campaign'}
            candidateName={formData.candidateName}
            designation={formData.designation}
            party={formData.organizationOrParty}
            district={formData.district}
            unionOrThana={formData.unionOrThana}
            constituencyName={formData.constituencyName}
            onApplyAIResult={handleApplyAIResult}
          />

          {/* Party Selection */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <PartySymbolSelector
              selectedPartyKey={formData.selectedPartyKey}
              onSelectParty={handleSelectParty}
              customSymbolUrl={partySymbolUrl}
              onUploadCustomSymbol={async (file) => {
                const compressed = await compressImage(file, 400, 400, 0.9);
                if (compressed) setPartySymbolUrl(compressed);
              }}
            />
          </div>

          {/* Top Leaders */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <TopLeadersUploader
              topLeaders={topLeaders}
              onAddLeader={handleAddLeader}
              onRemoveLeader={handleRemoveLeader}
              leadersFrameSize={formData.leadersFrameSize || 64}
              onChangeLeadersFrameSize={(size) => setFormData((prev) => ({ ...prev, leadersFrameSize: size }))}
              leaderTextSize={formData.leaderTextSize || 9}
              onChangeLeaderTextSize={(size) => setFormData((prev) => ({ ...prev, leaderTextSize: size }))}
              showLeaderTitles={formData.showLeaderTitles !== false}
              onToggleShowLeaderTitles={(show) => setFormData((prev) => ({ ...prev, showLeaderTitles: show }))}
              onUpdateLeader={(idx, data) =>
                setTopLeaders((prev) => {
                  const updated = [...prev];
                  updated[idx] = { ...updated[idx], ...data };
                  return updated;
                })
              }
              onUploadLeaderPhoto={async (idx, file) => {
                const compressed = await compressImage(file, 600, 600, 0.85);
                if (compressed) {
                  setTopLeaders((prev) => {
                    const updated = [...prev];
                    updated[idx] = { ...updated[idx], url: compressed };
                    return updated;
                  });
                }
              }}
            />
          </div>


          {/* Candidate Information Form */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bengali flex items-center gap-2">
              <User className="w-4 h-4 theme-text-accent" />
              <span>প্রার্থীর তথ্য ও ব্যানার টেক্সট</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-700 dark:text-slate-400 font-bengali mb-1 block">
                  প্রার্থীর নাম
                </span>
                <input
                  type="text"
                  value={formData.candidateName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, candidateName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bengali font-bold focus:outline-none theme-ring-focus"
                />
              </div>

              <div>
                <span className="text-xs text-slate-700 dark:text-slate-400 font-bengali mb-1 block">
                  পদবি
                </span>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData((prev) => ({ ...prev, designation: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bengali font-bold focus:outline-none theme-ring-focus"
                />
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-700 dark:text-slate-400 font-bengali mb-1 block">
                ব্যানার প্রধান শিরোনাম
              </span>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData((prev) => ({ ...prev, headline: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bengali font-bold focus:outline-none theme-ring-focus"
              />
            </div>

            <div>
              <span className="text-xs text-slate-700 dark:text-slate-400 font-bengali mb-1 block">
                উপ-শিরোনাম / বার্তা
              </span>
              <input
                type="text"
                value={formData.subheadline}
                onChange={(e) => setFormData((prev) => ({ ...prev, subheadline: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bengali focus:outline-none theme-ring-focus"
              />
            </div>

            <div>
              <span className="text-xs text-slate-700 dark:text-slate-400 font-bengali mb-1 block">
                নির্বাচনী স্লোগান
              </span>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => setFormData((prev) => ({ ...prev, slogan: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bengali focus:outline-none theme-ring-focus"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-700 dark:text-slate-400 font-bengali mb-1 block">
                  উপজেলা / থানা
                </span>
                <input
                  type="text"
                  value={formData.unionOrThana || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, unionOrThana: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bengali focus:outline-none"
                />
              </div>
              <div>
                <span className="text-xs text-slate-700 dark:text-slate-400 font-bengali mb-1 block">
                  জেলা / নির্বাচনী আসন
                </span>
                <input
                  type="text"
                  value={formData.constituencyName || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, constituencyName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bengali focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Candidate Photo */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CandidatePhotoUploader
              photoUrl={candidatePhotoUrl}
              candidateName={formData.candidateName}
              adjustments={candidateAdjustments}
              onChangeAdjustments={(adj) =>
                setCandidateAdjustments((prev: ICandidatePhotoAdjustments) => ({ ...prev, ...adj }))
              }
              onUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (e.target?.result) setCandidatePhotoUrl(e.target.result as string);
                };
                reader.readAsDataURL(file);
              }}
              onSetPhotoUrl={(url) => setCandidatePhotoUrl(url)}
              onRemove={() => setCandidatePhotoUrl('')}
            />
          </div>
        </div>

        {/* Right Canvas Preview: 5 Columns */}
        <div className="lg:col-span-5 sticky top-24 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-bengali">
              <span className="w-2 h-2 rounded-full theme-bg-primary animate-pulse" />
              লাইভ প্রিভিউ (রিয়েল-টাইম)
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              ১২০০×১৬০০px Print Ready
            </span>
          </div>

          <div className="w-full flex justify-center bg-white dark:bg-slate-900/60 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-inner overflow-x-auto">
            <PosterCanvas
              ref={canvasRef}
              template={selectedTemplate}
              formData={formData}
              topLeaders={topLeaders}
              candidatePhotoUrl={candidatePhotoUrl}
              partySymbolUrl={partySymbolUrl}
              candidateAdjustments={candidateAdjustments}
              onUpdateFormData={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
              onUpdateCandidateAdjustments={(adj) =>
                setCandidateAdjustments((prev: ICandidatePhotoAdjustments) => ({ ...prev, ...adj }))
              }
              onUpdateTopLeader={(idx, data) =>
                setTopLeaders((prev) => {
                  const updated = [...prev];
                  updated[idx] = { ...updated[idx], ...data };
                  return updated;
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Auth Requirement Modal */}
      {authModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setAuthModalOpen(false)}
        >
          <div
            className="relative max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-center font-bengali"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto rounded-2xl theme-subtle-bg border theme-border flex items-center justify-center shadow-sm">
              <LogIn className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                পোস্টার হিস্ট্রিতে সেভ করতে লগইন আবশ্যক
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                আপনার তৈরি করা পোস্টারটি ব্যক্তিগত অ্যাকাউন্টে সুরক্ষিতভাবে সংরক্ষণ ও পুনরায় ডাউনলোড করার জন্য লগইন করা প্রয়োজন। আপনার বর্তমান ডিজাইনটি নিরাপদে সংরক্ষিত রয়েছে।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="/auth?redirect=/studio"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl theme-btn-primary text-xs font-bold transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>লগইন / রেজিস্টার করুন</span>
              </a>

              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
