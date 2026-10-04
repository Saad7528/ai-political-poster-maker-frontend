'use client';

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ITemplate, IPosterFormData, ITopLeader, PosterArchetype, ICandidatePhotoAdjustments } from '@/types';
import { BANGLADESHI_POLITICAL_PARTIES } from '@/data/politicalParties';
import { Download, FileText, ZoomIn, ZoomOut, Move, Edit3, Check, Sparkles, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

export interface PosterCanvasHandle {
  getSnapshotUrl: () => Promise<string>;
}

interface PosterCanvasProps {
  template?: ITemplate | null;
  formData: IPosterFormData;
  topLeaders: (ITopLeader & { scale?: number; posY?: number; posX?: number })[];
  candidatePhotoUrl?: string;
  partySymbolUrl?: string;
  candidateAdjustments?: ICandidatePhotoAdjustments;
  onUpdateFormData?: (updates: Partial<IPosterFormData>) => void;
  onUpdateCandidateAdjustments?: (updates: Partial<ICandidatePhotoAdjustments>) => void;
  onUpdateTopLeader?: (index: number, updates: Partial<ITopLeader & { scale?: number; posY?: number; posX?: number }>) => void;
  onExportSuccess?: (url: string) => void;
}

export const PosterCanvas = forwardRef<PosterCanvasHandle, PosterCanvasProps>(({
  template,
  formData,
  topLeaders,
  candidatePhotoUrl,
  partySymbolUrl,
  candidateAdjustments = {
    scale: 1.85,
    posX: 0,
    posY: 25,
    frameStyle: 'cutout',
    enableGlow: true,
  },
  onUpdateFormData,
  onUpdateCandidateAdjustments,
  onUpdateTopLeader,
}, ref) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [viewScale, setViewScale] = useState<number>(0.72);

  // Auto-fit scale based on device viewport width
  useEffect(() => {
    const updateScaleForViewport = () => {
      if (typeof window === 'undefined') return;
      const width = window.innerWidth;
      if (width < 380) {
        setViewScale(0.48);
      } else if (width < 480) {
        setViewScale(0.54);
      } else if (width < 640) {
        setViewScale(0.60);
      } else if (width < 1024) {
        setViewScale(0.68);
      } else {
        setViewScale(0.72);
      }
    };

    updateScaleForViewport();
    window.addEventListener('resize', updateScaleForViewport);
    return () => window.removeEventListener('resize', updateScaleForViewport);
  }, []);

  const [editingField, setEditingField] = useState<string | null>(null);

  const [isDraggingCandidate, setIsDraggingCandidate] = useState(false);
  const [draggingLeaderIdx, setDraggingLeaderIdx] = useState<number | null>(null);
  const [isDraggingHeadline, setIsDraggingHeadline] = useState(false);
  const [isDraggingSlogan, setIsDraggingSlogan] = useState(false);
  const [isDraggingSymbol, setIsDraggingSymbol] = useState(false);
  const [isDraggingFooter, setIsDraggingFooter] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number; initialPosX: number; initialPosY: number }>({
    x: 0,
    y: 0,
    initialPosX: 0,
    initialPosY: 0,
  });

  const [activeControl, setActiveControl] = useState<'candidate' | 'leaders' | 'headline' | 'slogan' | 'symbol' | 'footer' | null>(null);

  const selectedParty = BANGLADESHI_POLITICAL_PARTIES.find(
    (p) => p.id === formData.selectedPartyKey
  ) || BANGLADESHI_POLITICAL_PARTIES[0];

  const archetype: PosterArchetype = formData.archetype || template?.archetype || 'gemini_ai_masterpiece';

  const isMasterpiece = archetype === 'gemini_ai_masterpiece';
  const isBWP = archetype === 'bwp_election';
  const isEid = archetype === 'festive_eid_greeting';
  const isAnniversary = archetype === 'party_anniversary';
  const isJamaat = archetype === 'jamaat_insaf';
  const templateConfig = template?.layoutConfig;
  const templateColors = templateConfig?.colorScheme;
  const occasion = template?.occasionType;

  const bgTheme = formData.canvasBgTheme || (isBWP ? 'classic_bw' : 'dark_green');
  const isTemplateTheme = !!templateColors?.background && (!formData.canvasBgTheme || formData.canvasBgTheme === 'dark_green');

  const colors = isBWP || bgTheme === 'classic_bw'
    ? {
        primary: '#18181b',
        secondary: '#27272a',
        accent: '#ffffff',
        background: '#ffffff',
        footerBg: '#09090b',
        headerTextColor: '#000000',
        bodyTextColor: '#18181b',
        isLight: true,
      }
    : isTemplateTheme && templateColors
    ? {
        primary: templateColors.primary || selectedParty.primaryColor || '#006a4e',
        secondary: templateColors.secondary || selectedParty.secondaryColor || '#dc2626',
        accent: templateColors.accent || selectedParty.accentColor || '#ffd700',
        background: templateColors.background || '#042f2e',
        footerBg: templateColors.footerBg || '#021814',
        headerTextColor: templateColors.headerTextColor || '#ffffff',
        bodyTextColor: templateColors.bodyTextColor || '#ffffff',
        isLight: false,
      }
    : bgTheme === 'clean_white'
    ? {
        primary: selectedParty.primaryColor || '#059669',
        secondary: selectedParty.secondaryColor || '#dc2626',
        accent: selectedParty.accentColor || '#d97706',
        background: '#f8fafc',
        footerBg: '#0f172a',
        headerTextColor: '#0f172a',
        bodyTextColor: '#1e293b',
        isLight: true,
      }
    : bgTheme === 'royal_emerald'
    ? {
        primary: '#059669',
        secondary: '#dc2626',
        accent: '#fbbf24',
        background: '#064e3b',
        footerBg: '#022c22',
        headerTextColor: '#ffffff',
        bodyTextColor: '#ffffff',
        isLight: false,
      }
    : bgTheme === 'national_red_green'
    ? {
        primary: '#006a4e',
        secondary: '#f42a41',
        accent: '#fbbf24',
        background: '#022c22',
        footerBg: '#881337',
        headerTextColor: '#ffffff',
        bodyTextColor: '#ffffff',
        isLight: false,
      }
    : {
        primary: selectedParty.primaryColor || '#006a4e',
        secondary: selectedParty.secondaryColor || '#dc2626',
        accent: selectedParty.accentColor || '#fbbf24',
        background: isEid ? '#022c22' : isAnniversary ? '#381404' : isJamaat ? '#064e3b' : '#042f2e',
        footerBg: '#021814',
        headerTextColor: '#ffffff',
        bodyTextColor: '#ffffff',
        isLight: false,
      };

  const handleCandidateMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveControl('candidate');
    setIsDraggingCandidate(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      initialPosX: candidateAdjustments.posX || 0,
      initialPosY: candidateAdjustments.posY || 0,
    };
  };

  const handleLeaderMouseDown = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    setActiveControl('leaders');
    setDraggingLeaderIdx(idx);
    const leader = topLeaders[idx] || { posX: 0, posY: 0 };
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      initialPosX: leader.posX || 0,
      initialPosY: leader.posY || 0,
    };
  };

  const handleHeadlineMouseDown = (e: React.MouseEvent) => {
    if (editingField === 'headline' || editingField === 'subheadline') return;
    e.preventDefault();
    setActiveControl('headline');
    setIsDraggingHeadline(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      initialPosX: formData.headlinePosX || 0,
      initialPosY: formData.headlinePosY || 0,
    };
  };

  const handleSloganMouseDown = (e: React.MouseEvent) => {
    if (editingField === 'slogan') return;
    e.preventDefault();
    setActiveControl('slogan');
    setIsDraggingSlogan(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      initialPosX: formData.sloganPosX || 0,
      initialPosY: formData.sloganPosY || 0,
    };
  };

  const handleSymbolMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveControl('symbol');
    setIsDraggingSymbol(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      initialPosX: formData.symbolPosX || 0,
      initialPosY: formData.symbolPosY || 0,
    };
  };

  const handleFooterMouseDown = (e: React.MouseEvent) => {
    if (editingField === 'candidateName' || editingField === 'designation' || editingField === 'creditLine') return;
    setActiveControl('footer');
    setIsDraggingFooter(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      initialPosX: formData.footerPosX || 0,
      initialPosY: formData.footerPosY || 0,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingCandidate && onUpdateCandidateAdjustments) {
        const dx = (e.clientX - dragStartPos.current.x) / viewScale;
        const dy = (e.clientY - dragStartPos.current.y) / viewScale;
        onUpdateCandidateAdjustments({
          posX: Math.round(dragStartPos.current.initialPosX + dx),
          posY: Math.round(dragStartPos.current.initialPosY + dy),
        });
      } else if (draggingLeaderIdx !== null && onUpdateTopLeader) {
        const dx = (e.clientX - dragStartPos.current.x) / viewScale;
        const dy = (e.clientY - dragStartPos.current.y) / viewScale;
        onUpdateTopLeader(draggingLeaderIdx, {
          posX: Math.round(dragStartPos.current.initialPosX + dx),
          posY: Math.round(dragStartPos.current.initialPosY + dy),
        });
      } else if (isDraggingHeadline && onUpdateFormData) {
        const dx = (e.clientX - dragStartPos.current.x) / viewScale;
        const dy = (e.clientY - dragStartPos.current.y) / viewScale;
        onUpdateFormData({
          headlinePosX: Math.round(dragStartPos.current.initialPosX + dx),
          headlinePosY: Math.round(dragStartPos.current.initialPosY + dy),
        });
      } else if (isDraggingSlogan && onUpdateFormData) {
        const dx = (e.clientX - dragStartPos.current.x) / viewScale;
        const dy = (e.clientY - dragStartPos.current.y) / viewScale;
        onUpdateFormData({
          sloganPosX: Math.round(dragStartPos.current.initialPosX + dx),
          sloganPosY: Math.round(dragStartPos.current.initialPosY + dy),
        });
      } else if (isDraggingSymbol && onUpdateFormData) {
        const dx = (e.clientX - dragStartPos.current.x) / viewScale;
        const dy = (e.clientY - dragStartPos.current.y) / viewScale;
        onUpdateFormData({
          symbolPosX: Math.round(dragStartPos.current.initialPosX + dx),
          symbolPosY: Math.round(dragStartPos.current.initialPosY + dy),
        });
      } else if (isDraggingFooter && onUpdateFormData) {
        const dx = (e.clientX - dragStartPos.current.x) / viewScale;
        const dy = (e.clientY - dragStartPos.current.y) / viewScale;
        onUpdateFormData({
          footerPosX: Math.round(dragStartPos.current.initialPosX + dx),
          footerPosY: Math.round(dragStartPos.current.initialPosY + dy),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingCandidate(false);
      setDraggingLeaderIdx(null);
      setIsDraggingHeadline(false);
      setIsDraggingSlogan(false);
      setIsDraggingSymbol(false);
      setIsDraggingFooter(false);
    };

    if (
      isDraggingCandidate ||
      draggingLeaderIdx !== null ||
      isDraggingHeadline ||
      isDraggingSlogan ||
      isDraggingSymbol ||
      isDraggingFooter
    ) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDraggingCandidate,
    draggingLeaderIdx,
    isDraggingHeadline,
    isDraggingSlogan,
    isDraggingSymbol,
    isDraggingFooter,
    viewScale,
    onUpdateCandidateAdjustments,
    onUpdateTopLeader,
    onUpdateFormData,
  ]);

  useImperativeHandle(ref, () => ({
    getSnapshotUrl: async () => {
      if (!posterRef.current) return '';
      const originalTransform = posterRef.current.style.transform;
      try {
        posterRef.current.style.transform = 'scale(1)';
        const dataUrl = await toPng(posterRef.current, {
          width: 600,
          height: 800,
          canvasWidth: 600,
          canvasHeight: 800,
          pixelRatio: 1.0,
          quality: 0.85,
          backgroundColor: colors.background,
        });
        return dataUrl;
      } catch (err) {
        console.error('Snapshot failed:', err);
        return '';
      } finally {
        if (posterRef.current) {
          posterRef.current.style.transform = originalTransform;
        }
      }
    },
  }));

  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Exact 1200x1600 Pixel High-Definition PNG Export
  const handleClientDownloadPNG = async () => {
    if (!posterRef.current || isExportingPNG) return;
    setIsExportingPNG(true);
    try {
      const originalTransform = posterRef.current.style.transform;
      posterRef.current.style.transform = 'scale(1)';

      const dataUrl = await toPng(posterRef.current, {
        width: 600,
        height: 800,
        canvasWidth: 1200,
        canvasHeight: 1600,
        pixelRatio: 2.0,
        quality: 1.0,
        backgroundColor: colors.background,
      });

      posterRef.current.style.transform = originalTransform;

      const link = document.createElement('a');
      link.download = `political-poster-1200x1600-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: unknown) {
      console.error('PNG export failed:', err);
    } finally {
      setIsExportingPNG(false);
    }
  };

  // Exact 1200x1600 Full-Bleed Edge-to-Edge PDF Print Export
  const handleClientDownloadPDF = async () => {
    if (!posterRef.current || isExportingPDF) return;
    setIsExportingPDF(true);
    try {
      const originalTransform = posterRef.current.style.transform;
      posterRef.current.style.transform = 'scale(1)';

      const dataUrl = await toPng(posterRef.current, {
        width: 600,
        height: 800,
        canvasWidth: 1200,
        canvasHeight: 1600,
        pixelRatio: 2.0,
        quality: 1.0,
        backgroundColor: colors.background,
      });

      posterRef.current.style.transform = originalTransform;

      // 600x800 pt (1200x1600px @ 2x) Exact Full-Bleed PDF Page (Zero White Gaps)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [600, 800],
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, 600, 800, undefined, 'FAST');
      pdf.save(`political-poster-1200x1600-${Date.now()}.pdf`);
    } catch (err: unknown) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const symbolToDisplay =
    formData.customPartySymbolUrl || partySymbolUrl || selectedParty.symbolUrl;

  return (
    <div
      onClick={() => setActiveControl(null)}
      className="flex flex-col items-center select-none"
    >
      {/* Zoom and Controls Toolbar */}
      <div className="flex items-center justify-between w-full max-w-[600px] mb-3 px-3 py-2 rounded-2xl bg-white dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bengali shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewScale((s) => Math.max(0.45, s - 0.05))}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="জুম আউট"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200">{Math.round(viewScale * 100)}%</span>
          <button
            onClick={() => setViewScale((s) => Math.min(1.1, s + 0.05))}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="জুম ইন"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClientDownloadPNG}
            disabled={isExportingPNG}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 active:scale-95"
          >
            {isExportingPNG ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>HD PNG</span>
          </button>

          <button
            onClick={handleClientDownloadPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 font-bold text-xs transition-all disabled:opacity-50 active:scale-95"
          >
            {isExportingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Main 600x800 Scaled Poster DOM Container */}
      <div
        style={{
          width: `${600 * viewScale}px`,
          height: `${800 * viewScale}px`,
        }}
        className="relative overflow-hidden transition-all duration-150 ease-out shadow-2xl rounded-2xl border-4 border-amber-400/40"
      >
        <div
          ref={posterRef}
          style={{
            transform: `scale(${viewScale})`,
            transformOrigin: 'top left',
            backgroundColor: colors.background,
            color: colors.bodyTextColor,
          }}
          className={`w-[600px] h-[800px] relative overflow-hidden font-sans select-none flex flex-col justify-between ${isBWP ? 'bg-white text-black' : ''
            }`}
        >
          {/* Border Motifs */}
          <div className="absolute inset-2 border-2 border-amber-400/60 rounded-xl pointer-events-none z-20" />
          <div className="absolute inset-3 border border-amber-300/40 rounded-lg pointer-events-none z-20" />

          {/* Visual Occasion Specific Background Accents */}
          {occasion === 'shok_dibosh' && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/35 to-black pointer-events-none z-0">
              <div className="absolute top-16 right-6 text-4xl opacity-20">🕯️</div>
              <div className="absolute top-16 left-6 text-4xl opacity-15">🖤</div>
            </div>
          )}

          {occasion === 'pohela_boishakh' && (
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0">
              <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-amber-400/20 blur-2xl" />
              <div className="absolute top-16 right-6 text-3xl opacity-25">🌺</div>
              <div className="absolute bottom-20 left-6 text-3xl opacity-20">🎨</div>
            </div>
          )}

          {occasion === 'eid_celebration' && (
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 via-transparent to-black/75 pointer-events-none z-0">
              <div className="absolute -top-12 -left-12 w-52 h-52 rounded-full bg-amber-400/15 blur-3xl" />
              <div className="absolute top-14 right-8 text-4xl opacity-40">🌙</div>
              <div className="absolute top-16 right-16 text-sm text-amber-300/40">✨</div>
            </div>
          )}

          {occasion === 'bijoy_dibosh' && (
            <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full bg-rose-600/35 blur-2xl" />
            </div>
          )}

          {occasion === 'ekushey_february' && (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-zinc-900 to-black pointer-events-none z-0">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-rose-600/20 blur-2xl" />
              <div className="absolute top-16 right-8 text-3xl opacity-20">অ আ ক খ</div>
            </div>
          )}

          {occasion === 'election_campaign' && (
            <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-blue-950/30 pointer-events-none z-0" />
          )}

          {colors.background === '#2e1065' && (
            <div className="absolute inset-0 bg-gradient-to-b from-purple-950/60 via-transparent to-black/70 pointer-events-none z-0">
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-pink-500/20 blur-3xl" />
            </div>
          )}

          {/* 1. TOP HEADER ROW (Top Leaders) */}
          <div className="relative z-10 pt-4 px-6">
            <div className="flex items-center justify-between mb-2 gap-1.5">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingField('leftHeaderBadge');
                }}
                className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-black font-bengali shadow border truncate max-w-[165px] cursor-pointer hover:ring-1 hover:ring-amber-300 ${
                  occasion === 'shok_dibosh'
                    ? 'bg-zinc-900 text-white border-zinc-500'
                    : occasion === 'pohela_boishakh'
                    ? 'bg-red-800 text-amber-200 border-amber-400'
                    : occasion === 'eid_celebration'
                    ? 'bg-emerald-900 text-amber-200 border-amber-400'
                    : occasion === 'ekushey_february'
                    ? 'bg-zinc-900 text-rose-200 border-rose-600'
                    : occasion === 'election_campaign'
                    ? 'bg-blue-900 text-amber-300 border-amber-400'
                    : colors.background === '#2e1065'
                    ? 'bg-purple-900 text-amber-200 border-amber-400'
                    : 'bg-rose-700/90 text-white border-amber-400/40'
                }`}
                title="স্লোগান এডিট করতে ক্লিক করুন"
              >
                {editingField === 'leftHeaderBadge' ? (
                  <input
                    autoFocus
                    type="text"
                    value={formData.leftHeaderBadge || ''}
                    placeholder="জনতার অধিকার, জনতার দেশ"
                    onChange={(e) => onUpdateFormData && onUpdateFormData({ leftHeaderBadge: e.target.value })}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                    className="w-full bg-transparent text-center text-white focus:outline-none font-bengali text-[9.5px]"
                  />
                ) : (
                  formData.leftHeaderBadge || 'জনতার অধিকার, জনতার দেশ'
                )}
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingField('religiousHeader');
                }}
                className="px-3.5 py-0.5 rounded-full text-[11px] font-bold font-bengali text-amber-200 bg-black/75 border border-amber-400/70 shadow-md flex-shrink-0 cursor-pointer hover:ring-1 hover:ring-amber-300"
                title="হেডার এডিট করতে ক্লিক করুন"
              >
                {editingField === 'religiousHeader' ? (
                  <input
                    autoFocus
                    type="text"
                    value={formData.religiousHeader ?? selectedParty.religiousHeader ?? 'বিসমিল্লাহির রাহমানির রাহিম'}
                    onChange={(e) => onUpdateFormData && onUpdateFormData({ religiousHeader: e.target.value })}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                    className="w-full bg-transparent text-center text-amber-200 focus:outline-none font-bengali text-[11px]"
                  />
                ) : (
                  formData.religiousHeader || selectedParty.religiousHeader || 'বিসমিল্লাহির রাহমানির রাহিম'
                )}
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingField('rightHeaderBadge');
                }}
                className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-black font-bengali shadow border truncate max-w-[165px] cursor-pointer hover:ring-1 hover:ring-amber-300 ${
                  occasion === 'shok_dibosh'
                    ? 'bg-zinc-900 text-white border-zinc-500'
                    : occasion === 'pohela_boishakh'
                    ? 'bg-red-700 text-amber-200 border-amber-400'
                    : occasion === 'eid_celebration'
                    ? 'bg-emerald-800 text-amber-200 border-amber-400'
                    : occasion === 'ekushey_february'
                    ? 'bg-zinc-900 text-rose-200 border-rose-600'
                    : occasion === 'election_campaign'
                    ? 'bg-blue-800 text-amber-300 border-amber-400'
                    : colors.background === '#2e1065'
                    ? 'bg-purple-800 text-amber-200 border-amber-400'
                    : 'bg-rose-600 text-white border-amber-400/40'
                }`}
                title="স্লোগান এডিট করতে ক্লিক করুন"
              >
                {editingField === 'rightHeaderBadge' ? (
                  <input
                    autoFocus
                    type="text"
                    value={formData.rightHeaderBadge || ''}
                    placeholder={selectedParty.partySloganBadge || 'বাংলাদেশ জিন্দাবাদ'}
                    onChange={(e) => onUpdateFormData && onUpdateFormData({ rightHeaderBadge: e.target.value })}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                    className="w-full bg-transparent text-center text-white focus:outline-none font-bengali text-[9.5px]"
                  />
                ) : (
                  formData.rightHeaderBadge || selectedParty.partySloganBadge || 'বাংলাদেশ জিন্দাবাদ'
                )}
              </div>
            </div>

            {/* Top Leaders Row (Supports 1-4 Leaders) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setActiveControl(activeControl === 'leaders' ? null : 'leaders');
              }}
              className="relative group/leaders flex items-center justify-around gap-2 pt-1 pb-2 px-1"
            >
              {/* Quick controls on canvas hover / active click for top leaders */}
              <div
                className={`absolute -top-4 left-1/2 -translate-x-1/2 ${
                  activeControl === 'leaders' ? 'flex ring-2 ring-amber-400' : 'hidden group-hover/leaders:flex'
                } items-center gap-1.5 z-30 bg-slate-900/98 border border-amber-400/90 px-3 py-1 rounded-full shadow-2xl text-[10px] font-bold text-amber-300 whitespace-nowrap`}
              >
                <span>ফ্রেম:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const cur = formData.leadersFrameSize || 64;
                    onUpdateFormData && onUpdateFormData({ leadersFrameSize: Math.max(40, cur - 6) });
                  }}
                  className="px-1 py-0.5 rounded hover:bg-white/20 text-white font-bold"
                  title="মেডেলিয়ন ফ্রেম ছোট করুন"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const cur = formData.leadersFrameSize || 64;
                    onUpdateFormData && onUpdateFormData({ leadersFrameSize: Math.min(140, cur + 6) });
                  }}
                  className="px-1 py-0.5 rounded hover:bg-white/20 text-white font-bold"
                  title="মেডেলিয়ন ফ্রেম বড় করুন"
                >
                  +
                </button>
                <span className="text-amber-400/40">|</span>
                <span>টেক্সট:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const cur = formData.leaderTextSize || 9;
                    onUpdateFormData && onUpdateFormData({ leaderTextSize: Math.max(7, cur - 0.5) });
                  }}
                  className="px-1 py-0.5 rounded hover:bg-white/20 text-white font-bold"
                  title="নাম ও পদবীর ফন্ট ছোট করুন"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const cur = formData.leaderTextSize || 9;
                    onUpdateFormData && onUpdateFormData({ leaderTextSize: Math.min(14, cur + 0.5) });
                  }}
                  className="px-1 py-0.5 rounded hover:bg-white/20 text-white font-bold"
                  title="নাম ও পদবীর ফন্ট বড় করুন"
                >
                  +
                </button>
                {(topLeaders.some(l => (l.posX && l.posX !== 0) || (l.posY && l.posY !== 0)) || (formData.leadersFrameSize && formData.leadersFrameSize !== 64) || (formData.leaderTextSize && formData.leaderTextSize !== 9)) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      topLeaders.forEach((_, i) => {
                        onUpdateTopLeader && onUpdateTopLeader(i, { posX: 0, posY: 0 });
                      });
                      onUpdateFormData && onUpdateFormData({ leadersFrameSize: 64, leaderTextSize: 9 });
                    }}
                    className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold"
                    title="নেতাদের ছবির পজিশন ও সাইজ রিসেট করুন"
                  >
                    ↺ রিসেট
                  </button>
                )}
              </div>

              {topLeaders.slice(0, 4).map((leader, idx) => {
                const totalCount = Math.min(topLeaders.length, 4);
                const isCenter = totalCount === 3 && idx === 1;
                const baseSize = formData.leadersFrameSize || (totalCount === 4 ? 56 : isCenter ? 76 : 64);
                const sizePx = isCenter ? baseSize + 12 : baseSize;
                const nameFontSize = formData.leaderTextSize || 9;
                const titleFontSize = Math.max(6.5, (formData.leaderTextSize || 9) - 1.5);

                return (
                  <div key={idx} className="flex flex-col items-center group flex-1 min-w-0 max-w-[200px] px-1">
                    <div
                      onMouseDown={(e) => leader.url && handleLeaderMouseDown(e, idx)}
                      style={{
                        width: `${sizePx}px`,
                        height: `${sizePx}px`,
                      }}
                      className={`relative rounded-full overflow-hidden shadow-xl border-2 border-amber-400 bg-slate-900 cursor-grab active:cursor-grabbing flex items-center justify-center flex-shrink-0 ${isCenter ? 'ring-4 ring-rose-600/80 -mt-1' : 'ring-2 ring-amber-400/60'
                        }`}
                      title={leader.url ? 'ক্যানভাসে টেনে পজিশন পরিবর্তন করুন' : undefined}
                    >
                      {leader.url ? (
                        <img
                          src={leader.url}
                          alt={leader.name}
                          style={{
                            transform: `scale(${leader.scale || 1}) translate(${leader.posX || 0}px, ${leader.posY || 0}px)`,
                          }}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 font-bengali text-center px-1 leading-tight">
                          {leader.name ? leader.name.split(' ')[0] : `নেতা ${idx + 1}`}
                        </span>
                      )}
                    </div>

                    {/* Leader Name (Dynamic Auto-Sizing Pill - No Ellipsis Truncation) */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingField(`leader_${idx}`);
                      }}
                      style={{ fontSize: `${nameFontSize}px` }}
                      className="mt-1 px-3 py-0.5 rounded-full text-center font-bold font-bengali bg-slate-900/95 text-amber-200 border border-amber-400/60 cursor-pointer hover:ring-1 hover:ring-amber-400 shadow-md whitespace-nowrap w-auto max-w-[190px] overflow-visible"
                    >
                      {editingField === `leader_${idx}` ? (
                        <input
                          autoFocus
                          type="text"
                          value={leader.name || ''}
                          onChange={(e) => onUpdateTopLeader && onUpdateTopLeader(idx, { name: e.target.value })}
                          onBlur={() => setEditingField(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                          className="w-full bg-transparent text-center text-white focus:outline-none font-bengali min-w-[60px]"
                          style={{ fontSize: `${nameFontSize}px` }}
                        />
                      ) : (
                        leader.name || `নেতা ${idx + 1}`
                      )}
                    </div>

                    {/* Optional Leader Title / Designation */}
                    {formData.showLeaderTitles !== false && (leader.title || editingField === `leader_title_${idx}`) && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingField(`leader_title_${idx}`);
                        }}
                        style={{ fontSize: `${titleFontSize}px` }}
                        className="mt-0.5 px-2 py-0.2 rounded text-center font-medium font-bengali bg-black/70 text-slate-200 border border-amber-400/40 cursor-pointer hover:ring-1 hover:ring-amber-400 whitespace-nowrap w-auto max-w-[185px] overflow-visible"
                      >
                        {editingField === `leader_title_${idx}` ? (
                          <input
                            autoFocus
                            type="text"
                            value={leader.title || ''}
                            onChange={(e) => onUpdateTopLeader && onUpdateTopLeader(idx, { title: e.target.value })}
                            onBlur={() => setEditingField(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                            className="w-full bg-transparent text-center text-amber-300 focus:outline-none font-bengali min-w-[50px]"
                            style={{ fontSize: `${titleFontSize}px` }}
                          />
                        ) : (
                          leader.title
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. MIDDLE SECTION: Headings & Candidate Photo */}
          <div className="relative z-10 flex-1 flex flex-col justify-between px-6 pt-1">
            {/* Headline Ribbon with Dragging and 1-Click Reset */}
            <div
              onMouseDown={handleHeadlineMouseDown}
              onClick={(e) => {
                e.stopPropagation();
                setActiveControl(activeControl === 'headline' ? null : 'headline');
              }}
              style={{
                transform: `translate(${formData.headlinePosX || 0}px, ${formData.headlinePosY || 0}px)`,
              }}
              className="text-center space-y-1 relative group/headline cursor-grab active:cursor-grabbing select-none"
              title="মাউস দিয়ে টেনে হেডলাইনের স্থান পরিবর্তন করুন"
            >
              {/* Reset headline position button */}
              {((formData.headlinePosX && formData.headlinePosX !== 0) || (formData.headlinePosY && formData.headlinePosY !== 0)) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateFormData && onUpdateFormData({ headlinePosX: 0, headlinePosY: 0 });
                  }}
                  className="absolute -top-3.5 right-2 z-30 bg-slate-900/95 border border-amber-400/80 px-2 py-0.5 rounded-full shadow-lg text-[9px] font-bold text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                  title="হেডলাইনের পজিশন রিসেট করুন"
                >
                  ↺ হেডলাইন রিসেট
                </button>
              )}

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingField('headline');
                }}
                className={`px-4 py-2 rounded-2xl border-2 shadow-xl cursor-pointer hover:brightness-110 ${
                  occasion === 'shok_dibosh'
                    ? 'bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-zinc-400'
                    : occasion === 'pohela_boishakh'
                    ? 'bg-gradient-to-r from-red-800 via-rose-700 to-red-800 border-amber-400'
                    : occasion === 'eid_celebration'
                    ? 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 border-amber-400'
                    : occasion === 'ekushey_february'
                    ? 'bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-rose-600/80'
                    : occasion === 'election_campaign'
                    ? 'bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 border-amber-400'
                    : colors.background === '#2e1065'
                    ? 'bg-gradient-to-r from-purple-900 via-fuchsia-800 to-purple-900 border-amber-300'
                    : colors.background === '#381404'
                    ? 'bg-gradient-to-r from-amber-950 via-red-950 to-amber-950 border-amber-400'
                    : 'bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 border-amber-400'
                }`}
              >
                {editingField === 'headline' ? (
                  <input
                    autoFocus
                    type="text"
                    value={formData.headline}
                    onChange={(e) => onUpdateFormData && onUpdateFormData({ headline: e.target.value })}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                    className="w-full bg-transparent text-center text-white font-black text-xl sm:text-2xl font-bengali focus:outline-none"
                  />
                ) : (
                  <h2 className="text-xl sm:text-2xl font-black text-white font-bengali tracking-tight drop-shadow-md">
                    {formData.headline}
                  </h2>
                )}
              </div>

              {/* Subheadline */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingField('subheadline');
                }}
                className="cursor-pointer hover:opacity-80"
              >
                {editingField === 'subheadline' ? (
                  <input
                    autoFocus
                    type="text"
                    value={formData.subheadline}
                    onChange={(e) => onUpdateFormData && onUpdateFormData({ subheadline: e.target.value })}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                    className="w-full bg-transparent text-center font-bold text-xs font-bengali focus:outline-none"
                    style={{ color: colors.accent || '#fde047' }}
                  />
                ) : (
                  <p
                    className="text-xs font-bold font-bengali drop-shadow"
                    style={{ color: colors.accent || '#fde047' }}
                  >
                    {formData.subheadline}
                  </p>
                )}
              </div>
            </div>

            {/* Candidate Photo Stage (Interactive Drag & Frame Modes) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setActiveControl(activeControl === 'candidate' ? null : 'candidate');
              }}
              className="relative group/candidate flex-1 flex items-end justify-center min-h-[210px] my-1"
            >
              {/* Quick controls on canvas hover / active click for candidate frame */}
              <div
                className={`absolute -top-4 left-1/2 -translate-x-1/2 ${
                  activeControl === 'candidate' ? 'flex ring-2 ring-amber-400' : 'hidden group-hover/candidate:flex'
                } items-center gap-1.5 z-30 bg-slate-900/98 border border-amber-400/90 px-3 py-1 rounded-full shadow-2xl text-[10px] font-bold text-amber-300 whitespace-nowrap`}
              >
                <span>প্রার্থীর ফ্রেম:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const cur = candidateAdjustments.frameSize || 180;
                    onUpdateCandidateAdjustments &&
                      onUpdateCandidateAdjustments({ frameSize: Math.max(100, cur - 20) });
                  }}
                  className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 text-white font-black"
                  title="প্রার্থীর ফ্রেম ছোট করুন"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const cur = candidateAdjustments.frameSize || 180;
                    onUpdateCandidateAdjustments &&
                      onUpdateCandidateAdjustments({ frameSize: Math.min(480, cur + 20) });
                  }}
                  className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 text-white font-black"
                  title="প্রার্থীর ফ্রেম বড় করুন"
                >
                  +
                </button>
                {((candidateAdjustments.posX && candidateAdjustments.posX !== 0) || (candidateAdjustments.posY !== undefined && candidateAdjustments.posY !== 25 && candidateAdjustments.posY !== 0)) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateCandidateAdjustments &&
                        onUpdateCandidateAdjustments({ posX: 0, posY: candidateAdjustments.frameStyle === 'cutout' ? 25 : 0 });
                    }}
                    className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold"
                    title="প্রার্থীর ছবির পজিশন রিসেট করুন"
                  >
                    ↺ রিসেট
                  </button>
                )}
              </div>

              {candidatePhotoUrl ? (
                <>
                  {candidateAdjustments.frameStyle === 'circle' ? (
                    <div
                      onMouseDown={handleCandidateMouseDown}
                      style={{
                        width: `${candidateAdjustments.frameSize || 180}px`,
                        height: `${candidateAdjustments.frameSize || 180}px`,
                      }}
                      className="rounded-full border-4 border-amber-400 overflow-hidden bg-slate-900/80 shadow-2xl ring-4 ring-amber-400/30 flex items-center justify-center cursor-grab active:cursor-grabbing select-none relative flex-shrink-0"
                      title="মাউস দিয়ে টেনে প্রার্থীর ছবি সরান"
                    >
                      <img
                        src={candidatePhotoUrl}
                        alt={formData.candidateName}
                        style={{
                          transform: `scale(${candidateAdjustments.scale || 1.85}) translate(${candidateAdjustments.posX || 0}px, ${candidateAdjustments.posY || 0}px)`,
                        }}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </div>
                  ) : candidateAdjustments.frameStyle === 'clean_circle' ? (
                    <div
                      onMouseDown={handleCandidateMouseDown}
                      style={{
                        width: `${candidateAdjustments.frameSize || 180}px`,
                        height: `${candidateAdjustments.frameSize || 180}px`,
                      }}
                      className="rounded-full overflow-hidden bg-slate-900/40 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing select-none relative flex-shrink-0"
                      title="মাউস দিয়ে টেনে প্রার্থীর ছবি সরান"
                    >
                      <img
                        src={candidatePhotoUrl}
                        alt={formData.candidateName}
                        style={{
                          transform: `scale(${candidateAdjustments.scale || 1.85}) translate(${candidateAdjustments.posX || 0}px, ${candidateAdjustments.posY || 0}px)`,
                        }}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </div>
                  ) : candidateAdjustments.frameStyle === 'rounded_rect' ? (
                    <div
                      onMouseDown={handleCandidateMouseDown}
                      style={{
                        width: `${candidateAdjustments.frameSize || 180}px`,
                        height: `${Math.round((candidateAdjustments.frameSize || 180) * 1.15)}px`,
                      }}
                      className="rounded-3xl border-4 border-amber-400 overflow-hidden bg-slate-900/80 shadow-2xl ring-4 ring-amber-400/30 flex items-center justify-center cursor-grab active:cursor-grabbing select-none relative flex-shrink-0"
                      title="মাউস দিয়ে টেনে প্রার্থীর ছবি সরান"
                    >
                      <img
                        src={candidatePhotoUrl}
                        alt={formData.candidateName}
                        style={{
                          transform: `scale(${candidateAdjustments.scale || 1.85}) translate(${candidateAdjustments.posX || 0}px, ${candidateAdjustments.posY || 0}px)`,
                        }}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </div>
                  ) : candidateAdjustments.frameStyle === 'arch' ? (
                    <div
                      onMouseDown={handleCandidateMouseDown}
                      style={{
                        width: `${candidateAdjustments.frameSize || 180}px`,
                        height: `${Math.round((candidateAdjustments.frameSize || 180) * 1.12)}px`,
                      }}
                      className="rounded-t-full rounded-b-2xl border-4 border-amber-400 overflow-hidden bg-slate-900/80 shadow-2xl ring-4 ring-amber-400/30 flex items-center justify-center cursor-grab active:cursor-grabbing select-none relative flex-shrink-0"
                      title="মাউস দিয়ে টেনে প্রার্থীর ছবি সরান"
                    >
                      <img
                        src={candidatePhotoUrl}
                        alt={formData.candidateName}
                        style={{
                          transform: `scale(${candidateAdjustments.scale || 1.85}) translate(${candidateAdjustments.posX || 0}px, ${candidateAdjustments.posY || 0}px)`,
                        }}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </div>
                  ) : (
                    /* Natural Cutout Mode */
                    <div
                      onMouseDown={handleCandidateMouseDown}
                      style={{
                        transform: `scale(${candidateAdjustments.scale || 1.85}) translate(${candidateAdjustments.posX || 0}px, ${candidateAdjustments.posY || 25}px)`,
                        transformOrigin: 'bottom center',
                      }}
                      className="relative cursor-grab active:cursor-grabbing select-none max-h-[240px] flex items-end justify-center"
                      title="মাউস দিয়ে টেনে প্রার্থীর ছবি সরান"
                    >
                      <img
                        src={candidatePhotoUrl}
                        alt={formData.candidateName}
                        className="max-h-[240px] object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)] pointer-events-none"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div
                  style={{
                    width: `${candidateAdjustments.frameSize || 180}px`,
                    height: `${candidateAdjustments.frameSize || 180}px`,
                  }}
                  className="rounded-full border-2 border-dashed border-amber-400/50 flex flex-col items-center justify-center text-amber-400/70 p-4 text-center"
                >
                  <span className="text-xs font-bold font-bengali">প্রার্থীর ছবি আপলোড করুন</span>
                </div>
              )}

              {/* Party Symbol Badge with Click-to-Pin Toolbar, Resizing, & 1-Click Reset */}
              {symbolToDisplay && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveControl(activeControl === 'symbol' ? null : 'symbol');
                  }}
                  onMouseDown={handleSymbolMouseDown}
                  style={{
                    transform: `translate(${formData.symbolPosX || 0}px, ${formData.symbolPosY || 0}px)`,
                    width: `${formData.symbolSize || 56}px`,
                    height: `${formData.symbolSize || 56}px`,
                  }}
                  className="absolute right-2 bottom-1 rounded-2xl bg-slate-900/95 border-2 border-amber-400 p-2 shadow-2xl flex items-center justify-center z-20 cursor-grab active:cursor-grabbing group/symbol select-none"
                  title="ক্লিক করে সাইজ কন্ট্রোল চালু করুন বা টেনে প্রতীক সরান"
                >
                  <img src={symbolToDisplay} alt="Symbol" className="w-full h-full object-contain pointer-events-none" />

                  {/* Stable Click-Pinned Controls for Symbol Size & Reset */}
                  <div
                    className={`absolute -top-8 right-0 ${
                      activeControl === 'symbol' ? 'flex ring-2 ring-amber-400' : 'hidden group-hover/symbol:flex'
                    } items-center gap-1 z-30 bg-slate-900/98 border border-amber-400/90 px-2.5 py-1 rounded-full shadow-2xl text-[9.5px] font-bold text-amber-300 whitespace-nowrap`}
                  >
                    <span>প্রতীক:</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const cur = formData.symbolSize || 56;
                        onUpdateFormData && onUpdateFormData({ symbolSize: Math.max(36, cur - 8) });
                      }}
                      className="px-1.5 py-0.5 rounded hover:bg-white/20 text-white font-bold"
                      title="প্রতীক ছোট করুন"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const cur = formData.symbolSize || 56;
                        onUpdateFormData && onUpdateFormData({ symbolSize: Math.min(120, cur + 8) });
                      }}
                      className="px-1.5 py-0.5 rounded hover:bg-white/20 text-white font-bold"
                      title="প্রতীক বড় করুন"
                    >
                      +
                    </button>
                    {((formData.symbolPosX && formData.symbolPosX !== 0) || (formData.symbolPosY && formData.symbolPosY !== 0) || (formData.symbolSize && formData.symbolSize !== 56)) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateFormData && onUpdateFormData({ symbolPosX: 0, symbolPosY: 0, symbolSize: 56 });
                        }}
                        className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold"
                        title="প্রতীক রিসেট করুন"
                      >
                        ↺
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Campaign Slogan (Click-to-Pin Toolbar, Resizable Font, & 1-Click Reset) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setActiveControl(activeControl === 'slogan' ? null : 'slogan');
              }}
              onMouseDown={handleSloganMouseDown}
              style={{
                transform: `translate(${formData.sloganPosX || 0}px, ${formData.sloganPosY || 0}px)`,
              }}
              className={`relative z-20 px-4 py-2 rounded-full border text-center cursor-grab active:cursor-grabbing group/slogan my-1 shadow-lg select-none ${
                occasion === 'shok_dibosh'
                  ? 'bg-zinc-950/95 border-zinc-500'
                  : occasion === 'pohela_boishakh'
                  ? 'bg-red-950/90 border-amber-400'
                  : occasion === 'eid_celebration'
                  ? 'bg-emerald-950/90 border-amber-400'
                  : 'bg-slate-950/95 border-amber-400/80'
              }`}
              title="মাউস দিয়ে টেনে স্লোগান সরান বা ক্লিক করে সাইজ কন্ট্রোল করুন"
            >
              {/* Quick controls for Slogan font size & reset */}
              <div
                className={`absolute -top-4 left-1/2 -translate-x-1/2 ${
                  activeControl === 'slogan' ? 'flex ring-2 ring-amber-400' : 'hidden group-hover/slogan:flex'
                } items-center gap-1.5 z-30 bg-slate-900/98 border border-amber-400/90 px-3 py-1 rounded-full shadow-2xl text-[10px] font-bold text-amber-300 whitespace-nowrap`}
              >
                <span>ফন্ট:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const cur = formData.sloganFontSize || 12;
                    onUpdateFormData && onUpdateFormData({ sloganFontSize: Math.max(9, cur - 1) });
                  }}
                  className="px-1.5 py-0.5 rounded hover:bg-white/20 text-white font-bold"
                  title="স্লোগান ফন্ট ছোট করুন"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const cur = formData.sloganFontSize || 12;
                    onUpdateFormData && onUpdateFormData({ sloganFontSize: Math.min(22, cur + 1) });
                  }}
                  className="px-1.5 py-0.5 rounded hover:bg-white/20 text-white font-bold"
                  title="স্লোগান ফন্ট বড় করুন"
                >
                  +
                </button>
                {((formData.sloganPosX && formData.sloganPosX !== 0) || (formData.sloganPosY && formData.sloganPosY !== 0) || (formData.sloganFontSize && formData.sloganFontSize !== 12)) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateFormData && onUpdateFormData({ sloganPosX: 0, sloganPosY: 0, sloganFontSize: 12 });
                    }}
                    className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold"
                    title="স্লোগান রিসেট করুন"
                  >
                    ↺ রিসেট
                  </button>
                )}
              </div>

              {editingField === 'slogan' ? (
                <input
                  autoFocus
                  type="text"
                  value={formData.slogan}
                  onChange={(e) => onUpdateFormData && onUpdateFormData({ slogan: e.target.value })}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                  className="w-full bg-transparent text-center text-white font-bold font-bengali focus:outline-none"
                  style={{ fontSize: `${formData.sloganFontSize || 12}px` }}
                />
              ) : (
                <p
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingField('slogan');
                  }}
                  style={{ fontSize: `${formData.sloganFontSize || 12}px` }}
                  className="font-bold text-amber-200 font-bengali truncate cursor-pointer hover:underline"
                >
                  {formData.slogan}
                </p>
              )}
            </div>
          </div>

          {/* 3. BOTTOM FOOTER: Candidate Name & Designation (Click-to-Pin Toolbar, Draggable & 1-Click Reset) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setActiveControl(activeControl === 'footer' ? null : 'footer');
            }}
            onMouseDown={handleFooterMouseDown}
            style={{
              transform: `translate(${formData.footerPosX || 0}px, ${formData.footerPosY || 0}px)`,
            }}
            className={`relative z-10 border-t-2 p-4 text-center space-y-1 group/footer cursor-grab active:cursor-grabbing select-none ${
              occasion === 'shok_dibosh'
                ? 'bg-gradient-to-t from-black via-zinc-950/95 to-zinc-950/80 border-zinc-600'
                : occasion === 'pohela_boishakh'
                ? 'bg-gradient-to-t from-red-950 via-red-900/90 to-red-950/80 border-amber-400/60'
                : occasion === 'eid_celebration'
                ? 'bg-gradient-to-t from-black via-emerald-950/95 to-emerald-950/80 border-amber-400/60'
                : 'bg-gradient-to-t from-black via-slate-950/95 to-slate-950/80 border-amber-400/60'
            }`}
            title="মাউস দিয়ে টেনে প্রার্থীর নাম ও পদবী সরান বা ক্লিক করে সাইজ পরিবর্তন করুন"
          >
            {/* Stable Click-Pinned controls on Footer */}
            <div
              className={`absolute -top-4 left-1/2 -translate-x-1/2 ${
                activeControl === 'footer' ? 'flex ring-2 ring-amber-400' : 'hidden group-hover/footer:flex'
              } items-center gap-1.5 z-30 bg-slate-900/98 border border-amber-400/90 px-3 py-1 rounded-full shadow-2xl text-[10px] font-bold text-amber-300 whitespace-nowrap`}
            >
              <span>নাম:</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const cur = formData.candidateNameFontSize || 26;
                  onUpdateFormData && onUpdateFormData({ candidateNameFontSize: Math.max(16, cur - 2) });
                }}
                className="px-1.5 py-0.5 rounded hover:bg-white/20 text-white font-bold"
                title="প্রার্থীর নাম ছোট করুন"
              >
                −
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const cur = formData.candidateNameFontSize || 26;
                  onUpdateFormData && onUpdateFormData({ candidateNameFontSize: Math.min(38, cur + 2) });
                }}
                className="px-1.5 py-0.5 rounded hover:bg-white/20 text-white font-bold"
                title="প্রার্থীর নাম বড় করুন"
              >
                +
              </button>
              <span className="text-amber-400/40">|</span>
              <span>পদবী:</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const cur = formData.designationFontSize || 12;
                  onUpdateFormData && onUpdateFormData({ designationFontSize: Math.max(9, cur - 1) });
                }}
                className="px-1.5 py-0.5 rounded hover:bg-white/20 text-white font-bold"
                title="পদবীর ফন্ট ছোট করুন"
              >
                −
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const cur = formData.designationFontSize || 12;
                  onUpdateFormData && onUpdateFormData({ designationFontSize: Math.min(18, cur + 1) });
                }}
                className="px-1.5 py-0.5 rounded hover:bg-white/20 text-white font-bold"
                title="পদবীর ফন্ট বড় করুন"
              >
                +
              </button>
              {((formData.footerPosX && formData.footerPosX !== 0) || (formData.footerPosY && formData.footerPosY !== 0) || formData.candidateNameFontSize || formData.designationFontSize) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateFormData && onUpdateFormData({
                      footerPosX: 0,
                      footerPosY: 0,
                      candidateNameFontSize: 26,
                      designationFontSize: 12,
                    });
                  }}
                  className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold"
                  title="ফুটার রিসেট করুন"
                >
                  ↺ রিসেট
                </button>
              )}
            </div>

            {/* Candidate Name (3D Gold Look) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setEditingField('candidateName');
              }}
              className="cursor-pointer hover:scale-[1.01] transition-transform"
            >
              {editingField === 'candidateName' ? (
                <input
                  autoFocus
                  type="text"
                  value={formData.candidateName}
                  onChange={(e) => onUpdateFormData && onUpdateFormData({ candidateName: e.target.value })}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                  className="w-full bg-transparent text-center text-white font-black font-bengali focus:outline-none"
                  style={{ fontSize: `${formData.candidateNameFontSize || 26}px` }}
                />
              ) : (
                <h1
                  style={{ fontSize: `${formData.candidateNameFontSize || 26}px` }}
                  className="font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 font-bengali drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight"
                >
                  {formData.candidateName}
                </h1>
              )}
            </div>

            {/* Designation & Organization */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setEditingField('designation');
              }}
              className="cursor-pointer"
            >
              {editingField === 'designation' ? (
                <input
                  autoFocus
                  type="text"
                  value={formData.designation}
                  onChange={(e) => onUpdateFormData && onUpdateFormData({ designation: e.target.value })}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                  className="w-full bg-transparent text-center text-amber-200 font-bold font-bengali focus:outline-none"
                  style={{ fontSize: `${formData.designationFontSize || 12}px` }}
                />
              ) : (
                <p
                  style={{ fontSize: `${formData.designationFontSize || 12}px` }}
                  className="font-bold text-amber-200 font-bengali leading-snug"
                >
                  {formData.designation} — {formData.organizationOrParty}
                </p>
              )}
            </div>

            {/* Credit Line */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setEditingField('creditLine');
              }}
              className="cursor-pointer"
            >
              {editingField === 'creditLine' ? (
                <input
                  autoFocus
                  type="text"
                  value={formData.creditLine}
                  onChange={(e) => onUpdateFormData && onUpdateFormData({ creditLine: e.target.value })}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                  className="w-full bg-transparent text-center text-slate-400 text-[10px] font-bengali focus:outline-none"
                />
              ) : (
                <p className="text-[10px] font-bold text-slate-400 font-bengali">
                  {formData.creditLine}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PosterCanvas.displayName = 'PosterCanvas';
