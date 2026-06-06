export type LanguageCode = 'kn' | 'ta' | 'hi' | 'te' | 'ml' | 'bn' | 'mr' | 'pa' | 'en';

export interface TranslationSet {
  appName: string;
  tabs: {
    home: string;
    community: string;
    marketplace: string;
    assistant: string;
    profile: string;
  };
  home: {
    greeting: string;
    offlineMode: string;
    assistantShortcut: string;
    voiceSearchPlaceholder: string;
    quickActions: string;
    cropDoctor: string;
    irrigation: string;
    schemes: string;
    rental: string;
    weatherCard: string;
    currentWeather: string;
    humidity: string;
    rainfallChance: string;
    alertTitle: string;
    forecast: string;
    cropPrices: string;
    currentMarketPrice: string;
    predictedPrice: string;
    predictionTitle: string;
    demandLevel: string;
    profitPotential: string;
    climateRisk: string;
    growReminders: string;
    waterReminder: string;
    pestReminder: string;
    fertilizerReminder: string;
    governmentSchemes: string;
    applyNow: string;
  };
  community: {
    title: string;
    createPost: string;
    postPlaceholder: string;
    postButton: string;
    comments: string;
    addCommentPlaceholder: string;
    voicePostBtn: string;
    shareImageBtn: string;
    verifiedFarmer: string;
  };
  marketplace: {
    title: string;
    sellTitle: string;
    sellDescription: string;
    cropName: string;
    quantity: string;
    price: string;
    imageUpload: string;
    submitOffer: string;
    buyNow: string;
    negotiate: string;
    verifiedSeller: string;
    searchPlaceholder: string;
  };
  assistant: {
    title: string;
    welcomeMessage: string;
    voiceRecording: string;
    speakInstruction: string;
    cropDoctorTitle: string;
    cropDoctorDesc: string;
    uploadLeaf: string;
    diagnoseBtn: string;
    diagnosisResult: string;
    suggestion: string;
    backBtn: string;
    askPlaceholder: string;
    sendBtn: string;
  };
  profile: {
    title: string;
    farmerName: string;
    farmLocation: string;
    languageSettings: string;
    notificationTitle: string;
    notificationDesc: string;
    reportsTitle: string;
    reportsDesc: string;
    eligibilityTitle: string;
    eligibilityDesc: string;
    financeTitle: string;
    financeDesc: string;
    sustainabilityScore: string;
  };
  common: {
    loading: string;
    success: string;
    error: string;
    retry: string;
    otpTitle: string;
    otpSubtitle: string;
    phonePlaceholder: string;
    sendOtp: string;
    verifyOtp: string;
    otpPlaceholder: string;
    guestLogin: string;
  };
}

export interface WeatherAlert {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'danger';
  message: string;
  time: string;
}

export interface CropPrice {
  id: string;
  name: string;
  price: string;
  trend: 'up' | 'down' | 'stable';
  change: string;
  demand: 'HIGH' | 'MEDIUM' | 'LOW';
  profit: 'HIGH' | 'MEDIUM' | 'LOW';
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  nextSeasonPredicted: string;
}

export interface Post {
  id: string;
  author: string;
  authorUid?: string;
  authorAvatar?: string;
  isVerified: boolean;
  content: string;
  image?: string;
  voiceUrl?: string;
  voiceCaption?: string;
  likes: number;
  likedBy?: string[];
  district?: string;
  village?: string;
  category?: string;
  comments: Comment[];
  time: string;
  createdAt?: string;
}

export interface Comment {
  id: string;
  author: string;
  authorUid?: string;
  content: string;
  time: string;
  createdAt?: string;
}

export interface ProductItem {
  id: string;
  title: string;
  seller: string;
  location: string;
  price: string;
  quantity: string;
  image: string;
  isVerified: boolean;
  phone: string;
}

export interface GovernmentScheme {
  id: string;
  title: string;
  benefit: string;
  eligible: string;
  status: 'eligible' | 'not_eligible' | 'checking';
}

export interface DiseaseReport {
  id: string;
  timestamp: string;
  imageUrl: string;
  diseaseName: string;
  confidence: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  symptoms: string;
  treatmentSuggestions: string;
  organicControl: string; // organic treatment
  chemicalControl: string; // chemical treatment
  preventionTips: string;
  language: string;
}

