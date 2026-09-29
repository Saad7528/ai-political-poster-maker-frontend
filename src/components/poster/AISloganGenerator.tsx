'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Wand2, Loader2, CheckCircle2, AlertCircle, Mic, MicOff, X, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { IAISloganResponse } from '@/types';
import confetti from 'canvas-confetti';

interface AISloganGeneratorProps {
  occasionType: string;
  candidateName: string;
  designation: string;
  party: string;
  district?: string;
  unionOrThana?: string;
  constituencyName?: string;
  onApplyAIResult: (result: IAISloganResponse) => void;
}

// Browser SpeechRecognition Type Definition
interface ISpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal?: boolean;
    };
    length: number;
  };
}

interface ISpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

export const AISloganGenerator: React.FC<AISloganGeneratorProps> = ({
  occasionType,
  candidateName,
  designation,
  party,
  district,
  unionOrThana,
  constituencyName,
  onApplyAIResult,
}) => {
  const { token, demoLogin } = useAuth();
  const [promptText, setPromptText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<IAISloganResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  // Voice Speech-to-Text State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<ISpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionConstructor =
        (window as unknown as { SpeechRecognition?: new () => ISpeechRecognitionInstance }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => ISpeechRecognitionInstance }).webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) {
        setSpeechSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (typeof window === 'undefined') return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionConstructor =
      (window as unknown as { SpeechRecognition?: new () => ISpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => ISpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setErrorMsg('আপনার ব্রাউজারে সরাসরি ভয়েস রিকগনিশন সাপোর্ট নেই। গুগল ক্রোম ব্যবহার করুন।');
      return;
    }

    try {
      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = 'bn-BD'; // Bengali (Bangladesh)
      recognition.continuous = true;
      recognition.interimResults = true;

      let baseText = promptText ? promptText.trim() + ' ' : '';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setPromptText(baseText + currentTranscript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setErrorMsg('মাইক্রোফোন চালু করতে সমস্যা হয়েছে। পারমিশন চেক করুন।');
    }
  };

  const handleClearPrompt = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setPromptText('');
    setErrorMsg(null);
  };

  const handleGenerate = async () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setLoading(true);
    setErrorMsg(null);
    setApplied(false);

    try {
      let activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('poster_token') : null) || '';
      if (!activeToken) {
        await demoLogin();
        activeToken = (typeof window !== 'undefined' ? localStorage.getItem('poster_token') : null) || '';
      }

      const res = await api.generateAICopy(
        {
          promptText: promptText.trim() || undefined,
          occasionType,
          candidateName,
          designation,
          party,
          district,
          unionOrThana,
          constituencyName,
        },
        activeToken || ''
      );

      if (res.success && res.data) {
        setAiResult(res.data);
        onApplyAIResult(res.data);
        setApplied(true);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 },
        });
      } else {
        setErrorMsg(res.message || 'এআই পোস্টার জেনারেশন ব্যর্থ হয়েছে।');
      }
    } catch {
      setErrorMsg('সার্ভার কানেকশন ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-3xl border theme-border bg-white dark:bg-slate-900 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl theme-btn-primary text-white shadow-md">
            <Sparkles className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white font-bengali">
              গুগল জেমিনি এআই স্লোগান ও কপিরাইটিং
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-bengali">
              খাঁটি রাজনৈতিক ভাষা ও ছন্দোবদ্ধ নির্বাচনী স্লোগান স্বয়ংক্রিয়ভাবে তৈরি করুন
            </p>
          </div>
        </div>

        {isListening && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/40 text-rose-600 dark:text-rose-400 text-xs font-bold font-bengali animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>ভয়েস শুনছি... কথা বলুন</span>
          </div>
        )}
      </div>

      {/* Input Field with Integrated Microphone & Clear Button */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="যেমন: ঢাকা-১৬ আসনের আসন্ন নির্বাচনে বিএনপি প্রার্থীর জন্য স্লোগান তৈরি করুন..."
          className={`w-full pl-4 pr-24 py-3 rounded-2xl border ${
            isListening
              ? 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-50/20 dark:bg-rose-950/20'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none theme-ring-focus'
          } text-slate-900 dark:text-white text-xs font-bengali transition-all`}
        />

        {/* Action Controls inside Input Field */}
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {/* Clear / Reset Button */}
          {promptText && (
            <button
              type="button"
              onClick={handleClearPrompt}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors"
              title="লেখা ক্লিয়ার করুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Voice Microphone Input Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            aria-label={isListening ? 'ভয়েস ইনপুট বন্ধ করুন' : 'ভয়েস দিয়ে বলুন'}
            title={isListening ? 'ভয়েস ইনপুট বন্ধ করতে ক্লিক করুন' : 'ভয়েস ইনপুট শুরু করতে ক্লিক করুন (বাংলায় বলুন)'}
            className={`p-2 rounded-xl transition-all font-bengali flex items-center justify-center ${
              isListening
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse scale-105'
                : 'bg-slate-100 dark:bg-slate-800 hover:theme-subtle-bg hover:theme-text-accent text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-white animate-bounce" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Buttons and Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl theme-btn-primary font-bold text-xs transition-all active:scale-95 disabled:opacity-50 font-bengali"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>জেমিনি এআই চিন্তা করছে...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>এআই দিয়ে স্লোগান বানান</span>
              </>
            )}
          </button>

          {promptText && (
            <button
              type="button"
              onClick={handleClearPrompt}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-300 hover:text-rose-600 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all font-bengali"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ক্লিয়ার</span>
            </button>
          )}
        </div>

        {applied && (
          <span className="text-xs font-bold theme-text-accent font-bengali flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> ক্যানভাসে প্রয়োগ করা হয়েছে!
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bengali flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
