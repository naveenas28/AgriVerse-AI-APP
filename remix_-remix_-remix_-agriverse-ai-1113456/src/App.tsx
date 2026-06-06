import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Users,
  ShoppingBag,
  MessageSquare,
  User,
  CheckCircle,
  AlertTriangle,
  CloudRain,
  Droplets,
  Mic,
  MicOff,
  Camera,
  ChevronRight,
  ChevronDown,
  Send,
  Phone,
  Plus,
  ArrowRight,
  Info,
  DollarSign,
  Download,
  Award,
  Globe,
  TrendingUp,
  Volume2,
  X,
  Bell,
  Sparkles,
  FileText,
  Bookmark,
  ShieldCheck,
  Check,
  RotateCcw,
  Brain
} from 'lucide-react';
import { TRANSLATIONS, LANGUAGES, MOCK_WEATHER_ALERTS, MOCK_CROP_PRICES, MOCK_COMMUNITY_FEED, MOCK_MARKET_ITEMS, MOCK_GOV_SCHEMES } from './data';
import { LanguageCode, Post, ProductItem, GovernmentScheme, CropPrice } from './types';
const WeatherIntelligence = React.lazy(() => import('./components/WeatherIntelligence').then(m => ({ default: m.WeatherIntelligence })));
const SmartIrrigationAdvisor = React.lazy(() => import('./components/SmartIrrigationAdvisor').then(m => ({ default: m.SmartIrrigationAdvisor })));
const AICropPredictionSystem = React.lazy(() => import('./components/AICropPredictionSystem').then(m => ({ default: m.AICropPredictionSystem })));
const VoicePostsSystem = React.lazy(() => import('./components/VoicePostsSystem').then(m => ({ default: m.VoicePostsSystem })));
const FarmerChatSystem = React.lazy(() => import('./components/FarmerChatSystem').then(m => ({ default: m.FarmerChatSystem })));
const CooperativeNetwork = React.lazy(() => import('./components/CooperativeNetwork').then(m => ({ default: m.CooperativeNetwork })));
const TrustAndIntelligenceHub = React.lazy(() => import('./components/TrustAndIntelligenceHub').then(m => ({ default: m.TrustAndIntelligenceHub })));
const SmartFarmAIHub = React.lazy(() => import('./components/SmartFarmAIHub').then(m => ({ default: m.SmartFarmAIHub })));
import { auth, db, storage } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.75): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function App() {
  const [firebaseAuthUid, setFirebaseAuthUid] = useState<string>('guest_uid');
  const [firebaseAuthName, setFirebaseAuthName] = useState<string>('Farmer Partner');

  // Phase 5 Advanced states (Admin, Sync, Memory collections)
  const [reports, setReports] = useState<any[]>([]);
  const [moderationLogs, setModerationLogs] = useState<any[]>([]);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [chatbotMemories, setChatbotMemories] = useState<any | null>(null);

  // Mobile app navigation state & configuration settings
  const [currentLang, setCurrentLang] = useState<LanguageCode>(() => {
    return (localStorage.getItem('agri_lang') as LanguageCode) || 'en';
  });
  const [activeTab, setActiveTab] = useState<'home' | 'community' | 'marketplace' | 'assistant' | 'profile'>('home');
  const [showWeatherHub, setShowWeatherHub] = useState<boolean>(false);
  const [showIrrigationHub, setShowIrrigationHub] = useState<boolean>(false);
  const [showCropPredictionHub, setShowCropPredictionHub] = useState<boolean>(false);
  const [showSmartFarmAIHub, setShowSmartFarmAIHub] = useState<boolean>(false);
  const [showCooperativeHub, setShowCooperativeHub] = useState<boolean>(false);
  const [assistantMode, setAssistantMode] = useState<'doctor' | 'chat'>('doctor');

  // Sync currentLang changes to local storage & Firestore preference
  useEffect(() => {
    localStorage.setItem('agri_lang', currentLang);
    if (firebaseAuthUid && firebaseAuthUid !== 'guest_uid') {
      const profileRef = doc(db, 'users', firebaseAuthUid);
      setDoc(profileRef, { 'language preference': currentLang }, { merge: true }).catch(err => {
        console.warn("Firestore language sync bypassed:", err);
      });
    }
  }, [currentLang, firebaseAuthUid]);

  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);
  const [eligibleResponses, setEligibleResponses] = useState<Record<string, { landOk: boolean; bankOk: boolean }>>({});

  // Multi User Auth state - simulated high fidelity OTP
  const [userPhone, setUserPhone] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [sentOtp, setSentOtp] = useState<string>('');
  const [isJoined, setIsJoined] = useState<boolean>(() => {
    return localStorage.getItem('agri_verified_farmer') === 'true';
  });
  const [showOtpScreen, setShowOtpScreen] = useState<boolean>(false);
  const [systemAlertMessage, setSystemAlertMessage] = useState<string | null>(null);

  // Database lists synced from backend
  const [posts, setPosts] = useState<Post[]>(MOCK_COMMUNITY_FEED);
  const [products, setProducts] = useState<ProductItem[]>(MOCK_MARKET_ITEMS);
  const [schemes, setSchemes] = useState<GovernmentScheme[]>(MOCK_GOV_SCHEMES);

  // Post Submission parameters
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [selectedPostImage, setSelectedPostImage] = useState<string | null>(null);
  const [selectedProductImage, setSelectedProductImage] = useState<string | null>(null);
  const [activePostComments, setActivePostComments] = useState<Record<string, string>>({});

  // Farmer Social Community System Additional States
  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('agri_saved_posts') || '[]');
  });
  const [followedFarmers, setFollowedFarmers] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('agri_followed_farmers') || '[]');
  });
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [communityTab, setCommunityTab] = useState<'all' | 'saved' | 'trending'>('all');
  const [communitySubTab, setCommunitySubTab] = useState<'feed' | 'voice' | 'chat' | 'coop'>('feed');

  // Real-time Notifications system hook states
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [showNotificationPane, setShowNotificationPane] = useState(false);

  // Live real-time notification synchronization listener
  useEffect(() => {
    if (!firebaseAuthUid || firebaseAuthUid === 'guest_uid') return;

    const notifQuery = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notifQuery, (snapshot) => {
      const allNotifs: any[] = [];
      let unreadCounter = 0;

      snapshot.forEach((docSnapshot) => {
        const notifData = docSnapshot.data();
        if (notifData.recipientUid === firebaseAuthUid) {
          allNotifs.push({
            id: docSnapshot.id,
            ...notifData,
          });
          if (!notifData.read) {
            unreadCounter++;
          }
        }
      });

      setNotificationsList((prev) => {
        if (allNotifs.length > prev.length) {
          const newest = allNotifs[0];
          if (newest && newest.recipientUid === firebaseAuthUid && !newest.read) {
            setSystemAlertMessage(`🔔 ${newest.title}: ${newest.body}`);
          }
        }
        return allNotifs;
      });

      setUnreadNotificationsCount(unreadCounter);
    });

    return () => unsubscribe();
  }, [firebaseAuthUid]);

  // Real-time Centralized Farmer Profile States
  const [profileName, setProfileName] = useState<string>('');
  const [profileDistrict, setProfileDistrict] = useState<string>('Chikkaballapura');
  const [profileVillage, setProfileVillage] = useState<string>('Anemadagu');
  const [profileCropFocus, setProfileCropFocus] = useState<string>('Tomato');
  const [profileIrrigationType, setProfileIrrigationType] = useState<string>('Drip');
  const [profileOrganicScore, setProfileOrganicScore] = useState<number>(65);
  const [profileCrops, setProfileCrops] = useState<string[]>(['Tomato']);
  const [profileCooperativeId, setProfileCooperativeId] = useState<string>('coop_chikka');
  const [profileMarketplaceActivity, setProfileMarketplaceActivity] = useState<any>({ listingsCreated: 0, offersMade: 0, purchases: 0 });
  const [profileAiHistory, setProfileAiHistory] = useState<any[]>([]);
  const [profileNotificationSettings, setProfileNotificationSettings] = useState<any>({ smsEnabled: true, pushEnabled: true, outbreakAlerts: true });

  // Dynamic Realtime Centralized Profile Subscription
  useEffect(() => {
    if (!firebaseAuthUid || firebaseAuthUid === 'guest_uid') return;

    const profileRef = doc(db, 'users', firebaseAuthUid);
    const unsub = onSnapshot(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.data();
        setProfileName(val.fullName || val.name || 'Naveen S');
        setProfileDistrict(val.district || 'Chikkaballapura');
        setProfileVillage(val.village || 'Anemadagu');
        setProfileCropFocus(val.cropFocus || (val.crops && val.crops[0]) || 'Tomato');
        setProfileIrrigationType(val.irrigationType || 'Drip');
        setProfileOrganicScore(val.organicScore || 65);
        setProfileCrops(val.crops || (val.cropFocus ? [val.cropFocus] : ['Tomato']));
        setProfileCooperativeId(val.cooperativeId || 'coop_chikka');
        setProfileMarketplaceActivity(val.marketplaceActivity || { listingsCreated: 0, offersMade: 0, purchases: 0 });
        setProfileAiHistory(val.aiHistory || val['AI history'] || []);
        setProfileNotificationSettings(val.notificationSettings || val['notification settings'] || { smsEnabled: true, pushEnabled: true, outbreakAlerts: true });

        const computedName = val.fullName || val.name;
        if (computedName) {
          setFirebaseAuthName(computedName);
          localStorage.setItem('agri_partner_name', computedName);
        }
      } else {
        // Bootstrap initial profile document
        const initialProfile = {
          farmerId: firebaseAuthUid,
          fullName: 'Naveen S',
          name: 'Naveen S',
          district: 'Chikkaballapura',
          village: 'Anemadagu',
          cropFocus: 'Tomato',
          crops: ['Tomato', 'Sugarcane', 'Paddy'],
          irrigationType: 'Drip',
          organicScore: 65,
          cooperativeId: 'coop_chikka',
          marketplaceActivity: {
            listingsCreated: 0,
            offersMade: 0,
            purchases: 0
          },
          'AI history': [
            { type: 'Pest Prediction', query: 'Tomato Plot Disease Risk', date: new Date().toISOString() }
          ],
          'notification settings': {
            pushEnabled: true,
            smsEnabled: true,
            outbreakAlerts: true,
            marketTips: true
          },
          'language preference': currentLang || 'kn',
          registeredAt: new Date().toISOString()
        };
        setDoc(profileRef, initialProfile).catch(e => console.log("Profile boot bypassed:", e));
      }
    });

    return () => unsub();
  }, [firebaseAuthUid]);

  // Sync anonymous authentication internally
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseAuthUid(user.uid);
        const nameVal = localStorage.getItem('agri_partner_name') || 'Raiyata Partner';
        setFirebaseAuthName(nameVal);
      } else {
        signInAnonymously(auth).catch((err) => console.log('Auth handler bypassed:', err));
      }
    });
    return () => unsub();
  }, []);

  // Register push notifications subscription dynamically inside PWA
  const registerPushSubscription = async (uid: string) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const sub = await registration.pushManager.getSubscription() || await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BEl62wp919X-4YqS6ECT3Y4jGD5V5v31_m89_b874-placeholder'
        });
        
        await addDoc(collection(db, 'pushSubscriptions'), {
          uid: uid,
          subscription: JSON.parse(JSON.stringify(sub)),
          createdAt: new Date().toISOString()
        });
        console.log("PWA FCM Subscribed: saved subscription details locally in Firestore!");
      }
    } catch (e) {
      console.log("Device push token bypassed or offline:", e);
    }
  };

  // Run initializations on user identification
  useEffect(() => {
    if (!firebaseAuthUid || firebaseAuthUid === 'guest_uid') return;

    // A. Sync PWA Push token
    registerPushSubscription(firebaseAuthUid);

    // B. Manage synchronized presence across devices
    const presenceRef = doc(db, 'presence', firebaseAuthUid);
    const updatePresence = async () => {
      try {
        await setDoc(presenceRef, {
          uid: firebaseAuthUid,
          lastActive: new Date().toISOString(),
          status: 'online',
          device: navigator.userAgent
        }, { merge: true });
      } catch (err) {
        console.warn("Presence sync shifted cache-offline:", err);
      }
    };
    updatePresence();
    const interval = setInterval(updatePresence, 60000);

    // C. Real-time Reports and Moderation Logs Synchronizer
    const qReports = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubReports = onSnapshot(qReports, (snapshot) => {
      const reportsList: any[] = [];
      snapshot.forEach(doc => {
        reportsList.push({ id: doc.id, ...doc.data() });
      });
      setReports(reportsList);
    }, (err) => console.log("Report listener offline cache:", err));

    const qLogs = query(collection(db, 'moderationLogs'), orderBy('createdAt', 'desc'));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      const logsList: any[] = [];
      snapshot.forEach(doc => {
        logsList.push({ id: doc.id, ...doc.data() });
      });
      setModerationLogs(logsList);
    }, (err) => console.log("Logs listener offline cache:", err));

    // D. Chatbot Memory Synchronizer
    const memRef = doc(db, 'chatbotMemory', firebaseAuthUid);
    const unsubMem = onSnapshot(memRef, (snap) => {
      if (snap.exists()) {
        const memData = snap.data();
        setChatbotMemories(memData);
        // Sync local preferences on first load
        if (memData.farmerCrops) setProfileCrops(memData.farmerCrops);
        if (memData.district) setProfileDistrict(memData.district);
        if (memData.irrigationType) setProfileIrrigationType(memData.irrigationType);
        if (memData.preferredLanguage) setCurrentLang(memData.preferredLanguage);
      } else {
        const initialMem = {
          id: firebaseAuthUid,
          uid: firebaseAuthUid,
          farmerCrops: profileCrops || ['Tomato'],
          district: profileDistrict || 'Chikkaballapura',
          irrigationType: profileIrrigationType || 'Drip',
          pestHistory: ['early blight on tomato'],
          financialPatterns: { averageSpendRate: 1500, status: 'stable' },
          marketplaceBehavior: { listingsCount: profileMarketplaceActivity.listingsCreated || 0 },
          preferredLanguage: currentLang,
          updatedAt: new Date().toISOString()
        };
        setDoc(memRef, initialMem).catch(err => console.log("Memory set bypass:", err));
        setChatbotMemories(initialMem);
      }
    }, (err) => console.log("Memory listener offline cache:", err));

    return () => {
      clearInterval(interval);
      unsubReports();
      unsubLogs();
      unsubMem();
    };
  }, [firebaseAuthUid]);

  // E. Emergency alert system active listener
  useEffect(() => {
    const qAlerts = query(collection(db, 'emergencyAlerts'), orderBy('createdAt', 'desc'));
    const unsubAlerts = onSnapshot(qAlerts, (snapshot) => {
      if (!snapshot.empty) {
        const newestAlert = snapshot.docs[0].data();
        setSystemAlertMessage(`🚨 DISTRICT EMERGENCY (${newestAlert.district || 'All'}): ${newestAlert.message}`);
      }
    }, (error) => {
      console.warn("Emergency alert sync offline, utilizing localized safety triggers:", error);
    });

    return () => unsubAlerts();
  }, []);

  const [isRecordingVoicePost, setIsRecordingVoicePost] = useState<boolean>(false);
  const [voicePostBase64, setVoicePostBase64] = useState<string | null>(null);
  const [voicePostCaption, setVoicePostCaption] = useState<string>('');
  const [postCategory, setPostCategory] = useState<string>('general');
  const [postDistrict, setPostDistrict] = useState<string>('Chikkaballapura');
  const [postVillage, setPostVillage] = useState<string>('Anemadagu');
  const [voiceRecordDuration, setVoiceRecordDuration] = useState<number>(0);
  
  // Real AI content assistance cache mappings
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});
  const [aiTranslations, setAiTranslations] = useState<Record<string, string>>({});
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({});
  const [loadingAiField, setLoadingAiField] = useState<Record<string, boolean>>({});

  // Local storage synchronization for social metrics
  useEffect(() => {
    localStorage.setItem('agri_saved_posts', JSON.stringify(savedPostIds));
  }, [savedPostIds]);

  useEffect(() => {
    localStorage.setItem('agri_followed_farmers', JSON.stringify(followedFarmers));
  }, [followedFarmers]);

  // Market sell form parameter states
  const [newCropName, setNewCropName] = useState<string>('');
  const [newCropPrice, setNewCropPrice] = useState<string>('');
  const [newCropQty, setNewCropQty] = useState<string>('');
  const [newCropLocation, setNewCropLocation] = useState<string>('');
  const [showSellForm, setShowSellForm] = useState<boolean>(false);

  // Expanded Marketplace Core States
  const [newCropCategory, setNewCropCategory] = useState<string>('vegetables');
  const [newCropUnitType, setNewCropUnitType] = useState<string>('Quintal');
  const [newCropDistrict, setNewCropDistrict] = useState<string>('');
  const [newCropVillage, setNewCropVillage] = useState<string>('');
  const [newCropHarvestDate, setNewCropHarvestDate] = useState<string>('');
  const [newCropOrganic, setNewCropOrganic] = useState<boolean>(false);
  const [newCropDescription, setNewCropDescription] = useState<string>('');
  const [newCropMultipleImages, setNewCropMultipleImages] = useState<string[]>([]);
  const [isUploadingMultipleImages, setIsUploadingMultipleImages] = useState<boolean>(false);
  const [marketplaceSubTab, setMarketplaceSubTab] = useState<'bazaar' | 'my_panel' | 'trust_intelligence'>('bazaar');

  // Inquiry and Dialog states
  const [selectedProductForInquiry, setSelectedProductForInquiry] = useState<any | null>(null);
  const [inquiryName, setInquiryName] = useState<string>('');
  const [inquiryContact, setInquiryContact] = useState<string>('');
  const [inquiryMessage, setInquiryMessage] = useState<string>('');
  const [inquiryQuantity, setInquiryQuantity] = useState<string>('');

  // Firestore sync collections arrays
  const [buyerInquiries, setBuyerInquiries] = useState<any[]>([]);
  const [marketplaceOrders, setMarketplaceOrders] = useState<any[]>([]);

  // Filtering states for the Bazaar listing
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBazaarCategory, setSelectedBazaarCategory] = useState<string>('all');
  const [selectedBazaarDistrict, setSelectedBazaarDistrict] = useState<string>('all');
  const [onlyOrganicFilter, setOnlyOrganicFilter] = useState<boolean>(false);

  // Simulated Voice / Speech-to-text recording system states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedSpeechPrompt, setRecordedSpeechPrompt] = useState<string>('');

  // AI Chat states
  const [chatInput, setChatInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: 'Hello! I am AgriVerse AI crop, weather, and market specialist. Tap the microphone or write your agricultural doubts to solve them instantly.',
      time: 'Just now'
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Leaf scan states
  const [selectedLeafImage, setSelectedLeafImage] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnosisReport, setDiagnosisReport] = useState<any | null>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  // Budget expense tracking states
  const [expenses, setExpenses] = useState<{ id: string; name: string; amount: number }[]>([
    { id: '1', name: 'Premium Tomato Seeds', amount: 850 },
    { id: '2', name: 'Organic Manure Bag', amount: 1200 },
    { id: '3', name: 'Tractor Diesel (3L)', amount: 270 }
  ]);
  const [newExpenseName, setNewExpenseName] = useState<string>('');
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>('');

  // Sowing Crop predictions states
  const [selectedPredictedCrop, setSelectedPredictedCrop] = useState<CropPrice | null>(null);
  const [activeCropPredictionResult, setActiveCropPredictionResult] = useState<any | null>(null);
  const [isPredictionLoading, setIsPredictionLoading] = useState<boolean>(false);

  // Irrigation tracked switches state
  const [soilReminders, setSoilReminders] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: 'rem1', text: 'Water the tomato beds - Soil dryness is index 4', done: false },
    { id: 'rem2', text: 'Check onion leaves for purple blotch dampness', done: false },
    { id: 'rem3', text: 'Apply bio-fertilizer to paddy blocks - 10 days since last dose', done: true }
  ]);
  const [newReminderText, setNewReminderText] = useState<string>('');
  const addSoilReminder = () => {
    if (!newReminderText.trim()) return;
    const newRem = {
      id: `rem_${Date.now()}`,
      text: newReminderText.trim(),
      done: false
    };
    setSoilReminders(prev => [...prev, newRem]);
    setNewReminderText('');
    triggerVisualToast('New farming reminder added! 🌾');
  };

  // Sustainability test scorer
  const [sustainabilityAnswers, setSustainabilityAnswers] = useState<Record<number, string>>({});
  const [showSustainabilityEvaluation, setShowSustainabilityEvaluation] = useState<boolean>(false);

  // Refs for auto-scroll in chats & file uploads
  const chatEndRef = useRef<HTMLDivElement>(null);
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);
  const hiddenPostImageInputRef = useRef<HTMLInputElement>(null);
  const hiddenProductImageInputRef = useRef<HTMLInputElement>(null);

  // Dynamic language sets fetcher
  const t = TRANSLATIONS[currentLang];

  // Auto scroll chats
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatLoading]);

  // Sync state data with Express Server endpoints on mount
  useEffect(() => {
    fetchPostsAndProducts();
    fetchExpenses();
    fetchScanHistory();
  }, []);

  const fetchScanHistory = async () => {
    try {
      const res = await fetch('/api/disease-reports');
      if (res.ok) {
        const data = await res.json();
        setScanHistory(data);
      }
    } catch (e) {
      console.warn('Failed to fetch scan history', e);
    }
  };

  const deleteScanHistoryItem = async (id: string) => {
    try {
      const res = await fetch(`/api/disease-reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        triggerVisualToast('Scan report completely deleted.');
        fetchScanHistory();
      }
    } catch (e) {
      console.error(e);
      triggerVisualToast('Failed to delete report.');
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/budget');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (e) {
      console.warn('Fallback budget state used.');
    }
  };

  const fetchPostsAndProducts = async () => {
    try {
      const postsRes = await fetch('/api/posts');
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }
    } catch (e) {
      console.warn('Backend server offline or loading, fell back with premium cached items.', e);
    }
  };

  // Realtime community posts listener with atomic Firestore seeding
  useEffect(() => {
    const qPosts = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'));
    const unsubPosts = onSnapshot(qPosts, (snapshot) => {
      const dbPosts: Post[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        dbPosts.push({
          id: docSnapshot.id,
          author: data.author || 'Farmer Partner',
          isVerified: data.isVerified || false,
          content: data.content || '',
          image: data.image || undefined,
          voiceUrl: data.voiceUrl || undefined,
          voiceCaption: data.voiceCaption || undefined,
          likes: data.likes || 0,
          likedBy: data.likedBy || [],
          district: data.district || '',
          village: data.village || '',
          category: data.category || 'general',
          comments: data.comments || [],
          time: data.time || 'Recently',
          createdAt: data.createdAt
        });
      });

      if (snapshot.empty) {
        // Automatically seed Firestore with initial high-quality community posts
        MOCK_COMMUNITY_FEED.forEach(async (post) => {
          try {
            await setDoc(doc(db, 'communityPosts', post.id), {
              author: post.author,
              isVerified: post.isVerified,
              content: post.content,
              image: post.image || null,
              voiceUrl: post.voiceUrl || null,
              voiceCaption: post.voiceCaption || null,
              likes: post.likes,
              likedBy: post.likedBy || [],
              district: post.district || '',
              village: post.village || '',
              category: post.category || 'general',
              comments: post.comments || [],
              time: post.time || 'Some time ago',
              createdAt: new Date().toISOString()
            });
          } catch (seedErr) {
            console.warn("Bypassed post seed write:", seedErr);
          }
        });
      } else {
        setPosts(dbPosts);
      }
    }, (error) => {
      console.warn("Firestore community posts listen error, using memory fallback state:", error);
    });

    return () => unsubPosts();
  }, [firebaseAuthUid]);

  // Realtime Firestore listeners for marketplace ecosystem
  useEffect(() => {
    const qProducts = query(collection(db, 'marketplaceProducts'), orderBy('createdAt', 'desc'));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      const firestoreProductsList: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        firestoreProductsList.push({
          id: doc.id,
          title: data.title,
          seller: data.farmerName || 'Farmer Partner',
          location: `${data.village ? data.village + ', ' : ''}${data.district || 'Chikkaballapura'}`,
          price: data.price.startsWith('₹') ? data.price : `₹${data.price}`,
          quantity: `${data.quantity} ${data.unitType || 'Kg'}`,
          image: (data.images && data.images.length > 0) ? data.images[0] : 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=400',
          isVerified: data.organic || false,
          phone: data.phone || '+919900011223',
          // extra properties
          category: data.category || 'other',
          unitType: data.unitType || 'Kg',
          district: data.district || '',
          village: data.village || '',
          harvestDate: data.harvestDate || '',
          organic: data.organic || false,
          description: data.description || '',
          images: data.images || [],
          farmerUid: data.farmerUid || '',
          status: data.status || 'available',
          createdAt: data.createdAt
        });
      });

      // Merge firestore products with static mock marketplace items
      setProducts(prev => {
        const uniqueSet = new Set(firestoreProductsList.map(p => p.id));
        const filteredMock = MOCK_MARKET_ITEMS.filter(m => !uniqueSet.has(m.id));
        return [...firestoreProductsList, ...filteredMock];
      });
    }, (error) => {
      console.warn("Firestore products connection bypassed, using local cached seeds:", error);
    });

    return () => unsubProducts();
  }, []);

  // Sync inquiries and orders in real-time
  useEffect(() => {
    if (!firebaseAuthUid) return;

    const qInquiries = query(collection(db, 'buyerInquiries'), orderBy('createdAt', 'desc'));
    const unsubInquiries = onSnapshot(qInquiries, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setBuyerInquiries(list);
    }, (error) => {
      console.warn("Firestore inquiries listener bypassed:", error);
    });

    const qOrders = query(collection(db, 'marketplaceOrders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setMarketplaceOrders(list);
    }, (error) => {
      console.warn("Firestore orders listener bypassed:", error);
    });

    return () => {
      unsubInquiries();
      unsubOrders();
    };
  }, [firebaseAuthUid]);

  // Sound TTS (Text-to-Speech) using high compatibility Web Speech API
  const speakVoiceOutput = (phrase: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Resolve language prefix codes
      let utterLang = 'en-IN';
      if (currentLang === 'hi') utterLang = 'hi-IN';
      if (currentLang === 'kn') utterLang = 'kn-IN';
      if (currentLang === 'ta') utterLang = 'ta-IN';
      if (currentLang === 'te') utterLang = 'te-IN';
      if (currentLang === 'ml') utterLang = 'ml-IN';
      if (currentLang === 'bn') utterLang = 'bn-IN';

      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = utterLang;
      utterance.rate = 0.95; // Slightly slower for elderly clear understanding
      window.speechSynthesis.speak(utterance);
    } else {
      triggerVisualToast('Your mobile device does not support voice playback engine.');
    }
  };

  // UI Toast helpers
  const triggerVisualToast = (message: string) => {
    setSystemAlertMessage(message);
    setTimeout(() => {
      setSystemAlertMessage(null);
    }, 4500);
  };

  // Securely update dynamic profile directory variables
  const handleUpdateProfileData = async (updatedFields: any) => {
    if (!firebaseAuthUid || firebaseAuthUid === 'guest_uid') {
      triggerVisualToast('Please verify your phone to save your profile globally.');
      return;
    }
    try {
      const profileRef = doc(db, 'users', firebaseAuthUid);
      const cleanFields: any = {
        ...updatedFields,
        farmerId: firebaseAuthUid,
        cooperativeId: profileCooperativeId || 'coop_chikka',
        'language preference': currentLang || 'kn'
      };
      if (updatedFields.name !== undefined) {
        cleanFields.fullName = updatedFields.name;
        cleanFields.name = updatedFields.name;
      }
      if (updatedFields.cropFocus !== undefined) {
        cleanFields.crops = [updatedFields.cropFocus];
        cleanFields.cropFocus = updatedFields.cropFocus;
      }
      await setDoc(profileRef, cleanFields, { merge: true });
    } catch (e) {
      console.warn("Firestore profile save bypassed:", e);
    }
  };

  // High Fidelity Simulated OTP triggers
  const triggerPhoneVerification = () => {
    if (userPhone.length < 10) {
      triggerVisualToast('Please enter a valid 10-digit mobile number');
      return;
    }
    const simulatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtp(simulatedCode);
    setShowOtpScreen(true);
    triggerVisualToast(`[SMS GATEWAY] Verify code is: ${simulatedCode}`);
  };

  const confirmOtpVerification = () => {
    if (otpCode === sentOtp) {
      setIsJoined(true);
      localStorage.setItem('agri_verified_farmer', 'true');
      setShowOtpScreen(false);
      triggerVisualToast('Congratulations! Phone Verified. Premium Farmer Badge earned!');
    } else {
      triggerVisualToast('Incorrect OTP. Try "648120" code from SMS log notification.');
    }
  };

  const skipLoginAsGuest = () => {
    setIsJoined(true);
    triggerVisualToast('Logged in as Guest. We recommend verifying mobile to access bazaar listings.');
  };

  const logoutSession = () => {
    setIsJoined(false);
    localStorage.removeItem('agri_verified_farmer');
    setUserPhone('');
    setOtpCode('');
    triggerVisualToast('Session securely cleared.');
  };

  // 1. Unified Real-Time Ecosystem & Push Notifier
  const sendRealtimeEcosystemNotification = async (payload: {
    recipientUid: string;
    type: 'chat' | 'booking' | 'offer' | 'pest' | 'alert' | 'shipment' | 'coop' | 'ai' | 'order' | 'reservation';
    title: string;
    body: string;
    listingId?: string;
    orderId?: string;
    shipmentId?: string;
    cooperativeId?: string;
  }) => {
    try {
      const nowStr = new Date().toISOString();
      await addDoc(collection(db, 'notifications'), {
        recipientUid: payload.recipientUid,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        read: false,
        listingId: payload.listingId || '',
        orderId: payload.orderId || '',
        shipmentId: payload.shipmentId || '',
        cooperativeId: payload.cooperativeId || profileCooperativeId || 'coop_chikka',
        farmerId: firebaseAuthUid || 'offline_anon',
        createdAt: nowStr
      });

      await addDoc(collection(db, 'notificationQueue'), {
        id: `nq_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        recipientUid: payload.recipientUid,
        title: payload.title,
        body: payload.body,
        status: 'pending',
        sentAt: nowStr
      });
      console.log(`Ecosystem notification dispatched -> ${payload.recipientUid}: ${payload.title}`);
    } catch (err) {
      console.warn("Dispatched notification offline, stored locally in Firestore cache:", err);
    }
  };

  // 2. Direct Content Reporting / Spam Misconduct Tracker
  const handleReportContent = async (itemId: string, itemType: 'post' | 'product', itemAuthor: string, originalContent?: string) => {
    const reason = prompt(`Enter reason to report this ${itemType} (e.g. Spam, Misconduct, Price Gouging):`, "Spam or misconduct");
    if (!reason) return;
    try {
      const nowStr = new Date().toISOString();
      const reportId = `rep_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      await setDoc(doc(db, 'reports', reportId), {
        id: reportId,
        targetId: itemId,
        targetType: itemType,
        reporterUid: firebaseAuthUid || 'offline_anon',
        reason: reason,
        status: 'pending',
        createdAt: nowStr
      });
      
      await setDoc(doc(db, 'flaggedContent', itemId), {
        id: itemId,
        itemType: itemType,
        originalData: { id: itemId, author: itemAuthor, content: originalContent || '' },
        flaggedReason: reason,
        createdAt: nowStr
      });
      
      triggerVisualToast(`Report logged successfully. System moderators notified! 🚨`);
    } catch (err) {
      console.warn("Failed to create report:", err);
    }
  };

  // 3. Real-Time Admin Moderation Actions Ledger
  const handleModerateItem = async (itemId: string, itemType: 'post' | 'product', action: 'flag' | 'unflag') => {
    try {
      const logId = `modlog_${Date.now()}`;
      await setDoc(doc(db, 'moderationLogs', logId), {
        id: logId,
        moderatorId: firebaseAuthUid || 'admin_offline',
        action: action,
        targetId: itemId,
        details: `Moderator set ${itemType} state to ${action}ged`,
        createdAt: new Date().toISOString()
      });

      if (itemType === 'post') {
        const postRef = doc(db, 'posts', itemId);
        await updateDoc(postRef, { isFlagged: action === 'flag' });
      } else {
        const productRef = doc(db, 'marketplaceProducts', itemId);
        await updateDoc(productRef, { isFlagged: action === 'flag' });
      }

      triggerVisualToast(`Ecosystem updated! Item ${action === 'flag' ? 'quarantined 🛡️' : 'approved ✓'}`);
    } catch (e) {
      console.warn("Moderation action offline, synced on reconnect:", e);
    }
  };

  // 4. District Emergency Warning Broadcaster Button Trigger
  const handleBroadcastEmergencyAlert = async () => {
    const defaultMsg = "MONSOON FLOODING ALERT: Local irrigation reservoirs nearing maximum capacity, please secure standing crop fields immediately.";
    const msg = prompt("Enter Emergency Message to broadcast across all farmers in the district:", defaultMsg);
    if (!msg) return;
    const districtName = prompt("Which district is this emergency active for?", profileDistrict || "Chikkaballapura");
    if (!districtName) return;

    try {
      const alertId = `em_${Date.now()}`;
      await setDoc(doc(db, 'emergencyAlerts', alertId), {
        id: alertId,
        message: msg,
        district: districtName,
        severity: 'critical',
        createdAt: new Date().toISOString()
      });
      triggerVisualToast("Emergency Warning Broadcasted Instantly to all devices! 🚨");
    } catch (e) {
      console.warn("Failed to dispatch central broadcast:", e);
    }
  };

  // Core API call for Chatbot
  const triggerSendChatMessage = async (typedText: string) => {
    const query = typedText.trim();
    if (!query) return;

    setChatHistory(prev => [...prev, { sender: 'user', text: query, time: 'Just now' }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          language: currentLang,
          farmerContext: chatbotMemories || {
            farmerCrops: profileCrops,
            district: profileDistrict,
            irrigationType: profileIrrigationType,
            pestHistory: ['early blight on tomato'],
            financialPatterns: { status: 'healthy', averageSpendRate: 1500 },
            preferredLanguage: currentLang
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, { sender: 'ai', text: data.text, time: 'Just now' }]);
        // Automatically speak response for semi-literate accessibility
        speakVoiceOutput(data.text);
      } else {
        throw new Error('API server busy');
      }
    } catch (e: any) {
      // Automatic organic translation fallback of data structure
      const localResponse = getLocalFallbackReply(query);
      setChatHistory(prev => [...prev, { sender: 'ai', text: localResponse, time: 'Just now' }]);
      speakVoiceOutput(localResponse);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Local fallback response mapping when endpoint has transient delays
  const getLocalFallbackReply = (promptText: string): string => {
    const inputClean = promptText.toLowerCase();
    if (currentLang === 'kn') {
      if (inputClean.includes('tomato') || inputClean.includes('ಟೊಮೆಟೊ')) {
        return 'ಟೊಮೆಟೊ ಬೆಳೆಗೆ ಸಂಬಂಧಿಸಿದ ಮಾಹಿತಿ: ತೇವಾಂಶವುಳ್ಳ ವಾತಾವರಣದಲ್ಲಿ ರೋಗಬಾಧೆ ಹೆಚ್ಚು. ಕೆಳಗಿನ ಎಲೆಗಳಲ್ಲಿ ಕಪ್ಪು ವಲಯಗಳು ಕಂಡುಬಂದರೆ ಮ್ಯಾಂಕೋಜೆಬ್ ೨g/ಲೀಟರ್ ನೀರನ್ನು ಸಿಂಪಡಿಸಿ.';
      }
      return 'ರೈತ ಮಿತ್ರರೇ, ಮಣ್ಣಿನ ತೇವಾಂಶ ಮತ್ತು ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಯನ್ನು ನಮ್ಮ ಸಿಸ್ಟಮ್ ಯಶಸ್ವಿಯಾಗಿ ಗುರುತಿಸಿದೆ. ಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ ಕೇಳಿ!';
    }
    if (currentLang === 'hi') {
      if (inputClean.includes('tomato') || inputClean.includes('टमाटर')) {
        return 'टमाटर संरक्षण: Early Blight कवक से बचने के लिए मैंकोजेब (Mancozeb) 2g/L का छिडकाव करें। फल सड़ने से बचाने के लिए उचित हवा आने दें।';
      }
      return 'नमस्ते! आपकी कन्यूमरी रिपोर्ट अभी अपडेट की गई है। क्या आप मौसम की चेतावनी या खाद सुझावों के बारे में जानना चाहते हैं?';
    }
    return 'Thank you! To secure ideal yield pricing, please keep the soil moisture levels above index 3 and inspect crops daily. Ask me anything more about pesticide selection or mandi rates.';
  };

  const startVoiceRecordingTrigger = () => {
    setIsRecording(true);
    setRecordedSpeechPrompt('');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      const langMapping: Record<LanguageCode, string> = {
        en: 'en-IN',
        kn: 'kn-IN',
        ta: 'ta-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        ml: 'ml-IN',
        bn: 'bn-IN',
        mr: 'mr-IN',
        pa: 'pa-IN'
      };
      recognition.lang = langMapping[currentLang] || 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const speechToText = event.results[0][0].transcript;
        setIsRecording(false);
        triggerSendChatMessage(speechToText);
        triggerVisualToast(`[Voice Recognised]: "${speechToText}"`);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        fallbackRecordSpeech();
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      try {
        recognition.start();
      } catch (err) {
        console.error(err);
        fallbackRecordSpeech();
      }
    } else {
      fallbackRecordSpeech();
    }
  };

  const fallbackRecordSpeech = () => {
    const localVoiceds: Record<LanguageCode, string> = {
      en: 'How to defend tomato organic blight crops?',
      kn: 'ಟೊಮೆಟೊ ಅರ್ಲಿ ಬ್ಲೈಟ್ ರೋಗಕ್ಕೆ ಜೈವಿಕ ಕೀಟನಾಶಕ ಯಾವುದು?',
      ta: 'தக்காளி இலை அழுகல் நோயை இயற்கை முறையில் தடுப்பது எப்படி?',
      hi: 'टमाटर की बीमारी को जैविक तरीके से कैसे ठीक करें?',
      te: 'టమోటా ఆకు मచ్చ తెగులు నివారణకు ఏ మందు వాడాలి?',
      ml: 'തക്കാളി ചെടികളിലെ കരിംപുള്ളി രോഗം മാറ്റുന്നത് എങ്ങനെ?',
      bn: 'টমেটো পাতায় কালো ছোপ ছোপ দাগ দূর করার জৈব উপায় কি?',
      mr: 'टोमॅटोवरील करपा रोगासाठी साध्या सेंद्रिय फवारणी सांगा?',
      pa: 'ਟਮਾਟਰ ਦੇ ਪੱਤਿਆਂ ਤੇ ਕਾਲੇ ਧੱਬਿਆਂ ਦਾ ਜੈਵਿਕ ਇਲਾਜ ਕੀ ਹੈ?'
    };
    setTimeout(() => {
      const simulatedText = localVoiceds[currentLang] || 'How to grow high quality tomato?';
      setIsRecording(false);
      triggerSendChatMessage(simulatedText);
      triggerVisualToast(`[Voice Recognised]: "${simulatedText}"`);
    }, 2800);
  };
  const DUMMY_STRAY = {
      kn: 'ಟೊಮೆಟೊ ಅರ್ಲಿ ಬ್ಲೈಟ್ ರೋಗಕ್ಕೆ ಜೈವಿಕ ಕೀಟನಾಶಕ ಯಾವುದು?',
      ta: 'தக்காளி இலை அழுகல் நோயை இயற்கை முறையில் தடுப்பது எப்படி?',
      hi: 'टमाटर की बीमारी को जैविक तरीके से कैसे ठीक करें?',
      te: 'టమోటా ఆకు మచ్చ తెగులు నివారణకు ఏ మందు వాడాలి?',
      ml: 'തക്കാളി ചെടികളിലെ കരിംപുള്ളി രോഗം മാറ്റുന്നത് എങ്ങനെ?',
      bn: 'টমেটো পাতায় কালো ছোপ ছোপ দাগ দূর করার জৈব উপায় কি?',
      mr: 'टोमॅटोवरील करपा रोगासाठी साध्या सेंद्रिय फवारणी सांगा?',
      pa: 'ਟਮਾਟਰ ਦੇ ਪੱਤਿਆਂ ਤੇ ਕਾਲੇ ਧੱਬਿਆਂ ਦਾ ਜੈਵਿਕ ਇਲਾਜ ਕੀ ਹੈ?'  };


  // Crop Doctor leaf analyzer API orchestrator
  const analyzeCropDiseaseImage = async (base64String: string) => {
    setIsDiagnosing(true);
    setDiagnosisReport(null);

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64String,
          language: currentLang,
          conditionType: (base64String === 'healthy' || base64String === 'blight' || base64String === 'rust') ? base64String : undefined
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDiagnosisReport(data);
        fetchScanHistory();
        // Automatically read out diagnosis summary in native language
        speakVoiceOutput(`${data.diseaseName}. ${data.treatmentSuggestions || data.symptoms || ''}`);
        triggerVisualToast('AI Doctor Report generated successfully!');
      } else {
        throw new Error('Fallback logic active');
      }
    } catch (e) {
      // Diagnostic safe fallback
      const reportKn = {
        diseaseName: 'ಅರ್ಲಿ ಬ್ಲೈಟ್ (Tomato Early Blight)',
        confidence: 'ಹೆಚ್ಚು (90%)',
        severity: 'MEDIUM',
        symptoms: 'ಕೆಳಗಿನ ಎಲೆಗಳಲ್ಲಿ ಕಪ್ಪು ಕಲೆಗಳು ಉಂಟಾಗಿ ಮೇಲೆ ಹರಡುತ್ತವೆ.',
        treatmentSuggestions: 'ಸೋಂಕಿತ ಎಲೆಗಳನ್ನು ತಕ್ಷಣ ಕತ್ತರಿಸಿ ಜಮೀನಿನಿಂದ ದೂರ ವಿಲೇವಾರಿ ಮಾಡಿ.',
        organicControl: 'ಬೇವಿನ ಎಣ್ಣೆ ಕಷಾಯ (೫ml/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ.',
        chemicalControl: 'ಮ್ಯಾಂಕೋಜೆಬ್ ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು (೨g/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ.',
        preventionTips: 'ಮೇಲಿಂದ ನೀರು ಹಾಯಿಸಬೇಡಿ; ಬುಡಕ್ಕೆ ಮಾತ್ರ ಹಾಯಿಸಿ.'
      };
      const reportHi = {
        diseaseName: 'अगेती झुलसा (Early Blight)',
        confidence: 'उच्च (90%)',
        severity: 'MEDIUM',
        symptoms: 'निचली पत्तियों पर काले छल्ले बनते हैं जो धीरे-धीरे ऊपर फैलते हैं।',
        treatmentSuggestions: 'संक्रमित पत्तियों को तुरंत हटा दें।',
        organicControl: 'नीम के तेल का घोल (5ml/लीटर) छिड़कें और मिट्टी में धूप आने दें।',
        chemicalControl: 'मैंकोजेब कवकनाशी (2 ग्राम/लीटर) पत्तियों पर छिड़कें।',
        preventionTips: 'जड़ों में सिंचाई करें, पत्तों को सूखा रखें।'
      };
      const reportEn = {
        diseaseName: 'Early Blight (Alternaria Solani)',
        confidence: 'HIGH (90%)',
        severity: 'MEDIUM',
        symptoms: 'Concentric brown-black circular lesions first appearing on mature lower leaves.',
        treatmentSuggestions: 'Prune dead foliage immediately to limit ground humidity spread.',
        organicControl: 'Spray warm soapy Neem oil formulation (5ml per is standard). Ensure air spacing.',
        chemicalControl: 'Foliar application of Mancozeb or Chlorothalonil antifungal powder (2g/L).',
        preventionTips: 'Avoid sprinkler overhead irrigation; keep ground moisture dry at night.'
      };

      const finalReport = currentLang === 'kn' ? reportKn : currentLang === 'hi' ? reportHi : reportEn;
      setDiagnosisReport(finalReport);
      speakVoiceOutput(`${finalReport.diseaseName}. ${finalReport.treatmentSuggestions}`);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Presets of crop samples for farmers with slow internet or without ready camera leaves
  const handleDiseaseExamplePick = (type: 'healthy' | 'blight' | 'rust') => {
    let mockBase64 = type;
    let designImageUrl = '';

    if (type === 'healthy') {
      designImageUrl = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400';
    } else if (type === 'blight') {
      designImageUrl = 'https://images.unsplash.com/photo-1581078426770-6d336e5de7bf?auto=format&fit=crop&q=80&w=400';
    } else {
      designImageUrl = 'https://images.unsplash.com/photo-1605000797499-95a51c7769ae?auto=format&fit=crop&q=80&w=400';
    }

    setSelectedLeafImage(designImageUrl);
    analyzeCropDiseaseImage(mockBase64);
  };

  // Native files uploader handler with canvas auto-compression to prevent large payloads & visual decoding timeouts
  const handleLeafImageUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (event) => {
        img.src = event.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
          setSelectedLeafImage(compressedBase64);
          analyzeCropDiseaseImage(compressedBase64);
        } else {
          // Fallback if canvas context is not obtainable
          setSelectedLeafImage(img.src);
          analyzeCropDiseaseImage(img.src);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  // Sowing Prediction advisor call
  const triggerCropPredictionInsight = async (crop: CropPrice) => {
    setSelectedPredictedCrop(crop);
    setIsPredictionLoading(true);
    setActiveCropPredictionResult(null);

    try {
      const response = await fetch('/api/predict-crop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cropName: crop.name,
          language: currentLang
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setActiveCropPredictionResult(data);
      } else {
        throw new Error('Local fallback');
      }
    } catch {
      // Local fallback predictions
      const predictionTable: Record<string, any> = {
        'Tomato (Local)': { expectedDemand: 'HIGH', profitPotential: 'HIGH', climateRisk: 'MEDIUM', advisoryText: 'Demand remains robust. Sowing between early July and late August yields top festive pricing with reasonable water risk.' },
        'Onion (Nashik Light Red)': { expectedDemand: 'MEDIUM', profitPotential: 'HIGH', climateRisk: 'LOW', advisoryText: 'Excellent profit margins. Best storage durability. Recommended dry shed curing before wholesale delivery.' },
        'Paddy (Basmati Medium)': { expectedDemand: 'HIGH', profitPotential: 'HIGH', climateRisk: 'LOW', advisoryText: 'Strong export opportunities. Conserve water logs using the drip irrigation module.' },
        'Cotton (Long Staple)': { expectedDemand: 'LOW', profitPotential: 'MEDIUM', climateRisk: 'HIGH', advisoryText: 'Moderate global surplus. Crop alternation to groundnut is suggested today.' }
      };
      
      const localCropPredict = predictionTable[crop.name] || {
        expectedDemand: 'MEDIUM', profitPotential: 'MEDIUM', climateRisk: 'MEDIUM', advisoryText: 'Stable local mandi indexes. Sowing with adequate organic soil mix ensures steady output.'
      };
      setActiveCropPredictionResult(localCropPredict);
    } finally {
      setIsPredictionLoading(false);
    }
  };

  // Community Interactions
  const handleToggleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: isJoined ? t.profile.farmerName : 'guest_user' })
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: data.likes, likedBy: data.likedBy } : p));
        triggerVisualToast('Likes toggled');
      } else {
        throw new Error();
      }
    } catch {
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const likedBy = p.likedBy || [];
          const user = isJoined ? t.profile.farmerName : 'guest_user';
          const idx = likedBy.indexOf(user);
          if (idx === -1) {
            return { ...p, likes: p.likes + 1, likedBy: [...likedBy, user] };
          } else {
            const copy = [...likedBy];
            copy.splice(idx, 1);
            return { ...p, likes: Math.max(0, p.likes - 1), likedBy: copy };
          }
        }
        return p;
      }));
      triggerVisualToast('Likes toggled (Offline)');
    }
  };

  const handleToggleSavePost = (postId: string) => {
    setSavedPostIds(prev => {
      const exists = prev.includes(postId);
      if (exists) {
        triggerVisualToast('Removed from saved list!');
        return prev.filter(id => id !== postId);
      } else {
        triggerVisualToast('Saved to My Bookmarks! Pin pinned! 📌');
        return [...prev, postId];
      }
    });
  };

  const handleToggleFollowFarmer = (author: string) => {
    setFollowedFarmers(prev => {
      const exists = prev.includes(author);
      if (exists) {
        triggerVisualToast(`Unfollowed farmer: ${author}`);
        return prev.filter(name => name !== author);
      } else {
        triggerVisualToast(`Following farmer: ${author} 🤝`);
        return [...prev, author];
      }
    });
  };

  // AI Assistance triggers
  const handleTranslatePost = async (postId: string, targetLang: string) => {
    setLoadingAiField(prev => ({ ...prev, [`${postId}_translate`]: true }));
    try {
      const res = await fetch(`/api/posts/${postId}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLanguage: targetLang })
      });
      if (res.ok) {
        const data = await res.json();
        setAiTranslations(prev => ({ ...prev, [postId]: data.translatedText }));
        triggerVisualToast('Gemini Translation Loaded! 🌍');
      }
    } catch (e) {
      triggerVisualToast('Could not translate this post.');
    } finally {
      setLoadingAiField(prev => ({ ...prev, [`${postId}_translate`]: false }));
    }
  };

  const handleSummarizePost = async (postId: string, lang: string) => {
    setLoadingAiField(prev => ({ ...prev, [`${postId}_summarize`]: true }));
    try {
      const res = await fetch(`/api/posts/${postId}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang })
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummaries(prev => ({ ...prev, [postId]: data.summary }));
        triggerVisualToast('AI summary generated! ⚡');
      }
    } catch (e) {
      triggerVisualToast('Summary failed.');
    } finally {
      setLoadingAiField(prev => ({ ...prev, [`${postId}_summarize`]: false }));
    }
  };

  const handleSuggestReplyMessage = async (postId: string, lang: string) => {
    setLoadingAiField(prev => ({ ...prev, [`${postId}_suggest`]: true }));
    try {
      const res = await fetch(`/api/posts/${postId}/suggest-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang })
      });
      if (res.ok) {
        const data = await res.json();
        setAiSuggestions(prev => ({ ...prev, [postId]: data.suggestion }));
        triggerVisualToast('AI Expert reply suggestion generated!');
      }
    } catch (e) {
      triggerVisualToast('Suggestion failed.');
    } finally {
      setLoadingAiField(prev => ({ ...prev, [`${postId}_suggest`]: false }));
    }
  };

  const handleCreatePost = async (category: string = 'general', district: string = 'Chikkaballapura', village: string = 'Anemadagu') => {
    if (!newPostContent.trim() && !voicePostBase64) {
      triggerVisualToast('Please write something or record your voice before posting!');
      return;
    }

    try {
      const dbPostPayload = {
        author: isJoined ? t.profile.farmerName : 'Farmer Partner',
        isVerified: isJoined,
        content: newPostContent || '🎙️ (Farmer shared a localized sound message...)',
        image: selectedPostImage || null,
        voiceUrl: voicePostBase64 || null,
        voiceCaption: voicePostCaption || null,
        district: district,
        village: village,
        category: category,
        likes: 0,
        likedBy: [],
        comments: [],
        time: 'Just now',
        farmerId: firebaseAuthUid || 'offline_anon',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'communityPosts'), dbPostPayload);

      setNewPostContent('');
      setSelectedPostImage(null);
      setVoicePostBase64(null);
      setVoicePostCaption('');
      triggerVisualToast('Post shared in community feed! 🌾');
    } catch (dbErr) {
      console.error("Firestore post creation failed, falling back to express API:", dbErr);
      try {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            author: isJoined ? t.profile.farmerName : 'Farmer Partner',
            content: newPostContent || '🎙️ (Farmer shared a localized sound message...)',
            image: selectedPostImage || undefined,
            voiceUrl: voicePostBase64 || undefined,
            voiceCaption: voicePostCaption || undefined,
            district: district,
            village: village,
            category: category
          })
        });

        if (response.ok) {
          setNewPostContent('');
          setSelectedPostImage(null);
          setVoicePostBase64(null);
          setVoicePostCaption('');
          triggerVisualToast('Post shared in community feed! 🌾');
        } else {
          throw new Error();
        }
      } catch {
        // Offline fallback additions
        const newPost: Post = {
          id: `post_${Date.now()}`,
          author: isJoined ? t.profile.farmerName : 'Farmer Partner',
          isVerified: true,
          content: newPostContent || '🎙️ (Farmer shared voice message offline)',
          image: selectedPostImage || undefined,
          voiceUrl: voicePostBase64 || undefined,
          voiceCaption: voicePostCaption || undefined,
          district: district,
          village: village,
          category: category,
          likes: 0,
          likedBy: [],
          time: 'Just now',
          comments: []
        };
        setPosts(prev => [newPost, ...prev]);
        setNewPostContent('');
        setSelectedPostImage(null);
        setVoicePostBase64(null);
        setVoicePostCaption('');
        triggerVisualToast('Saved offline and loaded locally!');
      }
    }
  };

  const handleCreateComment = async (postId: string) => {
    const text = activePostComments[postId];
    if (!text || !text.trim()) return;

    try {
      const postRef = doc(db, 'communityPosts', postId);
      const parentPost = posts.find((p: Post) => p.id === postId);
      
      const newComment = {
        id: `comm_${Date.now()}`,
        author: isJoined ? t.profile.farmerName : 'Agri Friend',
        content: text,
        time: 'Just now'
      };

      const updatedComments = parentPost && parentPost.comments ? [...parentPost.comments, newComment] : [newComment];

      await updateDoc(postRef, {
        comments: updatedComments
      });

      setActivePostComments(prev => ({ ...prev, [postId]: '' }));
      triggerVisualToast('Comment added 💬');
      
      // Send real-time notification to the post developer/author
      if (parentPost && parentPost.farmerId && parentPost.farmerId !== firebaseAuthUid) {
        await sendRealtimeEcosystemNotification({
          recipientUid: parentPost.farmerId,
          type: 'chat',
          title: `💬 New Feedback on Your Post`,
          body: `${newComment.author} commented: "${text.substring(0, 30)}..."`,
          listingId: '',
          orderId: '',
          shipmentId: '',
          cooperativeId: profileCooperativeId || 'coop_chikka'
        });
      }
    } catch (e) {
      console.error("Firestore comment failed, falling back to express API:", e);
      try {
        const response = await fetch(`/api/posts/${postId}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            author: isJoined ? t.profile.farmerName : 'Agri Friend',
            content: text
          })
        });

        if (response.ok) {
          const data = await response.json();
          setPosts(prev => prev.map(p => {
            if (p.id === postId) {
              return { ...p, comments: [...p.comments, data] };
            }
            return p;
          }));
          setActivePostComments(prev => ({ ...prev, [postId]: '' }));
          triggerVisualToast('Comment added 💬');
        } else {
          throw new Error();
        }
      } catch {
        const offlineComment = {
          id: `comm_${Date.now()}`,
          author: isJoined ? t.profile.farmerName : 'Agri Friend',
          content: text,
          time: 'Just now'
        };
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return { ...p, comments: [...p.comments, offlineComment] };
          }
          return p;
        }));
        setActivePostComments(prev => ({ ...prev, [postId]: '' }));
        triggerVisualToast('Comment added offline');
      }
    }
  };

  // Sound Note capturing media recorders for community posts
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voiceTimerRef = useRef<any>(null);

  const startVoiceRecording = async () => {
    setIsRecordingVoicePost(true);
    setVoiceRecordDuration(0);
    audioChunksRef.current = [];

    // Trigger duration counting
    voiceTimerRef.current = setInterval(() => {
      setVoiceRecordDuration(prev => prev + 1);
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64Data = reader.result as string;
            setVoicePostBase64(base64Data);
            setVoicePostCaption(
              currentLang === 'kn' ? 'ಗಾಳಿ ಮತ್ತು ಮಳೆ ಮುನ್ನೆಚ್ಚರಿಕೆ: ಕೊಪ್ಪಳ ಜಿಲ್ಲೆಯಲ್ಲಿ ಬಾಳೆ ಬೆಳೆಗಳನ್ನು ರಕ್ಷಿಸಿ.' :
              currentLang === 'hi' ? 'फसल रक्षक सुझाव: समय पर जैविक कीटनाशक छिड़काव कर पत्ती मरोड़ रोग रोकें।' :
              'Crop advisor update: Sowing scheduled on early wet seasons improves direct soil yield.'
            );
            triggerVisualToast('Sound message recorded successfully! 🎙️');
          };
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        triggerVisualToast('Recording started... Speak clearly 🎙️');
      } else {
        throw new Error('WebRTC mic not supported');
      }
    } catch (err) {
      console.warn('Microphone driver unsupported or permission blocked, using sandbox simulator payload.', err);
    }
  };

  const stopVoiceRecording = () => {
    setIsRecordingVoicePost(false);
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Manual backup wav simulator for low-end devices or non-permission containers
      const simulatedAudioBase64 = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAERKgAAKkoAAAEKABgAZGF0YQQAAAAAAA==';
      setVoicePostBase64(simulatedAudioBase64);
      setVoicePostCaption(
        currentLang === 'kn' ? '🎙️ ಧ್ವನಿ ರೆಕಾರ್ಡ್: ಈ ಹಂಗಾಮಿನಲ್ಲಿ ಜೀವಾಮೃತ ಉಪಯೋಗಿಸಿ ಮಣ್ಣಿನ ಗುಣ ನಿಯಂತ್ರಿಸಿ.' :
        currentLang === 'hi' ? '🎙️ वॉयस पोस्ट: फसल चक्र बदलें और धान के बाद चना उगाने से नाइट्रोजन की कमी दूर करें।' :
        '🎙️ Farmer Voice Message: Drip watering logs show optimized efficiency. Weather and crop prices are premium.'
      );
      triggerVisualToast('Voice recording completed! High accuracy caption transcribed.');
    }
  };

  // Marketplace interaction triggers
  const handleHostMarketSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropName || !newCropPrice || !newCropQty || !newCropDistrict) {
      triggerVisualToast('Crop Name, Price, Quantity and District are required');
      return;
    }

    try {
      const finalImagesList = newCropMultipleImages.length > 0 
        ? newCropMultipleImages 
        : [selectedProductImage || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=400'];

      const productDoc = {
        title: newCropName,
        category: newCropCategory,
        quantity: newCropQty,
        unitType: newCropUnitType,
        price: newCropPrice,
        district: newCropDistrict,
        village: newCropVillage || 'Rural',
        harvestDate: newCropHarvestDate || new Date().toISOString().split('T')[0],
        organic: newCropOrganic,
        description: newCropDescription,
        images: finalImagesList,
        farmerUid: firebaseAuthUid,
        farmerId: firebaseAuthUid,
        cooperativeId: profileCooperativeId || 'coop_chikka',
        listingId: '',
        orderId: '',
        shipmentId: '',
        farmerName: isJoined ? t.profile.farmerName : 'Farmer Partner',
        phone: userPhone || '+9180XXXXXXX',
        status: 'available',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'marketplaceProducts'), productDoc);
      // Update listingId matching document auto-id to close references
      await updateDoc(docRef, { listingId: docRef.id });
      triggerVisualToast('Success! Live crop harvest post listed on Cloud Bazaar.');
      setShowSellForm(false);
      
      // Reset inputs
      setNewCropName('');
      setNewCropPrice('');
      setNewCropQty('');
      setNewCropDescription('');
      setNewCropVillage('');
      setNewCropDistrict('');
      setNewCropHarvestDate('');
      setNewCropOrganic(false);
      setNewCropMultipleImages([]);
      setSelectedProductImage(null);
    } catch (err) {
      console.warn("Firestore collection insert failed, falling back to local list:", err);
      const newProd: ProductItem = {
        id: `prod_${Date.now()}`,
        title: newCropName,
        seller: isJoined ? t.profile.farmerName : 'Mandi Seller Partner',
        location: `${newCropVillage ? newCropVillage + ', ' : ''}${newCropDistrict || 'Chikkaballapura'}`,
        price: `₹${newCropPrice}`,
        quantity: `${newCropQty} ${newCropUnitType}`,
        image: newCropMultipleImages.length > 0 
          ? newCropMultipleImages[0] 
          : (selectedProductImage || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400'),
        isVerified: newCropOrganic,
        phone: userPhone || '+919900011223'
      };
      setProducts(prev => [newProd, ...prev]);
      setShowSellForm(false);
      triggerVisualToast('Offer listed to local phone memory.');
      
      setNewCropName('');
      setNewCropPrice('');
      setNewCropQty('');
      setNewCropDescription('');
      setNewCropVillage('');
      setNewCropDistrict('');
      setNewCropHarvestDate('');
      setNewCropOrganic(false);
      setNewCropMultipleImages([]);
      setSelectedProductImage(null);
    }
  };

  // Image upload utils with automated resizing compression
  const handleImageConversion = async (e: React.ChangeEvent<HTMLInputElement>, type: 'post' | 'product') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.7);
        if (type === 'post') {
          setSelectedPostImage(compressed);
        } else {
          setSelectedProductImage(compressed);
        }
        triggerVisualToast('Image resized and compressed successfully! ✓');
      } catch (err) {
        console.warn("Compression failed, loading raw:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (type === 'post') {
            setSelectedPostImage(reader.result as string);
          } else {
            setSelectedProductImage(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleMultipleImageConversion = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploadingMultipleImages(true);
      const newImagesList: string[] = [];
      const filesArray = Array.from(files) as File[];
      
      triggerVisualToast(`Compressing and uploading ${filesArray.length} harvest photo(s)...`);

      for (const file of filesArray) {
        try {
          const compressed = await compressImage(file, 800, 800, 0.7);
          
          let finalUrl = compressed;
          try {
            const fileRef = ref(storage, `marketplace/${firebaseAuthUid}/${Date.now()}_${Math.random().toString(36).substr(2, 5)}.jpg`);
            await uploadString(fileRef, compressed, 'data_url');
            const downloadUrl = await getDownloadURL(fileRef);
            if (downloadUrl) {
              finalUrl = downloadUrl;
            }
          } catch (storageErr) {
            console.warn("Storage upload failed, falling back to compressed local base64:", storageErr);
          }
          
          newImagesList.push(finalUrl);
        } catch (err) {
          console.error("Compression / upload error:", err);
        }
      }
      
      setNewCropMultipleImages(prev => [...prev, ...newImagesList]);
      setIsUploadingMultipleImages(false);
      triggerVisualToast('All photos uploaded and synchronized successfully! Check previews.');
    }
  };

  // Buyer Inquiry operations
  const handleSendInquiryOffer = async () => {
    if (!inquiryContact || !inquiryQuantity) {
      triggerVisualToast('Contact phone and booking quantity are required');
      return;
    }

    try {
      // 1. Create Order record in pending_approval stat
      const orderRef = doc(collection(db, 'marketplaceOrders'));
      const dbOrder = {
        id: orderRef.id,
        orderId: orderRef.id,
        productId: selectedProductForInquiry.id,
        listingId: selectedProductForInquiry.id,
        productTitle: selectedProductForInquiry.title,
        quantity: inquiryQuantity,
        price: selectedProductForInquiry.price || 'Negotiated',
        totalPrice: 'Calculated upon delivery',
        farmerUid: selectedProductForInquiry.farmerUid || 'system_fallback',
        farmerId: selectedProductForInquiry.farmerUid || 'system_fallback',
        buyerUid: firebaseAuthUid,
        buyerName: inquiryName || 'Farmer Partner',
        cooperativeId: selectedProductForInquiry.cooperativeId || 'coop_chikka',
        shipmentId: '',
        status: 'pending_approval',
        createdAt: new Date().toISOString()
      };
      await setDoc(orderRef, dbOrder);

      // 2. Reduce Available Inventory on Parent listing
      try {
        const prodRef = doc(db, 'marketplaceProducts', selectedProductForInquiry.id);
        const reservedQty = parseInt(inquiryQuantity) || 0;
        const parentQtyStr = selectedProductForInquiry.quantity || "";
        const matchNum = parentQtyStr.match(/\d+/);
        if (matchNum) {
          const currentQty = parseInt(matchNum[0]) || 0;
          const newQty = Math.max(0, currentQty - reservedQty);
          const unit = parentQtyStr.replace(/\d+/g, '').trim() || 'Kg';
          await updateDoc(prodRef, { 
            quantity: `${newQty} ${unit}`,
            status: newQty <= 0 ? 'sold' : 'available'
          });
        }
      } catch (e) {
        console.warn("Parent inventory deduction bypassed: ", e);
      }

      // 3. Create Reservation records
      const dbInquiry = {
        marketplaceProductId: selectedProductForInquiry.id,
        listingId: selectedProductForInquiry.id,
        productTitle: selectedProductForInquiry.title,
        farmerUid: selectedProductForInquiry.farmerUid || 'system_fallback',
        farmerId: selectedProductForInquiry.farmerUid || 'system_fallback',
        buyerUid: firebaseAuthUid,
        cooperativeId: selectedProductForInquiry.cooperativeId || 'coop_chikka',
        orderId: orderRef.id,
        shipmentId: '',
        buyerName: inquiryName || 'Farmer Partner',
        message: inquiryMessage,
        contact: inquiryContact,
        quantity: inquiryQuantity,
        status: 'pending_approval',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'buyerInquiries'), dbInquiry);
      
      // 4. Generate real-time notification for the seller/farmer
      await sendRealtimeEcosystemNotification({
        recipientUid: dbInquiry.farmerId,
        type: 'reservation',
        title: `📦 New Crop Booking Request!`,
        body: `Buyer ${dbInquiry.buyerName} requested to reserve ${dbInquiry.quantity} of your ${dbInquiry.productTitle}. Go to My Inbox to negotiate.`,
        listingId: dbInquiry.listingId,
        orderId: orderRef.id, 
        shipmentId: '',
        cooperativeId: dbInquiry.cooperativeId
      });

      triggerVisualToast('Real-time crop reservation inquiry sent directly to farmer! ✓');
      setSelectedProductForInquiry(null);
    } catch (err) {
      console.error("Firestore inquiry submit err:", err);
      const fallbackInq = {
        id: `inq_${Date.now()}`,
        marketplaceProductId: selectedProductForInquiry.id,
        listingId: selectedProductForInquiry.id,
        productTitle: selectedProductForInquiry.title,
        farmerUid: selectedProductForInquiry.farmerUid || 'system_fallback',
        farmerId: selectedProductForInquiry.farmerUid || 'system_fallback',
        buyerUid: firebaseAuthUid,
        cooperativeId: selectedProductForInquiry.cooperativeId || 'coop_chikka',
        orderId: '',
        shipmentId: '',
        buyerName: inquiryName || 'Farmer Partner',
        message: inquiryMessage,
        contact: inquiryContact,
        quantity: inquiryQuantity,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      setBuyerInquiries(prev => [fallbackInq, ...prev]);
      triggerVisualToast('Offer saved inside local phone cache.');
      setSelectedProductForInquiry(null);
    }
  };

  // Farmer deal negotiation flows
  const handleAcceptInquiry = async (inquiry: any) => {
    try {
      const inqRef = doc(db, 'buyerInquiries', inquiry.id);
      const orderId = inquiry.orderId || `ord_${Date.now()}`;
      const orderRef = doc(db, 'marketplaceOrders', orderId);

      // 1. Create live logistics shipment payload in Firestore Gps Tracker
      const deliveryId = `del_${orderId}`;
      const deliveryPayload = {
        id: deliveryId,
        shipmentId: deliveryId,
        orderId: orderId,
        listingId: inquiry.marketplaceProductId || inquiry.listingId || '',
        productTitle: inquiry.productTitle,
        quantity: inquiry.quantity,
        sellerUid: firebaseAuthUid,
        farmerId: firebaseAuthUid,
        buyerUid: inquiry.buyerUid || 'buyer123',
        buyerName: inquiry.buyerName || 'Co-op Purchaser',
        cooperativeId: inquiry.cooperativeId || 'coop_chikka',
        status: 'transit',
        eta: '45 mins (Nearby Block)',
        driverName: 'Ramesh Gowda',
        driverPhone: '+91 98450 12093',
        routeCoordinates: [
          { lat: 13.4334, lng: 77.7275, name: 'Chikkaballapura Warehouse' },
          { lat: 13.3421, lng: 77.6321, name: 'Sidlaghatta Highway Block' },
          { lat: 13.2981, lng: 77.5891, name: 'Buyer Delivery Terminal' }
        ],
        currentProgress: 35,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'liveDeliveries', deliveryId), deliveryPayload);

      // 2. Update order status
      const updatedOrder = {
        status: 'accepted',
        shipmentId: deliveryId,
        updatedAt: new Date().toISOString()
      };
      await setDoc(orderRef, updatedOrder, { merge: true });

      // 3. Set parent product as fully sold
      try {
        const prodRef = doc(db, 'marketplaceProducts', inquiry.marketplaceProductId || inquiry.listingId);
        await updateDoc(prodRef, { status: 'sold' });
      } catch (prodErr) {
        console.warn("Mark sold bypassed:", prodErr);
      }

      // 4. Update inquiry with accepted status and references
      await updateDoc(inqRef, { 
        status: 'accepted',
        shipmentId: deliveryId
      });

      // 5. Send Live Notification to the buyer
      if (inquiry.buyerUid) {
        await sendRealtimeEcosystemNotification({
          recipientUid: inquiry.buyerUid,
          type: 'order',
          title: `✅ Deal Accepted!`,
          body: `Farmer ${firebaseAuthName} accepted your crop booking for ${inquiry.productTitle}. GPS logistics driveramesh dispatched cargo! 🚚`,
          listingId: inquiry.marketplaceProductId || '',
          orderId: orderId,
          shipmentId: deliveryId,
          cooperativeId: inquiry.cooperativeId || 'coop_chikka'
        });
      }

      // 6. Update Cooperative Sales Ledger
      const numericPrice = 35; // default scale
      const numericQty = parseFloat(inquiry.quantity) || 1;
      const salesVolume = Math.floor(numericPrice * numericQty * 100) || 4500;

      await addDoc(collection(db, 'cooperativeFinances'), {
        cooperativeId: inquiry.cooperativeId || 'coop_chikka',
        title: `Cooperative Sales: ${inquiry.productTitle}`,
        amount: salesVolume,
        type: 'revenue',
        initiatorName: inquiry.buyerName || 'Farmer Partner',
        createdAt: new Date().toISOString()
      });

      triggerVisualToast('Deal secured and cooperative cargo gps tracing initiated! 🎉🚚');
    } catch (err) {
      console.error("Deal acceptance failed:", err);
      triggerVisualToast('Acceptance ledger failed. Try again.');
    }
  };

  const handleRejectInquiry = async (inquiry: any) => {
    try {
      const inqRef = doc(db, 'buyerInquiries', inquiry.id);

      // 1. Mark reservation as rejected
      await updateDoc(inqRef, { status: 'rejected' });

      // 2. Mark order status as rejected
      if (inquiry.orderId) {
        try {
          await updateDoc(doc(db, 'marketplaceOrders', inquiry.orderId), { status: 'rejected' });
        } catch (oErr) {
          console.warn("Inquiry reject: order update skipped.", oErr);
        }
      }

      // 3. Put inventory quantity back cleanly
      try {
        const prodRef = doc(db, 'marketplaceProducts', inquiry.marketplaceProductId || inquiry.listingId);
        const restoredQty = parseInt(inquiry.quantity) || 0;
        
        const unsub = onSnapshot(prodRef, async (snap) => {
          unsub();
          if (snap.exists()) {
            const data = snap.data();
            const parentQtyStr = data.quantity || "";
            const matchNum = parentQtyStr.match(/\d+/);
            if (matchNum) {
              const currentQty = parseInt(matchNum[0]) || 0;
              const newQty = currentQty + restoredQty;
              const unit = parentQtyStr.replace(/\d+/g, '').trim() || 'Kg';
              await updateDoc(prodRef, {
                quantity: `${newQty} ${unit}`,
                status: 'available'
              });
            }
          }
        });
      } catch (e) {
        console.warn("Restoring parent quantities bypassed:", e);
      }

      // 4. Notify buyer about declination
      if (inquiry.buyerUid) {
        await sendRealtimeEcosystemNotification({
          recipientUid: inquiry.buyerUid,
          type: 'order',
          title: `❌ Reservation Rejected`,
          body: `Farmer ${firebaseAuthName} declined your booking for ${inquiry.productTitle}. Inventory release triggered.`,
          listingId: inquiry.marketplaceProductId || '',
          orderId: inquiry.orderId || '',
          shipmentId: '',
          cooperativeId: inquiry.cooperativeId || 'coop_chikka'
        });
      }

      triggerVisualToast('Inquiry declined, reservation cancelled and stock restored! ✓');
    } catch (err) {
      console.error("Decline syncing failed:", err);
      triggerVisualToast('Rejection sync failed.');
    }
  };

  const handleDeleteListing = async (productId: string) => {
    try {
      const prodRef = doc(db, 'marketplaceProducts', productId);
      await deleteDoc(prodRef);
      triggerVisualToast('Listing removed successfully from Bazaar!');
    } catch (err) {
      console.error("Delete listing failed:", err);
      setProducts(prev => prev.filter(p => p.id !== productId));
      triggerVisualToast('Bypassed: Local listing cleaned.');
    }
  };

  // Budget additions
  const handleAddExpenseLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseName || !newExpenseAmount) return;
    const val = parseFloat(newExpenseAmount);
    if (isNaN(val)) return;

    try {
      const response = await fetch('/api/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newExpenseName, amount: val })
      });
      if (response.ok) {
        const newItem = await response.json();
        setExpenses(prev => [...prev, newItem]);
        setNewExpenseName('');
        setNewExpenseAmount('');
        triggerVisualToast('Expense log compiled & saved.');
      } else {
        const localItem = {
          id: `exp_${Date.now()}`,
          name: newExpenseName,
          amount: val
        };
        setExpenses(prev => [...prev, localItem]);
        setNewExpenseName('');
        setNewExpenseAmount('');
        triggerVisualToast('Saved locally.');
      }
    } catch (error) {
      const localItem = {
        id: `exp_${Date.now()}`,
        name: newExpenseName,
        amount: val
      };
      setExpenses(prev => [...prev, localItem]);
      setNewExpenseName('');
      setNewExpenseAmount('');
      triggerVisualToast('Saved locally.');
    }
  };

  const handleDeleteExpenseLocal = async (id: string) => {
    try {
      const response = await fetch(`/api/budget/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setExpenses(prev => prev.filter(e => e.id !== id));
        triggerVisualToast('Expense log item deleted.');
      } else {
        setExpenses(prev => prev.filter(e => e.id !== id));
        triggerVisualToast('Deleted from cache.');
      }
    } catch (err) {
      setExpenses(prev => prev.filter(e => e.id !== id));
      triggerVisualToast('Deleted from cache.');
    }
  };

  const calculateTotalExpenses = () => {
    return expenses.reduce((sum, item) => sum + item.amount, 0);
  };

  // Sustainability score grader
  const handleGradeSustainability = (qIdx: number, val: string) => {
    setSustainabilityAnswers(prev => ({ ...prev, [qIdx]: val }));
  };

  const compileEcoScore = () => {
    let score = 30; // base score
    if (sustainabilityAnswers[1] === 'yes') score += 25; // bio fertilizer
    if (sustainabilityAnswers[2] === 'yes') score += 25; // rainwater/drip
    if (sustainabilityAnswers[3] === 'yes') score += 20; // zero weed burn
    return score;
  };

  return (
    <div id="agri_app_container" className="flex flex-col min-h-screen bg-neutral-900 justify-center items-center p-0 md:p-4 text-slate-800">
      
      {/* Visual System alert notification top bar */}
      {systemAlertMessage && (
        <div id="system_toast_msg" className="fixed top-4 z-50 max-w-sm w-11/12 bg-emerald-600 border border-emerald-500 shadow-xl rounded-xl p-3 text-white flex items-center space-x-3 text-sm animate-bounce">
          <Sparkles className="w-5 h-5 text-yellow-300 flex-shrink-0 animate-spin" />
          <p className="font-semibold flex-1 leading-snug">{systemAlertMessage}</p>
          <button onClick={() => setSystemAlertMessage(null)} className="text-white hover:text-yellow-100 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary Mobile Container Frame Mockup */}
      <div id="phone_mockup_shell" className="relative w-full max-w-[430px] h-[100dvh] md:h-[840px] md:max-h-[880px] md:rounded-[42px] md:border-[10px] md:border-neutral-800 bg-white shadow-2xl overflow-hidden flex flex-col no-x-scroll">
        
        {/* Smartphone top bezel status indicator info bar */}
        <div id="phone_screen_header" className="bg-emerald-800 text-emerald-100 px-6 pt-3 pb-2 text-[11px] font-mono flex justify-between items-center select-none rounded-t-none md:rounded-t-[32px] shrink-0">
          <div className="flex items-center space-x-1">
            <span className="font-bold tracking-wider">AGRIVERSE CELL</span>
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-yellow-300 font-mono">2026-06-05 UTC</span>
          </div>
        </div>

        {/* Application Title Header Bar */}
        <div id="agri_master_navbar" className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white px-4 py-3 shrink-0 shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-950 p-1.5 rounded-xl border border-emerald-600/30">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-wide">{t.appName}</h1>
              <p className="text-[10px] text-emerald-200">Bilingual Krishi Companion</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Quick Lang shortcut Selector dropdown */}
            <div className="relative bg-emerald-900 border border-emerald-600/50 rounded-lg px-2 py-1 flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              <select
                id="agri_quick_lang"
                className="bg-transparent text-white font-semibold text-xs outline-none cursor-pointer pr-1"
                value={currentLang}
                onChange={(e) => {
                  setCurrentLang(e.target.value as LanguageCode);
                  triggerVisualToast(`Language switched to: ${LANGUAGES.find(l => l.code === e.target.value)?.localName}`);
                }}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-slate-800">
                    {lang.localName}
                  </option>
                ))}
              </select>
            </div>

            {isJoined && (
              <span id="verified_user_badge" className="bg-yellow-400 text-emerald-950 p-1 rounded-full text-xs font-bold shadow-lg shrink-0" title={t.community.verifiedFarmer}>
                <Award className="w-4 h-4 animate-spin" />
              </span>
            )}

            {/* Realtime Notification Bell & Tray Switch */}
            {isJoined && (
              <div id="agri_notification_bell_comp" className="relative shrink-0">
                <button
                  onClick={() => setShowNotificationPane(!showNotificationPane)}
                  className={`p-1.5 rounded-xl border cursor-pointer relative transition-all ${
                    showNotificationPane 
                      ? 'bg-yellow-400 text-emerald-950 border-yellow-500' 
                      : 'bg-emerald-900 hover:bg-emerald-950 text-white border-emerald-600/50'
                  }`}
                  title="Farmer Alerts"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-black text-[8px] h-4 w-4 rounded-full flex items-center justify-center animate-bounce shadow">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Authentication Wall Gate - Highly polished initial overlay */}
        {!isJoined ? (
          <div id="agri_auth_screen" className="flex-1 flex flex-col justify-center px-6 py-8 bg-gradient-to-b from-emerald-50 to-white overflow-y-auto scrollbar-thin">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-200 mb-4 animate-pulse">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.common.otpTitle}</h2>
              <p className="text-xs text-slate-500 mt-1.5 px-4">{t.common.otpSubtitle}</p>
            </div>

            <div id="otp_auth_card_wrapper" className="bg-white rounded-3xl shadow-xl shadow-slate-100 p-6 border border-slate-100">
              {!showOtpScreen ? (
                <div id="enter_phone_section" className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wide uppercase">
                      Register Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-slate-400 font-bold text-sm">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        id="farmer_phone_input"
                        placeholder={t.common.phonePlaceholder}
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 focus:bg-white rounded-xl py-3 pl-14 pr-4 text-sm font-bold tracking-widest outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    onClick={triggerPhoneVerification}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2"
                  >
                    <span>{t.common.sendOtp}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div id="enter_otp_section" className="space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">
                      Message sent successfully to <span className="font-bold text-slate-800 font-mono">+91 {userPhone}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wide uppercase">
                      6-Digit SMS Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      id="otp_code_input"
                      placeholder={t.common.otpPlaceholder}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 focus:bg-white rounded-xl py-3 text-center text-lg font-black tracking-widest outline-none transition-all"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowOtpScreen(false)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-bold text-xs"
                    >
                      Change Number
                    </button>
                    <button
                      onClick={confirmOtpVerification}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                    >
                      {t.common.verifyOtp}
                    </button>
                  </div>
                </div>
              )}

              <div className="relative my-6 text-center">
                <hr className="border-slate-100" />
                <span className="absolute bg-white px-3 text-[10px] text-slate-400 font-bold -top-2 left-1/2 -translate-x-1/2 uppercase tracking-widest">
                  OR
                </span>
              </div>

              <button
                onClick={skipLoginAsGuest}
                className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-emerald-500 text-slate-600 hover:text-emerald-700 font-bold text-xs rounded-xl transition-all"
              >
                {t.common.guestLogin}
              </button>
            </div>

            <div className="mt-8 text-center space-y-2">
              <p className="text-[10px] text-slate-400">
                🔒 Data encrypted securely with your agricultural local mandis.
              </p>
              <div className="flex justify-center space-x-1.5 text-[10px] font-semibold text-slate-400">
                <span>English</span>•<span>ಕನ್ನಡ</span>•<span>हिन्दी</span>•<span>தமிழ்</span>•<span>తెలుగు</span>•<span>മലയാളം</span>
              </div>
            </div>
          </div>
        ) : (
          /* Main Application Views Wrapper Container */
          <div 
            id="agri_main_application" 
            className={`flex-1 flex flex-col bg-slate-50 relative ${
              (activeTab === 'assistant' && assistantMode === 'chat') ? 'overflow-hidden' : 'overflow-y-auto'
            }`}
          >
            {/* Realtime Notification Pane overlay */}
            {showNotificationPane && (
              <div id="agri_notification_tray_overlay" className="absolute inset-0 bg-slate-900/60 z-40 backdrop-blur-sm animate-fadeIn" onClick={() => setShowNotificationPane(false)}>
                <div 
                  id="agri_notification_tray_body" 
                  className="absolute top-0 right-0 left-0 max-h-[85%] bg-white rounded-b-[28px] shadow-2xl border-b border-emerald-550/30 p-4 overflow-y-auto flex flex-col z-50 animate-slideDown"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b mb-3.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-850 flex items-center justify-center font-bold text-sm">
                        📢
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Farmer Central Alerts ({notificationsList.length})</h3>
                        <p className="text-[9px] text-slate-500">Realtime live AgriVerse system alerts</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <button
                        onClick={async () => {
                          try {
                            const unreads = notificationsList.filter(n => !n.read);
                            for (const n of unreads) {
                              await updateDoc(doc(db, 'notifications', n.id), { read: true });
                            }
                            triggerVisualToast("✅ All alerts marked read!");
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="text-[9px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg cursor-pointer"
                      >
                        Mark All Read
                      </button>
                      <button
                        onClick={() => setShowNotificationPane(false)}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {notificationsList.length === 0 ? (
                    <div className="py-10 text-center space-y-2">
                      <p className="text-2xl">🎉</p>
                      <h4 className="text-xs font-bold text-slate-705">No active alerts right now</h4>
                      <p className="text-[10px] text-slate-400">System announcements, crop approvals, and chat updates will show up here.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1 select-none scrollbar-none">
                      {notificationsList.map((notif) => {
                        return (
                          <div
                            key={notif.id}
                            onClick={async () => {
                              try {
                                await updateDoc(doc(db, 'notifications', notif.id), { read: true });
                                setShowNotificationPane(false);
                                if (notif.type === 'message') {
                                  setActiveTab('community');
                                  setCommunitySubTab('chat');
                                } else if (notif.type === 'reservation' || notif.type === 'order') {
                                  setActiveTab('marketplace');
                                } else if (notif.type === 'alert') {
                                  setActiveTab('community');
                                  setCommunitySubTab('feed');
                                }
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer text-left flex justify-between items-start ${
                              notif.read 
                                ? 'bg-slate-50 border-slate-100 text-slate-600' 
                                : 'bg-emerald-50/50 border-emerald-100 text-emerald-950 font-bold shadow-sm'
                            }`}
                          >
                            <div className="flex items-start space-x-2.5 flex-1 pr-2">
                              <span className="text-base mt-0.5 shrink-0 select-none">
                                {notif.type === 'message' ? '💬' : notif.type === 'alert' ? '🚨' : '📦'}
                              </span>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-[10px] font-black leading-snug">{notif.title}</h4>
                                <p className="text-[9px] text-slate-650 leading-relaxed mt-0.5">{notif.body}</p>
                                <span className="text-[8px] text-slate-400 mt-1 block">
                                  {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                                </span>
                              </div>
                            </div>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-2 animate-pulse"></span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {showWeatherHub && (
              <WeatherIntelligence 
                currentLang={currentLang}
                onClose={() => setShowWeatherHub(false)}
                triggerToast={triggerVisualToast}
              />
            )}

            {showIrrigationHub && (
              <SmartIrrigationAdvisor
                currentLang={currentLang}
                onClose={() => setShowIrrigationHub(false)}
                triggerToast={triggerVisualToast}
              />
            )}

            {showCropPredictionHub && (
              <AICropPredictionSystem
                currentLang={currentLang}
                initialCropName={selectedPredictedCrop?.name}
                onClose={() => setShowCropPredictionHub(false)}
                triggerToast={triggerVisualToast}
              />
            )}

            {showSmartFarmAIHub && (
              <SmartFarmAIHub
                currentLang={currentLang}
                onClose={() => setShowSmartFarmAIHub(false)}
                triggerToast={triggerVisualToast}
                userUid={firebaseAuthUid}
                userName={profileName || (isJoined ? t.profile.farmerName : 'Farmer Partner')}
                userPhone={userPhone}
                cooperativeId={profileCooperativeId}
                onNavigateToTab={(tab, mode) => {
                  setActiveTab(tab);
                  if (mode) setAssistantMode(mode);
                }}
                onOpenCooperative={() => setShowCooperativeHub(true)}
              />
            )}

            {showCooperativeHub && (
              <div className="absolute inset-x-0 top-0 min-h-full z-50 bg-slate-50 flex flex-col animate-slideUp">
                <CooperativeNetwork
                  currentLang={currentLang}
                  onClose={() => setShowCooperativeHub(false)}
                  triggerToast={triggerVisualToast}
                  farmerId={firebaseAuthUid}
                  cooperativeId={profileCooperativeId}
                />
              </div>
            )}

            <React.Suspense fallback={
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs font-extrabold text-emerald-800 animate-pulse bg-slate-50 space-y-2.5">
                <RotateCcw className="w-5 h-5 animate-spin text-emerald-600 mb-1" />
                <span>Loading AgriVerse Systems...</span>
              </div>
            }>
            
            {/* VIEW 1: HOME PANEL */}
            {activeTab === 'home' && (
              <div id="v_home_tab" className="p-4 space-y-4 animate-fadeIn">
                
                {/* Greeting banner card layout */}
                <div id="home_greeting_banner" className="bg-gradient-to-tr from-emerald-800 to-emerald-600 rounded-3xl p-4 text-white shadow-lg border border-emerald-700/20 relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-xs font-bold text-emerald-200 flex items-center space-x-1 uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-yellow-300" />
                      {userPhone ? `+91 ${userPhone}` : `Guest Partner`}
                    </h3>
                    <h4 className="text-lg font-black mt-1 leading-snug">{t.home.greeting}</h4>
                    
                    {/* Voice Assistant quick search bar shortcut trigger */}
                    <div onClick={() => setActiveTab('assistant')} className="mt-3 bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/20 py-2.5 px-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all">
                      <span className="text-xs text-white/95 font-medium truncate">
                        {t.home.voiceSearchPlaceholder}
                      </span>
                      <Mic className="w-4 h-4 text-yellow-300 animate-pulse" />
                    </div>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-10 translate-x-2 translate-y-3">
                    <Sparkles className="w-28 h-28 text-white" />
                  </div>
                </div>

                {/* Weather Warning Section (Framer Red Alert Warning card layout) */}
                <div 
                  id="weather_severe_alert" 
                  onClick={() => {
                    setShowWeatherHub(true);
                    triggerVisualToast('Opening Emergency Weather Warnings console...');
                  }} 
                  className="bg-red-50 hover:bg-red-100/80 active:scale-[0.98] border-2 border-red-100 rounded-3xl p-3 flex space-x-3 items-start animate-pulse cursor-pointer transition-all"
                >
                  <div className="bg-red-500 text-white rounded-2xl p-2 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-extrabold text-red-800 text-xs uppercase tracking-wider">
                      Emergency Rainfall Alert
                    </h5>
                    <p className="text-xs text-red-700 font-medium leading-relaxed mt-0.5">
                      {t.home.alertTitle} Click for severe weather hub!
                    </p>
                  </div>
                </div>

                {/* Weather details card */}
                <div 
                  id="weather_met_card" 
                  onClick={() => {
                    setShowWeatherHub(true);
                    triggerVisualToast('Deploying AgriVerse Weather Intelligence Network...');
                  }}
                  className="bg-white hover:bg-slate-50 hover:border-emerald-500/30 active:scale-[0.99] rounded-3xl border border-slate-100 hover:border-emerald-500/20 shadow-xl shadow-slate-100/50 p-4 cursor-pointer transition-all relative group"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide flex items-center space-x-1">
                      <CloudRain className="w-4 h-4 text-emerald-600 group-hover:animate-bounce" />
                      <span>{t.home.weatherCard}</span>
                    </h4>
                    <span className="text-[9px] text-emerald-800 bg-emerald-50 font-black px-2.5 py-0.5 rounded-full uppercase flex items-center space-x-1 border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1"></span>
                      <span>Chikkaballapura Region</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <p className="text-3xl font-black text-slate-800">28°C</p>
                      <p className="text-xs text-slate-500 font-semibold tracking-tight mt-0.5">{t.home.currentWeather}</p>
                    </div>

                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-2xl text-[11px] font-semibold text-slate-600">
                      <div className="flex justify-between">
                        <span>{t.home.humidity}:</span>
                        <span className="text-slate-800 font-bold font-mono">82%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.home.rainfallChance}:</span>
                        <span className="text-emerald-700 font-bold font-mono">High Rain</span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal weather forecast */}
                  <div className="flex justify-between mt-4 pt-3 border-t border-slate-100 text-center">
                    {['Fri', 'Sat', 'Sun', 'Mon', 'Tue'].map((day, dIdx) => (
                      <div key={day} className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold">{day}</p>
                        <div className="bg-slate-50 p-1.5 rounded-xl flex flex-col items-center">
                          <CloudRain className={`w-3.5 h-3.5 ${dIdx < 2 ? 'text-blue-500' : 'text-slate-400'}`} />
                          <p className="text-[10px] font-bold text-slate-800 mt-1">{dIdx < 2 ? '27°' : '30°'}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3.5 pt-2 text-center border-t border-slate-50 text-[9px] font-black text-emerald-700 uppercase tracking-widest flex items-center justify-center space-x-1">
                    <span>Unlock Smart Weather Advisor & Warnings</span>
                    <ChevronRight className="w-3 h-3 text-emerald-600 animate-pulse" />
                  </div>
                </div>

                {/* Quick actions visual tools grid */}
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide mb-2">
                    {t.home.quickActions}
                  </h4>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    <button onClick={() => { setActiveTab('assistant'); setDiagnosisReport(null); setSelectedLeafImage(null); }} className="bg-white hover:bg-emerald-50 rounded-2xl p-2 border border-slate-100 flex flex-col items-center space-y-1 cursor-pointer shadow-sm">
                      <div className="w-8.5 h-8.5 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center shrink-0">
                        <Camera className="w-4 h-4" />
                      </div>
                      <span className="text-[8.5px] font-extrabold text-slate-700 leading-tight block">
                        {t.home.cropDoctor}
                      </span>
                    </button>

                    <button 
                      onClick={() => {
                        setShowWeatherHub(true);
                        triggerVisualToast('Deploying AgriVerse Weather Intelligence Network...');
                      }} 
                      className="bg-white hover:bg-indigo-50 rounded-2xl p-2 border border-slate-100 flex flex-col items-center space-y-1 cursor-pointer shadow-sm active:scale-95 transition-all"
                    >
                      <div className="w-8.5 h-8.5 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center shrink-0">
                        <CloudRain className="w-4 h-4" />
                      </div>
                      <span className="text-[8.5px] font-extrabold text-slate-700 leading-tight block">
                        {currentLang === 'kn' ? 'ಹವಾಮಾನ' : currentLang === 'hi' ? 'मौसम' : 'Weather'}
                      </span>
                    </button>

                    <button 
                      onClick={() => {
                        setShowIrrigationHub(true);
                        triggerVisualToast('Launching Soil & Irrigation Advisor dashboard...');
                      }} 
                      className="bg-white hover:bg-blue-50 rounded-2xl p-2 border border-slate-100 flex flex-col items-center space-y-1 cursor-pointer shadow-sm active:scale-95 transition-all"
                    >
                      <div className="w-8.5 h-8.5 bg-blue-100 text-blue-800 rounded-xl flex items-center justify-center shrink-0">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <span className="text-[8.5px] font-extrabold text-slate-700 leading-tight block">
                        {t.home.irrigation}
                      </span>
                    </button>

                    <button 
                      onClick={() => {
                        setShowCooperativeHub(true);
                        triggerVisualToast('Opening regional Cooperative Farming Hub with Smart Match... 👥');
                      }} 
                      className="bg-white hover:bg-teal-50 rounded-2xl p-2 border border-slate-100 flex flex-col items-center space-y-1 cursor-pointer shadow-sm active:scale-95 transition-all"
                    >
                      <div className="w-8.5 h-8.5 bg-teal-100 text-teal-800 rounded-xl flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-[8.5px] font-extrabold text-slate-700 leading-tight block">
                        {currentLang === 'kn' ? 'ಕೂಟ' : currentLang === 'hi' ? 'सहकारी' : 'Cooperative'}
                      </span>
                    </button>

                    <button onClick={() => { setActiveTab('profile'); triggerVisualToast('Matching eligible land records is active in eligibility tab.'); }} className="bg-white hover:bg-emerald-50 rounded-2xl p-2 border border-slate-100 flex flex-col items-center space-y-1 cursor-pointer shadow-sm">
                      <div className="w-8.5 h-8.5 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center shrink-0">
                        <Bookmark className="w-4 h-4" />
                      </div>
                      <span className="text-[8.5px] font-extrabold text-slate-700 leading-tight block">
                        {t.home.schemes}
                      </span>
                    </button>
                  </div>
                </div>

                {/* AgriVerse AI Operating System Portal Entry Banner */}
                <div 
                  id="agri_ai_os_core_entry"
                  onClick={() => {
                    setShowSmartFarmAIHub(true);
                    triggerVisualToast('Initializing Smart Farm AI Operating System...');
                  }}
                  className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-4 shadow-xl border border-emerald-800/40 relative overflow-hidden cursor-pointer active:scale-[0.99] hover:border-yellow-400/40 transition-all group"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl"></div>
                  <div className="relative z-10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="bg-yellow-400 text-emerald-950 text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-xs">
                        <Sparkles className="w-2.5 h-2.5 mr-0.5 text-emerald-950 animate-pulse" />
                        <span>AgriVerse AI OS</span>
                      </span>
                      <span className="text-[10px] text-emerald-300 font-extrabold flex items-center bg-white/10 px-2 py-0.5 rounded-full select-none">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping mr-1"></span>
                        <span>Phase 3 Live</span>
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-sm font-black tracking-tight flex items-center space-x-1.5 text-white">
                        <span>Smart Farm AI Hub</span>
                        <ChevronRight className="w-4 h-4 text-yellow-300 group-hover:translate-x-1 transition-transform" />
                      </h4>
                      <p className="text-[10.5px] text-emerald-100 font-medium leading-relaxed opacity-95">
                        Run full-scale pest forecasting, weekly crop stages calendar, soil pH diagnoses, ROI investment plans, and voice companions.
                      </p>
                    </div>

                    <div className="pt-1.5">
                      <div className="w-full bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-emerald-950 font-black text-[10.5px] uppercase tracking-wider py-2 rounded-2xl transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950/20">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Launch Advanced AI OS</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Farming Reminders checklist (soilReminders) */}
                <div id="farming_reminders_section" className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide flex items-center space-x-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{t.home.growReminders || "Daily Farming Reminders"}</span>
                    </h4>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                      {soilReminders.filter(r => !r.done).length} Active
                    </span>
                  </div>

                  <div className="space-y-2">
                    {soilReminders.map((rem) => (
                      <div 
                        key={rem.id} 
                        onClick={() => {
                          setSoilReminders(prev => prev.map(r => r.id === rem.id ? { ...r, done: !r.done } : r));
                          triggerVisualToast(rem.done ? 'Marked reminder as incomplete' : 'Completed reminder! 🎉');
                        }}
                        className={`flex items-start space-x-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                          rem.done 
                            ? 'bg-slate-50/70 border-slate-100 opacity-60' 
                            : 'bg-emerald-50/20 border-emerald-100/50 hover:bg-emerald-50/40'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {rem.done ? (
                            <div className="w-4.5 h-4.5 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 bg-white" />
                          )}
                        </div>
                        <span className={`text-xs font-semibold leading-snug ${rem.done ? 'line-through text-slate-400 font-normal' : 'text-slate-700'}`}>
                          {rem.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add Custom Reminder input field */}
                  <div className="mt-3 pt-2.5 border-t border-slate-50 flex items-center space-x-2">
                    <input 
                      type="text"
                      placeholder="Add custom crop memo..."
                      value={newReminderText}
                      onChange={(e) => setNewReminderText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addSoilReminder();
                        }
                      }}
                      className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:bg-white"
                    />
                    <button 
                      onClick={addSoilReminder}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-sm active:scale-95 transition-all shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Recommended Schemes checklist/summary overview card */}
                <div id="recommended_schemes_section" className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-4 animate-fadeIn">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide flex items-center space-x-1.5">
                      <Bookmark className="w-4 h-4 text-emerald-600" />
                      <span>{t.home.governmentSchemes || "Recommended Schemes"}</span>
                    </h4>
                    <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full font-bold">
                      Matched
                    </span>
                  </div>

                  <div className="space-y-3">
                    {MOCK_GOV_SCHEMES.map((sch) => (
                      <div 
                        key={sch.id}
                        onClick={() => {
                          setActiveTab('profile');
                          setExpandedSchemeId(sch.id);
                          triggerVisualToast(`Inspecting ${sch.title} on match ledger...`);
                        }}
                        className="bg-slate-50/70 hover:bg-emerald-50/20 hover:border-emerald-200 border border-slate-150 p-3 rounded-2xl cursor-pointer transition-all flex justify-between items-center"
                      >
                        <div className="space-y-0.5 flex-1 min-w-0 pr-2">
                          <h5 className="text-xs font-black text-slate-850 leading-tight truncate">
                            {sch.title}
                          </h5>
                          <p className="text-[10px] text-slate-500 font-semibold leading-tight truncate">
                            🎁 {sch.benefit}
                          </p>
                        </div>
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-extrabold py-1 px-2.5 rounded-xl shrink-0 uppercase tracking-wider">
                          Apply
                        </span>
                      </div>
                    ))}
                  </div>

                  <div 
                    onClick={() => {
                      setActiveTab('profile');
                      triggerVisualToast('Opening matched subsidies checker...');
                    }}
                    className="mt-3.5 pt-2 text-center border-t border-slate-50 text-[9px] font-black text-emerald-700 uppercase tracking-widest flex items-center justify-center space-x-1 cursor-pointer hover:text-emerald-800"
                  >
                    <span>{t.home.applyNow || "Check Full Scheme Eligibility"}</span>
                    <ChevronRight className="w-3 h-3 text-emerald-600 animate-pulse" />
                  </div>
                </div>

                {/* Mandi Price Rates Carousels layout */}
                <div id="crop_prices_section">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                      {t.home.cropPrices}
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">
                      Live daily Mandi APMC
                    </span>
                  </div>

                  <div className="flex space-x-3 overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x py-2 px-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none">
                    {MOCK_CROP_PRICES.map((crop) => (
                      <div
                        key={crop.id}
                        onClick={() => {
                          triggerCropPredictionInsight(crop);
                          setShowCropPredictionHub(true);
                        }}
                        className={`min-w-[145px] max-w-[170px] w-[50%] xs:w-[45%] bg-white rounded-2xl p-3.5 border cursor-pointer shrink-0 snap-start transition-all shadow-sm ${
                          selectedPredictedCrop?.id === crop.id ? 'border-emerald-600 bg-emerald-50/20 shadow-md ring-2 ring-emerald-600/10' : 'border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[11px] font-extrabold text-slate-800 truncate pr-1">
                            {crop.name}
                          </p>
                          <span className={`p-0.5 rounded-full text-[9px] font-black ${
                            crop.trend === 'up' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {crop.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5 rotate-180" />}
                          </span>
                        </div>
                        <p className="text-sm font-black text-slate-800 font-mono">
                          {crop.price}
                        </p>
                        <div className="mt-1 flex items-center justify-between text-[9px] font-bold">
                          <span className={crop.trend === 'up' ? 'text-emerald-700' : 'text-red-700'}>
                            {crop.change}
                          </span>
                          <span className="text-emerald-950 bg-yellow-300 px-1.5 py-0.2 rounded font-mono font-extrabold">
                            Predict
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Future Season Dynamic Crop Prediction advice */}
                  {selectedPredictedCrop && (
                    <div id="dynamic_ai_prediction_view" className="mt-2 text-xs bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-3xl p-4 text-white shadow-lg animate-fadeIn border border-emerald-950">
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
                          <h5 className="font-extrabold text-xs uppercase tracking-wider text-emerald-200">
                            {t.home.predictionTitle}: {selectedPredictedCrop.name}
                          </h5>
                        </div>
                        <button onClick={() => setSelectedPredictedCrop(null)} className="text-emerald-200 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {isPredictionLoading ? (
                        <div className="py-4 text-center space-y-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mx-auto"></div>
                          <p className="text-[10px] text-emerald-200">Consulting global and district trends...</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-extrabold uppercase">
                            <div className="bg-emerald-950/40 p-2 rounded-xl">
                              <span className="block text-emerald-300 text-[8px] mb-0.5">{t.home.demandLevel}</span>
                              <span className="text-yellow-300 font-mono">{activeCropPredictionResult?.expectedDemand || selectedPredictedCrop.demand}</span>
                            </div>
                            <div className="bg-emerald-950/40 p-2 rounded-xl">
                              <span className="block text-emerald-300 text-[8px] mb-0.5">{t.home.profitPotential}</span>
                              <span className="text-green-300 font-mono">{activeCropPredictionResult?.profitPotential || selectedPredictedCrop.profit}</span>
                            </div>
                            <div className="bg-emerald-950/40 p-2 rounded-xl">
                              <span className="block text-emerald-300 text-[8px] mb-0.5">{t.home.climateRisk}</span>
                              <span className={`${activeCropPredictionResult?.climateRisk === 'HIGH' ? 'text-red-400' : 'text-emerald-200'}`}>{activeCropPredictionResult?.climateRisk || selectedPredictedCrop.risk}</span>
                            </div>
                          </div>

                          <div className="bg-emerald-950/30 p-3 rounded-2xl space-y-2">
                            <p className="text-xs leading-relaxed font-medium">
                              {activeCropPredictionResult?.advisoryText || selectedPredictedCrop.nextSeasonPredicted}
                            </p>
                            
                            <button
                              onClick={() => {
                                setShowCropPredictionHub(true);
                                triggerVisualToast('Opening AI Future Crop Forecast Hub...');
                              }}
                              className="w-full bg-yellow-300 hover:bg-yellow-400 text-emerald-950 text-[10px] font-black uppercase tracking-wider py-2 rounded-xl transition-all cursor-pointer text-center"
                            >
                              {currentLang === 'kn' ? 'ಪೂರ್ಣ ಎಐ ಬೆಳೆ ಮುನ್ಸೂಚನೆ ಹಬ್ ತೆರೆಯಿರಿ' : 'Open Full AI Crop Prediction Hub'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'community' && (
              <div id="v_community_feed" className="p-3 pb-24 space-y-4 animate-fadeIn max-w-xl mx-auto">

                {/* AgriVerse Specialized Subsystem Switcher Row */}
                <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 border">
                  <button
                    onClick={() => setCommunitySubTab('feed')}
                    className={`flex-1 text-center py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                      communitySubTab === 'feed'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🚀 <span>Forums Feed</span>
                  </button>
                  <button
                    onClick={() => {
                      setCommunitySubTab('voice');
                      triggerVisualToast('Opened regional audio broadcasts forum 🎙️');
                    }}
                    className={`flex-1 text-center py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                      communitySubTab === 'voice'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🎙️ <span>Voice Hub</span>
                  </button>
                  <button
                    onClick={() => {
                      setCommunitySubTab('chat');
                      triggerVisualToast('Opened peer-to-peer real-time farmers chat 💬');
                    }}
                    className={`flex-1 text-center py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                      communitySubTab === 'chat'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    💬 <span>Farmers Chat</span>
                  </button>
                  <button
                    onClick={() => {
                      setCommunitySubTab('coop');
                      triggerVisualToast('Opened Cooperative Farming Hub 👥');
                    }}
                    className={`flex-1 text-center py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                      communitySubTab === 'coop'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    👥 <span>Co-op Hub</span>
                  </button>
                </div>

                {communitySubTab === 'coop' && (
                  <CooperativeNetwork
                    currentLang={currentLang}
                    onClose={() => setCommunitySubTab('feed')}
                    triggerToast={triggerVisualToast}
                    farmerId={firebaseAuthUid}
                    cooperativeId={profileCooperativeId}
                  />
                )}

                {communitySubTab === 'voice' && (
                  <VoicePostsSystem
                    currentLang={currentLang}
                    triggerVisualToast={triggerVisualToast}
                    userId={firebaseAuthUid}
                    userName={firebaseAuthName}
                    district={postDistrict}
                    village={postVillage}
                    isVerifiedUser={isJoined}
                  />
                )}

                {communitySubTab === 'chat' && (
                  <FarmerChatSystem
                    currentLang={currentLang}
                    triggerVisualToast={triggerVisualToast}
                    userId={firebaseAuthUid}
                    userName={firebaseAuthName}
                    district={postDistrict}
                    village={postVillage}
                    isVerifiedUser={isJoined}
                  />
                )}

                {communitySubTab === 'feed' && (
                  <>
                    {/* Emergency Alert Dispatcher */}
                    <div className="bg-red-50 border border-red-200/60 rounded-3xl p-4 shadow-md space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <AlertTriangle className="w-5 h-5 text-red-650 animate-pulse shrink-0" />
                          <div>
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                              Ecosystem Alerts & Emergency Broadcast
                            </h4>
                            <p className="text-[10px] text-slate-500 font-medium">
                              Push real-time regional warnings directly to active devices
                            </p>
                          </div>
                        </div>
                        <span className="text-[9px] bg-red-100 text-red-800 font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                          Safety Monitor
                        </span>
                      </div>

                      <button
                        onClick={handleBroadcastEmergencyAlert}
                        className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-2.5 px-3 text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm active:scale-98"
                      >
                        <span>🚨</span>
                        <span>Broadcast District Emergency Warning</span>
                      </button>
                    </div>

                    {/* Community Sub-Header */}
                    <div className="bg-gradient-to-r from-emerald-850 to-teal-900 text-emerald-950 p-4 rounded-3xl space-y-2 border border-emerald-500/10 shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-black uppercase text-emerald-800 tracking-wider flex items-center space-x-1">
                        <Globe className="w-4 h-4 animate-pulse text-emerald-600 shrink-0" />
                        <span>{currentLang === 'kn' ? 'ಕರ್ನಾಟಕ ರೈತ ಮಂಡಳಿ' : currentLang === 'hi' ? 'कर्नाटक किसान मंच' : 'Karnataka Farmer Forums'}</span>
                      </h3>
                      <p className="text-xs text-emerald-950 font-bold leading-normal">
                        {currentLang === 'kn' ? 'ನಿಮ್ಮ ಜಿಲ್ಲೆ ಮತ್ತು ಕೃಷಿ ವಿಷಯಗಳ ಆಧಾರದ ಮೇಲೆ ಫಿಲ್ಟರ್ ಮಾಡಿ' : 'Filter discussions by Karnataka districts & farming tags'}
                      </p>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-black uppercase">
                      {posts.length} Active
                    </span>
                  </div>

                  {/* District filtration select row */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-emerald-800">
                        📍 {currentLang === 'kn' ? 'ಜಿಲ್ಲೆ ಹಬ್' : 'District Hub'}
                      </label>
                      <select
                        value={districtFilter}
                        onChange={(e) => {
                          setDistrictFilter(e.target.value);
                          triggerVisualToast(`Switched forum hub to: ${e.target.value === 'all' ? 'All Karnataka' : e.target.value}`);
                        }}
                        className="w-full bg-white text-slate-800 border-2 border-emerald-500/10 rounded-xl p-2 text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="all">📍 {currentLang === 'kn' ? 'ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು' : 'All Districts (KA)'}</option>
                        <option value="Chikkaballapura">Chikkaballapura</option>
                        <option value="Dharwad">Dharwad</option>
                        <option value="Kolar">Kolar</option>
                        <option value="Mandya">Mandya</option>
                        <option value="Raichur">Raichur</option>
                        <option value="Koppal">Koppal</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-emerald-800">
                        🏷️ {currentLang === 'kn' ? 'ವಿಷಯ ಹ್ಯಾಶ್‌ಟ್ಯಾಗ್' : 'Discussion Topic'}
                      </label>
                      <select
                        value={categoryFilter}
                        onChange={(e) => {
                          setCategoryFilter(e.target.value);
                          triggerVisualToast(`Filtered posts by tag: ${e.target.value}`);
                        }}
                        className="w-full bg-white text-slate-800 border-2 border-emerald-500/10 rounded-xl p-2 text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="all">🌱 {currentLang === 'kn' ? 'ಎಲ್ಲಾ ಚರ್ಚೆಗಳು' : 'All Categories'}</option>
                        <option value="disease">🐛 {currentLang === 'kn' ? 'ರೋಗ ಮತ್ತು ಕೀಟ' : 'Pests & Disease'}</option>
                        <option value="weather">⛈️ {currentLang === 'kn' ? 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ' : 'Weather Updates'}</option>
                        <option value="crop_update">🌾 {currentLang === 'kn' ? 'ಅಧಿಕ ಇಳುವರಿ / ಕೊಯ್ಲು' : 'Crop Harvest'}</option>
                        <option value="general">💬 {currentLang === 'kn' ? 'ಸಾಮಾನ್ಯ ಸಲಹೆಗಳು' : 'General Chat'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Feed tabs navigation: Public feed, Saved, Followed */}
                <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                  <button
                    onClick={() => setCommunityTab('all')}
                    className={`flex-1 text-center py-2 text-xs font-extrabold rounded-xl transition-all ${
                      communityTab === 'all' ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🚀 {currentLang === 'kn' ? 'ಸಾರ್ವಜನಿಕ ಫೀಡ್' : 'Public Feed'}
                  </button>
                  <button
                    onClick={() => setCommunityTab('saved')}
                    className={`flex-1 text-center py-2 text-xs font-extrabold rounded-xl transition-all ${
                      communityTab === 'saved' ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📌 {currentLang === 'kn' ? 'ಉಳಿಸಿದ ಪೋಸ್ಟ್‌ಗಳು' : 'Bookmarked'} ({savedPostIds.length})
                  </button>
                  <button
                    onClick={() => {
                      setCommunityTab('trending');
                      triggerVisualToast('Prioritising posts by followed farmers & high engagement!');
                    }}
                    className={`flex-1 text-center py-2 text-xs font-extrabold rounded-xl transition-all ${
                      communityTab === 'trending' ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🔥 {currentLang === 'kn' ? 'ಟ್ರೆಂಡಿಂಗ್' : 'Trending'}
                  </button>
                </div>

                {/* Create post dialogue box */}
                <div id="community_create_box" className="bg-white rounded-3xl border border-slate-100 shadow-xl p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                        {isJoined ? t.profile.farmerName[0] : 'F'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{isJoined ? t.profile.farmerName : 'AgriVerse Partner'}</p>
                        <p className="text-[9px] text-slate-400 font-bold">{t.community.createPost}</p>
                      </div>
                    </div>

                    {/* Category inside post composition form */}
                    <div className="flex items-center space-x-1.5 bg-slate-50 border p-1 rounded-xl">
                      <span className="text-[9px] text-slate-400 font-bold pl-1 uppercase">Post to:</span>
                      <select
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value)}
                        className="bg-transparent text-[10px] text-slate-700 font-black outline-none border-none py-0.5 cursor-pointer"
                      >
                        <option value="general">💬 General</option>
                        <option value="disease">🐛 Pests</option>
                        <option value="weather">⛈️ Weather</option>
                        <option value="crop_update">🌾 Crop/Mandi</option>
                      </select>
                    </div>
                  </div>

                  {/* Regional geolocation setting inside edit box */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl text-[10px] font-bold text-slate-600">
                    <div className="flex items-center space-x-1">
                      <span>District:</span>
                      <select
                        value={postDistrict}
                        onChange={(e) => setPostDistrict(e.target.value)}
                        aria-label="District Filter Selector"
                        className="bg-transparent text-slate-800 font-extrabold outline-none border-none cursor-pointer"
                      >
                        <option value="Chikkaballapura">Chikkaballapura</option>
                        <option value="Dharwad">Dharwad</option>
                        <option value="Kolar">Kolar</option>
                        <option value="Mandya">Mandya</option>
                        <option value="Raichur">Raichur</option>
                        <option value="Koppal font-black">Koppal</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>Village:</span>
                      <input
                        type="text"
                        value={postVillage}
                        onChange={(e) => setPostVillage(e.target.value)}
                        placeholder="Village name..."
                        aria-label="Village Input Bar"
                        className="bg-transparent text-slate-800 font-extrabold placeholder-slate-300 pointer-events-auto border-none outline-none w-full"
                      />
                    </div>
                  </div>

                  <textarea
                    id="new_post_content_area"
                    rows={2}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder={currentLang === 'kn' ? 'ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳು ಅಥವಾ ಕೊಯ್ಲು ಫೋಟೋಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ...' : t.community.postPlaceholder}
                    aria-label="New Post Content Area"
                    className="w-full bg-slate-50 focus:bg-white border-2 border-slate-100 focus:border-emerald-500 rounded-2xl p-3 text-xs font-semibold outline-none transition-all scrollbar-none"
                  />

                  {/* Live Active Voice post record prompt indicator */}
                  {isRecordingVoicePost && (
                    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-2xl animate-pulse">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></div>
                        <span className="text-[10px] text-red-800 font-black uppercase tracking-wider">
                          Recording Sound Note... {voiceRecordDuration}s
                        </span>
                      </div>
                      <button
                        onClick={stopVoiceRecording}
                        className="bg-red-600 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl hover:bg-red-700"
                      >
                        🛑 Stop & Attach
                      </button>
                    </div>
                  )}

                  {/* Captures Base64 player preview inside create box */}
                  {voicePostBase64 && (
                    <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-indigo-800 font-black uppercase tracking-wider flex items-center space-x-1">
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>🎙️ Sound Attachment Loaded (WAV Sound)</span>
                        </span>
                        <button
                          onClick={() => {
                            setVoicePostBase64(null);
                            setVoicePostCaption('');
                          }}
                          className="text-red-500 hover:text-red-700 font-bold text-[9px] uppercase"
                        >
                          Delete
                        </button>
                      </div>
                      
                      <audio controls src={voicePostBase64} className="w-full h-8 cursor-pointer rounded" />
                      
                      {/* Interactive sound captions editor */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold">Multilingual Voice Caption (Transcribed by AI):</label>
                        <input
                          type="text"
                          value={voicePostCaption}
                          onChange={(e) => setVoicePostCaption(e.target.value)}
                          placeholder="Type description or caption for voice message..."
                          className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-semibold outline-none text-indigo-900"
                        />
                      </div>
                    </div>
                  )}

                  {/* Picture attachment preview logger */}
                  {selectedPostImage && (
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-slate-200">
                      <img referrerPolicy="no-referrer" src={selectedPostImage} alt="Attachment" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setSelectedPostImage(null)}
                        className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full cursor-pointer hover:bg-black/80"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1 border-t border-slate-50">
                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => hiddenPostImageInputRef.current?.click()}
                        className="p-2 hover:bg-slate-50 hover:text-emerald-700 rounded-xl flex items-center space-x-1 text-slate-500 text-[10px] font-bold border border-slate-100 cursor-pointer transition-all"
                      >
                        <Camera className="w-4 h-4 text-emerald-600" />
                        <span>{t.community.shareImageBtn}</span>
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={hiddenPostImageInputRef}
                        className="hidden"
                        onChange={(e) => handleImageConversion(e, 'post')}
                      />

                      <button
                        onClick={() => {
                          if (isRecordingVoicePost) {
                            stopVoiceRecording();
                          } else {
                            startVoiceRecording();
                          }
                        }}
                        className={`p-2 rounded-xl flex items-center space-x-1 text-[10px] font-bold border transition-all ${
                          isRecordingVoicePost 
                            ? 'bg-red-50 text-red-700 border-red-250 animate-pulse'
                            : voicePostBase64 
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'hover:bg-slate-55 text-slate-500 border-slate-100'
                        }`}
                      >
                        <Mic className={`w-4 h-4 ${isRecordingVoicePost ? 'text-red-650' : 'text-slate-400'}`} />
                        <span>{isRecordingVoicePost ? 'Recording...' : 'Voice Update'}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleCreatePost(postCategory, postDistrict, postVillage)}
                      className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center space-x-1 shadow-md transition-all cursor-pointer select-none"
                    >
                      <span>Share</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Feed elements post cards */}
                <div className="space-y-4">
                  {posts
                    .filter((post) => {
                      // Apply district filter
                      if (districtFilter !== 'all' && post.district !== districtFilter) return false;
                      // Apply category filter
                      if (categoryFilter !== 'all' && post.category !== categoryFilter) return false;
                      // Apply custom feed tab filters
                      if (communityTab === 'saved') return savedPostIds.includes(post.id);
                      return true;
                    })
                    .sort((a, b) => {
                      // Sort by connected followed farmers first, then date
                      const aFollowed = followedFarmers.includes(a.author) ? 1 : 0;
                      const bFollowed = followedFarmers.includes(b.author) ? 1 : 0;
                      if (aFollowed !== bFollowed) return bFollowed - aFollowed;
                      // Handle trending sorting by likes count
                      if (communityTab === 'trending') return b.likes - a.likes;
                      return 0; // maintain database ingestion sequence
                    })
                    .map((post) => {
                      const isLiked = (post.likedBy || []).includes(isJoined ? t.profile.farmerName : 'guest_user');
                      const isSaved = savedPostIds.includes(post.id);
                      const isFollowing = followedFarmers.includes(post.author);

                      return (
                        <div key={post.id} className={`bg-white rounded-3xl border shadow-xl p-4 space-y-3.5 transition-all ${
                          isFollowing ? 'border-yellow-250 ring-2 ring-yellow-100/50' : 'border-slate-100'
                        }`}>
                          
                          {/* Post Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-9 h-9 rounded-xl bg-slate-50 border flex items-center justify-center font-extrabold text-slate-500 uppercase">
                                {post.author ? post.author[0] : 'U'}
                              </div>
                              <div>
                                <p className="text-xs font-extrabold text-slate-800 flex items-center space-x-1">
                                  <span>{post.author}</span>
                                  {post.isVerified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100 shrink-0" />}
                                  {isFollowing && (
                                    <span className="text-[8px] bg-yellow-100 text-yellow-800 px-1 inline-flex rounded uppercase font-black tracking-wider leading-none">
                                      {currentLang === 'kn' ? 'ಸ್ನೇಹಿತ' : 'Connected'}
                                    </span>
                                  )}
                                </p>
                                <p className="text-[9px] text-slate-400 font-bold leading-none">
                                  {post.village ? `${post.village}, ` : ''}{post.district || 'KA'} • {post.time || 'Some time ago'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              {/* District / Topic badges */}
                              <span className="text-[8px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                                {post.category === 'disease' ? '🐛 Pests' : post.category === 'weather' ? '⛈️ Weather' : post.category === 'crop_update' ? '🌾 Harvest' : '💬 Chat'}
                              </span>

                              {/* Toggle connection / Follow farmer */}
                              <button
                                onClick={() => handleToggleFollowFarmer(post.author)}
                                className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                                  isFollowing 
                                    ? 'bg-yellow-50 text-yellow-800 border-yellow-200' 
                                    : 'bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {isFollowing ? '✓ Connected' : '+ Follow'}
                              </button>
                            </div>
                          </div>

                          {/* Content Paragraph text */}
                          <div className="space-y-1">
                            {post.isFlagged ? (
                              <div className="bg-red-50 border border-red-150 p-3.5 rounded-2xl flex items-center space-x-2 text-xs font-bold text-red-700">
                                <span>⚠️ Content Quarantined — Flagged Policy Breach Under Review</span>
                              </div>
                            ) : (
                              <p className="text-xs leading-relaxed text-slate-700 font-semibold selection:bg-emerald-100 font-medium">
                                {post.content}
                              </p>
                            )}

                            {/* Rendering translations block by Gemini AI */}
                            {!post.isFlagged && aiTranslations[post.id] && (
                              <div className="bg-emerald-50/50 p-3 rounded-2xl text-[11px] leading-relaxed text-emerald-900 border border-emerald-50 border-dashed animate-fadeIn space-y-1 font-medium">
                                <span className="text-[9px] uppercase font-black text-emerald-700 flex items-center space-x-0.5">
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                                  <span>Gemini AI Translated:</span>
                                </span>
                                <p>{aiTranslations[post.id]}</p>
                              </div>
                            )}

                            {/* Rendering summaries block by Gemini AI */}
                            {!post.isFlagged && aiSummaries[post.id] && (
                              <div className="bg-indigo-50/40 p-3 rounded-2xl text-[11px] leading-relaxed text-indigo-900 border border-indigo-50 border-dashed animate-fadeIn space-y-1 font-medium">
                                <span className="text-[9px] uppercase font-black text-indigo-700 flex items-center space-x-0.5">
                                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Gemini 1-Sentence synopsis:</span>
                                </span>
                                <p>• {aiSummaries[post.id]}</p>
                              </div>
                            )}
                          </div>

                          {/* Audio voice player inside post card */}
                          {post.voiceUrl && (
                            <div className="bg-indigo-50/40 p-3 rounded-2xl border border-dashed border-indigo-100 flex flex-col space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1.5 text-indigo-800 text-[10px] font-extrabold pb-0.5">
                                  <Volume2 className="w-4 h-4 text-indigo-600 animate-pulse" />
                                  <span>🎙️ {currentLang === 'kn' ? 'ರೈತರ ಧ್ವನಿ ಹೇಳಿಕೆ' : 'Farmer Voice Note Playback'}</span>
                                </div>
                                <span className="text-[8px] bg-indigo-100 text-indigo-800 font-black tracking-wide uppercase px-1.5 rounded">WAV Audio</span>
                              </div>

                              <audio controls src={post.voiceUrl} className="w-full h-8 cursor-pointer max-w-full" />
                              
                              {post.voiceCaption && (
                                <p className="text-[10px] text-indigo-900 font-semibold bg-white p-2 rounded-xl leading-relaxed border border-indigo-100/30">
                                  {post.voiceCaption}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Attached picture */}
                          {post.image?.startsWith('data:image') || post.image?.startsWith('http') ? (
                            <div className="rounded-2xl overflow-hidden max-h-[220px] border border-slate-100">
                              <img referrerPolicy="no-referrer" src={post.image} alt="Crop sample" className="w-full h-full object-cover select-none" />
                            </div>
                          ) : null}

                          {/* SPECIAL GEMINI AI INTERACTION ASSISTANTS TOOLBAR */}
                          <div className="flex flex-wrap items-center bg-slate-50/80 p-2.5 rounded-2xl gap-2 justify-between border border-slate-100 border-dashed text-[10px] font-bold text-slate-500">
                            <span className="text-[8px] font-black uppercase text-emerald-700 flex items-center space-x-0.5 select-none shrink-0">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                              <span>AI Expert:</span>
                            </span>

                            <div className="flex gap-1">
                              {/* Translate button */}
                              <button
                                onClick={() => handleTranslatePost(post.id, currentLang)}
                                className={`px-2 py-1 rounded bg-white border cursor-pointer flex items-center space-x-1 ${
                                  loadingAiField[`${post.id}_translate`] ? 'animate-pulse text-indigo-600' : 'hover:bg-slate-100 text-slate-600'
                                }`}
                              >
                                <span>🌍 {currentLang === 'kn' ? 'ಅನುವಾದಿಸಿ' : 'Translate'}</span>
                              </button>

                              {/* Summarize button */}
                              <button
                                onClick={() => handleSummarizePost(post.id, currentLang)}
                                className={`px-2 py-1 rounded bg-white border cursor-pointer flex items-center space-x-1 ${
                                  loadingAiField[`${post.id}_summarize`] ? 'animate-pulse text-emerald-600' : 'hover:bg-slate-100 text-slate-650'
                                }`}
                              >
                                <span>⚡ {currentLang === 'kn' ? 'ಸಾರಾಂಶ' : 'Synopsis'}</span>
                              </button>

                              {/* Suggest expert reply button */}
                              <button
                                onClick={() => handleSuggestReplyMessage(post.id, currentLang)}
                                className={`px-2 py-1 rounded bg-white border cursor-pointer flex items-center space-x-1 ${
                                  loadingAiField[`${post.id}_suggest`] ? 'animate-pulse text-yellow-600' : 'hover:bg-slate-100 text-slate-650'
                                }`}
                              >
                                <span>💡 {currentLang === 'kn' ? 'ಉತ್ತರ ಸೂಚಿಸಿ' : 'Suggest Reply'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Gemini reply prompt helper rendering */}
                          {aiSuggestions[post.id] && (
                            <div
                              onClick={() => {
                                setActivePostComments(prev => ({ ...prev, [post.id]: aiSuggestions[post.id] }));
                                triggerVisualToast('AI Expert reply pasted to comment input box! 💬');
                              }}
                              className="bg-yellow-50/70 border border-dashed border-yellow-200 p-2.5 rounded-2xl text-[10px] leading-relaxed font-bold text-yellow-900 cursor-copy animate-fadeIn hover:bg-yellow-100/50 transition-all space-y-1"
                            >
                              <span className="text-[8px] font-black uppercase text-yellow-800 flex items-center space-x-0.5">
                                💡 Click to insert this proposed expert response:
                              </span>
                              <p className="italic font-medium">"{aiSuggestions[post.id]}"</p>
                            </div>
                          )}

                          {/* Likes count indicator and Bookmark icons */}
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-y border-slate-50 py-2.5">
                            <div className="flex space-x-1.5 items-center">
                              <button
                                onClick={() => handleToggleLike(post.id)}
                                className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all text-xs font-black cursor-pointer ${
                                  isLiked 
                                    ? 'bg-emerald-600 text-white shadow-sm' 
                                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                }`}
                              >
                                <span>👍 {isLiked ? 'Liked' : 'Like'}</span>
                                <span className="font-mono">{post.likes}</span>
                              </button>

                              <span className="text-slate-300">|</span>
                              
                              <p className="text-slate-500 font-semibold select-none">
                                {t.community.comments} ({post.comments.length})
                              </p>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              {/* Content safety Report button */}
                              <button
                                onClick={() => handleReportContent(post.id, 'post', post.author, post.content)}
                                className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                                title="Report Spam or Abuse"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-red-650" />
                              </button>

                              {/* Bookmark button */}
                              <button
                                onClick={() => handleToggleSavePost(post.id)}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  isSaved 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                                }`}
                                title="Bookmark this post"
                              >
                                <Bookmark className="w-4 h-4 fill-current" />
                              </button>

                              {/* Share post as copyable simulated modal */}
                              <button
                                onClick={() => {
                                  const textToShare = `*AgriVerse AI community update by ${post.author}*\n\n"${post.content}"\n\n_Connected with district-level community farmers on AgriVerse AI_`;
                                  navigator.clipboard.writeText(textToShare);
                                  triggerVisualToast('Simulated WhatsApp forward: Share link copied to clipboard! 🌾🔗');
                                }}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 cursor-pointer"
                                title="Share to WhatsApp"
                              >
                                <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                              </button>
                            </div>
                          </div>

                          {/* Comments feed listing */}
                          {post.comments.length > 0 && (
                            <div className="space-y-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                              {post.comments.map((comm) => (
                                <div key={comm.id} className="text-xs pb-1 border-b border-slate-100/40 last:border-0 last:pb-0">
                                  <div className="flex justify-between items-center mb-0.5">
                                    <p className="font-extrabold text-slate-700 leading-none">{comm.author}</p>
                                    <span className="text-[8px] text-slate-400 font-bold">{comm.time || 'now'}</span>
                                  </div>
                                  <p className="text-slate-600 font-semibold leading-relaxed">{comm.content}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Comment Input block with touch targets */}
                          <div className="flex items-center space-x-2 pt-1">
                            <input
                              type="text"
                              placeholder={t.community.addCommentPlaceholder}
                              value={activePostComments[post.id] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setActivePostComments(prev => ({ ...prev, [post.id]: val }));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreateComment(post.id);
                              }}
                              className="flex-1 bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 text-xs py-2.5 px-3.5 rounded-2xl outline-none placeholder:text-slate-300 font-bold transition-all text-slate-800"
                            />
                            <button
                              onClick={() => handleCreateComment(post.id)}
                              className="p-3 bg-emerald-100 select-none hover:bg-emerald-200 text-emerald-800 rounded-2xl transition-all cursor-pointer shadow-sm shrink-0"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>

                        </div>
                      );
                    })}
                </div>
                </>
                )}

              </div>
            )}

            {/* VIEW 3: CROP MARKETPLACE */}
            {activeTab === 'marketplace' && (
              <div id="v_marketplace_bazaar" className="p-4 space-y-4 animate-fadeIn">
                
                {/* Visual Tab Header */}
                <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-50 shadow-sm">
                  <div>
                    <h3 className="text-base font-black text-slate-800 tracking-tight">🌾 {t.marketplace.title}</h3>
                    <p className="text-[11px] text-slate-400 font-bold leading-none">AgriVerse crop market operating system</p>
                  </div>

                  <button
                    onClick={() => {
                      setMarketplaceSubTab('bazaar');
                      setShowSellForm(!showSellForm);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] py-2 px-3 rounded-xl shadow-md flex items-center space-x-1 transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post Harvest</span>
                  </button>
                </div>

                {/* Sub Tab selection between Bazaar listings vs My Private inbox vs Trust & Price AI */}
                <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
                  <button
                    onClick={() => setMarketplaceSubTab('bazaar')}
                    className={`flex-1 py-1 px-1 rounded-xl font-bold text-[10.5px] transition-all flex flex-col items-center justify-center ${
                      marketplaceSubTab === 'bazaar'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-850'
                    }`}
                  >
                    <span>🔍</span>
                    <span>Browse Bazaar</span>
                  </button>
                  <button
                    onClick={() => setMarketplaceSubTab('my_panel')}
                    className={`flex-1 py-1 px-1 rounded-xl font-bold text-[10.5px] transition-all flex flex-col items-center justify-center relative ${
                      marketplaceSubTab === 'my_panel'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-850'
                    }`}
                  >
                    <span>💼</span>
                    <span>My Inbox</span>
                    {(buyerInquiries.filter(inq => inq.farmerUid === firebaseAuthUid && inq.status === 'pending').length > 0) && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </button>
                  <button
                    onClick={() => setMarketplaceSubTab('trust_intelligence')}
                    className={`flex-1 py-1 px-1 rounded-xl font-bold text-[10.5px] transition-all flex flex-col items-center justify-center ${
                      marketplaceSubTab === 'trust_intelligence'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-850'
                    }`}
                  >
                    <span>🛡️</span>
                    <span>Trust & Price AI</span>
                  </button>
                </div>

                {/* VIEW 3A: BROWSE BAZAAR CROPS */}
                {marketplaceSubTab === 'bazaar' && (
                  <>
                    {/* Sell registration toggle dialogue block */}
                    {showSellForm && (
                      <form onSubmit={handleHostMarketSale} className="bg-white rounded-3xl border border-emerald-600 p-4 space-y-3.5 shadow-xl animate-fadeIn">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1 text-emerald-700">
                            <span>🌾</span>
                            <span>{t.marketplace.sellTitle}</span>
                          </h4>
                          <button type="button" onClick={() => setShowSellForm(false)}>
                            <X className="w-4.5 h-4.5 text-slate-400" />
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                              {t.marketplace.cropName} *
                            </label>
                            <input
                              type="text"
                              required
                              value={newCropName}
                              onChange={(e) => setNewCropName(e.target.value)}
                              placeholder="E.g., Tomato (Organic F1 Hybrid), Basmati rice..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                Crop Category *
                              </label>
                              <select
                                value={newCropCategory}
                                onChange={(e) => setNewCropCategory(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                              >
                                <option value="cereals">🌾 Cereals & Grains</option>
                                <option value="vegetables">🍅 Vegetables</option>
                                <option value="fruits">🥭 Fruits</option>
                                <option value="pulses">🌱 Pulses & Beans</option>
                                <option value="oilseeds">🌻 Oilseeds</option>
                                <option value="spices">🌶️ Spices</option>
                                <option value="other">🍃 Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                Price (₹ per unit) *
                              </label>
                              <input
                                type="text"
                                required
                                value={newCropPrice}
                                onChange={(e) => setNewCropPrice(e.target.value.replace(/\D/g, ''))}
                                placeholder="E.g., 1500"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                Quantity Available *
                              </label>
                              <input
                                type="text"
                                required
                                value={newCropQty}
                                onChange={(e) => setNewCropQty(e.target.value)}
                                placeholder="E.g., 50"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                Unit *
                              </label>
                              <select
                                value={newCropUnitType}
                                onChange={(e) => setNewCropUnitType(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white"
                              >
                                <option value="Kg">Kg</option>
                                <option value="Quintals">Quintals</option>
                                <option value="Tonnes">Tonnes</option>
                                <option value="Bags">Bags</option>
                                <option value="Crates">Crates</option>
                                <option value="Liters">Liters</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                District *
                              </label>
                              <input
                                type="text"
                                required
                                value={newCropDistrict}
                                onChange={(e) => setNewCropDistrict(e.target.value)}
                                placeholder="E.g., Chikkaballapura"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                Village
                              </label>
                              <input
                                type="text"
                                value={newCropVillage}
                                onChange={(e) => setNewCropVillage(e.target.value)}
                                placeholder="E.g., Anemadagu"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 items-center">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                Crop Harvest Date
                              </label>
                              <input
                                type="date"
                                value={newCropHarvestDate}
                                onChange={(e) => setNewCropHarvestDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-xs font-semibold outline-none focus:bg-white"
                              />
                            </div>
                            <div className="flex items-center space-x-1.5 pt-4">
                              <input
                                type="checkbox"
                                id="organic_form_click"
                                checked={newCropOrganic}
                                onChange={(e) => setNewCropOrganic(e.target.checked)}
                                className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 rounded"
                              />
                              <label htmlFor="organic_form_click" className="text-xs font-bold text-slate-600 select-none">
                                 🌱 100% Organic
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                              Harvest Description
                            </label>
                            <textarea
                              value={newCropDescription}
                              onChange={(e) => setNewCropDescription(e.target.value)}
                              placeholder="Describe crop quality, certifications, color quality..."
                              rows={2}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white resize-none"
                            />
                          </div>

                          {/* Multiple Previews Gallery with delete buttons */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                              Crop Sample Photos *
                            </label>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              <button
                                type="button"
                                disabled={isUploadingMultipleImages}
                                onClick={() => hiddenProductImageInputRef.current?.click()}
                                className="w-14 h-14 border-2 border-dashed border-emerald-300 rounded-xl flex flex-col items-center justify-center text-[10px] font-black text-emerald-700 hover:bg-emerald-50 shrink-0"
                              >
                                <Plus className="w-4 h-4 text-emerald-600 mb-0.5" />
                                <span>Add</span>
                              </button>

                              {newCropMultipleImages.map((b64, index) => (
                                <div key={index} className="relative w-14 h-14 rounded-xl border border-slate-100 overflow-hidden shrink-0 group">
                                  <img src={b64} alt="Pre" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setNewCropMultipleImages(prev => prev.filter((_, i) => i !== index))}
                                    className="absolute -top-0.5 -right-0.5 p-1 bg-red-650 hover:bg-red-700 text-white rounded-full transition-all flex items-center justify-center"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              ref={hiddenProductImageInputRef}
                              className="hidden"
                              onChange={handleMultipleImageConversion}
                            />
                            {isUploadingMultipleImages && (
                              <p className="text-[10px] text-emerald-600 animate-pulse font-bold mt-1">Uploading and compressing to Firebase Storage...</p>
                            )}
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-emerald-200 transition-all"
                        >
                          List Crop to Global Mandi Bazaar ✓
                        </button>
                      </form>
                    )}

                    {/* Search & Custom Filter system */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-3 space-y-3.5 shadow-md">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search products, districts, or villages..."
                          className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl py-2.5 pl-3.5 pr-10 text-xs font-semibold outline-none transition-all placeholder:text-slate-450"
                        />
                        {searchQuery && (
                          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3.5 text-slate-400">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* District Selection dropdown */}
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Filter District</label>
                          <select
                            value={selectedBazaarDistrict}
                            onChange={(e) => setSelectedBazaarDistrict(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[11px] font-bold outline-none mt-0.5"
                          >
                            <option value="all">📍 All Districts</option>
                            {Array.from(new Set(products.map(p => (p as any).district || 'Chikkaballapura'))).map(dist => (
                              <option key={dist} value={dist}>{dist}</option>
                            ))}
                          </select>
                        </div>

                        {/* Bio Organic Select */}
                        <div className="flex items-center space-x-1.5 pt-3">
                          <input
                            type="checkbox"
                            id="organic_bazaar_check"
                            checked={onlyOrganicFilter}
                            onChange={(e) => setOnlyOrganicFilter(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 border-slate-305 focus:ring-emerald-500 rounded"
                          />
                          <label htmlFor="organic_bazaar_check" className="text-[10px] font-extrabold text-slate-500 select-none">
                            🌱 Bio-Organic Only
                          </label>
                        </div>
                      </div>

                      {/* Horizontal sliding categories filter list */}
                      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
                        {[
                          { key: 'all', label: 'All Crops' },
                          { key: 'cereals', label: '🌾 Cereals' },
                          { key: 'vegetables', label: '🍅 Vegetables' },
                          { key: 'fruits', label: '🥭 Fruits' },
                          { key: 'pulses', label: '🌱 Pulses' },
                          { key: 'oilseeds', label: '🌻 Oilseeds' },
                          { key: 'spices', label: '🌶️ Spices' },
                        ].map(cat => (
                          <button
                            key={cat.key}
                            onClick={() => setSelectedBazaarCategory(cat.key)}
                            className={`text-[10px] font-black px-3 py-1.5 rounded-full whitespace-nowrap transition-all border shrink-0 ${
                              selectedBazaarCategory === cat.key
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* LIVE BAZAAR PRODUCTS GRID */}
                    <div className="grid grid-cols-1 gap-4">
                      {products
                        .filter(item => {
                          const matchSearch = searchQuery === '' || 
                            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item as any).location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item as any).district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item as any).village?.toLowerCase().includes(searchQuery.toLowerCase());

                          const matchCategory = selectedBazaarCategory === 'all' || 
                            (item as any).category === selectedBazaarCategory;

                          const matchDistrict = selectedBazaarDistrict === 'all' || 
                            ((item as any).district || 'Chikkaballapura').toLowerCase() === selectedBazaarDistrict.toLowerCase();

                          const matchOrganic = !onlyOrganicFilter || (item as any).organic === true || (item as any).isVerified === true;
                          const matchAvailable = (item as any).status !== 'sold';

                          return matchSearch && matchCategory && matchDistrict && matchOrganic && matchAvailable;
                        })
                        .map((item) => (
                          <div key={item.id} className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/30 overflow-hidden flex flex-col">
                            
                            {/* Card Media Header */}
                            <div className="relative h-44 bg-slate-100">
                              {/* If item has multiple images, render a nice cover with indicator */}
                              {((item as any).images && (item as any).images.length > 1) ? (
                                <div className="absolute bottom-2.5 left-2.5 bg-black/60 text-white text-[8px] font-black tracking-widest px-2 py-0.5 rounded uppercase">
                                  📸 1 of {(item as any).images.length} Photos
                                </div>
                              ) : null}
                              <img referrerPolicy="no-referrer" src={item.image} alt={item.title} className="w-full h-full object-cover" />
                              
                              <span className="absolute top-3 right-3 bg-black/60 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                {item.quantity}
                              </span>

                              {((item as any).organic || item.isVerified) && (
                                <span className="absolute top-3 left-3 bg-emerald-600 text-white font-extrabold text-[10px] px-3 py-1 rounded-full flex items-center shadow-md">
                                  🌱 Organic Certified
                                </span>
                              )}
                            </div>

                            {/* Card Metadata */}
                            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    📍 {(item as any).district || item.location}
                                  </span>
                                  {item.createdAt && (
                                    <span className="text-[8px] bg-slate-100 text-slate-500 font-extrabold px-1.5 rounded">
                                      Harvested
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-black text-slate-800 tracking-tight mt-0.5">
                                  {item.title}
                                </h4>
                                {((item as any).description) && (
                                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight mt-1">{(item as any).description}</p>
                                )}

                                {/* Seller trust certification & score badges */}
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  <span className="inline-flex items-center space-x-1 text-[9px] bg-emerald-50 text-emerald-850 font-extrabold px-1.5 py-0.5 rounded-lg border border-emerald-105">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    <span>{item.seller ? (item.seller.length > 12 ? item.seller.slice(0, 10)+'...' : item.seller) : 'Verified Farmer'}</span>
                                  </span>
                                  <span className="inline-flex items-center space-x-0.5 text-[9px] bg-amber-50 text-amber-800 font-extrabold px-1.5 py-0.5 rounded-lg border border-amber-105">
                                    <span>⭐ 4.8</span>
                                  </span>
                                  <span className="inline-flex items-center text-[9px] bg-indigo-50 text-indigo-850 font-extrabold px-1.5 py-0.5 rounded-lg border border-indigo-105 font-mono">
                                    <span>T-Score: 98%</span>
                                  </span>
                                </div>

                                {/* Dynamic AI Price Audit Evaluation */}
                                <div className="mt-2.5 p-2 bg-slate-50 border border-slate-150 rounded-2xl text-[9.5px] leading-tight space-y-0.5">
                                  <div className="flex items-center justify-between font-black text-emerald-800">
                                    <span className="flex items-center space-x-1">
                                      <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                                      <span>AI Price Audit: Fair</span>
                                    </span>
                                    <span>Audit Score: 95%</span>
                                  </div>
                                  <p className="text-[9.5px] text-slate-450 font-semibold font-mono">Mandi Comp: matches average of ₹22/Kg perfectly.</p>
                                </div>
                              </div>

                              <div className="pt-2">
                                <div className="flex justify-between items-baseline py-1.5 border-y border-slate-100">
                                  <span className="text-[11px] text-slate-400 font-bold">Expected Price</span>
                                  <span className="text-base font-black text-emerald-850 font-mono">
                                    {item.price}
                                  </span>
                                </div>

                                {/* Interaction buttons with Inquiry overlay trigger */}
                                <div className="flex gap-2 mt-3">
                                  <a
                                    href={`tel:${item.phone}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      triggerVisualToast(`Direct cellular connection bypass triggered for ${item.seller}...`);
                                    }}
                                    className="flex-1 py-2.5 bg-slate-50 border border-slate-205 text-slate-700 text-[11px] font-black rounded-xl flex items-center justify-center space-x-1.5 transition-all active:scale-95 text-center"
                                  >
                                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                                    <span>{t.marketplace.buyNow}</span>
                                  </a>

                                  {item.farmerUid !== firebaseAuthUid ? (
                                    <button
                                      onClick={() => {
                                        setSelectedProductForInquiry(item);
                                        setInquiryName(isJoined ? t.profile.farmerName : 'Buyer Partner');
                                        setInquiryContact(userPhone || '');
                                        setInquiryMessage(`Hello, I am interested in purchasing your listed harvest: ${item.title}. Can we coordinate transportation?`);
                                        setInquiryQuantity(item.quantity?.split(' ')[0] || '10');
                                      }}
                                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-xl text-center active:scale-95 transition-all shadow-md flex items-center justify-center space-x-1"
                                    >
                                      <span>🤝 Book Reservation</span>
                                    </button>
                                  ) : (
                                    <button
                                      disabled
                                      className="flex-1 py-2.5 bg-slate-100 text-slate-400 text-[11px] font-black rounded-xl text-center cursor-not-allowed"
                                    >
                                      Your Posting
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}

                {/* VIEW 3B: MY PRIVATE INLINE NEGOTIATIONS INBOX */}
                {marketplaceSubTab === 'my_panel' && (
                  <div className="space-y-4">
                    
                    {/* FARMER'S OWN UPLOADED POSTINGS */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm space-y-3">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1">
                        <span>🌾</span>
                        <span>My Listed Harvest Crops</span>
                      </h4>
                      
                      {products.filter(p => (p as any).farmerUid === firebaseAuthUid).length === 0 ? (
                        <p className="text-[11px] text-slate-400 font-bold italic py-2">You have not posted any harvest listings. Click 'Post Harvest' to sell crops.</p>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {products
                            .filter(p => (p as any).farmerUid === firebaseAuthUid)
                            .map(p => (
                              <div key={p.id} className="py-2.5 flex justify-between items-center text-xs">
                                <div>
                                  <p className="font-extrabold text-slate-700">{p.title}</p>
                                  <p className="text-[10px] text-slate-400">{p.quantity} • {p.price} • Status: <span className="font-bold text-emerald-600">{(p as any).status || 'available'}</span></p>
                                </div>
                                <button
                                  onClick={() => handleDeleteListing(p.id)}
                                  className="text-[10px] font-black text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1.5 rounded-lg"
                                >
                                  Delete
                                </button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* INCOMING BUYER BOOKINGS & OFFER COUNTERS */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1">
                          <span>📥</span>
                          <span>Incoming Buyer Offers</span>
                        </h4>
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                          {buyerInquiries.filter(i => i.farmerUid === firebaseAuthUid && i.status === 'pending').length} Action Required
                        </span>
                      </div>

                      {buyerInquiries.filter(i => i.farmerUid === firebaseAuthUid).length === 0 ? (
                        <p className="text-[11px] text-slate-400 font-bold italic py-2">No buyers have submitted inquiries or reservations for your postings yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {buyerInquiries
                            .filter(i => i.farmerUid === firebaseAuthUid)
                            .map(inq => (
                              <div key={inq.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-2 text-[11px]">
                                <div className="flex justify-between items-center">
                                  <p className="font-black text-slate-800">For: <span className="text-emerald-700">{inq.productTitle}</span></p>
                                  <span className={`px-2 py-0.5 text-[8px] font-black rounded-full uppercase ${
                                    inq.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                                    inq.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {inq.status}
                                  </span>
                                </div>

                                <div className="bg-white p-2.5 rounded-xl border border-slate-150 space-y-1">
                                  <p className="text-slate-650 leading-relaxed font-semibold">"{inq.message}"</p>
                                  <p className="text-[10px] text-slate-400 font-mono">Proposed Reservation: <span className="font-bold text-slate-600">{inq.quantity} unit(s)</span></p>
                                </div>

                                <div className="text-[10px] text-slate-500">
                                  Buyer: <span className="font-bold">{inq.buyerName}</span> ({inq.contact})
                                </div>

                                {inq.status === 'pending' && (
                                  <div className="flex gap-2 pt-1">
                                    <button
                                      onClick={() => handleRejectInquiry(inq)}
                                      className="flex-1 py-2 bg-slate-205 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-center"
                                    >
                                      Decline Offer
                                    </button>
                                    <button
                                      onClick={() => handleAcceptInquiry(inq)}
                                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-center"
                                    >
                                      Accept & Book Order ✓
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* OUTGOING BOOKING INTERESTS */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm space-y-3">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1">
                        <span>📤</span>
                        <span>My Outgoing Reservations</span>
                      </h4>

                      {buyerInquiries.filter(i => i.buyerUid === firebaseAuthUid).length === 0 ? (
                        <p className="text-[11px] text-slate-400 font-bold italic py-2">You have not submitted booking offers to other farmers yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {buyerInquiries
                            .filter(i => i.buyerUid === firebaseAuthUid)
                            .map(inq => (
                              <div key={inq.id} className="py-2.5 border-b border-slate-50 last:border-b-0 flex justify-between items-center text-xs">
                                <div>
                                  <p className="font-extrabold text-slate-705">Booking: {inq.productTitle}</p>
                                  <p className="text-[10px] text-slate-404">Quantity Requested: {inq.quantity} unit(s)</p>
                                </div>
                                <span className={`px-2 py-0.5 text-[8px] font-black rounded-full uppercase ${
                                  inq.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                                  inq.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-850'
                                }`}>
                                  {inq.status}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* CONTRACT BOOKING ORDER REGISTRY */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm space-y-2">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1">
                        <span>📦</span>
                        <span>Active Marketplace Orders</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">Order reservations resulting from verified farmer-to-buyer transactions</p>

                      {marketplaceOrders.filter(o => o.farmerUid === firebaseAuthUid || o.buyerUid === firebaseAuthUid).length === 0 ? (
                        <p className="text-[11px] text-slate-400 font-bold italic py-2.5">No active crop contracts recorded onto your node ledger.</p>
                      ) : (
                        <div className="space-y-2.5 pt-2">
                          {marketplaceOrders
                            .filter(o => o.farmerUid === firebaseAuthUid || o.buyerUid === firebaseAuthUid)
                            .map(order => (
                              <div key={order.id} className="bg-slate-50/70 border border-slate-100 p-3 rounded-2xl text-[11px] space-y-1">
                                <div className="flex justify-between items-center font-extrabold text-slate-755">
                                  <span>🧾 Order #{order.id.slice(-6).toUpperCase()}</span>
                                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[8px] uppercase tracking-wide">SECURED</span>
                                </div>
                                <p className="font-semibold text-slate-600">Product: <span className="font-black text-slate-800">{order.productTitle}</span></p>
                                <p className="text-slate-500 font-medium">Quantity: {order.quantity} • Terms: {order.price}</p>
                                <p className="text-[9px] text-slate-400 font-mono uppercase">Buyer: {order.buyerName}</p>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* VIEW 3C: TRUST & PRICE INTELLIGENCE HUB */}
                {marketplaceSubTab === 'trust_intelligence' && (
                  <div className="space-y-4">
                    <TrustAndIntelligenceHub
                      userUid={firebaseAuthUid}
                      userName={isJoined ? t.profile.farmerName : 'Farmer Partner'}
                      userPhone={userPhone || ''}
                      coopTag={isJoined ? 'Chikkaballapura Potato Union' : 'Local District Independent Unit'}
                      onToast={triggerVisualToast}
                      products={products}
                      orders={marketplaceOrders}
                    />
                  </div>
                )}

                {/* THE POPUP INTERACTIVE RESERVATION SHEET */}
                {selectedProductForInquiry && (
                  <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-t-3xl max-w-md w-full p-5 space-y-4 shadow-2xl relative animate-slideUp">
                      <button 
                        onClick={() => setSelectedProductForInquiry(null)}
                        className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Crop Inquiry Booking
                        </span>
                        <h4 className="text-base font-black text-slate-800 mt-1">Inquire: {selectedProductForInquiry.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Seller: <span className="font-bold text-slate-600">{selectedProductForInquiry.seller}</span></p>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Your Name</label>
                            <input
                              type="text"
                              value={inquiryName}
                              onChange={(e) => setInquiryName(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Contact Phone *</label>
                            <input
                              type="text"
                              value={inquiryContact}
                              onChange={(e) => setInquiryContact(e.target.value)}
                              placeholder="+91 XXXXX XXXXX"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase">Proposed Booking Quantity ({selectedProductForInquiry.quantity?.split(' ').slice(1).join(' ') || 'Kg'})</label>
                          <input
                            type="text"
                            value={inquiryQuantity}
                            onChange={(e) => setInquiryQuantity(e.target.value)}
                            placeholder="E.g., 20"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono font-black">Counter Offer / Message details</label>
                          <textarea
                            value={inquiryMessage}
                            onChange={(e) => setInquiryMessage(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedProductForInquiry(null)}
                          className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSendInquiryOffer}
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-100"
                        >
                          Submit Reservation 🤝
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 4: AI ASSISTANT (CROP CLINIC & BOT) */}
            {activeTab === 'assistant' && (
              <div id="v_ai_chatbot" className={`flex-1 flex flex-col bg-slate-50 select-none pb-4 ${assistantMode === 'chat' ? 'overflow-hidden' : ''}`}>
                
                {/* Header overview area for AI Doctor vs Chat */}
                <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-4 shrink-0">
                  <h3 className="text-base font-black tracking-tight">{t.assistant.title}</h3>
                  <p className="text-[11px] font-semibold text-emerald-200 mt-0.5 leading-tight">
                    {t.assistant.cropDoctorDesc}
                  </p>
                </div>

                {/* Sub-mode selector tabs */}
                <div className="bg-white shrink-0 p-2.5 border-b border-slate-100 flex space-x-2">
                  <button
                    onClick={() => setAssistantMode('doctor')}
                    className={`flex-1 py-2.5 rounded-2xl text-[11px] font-black tracking-tight transition-all flex items-center justify-center space-x-1 border cursor-pointer ${
                      assistantMode === 'doctor'
                        ? 'bg-emerald-50 text-emerald-905 border-emerald-200 shadow-xs'
                        : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    <span>🔬</span>
                    <span>{t.home.cropDoctor} (Disease Detection)</span>
                  </button>
                  <button
                    onClick={() => {
                      setAssistantMode('chat');
                    }}
                    className={`flex-1 py-2.5 rounded-2xl text-[11px] font-black tracking-tight transition-all flex items-center justify-center space-x-1 border cursor-pointer ${
                      assistantMode === 'chat'
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-200 shadow-xs'
                        : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    <span>💬</span>
                    <span>AI Farming Advisor</span>
                  </button>
                </div>

                {assistantMode === 'doctor' ? (
                  /* Leaf Scan Crop Doctor view wrapper */
                  <div className="p-4 space-y-4">
                    <div className="bg-emerald-50/50 rounded-3xl p-4 border border-emerald-100/35 flex flex-col space-y-3 font-sans">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-black text-emerald-900 uppercase">
                          🔬 {t.assistant.cropDoctorTitle} (Leaf Disease Scanner)
                        </p>
                        <span className="text-[10px] text-emerald-600 font-bold bg-white px-2 py-0.5 rounded-full border border-emerald-100">
                          Real Gemini Scan
                        </span>
                      </div>

                      <div className="flex space-x-1.5 overflow-x-auto select-none py-1">
                        <button
                          onClick={() => handleDiseaseExamplePick('healthy')}
                          className="bg-white hover:bg-slate-55 border px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-705 shrink-0 flex items-center space-x-1 cursor-pointer"
                        >
                          <span className="block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          <span>Healthy Tomato</span>
                        </button>
                        <button
                          onClick={() => handleDiseaseExamplePick('blight')}
                          className="bg-white hover:bg-slate-55 border px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-705 shrink-0 flex items-center space-x-1 cursor-pointer"
                        >
                          <span className="block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                          <span>Blight Leaf Spot</span>
                        </button>
                        <button
                          onClick={() => handleDiseaseExamplePick('rust')}
                          className="bg-white hover:bg-slate-55 border px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-705 shrink-0 flex items-center space-x-1 cursor-pointer"
                        >
                          <span className="block w-2.5 h-2.5 rounded-full bg-orange-600"></span>
                          <span>Crop Blast Rust</span>
                        </button>
                      </div>

                      {/* Preview selected image BEFORE scanning begins, with nice scanning laser sweep overlay if diagnosing */}
                      {selectedLeafImage && (
                        <div className="relative w-full h-[170px] rounded-2xl overflow-hidden bg-slate-100 border border-emerald-100 flex items-center justify-center">
                          <img src={selectedLeafImage} alt="Leaf Preview" className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
                          
                          {/* Glowing laser scanning line sweep */}
                          {isDiagnosing && (
                            <div className="absolute inset-0 bg-emerald-900/10 cursor-wait flex flex-col justify-between">
                              <div className="w-full h-1 bg-emerald-400 animate-bounce shadow-[0_0_12px_#34d399] duration-1000"></div>
                              <div className="absolute inset-0 flex items-center justify-center bg-black/45 flex flex-col">
                                <div className="text-center font-extrabold text-[10px] text-emerald-300 tracking-wider uppercase flex items-center space-x-1 bg-neutral-900/80 px-3 py-1.5 rounded-full">
                                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                  <span>Gemini Spore Analysis...</span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {!isDiagnosing && (
                            <button 
                              onClick={() => { setSelectedLeafImage(null); setDiagnosisReport(null); }} 
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black/90 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Manual file dialog or drag uploader */}
                      {!selectedLeafImage && (
                        <div 
                          className="bg-white border-2 border-dashed border-emerald-200 hover:border-emerald-600 rounded-3xl p-4 text-center cursor-pointer transition-all" 
                          onClick={() => hiddenFileInputRef.current?.click()}
                        >
                          <Camera className="w-7 h-7 mx-auto text-emerald-600 mb-1" />
                          <p className="text-xs font-black text-slate-700">{t.assistant.uploadLeaf}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Take leaf photo or upload here for immediate analysis</p>
                          <input
                            type="file"
                            accept="image/*"
                            ref={hiddenFileInputRef}
                            className="hidden"
                            onChange={handleLeafImageUploadChange}
                          />
                        </div>
                      )}

                      {/* Disease scan results card indicator */}
                      {diagnosisReport && !isDiagnosing && (
                        <div id="ai_diagnosis_result_box" className="bg-white rounded-3xl border border-emerald-200 p-4 shadow-md animate-fadeIn text-left">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                            <h4 className="font-extrabold text-emerald-950 text-xs uppercase tracking-wider flex items-center">
                              <Sparkles className="w-4 h-4 text-emerald-600 mr-1.5" />
                              <span>{t.assistant.diagnosisResult}</span>
                            </h4>
                            <div className="flex items-center space-x-1">
                              <button 
                                onClick={() => speakVoiceOutput(`${diagnosisReport.diseaseName}. ${diagnosisReport.treatmentSuggestions || diagnosisReport.organicControl || ''}`)}
                                className="p-1 rounded-full text-emerald-700 hover:bg-emerald-55 cursor-pointer"
                                title="Listen voice advice"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => setDiagnosisReport(null)} className="text-slate-400 p-1">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3 text-xs leading-relaxed">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Suspected Infection</span>
                              <p className="font-black text-emerald-950 text-sm leading-tight">{diagnosisReport.diseaseName}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl">
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Severity Profile</span>
                                <span className={`font-black text-[10px] tracking-wide uppercase px-1.5 py-0.5 rounded ${
                                  diagnosisReport.severity === 'HIGH' ? 'bg-rose-100 text-rose-800' : diagnosisReport.severity === 'LOW' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-850'
                                }`}>
                                  {diagnosisReport.severity || 'MEDIUM'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Spore Confidence</span>
                                <span className="font-extrabold text-emerald-700 font-mono text-[10px]">{diagnosisReport.confidence || '90%'} Verified</span>
                              </div>
                            </div>

                            {diagnosisReport.symptoms && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Observed Symptoms</span>
                                <p className="text-slate-600 font-semibold mt-0.5">{diagnosisReport.symptoms}</p>
                              </div>
                            )}

                            {diagnosisReport.treatmentSuggestions && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Treatment Advice</span>
                                <p className="text-slate-700 font-semibold mt-0.5">{diagnosisReport.treatmentSuggestions}</p>
                              </div>
                            )}

                            {diagnosisReport.organicControl && (
                              <div>
                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block">🍀 Organic/Bio remedies</span>
                                <p className="text-emerald-900 font-semibold mt-0.5 bg-emerald-50/50 p-2 rounded-xl border border-emerald-55">
                                  {diagnosisReport.organicControl}
                                </p>
                              </div>
                            )}

                            {diagnosisReport.chemicalControl && (
                              <div>
                                <span className="text-[10px] font-bold text-indigo-750 uppercase tracking-wide block">🧪 Chemical Action Sputums</span>
                                <p className="text-indigo-900 font-semibold mt-0.5 bg-indigo-50/50 p-2 rounded-xl border border-indigo-55">
                                  {diagnosisReport.chemicalControl}
                                </p>
                              </div>
                            )}

                            {diagnosisReport.preventionTips && (
                              <div>
                                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide block">🛡️ Long-term Prevention</span>
                                <p className="text-amber-900 font-semibold mt-0.5 bg-amber-50/30 p-2 rounded-xl border border-amber-100">
                                  {diagnosisReport.preventionTips}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Collapsible History: My Crop Health Reports */}
                    <div id="crop_doctor_reports_history" className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide flex items-center space-x-1.5">
                          <span>📁</span>
                          <span>My Crop Health Reports ({scanHistory.length})</span>
                        </h4>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Farm Ledger</span>
                      </div>

                      {scanHistory.length === 0 ? (
                        <div className="py-2 text-center text-slate-400 space-y-1">
                          <p className="text-xs font-semibold">No crop reports scanned yet.</p>
                          <p className="text-[10px] leading-snug">Take your first leaf scan above to persist records securely in report ledger!</p>
                        </div>
                      ) : (
                        <div className="space-y-2 pr-1">
                          {scanHistory.map((rep) => (
                            <div 
                              key={rep.id} 
                              className="flex items-center justify-between p-2.5 hover:bg-slate-50 border border-slate-50 hover:border-slate-100 rounded-2xl transition-all cursor-pointer"
                              onClick={() => {
                                setDiagnosisReport(rep);
                                if (rep.imageUrl) {
                                  setSelectedLeafImage(rep.imageUrl);
                                } else {
                                  setSelectedLeafImage('https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400');
                                }
                              }}
                            >
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-100">
                                  <img 
                                    src={rep.imageUrl && rep.imageUrl.startsWith('data:') ? rep.imageUrl : 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=100'} 
                                    alt="Scan" 
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                  <p className="text-xs font-black text-emerald-950 truncate leading-snug">{rep.diseaseName}</p>
                                  <div className="flex items-center space-x-1.5 mt-0.5">
                                    <span className={`text-[8px] font-bold px-1 rounded uppercase ${
                                      rep.severity === 'HIGH' ? 'bg-rose-100 text-rose-800' : rep.severity === 'LOW' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>{rep.severity || 'MEDIUM'}</span>
                                    <span className="text-[9px] text-slate-400 font-mono text-[9px]">{new Date(rep.timestamp).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteScanHistoryItem(rep.id); }}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* AI Chat companion section list */
                  <div className="flex-1 flex flex-col min-h-0 select-text overflow-hidden">
                    
                    {/* Advisor chatbot conversation logs */}
                    <div id="advisor_chat_bubbles" className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                      {chatHistory.map((ch, idx) => (
                        <div key={idx} className={`flex ${ch.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                          <div className={`max-w-[85%] rounded-[24px] px-4 py-3 shadow-sm ${
                            ch.sender === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white border rounded-bl-none text-slate-700'
                          }`}>
                            <p className="text-xs font-semibold leading-relaxed break-words">{ch.text}</p>
                            <div className="mt-1.5 flex items-center justify-between">
                              <span className="text-[8px] opacity-60 font-mono tracking-tight">{ch.time}</span>
                              {ch.sender === 'ai' && (
                                <button
                                  onClick={() => speakVoiceOutput(ch.text)}
                                  className="ml-2 text-emerald-700 hover:text-emerald-950 p-0.5 rounded-full cursor-pointer"
                                  title="Listen voice advice"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white border rounded-2xl rounded-bl-none px-4 py-3 shadow-xs max-w-[80%] flex space-x-1.5 items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce delay-100"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce delay-200"></div>
                          </div>
                        </div>
                      )}

                      <div ref={chatEndRef} />
                    </div>

                    {/* Big Voice selector and chat controls writing pane */}
                    <div className="shrink-0 px-4 pt-1 mb-2 bg-white border-t border-slate-100">
                      
                      {/* Voice speaking recorder button */}
                      <div className="flex flex-col items-center justify-center space-y-1.5 py-1.5 border-b border-dashed border-slate-100">
                        <button
                          onClick={startVoiceRecordingTrigger}
                          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer ${
                            isRecording ? 'bg-red-500 text-white animate-pulse shadow-red-20 ring-4 ring-red-20 ring-offset-2' : 'bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white shadow-emerald-105 hover:shadow-emerald-250'
                          }`}
                        >
                          {isRecording ? <MicOff className="w-5.5 h-5.5 animate-spin" /> : <Mic className="w-5.5 h-5.5" />}
                        </button>
                        <p className={`text-[9px] font-extrabold ${isRecording ? 'text-red-500' : 'text-slate-400'} uppercase tracking-wider`}>
                          {isRecording ? t.assistant.voiceRecording : t.assistant.speakInstruction}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 mt-2 pb-2">
                        <input
                          type="text"
                          id="cli_chat_input"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') triggerSendChatMessage(chatInput);
                          }}
                          placeholder={t.assistant.askPlaceholder}
                          className="flex-1 bg-slate-50 border border-slate-205 rounded-2xl py-2.5 px-3.5 text-xs font-semibold outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-505 shadow-3xs"
                        />
                        <button
                          onClick={() => triggerSendChatMessage(chatInput)}
                          className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-sm cursor-pointer select-none"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* VIEW 5: USER PROFILE */}
            {activeTab === 'profile' && (
              <div id="v_profile_management" className="p-4 space-y-4 animate-fadeIn">
                
                {/* Farmer identity details card */}
                <div id="user_profile_card" className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-14 h-14 bg-emerald-800 text-white font-black rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-emerald-100 relative">
                      {profileName ? profileName.slice(0, 2).toUpperCase() : (isJoined ? 'NS' : 'FP')}
                      <span className="absolute -bottom-1.5 -right-1.5 bg-yellow-400 text-yellow-950 p-0.5 rounded-full border-2 border-white shadow-xs">
                        <Award className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-extrabold text-slate-800 text-sm leading-tight">
                        {profileName || (isJoined ? t.profile.farmerName : 'Krishi Partner')}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold tracking-tight">
                        📍 {profileVillage && profileDistrict ? `${profileVillage}, ${profileDistrict} District` : (isJoined ? t.profile.farmLocation : 'Direct Mandi User')}
                      </p>
                      
                      <div className="mt-1.5 flex items-center space-x-1.5">
                        <span className="inline-block bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 rounded-full border border-emerald-100">
                          {profileCropFocus} Specialist
                        </span>
                        <span>•</span>
                        <button onClick={logoutSession} className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase tracking-wider">
                          Leave Session
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secure Admin Toggle Row */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-3.5 flex items-center justify-between shadow-xs">
                  <div className="flex items-center space-x-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">System Moderator Controls</h4>
                      <p className="text-[9px] text-slate-500 font-medium">Review member reports & moderate active posts</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsAdminMode(!isAdminMode);
                      triggerVisualToast(isAdminMode ? "Moderation dashboard deactivated" : "Admin Moderation panel is active! 👮");
                    }}
                    className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      isAdminMode 
                        ? 'bg-red-600 text-white border-red-500 hover:bg-red-700' 
                        : 'bg-white text-emerald-800 border-emerald-250 hover:bg-slate-50'
                    }`}
                  >
                    {isAdminMode ? 'Disable Admin' : 'Enable Admin'}
                  </button>
                </div>

                {/* Superuser Moderation Room */}
                {isAdminMode && (
                  <div className="bg-white rounded-3xl border border-red-150 p-4 space-y-4 animate-scaleUp shadow-md">
                    <div className="flex justify-between items-center border-b pb-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-sm">👮</span>
                        <h4 className="text-xs font-black text-slate-850 uppercase tracking-wide">
                          Farmer Report Center ({reports.length})
                        </h4>
                      </div>
                      <span className="text-[8px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-black uppercase">
                        Superuser Mode
                      </span>
                    </div>

                    {reports.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-bold py-4 text-center">
                        No outstanding member complaints reported. System status: SECURE. 🌈
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                        {reports.map((rep) => (
                          <div key={rep.id} className="bg-slate-50 border rounded-2xl p-3 space-y-2 text-[11px] font-medium text-slate-700">
                            <div className="flex justify-between items-start">
                              <span className="text-[8px] font-black bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded uppercase">
                                {rep.targetType} reported
                              </span>
                              <span className="text-[8px] font-mono text-slate-400">{rep.createdAt?.slice(11, 19)}</span>
                            </div>
                            <p className="font-semibold text-slate-800 leading-snug">
                              Reason: <span className="text-red-700 font-black">"{rep.reason}"</span>
                            </p>
                            <p className="text-[9px] text-slate-400">Reporter Uid: {rep.reporterUid?.slice(0, 8)}...</p>

                            <div className="flex space-x-1.5 pt-1.5 border-t border-slate-150">
                              <button
                                onClick={() => handleModerateItem(rep.targetId, rep.targetType, 'flag')}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[9px] uppercase tracking-wider py-2 rounded-lg transition-all cursor-pointer"
                              >
                                🚨 Quarantine Item
                              </button>
                              <button
                                onClick={() => handleModerateItem(rep.targetId, rep.targetType, 'unflag')}
                                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-[9px] uppercase tracking-wider py-2 rounded-lg transition-all cursor-pointer"
                              >
                                Dismiss Complaint
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Moderation Logs List */}
                    <div className="border-t pt-3 space-y-2">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        🛡️ Central Moderation Audit Logs ({moderationLogs.length})
                      </h5>
                      <div className="bg-slate-900 text-emerald-400 font-mono text-[9px] p-2.5 rounded-xl h-[110px] overflow-y-auto space-y-1.5 scrollbar-none shadow-inner">
                        {moderationLogs.length === 0 ? (
                          <div className="text-slate-500">_no audit logs generated yet_</div>
                        ) : (
                          moderationLogs.map((log) => (
                            <div key={log.id} className="leading-normal">
                              <span className="text-yellow-400 font-bold">[{log.createdAt?.slice(11, 19)}]</span> CLOUD_AUDIT: {log.details} by {log.moderatorId?.slice(0, 5)}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Real-time Central Farming Profile Editor Card */}
                <div id="profile_editor_panel" className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-4 space-y-3">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide flex items-center space-x-1 border-b border-slate-100 pb-2">
                    <User className="w-4.5 h-4.5 text-emerald-600" />
                    <span>Manage Farming Profile Directory</span>
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Full Farmer Name:</label>
                      <input 
                        type="text" 
                        value={profileName} 
                        onChange={(e) => {
                          setProfileName(e.target.value);
                          handleUpdateProfileData({ name: e.target.value });
                        }}
                        placeholder="Naveen S"
                        className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-205 bg-slate-50 text-slate-700 outline-none focus:bg-white focus:border-emerald-505"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">District Focus:</label>
                        <select 
                          value={profileDistrict} 
                          onChange={(e) => {
                            setProfileDistrict(e.target.value);
                            handleUpdateProfileData({ district: e.target.value });
                          }}
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none"
                        >
                          <option value="Chikkaballapura">Chikkaballapura</option>
                          <option value="Tumakuru">Tumakuru</option>
                          <option value="Kolar">Kolar</option>
                          <option value="Mandya">Mandya</option>
                          <option value="Davanagere">Davanagere</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Village Name:</label>
                        <input 
                          type="text" 
                          value={profileVillage} 
                          onChange={(e) => {
                            setProfileVillage(e.target.value);
                            handleUpdateProfileData({ village: e.target.value });
                          }}
                          placeholder="Anemadagu"
                          className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Primary Crop focus:</label>
                        <input 
                          type="text" 
                          value={profileCropFocus} 
                          onChange={(e) => {
                            setProfileCropFocus(e.target.value);
                            handleUpdateProfileData({ cropFocus: e.target.value });
                          }}
                          placeholder="Tomato"
                          className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Irrigation Mode:</label>
                        <select 
                          value={profileIrrigationType} 
                          onChange={(e) => {
                            setProfileIrrigationType(e.target.value);
                            handleUpdateProfileData({ irrigationType: e.target.value });
                          }}
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none"
                        >
                          <option value="Drip">Drip Irrigation</option>
                          <option value="Sprinkler">Sprinkler</option>
                          <option value="Flood">Flood irrigation</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        <span>Organic Farming Score:</span>
                        <span className="text-emerald-700 font-mono font-black">{profileOrganicScore}%</span>
                      </div>
                      <input 
                        type="range" min="10" max="100" 
                        value={profileOrganicScore}
                        onChange={(e) => {
                          setProfileOrganicScore(parseInt(e.target.value));
                          handleUpdateProfileData({ organicScore: parseInt(e.target.value) });
                        }}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Full Language settings grid list */}
                <div id="profile_language_panel" className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-4">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide mb-2.5 flex items-center space-x-1">
                    <Globe className="w-4.5 h-4.5 text-emerald-600" />
                    <span>{t.profile.languageSettings}</span>
                  </h4>

                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLang(lang.code);
                          triggerVisualToast(`Bilingual state switched to: ${lang.localName}`);
                        }}
                        className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                          currentLang === lang.code ? 'border-emerald-600 bg-emerald-500 text-white font-extrabold shadow-md' : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <p className="text-[11px] font-extrabold leading-tight block">{lang.localName}</p>
                        <span className={`text-[8px] block opacity-60 font-semibold ${currentLang === lang.code ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {lang.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subsidies Match scorecard checklist */}
                <div id="regional_schemes_scorecard" className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-4">
                  <div className="flex justify-between items-center mb-2.5">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                      {t.profile.eligibilityTitle}
                    </h4>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 rounded-full uppercase">
                      Matched Subsidies
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium leading-normal mb-3">
                    {t.profile.eligibilityDesc}
                  </p>

                  <div className="space-y-3">
                    {schemes.map((sch) => {
                      const isExpanded = expandedSchemeId === sch.id;
                      const userAnswers = eligibleResponses[sch.id] || { landOk: true, bankOk: true };
                      const isFullyEligible = userAnswers.landOk && userAnswers.bankOk;

                      return (
                        <div key={sch.id} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300">
                          {/* Header row */}
                          <div 
                            onClick={() => setExpandedSchemeId(isExpanded ? null : sch.id)}
                            className="p-3 flex justify-between space-x-2 items-center cursor-pointer hover:bg-slate-100/50 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="text-xs font-extrabold text-slate-800 leading-tight">
                                {sch.title}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold mt-0.5 leading-tight truncate max-w-[210px]" title={sch.eligible}>
                                {sch.benefit}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1.5 shrink-0">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase shadow-xs ${
                                isFullyEligible ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                              }`}>
                                {isFullyEligible ? 'Eligible ✓' : 'Audit Pending'}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
                            </div>
                          </div>

                          {/* Expanded Content Panel */}
                          {isExpanded && (
                            <div className="p-3 bg-white border-t border-slate-100 space-y-3 animate-slideDown">
                              {/* Scheme Details */}
                              <div className="space-y-1 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 text-[11px] leading-relaxed">
                                <p className="text-emerald-950 font-semibold">
                                  🎯 <span className="font-extrabold">Subsidy Detail:</span> {sch.benefit}
                                </p>
                                <p className="text-emerald-900 font-medium">
                                  📝 <span className="font-bold">Original Requirement:</span> {sch.eligible}
                                </p>
                                <p className="text-emerald-900 border-t border-emerald-100/70 pt-1.5 mt-1.5 font-bold">
                                  🌾 <span className="text-emerald-700 font-extrabold">Naveen S Identity Match:</span> Verified Resident of Anemadagu Village, Chikkaballapura, Karnataka. Matches Dryland / Wet-zone sub-limits.
                                </p>
                              </div>

                              {/* Interactive Self-Quiz Questionnaire */}
                              <div className="space-y-2">
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">
                                  Confirm Eligibility Criteria
                                </p>

                                <label className="flex items-center space-x-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100/50">
                                  <input 
                                    type="checkbox"
                                    checked={userAnswers.landOk}
                                    onChange={(e) => {
                                      setEligibleResponses(prev => ({
                                        ...prev,
                                        [sch.id]: {
                                          ...(prev[sch.id] || { landOk: true, bankOk: true }),
                                          landOk: e.target.checked
                                        }
                                      }));
                                    }}
                                    className="w-4 h-4 text-emerald-600 accent-emerald-500 rounded"
                                  />
                                  <div className="text-[11px] font-semibold text-slate-700">
                                    Total agricultural land size is within state legal limits.
                                  </div>
                                </label>

                                <label className="flex items-center space-x-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100/50">
                                  <input 
                                    type="checkbox"
                                    checked={userAnswers.bankOk}
                                    onChange={(e) => {
                                      setEligibleResponses(prev => ({
                                        ...prev,
                                        [sch.id]: {
                                          ...(prev[sch.id] || { landOk: true, bankOk: true }),
                                          bankOk: e.target.checked
                                        }
                                      }));
                                    }}
                                    className="w-4 h-4 text-emerald-600 accent-emerald-500 rounded"
                                  />
                                  <div className="text-[11px] font-semibold text-slate-700">
                                    Aadhaar verification document matches Naveen S bank accounts.
                                  </div>
                                </label>
                              </div>

                              {/* Action Trigger */}
                              <button
                                onClick={() => {
                                  if (isFullyEligible) {
                                    triggerVisualToast(`Success! Application submitted for Naveen S under "${sch.title}". Tracking ID: AG-${Math.floor(Math.random() * 90000) + 10000}`);
                                  } else {
                                    triggerVisualToast('Please verify all parameters first to claim this DBT subsidy.');
                                  }
                                }}
                                className={`w-full py-2.5 text-xs font-extrabold rounded-xl text-center uppercase tracking-wider shadow-xs ${
                                  isFullyEligible 
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer' 
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                {isFullyEligible ? 'Apply Online Now ↗' : 'Complete Verification'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Farm Financial Budget analysis spreadsheet simulation */}
                <div id="farm_financials_ledger" className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-4">
                  <div className="mb-2">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                      {t.profile.financeTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                      {t.profile.financeDesc}
                    </p>
                  </div>

                  <form onSubmit={handleAddExpenseLocal} className="flex space-x-1.5 mb-3.5">
                    <input
                      type="text"
                      required
                      placeholder="Expense (seed, spray, land)"
                      value={newExpenseName}
                      onChange={(e) => setNewExpenseName(e.target.value)}
                      className="flex-1 bg-slate-50 border rounded-xl py-2 px-3 text-xs font-semibold outline-none"
                    />
                    <input
                      type="number"
                      required
                      placeholder="Price (₹)"
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(e.target.value)}
                      className="w-16 bg-slate-50 border rounded-xl py-2 text-center text-xs font-black outline-none font-mono"
                    />
                    <button
                      type="submit"
                      className="px-3 bg-emerald-600 text-white font-black text-xs rounded-xl"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="space-y-1 bg-slate-50 p-3 rounded-2xl">
                    <div className="text-[10px] uppercase font-bold text-slate-400 flex justify-between">
                      <span>Item description</span>
                      <span>Amount</span>
                    </div>

                    {expenses.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs font-semibold text-slate-600 border-b border-white/50 py-1">
                        <span className="truncate max-w-[170px]">{item.name}</span>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-slate-800">₹{item.amount}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteExpenseLocal(item.id)}
                            className="p-1 px-2 text-red-500 hover:bg-red-50 rounded text-xs font-bold transition-all cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 mt-1 flex justify-between items-center text-xs border-t border-slate-200">
                      <span className="font-extrabold text-slate-800">Sum Outgoings:</span>
                      <span className="font-extrabold text-emerald-800 font-mono text-sm">
                        ₹{calculateTotalExpenses()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sustainability Organic score simulator card */}
                <div id="sustainability_rating_meter" className="bg-gradient-to-tr from-emerald-950 to-emerald-900 text-white rounded-3xl p-4 shadow-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-extrabold text-xs uppercase tracking-wider text-emerald-300">
                      🍀 {t.profile.sustainabilityScore}
                    </h5>
                    <span className="text-[9px] bg-yellow-400 text-yellow-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wide">
                      Badge Grader
                    </span>
                  </div>

                  <p className="text-[11px] text-emerald-100 leading-normal mb-3">
                    Grade your land practices to earn secondary verified green farm stickers.
                  </p>

                  <div className="space-y-2.5 text-xs text-emerald-100">
                    <div className="flex justify-between items-center">
                      <span>1. Do you spray bio-organic pesticides/manure?</span>
                      <div className="flex space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleGradeSustainability(1, 'yes')}
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            sustainabilityAnswers[1] === 'yes' ? 'bg-emerald-500 text-white' : 'bg-emerald-900 border border-emerald-800'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGradeSustainability(1, 'no')}
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            sustainabilityAnswers[1] === 'no' ? 'bg-red-500 text-white' : 'bg-emerald-900 border border-emerald-800'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>2. Installed water-saving drip emitters?</span>
                      <div className="flex space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleGradeSustainability(2, 'yes')}
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            sustainabilityAnswers[2] === 'yes' ? 'bg-emerald-500 text-white' : 'bg-emerald-900 border border-emerald-800'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGradeSustainability(2, 'no')}
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            sustainabilityAnswers[2] === 'no' ? 'bg-red-500 text-white' : 'bg-emerald-900 border border-emerald-800'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>3. Restrict burning of dried crop stubbles?</span>
                      <div className="flex space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleGradeSustainability(3, 'yes')}
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            sustainabilityAnswers[3] === 'yes' ? 'bg-emerald-500 text-white' : 'bg-emerald-900 border border-emerald-800'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGradeSustainability(3, 'no')}
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            sustainabilityAnswers[3] === 'no' ? 'bg-red-500 text-white' : 'bg-emerald-900 border border-emerald-800'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-800 flex justify-between items-center">
                    <span className="text-xs text-emerald-200 font-extrabold">Evaluated Rating:</span>
                    <span className="font-extrabold text-yellow-300 font-mono text-base bg-emerald-950 px-3 py-1 rounded-xl">
                      {compileEcoScore()} / 100
                    </span>
                  </div>
                </div>

              </div>
            )}

            </React.Suspense>

            {/* Smartphone screen buffer scroll spacer pad */}
            <div className="w-full h-16 shrink-0 bg-transparent"></div>

          </div>
        )}

        {/* Unified Bottom Mobile Navigation Bar - touch friendly, simple icons */}
        {isJoined && (
          <div id="phone_navigation_bar" className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 shadow-[0_-5px_15px_rgba(0,0,0,0.03)] flex justify-between items-center px-4 z-40 select-none shrink-0">
            <button
              onClick={() => {
                setActiveTab('home');
                triggerVisualToast('Home Sowing feed re-loaded.');
              }}
              className={`flex flex-col items-center justify-center flex-1 cursor-pointer py-1.5 focus:outline-none transition-all ${
                activeTab === 'home' ? 'text-emerald-700 font-extrabold scale-105' : 'text-slate-400 font-bold hover:text-slate-600'
              }`}
            >
              <Home className="w-5.5 h-5.5" />
              <span className="text-[9px] mt-1 tracking-tight truncate max-w-[65px]">{t.tabs.home}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('community');
                fetchPostsAndProducts();
                triggerVisualToast('Community Postboard synchronized.');
              }}
              className={`flex flex-col items-center justify-center flex-1 cursor-pointer py-1.5 focus:outline-none transition-all ${
                activeTab === 'community' ? 'text-emerald-700 font-extrabold scale-105' : 'text-slate-400 font-bold hover:text-slate-600'
              }`}
            >
              <Users className="w-5.5 h-5.5" />
              <span className="text-[9px] mt-1 tracking-tight truncate max-w-[65px]">{t.tabs.community}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('marketplace');
                fetchPostsAndProducts();
                triggerVisualToast('Krishi marketplace updated.');
              }}
              className={`flex flex-col items-center justify-center flex-1 cursor-pointer py-1.5 focus:outline-none transition-all ${
                activeTab === 'marketplace' ? 'text-emerald-700 font-extrabold scale-105' : 'text-slate-400 font-bold hover:text-slate-600'
              }`}
            >
              <ShoppingBag className="w-5.5 h-5.5" />
              <span className="text-[9px] mt-1 tracking-tight truncate max-w-[65px]">{t.tabs.marketplace}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('assistant');
                setDiagnosisReport(null);
                setSelectedLeafImage(null);
                triggerVisualToast('Chat Advisor online with voice controls.');
              }}
              className={`flex flex-col items-center justify-center flex-1 cursor-pointer py-1.5 focus:outline-none transition-all ${
                activeTab === 'assistant' ? 'text-emerald-700 font-extrabold scale-105' : 'text-slate-400 font-bold hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <MessageSquare className="w-5.5 h-5.5 text-center block" />
                <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
              </div>
              <span className="text-[10px] mt-1 tracking-tight font-extrabold truncate max-w-[65px]">AI Advisor</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('profile');
                triggerVisualToast('Account ledger open.');
              }}
              className={`flex flex-col items-center justify-center flex-1 cursor-pointer py-1.5 focus:outline-none transition-all ${
                activeTab === 'profile' ? 'text-emerald-700 font-extrabold scale-105' : 'text-slate-400 font-bold hover:text-slate-600'
              }`}
            >
              <User className="w-5.5 h-5.5" />
              <span className="text-[9px] mt-1 tracking-tight truncate max-w-[65px]">{t.tabs.profile}</span>
            </button>
          </div>
        )}

        {/* Floating Camera Upload Button overlaying the interface on active states */}
        {isJoined && (
          <button
            onClick={() => {
              // Reset assistant to leaf doctor first
              setActiveTab('assistant');
              setAssistantMode('doctor');
              setDiagnosisReport(null);
              // Trigger click on hidden leaf uploader input
              hiddenFileInputRef.current?.click();
              triggerVisualToast('Opening camera shutter. Capture your crop leaves clearly!');
            }}
            id="floating_camera_scanner_fab"
            className="absolute bottom-20 right-5 w-14 h-14 bg-gradient-to-tr from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 active:scale-95 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-600/30 border border-emerald-400 cursor-pointer z-50 transition-all group"
            title="Scan crop disease"
          >
            <Camera className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute right-16 bg-slate-900/90 text-white font-extrabold text-[9px] px-2.5 py-1.5 rounded-xl uppercase tracking-widest pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
              Diagnose Crop Disease
            </span>
          </button>
        )}

      </div>

      {/* Outer desktop background disclaimer layout */}
      <div id="desktop_app_credits" className="hidden border-t-0 md:block text-center text-xs mt-6 text-neutral-500 max-w-sm space-y-2 uppercase select-none">
        <p className="font-bold tracking-widest text-emerald-600">🌿 AgriVerse AI Mobile Portal 🌿</p>
        <p className="font-semibold text-[10px] tracking-tight leading-relaxed text-slate-400">
          Designed specifically to function as a compact, responsive client interface on low-end smartphones. Adjust sizing in development by resizing the main window frame.
        </p>
      </div>

    </div>
  );
}
