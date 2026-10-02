export interface IPartyLeaderDefault {
  name: string;
  title: string;
  placeholder: string;
}

export interface IPartyInfo {
  id: string;
  name: string;
  banglaName: string;
  symbolName: string;
  symbolBanglaName: string;
  symbolUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  gradient: string;
  religiousHeader?: string;
  partySloganBadge?: string;
  defaultLeaders: IPartyLeaderDefault[];
}

export const BANGLADESHI_POLITICAL_PARTIES: IPartyInfo[] = [
  {
    id: 'bnp',
    name: 'Bangladesh Nationalist Party',
    banglaName: 'বাংলাদেশ জাতীয়তাবাদী দল (বিএনপি)',
    symbolName: 'Sheaf of Paddy',
    symbolBanglaName: 'ধানের শীষ',
    symbolUrl: '/symbols/dhaner_shish.svg',
    primaryColor: '#006a4e',
    secondaryColor: '#dc2626',
    accentColor: '#fbbf24',
    gradient: 'from-emerald-950 via-emerald-900 to-slate-950',
    religiousHeader: 'বিসমিল্লাহির রাহমানির রাহিম',
    partySloganBadge: 'বাংলাদেশ জিন্দাবাদ',
    defaultLeaders: [
      { name: 'শহীদ জিয়াউর রহমান', title: 'স্বাধীনতার ঘোষক ও প্রতিষ্ঠাতা', placeholder: 'শহীদ জিয়াউর রহমান' },
      { name: 'বেগম খালেদা জিয়া', title: 'সাবেক তিনবারের সফল প্রধানমন্ত্রী', placeholder: 'বেগম খালেদা জিয়া' },
      { name: 'তারেক রহমান', title: 'ভারপ্রাপ্ত চেয়ারম্যান', placeholder: 'তারেক রহমান' },
    ],
  },
  {
    id: 'jamaat',
    name: 'Bangladesh Jamaat-e-Islami',
    banglaName: 'বাংলাদেশ জামায়াতে ইসলামী',
    symbolName: 'Balance Scale',
    symbolBanglaName: 'দাঁড়িপাল্লা',
    symbolUrl: '/symbols/daripalle.svg',
    primaryColor: '#064e3b',
    secondaryColor: '#0284c7',
    accentColor: '#facc15',
    gradient: 'from-emerald-950 via-teal-900 to-slate-950',
    religiousHeader: 'বিসমিল্লাহির রাহমানির রাহিম',
    partySloganBadge: 'আল্লাহর আইন চাই, সৎ লোকের শাসন চাই',
    defaultLeaders: [
      { name: 'আমীরে জামায়াত', title: 'বাংলাদেশ জামায়াতে ইসলামী', placeholder: 'আমীরে জামায়াত' },
      { name: 'সেক্রেটারি জেনারেল', title: 'বাংলাদেশ জামায়াতে ইসলামী', placeholder: 'সেক্রেটারি জেনারেল' },
      { name: 'জেলা আমীর', title: 'সম্মানিত জেলা আমীর', placeholder: 'জেলা আমীর' },
    ],
  },
  {
    id: 'al',
    name: 'Bangladesh Awami League',
    banglaName: 'বাংলাদেশ আওয়ামী লীগ',
    symbolName: 'Boat',
    symbolBanglaName: 'নৌকা',
    symbolUrl: '/symbols/nouka.svg',
    primaryColor: '#15803d',
    secondaryColor: '#b91c1c',
    accentColor: '#fbbf24',
    gradient: 'from-green-950 via-emerald-900 to-slate-950',
    religiousHeader: 'জয় বাংলা, জয় বঙ্গবন্ধু',
    partySloganBadge: 'উন্নয়ন ও সমৃদ্ধির প্রতীক',
    defaultLeaders: [
      { name: 'বঙ্গবন্ধু শেখ মুজিবুর রহমান', title: 'জাতির জনক', placeholder: 'বঙ্গবন্ধু শেখ মুজিবুর রহমান' },
      { name: 'দলীয় প্রধান', title: 'সভানেত্রী', placeholder: 'দলীয় প্রধান' },
      { name: 'সাধারণ সম্পাদক', title: 'কেন্দ্রীয় কমিটি', placeholder: 'সাধারণ সম্পাদক' },
    ],
  },
  {
    id: 'jp',
    name: 'Jatiya Party',
    banglaName: 'জাতীয় পার্টি (এরশাদ)',
    symbolName: 'Plow',
    symbolBanglaName: 'লাঙল',
    symbolUrl: '/symbols/langol.svg',
    primaryColor: '#1e3a8a',
    secondaryColor: '#b91c1c',
    accentColor: '#f59e0b',
    gradient: 'from-blue-950 via-slate-900 to-slate-950',
    religiousHeader: 'বিসমিল্লাহির রাহমানির রাহিম',
    partySloganBadge: 'পল্লীবন্ধুর আদর্শে নতুন বাংলাদেশ',
    defaultLeaders: [
      { name: 'পল্লীবন্ধু এরশাদ', title: 'প্রতিষ্ঠাতা চেয়ারম্যান', placeholder: 'পল্লীবন্ধু এরশাদ' },
      { name: 'চেয়ারম্যান', title: 'জাতীয় পার্টি', placeholder: 'চেয়ারম্যান' },
      { name: 'মহাসচিব', title: 'জাতীয় পার্টি', placeholder: 'মহাসচিব' },
    ],
  },
  {
    id: 'gono_odhikar',
    name: 'Gono Odhikar Parishad',
    banglaName: 'গণঅধিকার পরিষদ (জিওপি)',
    symbolName: 'Truck',
    symbolBanglaName: 'ট্রাক',
    symbolUrl: '/symbols/truck.svg',
    primaryColor: '#831843',
    secondaryColor: '#0f766e',
    accentColor: '#fbbf24',
    gradient: 'from-pink-950 via-slate-900 to-teal-950',
    religiousHeader: 'জনতার অধিকার, আমাদের অঙ্গীকার',
    partySloganBadge: 'নতুন ধারার রাজনীতি',
    defaultLeaders: [
      { name: 'নুরুল হক নুর', title: 'সভাপতি', placeholder: 'নুরুল হক নুর' },
      { name: 'রাশেদ খান', title: 'সাধারণ সম্পাদক', placeholder: 'রাশেদ খান' },
      { name: 'যুব ও ছাত্র নেতৃত্ব', title: 'গণঅধিকার পরিষদ', placeholder: 'যুব ও ছাত্র নেতৃত্ব' },
    ],
  },
  {
    id: 'independent',
    name: 'Independent Candidate',
    banglaName: 'স্বতন্ত্র / নিরপেক্ষ প্রার্থী',
    symbolName: 'Custom Symbol',
    symbolBanglaName: 'পছন্দের প্রতীক',
    symbolUrl: '/symbols/shupari.svg',
    primaryColor: '#334155',
    secondaryColor: '#dc2626',
    accentColor: '#fbbf24',
    gradient: 'from-slate-950 via-slate-900 to-zinc-950',
    religiousHeader: 'বিসমিল্লাহির রাহমানির রাহিম',
    partySloganBadge: 'সততা ও উন্নয়নের প্রত্যয়',
    defaultLeaders: [
      { name: 'মরহুম পিতা/মাতা', title: 'দোয়া ও আশির্বাদ', placeholder: 'পিতা/মাতা' },
      { name: 'গুরুজন / মুরুব্বি', title: 'পরামর্শক', placeholder: 'মুরুব্বি' },
    ],
  },
];
