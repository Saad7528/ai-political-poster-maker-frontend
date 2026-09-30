'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { IAdminStats, IPoster, ITemplate, IUser } from '@/types';
import {
  Shield,
  Users,
  Image as ImageIcon,
  AlertTriangle,
  LayoutTemplate,
  Trash2,
  Flag,
  CheckCircle,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Lock,
  Eye,
  Sliders,
  X,
  FileCheck,
  Ban,
  ChevronDown,
  ChevronUp,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Home,
  Menu,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useTheme } from '@/context/ThemeContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PalettePicker } from '@/components/layout/PalettePicker';

interface IUserGroup {
  userId: string;
  name: string;
  emailOrPhone: string;
  role?: string;
  posters: IPoster[];
}

export default function AdminPage() {
  const router = useRouter();
  const { user, token, logout, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'templates' | 'users'>('overview');
  const [stats, setStats] = useState<IAdminStats | null>(null);
  const [posters, setPosters] = useState<IPoster[]>([]);
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [usersList, setUsersList] = useState<IUser[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFlaggedOnly, setFilterFlaggedOnly] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Accordion state: set of expanded user IDs
  const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(new Set());

  // Delete confirm modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'poster' | 'template';
    id: string;
    title: string;
    description?: string;
    subtitle?: string;
    imageUrl?: string;
    isLoading: boolean;
  }>({
    isOpen: false,
    type: 'poster',
    id: '',
    title: '',
    isLoading: false,
  });

  // Selected poster for preview modal
  const [selectedPoster, setSelectedPoster] = useState<IPoster | null>(null);
  const [flagReasonInput, setFlagReasonInput] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Template creation modal state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState({
    title: '',
    banglaTitle: '',
    occasionType: 'shuvechcha',
    thumbnailUrl: '',
    defaultHeadline: '',
    defaultSubheadline: '',
    defaultSlogan: '',
    primaryColor: '#006a4e',
    secondaryColor: '#f42a41',
    accentColor: '#ffd700',
    backgroundColor: '#042f2e',
    footerBg: '#021e1d',
    maxTopLeaders: 2,
    bgMotifType: 'monument',
    borderStyle: 'golden_floral',
  });

  // Load Dashboard Data
  const loadDashboardData = async () => {
    if (!token) return;
    setLoadingData(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    try {
      // 1. Fetch Stats
      const statsRes = await api.getAdminStats(token);
      if (statsRes.success) {
        setStats(statsRes.data);
      }

      // 2. Fetch Posters
      const postersRes = await api.getAdminPosters(token, {
        flagged: filterFlaggedOnly ? true : undefined,
        search: searchTerm || undefined,
      });
      if (postersRes.success) {
        setPosters(postersRes.data);
      }

      // 3. Fetch Templates
      const templatesRes = await api.getTemplates();
      if (templatesRes.success) {
        setTemplates(templatesRes.data);
      }

      // 4. Fetch Users
      const usersRes = await api.getAdminUsers(token);
      if (usersRes.success) {
        setUsersList(usersRes.data);
        // Expand users who have posters by default
        const initialExpanded = new Set<string>();
        usersRes.data.forEach((u: IUser) => {
          const uId = (u.id || u._id || '').toString();
          initialExpanded.add(uId);
        });
        setExpandedUserIds(initialExpanded);
      }
    } catch {
      setActionErrorMsg('ডাটাবেজ থেকে ডাটা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoadingData(false);
    }
  };

  const handleManualRefresh = async () => {
    await loadDashboardData();
    toast.success('ডাটাবেজ রিফ্রেশ সম্পন্ন হয়েছে!');
  };

  useEffect(() => {
    if (token && user?.role === 'admin') {
      loadDashboardData();
    }
  }, [token, user, filterFlaggedOnly]);

  // Group Posters by User
  const userGroups = useMemo(() => {
    const map = new Map<string, IUserGroup>();

    // 1. First populate all registered users
    usersList.forEach((u) => {
      const uId = (u.id || u._id || '').toString();
      map.set(uId, {
        userId: uId,
        name: u.name || 'ব্যবহারকারী',
        emailOrPhone: u.emailOrPhone || '',
        role: u.role || 'user',
        posters: [],
      });
    });

    // 2. Distribute posters into their user group
    posters.forEach((p) => {
      const uId =
        typeof p.userId === 'object' && p.userId !== null
          ? (p.userId.id || p.userId._id || '').toString()
          : (p.userId || 'other').toString();

      if (!map.has(uId)) {
        const uName =
          typeof p.userId === 'object' && p.userId !== null
            ? (p.userId.name || p.formData?.candidateName || 'ব্যবহারকারী')
            : (p.formData?.candidateName || 'ব্যবহারকারী');
        const uEmail =
          typeof p.userId === 'object' && p.userId !== null
            ? (p.userId.emailOrPhone || '')
            : '';
        map.set(uId, {
          userId: uId,
          name: uName,
          emailOrPhone: uEmail,
          role: 'user',
          posters: [],
        });
      }
      map.get(uId)!.posters.push(p);
    });

    let list = Array.from(map.values());

    // Search query filter
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.emailOrPhone.toLowerCase().includes(q) ||
          g.posters.some(
            (p) =>
              p.formData?.candidateName?.toLowerCase().includes(q) ||
              p.formData?.headline?.toLowerCase().includes(q) ||
              p.formData?.organizationOrParty?.toLowerCase().includes(q)
          )
      );
    }

    // Flagged only filter
    if (filterFlaggedOnly) {
      list = list.filter((g) => g.posters.some((p) => p.isFlagged));
    }

    return list;
  }, [posters, usersList, searchTerm, filterFlaggedOnly]);

  const toggleUserAccordion = (userId: string) => {
    setExpandedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const expandAllAccordions = () => {
    const all = new Set<string>();
    userGroups.forEach((g) => all.add(g.userId));
    setExpandedUserIds(all);
  };

  const collapseAllAccordions = () => {
    setExpandedUserIds(new Set());
  };

  // Flag/Unflag Poster with instant UI update
  const handleFlagToggle = async (poster: IPoster) => {
    if (!token) return;
    const willBeFlagged = !poster.isFlagged;
    const reason = willBeFlagged ? (flagReasonInput || 'কমিউনিটি নীতিমালা লঙ্ঘন / আপত্তিকর কনটেন্ট') : '';

    // Optimistic UI state update
    setPosters((prev) =>
      prev.map((p) =>
        p._id === poster._id
          ? { ...p, isFlagged: willBeFlagged, flagReason: reason }
          : p
      )
    );
    if (selectedPoster?._id === poster._id) {
      setSelectedPoster((prev) =>
        prev ? { ...prev, isFlagged: willBeFlagged, flagReason: reason } : null
      );
    }
    setFlagReasonInput('');

    try {
      const res = await api.flagAdminPoster(poster._id, willBeFlagged, reason, token);
      if (res.success) {
        toast.success(
          willBeFlagged
            ? 'পোস্টারটিতে সফলভাবে ফ্ল্যাগ চিহ্নিত করা হয়েছে।'
            : 'পোস্টারটির ফ্ল্যাগ অপসারণ করা হয়েছে।'
        );
        api.getAdminStats(token).then((statsRes) => {
          if (statsRes.success) setStats(statsRes.data);
        });
      } else {
        toast.error(res.message || 'ফ্ল্যাগ আপডেট ব্যর্থ হয়েছে।');
        loadDashboardData();
      }
    } catch {
      toast.error('সার্ভার ত্রুটি।');
      loadDashboardData();
    }
  };

  // Open Delete Poster confirmation modal
  const promptDeletePoster = (poster: IPoster) => {
    setDeleteModal({
      isOpen: true,
      type: 'poster',
      id: poster._id,
      title: 'পোস্টারটি স্থায়ীভাবে মুছে ফেলতে চান?',
      description: 'এই পোস্টারটি ডাটাবেজ থেকে স্থায়ীভাবে মুছে ফেলা হবে। আপনি কি নিশ্চিত?',
      subtitle: poster.formData?.candidateName || poster.formData?.headline || 'নামবিহীন পোস্টার',
      imageUrl: poster.generatedImageUrl,
      isLoading: false,
    });
  };

  // Open Delete Template confirmation modal
  const promptDeleteTemplate = (tpl: ITemplate) => {
    setDeleteModal({
      isOpen: true,
      type: 'template',
      id: tpl._id,
      title: 'টেমপ্লেটটি মুছে ফেলতে চান?',
      description: 'এই টেমপ্লেটটি সিস্টেম থেকে স্থায়ীভাবে ডিলিট করা হবে। আপনি কি নিশ্চিত?',
      subtitle: tpl.banglaTitle || tpl.title,
      imageUrl: getTemplateThumbnail(tpl),
      isLoading: false,
    });
  };

  // Confirm delete handler with instant UI update
  const handleConfirmDelete = async () => {
    if (!token || !deleteModal.id) return;
    setDeleteModal((prev) => ({ ...prev, isLoading: true }));

    try {
      if (deleteModal.type === 'poster') {
        const posterId = deleteModal.id;
        // Instant optimistic filter
        setPosters((prev) => prev.filter((p) => p._id !== posterId));
        if (selectedPoster?._id === posterId) setSelectedPoster(null);

        const res = await api.deleteAdminPoster(posterId, token);
        if (res.success) {
          toast.success('পোস্টারটি সফলভাবে মুছে ফেলা হয়েছে!');
          api.getAdminStats(token).then((statsRes) => {
            if (statsRes.success) setStats(statsRes.data);
          });
        } else {
          toast.error(res.message || 'ডিলিট ব্যর্থ হয়েছে।');
          loadDashboardData();
        }
      } else {
        const templateId = deleteModal.id;
        setTemplates((prev) => prev.filter((t) => t._id !== templateId));

        const res = await api.deleteAdminTemplate(templateId, token);
        if (res.success) {
          toast.success('টেমপ্লেটটি সফলভাবে মুছে ফেলা হয়েছে!');
          api.getAdminStats(token).then((statsRes) => {
            if (statsRes.success) setStats(statsRes.data);
          });
        } else {
          toast.error(res.message || 'টেমপ্লেট ডিলিট ব্যর্থ হয়েছে।');
          loadDashboardData();
        }
      }
    } catch {
      toast.error('সার্ভারের সাথে যোগাযোগে ত্রুটি হয়েছে।');
    } finally {
      setDeleteModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
    }
  };

  const handleDownloadPoster = (poster: IPoster) => {
    if (!poster.generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = poster.generatedImageUrl;
    link.download = `poster-${poster.formData?.candidateName || 'admin'}-${Date.now()}.png`;
    link.click();
    toast.info('পোস্টার ডাউনলোড শুরু হয়েছে');
  };

  // Save Template (Create or Update)
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const templatePayload = {
      title: templateForm.title,
      banglaTitle: templateForm.banglaTitle,
      occasionType: templateForm.occasionType,
      thumbnailUrl: templateForm.thumbnailUrl || '/templates/thumbnails/mourning.svg',
      layoutConfig: {
        maxTopLeaders: Number(templateForm.maxTopLeaders),
        topLeaderFrameStyle: 'circle',
        candidatePosition: 'bottom-right',
        colorScheme: {
          primary: templateForm.primaryColor,
          secondary: templateForm.secondaryColor,
          accent: templateForm.accentColor,
          background: templateForm.backgroundColor,
          footerBg: templateForm.footerBg,
          headerTextColor: '#ffffff',
          bodyTextColor: '#ffffff',
        },
        defaultHeadline: templateForm.defaultHeadline,
        defaultSubheadline: templateForm.defaultSubheadline,
        defaultSlogan: templateForm.defaultSlogan,
        bgMotifType: templateForm.bgMotifType,
        borderStyle: templateForm.borderStyle,
      },
      recommendedParties: ['all', 'bnp', 'al', 'jamaat', 'jp', 'gono_odhikar'],
    };

    try {
      let res;
      if (editingTemplateId) {
        res = await api.updateAdminTemplate(editingTemplateId, templatePayload, token);
      } else {
        res = await api.createAdminTemplate(templatePayload, token);
      }

      if (res.success) {
        toast.success(editingTemplateId ? 'টেমপ্লেট সফলভাবে আপডেট করা হয়েছে!' : 'নতুন টেমপ্লেট সফলভাবে তৈরি হয়েছে!');
        setIsTemplateModalOpen(false);
        setEditingTemplateId(null);
        loadDashboardData();
      } else {
        toast.error(res.message || 'টেমপ্লেট সংরক্ষণে ব্যর্থতা।');
      }
    } catch {
      toast.error('সার্ভার ত্রুটি।');
    }
  };

  const getTemplateThumbnail = (tpl: ITemplate): string => {
    if (tpl.thumbnailUrl && tpl.thumbnailUrl.startsWith('/templates/thumbnails/')) {
      return tpl.thumbnailUrl;
    }
    const occasionMap: Record<string, string> = {
      shok_dibosh: '/templates/thumbnails/mourning.svg',
      pohela_boishakh: '/templates/thumbnails/boishakh.svg',
      eid_celebration: '/templates/thumbnails/eid.svg',
      bijoy_dibosh: '/templates/thumbnails/bijoy_dibosh.svg',
      shadhinota_dibosh: '/templates/thumbnails/independence.svg',
      ekushey_february: '/templates/thumbnails/ekushey.svg',
      election_campaign: '/templates/thumbnails/mayor_election.svg',
      shuvechcha: '/templates/thumbnails/youth_rally.svg',
    };
    return occasionMap[tpl.occasionType] || '/templates/thumbnails/mourning.svg';
  };

  // Unauthorized screen
  if (!authLoading && (!user || user.role !== 'admin')) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center font-bengali space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            অ্যাডমিন অনুমতি প্রয়োজন
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            এই ড্যাশবোর্ডটি শুধুমাত্র প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটরদের জন্য সংরক্ষিত। অনুগ্রহ করে অ্যাডমিন অ্যাকাউন্ট দিয়ে লগইন করুন।
          </p>
        </div>
        <button
          onClick={() => router.push('/auth')}
          className="w-full py-3 rounded-2xl theme-btn-primary text-xs font-bold active:scale-95 transition-all"
        >
          অ্যাডমিন লগইন পেজে যান
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-bengali flex flex-col md:flex-row">
      {/* Mobile Sidebar Toggle Button */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 theme-text-accent" />
          <span className="font-black text-sm text-slate-900 dark:text-white">অ্যাডমিন কন্ট্রোল</span>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-5 overflow-y-auto transition-transform duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl theme-btn-primary flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base text-slate-900 dark:text-white leading-tight">
                অ্যাডমিন প্যানেল
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] theme-text-accent font-bold">
                <span className="w-1.5 h-1.5 rounded-full theme-bg-primary animate-pulse" />
                লাইভ মোড
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            <button
              onClick={() => {
                setActiveTab('overview');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'theme-btn-primary font-bold shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4" />
                <span>ওভারভিউ ও মেট্রিক্স</span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('moderation');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'moderation'
                  ? 'theme-btn-primary font-bold shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Flag className="w-4 h-4" />
                <span>কনটেন্ট মডারেশন</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'moderation'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {posters.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('templates');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'templates'
                  ? 'theme-btn-primary font-bold shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutTemplate className="w-4 h-4" />
                <span>টেমপ্লেট ম্যানেজার</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'templates'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {templates.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('users');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'users'
                  ? 'theme-btn-primary font-bold shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>ব্যবহারকারী তালিকা</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'users'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {usersList.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full theme-subtle-bg border theme-border flex items-center justify-center font-bold text-xs">
              🛡️
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.name || 'অ্যাডমিনিস্ট্রেটর'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{user?.emailOrPhone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              <span>হোমপেজ</span>
            </Link>
            <Link
              href="/studio"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl theme-subtle-bg text-[11px] font-bold transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>স্টুডিও</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-x-hidden">
        {/* Sleek Topbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {activeTab === 'overview' && 'ড্যাশবোর্ড ওভারভিউ ও মেট্রিক্স'}
              {activeTab === 'moderation' && 'পোস্টার ও কনটেন্ট মডারেশন'}
              {activeTab === 'templates' && 'টেমপ্লেট ম্যানেজার'}
              {activeTab === 'users' && 'নিবন্ধিত ব্যবহারকারী তালিকা'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeTab === 'overview' && 'প্ল্যাটফর্মের সার্বিক পরিসংখ্যান ও সাম্প্রতিক কর্মকাণ্ড'}
              {activeTab === 'moderation' && 'ব্যবহারকারী অনুযায়ী তৈরিকৃত সকল পোস্টারের ভিজ্যুয়াল তালিকা'}
              {activeTab === 'templates' && 'নির্বাচনী ও রাজনৈতিক পোস্টার ডিজাইনের মূল টেমপ্লেটসমূহ'}
              {activeTab === 'users' && 'সিস্টেমে নিবন্ধিত মোট সক্রিয় ব্যবহারকারীদের প্রোফাইল'}
            </p>
          </div>

          {/* Top Actions: Palette Picker, Theme Toggle, Refresh, Profile & Logout */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* 10 Theme Palette Picker Dropdown */}
            <PalettePicker />

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 shadow-sm transition-all active:scale-90"
              title={theme === 'dark' ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={loadingData}
              title="ডাটাবেজ রিফ্রেশ করুন"
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:theme-text-accent hover:theme-border shadow-sm transition-all active:scale-90"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin theme-text-accent' : ''}`} />
            </button>

            {/* Admin Profile Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="theme-text-accent">🛡️</span>
              <span className="truncate max-w-[130px]">{user?.name || 'অ্যাডমিনিস্ট্রেটর'}</span>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={logout}
              title="অ্যাকাউন্ট থেকে লগআউট করুন"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all active:scale-95 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </div>

        {/* Action Alerts */}
        {actionSuccessMsg && (
          <div className="p-4 rounded-2xl theme-subtle-bg border theme-border theme-text-accent text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {actionErrorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>{actionErrorMsg}</span>
            </div>
            <button onClick={() => setActionErrorMsg(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW & METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 4 Interactive Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Users */}
              <div
                onClick={() => setActiveTab('users')}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:theme-border hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group space-y-2 select-none"
              >
                <div className="flex items-center justify-between theme-text-accent">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:theme-text-accent transition-colors">
                    মোট ব্যবহারকারী
                  </span>
                  <div className="p-2.5 rounded-2xl theme-subtle-bg group-hover:theme-btn-primary transition-all">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  {stats?.totalUsers ?? usersList.length}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>নিবন্ধিত ইউজার</span>
                  <span className="font-bold theme-text-accent group-hover:translate-x-1 transition-transform">
                    তালিকা দেখুন →
                  </span>
                </div>
              </div>

              {/* Card 2: Generated Posters */}
              <div
                onClick={() => {
                  setFilterFlaggedOnly(false);
                  setActiveTab('moderation');
                }}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:theme-border hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group space-y-2 select-none"
              >
                <div className="flex items-center justify-between theme-text-accent">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:theme-text-accent transition-colors">
                    মোট তৈরি পোস্টার
                  </span>
                  <div className="p-2.5 rounded-2xl theme-subtle-bg group-hover:theme-btn-primary transition-all">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  {stats?.totalPosters ?? posters.length}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>সংরক্ষিত পোস্টার</span>
                  <span className="font-bold theme-text-accent group-hover:translate-x-1 transition-transform">
                    মডারেট করুন →
                  </span>
                </div>
              </div>

              {/* Card 3: Flagged Posters */}
              <div
                onClick={() => {
                  setFilterFlaggedOnly(true);
                  setActiveTab('moderation');
                }}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-rose-500/50 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group space-y-2 select-none"
              >
                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-rose-600 transition-colors">
                    ফ্ল্যাগযুক্ত পোস্টার
                  </span>
                  <div className="p-2.5 rounded-2xl bg-rose-500/10 group-hover:bg-rose-600 group-hover:text-white transition-all">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-rose-600 dark:text-rose-400">
                  {stats?.flaggedPosters ?? 0}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>আপত্তিকর কনটেন্ট</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform">
                    পর্যালোচনা →
                  </span>
                </div>
              </div>

              {/* Card 4: Templates */}
              <div
                onClick={() => setActiveTab('templates')}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-500/50 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group space-y-2 select-none"
              >
                <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-amber-600 transition-colors">
                    সক্রিয় টেমপ্লেট
                  </span>
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 group-hover:bg-amber-600 group-hover:text-white transition-all">
                    <LayoutTemplate className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  {stats?.totalTemplates ?? templates.length}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>ডিজাইন থিম</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                    ম্যানেজ করুন →
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Posters Quick View */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  সাম্প্রতিক পোস্টারসমূহ
                </h3>
                <button
                  onClick={() => setActiveTab('moderation')}
                  className="text-xs theme-text-accent hover:underline font-bold"
                >
                  সবগুলো পোস্টার দেখুন →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                      <th className="pb-3">প্রার্থী ও পদবী</th>
                      <th className="pb-3">হেডলাইন</th>
                      <th className="pb-3">দল / সংগঠন</th>
                      <th className="pb-3">তৈরির তারিখ</th>
                      <th className="pb-3">স্ট্যাটাস</th>
                      <th className="pb-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {posters.slice(0, 5).map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 font-bold text-slate-900 dark:text-white">
                          {p.formData.candidateName}
                          <span className="block text-[10px] text-slate-500 font-normal">
                            {p.formData.designation}
                          </span>
                        </td>
                        <td className="py-3 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                          {p.formData.headline}
                        </td>
                        <td className="py-3 text-slate-700 dark:text-slate-300">
                          {p.formData.organizationOrParty}
                        </td>
                        <td className="py-3 text-slate-500">
                          {new Date(p.createdAt).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="py-3">
                          {p.isFlagged ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-600 font-bold border border-rose-500/30">
                              ⚠️ ফ্ল্যাগড
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] theme-subtle-bg theme-text-accent font-bold">
                              সফল
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedPoster(p);
                            }}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                            title="প্রিভিউ দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {posters.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          কোনো পোস্টার পাওয়া যায়নি।
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: POSTER & CONTENT MODERATION (USER-WISE ACCORDION VIEW) */}
        {activeTab === 'moderation' && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ব্যবহারকারীর নাম, প্রার্থীর নাম বা হেডলাইন দিয়ে খুঁজুন..."
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none theme-ring-focus"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setFilterFlaggedOnly(!filterFlaggedOnly)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border whitespace-nowrap active:scale-95 ${
                    filterFlaggedOnly
                      ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>শুধুমাত্র ফ্ল্যাগযুক্ত</span>
                </button>

                <button
                  onClick={expandAllAccordions}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors whitespace-nowrap active:scale-95"
                >
                  সব খুলুন
                </button>

                <button
                  onClick={collapseAllAccordions}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors whitespace-nowrap active:scale-95"
                >
                  সব বন্ধ
                </button>
              </div>
            </div>

            {/* USER-WISE GROUPED ACCORDIONS */}
            <div className="space-y-4">
              {userGroups.map((group) => {
                const isExpanded = expandedUserIds.has(group.userId);
                const flaggedInGroup = group.posters.filter((p) => p.isFlagged).length;

                return (
                  <div
                    key={group.userId}
                    className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
                  >
                    {/* User Accordion Header */}
                    <button
                      type="button"
                      onClick={() => toggleUserAccordion(group.userId)}
                      className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl theme-subtle-bg border theme-border flex items-center justify-center font-black text-sm flex-shrink-0">
                          {group.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                              {group.name}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                group.role === 'admin'
                                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {group.role === 'admin' ? '🛡️ অ্যাডমিন' : '👤 ইউজার'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{group.emailOrPhone}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                        {flaggedInGroup > 0 && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] bg-rose-500 text-white font-bold animate-pulse whitespace-nowrap">
                            ⚠️ {flaggedInGroup}টি ফ্ল্যাগড
                          </span>
                        )}

                        <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold whitespace-nowrap">
                          {group.posters.length}টি পোস্টার
                        </span>

                        <div className="p-1 rounded-lg text-slate-400">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </button>

                    {/* Accordion Body: User's Posters Grid */}
                    {isExpanded && (
                      <div className="p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 animate-in fade-in duration-200">
                        {group.posters.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            এই ব্যবহারকারী এখনও কোনো পোস্টার তৈরি করেননি।
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {group.posters.map((poster) => (
                              <div
                                key={poster._id}
                                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all space-y-3 shadow-sm ${
                                  poster.isFlagged
                                    ? 'border-rose-500/60 bg-rose-50/20 dark:bg-rose-950/20'
                                    : 'border-slate-200 dark:border-slate-800'
                                }`}
                              >
                                {/* Header badge */}
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">
                                      {poster.formData.candidateName}
                                    </h4>
                                    <p className="text-[11px] theme-text-accent font-semibold line-clamp-1">
                                      {poster.formData.designation} — {poster.formData.organizationOrParty}
                                    </p>
                                  </div>

                                  {poster.isFlagged ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-black">
                                      ফ্ল্যাগড
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] theme-subtle-bg theme-text-accent font-bold">
                                      স্বাভাবিক
                                    </span>
                                  )}
                                </div>

                                {/* Poster Preview Image */}
                                <div
                                  onClick={() => setSelectedPoster(poster)}
                                  className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center cursor-pointer group"
                                >
                                  {poster.generatedImageUrl ? (
                                    <img
                                      src={poster.generatedImageUrl}
                                      alt={poster.formData.candidateName}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                  ) : (
                                    <div className="text-center p-3 text-slate-500 text-xs">
                                      ছবি উপস্থিত নেই
                                    </div>
                                  )}

                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                                    <Eye className="w-4 h-4 text-amber-400" />
                                    <span>বড় করে দেখুন</span>
                                  </div>
                                </div>

                                {/* Poster Headline & Slogan */}
                                <div className="text-[11px] space-y-0.5 text-slate-600 dark:text-slate-400">
                                  <p className="line-clamp-1">
                                    <strong className="text-slate-800 dark:text-slate-200">হেডলাইন:</strong> {poster.formData.headline}
                                  </p>
                                  <p className="line-clamp-1 italic text-slate-500">
                                    "{poster.formData.slogan}"
                                  </p>
                                  {poster.isFlagged && poster.flagReason && (
                                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 font-bold text-[10px]">
                                      কারণ: {poster.flagReason}
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                                  <button
                                    onClick={() => handleFlagToggle(poster)}
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                      poster.isFlagged
                                        ? 'theme-subtle-bg theme-text-accent'
                                        : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                                    }`}
                                  >
                                    <Flag className="w-3 h-3" />
                                    <span>{poster.isFlagged ? 'ফ্ল্যাগ সরান' : 'ফ্ল্যাগ করুন'}</span>
                                  </button>

                                  {poster.generatedImageUrl && (
                                    <button
                                      onClick={() => handleDownloadPoster(poster)}
                                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:theme-text-accent hover:theme-subtle-bg transition-colors"
                                      title="ডাউনলোড"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  <button
                                    onClick={() => promptDeletePoster(poster)}
                                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                                    title="মুছে ফেলুন"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {userGroups.length === 0 && (
                <div className="py-16 text-center text-slate-500 text-xs">
                  কোনো ইউজার বা পোস্টার পাওয়া যায়নি।
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TEMPLATES MANAGEMENT */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                পোস্টার টেমপ্লেট লাইব্রেরি ({templates.length}টি সক্রিয়)
              </h3>
              <button
                onClick={() => {
                  setEditingTemplateId(null);
                  setTemplateForm({
                    title: '',
                    banglaTitle: '',
                    occasionType: 'shuvechcha',
                    thumbnailUrl: '',
                    defaultHeadline: '',
                    defaultSubheadline: '',
                    defaultSlogan: '',
                    primaryColor: '#006a4e',
                    secondaryColor: '#f42a41',
                    accentColor: '#ffd700',
                    backgroundColor: '#042f2e',
                    footerBg: '#021e1d',
                    maxTopLeaders: 2,
                    bgMotifType: 'monument',
                    borderStyle: 'golden_floral',
                  });
                  setIsTemplateModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl theme-btn-primary text-xs font-bold active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন টেমপ্লেট যোগ করুন</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((tpl) => (
                <div
                  key={tpl._id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-950 relative flex items-center justify-center border border-slate-800 group">
                    <img
                      src={getTemplateThumbnail(tpl)}
                      alt={tpl.banglaTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/templates/thumbnails/mourning.svg';
                      }}
                    />
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-amber-400 border border-amber-400/20">
                      {tpl.occasionType}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {tpl.banglaTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500">{tpl.title}</p>
                    <p className="text-[10px] theme-text-accent font-semibold">
                      উপলক্ষ: {tpl.occasionType} | সর্বোচ্চ নেতা: {tpl.layoutConfig?.maxTopLeaders ?? 2} জন
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setEditingTemplateId(tpl._id);
                        setTemplateForm({
                          title: tpl.title,
                          banglaTitle: tpl.banglaTitle,
                          occasionType: tpl.occasionType,
                          thumbnailUrl: tpl.thumbnailUrl,
                          defaultHeadline: tpl.layoutConfig?.defaultHeadline || '',
                          defaultSubheadline: tpl.layoutConfig?.defaultSubheadline || '',
                          defaultSlogan: tpl.layoutConfig?.defaultSlogan || '',
                          primaryColor: tpl.layoutConfig?.colorScheme?.primary || '#006a4e',
                          secondaryColor: tpl.layoutConfig?.colorScheme?.secondary || '#f42a41',
                          accentColor: tpl.layoutConfig?.colorScheme?.accent || '#ffd700',
                          backgroundColor: tpl.layoutConfig?.colorScheme?.background || '#042f2e',
                          footerBg: tpl.layoutConfig?.colorScheme?.footerBg || '#021e1d',
                          maxTopLeaders: tpl.layoutConfig?.maxTopLeaders || 2,
                          bgMotifType: tpl.layoutConfig?.bgMotifType || 'monument',
                          borderStyle: tpl.layoutConfig?.borderStyle || 'golden_floral',
                        });
                        setIsTemplateModalOpen(true);
                      }}
                      className="text-xs theme-text-accent font-bold hover:underline"
                    >
                      এডিট করুন
                    </button>

                    <button
                      onClick={() => promptDeleteTemplate(tpl)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              নিবন্ধিত ব্যবহারকারী তালিকা ({usersList.length} জন)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                    <th className="pb-3">ব্যবহারকারীর নাম</th>
                    <th className="pb-3">ইমেইল / ফোন</th>
                    <th className="pb-3">রোল</th>
                    <th className="pb-3">নিবন্ধনের তারিখ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usersList.map((u) => (
                    <tr key={u.id || u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-2xl theme-subtle-bg theme-text-accent flex items-center justify-center font-bold">
                          {u.name.charAt(0)}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="py-3 text-slate-700 dark:text-slate-300">
                        {u.emailOrPhone}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {u.role === 'admin' ? '🛡️ অ্যাডমিন' : '👤 সাধারণ ইউজার'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('bn-BD') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: POSTER DETAIL & MODERATION */}
      {selectedPoster && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 theme-text-accent" />
                <span>পোস্টার মডারেশন ও প্রিভিউ</span>
              </h3>
              <button
                onClick={() => setSelectedPoster(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                {selectedPoster.generatedImageUrl ? (
                  <img
                    src={selectedPoster.generatedImageUrl}
                    alt={selectedPoster.formData.candidateName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-xs text-slate-500">ছবি পাওয়া যায়নি</p>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">প্রার্থীর নাম ও পদবী:</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedPoster.formData.candidateName} ({selectedPoster.formData.designation})
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">সংগঠন / দল:</span>
                  <p className="text-slate-800 dark:text-slate-200 font-semibold">
                    {selectedPoster.formData.organizationOrParty}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">হেডলাইন ও স্লোগান:</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    {selectedPoster.formData.headline}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    "{selectedPoster.formData.slogan}"
                  </p>
                </div>

                {/* Moderation Actions in Modal */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    ফ্ল্যাগ করার কারণ:
                  </label>
                  <input
                    type="text"
                    value={flagReasonInput}
                    onChange={(e) => setFlagReasonInput(e.target.value)}
                    placeholder="যেমন: অবমাননাকর উক্তি বা অননুমোদিত প্রতীক"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-rose-500"
                  />

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleFlagToggle(selectedPoster)}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                        selectedPoster.isFlagged
                          ? 'theme-btn-primary'
                          : 'bg-rose-600 hover:bg-rose-500 text-white'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>{selectedPoster.isFlagged ? 'ফ্ল্যাগ প্রত্যাহার করুন' : 'ফ্ল্যাগ নিশ্চিত করুন'}</span>
                    </button>

                    {selectedPoster.generatedImageUrl && (
                      <button
                        type="button"
                        onClick={() => handleDownloadPoster(selectedPoster)}
                        className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:theme-subtle-bg hover:theme-text-accent text-slate-700 dark:text-slate-300 font-bold"
                        title="ডাউনলোড"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => promptDeletePoster(selectedPoster)}
                      className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 hover:text-rose-500 text-slate-600 dark:text-slate-300 font-bold"
                      title="স্থায়ীভাবে মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT TEMPLATE */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-bengali">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 theme-text-accent" />
                <span>{editingTemplateId ? 'টেমপ্লেট সম্পাদন করুন' : 'নতুন টেমপ্লেট তৈরি করুন'}</span>
              </h3>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    বাংলা শিরোনাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={templateForm.banglaTitle}
                    onChange={(e) => setTemplateForm({ ...templateForm, banglaTitle: e.target.value })}
                    placeholder="যেমন: মহান স্বাধীনতা দিবস ও কর্মী সমাবেশ"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none theme-ring-focus"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ইংরেজি টাইটেল *
                  </label>
                  <input
                    type="text"
                    required
                    value={templateForm.title}
                    onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                    placeholder="e.g., Independence Day Tribute Banner"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none theme-ring-focus"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    উপলক্ষ টাইপ (Occasion Type)
                  </label>
                  <select
                    value={templateForm.occasionType}
                    onChange={(e) => setTemplateForm({ ...templateForm, occasionType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none theme-ring-focus"
                  >
                    <option value="shuvechcha">শুভেচ্ছা ও সম্মেলন</option>
                    <option value="election_campaign">নির্বাচনী প্রচারণা (মেয়র/চেয়ারম্যান/এমপি)</option>
                    <option value="bijoy_dibosh">মহান বিজয় দিবস</option>
                    <option value="shadhinota_dibosh">মহান স্বাধীনতা দিবস</option>
                    <option value="shok_dibosh">শোক দিবস ও স্মরণসভা</option>
                    <option value="eid_celebration">পবিত্র ঈদুল ফিতর / আজহা</option>
                    <option value="pohela_boishakh">পহেলা বৈশাখ</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    সর্বোচ্চ শীর্ষ নেতা সংখ্যা
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={templateForm.maxTopLeaders}
                    onChange={(e) => setTemplateForm({ ...templateForm, maxTopLeaders: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none theme-ring-focus"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ডিফল্ট হেডলাইন
                </label>
                <input
                  type="text"
                  value={templateForm.defaultHeadline}
                  onChange={(e) => setTemplateForm({ ...templateForm, defaultHeadline: e.target.value })}
                  placeholder="যেমন: বিশাল নির্বাচনী জনসভা সফল হোক"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none theme-ring-focus"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ডিফল্ট স্লোগান
                </label>
                <input
                  type="text"
                  value={templateForm.defaultSlogan}
                  onChange={(e) => setTemplateForm({ ...templateForm, defaultSlogan: e.target.value })}
                  placeholder="যেমন: জনগণের অধিকার আদায়ে আপসহীন সংগ্রাম"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none theme-ring-focus"
                />
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  কালার প্যালেট (Color Scheme)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">প্রাইমারি</span>
                    <input
                      type="color"
                      value={templateForm.primaryColor}
                      onChange={(e) => setTemplateForm({ ...templateForm, primaryColor: e.target.value })}
                      className="w-full h-8 rounded-lg cursor-pointer bg-transparent"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">সেকেন্ডারি</span>
                    <input
                      type="color"
                      value={templateForm.secondaryColor}
                      onChange={(e) => setTemplateForm({ ...templateForm, secondaryColor: e.target.value })}
                      className="w-full h-8 rounded-lg cursor-pointer bg-transparent"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">অ্যাকসেন্ট (গোল্ড)</span>
                    <input
                      type="color"
                      value={templateForm.accentColor}
                      onChange={(e) => setTemplateForm({ ...templateForm, accentColor: e.target.value })}
                      className="w-full h-8 rounded-lg cursor-pointer bg-transparent"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">ব্যাকগ্রাউন্ড</span>
                    <input
                      type="color"
                      value={templateForm.backgroundColor}
                      onChange={(e) => setTemplateForm({ ...templateForm, backgroundColor: e.target.value })}
                      className="w-full h-8 rounded-lg cursor-pointer bg-transparent"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">ফুটার ব্যাকগ্রাউন্ড</span>
                    <input
                      type="color"
                      value={templateForm.footerBg}
                      onChange={(e) => setTemplateForm({ ...templateForm, footerBg: e.target.value })}
                      className="w-full h-8 rounded-lg cursor-pointer bg-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl theme-btn-primary font-bold active:scale-95 transition-all"
                >
                  {editingTemplateId ? 'আপডেট করুন' : 'টেমপ্লেট তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title={deleteModal.title}
        description={deleteModal.description}
        confirmText="হ্যাঁ, মুছে ফেলুন"
        cancelText="বাতিল"
        isDestructive={true}
        isLoading={deleteModal.isLoading}
        itemPreview={
          deleteModal.subtitle || deleteModal.imageUrl
            ? {
                title: deleteModal.subtitle,
                imageUrl: deleteModal.imageUrl,
              }
            : undefined
        }
      />
    </div>
  );
}
