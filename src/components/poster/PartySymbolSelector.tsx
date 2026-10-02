'use client';

import React, { useRef } from 'react';
import { BANGLADESHI_POLITICAL_PARTIES, IPartyInfo } from '@/data/politicalParties';
import { Flag, Upload } from 'lucide-react';

interface PartySymbolSelectorProps {
  selectedPartyKey: string;
  onSelectParty: (party: IPartyInfo) => void;
  customSymbolUrl?: string;
  onUploadCustomSymbol?: (file: File) => void;
}

export const PartySymbolSelector: React.FC<PartySymbolSelectorProps> = ({
  selectedPartyKey,
  onSelectParty,
  customSymbolUrl,
  onUploadCustomSymbol,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUploadCustomSymbol) {
      onUploadCustomSymbol(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3 font-bengali">
      <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Flag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>রাজনৈতিক দল ও নির্বাচনী প্রতীক</span>
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BANGLADESHI_POLITICAL_PARTIES.map((party) => {
          const isSelected = selectedPartyKey === party.id;
          return (
            <button
              key={party.id}
              type="button"
              onClick={() => onSelectParty(party)}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'border-emerald-500 dark:border-amber-400 bg-emerald-50/90 dark:bg-emerald-950/70 text-slate-900 dark:text-white shadow-md ring-2 ring-emerald-500/25 dark:ring-amber-400/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 shadow-sm'
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5"
              >
                <img
                  src={party.symbolUrl}
                  alt={party.symbolBanglaName}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate leading-tight">
                  {party.banglaName.split('(')[0]}
                </p>
                <p
                  className={`text-[11px] font-bold mt-0.5 ${
                    isSelected
                      ? 'text-emerald-700 dark:text-amber-300'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  মার্কা: {party.symbolBanglaName}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Symbol Upload (for Independent / Local candidates) */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 mt-2">
        <span className="text-xs text-slate-600 dark:text-slate-400">
          অন্য কোনো কাস্টম মার্কা বা দলীয় লোগো আছে?
        </span>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition-colors shadow-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>কাস্টম প্রতীক আপলোড</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleCustomFile}
          className="hidden"
        />
      </div>
    </div>
  );
};
