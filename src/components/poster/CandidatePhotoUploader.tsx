'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Upload,
  X,
  User,
  Check,
  Wand2,
  SlidersHorizontal,
  RotateCcw,
  Crop,
  Circle,
  Square,
  Undo2,
  Loader2,
  Maximize2,
} from 'lucide-react';
import { ICandidatePhotoAdjustments } from '@/types';
import { compressImage } from '@/lib/imageCompressor';

interface CandidatePhotoUploaderProps {
  photoUrl: string;
  candidateName?: string;
  adjustments: ICandidatePhotoAdjustments;
  onChangeAdjustments: (adjustments: Partial<ICandidatePhotoAdjustments>) => void;
  onUpload: (file: File) => void;
  onSetPhotoUrl: (url: string) => void;
  onRemove: () => void;
}

export const CandidatePhotoUploader: React.FC<CandidatePhotoUploaderProps> = ({
  photoUrl,
  candidateName,
  adjustments,
  onChangeAdjustments,
  onUpload,
  onSetPhotoUrl,
  onRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isProcessingBG, setIsProcessingBG] = useState(false);
  const [bgProgress, setBgProgress] = useState<string>('');
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string>('');
  const [isBgRemoved, setIsBgRemoved] = useState<boolean>(false);

  // Keep track of original photo when a fresh upload occurs
  useEffect(() => {
    if (photoUrl && !originalPhotoUrl) {
      setOriginalPhotoUrl(photoUrl);
    }
  }, [photoUrl, originalPhotoUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const compressedUrl = await compressImage(file, 1200, 1600, 0.85);
      if (compressedUrl) {
        setOriginalPhotoUrl(compressedUrl);
        setIsBgRemoved(false);
        onSetPhotoUrl(compressedUrl);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const compressedUrl = await compressImage(file, 1200, 1600, 0.85);
      if (compressedUrl) {
        setOriginalPhotoUrl(compressedUrl);
        setIsBgRemoved(false);
        onSetPhotoUrl(compressedUrl);
      }
    }
  };


  // High-Quality AI Background Removal with Fallback
  const handleRemoveBackground = async () => {
    if (!photoUrl) return;
    setIsProcessingBG(true);
    setBgProgress('মডেল লোড ও স্ক্যান হচ্ছে...');

    try {
      // Dynamically import @imgly/background-removal for browser AI model
      const { removeBackground } = await import('@imgly/background-removal');
      setBgProgress('AI ব্যাকগ্রাউন্ড আলাদা করছে...');

      const blob = await removeBackground(photoUrl, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            const percent = Math.round((current / total) * 100);
            setBgProgress(`প্রসেসিং: ${percent}%`);
          }
        },
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        const transparentDataUrl = reader.result as string;
        onSetPhotoUrl(transparentDataUrl);
        setIsBgRemoved(true);
        onChangeAdjustments({ frameStyle: 'cutout', enableGlow: true });
        setIsProcessingBG(false);
        setBgProgress('');
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.warn('AI bg removal fell back to smart edge algorithm:', err);
      // Fallback: Multi-layer edge-aware chroma + luminance flood filter
      fallbackSmartRemoval(photoUrl);
    }
  };

  const fallbackSmartRemoval = (imgSrc: string) => {
    setBgProgress('স্মার্ট এলগরিদমে রিমুভ হচ্ছে...');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessingBG(false);
        setBgProgress('');
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Sample edge corners for background tone
      const corners = [
        [0, 0],
        [canvas.width - 1, 0],
        [0, canvas.height - 1],
        [canvas.width - 1, canvas.height - 1],
      ];

      let bgR = 0, bgG = 0, bgB = 0;
      corners.forEach(([x, y]) => {
        const idx = (y * canvas.width + x) * 4;
        bgR += data[idx];
        bgG += data[idx + 1];
        bgB += data[idx + 2];
      });
      bgR /= 4;
      bgG /= 4;
      bgB /= 4;

      const threshold = 55;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
        const isNearWhite = r > 225 && g > 225 && b > 225;
        const isNearDark = r < 35 && g < 35 && b < 35 && bgR < 50;

        if (dist < threshold || isNearWhite || isNearDark) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const transparentDataUrl = canvas.toDataURL('image/png');
      onSetPhotoUrl(transparentDataUrl);
      setIsBgRemoved(true);
      onChangeAdjustments({ frameStyle: 'cutout', enableGlow: true });
      setIsProcessingBG(false);
      setBgProgress('');
    };
    img.onerror = () => {
      setIsProcessingBG(false);
      setBgProgress('');
    };
    img.src = imgSrc;
  };

  // Revert back to original uploaded photo
  const handleRevertOriginal = () => {
    if (originalPhotoUrl) {
      onSetPhotoUrl(originalPhotoUrl);
      setIsBgRemoved(false);
    }
  };

  const scale = adjustments.scale || 1.85;
  const posX = adjustments.posX || 0;
  const posY = adjustments.posY || 25;
  const frameSize = adjustments.frameSize || 180;
  const frameStyle = adjustments.frameStyle || 'cutout';

  const frameOptions: Array<{ id: 'cutout' | 'circle' | 'arch'; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'cutout', label: '✂️ কাটআউট (স্বচ্ছ)', icon: Crop },
    { id: 'circle', label: '⭕ গোল্ডেন বৃত্ত ফ্রেম', icon: Circle },
    { id: 'arch', label: '🏛️ তোরণ / তোপ ফ্রেম', icon: Square },
  ];

  return (
    <div className="space-y-4 font-bengali">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 theme-text-accent" />
          <span>👤 মূল প্রার্থীর ছবি ও ফ্রেম স্টাইল</span>
        </label>
        {photoUrl && (
          <button
            type="button"
            onClick={() => {
              setOriginalPhotoUrl('');
              setIsBgRemoved(false);
              onRemove();
            }}
            className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            ছবি মুছুন
          </button>
        )}
      </div>

      {!photoUrl ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${dragOver
              ? 'theme-border theme-subtle-bg scale-[0.99]'
              : 'border-slate-300 dark:border-slate-700 hover:theme-border hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-white dark:bg-slate-900/60 shadow-sm'
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-14 h-14 mx-auto rounded-full theme-subtle-bg flex items-center justify-center mb-3 shadow-inner">
            <Upload className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            প্রার্থীর ছবি আপলোড করতে এখানে ক্লিক করুন বা ড্র্যাগ করুন
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            কাটআউট PNG অথবা যেকোনো পোর্ট্রেট ছবি আপলোড করুন
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Thumbnail preview + Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-950 border theme-border flex-shrink-0 relative shadow-inner">
                <img src={photoUrl} alt="Candidate" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {candidateName || 'প্রার্থীর ছবি সংযুক্ত'}
                </p>
                <p className="text-[11px] theme-text-accent font-bold flex items-center gap-1 mt-0.5">
                  <Check className="w-3.5 h-3.5" /> ক্যানভাসে সরাসরি টেনে সরানো যাবে
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* AI Background Remove Button */}
              <button
                type="button"
                onClick={handleRemoveBackground}
                disabled={isProcessingBG}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                title="উন্নত এআই দিয়ে ছবির ব্যাকগ্রাউন্ড স্বচ্ছ করুন"
              >
                {isProcessingBG ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                <span>{isProcessingBG ? bgProgress || 'রিমুভ হচ্ছে...' : '🪄 এআই ব্যাকগ্রাউন্ড রিমুভ'}</span>
              </button>

              {/* Undo / Revert to Original Button */}
              {isBgRemoved && originalPhotoUrl && (
                <button
                  type="button"
                  onClick={handleRevertOriginal}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors shadow-sm"
                  title="ব্যাকগ্রাউন্ড রিমুভ বাতিল করে আগের মূল ছবিতে ফেরত যান"
                >
                  <Undo2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>মূল ছবিতে ফেরত</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors"
              >
                ছবি পরিবর্তন
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Frame Style Picker */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              ক্যানভাসে প্রার্থীর ফ্রেম স্টাইল নির্বাচন করুন:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {frameOptions.map((opt) => {
                const isSelected = frameStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeAdjustments({ frameStyle: opt.id })}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center border ${isSelected
                        ? 'theme-border theme-subtle-bg theme-text-accent ring-2 theme-glow-border'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Sliders: Frame Size, Photo Zoom, Y-Position, X-Position */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 theme-text-accent" />
                <span>ফ্রেমের সাইজ, জুম ও নিখুঁত পজিশন কন্ট্রোল:</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  onChangeAdjustments({ scale: 1.85, posX: 0, posY: 25, frameSize: 180 })
                }
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> ডিফল্ট রিসেট
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Frame Size Slider */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold">
                  <span className="flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>প্রার্থীর ফ্রেমের আকার (সাইজ):</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-black">
                      {frameSize}px
                    </span>
                    <div className="flex items-center gap-1">
                      {[
                        { label: 'স্ট্যান্ডার্ড', size: 180 },
                        { label: 'বড়', size: 240 },
                        { label: 'বিশাল', size: 300 },
                        { label: 'ম্যাক্স', size: 380 },
                      ].map((preset) => (
                        <button
                          key={preset.size}
                          type="button"
                          onClick={() => onChangeAdjustments({ frameSize: preset.size })}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${frameSize === preset.size
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100'
                            }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <input
                  type="range"
                  min="100"
                  max="480"
                  step="5"
                  value={frameSize}
                  onChange={(e) => onChangeAdjustments({ frameSize: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Photo Zoom / Scale Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold">
                  <span>ছবির জুম (Scale):</span>
                  <span className="font-mono theme-text-accent font-black">
                    {Math.round(scale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.05"
                  value={scale}
                  onChange={(e) => onChangeAdjustments({ scale: parseFloat(e.target.value) })}
                  className="w-full accent-[var(--primary-accent)] h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Y Position Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold">
                  <span>উপরে / নিচে (Y):</span>
                  <span className="font-mono theme-text-accent font-black">
                    {posY > 0 ? `+${posY}` : posY}px
                  </span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  step="1"
                  value={posY}
                  onChange={(e) => onChangeAdjustments({ posY: parseInt(e.target.value) })}
                  className="w-full accent-[var(--primary-accent)] h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* X Position Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold">
                  <span>ডানে / বামে (X):</span>
                  <span className="font-mono theme-text-accent font-black">
                    {posX > 0 ? `+${posX}` : posX}px
                  </span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  step="1"
                  value={posX}
                  onChange={(e) => onChangeAdjustments({ posX: parseInt(e.target.value) })}
                  className="w-full accent-[var(--primary-accent)] h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

