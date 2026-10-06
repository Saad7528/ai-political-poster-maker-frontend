'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ColorPaletteId } from '@/context/ThemeContext';
import { Palette, Check, ChevronDown } from 'lucide-react';

export const PalettePicker: React.FC = () => {
  const { palette, setPalette, palettes, currentPalette } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (id: ColorPaletteId) => {
    setPalette(id);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-200 active:scale-95 shadow-sm group"
        title="কালার থিম পরিবর্তন করুন"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Palette className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:rotate-12 transition-transform duration-200" />
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-slate-700 dark:text-slate-200" />
              <span className="text-xs font-black text-slate-900 dark:text-white font-bengali">
                ১০টি কালার থিম প্যালেট
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {palettes.length} টি থিম
            </span>
          </div>

          {/* Theme List - Scrollable */}
          <div className="p-1.5 max-h-[360px] overflow-y-auto space-y-1 custom-scrollbar">
            {palettes.map((p) => {
              const isSelected = p.id === palette;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(p.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 group font-bengali ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800/90 shadow-sm ring-1 ring-slate-300 dark:ring-slate-700'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Glowing Color Gradient Ball */}
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0 shadow-md ring-2 ring-white dark:ring-slate-900 group-hover:scale-110 transition-transform"
                      style={{ background: p.previewGradient }}
                    />
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold leading-none truncate ${
                            isSelected
                              ? 'text-slate-900 dark:text-white font-black'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {p.nameBn}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans hidden sm:inline">
                          ({p.nameEn})
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    {isSelected ? (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white shadow-sm"
                        style={{ background: p.previewGradient }}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80">
                        {p.accentBadge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="px-3.5 py-2 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 text-center font-bengali">
            যেকোনো থিম সিলেক্ট করলে পুরো সাইটের রং সাথে সাথে বদলে যাবে
          </div>
        </div>
      )}
    </div>
  );
};
