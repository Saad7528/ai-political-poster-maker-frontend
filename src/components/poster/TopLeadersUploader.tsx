'use client';

import React, { useRef, useState } from 'react';
import { ITopLeader } from '@/types';
import { Crown, Upload, X, Plus, SlidersHorizontal, RotateCcw, UserPlus, Trash2 } from 'lucide-react';

interface TopLeadersUploaderProps {
  topLeaders: (ITopLeader & { scale?: number; posY?: number; posX?: number })[];
  onUpdateLeader: (index: number, leader: Partial<ITopLeader & { scale?: number; posY?: number; posX?: number }>) => void;
  onUploadLeaderPhoto: (index: number, file: File) => void;
  onAddLeader?: () => void;
  onRemoveLeader?: (index: number) => void;
  leadersFrameSize?: number;
  onChangeLeadersFrameSize?: (size: number) => void;
  leaderTextSize?: number;
  onChangeLeaderTextSize?: (size: number) => void;
  showLeaderTitles?: boolean;
  onToggleShowLeaderTitles?: (show: boolean) => void;
}

export const TopLeadersUploader: React.FC<TopLeadersUploaderProps> = ({
  topLeaders,
  onUpdateLeader,
  onUploadLeaderPhoto,
  onAddLeader,
  onRemoveLeader,
  leadersFrameSize = 64,
  onChangeLeadersFrameSize,
  leaderTextSize = 9,
  onChangeLeaderTextSize,
  showLeaderTitles = true,
  onToggleShowLeaderTitles,
}) => {
  const [activeAdjustIndex, setActiveAdjustIndex] = useState<number | null>(null);

  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  return (
    <div className="space-y-4 font-bengali">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            <span>দলের শীর্ষ নেতৃবৃন্দের ছবি ও নাম ({topLeaders.length} জন)</span>
          </label>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            ক্যানভাসে গোল্ডেন মেডেলিয়ন ফ্রেমে বসবে (সরাসরি ড্র্যাগ ও রিসাইজ করা যায়)
          </span>
        </div>

        {/* Add Leader Button (Up to 4 Max) */}
        {topLeaders.length < 4 && onAddLeader && (
          <button
            type="button"
            onClick={onAddLeader}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-bold transition-all shadow-sm active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ নতুন শীর্ষ নেতা যোগ করুন</span>
          </button>
        )}
      </div>

      {/* Leader Frame & Text Settings */}
      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs space-y-3">
        <div className="flex flex-col gap-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>মেডেলিয়ন ফ্রেম সাইজ:</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-black text-xs">
                  {leadersFrameSize}px
                </span>
              </span>
              <div className="flex flex-wrap items-center gap-1">
                {[
                  { label: 'ছোট (৫২px)', size: 52 },
                  { label: 'মাঝারি (৬৪px)', size: 64 },
                  { label: 'বড় (৮০px)', size: 80 },
                  { label: 'বিশাল (১০০px)', size: 100 },
                ].map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    onClick={() => onChangeLeadersFrameSize && onChangeLeadersFrameSize(s.size)}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all text-[10px] ${
                      leadersFrameSize === s.size
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-amber-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Smooth Slider Bar for Frame Size */}
            <input
              type="range"
              min="40"
              max="150"
              step="2"
              value={leadersFrameSize}
              onChange={(e) => onChangeLeadersFrameSize && onChangeLeadersFrameSize(parseInt(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-amber-200/70 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Text Size Slider & Show Titles Checkbox */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                  নেতাদের নাম ও পদবীর ফন্ট সাইজ:
                </span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold text-xs">
                  {leaderTextSize}px
                </span>
              </div>
              <input
                type="range"
                min="7"
                max="14"
                step="0.5"
                value={leaderTextSize}
                onChange={(e) => onChangeLeaderTextSize && onChangeLeaderTextSize(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-amber-200/70 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none sm:pl-3 sm:border-l sm:border-amber-200/60 sm:dark:border-amber-900/40">
              <input
                type="checkbox"
                checked={showLeaderTitles}
                onChange={(e) => onToggleShowLeaderTitles && onToggleShowLeaderTitles(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs whitespace-nowrap">
                ক্যানভাসে পদবি দেখান
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${topLeaders.length > 2 ? 'xl:grid-cols-3' : ''} gap-3`}>
        {topLeaders.map((leader, idx) => {
          const isAdjusting = activeAdjustIndex === idx;
          const currentScale = leader.scale || 1;
          const currentPosX = leader.posX || 0;
          const currentPosY = leader.posY || 0;

          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-center space-y-2.5 relative shadow-sm ${
                isAdjusting
                  ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-400/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
              }`}
            >
              {/* Delete / Remove Leader slot button */}
              {topLeaders.length > 1 && onRemoveLeader && (
                <button
                  type="button"
                  onClick={() => onRemoveLeader(idx)}
                  className="absolute top-2 right-2 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="এই নেতার স্লট মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <input
                ref={fileInputRefs[idx]}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onUploadLeaderPhoto(idx, e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {/* Leader Photo Frame */}
              <div className="relative group">
                <div
                  onClick={() => fileInputRefs[idx].current?.click()}
                  className="w-16 h-16 rounded-full border-2 border-amber-500 dark:border-amber-400 bg-amber-50/90 dark:bg-slate-900 shadow-md overflow-hidden flex items-center justify-center cursor-pointer hover:border-amber-600 dark:hover:border-amber-300 transition-all relative"
                >
                  {leader.url ? (
                    <>
                      <img
                        src={leader.url}
                        alt={leader.name}
                        style={{
                          transform: `scale(${currentScale}) translate(${currentPosX}px, ${currentPosY}px)`,
                        }}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                        ছবি বদলান
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-1">
                      <Upload className="w-4 h-4 mx-auto text-amber-600 dark:text-amber-400" />
                      <span className="text-[9px] text-slate-700 dark:text-slate-300 block mt-0.5 font-bold">
                        নেতা {idx + 1} ছবি
                      </span>
                    </div>
                  )}
                </div>

                {leader.url && (
                  <button
                    type="button"
                    onClick={() => onUpdateLeader(idx, { url: '', scale: 1, posX: 0, posY: 0 })}
                    className="absolute -top-1 -right-1 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow"
                    title="ছবি রিসেট"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Name & Title Inputs */}
              <div className="w-full space-y-1.5">
                <input
                  type="text"
                  placeholder={`নেতা ${idx + 1}-এর নাম`}
                  value={leader.name || ''}
                  onChange={(e) => onUpdateLeader(idx, { name: e.target.value })}
                  className="w-full px-2.5 py-1 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <input
                  type="text"
                  placeholder="পদবি (ঐচ্ছিক)"
                  value={leader.title || ''}
                  onChange={(e) => onUpdateLeader(idx, { title: e.target.value })}
                  className="w-full px-2 py-0.5 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Compact Position & Zoom Controls */}
              {leader.url && (
                <div className="w-full pt-1 border-t border-slate-200 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setActiveAdjustIndex(isAdjusting ? null : idx)}
                    className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] font-bold rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 transition-colors"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>{isAdjusting ? 'এডজাস্ট বন্ধ করুন' : 'পজিশন ও জুম'}</span>
                  </button>

                  {/* Compact Sliders */}
                  {isAdjusting && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-2 text-[10px]">
                      {/* Scale / Zoom */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
                          <span>জুম ({Math.round(currentScale * 100)}%):</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.05"
                          value={currentScale}
                          onChange={(e) => onUpdateLeader(idx, { scale: parseFloat(e.target.value) })}
                          className="w-full accent-amber-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Position Y (Up/Down) & X (Left/Right) in 2 columns */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-slate-700 dark:text-slate-300 font-bold block">Y: {currentPosY}px</span>
                          <input
                            type="range"
                            min="-40"
                            max="40"
                            step="1"
                            value={currentPosY}
                            onChange={(e) => onUpdateLeader(idx, { posY: parseInt(e.target.value) })}
                            className="w-full accent-amber-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-700 dark:text-slate-300 font-bold block">X: {currentPosX}px</span>
                          <input
                            type="range"
                            min="-40"
                            max="40"
                            step="1"
                            value={currentPosX}
                            onChange={(e) => onUpdateLeader(idx, { posX: parseInt(e.target.value) })}
                            className="w-full accent-amber-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Reset Button */}
                      <button
                        type="button"
                        onClick={() => onUpdateLeader(idx, { scale: 1, posX: 0, posY: 0 })}
                        className="w-full mt-1 flex items-center justify-center gap-1 py-1 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-100"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>রিসেট</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
