'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ITemplate, IPosterFormData, ITopLeader, IAISloganResponse, PosterArchetype, ICandidatePhotoAdjustments } from '@/types';
import { BANGLADESHI_POLITICAL_PARTIES, IPartyInfo } from '@/data/politicalParties';
import { PosterCanvas } from './PosterCanvas';
import { PartySymbolSelector } from './PartySymbolSelector';
import { TopLeadersUploader } from './TopLeadersUploader';
import { CandidatePhotoUploader } from './CandidatePhotoUploader';
import { AISloganGenerator } from './AISloganGenerator';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  Save,
  Loader2,
  CheckCircle2,
  Layers,
  MapPin,
  User,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PosterStudioProps {
  initialTemplate?: ITemplate | null;
}

export const PosterStudio: React.FC<PosterStudioProps> = ({ initialTemplate }) => {
  const searchParams = useSearchParams();
  const templateIdParam = searchParams.get('templateId');
  const posterIdParam = searchParams.get('posterId');

  const { user, token, demoLogin } = useAuth();
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

  // Load template if templateIdParam exists
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
    }
  }, [templateIdParam]);

  // Load poster if posterIdParam exists
  useEffect(() => {
    if (posterIdParam) {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('poster_token') : null) || '';
      api.getPosterById(posterIdParam, activeToken).then((res) => {
        if (res.success && res.data) {
          const poster = res.data;
          if (poster.formData) setFormData(poster.formData);
          if (poster.topLeadersPhotos) setTopLeaders(poster.topLeadersPhotos);
          if (poster.candidatePhotoUrl) setCandidatePhotoUrl(poster.candidatePhotoUrl);
          if (poster.partySymbolUrl) setPartySymbolUrl(poster.partySymbolUrl);
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
    setGenerating(true);
    setSuccessMessage('');

    try {
      let activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('poster_token') : null) || '';
      if (!activeToken) {
        await demoLogin();
        activeToken = (typeof window !== 'undefined' ? localStorage.getItem('poster_token') : null) || '';
      }

      const res = await api.createPoster(
        {
          templateId: selectedTemplate?._id || '6ac0db71196f4286716d1f46',
          formData,
          topLeadersPhotos: topLeaders,
          candidatePhotoUrl,
          partySymbolUrl,
          aiEnhanced: true,
        },
        activeToken || ''
      );

      if (res.success) {
        setSuccessMessage('পোস্টারটি সফলভাবে তৈরি ও আপনার হিস্ট্রিতে সংরক্ষিত হয়েছে!');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Save error';
      console.error('Save error:', msg);
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
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 transition-all font-bengali disabled:opacity-50 active:scale-95"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>পোস্টার হিস্ট্রিতে সেভ করুন</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-700 dark:text-emerald-400 text-sm font-bengali font-bold">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
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
              onUploadCustomSymbol={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (e.target?.result) setPartySymbolUrl(e.target.result as string);
                };
                reader.readAsDataURL(file);
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
              onUploadLeaderPhoto={(idx, file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (e.target?.result) {
                    setTopLeaders((prev) => {
                      const updated = [...prev];
                      updated[idx] = { ...updated[idx], url: e.target?.result as string };
                      return updated;
                    });
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
          </div>

          {/* Candidate Information Form */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bengali flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bengali font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bengali font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bengali font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bengali focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bengali focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              লাইভ প্রিভিউ (রিয়েল-টাইম)
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              ১২০০×১৬০০px Print Ready
            </span>
          </div>

          <div className="w-full flex justify-center bg-white dark:bg-slate-900/60 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-inner overflow-x-auto">
            <PosterCanvas
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
    </div>
  );
};
