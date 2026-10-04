'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  LayoutTemplate,
  History,
  LogIn,
  LogOut,
  User,
  Shield,
  Layers,
  Sun,
  Moon,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Hide global navbar completely on Admin Panel & Auth Page
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) {
    return null;
  }

  const navLinks = [
    { href: '/templates', label: 'টেমপ্লেট গ্যালারি', icon: LayoutTemplate },
    { href: '/studio', label: 'পোস্টার স্টুডিও', icon: Layers },
    { href: '/history', label: 'আমার পোস্টার হিস্ট্রি', icon: History },
    ...(user?.role === 'admin' ? [{ href: '/admin', label: 'অ্যাডমিন প্যানেল', icon: Shield }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-sm dark:shadow-2xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Professional Brand Logo with Political Leader Speech Artwork */}
          <Link href="/" className="flex items-center gap-3 group select-none">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
              <img
                src="/logo.png"
                alt="AI Political Poster Maker"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight font-bengali leading-none">
                  পোস্টার<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-500 dark:from-emerald-400 dark:to-amber-300">মেকার</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bengali leading-none mt-1 hidden sm:block">
                বাংলাদেশি ডিজিটাল রাজনৈতিক ও নির্বাচনী পোস্টার প্ল্যাটফর্ম
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all font-bengali ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white shadow-md shadow-emerald-700/25 active:scale-95'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action Bar: Theme Toggle + User Auth */}
          <div className="flex items-center gap-2.5">
            {/* Dark/Light Theme Toggle Switch */}
            <button
              onClick={toggleTheme}
              type="button"
              aria-label="Toggle Dark/Light Mode"
              title={theme === 'dark' ? 'লাইট মোডে পরিবর্তন করুন' : 'ডার্ক মোডে পরিবর্তন করুন'}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-180" />
              )}
            </button>

            {/* User Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs">
                    {user.role === 'admin' ? <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[70px] sm:max-w-[120px] font-bengali">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="লগআউট"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all font-bengali shadow-sm shadow-emerald-600/25 active:scale-95 whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>লগইন</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Submenu - Horizontally scrollable if needed */}
        <div className="md:hidden flex items-center gap-1 py-2 px-1 border-t border-slate-200 dark:border-slate-800 text-xs font-bengali overflow-x-auto no-scrollbar">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 min-w-fit flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap text-[11px] sm:text-xs ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
