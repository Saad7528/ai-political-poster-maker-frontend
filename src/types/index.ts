export type PosterArchetype =
  | 'gemini_ai_masterpiece'    // ✨ জেমিনি এআই ডাইনামিক মাস্টারপিস
  | 'bwp_election'             // 🖤 ক্লাসিক প্রেস ব্ল্যাক-অ্যান্ড-হোয়াইট
  | 'color_upazila_mayor'      // 🎨 উপজেলা ও পৌরসভা নির্বাচন কালারফুল
  | 'party_anniversary'        // 🌾 দলের প্রতিষ্ঠাবার্ষিকী ও সমাবেশ
  | 'festive_eid_greeting'     // 🌙 পবিত্র ঈদ ও উৎসবের শুভেচ্ছা
  | 'jamaat_insaf'             // ⚖️ ইনসাফ ও সৎ নেতৃত্বের নির্বাচন
  | 'patriotic_victory';       // 🟢🔴 মহান বিজয় দিবস ও জাতীয় দিবস

export interface ILayoutConfig {
  maxTopLeaders: number;
  topLeaderFrameStyle: 'oval' | 'circle' | 'arch';
  candidatePosition: 'bottom-left' | 'bottom-right' | 'bottom-center';
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    footerBg: string;
    headerTextColor: string;
    bodyTextColor: string;
  };
  defaultHeadline: string;
  defaultSubheadline?: string;
  defaultSlogan?: string;
  bgMotifType: 'monument' | 'wreath' | 'campaign_crowd' | 'eid_crescent' | 'floral' | 'halftone_dots' | 'clock_tower';
  borderStyle: 'golden_floral' | 'clean_double' | 'patriotic_ribbon' | 'islamic_arch' | 'newspaper_press';
}

export interface ITemplate {
  _id: string;
  title: string;
  banglaTitle: string;
  occasionType:
    | 'bijoy_dibosh'
    | 'shadhinota_dibosh'
    | 'shok_dibosh'
    | 'election_campaign'
    | 'eid_celebration'
    | 'pohela_boishakh'
    | 'ekushey_february'
    | 'shuvechcha';
  archetype?: PosterArchetype;
  thumbnailUrl: string;
  layoutConfig: ILayoutConfig;
  isActive: boolean;
  recommendedParties?: string[];
}

export interface ITopLeader {
  url: string;
  name: string;
  title?: string;
  showTitle?: boolean;
  scale?: number;
  posX?: number;
  posY?: number;
}

export interface IPosterFormData {
  candidateName: string;
  designation: string;
  organizationOrParty: string;
  unionOrThana: string;
  district: string;
  constituencyName?: string;
  headline: string;
  subheadline: string;
  slogan: string;
  quote?: string;
  creditLine: string;
  selectedPartyKey: string;
  customPartySymbolUrl?: string;
  customSymbolName?: string;
  customPartyName?: string;
  archetype?: PosterArchetype;
  candidatePosition?: 'bottom-left' | 'bottom-right' | 'bottom-center';
  showLeaderTitles?: boolean;
  leadersFrameSize?: number;
  leaderTextSize?: number;
  leadersMarginTop?: number;
  canvasBgTheme?: 'dark_green' | 'clean_white' | 'royal_emerald' | 'national_red_green' | 'classic_bw';
  headlinePosX?: number;
  headlinePosY?: number;
  leftHeaderBadge?: string;
  rightHeaderBadge?: string;
  religiousHeader?: string;
  sloganFontSize?: number;
  sloganPosX?: number;
  sloganPosY?: number;
  symbolSize?: number;
  symbolPosX?: number;
  symbolPosY?: number;
  candidateNameFontSize?: number;
  designationFontSize?: number;
  footerPosX?: number;
  footerPosY?: number;
  candidateAdjustments?: ICandidatePhotoAdjustments;
}

export interface ICandidatePhotoAdjustments {
  scale: number;
  posX: number;
  posY: number;
  frameStyle: 'cutout' | 'circle' | 'clean_circle' | 'arch' | 'rounded_rect' | 'oval';
  frameSize?: number;
  framePosX?: number;
  framePosY?: number;
  enableGlow: boolean;
}

export interface IPoster {
  _id: string;
  userId: string | IUser;
  templateId: ITemplate | string;
  formData: IPosterFormData;
  topLeadersPhotos: ITopLeader[];
  candidatePhotoUrl: string;
  candidateAdjustments?: ICandidatePhotoAdjustments;
  partySymbolUrl?: string;
  generatedImageUrl?: string;
  pdfExportUrl?: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  errorMessage?: string;
  retryCount: number;
  aiEnhanced: boolean;
  isFlagged?: boolean;
  flagReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  id?: string;
  _id?: string;
  name: string;
  emailOrPhone: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  createdAt?: string;
}

export interface IAdminStats {
  totalUsers: number;
  totalPosters: number;
  completedPosters: number;
  flaggedPosters: number;
  totalTemplates: number;
  recentPosters: IPoster[];
}


export interface IAISloganResponse {
  candidateName?: string;
  designation?: string;
  organizationOrParty?: string;
  constituencyName?: string;
  unionOrThana?: string;
  district?: string;
  selectedPartyKey?: string;
  primaryHeadline: string;
  subheadline: string;
  slogan: string;
  quote?: string;
  creditLine: string;
  wishingMessage: string;
  recommendedArchetype: PosterArchetype;
  suggestedFrameStyle?: 'cutout' | 'oval' | 'circle' | 'arch';
  topLeaders?: Array<{ name: string; title: string }>;
  colorThemeRecommendation: {
    primary: string;
    secondary: string;
    accent: string;
  };
  generatedImageUrl?: string;
}
