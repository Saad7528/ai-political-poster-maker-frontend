'use client';

import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  itemPreview?: {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
  };
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description = 'এই কাজটি সম্পন্ন করার পর পূর্বাবস্থায় ফিরিয়ে আনা সম্ভব নাও হতে পারে।',
  confirmText = 'হ্যাঁ, নিশ্চিত করুন',
  cancelText = 'বাতিল',
  isDestructive = true,
  isLoading = false,
  itemPreview,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden p-6 scale-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-xl flex-shrink-0 ${
            isDestructive 
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            {isDestructive ? (
              <Trash2 className="w-6 h-6 animate-pulse" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">{title}</h3>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Optional Item Preview Card */}
        {itemPreview && (
          <div className="my-4 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center gap-3">
            {itemPreview.imageUrl ? (
              <div className="w-12 h-16 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700">
                <img 
                  src={itemPreview.imageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover" 
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500">
                <Trash2 className="w-5 h-5" />
              </div>
            )}
            <div className="overflow-hidden flex-1">
              {itemPreview.title && (
                <div className="font-semibold text-sm text-slate-200 truncate">
                  {itemPreview.title}
                </div>
              )}
              {itemPreview.subtitle && (
                <div className="text-xs text-slate-400 truncate mt-0.5">
                  {itemPreview.subtitle}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg transition disabled:opacity-50 ${
              isDestructive
                ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-900/30'
                : 'theme-btn-primary'
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
