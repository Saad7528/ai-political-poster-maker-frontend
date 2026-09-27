'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export type ColorPaletteId =
  | 'emerald'
  | 'purple'
  | 'amber'
  | 'blue'
  | 'rose'
  | 'teal'
  | 'gold'
  | 'indigo'
  | 'lime'
  | 'fuchsia';

export interface ColorPalette {
  id: ColorPaletteId;
  nameBn: string;
  nameEn: string;
  description: string;
  previewGradient: string;
  primaryColor: string;
  accentBadge: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'emerald',
    nameBn: 'সবুজ বিপ্লব',
    nameEn: 'Emerald Mint',
    description: 'জাতীয়, প্রাকৃতিক ও সমৃদ্ধ রাজনৈতিক লুক',
    previewGradient: 'linear-gradient(135deg, #059669, #0f766e)',
    primaryColor: '#059669',
    accentBadge: 'ডিফল্ট',
  },
  {
    id: 'purple',
    nameBn: 'রাজকীয় পার্পল',
    nameEn: 'Royal Purple',
    description: 'লাক্সারি, এআই-চালিত ও অভিজাত অনুভূতি',
    previewGradient: 'linear-gradient(135deg, #7c3aed, #4338ca)',
    primaryColor: '#7c3aed',
    accentBadge: 'জনপ্রিয়',
  },
  {
    id: 'amber',
    nameBn: 'অগ্নিশিখা অরেঞ্জ',
    nameEn: 'Solar Amber',
    description: 'উদ্যমী, স্পষ্ট ও অত্যন্ত দৃষ্টি-আকর্ষণকারী',
    previewGradient: 'linear-gradient(135deg, #f59e0b, #dc2626)',
    primaryColor: '#ea580c',
    accentBadge: 'উষ্ণ',
  },
  {
    id: 'blue',
    nameBn: 'নীল দিগন্ত',
    nameEn: 'Ocean Sapphire',
    description: 'আস্থাভাজন, টেক ও ডিপ ওশান ফিল্ড',
    previewGradient: 'linear-gradient(135deg, #2563eb, #0891b2)',
    primaryColor: '#2563eb',
    accentBadge: 'ক্ল্যাসিক',
  },
  {
    id: 'rose',
    nameBn: 'বিপ্লবী রুবি',
    nameEn: 'Crimson Rose',
    description: 'সাহসী, জোরালো ও বিপ্লবী রূপ',
    previewGradient: 'linear-gradient(135deg, #e11d48, #9f1239)',
    primaryColor: '#e11d48',
    accentBadge: 'সাহসী',
  },
  {
    id: 'teal',
    nameBn: 'সাইবার টিল',
    nameEn: 'Cyber Teal',
    description: 'আধুনিক, প্রাণবন্ত ও নজরকাড়া ক্রিস্টাল লুক',
    previewGradient: 'linear-gradient(135deg, #0d9488, #0284c7)',
    primaryColor: '#0d9488',
    accentBadge: 'মডার্ন',
  },
  {
    id: 'gold',
    nameBn: 'স্বর্ণালী গোল্ড',
    nameEn: 'Imperial Gold',
    description: 'রাজকীয় ঐতিহ্য ও প্রিমিয়াম ফিনিশ',
    previewGradient: 'linear-gradient(135deg, #d97706, #92400e)',
    primaryColor: '#d97706',
    accentBadge: 'প্রিমিয়াম',
  },
  {
    id: 'indigo',
    nameBn: 'গভীর ইন্ডিগো',
    nameEn: 'Midnight Indigo',
    description: 'কূটনৈতিক, গম্ভীর ও হাই-কনট্রাস্ট ফোকাস',
    previewGradient: 'linear-gradient(135deg, #4f46e5, #312e81)',
    primaryColor: '#4f46e5',
    accentBadge: 'এক্সিকিউটিভ',
  },
  {
    id: 'lime',
    nameBn: 'ইলেকট্রিক লাইম',
    nameEn: 'Electric Lime',
    description: 'সতেজ, পরিবেশবান্ধব ও সুপার হাই-ভিজিবিলিটি',
    previewGradient: 'linear-gradient(135deg, #65a30d, #15803d)',
    primaryColor: '#65a30d',
    accentBadge: 'ডায়নামিক',
  },
  {
    id: 'fuchsia',
    nameBn: 'সূর্যাস্ত ম্যাগেন্টা',
    nameEn: 'Sunset Fuchsia',
    description: 'ক্রিয়েটিভ, আধুনিক ও আকর্ষণীয় ট্রেন্ডি ভাইব',
    previewGradient: 'linear-gradient(135deg, #c026d3, #be185d)',
    primaryColor: '#c026d3',
    accentBadge: 'ট্রেন্ডি',
  },
];

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  palette: ColorPaletteId;
  setPalette: (palette: ColorPaletteId) => void;
  currentPalette: ColorPalette;
  palettes: ColorPalette[];
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  palette: 'emerald',
  setPalette: () => {},
  currentPalette: COLOR_PALETTES[0],
  palettes: COLOR_PALETTES,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [palette, setPaletteState] = useState<ColorPaletteId>('emerald');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Initialize Dark/Light Theme
    try {
      const storedTheme = localStorage.getItem('poster_maker_theme') as Theme | null;
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setThemeState(storedTheme);
        applyTheme(storedTheme);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme: Theme = prefersDark ? 'dark' : 'dark';
        setThemeState(initialTheme);
        applyTheme(initialTheme);
      }
    } catch {
      applyTheme('dark');
    }

    // 2. Initialize Color Palette
    try {
      const storedPalette = localStorage.getItem('poster_maker_palette') as ColorPaletteId | null;
      const validPalette = COLOR_PALETTES.some((p) => p.id === storedPalette);
      if (storedPalette && validPalette) {
        setPaletteState(storedPalette);
        applyPalette(storedPalette);
      } else {
        setPaletteState('emerald');
        applyPalette('emerald');
      }
    } catch {
      applyPalette('emerald');
    }

    setMounted(true);
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  };

  const applyPalette = (p: ColorPaletteId) => {
    const root = document.documentElement;
    root.setAttribute('data-palette', p);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    try {
      localStorage.setItem('poster_maker_theme', t);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const setPalette = (p: ColorPaletteId) => {
    setPaletteState(p);
    applyPalette(p);
    try {
      localStorage.setItem('poster_maker_palette', p);
    } catch (e) {
      console.error(e);
    }
  };

  const currentPalette = COLOR_PALETTES.find((p) => p.id === palette) || COLOR_PALETTES[0];

  return (
    <ThemeContext.Provider
      value={{
        theme: mounted ? theme : 'dark',
        toggleTheme,
        setTheme,
        palette: mounted ? palette : 'emerald',
        setPalette,
        currentPalette,
        palettes: COLOR_PALETTES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
