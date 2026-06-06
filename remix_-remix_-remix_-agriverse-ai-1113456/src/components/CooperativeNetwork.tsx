import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Users, 
  Plus, 
  Send, 
  Sparkles, 
  Check, 
  MapPin, 
  ChevronRight, 
  Volume2, 
  Megaphone, 
  User, 
  MessageSquare, 
  Activity,
  Award,
  Filter,
  LogOut,
  UserPlus,
  Compass,
  FileText,
  TrendingUp,
  Droplets,
  Sprout,
  Wrench,
  Briefcase,
  Calendar,
  AlertTriangle,
  Truck,
  Coins,
  ShieldAlert
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  getDocs,
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { LanguageCode } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CooperativeNetworkProps {
  currentLang: LanguageCode;
  onClose: () => void;
  triggerToast: (msg: string) => void;
  farmerId: string;
  cooperativeId: string;
}

export interface Coop {
  id: string;
  name: string;
  description: string;
  district: string;
  village: string;
  cropFocus: string;
  irrigationType: string;
  acreage: number;
  farmingGoals: string;
  creatorUid: string;
  creatorName: string;
  membersCount: number;
  createdAt: any;
}

export interface CoopMember {
  id: string;
  cooperativeId: string;
  uid: string;
  name: string;
  district: string;
  village: string;
  crop: string;
  irrigationType: string;
  role: 'creator' | 'admin' | 'member';
  joinedAt: any;
}

export interface CoopInvite {
  id: string;
  cooperativeId: string;
  cooperativeName: string;
  fromUid: string;
  fromName: string;
  toUid: string;
  toName: string;
  status: 'sent' | 'accepted' | 'declined';
  createdAt: any;
}

export interface CoopChatMessage {
  id: string;
  cooperativeId: string;
  senderUid: string;
  senderName: string;
  content: string;
  imageUrl?: string;
  voiceUrl?: string;
  createdAt: any;
  translatedContent?: string;
}

const KARNATAKA_DISTRICTS = ['Mandya', 'Kolar', 'Raichur', 'Chikkaballapura', 'Dharwad', 'Belagavi', 'Tumakuru'];
const FOCUS_CROPS = ['Sugarcane', 'Tomato', 'Paddy', 'Onion', 'Cotton', 'Maize', 'Ragi'];
const IRRIGATION_TYPES = ['Drip', 'Borewell', 'Rainfed', 'Canal', 'Sprinkler'];

// Mock Prospects list for Karnataka Smart Match Engine
const MOCK_PROSPECTS = [
  { uid: 'farm_prospect_sharan', name: 'Sharanappa Gowda', district: 'Mandya', village: 'Melukote', crop: 'Sugarcane', irrigationType: 'Borewell', acreage: 12, organic: true, avatar: '👴' },
  { uid: 'farm_prospect_laxmi', name: 'Laxmi Devi', district: 'Kolar', village: 'Mataji', crop: 'Tomato', irrigationType: 'Drip', acreage: 6, organic: true, avatar: '👩' },
  { uid: 'farm_prospect_suresh', name: 'Suresh Kumar', district: 'Raichur', village: 'Gabbur', crop: 'Paddy', irrigationType: 'Canal', acreage: 15, organic: false, avatar: '👨' },
  { uid: 'farm_prospect_basava', name: 'Basavaraj M', district: 'Mandya', village: 'Maddur', crop: 'Sugarcane', irrigationType: 'Canal', acreage: 8, organic: false, avatar: '👴' },
  { uid: 'farm_prospect_bhagya', name: 'Bhagyamma S', district: 'Chikkaballapura', village: 'Anemadagu', crop: 'Tomato', irrigationType: 'Drip', acreage: 5, organic: true, avatar: '👩' },
  { uid: 'farm_prospect_manju', name: 'Manjunatha K', district: 'Chikkaballapura', village: 'Sidlaghatta', crop: 'Onion', irrigationType: 'Rainfed', acreage: 10, organic: true, avatar: '👨' },
  { uid: 'farm_prospect_lingraju', name: 'Lingaraju Swamy', district: 'Mandya', village: 'Malavalli', crop: 'Paddy', irrigationType: 'Borewell', acreage: 18, organic: false, avatar: '👴' },
  { uid: 'farm_prospect_rathna', name: 'Rathnamma Gowda', district: 'Kolar', village: 'Mulbagal', crop: 'Onion', irrigationType: 'Drip', acreage: 7, organic: true, avatar: '👩' },
  { uid: 'farm_prospect_venkatesh', name: 'Venkatesh Prasad', district: 'Raichur', village: 'Manvi', crop: 'Cotton', irrigationType: 'Borewell', acreage: 20, organic: false, avatar: '👨' }
];

export function CooperativeNetwork({ currentLang, onClose, triggerToast, farmerId, cooperativeId }: CooperativeNetworkProps) {
  // Main Lists states
  const [coops, setCoops] = useState<Coop[]>([]);
  const [selectedCoop, setSelectedCoop] = useState<Coop | null>(null);
  
  // Tab states: 'discover' (all alliances), 'my_coops' (joined alliances)
  const [activeSegmentTab, setActiveSegmentTab] = useState<'discover' | 'my_coops'>('discover');
  
  // Selected Co-op Subtabs
  const [activeCoopTab, setActiveCoopTab] = useState<'profile' | 'chat' | 'members' | 'match' | 'ai_advisor' | 'machinery' | 'labor' | 'irrigation' | 'bulk_selling' | 'shared_finance' | 'risk_alerts'>('profile');

  // Filters State
  const [cropFilter, setCropFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [irrigationFilter, setIrrigationFilter] = useState<string>('all');
  const [organicFilter, setOrganicFilter] = useState<boolean | null>(null);

  // Active Co-op states
  const [activeMembers, setActiveMembers] = useState<CoopMember[]>([]);
  const [activeChats, setActiveChats] = useState<CoopChatMessage[]>([]);
  const [activeInvites, setActiveInvites] = useState<CoopInvite[]>([]);

  // New States for Machinery, Labor, Irrigation
  const [machineryList, setMachineryList] = useState<any[]>([]);
  const [machineryBookings, setMachineryBookings] = useState<any[]>([]);
  const [laborRequests, setLaborRequests] = useState<any[]>([]);
  const [irrigationSchedules, setIrrigationSchedules] = useState<any[]>([]);
  const [irrigationAlerts, setIrrigationAlerts] = useState<any[]>([]);

  // Cooperative Farming Hub Phase 2 States
  const [pooledHarvests, setPooledHarvests] = useState<any[]>([]);
  const [transportBookings, setTransportBookings] = useState<any[]>([]);
  const [warehouseStorage, setWarehouseStorage] = useState<any[]>([]);
  const [cooperativeFinances, setCooperativeFinances] = useState<any[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<any[]>([]);
  const [governmentBenefits, setGovernmentBenefits] = useState<any[]>([]);

  // Forms for Phase 2 components
  const [showAddHarvest, setShowAddHarvest] = useState(false);
  const [harvestForm, setHarvestForm] = useState({
    crop: 'Tomato',
    quantityKg: 1000,
    expectedPricePerKg: 20,
    qualityGrade: 'Grade-A Premium'
  });

  const [showAddTransport, setShowAddTransport] = useState(false);
  const [transportForm, setTransportForm] = useState({
    vehicleType: 'Mahindra Bolero Maxitruck',
    driverName: 'Satish Gowda',
    contact: '+91 94480 12345',
    capacityTons: 1.5,
    priceKm: 18,
    routeSpec: 'Malavalli to Mandya APMC'
  });

  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [warehouseForm, setWarehouseForm] = useState({
    warehouseId: '',
    tonsToBook: 5,
    cropType: 'Tomato',
    storageDurationDays: 30
  });

  const [showAddFinance, setShowAddFinance] = useState(false);
  const [financeForm, setFinanceForm] = useState({
    description: 'Shared IFFCO NPK Fertilizer Purchase',
    category: 'fertilizer',
    totalAmount: 12000,
    dieselLitres: 0,
    actualProfit: 35000
  });

  const [showAddAlert, setShowAddAlert] = useState(false);
  const [alertForm, setAlertForm] = useState({
    type: 'pest',
    severity: 'alert',
    message: 'Tomato leaf miners detected in Ward 3. Group spraying advised.',
    district: ''
  });

  // Forms for new features
  const [showAddMachinery, setShowAddMachinery] = useState(false);
  const [machineryForm, setMachineryForm] = useState({
    name: '',
    type: 'Tractor',
    price: 500,
    pricingPeriod: 'hourly',
    image: 'https://images.unsplash.com/photo-1595275313391-902450a0ca2a?auto=format&fit=crop&q=80&w=400'
  });

  const [showAddLabor, setShowAddLabor] = useState(false);
  const [laborForm, setLaborForm] = useState({
    cropType: 'Sugarcane',
    laborType: 'Harvest workers',
    location: '',
    wagePerDay: 400,
    workersNeeded: 5,
    duration: '5 days',
    emergencyPriority: false
  });

  const [showAddIrrigation, setShowAddIrrigation] = useState(false);
  const [irrigationForm, setIrrigationForm] = useState({
    fieldArea: 'Water Sector A',
    startTime: new Date(Date.now() + 86400050).toISOString().substring(0, 16), // tomorrow
    durationMinutes: 90,
    waterSource: 'Borewell 1'
  });

  // User identifiers
  const userUid = farmerId || auth.currentUser?.uid || 'guest_uid';
  const userName = auth.currentUser?.displayName || localStorage.getItem('agri_partner_name') || 'Farmer Partner';

  // Real-time syncing of central user profile
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!userUid || userUid === 'guest_uid') return;
    const userRef = doc(db, 'users', userUid);
    const unsub = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserProfile(snapshot.data());
      }
    }, (err) => {
      console.warn("User profile listen bypassed inside CooperativeNetwork:", err);
    });
    return () => unsub();
  }, [userUid]);

  // Synchronize active selectedCoop with the central user profile's cooperativeId
  useEffect(() => {
    const activeCoopId = cooperativeId || userProfile?.cooperativeId;
    if (activeCoopId && coops.length > 0) {
      const matched = coops.find(c => c.id === activeCoopId);
      if (matched) {
        setSelectedCoop(matched);
      }
    }
  }, [cooperativeId, userProfile?.cooperativeId, coops]);

  // Forms states
  const [showCreateDrawer, setShowCreateDrawer] = useState<boolean>(false);
  const [coopForm, setCoopForm] = useState({
    name: '',
    district: 'Mandya',
    village: 'Melukote',
    cropFocus: 'Sugarcane',
    irrigationType: 'Borewell',
    acreage: 5,
    farmingGoals: 'Direct bulk selling, seed procurement sharing',
    description: 'We are smallholders joining resources to scale yield margins, optimize borewell usage, and organize bulk shipments to APMC.'
  });

  // Chat inputs
  const [chatInput, setChatInput] = useState<string>('');
  const [isRecordingMsg, setIsRecordingMsg] = useState<boolean>(false);
  const [voiceBase64, setVoiceBase64] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // Gemini states
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<string>('');

  // Local notifications system for incoming messages
  const [incomingAlert, setIncomingAlert] = useState<string | null>(null);

  // Translation Labels
  const t = {
    title: currentLang === 'kn' ? 'ಕೂಟ ಕೃಷಿ ಕೇಂದ್ರ' : currentLang === 'hi' ? 'सहकारी खेती केंद्र' : 'Cooperative Farming Hub',
    subtitle: currentLang === 'kn' ? 'ಸಣ್ಣ ರೈತರ ಒಕ್ಕೂಟ ಮತ್ತು ಜಂಟಿ ಕೃಷಿ ಮಾರುಕಟ್ಟೆ' : currentLang === 'hi' ? 'छोटे किसानों का सामूहिक आर्थिक सशक्तीकरण' : 'Collective bargaining and resource optimization for farmers',
    coopName: currentLang === 'kn' ? 'ಸಹಕಾರಿ ಸಂಘದ ಹೆಸರು' : currentLang === 'hi' ? 'सहकारी संस्था का नाम' : 'Cooperative Name',
    district: currentLang === 'kn' ? 'ಜಿಲ್ಲೆ' : currentLang === 'hi' ? 'जिला' : 'District',
    village: currentLang === 'kn' ? 'ಗ್ರಾಮ' : currentLang === 'hi' ? 'गांव' : 'Village/Hobli',
    cropFocus: currentLang === 'kn' ? 'ಮುಖ್ಯ ಬೆಳೆ' : currentLang === 'hi' ? 'प्रमुख फसल' : 'Crop Focus',
    irrigation: currentLang === 'kn' ? 'ನೀರಾವರಿ ವಿಧಾನ' : currentLang === 'hi' ? 'सिंचाई प्रणाली' : 'Irrigation Type',
    acreage: currentLang === 'kn' ? 'ಒಟ್ಟು ಜಮೀನು (ಎಕರೆ)' : currentLang === 'hi' ? 'कुल भूमि (एकड़)' : 'Primary Acreage Target',
    farmingGoals: currentLang === 'kn' ? 'ಸಹಕಾರ ಗುರಿಗಳು' : currentLang === 'hi' ? 'सहकारिता के लक्ष्य' : 'Cooperative Goals',
    description: currentLang === 'kn' ? 'ವಿವರಣೆ' : currentLang === 'hi' ? 'विवरण' : 'Cooperative Description',
    createBtn: currentLang === 'kn' ? 'ಸಂಘ ಸೃಷ್ಟಿಸಿ' : currentLang === 'hi' ? 'सहकारी बनाएं' : 'Deploy Cooperative Alliance',
    noCoops: currentLang === 'kn' ? 'ಯಾವುದೇ ಸಹಕಾರಿ ಸಂಘಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : currentLang === 'hi' ? 'कोई सहकारी समिति नहीं मिली' : 'No Cooperatives Found Matching Criteria',
    prospects: currentLang === 'kn' ? 'ಜಿಲ್ಲೆಯ ರೈತ ಒಡನಾಡಿಗಳು' : currentLang === 'hi' ? 'क्षेत्रीय किसान' : 'Smart Matches & Prospects',
    prospectsDesc: currentLang === 'kn' ? 'ನಿಮ್ಮ ಸಂಘಕ್ಕೆ ಹತ್ತಿರದ ರೈತರನ್ನು ಆಹ್ವಾನಿಸಿ' : currentLang === 'hi' ? 'अपने गठबंधन में शामिल होने के लिए किसानों को आमंत्रित करें' : 'Recruit farmers with matching crop focus, irrigation, or district profiles.'
  };

  // 1. Realtime Subscriptions to Cooperatives Directory
  useEffect(() => {
    const qCoops = query(collection(db, 'cooperatives'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(qCoops, (snapshot) => {
      const dbList: Coop[] = [];
      snapshot.forEach((dt) => {
        dbList.push({ id: dt.id, ...dt.data() } as Coop);
      });
      setCoops(dbList);

      // Seed initial sample cooperative if the database is 100% empty
      if (snapshot.empty) {
        seedDefaultAlliances();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'cooperatives');
    });

    return () => unsubscribe();
  }, []);

  const seedDefaultAlliances = async () => {
    try {
      const initialSeed = [
        {
          name: 'Chikkaballapura Organic Tomato Alliance',
          district: 'Chikkaballapura',
          village: 'Anemadagu',
          cropFocus: 'Tomato',
          irrigationType: 'Drip',
          acreage: 45,
          farmingGoals: 'Wholesale fertilizer pooling, combined coldstorage leasing, shared micro-delivery fleet',
          description: 'A community group of organic tomato growers in Chikkaballapura working towards direct chain supply lines to Bengaluru Mandi bypassing middlemen.',
          creatorUid: 'system_curator',
          creatorName: 'Shri Nagaraj Prasad',
          membersCount: 4,
          createdAt: new Date()
        },
        {
          name: 'Mandya Sugarcane Combined Pool',
          district: 'Mandya',
          village: 'Melukote',
          cropFocus: 'Sugarcane',
          irrigationType: 'Canal',
          acreage: 80,
          farmingGoals: 'Rotational heavy tractor booking, group purchasing of bio-manure bags',
          description: 'Maximizing sugarcane yield per block. We schedule совместный bulk transport directly to sugar crushing factories to protect fresh moisture index.',
          creatorUid: 'system_curator',
          creatorName: 'Patel Devegowda',
          membersCount: 3,
          createdAt: new Date()
        }
      ];

      for (const item of initialSeed) {
        const docRef = doc(collection(db, 'cooperatives'));
        await setDoc(docRef, { ...item, id: docRef.id });

        // Auto-seed creator as first member inside cooperativeMembers
        const memberRef = doc(db, 'cooperativeMembers', `${docRef.id}_creator`);
        await setDoc(memberRef, {
          id: memberRef.id,
          cooperativeId: docRef.id,
          uid: item.creatorUid,
          name: item.creatorName,
          district: item.district,
          village: item.village,
          crop: item.cropFocus,
          irrigationType: item.irrigationType,
          role: 'creator',
          joinedAt: new Date()
        });
      }
    } catch (e) {
      console.error('Error seeding initial values: ', e);
    }
  };

  const seedDefaultIrrigationAlerts = async (coopId: string) => {
    try {
      const sampleAlerts = [
        {
          cooperativeId: coopId,
          type: '🌦️ Rain Alert',
          message: 'Precipitation expected tomorrow afternoon in Chikkaballapura / Mandya. Postpone scheduled drip lines to conserve water and diesel fuel.',
          category: 'weather',
          createdAt: new Date().toISOString()
        },
        {
          cooperativeId: coopId,
          type: '⚡ Borewell Overlap Tracker',
          message: 'Borewell pump 3 is allocated to Shri Nagaraj Prasad from 2:00 PM to 4:00 PM today.',
          category: 'borewell_conflict',
          createdAt: new Date().toISOString()
        },
        {
          cooperativeId: coopId,
          type: '💧 Scientific Drip Timing',
          message: 'Evaporation is peak today. Complete all crop watering cycles before 9:00 AM or after 5:30 PM to optimize absorption.',
          category: 'system',
          createdAt: new Date().toISOString()
        }
      ];
      for (const alert of sampleAlerts) {
        const docRef = doc(collection(db, 'irrigationAlerts'));
        await setDoc(docRef, { ...alert, id: docRef.id });
      }
    } catch (e) {
      console.error('Error seeding alerts:', e);
    }
  };

  const seedDefaultMachinery = async (coopId: string) => {
    try {
      const sampleMachinery = [
        {
          cooperativeId: coopId,
          name: 'John Deere Heavy-Duty Utility Tractor',
          type: 'Tractor',
          image: 'https://images.unsplash.com/photo-1595275313391-902450a0ca2a?auto=format&fit=crop&q=80&w=400',
          ownerUid: 'system_mach_provider_1',
          ownerName: 'Shri Nagaraj Prasad',
          district: selectedCoop?.district || 'Mandya',
          village: selectedCoop?.village || 'Melukote',
          price: 800,
          pricingPeriod: 'hourly',
          status: 'available',
          createdAt: new Date().toISOString()
        },
        {
          cooperativeId: coopId,
          name: 'Combined Sugarcane Harvester Pro-X',
          type: 'Harvester',
          image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=400',
          ownerUid: 'system_mach_provider_2',
          ownerName: 'Patel Devegowda',
          district: selectedCoop?.district || 'Mandya',
          village: selectedCoop?.village || 'Melukote',
          price: 3500,
          pricingPeriod: 'daily',
          status: 'available',
          createdAt: new Date().toISOString()
        }
      ];
      for (const mach of sampleMachinery) {
        const docRef = doc(collection(db, 'machinery'));
        await setDoc(docRef, { ...mach, id: docRef.id });
      }
    } catch (e) {
      console.error('Error seeding machinery:', e);
    }
  };

  const seedDefaultLaborRequests = async (coopId: string) => {
    try {
      const sampleLabor = [
        {
          cooperativeId: coopId,
          creatorUid: 'system_labor_creator_1',
          creatorName: 'Shri Nagaraj Prasad',
          cropType: selectedCoop?.cropFocus || 'Sugarcane',
          laborType: 'Harvest workers',
          location: 'Vishweshwaraiah Farm Sector B',
          wagePerDay: 450,
          workersNeeded: 6,
          duration: '3 days',
          emergencyPriority: true,
          status: 'open',
          applicants: [
            { uid: 'applicant_prakash', name: 'Prakash Gowda' },
            { uid: 'applicant_shekar', name: 'Shekar Murthy' }
          ],
          acceptedWorkers: [],
          createdAt: new Date().toISOString()
        }
      ];
      for (const lab of sampleLabor) {
        const docRef = doc(collection(db, 'laborRequests'));
        await setDoc(docRef, { ...lab, id: docRef.id });
      }
    } catch (e) {
      console.error('Error seeding labor:', e);
    }
  };

  const seedDefaultPooledHarvests = async (coopId: string) => {
    try {
      const samples = [
        {
          cooperativeId: coopId,
          crop: selectedCoop?.cropFocus || 'Tomato',
          quantityKg: 12000,
          expectedPricePerKg: 24,
          qualityGrade: 'Grade-A Export Quality',
          status: 'open',
          transportEst: 3200,
          profitEst: 288000,
          contributors: [
            { uid: 'contributor_ramesh', name: 'Ramesh Kumara', contributionKg: 5000 },
            { uid: 'contributor_gowda', name: 'Manju Gowda', contributionKg: 4000 },
            { uid: 'contributor_babu', name: 'H. S. Babu', contributionKg: 3000 }
          ],
          createdAt: new Date().toISOString()
        },
        {
          cooperativeId: coopId,
          crop: 'Organic Millet',
          quantityKg: 8500,
          expectedPricePerKg: 38,
          qualityGrade: 'Raw Premium Organic',
          status: 'negotiating',
          transportEst: 2600,
          profitEst: 323000,
          contributors: [
            { uid: 'contributor_channappa', name: 'Channappa Gowda', contributionKg: 4500 },
            { uid: 'contributor_parvathi', name: 'Parvathamma M.', contributionKg: 4000 }
          ],
          createdAt: new Date().toISOString()
        }
      ];
      for (const item of samples) {
        const docRef = doc(collection(db, 'pooledHarvests'));
        await setDoc(docRef, { ...item, id: docRef.id });
      }
    } catch (e) {
      console.error('Error seeding pooled harvests:', e);
    }
  };

  const seedDefaultTransportBookings = async (coopId: string) => {
    try {
      const samples = [
        {
          cooperativeId: coopId,
          vehicleType: 'Eicher Pro 10-ton Truck',
          driverName: 'Siddaraju M.',
          contact: '+91 99015 12984',
          capacityTons: 10,
          priceKm: 28,
          hiredByUid: '',
          routeSpec: 'Mandya Rural to K.R. Market Bangalore',
          status: 'available',
          eta: 'Within 4 hours',
          sharedWith: [],
          createdAt: new Date().toISOString()
        },
        {
          cooperativeId: coopId,
          vehicleType: 'Tata Ace Super Ace (1.5t)',
          driverName: 'Kumar Swamy',
          contact: '+91 95350 49182',
          capacityTons: 1.5,
          priceKm: 14,
          hiredByUid: 'system_renter_ace',
          routeSpec: 'Melukote sector B to Hobli warehouse',
          status: 'transit',
          eta: 'Active in transit',
          sharedWith: ['contributor_ramesh'],
          createdAt: new Date().toISOString()
        }
      ];
      for (const item of samples) {
        const docRef = doc(collection(db, 'transportBookings'));
        await setDoc(docRef, { ...item, id: docRef.id });
      }
    } catch (e) {
      console.error('Error seeding transport bookings:', e);
    }
  };

  const seedDefaultWarehouseStorage = async (coopId: string) => {
    try {
      const samples = [
        {
          cooperativeId: coopId,
          name: 'Village Cooperative Cold Room 4',
          type: 'cold',
          capacityAvailableTons: 40,
          bookedTons: 15,
          cropTypeAllowed: 'Fruits & Vegetables',
          basePricePerTonDay: 40,
          durationMaxDays: 60,
          createdAt: new Date().toISOString()
        },
        {
          cooperativeId: coopId,
          name: 'APMC Food Grain Storage Silo B',
          type: 'dry',
          capacityAvailableTons: 150,
          bookedTons: 40,
          cropTypeAllowed: 'Sugarcane, Millet, Paddy',
          basePricePerTonDay: 20,
          durationMaxDays: 180,
          createdAt: new Date().toISOString()
        }
      ];
      for (const item of samples) {
        const docRef = doc(collection(db, 'warehouseStorage'));
        await setDoc(docRef, { ...item, id: docRef.id });
      }
    } catch (e) {
      console.error('Error seeding warehouse storage:', e);
    }
  };

  const seedDefaultCooperativeFinances = async (coopId: string) => {
    try {
      const samples = [
        {
          cooperativeId: coopId,
          description: 'Fertilizer bulk consignment (Urea 46% - 50 bags)',
          category: 'fertilizer',
          totalAmount: 14250,
          dieselLitres: 0,
          paidByUid: 'system_member_1',
          paidByName: 'Shri Nagaraj Prasad',
          actualProfit: 0,
          pendingSettlements: [
            { uid: 'contributor_ramesh', name: 'Ramesh Kumara', amount: 4750, paid: false },
            { uid: 'contributor_gowda', name: 'Manju Gowda', amount: 4750, paid: true },
            { uid: 'guest_uid', name: 'Farmer Partner', amount: 4750, paid: false }
          ],
          createdAt: new Date().toISOString()
        },
        {
          cooperativeId: coopId,
          description: 'Common Borewell Pump High-Voltage Generator Fuel',
          category: 'fuel',
          totalAmount: 3600,
          dieselLitres: 40,
          paidByUid: 'guest_uid',
          paidByName: 'Farmer Partner',
          actualProfit: 0,
          pendingSettlements: [
            { uid: 'contributor_babu', name: 'H. S. Babu', amount: 1800, paid: false },
            { uid: 'contributor_ramesh', name: 'Ramesh Kumara', amount: 1800, paid: false }
          ],
          createdAt: new Date().toISOString()
        }
      ];
      for (const item of samples) {
        const docRef = doc(collection(db, 'cooperativeFinances'));
        await setDoc(docRef, { ...item, id: docRef.id });
      }
    } catch (e) {
      console.error('Error seeding cooperative finances:', e);
    }
  };

  const seedDefaultEmergencyAlerts = async (coopId: string) => {
    try {
      const samples = [
        {
          cooperativeId: coopId,
          type: 'pest',
          severity: 'critical',
          message: 'URGENT: Red Cotton Bug cluster reported expanding in the adjoining block under 4km. Coordinate drone-spraying sweeps.',
          district: selectedCoop?.district || 'Mandya',
          authorName: 'Gemini Safety Radar',
          createdAt: new Date().toISOString()
        },
        {
          cooperativeId: coopId,
          type: 'flood',
          severity: 'critical',
          message: 'CRITICAL RAIN: Severe runoff alert from state canal opening. Ground moisture levels are already 95%. Safeguard seed beds.',
          district: selectedCoop?.district || 'Mandya',
          authorName: 'Safety Officer Devegowda',
          createdAt: new Date().toISOString()
        }
      ];
      for (const item of samples) {
        const docRef = doc(collection(db, 'emergencyAlerts'));
        await setDoc(docRef, { ...item, id: docRef.id });
      }
    } catch (e) {
      console.error('Error seeding emergency alerts:', e);
    }
  };

  const seedDefaultGovernmentBenefits = async (coopId: string) => {
    try {
      const samples = [
        {
          cooperativeId: coopId,
          title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
          category: 'subsidy',
          subsidyAmount: '80% Cooperative Grant for Drone purchase',
          eligibility: 'Registered FPOs and Cooperative alliances with min 10 members',
          documentsNeeded: ['Coop Registration Certificate', 'District Agriculture Officer Audit', 'Land Acreage Summary Map'],
          applyUrl: 'https://agrimachinery.nic.in/',
          createdAt: new Date().toISOString()
        },
        {
          cooperativeId: coopId,
          title: 'PM-Kusum Grid Solar Pump Scheme Component-B',
          category: 'irrigation',
          subsidyAmount: '60% State Solar Pump installation assistance',
          eligibility: 'Small and marginal farmer clusters with high voltage borewell sharing schedules',
          documentsNeeded: ['Joint Borewell Deed Agreement', 'Farmer Land Titles (Pahani)', 'Aadhaar Cards'],
          applyUrl: 'https://mnre.gov.in/pm-kusum',
          createdAt: new Date().toISOString()
        }
      ];
      for (const item of samples) {
        const docRef = doc(collection(db, 'governmentBenefits'));
        await setDoc(docRef, { ...item, id: docRef.id });
      }
    } catch (e) {
      console.error('Error seeding government benefits:', e);
    }
  };

  const handleUploadMachinery = async (form: typeof machineryForm) => {
    if (!selectedCoop) return;
    try {
      const docRef = doc(collection(db, 'machinery'));
      await setDoc(docRef, {
        id: docRef.id,
        cooperativeId: selectedCoop.id,
        name: form.name,
        type: form.type,
        image: form.image || 'https://images.unsplash.com/photo-1595275313391-902450a0ca2a?auto=format&fit=crop&q=80&w=400',
        ownerUid: userUid,
        ownerName: userName,
        district: selectedCoop.district,
        village: selectedCoop.village,
        price: Number(form.price),
        pricingPeriod: form.pricingPeriod,
        status: 'available',
        createdAt: new Date().toISOString()
      });
      triggerToast('🚜 Machinery listing uploaded successfully!');
      setShowAddMachinery(false);
    } catch (e) {
      console.error(e);
      triggerToast('Error uploading machinery.');
    }
  };

  const handleUpdateMachineryStatus = async (machId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'machinery', machId), { status });
      triggerToast(`Uptime status updated to ${status}!`);
    } catch (e) {
      console.error(e);
      triggerToast('Error updating machinery state.');
    }
  };

  const handleBookMachinery = async (mach: any, startDate: string, endDate: string) => {
    if (!selectedCoop) return;
    try {
      const docRef = doc(collection(db, 'machineryBookings'));
      const bookingPayload = {
        id: docRef.id,
        machineryId: mach.id,
        machineryName: mach.name,
        cooperativeId: selectedCoop.id,
        renterUid: userUid,
        renterName: userName,
        ownerUid: mach.ownerUid,
        startDate,
        endDate,
        status: 'pending',
        totalPrice: mach.price * 1, // baseline factor
        createdAt: new Date().toISOString()
      };
      await setDoc(docRef, bookingPayload);

      // Generate real-time notification for the machinery owner
      if (mach.ownerUid) {
        await addDoc(collection(db, 'notifications'), {
          recipientUid: mach.ownerUid,
          type: 'cooperative',
          title: `🚜 New Rental Booking Request!`,
          body: `${userName} is asking to rent your "${mach.name}" machinery from ${startDate} to ${endDate}.`,
          senderName: userName,
          farmerId: userUid,
          cooperativeId: selectedCoop.id,
          listingId: mach.id,
          orderId: docRef.id,
          shipmentId: '',
          read: false,
          createdAt: new Date().toISOString()
        });
      }

      triggerToast('📨 Booking request sent! Waiting for machinery owner confirmation...');
    } catch (e) {
      console.error(e);
      triggerToast('Failed to lock machinery booking.');
    }
  };

  const handleUpdateBookingStatus = async (booking: any, status: 'approved' | 'rejected' | 'completed') => {
    try {
      await updateDoc(doc(db, 'machineryBookings', booking.id), { status });
      
      if (status === 'approved') {
        await updateDoc(doc(db, 'machinery', booking.machineryId), { status: 'rented' });
        triggerToast('🎉 Booking approved! Machinery is now rented.');
      } else if (status === 'completed' || status === 'rejected') {
        await updateDoc(doc(db, 'machinery', booking.machineryId), { status: 'available' });
        triggerToast(`Booking marked ${status}. Machinery status updated to available.`);
      }

      // Generate real-time notification for the booking renter
      if (booking.renterUid) {
        await addDoc(collection(db, 'notifications'), {
          recipientUid: booking.renterUid,
          type: 'cooperative',
          title: `🚜 Machinery Booking ${status.toUpperCase()}!`,
          body: `Your request for "${booking.machineryName}" has been ${status} by the machinery owner.`,
          senderName: userName,
          farmerId: booking.ownerUid || userUid,
          cooperativeId: booking.cooperativeId || 'coop_chikka',
          listingId: booking.machineryId || '',
          orderId: booking.id || '',
          shipmentId: '',
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error updating booking status.');
    }
  };

  const handleCreateLaborRequest = async (form: typeof laborForm) => {
    if (!selectedCoop) return;
    try {
      const docRef = doc(collection(db, 'laborRequests'));
      await setDoc(docRef, {
        id: docRef.id,
        cooperativeId: selectedCoop.id,
        creatorUid: userUid,
        creatorName: userName,
        cropType: form.cropType,
        laborType: form.laborType,
        location: form.location || 'cooperative grids',
        wagePerDay: Number(form.wagePerDay),
        workersNeeded: Number(form.workersNeeded),
        duration: form.duration,
        emergencyPriority: form.emergencyPriority || false,
        status: 'open',
        applicants: [],
        acceptedWorkers: [],
        createdAt: new Date().toISOString()
      });
      triggerToast('👥 Labor recruitment request created inside co-op!');
      setShowAddLabor(false);
    } catch (e) {
      console.error(e);
      triggerToast('Error creating labor request.');
    }
  };

  const handleApplyForLabor = async (request: any) => {
    try {
      const applicants = [...(request.applicants || [])];
      if (applicants.some((a: any) => a.uid === userUid)) {
        triggerToast('You have already applied for this labor position!');
        return;
      }
      applicants.push({ uid: userUid, name: userName });
      await updateDoc(doc(db, 'laborRequests', request.id), { applicants });

      // Generate real-time labor application notification
      await addDoc(collection(db, 'notifications'), {
        recipientUid: request.creatorUid || 'system_fallback',
        type: 'order',
        title: `👥 New Labor Application!`,
        body: `${userName} applied to assist with your "${request.laborType || 'Crop harvesting'}" contract inside the cooperative.`,
        senderName: userName,
        farmerId: userUid,
        cooperativeId: request.cooperativeId || 'coop_chikka',
        listingId: '',
        orderId: request.id || '',
        shipmentId: '',
        read: false,
        createdAt: new Date().toISOString()
      });

      triggerToast('💪 Application submitted in real-time!');
    } catch (e) {
      console.error(e);
      triggerToast('Failed to apply.');
    }
  };

  const handleAcceptWorker = async (request: any, applicant: any) => {
    try {
      const acceptedWorkers = [...(request.acceptedWorkers || [])];
      acceptedWorkers.push(applicant);
      
      const applicants = (request.applicants || []).filter((a: any) => a.uid !== applicant.uid);
      const updatedStatus = acceptedWorkers.length >= request.workersNeeded ? 'filled' : 'open';
      
      await updateDoc(doc(db, 'laborRequests', request.id), {
        acceptedWorkers,
        applicants,
        status: updatedStatus
      });

      // Generate notification for the accepted worker
      await addDoc(collection(db, 'notifications'), {
        recipientUid: applicant.uid,
        type: 'cooperative',
        title: `👥 Labor Request Accepted!`,
        body: `You have been selected by ${request.creatorName} for the "${request.laborType || 'Crop harvesting'}" position. Check co-op schedule!`,
        senderName: userName,
        farmerId: userUid,
        cooperativeId: request.cooperativeId || 'coop_chikka',
        listingId: '',
        orderId: request.id || '',
        shipmentId: '',
        read: false,
        createdAt: new Date().toISOString()
      });

      triggerToast(`Accepted ${applicant.name} into the cooperative labor pool!`);
    } catch (e) {
      console.error(e);
      triggerToast('Failed to accept applicant.');
    }
  };

  const handleCompleteLaborRequest = async (labId: string) => {
    try {
      await updateDoc(doc(db, 'laborRequests', labId), { status: 'completed' });
      triggerToast('Harvest team task marked as completed! 🌾');
    } catch (e) {
      console.error(e);
      triggerToast('Error completing request.');
    }
  };

  const checkBorewellOverlaps = async (newSchedule: any, schedulesList: any[]) => {
    const startHour = new Date(newSchedule.startTime).getHours();
    const overlapping = schedulesList.filter(s => {
      if (s.waterSource === newSchedule.waterSource) {
        const existingHour = new Date(s.startTime).getHours();
        return Math.abs(startHour - existingHour) <= 2;
      }
      return false;
    });

    if (overlapping.length > 0) {
      try {
        const docRef = doc(collection(db, 'irrigationAlerts'));
        await setDoc(docRef, {
          id: docRef.id,
          cooperativeId: selectedCoop?.id || '',
          type: '⚠️ Timing Overlap',
          message: `Caution: Shared point "${newSchedule.waterSource}" has consecutive sessions. ${newSchedule.farmerName} and ${overlapping[0].farmerName} are scheduled under 2 hours apart!`,
          category: 'borewell_conflict',
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.error('Error saving overlap warning:', e);
      }
    }
  };

  const handleAddIrrigationSchedule = async (form: typeof irrigationForm) => {
    if (!selectedCoop) return;
    try {
      const docRef = doc(collection(db, 'irrigationSchedules'));
      const newSchedule = {
        id: docRef.id,
        cooperativeId: selectedCoop.id,
        farmerUid: userUid,
        farmerName: userName,
        fieldArea: form.fieldArea,
        startTime: form.startTime,
        durationMinutes: Number(form.durationMinutes),
        waterSource: form.waterSource,
        reminders: ['1 hour before', '15 mins before'],
        createdAt: new Date().toISOString()
      };
      await setDoc(docRef, newSchedule);
      triggerToast('💧 Irrigation block reserved in cooperative schedule!');
      setShowAddIrrigation(false);
      
      await checkBorewellOverlaps(newSchedule, irrigationSchedules);
    } catch (e) {
      console.error(e);
      triggerToast('Error saving irrigation block.');
    }
  };

  const handleCreatePooledHarvest = async (form: typeof harvestForm) => {
    if (!selectedCoop) return;
    try {
      const docRef = doc(collection(db, 'pooledHarvests'));
      const initialProfit = Number(form.quantityKg) * Number(form.expectedPricePerKg);
      const newPool = {
        id: docRef.id,
        cooperativeId: selectedCoop.id,
        farmerId: userUid,
        listingId: '',
        orderId: '',
        shipmentId: '',
        crop: form.crop,
        quantityKg: Number(form.quantityKg),
        expectedPricePerKg: Number(form.expectedPricePerKg),
        qualityGrade: form.qualityGrade,
        status: 'open',
        transportEst: Number(form.quantityKg) * 0.25,
        profitEst: initialProfit,
        contributors: [
          { uid: userUid, name: userName, contributionKg: Number(form.quantityKg) }
        ],
        createdAt: new Date().toISOString()
      };
      await setDoc(docRef, newPool);

      // Connect Cooperative Farming & Bulk Selling: 
      // If tonnage matches large volume thresholds, alert cooperative members to volunteer or apply for packaging contracts
      if (Number(form.quantityKg) >= 1500) {
        for (const m of activeMembers) {
          if (m.uid !== userUid) {
            await addDoc(collection(db, 'notifications'), {
              recipientUid: m.uid,
              type: 'cooperative',
              title: `👥 Bulk Harvest Pooling!`,
              body: `Large volume harvest pool of ${form.crop} (${Number(form.quantityKg).toLocaleString()} Kg) created by ${userName}. Workers needed!`,
              senderName: userName,
              farmerId: userUid,
              cooperativeId: selectedCoop.id,
              listingId: '',
              orderId: '',
              shipmentId: '',
              read: false,
              createdAt: new Date().toISOString()
            });
          }
        }
      }

      triggerToast(`📢 New Bulk Harvest Pool registered for ${form.crop}!`);
      setShowAddHarvest(false);
    } catch (e) {
      console.error(e);
      triggerToast('Error organizing harvest pool.');
    }
  };

  const handleContributeToHarvest = async (harvest: any, amtKg: number) => {
    if (amtKg <= 0) return;
    try {
      const updatedContributors = [...(harvest.contributors || [])];
      const idx = updatedContributors.findIndex((c: any) => c.uid === userUid);
      if (idx > -1) {
        updatedContributors[idx].contributionKg += Number(amtKg);
      } else {
        updatedContributors.push({ uid: userUid, name: userName, contributionKg: Number(amtKg) });
      }

      const updatedQuantity = Number(harvest.quantityKg) + Number(amtKg);
      const updatedProfit = updatedQuantity * Number(harvest.expectedPricePerKg);
      const updatedTransport = updatedQuantity * 0.25;

      await updateDoc(doc(db, 'pooledHarvests', harvest.id), {
        contributors: updatedContributors,
        quantityKg: updatedQuantity,
        profitEst: updatedProfit,
        transportEst: updatedTransport
      });
      triggerToast(`🌽 Contributed +${amtKg} kg to the bulk ${harvest.crop} pool!`);
    } catch (e) {
      console.error(e);
      triggerToast('Error contributing harvest.');
    }
  };

  const handleNegotiateDirectSale = async (harvestId: string) => {
    try {
      await updateDoc(doc(db, 'pooledHarvests', harvestId), { status: 'negotiating' });
      triggerToast('💼 Direct-negotiation opened with wholesale mandis!');
    } catch (e) {
      console.error(e);
      triggerToast('Error starting negotiations.');
    }
  };

  const handleFinalizeBulkSale = async (harvestId: string) => {
    try {
      await updateDoc(doc(db, 'pooledHarvests', harvestId), { status: 'sold' });
      triggerToast('💰 Bulk harvest pooled inventory marked as SOLD! Profit split is locked.');
    } catch (e) {
      console.error(e);
      triggerToast('Error finalizing sale.');
    }
  };

  const handleCreateTransportBooking = async (form: typeof transportForm) => {
    if (!selectedCoop) return;
    try {
      const docRef = doc(collection(db, 'transportBookings'));
      await setDoc(docRef, {
        id: docRef.id,
        cooperativeId: selectedCoop.id,
        vehicleType: form.vehicleType,
        driverName: form.driverName,
        contact: form.contact,
        capacityTons: Number(form.capacityTons),
        priceKm: Number(form.priceKm),
        hiredByUid: userUid,
        routeSpec: form.routeSpec,
        status: 'booked',
        eta: 'Pre-scheduled',
        sharedWith: [],
        createdAt: new Date().toISOString()
      });
      triggerToast('🚚 Transporter truck successfully secured!');
      setShowAddTransport(false);
    } catch (e) {
      console.error(e);
      triggerToast('Error booking transport.');
    }
  };

  const handleToggleShareTransportRoute = async (transportId: string) => {
    try {
      const booking = transportBookings.find(t => t.id === transportId);
      if (!booking) return;
      const updatedShared = [...(booking.sharedWith || [])];
      if (updatedShared.includes(userName)) {
        const idx = updatedShared.indexOf(userName);
        updatedShared.splice(idx, 1);
        triggerToast('Removed from truck route sharing list.');
      } else {
        updatedShared.push(userName);
        triggerToast('Joined transport sharing plan! Moving harvest together.');
      }
      await updateDoc(doc(db, 'transportBookings', transportId), {
        sharedWith: updatedShared
      });
    } catch (e) {
      console.error(e);
      triggerToast('Error sharing truck route.');
    }
  };

  const handleBookWarehouseSlot = async (warehouseId: string, tons: number, durationDays: number) => {
    try {
      const wh = warehouseStorage.find(w => w.id === warehouseId);
      if (!wh) return;
      if (wh.capacityAvailableTons < tons) {
        triggerToast('Requested space exceeds current available warehouse capacity!');
        return;
      }
      const updatedAvail = Number(wh.capacityAvailableTons) - Number(tons);
      const updatedBooked = Number(wh.bookedTons) + Number(tons);
      await updateDoc(doc(db, 'warehouseStorage', warehouseId), {
        capacityAvailableTons: updatedAvail,
        bookedTons: updatedBooked
      });
      triggerToast(`🏛️ Reserved storing slot of ${tons} tons for strategic APMC bypass!`);
      setShowAddWarehouse(false);
    } catch (e) {
      console.error(e);
      triggerToast('Error reserving warehouse slot.');
    }
  };

  const handleCreateFinanceSplitExpense = async (form: typeof financeForm) => {
    if (!selectedCoop) return;
    try {
      const docRef = doc(collection(db, 'cooperativeFinances'));
      const groupCount = activeMembers.length || 3;
      const costPerShare = Math.round(Number(form.totalAmount) / groupCount);
      
      const settlements = activeMembers.map(m => ({
        uid: m.uid,
        name: m.name,
        amount: costPerShare,
        paid: m.uid === userUid
      }));

      if (settlements.length === 0) {
        settlements.push(
          { uid: userUid, name: 'Farmer Partner (You)', amount: Math.round(Number(form.totalAmount) / 3), paid: true },
          { uid: 'contributor_ramesh', name: 'Ramesh Kumara', amount: Math.round(Number(form.totalAmount) / 3), paid: false },
          { uid: 'contributor_gowda', name: 'Manju Gowda', amount: Math.round(Number(form.totalAmount) / 3), paid: false }
        );
      }

      await setDoc(docRef, {
        id: docRef.id,
        cooperativeId: selectedCoop.id,
        description: form.description,
        category: form.category,
        totalAmount: Number(form.totalAmount),
        dieselLitres: Number(form.dieselLitres) || 0,
        paidByUid: userUid,
        paidByName: userName,
        actualProfit: Number(form.actualProfit) || 0,
        pendingSettlements: settlements,
        createdAt: new Date().toISOString()
      });
      triggerToast(`💵 Cooperative Finance entry logged! Shared cost: Rs. ${costPerShare}/member.`);
      setShowAddFinance(false);
    } catch (e) {
      console.error(e);
      triggerToast('Error registering shared expense.');
    }
  };

  const handleMarkFinancePaid = async (financeId: string) => {
    try {
      const ledger = cooperativeFinances.find(f => f.id === financeId);
      if (!ledger) return;
      const updatedSettlements = (ledger.pendingSettlements || []).map((s: any) => {
        if (s.uid === userUid) {
          return { ...s, paid: true };
        }
        return s;
      });
      await updateDoc(doc(db, 'cooperativeFinances', financeId), {
        pendingSettlements: updatedSettlements
      });
      triggerToast('✔️ Your share for this expense is marked PAID!');
    } catch (e) {
      console.error(e);
      triggerToast('Error marking expense.');
    }
  };

  const handleBroadcastSOS = async (form: typeof alertForm) => {
    if (!selectedCoop) return;
    try {
      const docRef = doc(collection(db, 'emergencyAlerts'));
      await setDoc(docRef, {
        id: docRef.id,
        cooperativeId: selectedCoop.id,
        farmerId: userUid,
        listingId: '',
        orderId: '',
        shipmentId: '',
        type: form.type,
        severity: form.severity,
        message: form.message,
        district: selectedCoop.district,
        authorName: userName,
        createdAt: new Date().toISOString()
      });

      // Distribute a live notification blast to every other active member of the cooperative
      for (const m of activeMembers) {
        if (m.uid !== userUid) {
          try {
            await addDoc(collection(db, 'notifications'), {
              recipientUid: m.uid,
              type: 'alert',
              title: `🚨 Co-op SOS Alert: ${form.type}`,
              body: `${userName} issued high distress warning: "${form.message}" in district: ${selectedCoop.district}.`,
              senderName: userName,
              farmerId: userUid,
              cooperativeId: selectedCoop.id,
              listingId: '',
              orderId: '',
              shipmentId: '',
              read: false,
              createdAt: new Date().toISOString()
            });
          } catch (errNotif) {
            console.warn("SOS Notification blast failure for member:", m.uid, errNotif);
          }
        }
      }

      triggerToast(`🚨 Emergency Distress broadcasted instantly to district: ${selectedCoop.district}!`);
      setShowAddAlert(false);
    } catch (e) {
      console.error(e);
      triggerToast('Error launching broadcast.');
    }
  };

  // 2. Realtime listener of selected Cooperative's members, chat messages, and invites
  useEffect(() => {
    if (!selectedCoop) {
      setActiveMembers([]);
      setActiveChats([]);
      setActiveInvites([]);
      setMachineryList([]);
      setMachineryBookings([]);
      setLaborRequests([]);
      setIrrigationSchedules([]);
      setIrrigationAlerts([]);
      setPooledHarvests([]);
      setTransportBookings([]);
      setWarehouseStorage([]);
      setCooperativeFinances([]);
      setEmergencyAlerts([]);
      setGovernmentBenefits([]);
      return;
    }

    // A. Listen to Active Members
    const qMembers = query(
      collection(db, 'cooperativeMembers'),
      where('cooperativeId', '==', selectedCoop.id),
      orderBy('joinedAt', 'asc')
    );
    const unsubMembers = onSnapshot(qMembers, (snapshot) => {
      const tempMembers: CoopMember[] = [];
      snapshot.forEach((docItem) => {
        tempMembers.push({ id: docItem.id, ...docItem.data() } as CoopMember);
      });
      setActiveMembers(tempMembers);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'cooperativeMembers');
    });

    // B. Listen to Messages
    const qChats = query(
      collection(db, 'cooperativeMessages'),
      where('cooperativeId', '==', selectedCoop.id),
      orderBy('createdAt', 'asc')
    );
    const unsubChats = onSnapshot(qChats, (snapshot) => {
      const tempChats: CoopChatMessage[] = [];
      snapshot.forEach((docItem) => {
        tempChats.push({ id: docItem.id, ...docItem.data() } as CoopChatMessage);
      });
      
      // Local notification sound simulation (alerting for new messages from others)
      if (tempChats.length > activeChats.length && activeChats.length > 0) {
        const lastMsg = tempChats[tempChats.length - 1];
        if (lastMsg.senderUid !== userUid) {
          setIncomingAlert(`New message from ${lastMsg.senderName}: "${lastMsg.content}"`);
          setTimeout(() => setIncomingAlert(null), 4000);
        }
      }
      setActiveChats(tempChats);

      // Auto scroll messaging module
      setTimeout(() => {
        const flowBox = document.getElementById('chat-scrollbox');
        if (flowBox) flowBox.scrollTop = flowBox.scrollHeight;
      }, 150);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'cooperativeMessages');
    });

    // C. Listen to Invites sent from this group
    const qInvites = query(
      collection(db, 'cooperativeInvites'),
      where('cooperativeId', '==', selectedCoop.id),
      orderBy('createdAt', 'desc')
    );
    const unsubInvites = onSnapshot(qInvites, (snapshot) => {
      const tempInvites: CoopInvite[] = [];
      snapshot.forEach((docItem) => {
        tempInvites.push({ id: docItem.id, ...docItem.data() } as CoopInvite);
      });
      setActiveInvites(tempInvites);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'cooperativeInvites');
    });

    // D. Listen to Machinery Listings
    const qMachinery = query(
      collection(db, 'machinery'),
      where('cooperativeId', '==', selectedCoop.id),
      orderBy('createdAt', 'desc')
    );
    const unsubMachinery = onSnapshot(qMachinery, (snapshot) => {
      const tempMachinery: any[] = [];
      snapshot.forEach((docItem) => {
        tempMachinery.push({ id: docItem.id, ...docItem.data() });
      });
      if (snapshot.empty) {
        seedDefaultMachinery(selectedCoop.id);
      } else {
        setMachineryList(tempMachinery);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'machinery');
    });

    // E. Listen to Machinery Bookings
    const qBookings = query(
      collection(db, 'machineryBookings'),
      where('cooperativeId', '==', selectedCoop.id),
      orderBy('createdAt', 'desc')
    );
    const unsubBookings = onSnapshot(qBookings, (snapshot) => {
      const tempBookings: any[] = [];
      snapshot.forEach((docItem) => {
        tempBookings.push({ id: docItem.id, ...docItem.data() });
      });
      setMachineryBookings(tempBookings);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'machineryBookings');
    });

    // F. Listen to Labor Requests
    const qLabor = query(
      collection(db, 'laborRequests'),
      where('cooperativeId', '==', selectedCoop.id),
      orderBy('createdAt', 'desc')
    );
    const unsubLabor = onSnapshot(qLabor, (snapshot) => {
      const tempLabor: any[] = [];
      snapshot.forEach((docItem) => {
        tempLabor.push({ id: docItem.id, ...docItem.data() });
      });
      if (snapshot.empty) {
        seedDefaultLaborRequests(selectedCoop.id);
      } else {
        setLaborRequests(tempLabor);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'laborRequests');
    });

    // G. Listen to Irrigation Schedules
    const qIrrigation = query(
      collection(db, 'irrigationSchedules'),
      where('cooperativeId', '==', selectedCoop.id),
      orderBy('startTime', 'asc')
    );
    const unsubIrrigation = onSnapshot(qIrrigation, (snapshot) => {
      const tempIrrigation: any[] = [];
      snapshot.forEach((docItem) => {
        tempIrrigation.push({ id: docItem.id, ...docItem.data() });
      });
      setIrrigationSchedules(tempIrrigation);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'irrigationSchedules');
    });

    // H. Listen to Irrigation Alerts
    const qAlerts = query(
      collection(db, 'irrigationAlerts'),
      where('cooperativeId', '==', selectedCoop.id),
      orderBy('createdAt', 'desc')
    );
    const unsubAlerts = onSnapshot(qAlerts, (snapshot) => {
      const tempAlerts: any[] = [];
      snapshot.forEach((docItem) => {
        tempAlerts.push({ id: docItem.id, ...docItem.data() });
      });
      if (snapshot.empty) {
        seedDefaultIrrigationAlerts(selectedCoop.id);
      } else {
        setIrrigationAlerts(tempAlerts);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'irrigationAlerts');
    });

    // I. Listen to Pooled Harvests
    const qHarvests = query(
      collection(db, 'pooledHarvests'),
      where('cooperativeId', '==', selectedCoop.id),
      orderBy('createdAt', 'desc')
    );
    const unsubHarvests = onSnapshot(qHarvests, (snapshot) => {
      const tempHarvests: any[] = [];
      snapshot.forEach((docItem) => {
        tempHarvests.push({ id: docItem.id, ...docItem.data() });
      });
      if (snapshot.empty) {
        seedDefaultPooledHarvests(selectedCoop.id);
      } else {
        setPooledHarvests(tempHarvests);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pooledHarvests');
    });

    // J. Listen to Transport Bookings
    const qTransports = query(
      collection(db, 'transportBookings'),
      where('cooperativeId', '==', selectedCoop.id),
      orderBy('createdAt', 'desc')
    );
    const unsubTransport = onSnapshot(qTransports, (snapshot) => {
      const tempTransports: any[] = [];
      snapshot.forEach((docItem) => {
        tempTransports.push({ id: docItem.id, ...docItem.data() });
      });
      if (snapshot.empty) {
        seedDefaultTransportBookings(selectedCoop.id);
      } else {
        setTransportBookings(tempTransports);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transportBookings');
    });

    // K. Listen to Warehouse Storage
    const qWarehouses = query(
      collection(db, 'warehouseStorage'),
      where('cooperativeId', '==', selectedCoop.id),
      orderBy('createdAt', 'desc')
    );
    const unsubWarehouse = onSnapshot(qWarehouses, (snapshot) => {
      const tempWarehouses: any[] = [];
      snapshot.forEach((docItem) => {
        tempWarehouses.push({ id: docItem.id, ...docItem.data() });
      });
      if (snapshot.empty) {
        seedDefaultWarehouseStorage(selectedCoop.id);
      } else {
        setWarehouseStorage(tempWarehouses);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'warehouseStorage');
    });

    // L. Listen to Cooperative Finance
    const qFinances = query(
      collection(db, 'cooperativeFinances'),
      where('cooperativeId', '==', selectedCoop.id),
      orderBy('createdAt', 'desc')
    );
    const unsubFinance = onSnapshot(qFinances, (snapshot) => {
      const tempFinances: any[] = [];
      snapshot.forEach((docItem) => {
        tempFinances.push({ id: docItem.id, ...docItem.data() });
      });
      if (snapshot.empty) {
        seedDefaultCooperativeFinances(selectedCoop.id);
      } else {
        setCooperativeFinances(tempFinances);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'cooperativeFinances');
    });

    // M. Listen to Emergency Alerts
    const qEmergencies = query(
      collection(db, 'emergencyAlerts'),
      where('cooperativeId', '==', selectedCoop.id),
      orderBy('createdAt', 'desc')
    );
    const unsubEmergency = onSnapshot(qEmergencies, (snapshot) => {
      const tempEmergencies: any[] = [];
      snapshot.forEach((docItem) => {
        tempEmergencies.push({ id: docItem.id, ...docItem.data() });
      });
      if (snapshot.empty) {
        seedDefaultEmergencyAlerts(selectedCoop.id);
      } else {
        setEmergencyAlerts(tempEmergencies);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'emergencyAlerts');
    });

    // N. Listen to Government Benefits
    const qGov = query(
      collection(db, 'governmentBenefits'),
      where('cooperativeId', '==', selectedCoop.id),
      orderBy('createdAt', 'desc')
    );
    const unsubGov = onSnapshot(qGov, (snapshot) => {
      const tempGov: any[] = [];
      snapshot.forEach((docItem) => {
        tempGov.push({ id: docItem.id, ...docItem.data() });
      });
      if (snapshot.empty) {
        seedDefaultGovernmentBenefits(selectedCoop.id);
      } else {
        setGovernmentBenefits(tempGov);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'governmentBenefits');
    });

    return () => {
      unsubMembers();
      unsubChats();
      unsubInvites();
      unsubMachinery();
      unsubBookings();
      unsubLabor();
      unsubIrrigation();
      unsubAlerts();
      unsubHarvests();
      unsubTransport();
      unsubWarehouse();
      unsubFinance();
      unsubEmergency();
      unsubGov();
    };
  }, [selectedCoop?.id]);

  // 3. Create Cooperative Function
  const handleDeployCooperative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coopForm.name.trim() || !coopForm.village.trim() || !coopForm.farmingGoals.trim()) {
      triggerToast('Please fill all mandatory cooperative details! 🌾');
      return;
    }

    try {
      const docRef = doc(collection(db, 'cooperatives'));
      const newCoopPayload = {
        id: docRef.id,
        name: coopForm.name,
        district: coopForm.district,
        village: coopForm.village,
        cropFocus: coopForm.cropFocus,
        irrigationType: coopForm.irrigationType,
        acreage: Number(coopForm.acreage) || 5,
        farmingGoals: coopForm.farmingGoals,
        description: coopForm.description,
        creatorUid: userUid,
        creatorName: userName,
        membersCount: 1,
        createdAt: serverTimestamp()
      };

      await setDoc(docRef, newCoopPayload);

      // Add Creator automatically into cooperativeMembers collection
      const memberRef = doc(db, 'cooperativeMembers', `${docRef.id}_${userUid}`);
      await setDoc(memberRef, {
        id: memberRef.id,
        cooperativeId: docRef.id,
        uid: userUid,
        name: userName,
        district: coopForm.district,
        village: coopForm.village,
        crop: coopForm.cropFocus,
        irrigationType: coopForm.irrigationType,
        role: 'creator',
        joinedAt: serverTimestamp()
      });

      // Update central users/{userId} collection with the associated cooperativeId
      if (userUid && userUid !== 'guest_uid') {
        await setDoc(doc(db, 'users', userUid), { cooperativeId: docRef.id }, { merge: true });
      }

      // Clear setup forms and navigate to layout
      triggerToast('🎉 Your Cooperative Farming Alliance was successfully deployed!');
      setSelectedCoop(newCoopPayload as Coop);
      setActiveCoopTab('profile');
      setShowCreateDrawer(false);
      
      // Reset details
      setCoopForm({
        name: '',
        district: 'Mandya',
        village: 'Melukote',
        cropFocus: 'Sugarcane',
        irrigationType: 'Borewell',
        acreage: 5,
        farmingGoals: 'Direct bulk selling, seed procurement sharing',
        description: 'We are smallholders joining resources to scale yield margins, optimize borewell usage, and organize bulk shipments to APMC.'
      });
    } catch (err) {
      console.error(err);
      triggerToast('Error deploying cooperative instance. Please retry.');
    }
  };

  // 4. Join Cooperative Function
  const handleJoinCooperative = async (targetCoop: Coop) => {
    try {
      // Check if already a member
      const memberDocId = `${targetCoop.id}_${userUid}`;
      const searchRef = doc(db, 'cooperativeMembers', memberDocId);
      const docSnap = await getDoc(searchRef);

      if (docSnap.exists()) {
        triggerToast('You are already an active partner inside this cooperative!');
        return;
      }

      await setDoc(searchRef, {
        id: memberDocId,
        cooperativeId: targetCoop.id,
        uid: userUid,
        name: userName,
        district: targetCoop.district,
        village: targetCoop.village,
        crop: targetCoop.cropFocus,
        irrigationType: targetCoop.irrigationType,
        role: 'member',
        joinedAt: serverTimestamp()
      });

      // Update central users/{userId} collection with the associated cooperativeId
      if (userUid && userUid !== 'guest_uid') {
        await setDoc(doc(db, 'users', userUid), { cooperativeId: targetCoop.id }, { merge: true });
      }

      // Update aggregate count
      const coopRef = doc(db, 'cooperatives', targetCoop.id);
      await updateDoc(coopRef, {
        membersCount: (targetCoop.membersCount || 1) + 1
      });

      // Update local state instantly
      setSelectedCoop({
        ...targetCoop,
        membersCount: (targetCoop.membersCount || 1) + 1
      });
      setActiveCoopTab('profile');

      triggerToast(`Joined "${targetCoop.name}" alliance successfully! Welcome! 👥`);
    } catch (err) {
      console.error(err);
      triggerToast('Error enrolling into cooperative.');
    }
  };

  // 5. Leave Cooperative Function
  const handleLeaveCooperative = async (targetCoop: Coop) => {
    if (targetCoop.creatorUid === userUid) {
      triggerToast('Creators cannot leave their own alliance directly. You may delete the Coop instead.');
      return;
    }

    try {
      const memberDocId = `${targetCoop.id}_${userUid}`;
      await deleteDoc(doc(db, 'cooperativeMembers', memberDocId));

      // Decrement members count
      const coopRef = doc(db, 'cooperatives', targetCoop.id);
      const freshCount = Math.max(1, (targetCoop.membersCount || 2) - 1);
      await updateDoc(coopRef, {
        membersCount: freshCount
      });

      setSelectedCoop({
        ...targetCoop,
        membersCount: freshCount
      });

      // Clear/Reset cooperativeId in central users/{userId} user profile
      if (userUid && userUid !== 'guest_uid') {
        await setDoc(doc(db, 'users', userUid), { cooperativeId: '' }, { merge: true });
      }

      triggerToast(`You left "${targetCoop.name}" cooperative network.`);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to unlink from cooperative.');
    }
  };

  // 6. Delete/Dissolve Cooperative (If Creator)
  const handleDissolveCooperative = async (targetCoop: Coop) => {
    if (!window.confirm('Are you sure you want to dissolve this cooperative alliance permanently?')) return;
    try {
      await deleteDoc(doc(db, 'cooperatives', targetCoop.id));
      setSelectedCoop(null);
      triggerToast('Dissolved cooperative registry. Directory updated.');
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Send Realtime Message
  const handleSendChatMessage = async () => {
    if (!selectedCoop) return;
    if (!chatInput.trim() && !voiceBase64 && !imageBase64) return;

    try {
      const msgRef = doc(collection(db, 'cooperativeMessages'));
      const payload = {
        id: msgRef.id,
        cooperativeId: selectedCoop.id,
        senderUid: userUid,
        senderName: userName,
        content: chatInput.trim() || (voiceBase64 ? '🎙️ Shared field voice note' : '📸 Shared crop scan'),
        ...(voiceBase64 && { voiceUrl: voiceBase64 }),
        ...(imageBase64 && { imageUrl: imageBase64 }),
        createdAt: serverTimestamp()
      };

      await setDoc(msgRef, payload);
      setChatInput('');
      setVoiceBase64(null);
      setImageBase64(null);

      // Scroll to bottom
      setTimeout(() => {
        const sBox = document.getElementById('chat-scrollbox');
        if (sBox) sBox.scrollTop = sBox.scrollHeight;
      }, 150);
    } catch (err) {
      console.error(err);
      triggerToast('Error delivering group message.');
    }
  };

  // 8. simulated voice note recording simulation (bypassing browser permission restrictions elegantly)
  const handleVoiceSimulation = () => {
    setIsRecordingMsg(true);
    triggerToast('Recording field advisory voice note... Speak now! 🎙️');
    
    setTimeout(() => {
      setIsRecordingMsg(false);
      setVoiceBase64('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGFtZTMuMTAwAEluZm8AAAAPAAAD...MOCK');
      triggerToast('Attached high-fidelity simulated wave audio! Press Send.');
    }, 2000);
  };

  // 9. Photo simulation for diseases
  const handlePhotoSimulation = () => {
    triggerToast('Taking quick camera capture of agricultural sample...');
    setImageBase64('https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400');
    triggerToast('Tomato foliage sample snapshot attached! Press Send.');
  };

  // 10. Invite Regional Farmer (Smart Matching recruit)
  const handleInviteFarmer = async (farmer: typeof MOCK_PROSPECTS[0]) => {
    if (!selectedCoop) return;

    // Check if farmer is already verified inside the alliance
    const isAlreadyMember = activeMembers.some(m => m.uid === farmer.uid);
    if (isAlreadyMember) {
      triggerToast(`${farmer.name} is already a member of this cooperative.`);
      return;
    }

    // Check if already invited
    const isAlreadyInvited = activeInvites.some(i => i.toUid === farmer.uid && i.status === 'sent');
    if (isAlreadyInvited) {
      triggerToast(`Invitation is already sent and pending verification for ${farmer.name}.`);
      return;
    }

    try {
      const inviteRef = doc(collection(db, 'cooperativeInvites'));
      await setDoc(inviteRef, {
        id: inviteRef.id,
        cooperativeId: selectedCoop.id,
        cooperativeName: selectedCoop.name,
        fromUid: userUid,
        fromName: userName,
        toUid: farmer.uid,
        toName: farmer.name,
        status: 'sent',
        createdAt: serverTimestamp()
      });

      triggerToast(`📨 Invitation dispatched to ${farmer.name} of ${farmer.village}!`);

      // HIGH-FIDELITY EVENT SIMULATOR: simulated crop acceptance after 4 seconds!
      setTimeout(async () => {
        try {
          // 1. Update Invite log to accepted
          await updateDoc(doc(db, 'cooperativeInvites', inviteRef.id), {
            status: 'accepted'
          });

          // 2. Write them to members collection
          const memberId = `${selectedCoop.id}_${farmer.uid}`;
          await setDoc(doc(db, 'cooperativeMembers', memberId), {
            id: memberId,
            cooperativeId: selectedCoop.id,
            uid: farmer.uid,
            name: farmer.name,
            district: farmer.district,
            village: farmer.village,
            crop: farmer.crop,
            irrigationType: farmer.irrigationType,
            role: 'member',
            joinedAt: serverTimestamp()
          });

          // 3. Increment members tally
          const cRef = doc(db, 'cooperatives', selectedCoop.id);
          await updateDoc(cRef, {
            membersCount: (selectedCoop.membersCount || 1) + 1
          });

          // 4. Send nice greeting message inside chat
          const mRef = doc(collection(db, 'cooperativeMessages'));
          await setDoc(mRef, {
            id: mRef.id,
            cooperativeId: selectedCoop.id,
            senderUid: farmer.uid,
            senderName: farmer.name,
            content: `Hello everyone! Thank you for the invite, I am glad to join the alliance. My ${farmer.acreage} acres of ${farmer.crop} crops are ready for resource sharing! 🌾`,
            createdAt: serverTimestamp()
          });

          // Update parent state
          setSelectedCoop((p) => p ? { ...p, membersCount: (p.membersCount || 1) + 1 } : null);
          triggerToast(`🔔 Regional update: ${farmer.name} accepted your invite and joined the group!`);
        } catch (e) {
          console.error('Simulation enrollment error: ', e);
        }
      }, 4500);

    } catch (err) {
      console.error(err);
      triggerToast('Failed to dispatch digital invitation.');
    }
  };

  // 11. Multilingual Chat Translation
  const translateMessageText = async (msgId: string, text: string) => {
    triggerToast('🤖 Translating with Gemini Multilingual Agent...');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Translate the following agricultural communication message smoothly into ${currentLang === 'kn' ? 'Kannada' : currentLang === 'hi' ? 'Hindi' : 'English'}: "${text}". Respond strictly with the translated text and do not write any prefixes or commentary.`,
          language: currentLang
        })
      });

      const data = await response.json();
      if (data.text) {
        // Map translation locally directly in state for immediate visual feedback
        setActiveChats(prev => prev.map(m => m.id === msgId ? { ...m, translatedContent: data.text } : m));
        triggerToast('Translation completed successfully! 🌍');
      } else {
        throw new Error();
      }
    } catch {
      setActiveChats(prev => prev.map(m => m.id === msgId ? { ...m, translatedContent: `[Unprocessed: ${text}]` } : m));
      triggerToast('Translation error.');
    }
  };

  // 12. Smart Matching algorithm
  const filteredProspects = MOCK_PROSPECTS.filter((farmer) => {
    if (cropFilter !== 'all' && farmer.crop !== cropFilter) return false;
    if (districtFilter !== 'all' && farmer.district !== districtFilter) return false;
    if (irrigationFilter !== 'all' && farmer.irrigationType !== irrigationFilter) return false;
    if (organicFilter !== null && farmer.organic !== organicFilter) return false;
    return true;
  });

  // Suggested Prospects ranking
  const getMatchScoreText = (farmer: typeof MOCK_PROSPECTS[0]) => {
    if (!selectedCoop) return 'Regional';
    let matchReason = [];
    if (farmer.crop === selectedCoop.cropFocus) matchReason.push('Same Crop Focus');
    if (farmer.district === selectedCoop.district) matchReason.push('Same District');
    if (farmer.irrigationType === selectedCoop.irrigationType) matchReason.push('Same Irrigation');
    return matchReason.length > 0 ? matchReason.join(' • ') : 'Nearby Location';
  };

  // 13. Gemini opportunities simulation
  const requestGeminiAdvisory = async () => {
    if (!selectedCoop) return;
    setIsAiLoading(true);
    setAiReport('');
    triggerToast('Consulting Gemini Cooperative Director... 🌌');

    try {
      const promptText = `Analyze the current cooperative farming group information:
Name: "${selectedCoop.name}"
District: "${selectedCoop.district}"
Village: "${selectedCoop.village}"
Crop Focus: "${selectedCoop.cropFocus}"
Irrigation Type: "${selectedCoop.irrigationType}"
Focus Acreage: ${selectedCoop.acreage} acres
Farming Goals: "${selectedCoop.farmingGoals}"

Provide 3 practical, actionable, and specific recommendations on:
1. Wholesale seed crop group purchasing savings.
2. Cooperative scheduling strategy for shared ${selectedCoop.irrigationType} irrigation or machinery.
3. Collective crop logistics & direct-to-city price negotiation tips.

Reply in elegant, helpful tone localized in ${currentLang === 'kn' ? 'Kannada' : currentLang === 'hi' ? 'Hindi' : 'English'}. Include currency calculations where applicable.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          language: currentLang
        })
      });

      const data = await response.json();
      setAiReport(data.text || 'Unable to generate advisory at this moment');
    } catch {
      setAiReport('Wholesale joint orders of seeds generally save 28% of base seeds purchase rates and slash tractor machinery logistics by Rs. 900 per acre.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const requestCustomGeminiPrompt = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiReport('');
    triggerToast('Analyzing customized query... ⚡');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${aiPrompt}. Relate specifically to cooperative smallholder group context with crop focus ${selectedCoop?.cropFocus || 'general'}. Limit explanation to 3-5 lines.`,
          language: currentLang
        })
      });

      const data = await response.json();
      setAiReport(data.text || 'Fallback completed');
      setAiPrompt('');
    } catch {
      setAiReport('Could not contact Gemini API.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Segregate coops user is member of
  const myCoops = coops.filter((c) => {
    // Or if they created it
    if (c.creatorUid === userUid) return true;
    // Check local active members logic
    return activeMembers.some(m => m.cooperativeId === c.id && m.uid === userUid);
  });

  const isUserMember = (coopId: string) => {
    if (userUid === 'guest_uid') return true; // allow guest testing
    return coops.find(c => c.id === coopId)?.creatorUid === userUid || activeMembers.some(m => m.uid === userUid);
  };

  const processedCoops = activeSegmentTab === 'discover' ? coops : coops.filter(c => c.creatorUid === userUid || c.id === 'Chikkaballapura Organic Tomato Alliance');

  return (
    <div id="cooperative_hub_container" className="bg-slate-50 min-h-64 rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col font-sans animate-fadeIn">
      
      {/* Alert Banner Notification */}
      <AnimatePresence>
        {incomingAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-teal-900 border-b border-teal-700 text-white font-bold p-3 text-xs flex justify-between items-center z-55 w-full sticky top-0"
          >
            <span>🔔 {incomingAlert}</span>
            <button onClick={() => setIncomingAlert(null)}><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Internal Module Top Title Row */}
      <div className="bg-gradient-to-r from-emerald-850 to-teal-900 text-white px-4 py-4.5 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 text-emerald-300">
            <Users className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider">{t.title}</h3>
            <p className="text-[10px] text-emerald-200 font-medium leading-none mt-1">{t.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowCreateDrawer(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-emerald-950 text-[10.5px] font-black uppercase tracking-wider px-3 py-2 rounded-xl flex items-center space-x-1 shadow-sm shrink-0 active:scale-95 transition-all outline-none"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Form Alliance</span>
          </button>
          <button 
            onClick={onClose}
            className="w-8.5 h-8.5 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer active:scale-90 transition-all border border-white/10 outline-none"
            title="Close Cooperative Hub"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Segment controller */}
      <div className="bg-slate-100/80 p-1.5 border-b border-slate-200 flex space-x-1.5 text-xs font-bold shrink-0">
        <button 
          onClick={() => { setActiveSegmentTab('discover'); setSelectedCoop(null); }}
          className={`flex-1 py-2 rounded-xl transition-all uppercase tracking-wide flex items-center justify-center space-x-1.5 ${
            activeSegmentTab === 'discover' 
              ? 'bg-emerald-700 text-white shadow-sm font-black' 
              : 'text-slate-600 hover:text-slate-900 bg-white/50'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Discover Alliances</span>
        </button>
        <button 
          onClick={() => { setActiveSegmentTab('my_coops'); setSelectedCoop(null); }}
          className={`flex-1 py-2 rounded-xl transition-all uppercase tracking-wide flex items-center justify-center space-x-1.5 ${
            activeSegmentTab === 'my_coops' 
              ? 'bg-emerald-700 text-white shadow-sm font-black' 
              : 'text-slate-600 hover:text-slate-900 bg-white/50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>My Joined Co-Ops ({myCoops.length || 1})</span>
        </button>
      </div>

      {/* Main Inner Split Matrix */}
      <div className="flex-1 flex flex-col md:flex-row min-h-96 md:min-h-[500px]">
        
        {/* LEFT COLUMN: Coop Discovery List */}
        <div id="coops_directory_sidebar" className={`p-4 space-y-4 md:w-80 border-r border-slate-150 shrink-0 ${selectedCoop ? 'hidden md:block' : 'block w-full'}`}>
          <div className="flex justify-between items-center pb-2 border-b">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" /> Filter Directory
            </h4>
            <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full">{processedCoops.length} options</span>
          </div>

          {/* Quick interactive directory filters */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase text-slate-500">
            <div>
              <label className="block mb-1 text-[9px]">District</label>
              <select 
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-200 p-2 rounded-lg border-none"
              >
                <option value="all">All Districts</option>
                {KARNATAKA_DISTRICTS.map(dst => <option key={dst} value={dst}>{dst}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[9px]">Crop Focus</label>
              <select 
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-200 p-2 rounded-lg border-none"
              >
                <option value="all">All Crops</option>
                {FOCUS_CROPS.map(crp => <option key={crp} value={crp}>{crp}</option>)}
              </select>
            </div>
          </div>

          {/* Cooperative lists: Horizontal/Swipeable structure inside cards */}
          <div className="space-y-3.5 max-h-[320px] md:max-h-[460px] overflow-y-auto pr-1">
            {processedCoops.length === 0 ? (
              <div className="text-center py-10 bg-white p-4 border rounded-2xl">
                <p className="text-xs text-slate-400 font-semibold">{t.noCoops}</p>
              </div>
            ) : (
              processedCoops.map((coopItem) => {
                const isSelected = selectedCoop?.id === coopItem.id;
                const isMemberOfThis = isUserMember(coopItem.id);
                return (
                  <div 
                    key={coopItem.id}
                    onClick={() => {
                      setSelectedCoop(coopItem);
                      setActiveCoopTab('profile');
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-gradient-to-tr from-emerald-800 to-teal-900 text-white border-emerald-600 shadow-md' 
                        : 'bg-white hover:bg-slate-100/70 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[8.5px] font-black uppercase py-0.5 px-2.5 rounded-full ${
                        isSelected ? 'bg-white/15 text-white border border-white/10' : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        🌱 {coopItem.cropFocus}
                      </span>
                      <span className={`text-[9.5px] font-extrabold ${isSelected ? 'text-teal-200' : 'text-slate-500'}`}>
                        👥 {coopItem.membersCount || 1} Partners
                      </span>
                    </div>

                    <h5 className="text-[12.5px] font-black uppercase tracking-tight leading-snug">
                      {coopItem.name}
                    </h5>
                    <p className={`text-[10px] mt-1.5 line-clamp-2 ${isSelected ? 'text-emerald-100/90' : 'text-slate-500'}`}>
                      {coopItem.description}
                    </p>

                    <div className="mt-4 pt-2.5 border-t border-dashed border-slate-100/25 flex items-center justify-between text-[9px] font-bold opacity-80">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {coopItem.village}, {coopItem.district}
                      </span>
                      <span className="uppercase">💧 {coopItem.irrigationType}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Selective alliance viewport */}
        <div id="coop_details_panel" className="flex-1 bg-white min-h-[400px] flex flex-col border-l border-slate-150 relative">
          {selectedCoop ? (
            <div className="flex-1 flex flex-col h-full animate-fadeIn">
              
              {/* Back navigation only visible on mobile screen widths */}
              <div className="bg-slate-50 md:bg-white px-4 py-3 border-b flex justify-between items-center">
                <button 
                  onClick={() => setSelectedCoop(null)}
                  className="md:hidden text-xs font-extrabold pb-0.5 text-emerald-800 uppercase flex items-center"
                >
                  ← Directory
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Alliance Room</span>
                </div>
                {selectedCoop.creatorUid === userUid && (
                  <button 
                    onClick={() => handleDissolveCooperative(selectedCoop)}
                    className="text-red-600 hover:underline font-black uppercase text-[9.5px]"
                  >
                    Dissolve Group
                  </button>
                )}
              </div>

              {/* Cooperative visual header profile cards details */}
              <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white p-4.5 border-b">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full tracking-wider">
                    {selectedCoop.cropFocus} Focus
                  </span>
                  <div className="flex items-center space-x-1.5 text-[10px] text-indigo-200 font-extrabold bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                    <Users className="w-3 h-3" />
                    <span>{selectedCoop.membersCount || 1} Farmers joined</span>
                  </div>
                </div>

                <h3 className="text-sm font-black md:text-base uppercase tracking-tight leading-tight">
                  {selectedCoop.name}
                </h3>
                
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10.5px] sm:text-xs text-indigo-100 font-medium">
                  <span className="flex items-center">📍 Mandi Scope: {selectedCoop.village}, {selectedCoop.district}</span>
                  <span>•</span>
                  <span>Combined space: {selectedCoop.acreage} Acres</span>
                </div>
              </div>

              {/* Sub tabs switcher */}
              <div className="bg-slate-100/70 p-1.5 border-b flex space-x-1 overflow-x-auto text-xs shrink-0 select-none no-scrollbar">
                {[
                  { id: 'profile', label: 'Profile', icon: FileText },
                  { id: 'chat', label: 'Chat', icon: MessageSquare },
                  { id: 'machinery', label: 'Machinery Rental', icon: Wrench },
                  { id: 'labor', label: 'Labor Hiring', icon: Briefcase },
                  { id: 'irrigation', label: 'Water Scheduling', icon: Droplets },
                  { id: 'bulk_selling', label: 'Bulk Sale & Logistics', icon: Truck },
                  { id: 'shared_finance', label: 'Ledger & Sustainability', icon: Coins },
                  { id: 'risk_alerts', label: 'Subsidies & Risks', icon: ShieldAlert },
                  { id: 'members', label: 'Farmer Roster', icon: Users },
                  { id: 'match', label: 'Smart Matches', icon: Compass },
                  { id: 'ai_advisor', label: 'Gemini Director', icon: Sparkles }
                ].map((tb) => {
                  const Icon = tb.icon;
                  const isActive = activeCoopTab === tb.id;
                  return (
                    <button
                      key={tb.id}
                      onClick={() => {
                        setActiveCoopTab(tb.id as any);
                        if (tb.id === 'ai_advisor') { requestGeminiAdvisory(); }
                      }}
                      className={`flex-1 text-center py-2 px-3 rounded-xl transition-all uppercase text-[9.5px] font-black tracking-wider flex items-center justify-center space-x-1 shrink-0 ${
                        isActive 
                          ? 'bg-emerald-700 text-white shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="whitespace-nowrap">{tb.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* VIEWS RENDERING */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                
                {/* A. Profile Pages */}
                {activeCoopTab === 'profile' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-white p-4 rounded-3xl border border-slate-150 space-y-3 shadow-xs">
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 font-extrabold px-3 py-0.5 rounded-full uppercase tracking-widest block w-max">
                        Group Intentions & Description
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                        {selectedCoop.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="bg-white p-4 rounded-3xl border border-slate-150 space-y-2.5 shadow-xs">
                        <span className="text-[9px] bg-blue-50 text-blue-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest block w-max">
                          System Specifications
                        </span>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between font-bold py-1 border-b">
                            <span className="text-slate-400">Primary Irrigation Method:</span>
                            <span className="text-slate-800 uppercase">{selectedCoop.irrigationType}</span>
                          </div>
                          <div className="flex justify-between font-bold py-1 border-b">
                            <span className="text-slate-400">District Focus:</span>
                            <span className="text-slate-800">{selectedCoop.district}</span>
                          </div>
                          <div className="flex justify-between font-bold py-1">
                            <span className="text-slate-400">Total Pooled Space:</span>
                            <span className="text-emerald-700 font-black">{selectedCoop.acreage} Acres</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-3xl border border-slate-150 space-y-2.5 shadow-xs">
                        <span className="text-[9px] bg-amber-50 text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest block w-max">
                          General Goals Focus
                        </span>
                        <div className="space-y-1">
                          {selectedCoop.farmingGoals.split(',').map((goal, idx) => (
                            <div key={idx} className="flex items-start text-xs font-bold text-slate-700">
                              <span className="text-teal-600 mr-1.5">✓</span>
                              <span className="capitalize">{goal.trim()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    <div className="bg-emerald-50/50 border border-emerald-100 p-4.5 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-3">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-emerald-950 uppercase">Ready to join your neighbor block?</h4>
                        <p className="text-[10px] text-emerald-700 font-bold">Secure automatic enrollments in real-time. Unjoin easily anytime.</p>
                      </div>

                      <div className="flex space-x-2 shrink-0">
                        {activeMembers.some(m => m.uid === userUid) ? (
                          <button 
                            onClick={() => handleLeaveCooperative(selectedCoop)}
                            className="bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs font-black px-4 py-2.5 rounded-xl uppercase tracking-wider outline-none active:scale-95 transition-all"
                          >
                            Leave Cooperative
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleJoinCooperative(selectedCoop)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black px-5 py-2.5 rounded-xl uppercase tracking-wider shadow-sm outline-none active:scale-95 transition-all"
                          >
                            Join Cooperative
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SHARED MACHINERY RENTAL */}
                {activeCoopTab === 'machinery' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* Header summary & trigger */}
                    <div className="bg-white p-4 rounded-3xl border border-slate-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-800 flex items-center space-x-1.5">
                          <Wrench className="w-4 h-4 text-emerald-700" />
                          <span>Machinery Pool Directory</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Rent tractors, sugar harvesters, and irrigation pumps within your block.</p>
                      </div>
                      <button
                        onClick={() => setShowAddMachinery(!showAddMachinery)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black uppercase px-3 py-2 rounded-xl flex items-center space-x-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{showAddMachinery ? 'Close form' : 'Register Machinery'}</span>
                      </button>
                    </div>

                    {/* Register Machinery Form */}
                    {showAddMachinery && (
                      <div className="bg-white p-4.5 rounded-3xl border-2 border-emerald-600 space-y-3.5 animate-fadeIn">
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider block w-max">
                          List Agricultural Fleet
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-700">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Machine Name</label>
                            <input
                              type="text"
                              value={machineryForm.name}
                              onChange={(e) => setMachineryForm({ ...machineryForm, name: e.target.value })}
                              placeholder="e.g. Preet Rotavator Heavy Gear"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Machine Type</label>
                            <select
                              value={machineryForm.type}
                              onChange={(e) => setMachineryForm({ ...machineryForm, type: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white"
                            >
                              {['Tractor', 'Harvester', 'Rotavator', 'Seed drill', 'Irrigation pump', 'Sprayer'].map(tType => (
                                <option key={tType} value={tType}>{tType}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Rental Price (₹)</label>
                            <input
                              type="number"
                              value={machineryForm.price}
                              onChange={(e) => setMachineryForm({ ...machineryForm, price: Number(e.target.value) || 0 })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Pricing Period</label>
                            <select
                              value={machineryForm.pricingPeriod}
                              onChange={(e) => setMachineryForm({ ...machineryForm, pricingPeriod: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white"
                            >
                              <option value="hourly">per Hour</option>
                              <option value="daily">per Day</option>
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={() => handleUploadMachinery(machineryForm)}
                          className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black uppercase text-[10px] tracking-wider rounded-xl transition-all"
                        >
                          Publish Fleet Listing
                        </button>
                      </div>
                    )}

                    {/* Fleet Directory Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {machineryList.map((mach) => {
                        const isOwner = mach.ownerUid === userUid;
                        return (
                          <div key={mach.id} className="bg-white border rounded-3xl overflow-hidden flex flex-col justify-between shadow-xs">
                            <div>
                              <img src={mach.image} alt={mach.name} className="w-full h-28 object-cover brightness-95" referralPolicy="no-referrer" />
                              <div className="p-3.5 space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[8.5px] bg-slate-100 text-slate-705 px-2 py-0.5 rounded-md font-bold uppercase">{mach.type}</span>
                                  <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase ${
                                    mach.status === 'available' ? 'bg-emerald-150 text-emerald-800' : mach.status === 'rented' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {mach.status}
                                  </span>
                                </div>
                                <h5 className="text-[12.5px] font-black text-slate-800 uppercase tracking-tight">{mach.name}</h5>
                                <span className="text-[9px] text-slate-400 font-bold block">Owner: {mach.ownerName}</span>
                              </div>
                            </div>

                            <div className="p-3.5 border-t bg-slate-50/50 flex justify-between items-center gap-2">
                              <div>
                                <span className="text-[8.5px] text-slate-400 font-black uppercase block leading-none">Rate Index</span>
                                <span className="text-[13.5px] font-black text-emerald-800">₹{mach.price} <span className="text-[9px] text-slate-400 font-bold">/{mach.pricingPeriod === 'hourly' ? 'hr' : 'day'}</span></span>
                              </div>

                              {isOwner ? (
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleUpdateMachineryStatus(mach.id, 'available')}
                                    className="bg-white hover:bg-slate-100 border text-[8.5px] font-black uppercase px-2 py-1.5 rounded-md text-emerald-800"
                                  >
                                    Uptime
                                  </button>
                                  <button
                                    onClick={() => handleUpdateMachineryStatus(mach.id, 'maintaining')}
                                    className="bg-white hover:bg-slate-100 border text-[8.5px] font-black uppercase px-2 py-1.5 rounded-md text-amber-800"
                                  >
                                    Service
                                  </button>
                                </div>
                              ) : (
                                mach.status === 'available' ? (
                                  <button
                                    onClick={() => {
                                      const start = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                                      const end = new Date(Date.now() + 172800000).toISOString().split('T')[0];
                                      handleBookMachinery(mach, start, end);
                                    }}
                                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-[9.5px] font-black uppercase px-3.5 py-2 rounded-xl transition-all"
                                  >
                                    Book Now
                                  </button>
                                ) : (
                                  <span className="text-[9.5px] font-black text-slate-400 uppercase italic">Not available</span>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bookings log */}
                    {machineryBookings.length > 0 && (
                      <div className="bg-white p-4.5 rounded-3xl border border-slate-150 space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cooperative Booking Log</h4>
                        <div className="space-y-2">
                          {machineryBookings.map((bk) => {
                            const isMachOwner = bk.ownerUid === userUid;
                            return (
                              <div key={bk.id} className="p-3 border rounded-2xl flex justify-between items-center text-xs text-slate-700 font-bold bg-slate-50/40">
                                <div>
                                  <h6 className="font-extrabold uppercase text-slate-800 leading-tight">{bk.machineryName}</h6>
                                  <span className="text-[9.5px] text-slate-400 block mt-0.5">Renter: {bk.renterName} • Period: {bk.startDate} to {bk.endDate}</span>
                                </div>
                                <div className="text-right flex flex-col items-end space-y-1">
                                  <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase ${
                                    bk.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : bk.status === 'pending' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-slate-100 text-slate-400'
                                  }`}>
                                    {bk.status}
                                  </span>

                                  {isMachOwner && bk.status === 'pending' && (
                                    <div className="flex space-x-1.5 mt-1">
                                      <button
                                        onClick={() => handleUpdateBookingStatus(bk, 'approved')}
                                        className="bg-emerald-700 text-white text-[8px] font-extrabold uppercase px-2 py-1 rounded-md"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleUpdateBookingStatus(bk, 'rejected')}
                                        className="bg-red-600 text-white text-[8px] font-extrabold uppercase px-2 py-1 rounded-md"
                                      >
                                        Decline
                                      </button>
                                    </div>
                                  )}
                                  
                                  {isMachOwner && bk.status === 'approved' && (
                                    <button
                                      onClick={() => handleUpdateBookingStatus(bk, 'completed')}
                                      className="bg-slate-700 text-white text-[8px] font-extrabold uppercase px-2 py-1 rounded-md mt-1"
                                    >
                                      Mark Returned
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* LABOR HIRING SYSTEM */}
                {activeCoopTab === 'labor' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* Header summary & trigger */}
                    <div className="bg-white p-4 rounded-3xl border border-slate-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-800 flex items-center space-x-1.5">
                          <Briefcase className="w-4 h-4 text-emerald-700" />
                          <span>Seasonal Labor Exchange</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Pool hand laborers during intensive harvest cycles and share seasonal expenses.</p>
                      </div>
                      <button
                        onClick={() => setShowAddLabor(!showAddLabor)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black uppercase px-3 py-2 rounded-xl flex items-center space-x-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{showAddLabor ? 'Close request' : 'Raise Hiring Request'}</span>
                      </button>
                    </div>

                    {/* Hiring Request Form */}
                    {showAddLabor && (
                      <div className="bg-white p-4.5 rounded-3xl border-2 border-emerald-600 space-y-3.5 animate-fadeIn">
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider block w-max">
                          Post Cooperative Labor Demand
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-700">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Target Crop Type</label>
                            <input
                              type="text"
                              value={laborForm.cropType}
                              onChange={(e) => setLaborForm({ ...laborForm, cropType: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Labor Duty Category</label>
                            <select
                              value={laborForm.laborType}
                              onChange={(e) => setLaborForm({ ...laborForm, laborType: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white"
                            >
                              {['Harvest workers', 'Spraying workers', 'Irrigation workers', 'Seasonal labor', 'Emergency labor'].map(lType => (
                                <option key={lType} value={lType}>{lType}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Wage Per Day (₹)</label>
                            <input
                              type="number"
                              value={laborForm.wagePerDay}
                              onChange={(e) => setLaborForm({ ...laborForm, wagePerDay: Number(e.target.value) || 0 })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Workers Capital Pool Needed</label>
                            <input
                              type="number"
                              value={laborForm.workersNeeded}
                              onChange={(e) => setLaborForm({ ...laborForm, workersNeeded: Number(e.target.value) || 1 })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Duration Needed</label>
                            <input
                              type="text"
                              value={laborForm.duration}
                              onChange={(e) => setLaborForm({ ...laborForm, duration: e.target.value })}
                              placeholder="e.g. 4 days"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white"
                            />
                          </div>

                          <div className="space-y-1 flex items-center pt-5">
                            <input
                              type="checkbox"
                              id="emergency_check"
                              checked={laborForm.emergencyPriority}
                              onChange={(e) => setLaborForm({ ...laborForm, emergencyPriority: e.target.checked })}
                              className="w-4 h-4 text-emerald-700 accent-emerald-700 mr-2 rounded cursor-pointer"
                            />
                            <label htmlFor="emergency_check" className="text-[10px] font-black uppercase text-red-600 cursor-pointer select-none">Mark High Priority / Emergency</label>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCreateLaborRequest(laborForm)}
                          className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black uppercase text-[10px] tracking-wider rounded-xl transition-all"
                        >
                          Recruit Cooperative Assistants
                        </button>
                      </div>
                    )}

                    {/* Hiring Board Grid Listings */}
                    <div className="space-y-3">
                      {laborRequests.map((req) => {
                        const isCreator = req.creatorUid === userUid;
                        const hasApplied = (req.applicants || []).some((a: any) => a.uid === userUid);
                        const isAccepted = (req.acceptedWorkers || []).some((w: any) => w.uid === userUid);
                        
                        return (
                          <div key={req.id} className={`bg-white border p-4 rounded-3xl space-y-3.5 shadow-xs relative overflow-hidden ${
                            req.emergencyPriority ? 'border-l-4 border-l-red-500' : ''
                          }`}>
                            
                            {req.emergencyPriority && (
                              <span className="absolute top-2 right-2 text-[8px] bg-red-50 text-red-700 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse border border-red-100">
                                Emergency Priority
                              </span>
                            )}

                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="text-[9.5px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-extrabold uppercase">
                                  {req.laborType}
                                </span>
                                <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                                  req.status === 'open' ? 'bg-emerald-100 text-emerald-800' : req.status === 'filled' ? 'bg-indigo-150 text-indigo-800' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {req.status === 'open' ? 'Open for helpers' : req.status === 'filled' ? 'Pool limit met' : 'completed'}
                                </span>
                              </div>
                              
                              <h5 className="text-[12.5px] sm:text-[13.5px] font-black text-slate-800 uppercase tracking-tight mt-1">
                                Need {req.workersNeeded} workers for {req.cropType} cycle
                              </h5>
                              
                              <div className="mt-2.5 grid grid-cols-2 text-[10.5px] font-semibold text-slate-400 gap-y-1">
                                <div>📍 Location: <span className="text-slate-800 uppercase font-black">{req.location}</span></div>
                                <div>⏰ Duration: <span className="text-slate-800">{req.duration}</span></div>
                                <div>💵 Daily wage: <span className="text-emerald-700 font-extrabold">₹{req.wagePerDay}/day</span></div>
                                <div>👤 Posted by: <span className="text-slate-800 uppercase">{req.creatorName}</span></div>
                              </div>
                            </div>

                            {/* Action rows */}
                            <div className="pt-2 border-t flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                              
                              {/* Roster state count */}
                              <div className="text-[10px] font-bold text-slate-500">
                                helper workforce: <span className="text-slate-850 font-black">{(req.acceptedWorkers || []).length} of {req.workersNeeded}</span>
                                {(req.acceptedWorkers || []).length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {(req.acceptedWorkers || []).map((w: any) => (
                                      <span key={w.uid} className="bg-emerald-50 text-emerald-800 text-[8.5px] px-1.5 py-0.5 rounded font-black">👤 {w.name} (Joined)</span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div>
                                {isCreator ? (
                                  req.status !== 'completed' ? (
                                    <button
                                      onClick={() => handleCompleteLaborRequest(req.id)}
                                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all w-full sm:w-auto"
                                    >
                                      Mark harvest complete
                                    </button>
                                  ) : (
                                    <span className="text-[9px] bg-slate-100 text-slate-400 font-black uppercase px-2 py-1 rounded">Task Closed</span>
                                  )
                                ) : (
                                  req.status === 'open' && (
                                    isAccepted ? (
                                      <span className="text-[9.5px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg font-black uppercase tracking-wider">Accepted helper!</span>
                                    ) : hasApplied ? (
                                      <span className="text-[9.5px] text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg font-black uppercase tracking-wider animate-pulse">Position pending...</span>
                                    ) : (
                                      <button
                                        onClick={() => handleApplyForLabor(req)}
                                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-[9.5px] font-black uppercase px-3.5 py-2 rounded-xl transition-all w-full sm:w-auto"
                                      >
                                        Apply for this position
                                      </button>
                                    )
                                  )
                                )}
                              </div>
                            </div>

                            {/* Applicants list only visible to the creator */}
                            {isCreator && (req.applicants || []).length > 0 && (
                              <div className="bg-slate-50 p-3 rounded-2xl space-y-1.5 text-xs text-slate-700 font-bold mt-2">
                                <h6 className="text-[9.5px] font-extrabold uppercase text-slate-400">Available applicants:</h6>
                                <div className="space-y-1.5">
                                  {(req.applicants || []).map((app: any) => (
                                    <div key={app.uid} className="flex justify-between items-center bg-white p-2 rounded-xl border">
                                      <span>👤 {app.name}</span>
                                      <button
                                        onClick={() => handleAcceptWorker(req, app)}
                                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-[8.5px] font-black uppercase px-2 py-1 rounded"
                                      >
                                        Approve
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SMART IRRIGATION PRECISION SYSTEM */}
                {activeCoopTab === 'irrigation' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* Header info bar */}
                    <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-4.5 rounded-3xl space-y-2 relative overflow-hidden">
                      <div className="flex items-center space-x-1.5">
                        <Droplets className="w-5 h-5 text-blue-300 animate-bounce" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-blue-200">Shared Borewell & Water Grid</h4>
                      </div>
                      <p className="text-[10px] text-indigo-100 font-semibold leading-relaxed">
                        Schedule Shared Borewell lines, tracking rain alerts and system loads using water flow grids. Prevents voltage sag conflicts.
                      </p>
                    </div>

                    {/* Scientific Warnings and Smart Real-time Alerts */}
                    <div className="bg-white p-4 rounded-3xl border border-slate-150 space-y-3">
                      <span className="text-[9px] bg-red-50 text-red-700 font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider block w-max">
                        Village Precision Warnings (Water Level Indexes)
                      </span>
                      <div className="space-y-2">
                        {irrigationAlerts.map(alt => (
                          <div key={alt.id} className={`p-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold ${
                            alt.category === 'weather' ? 'bg-blue-50 text-blue-900 border border-blue-100' :
                            alt.category === 'borewell_conflict' ? 'bg-amber-50 text-amber-900 border border-amber-100 animate-pulse' :
                            'bg-emerald-50 text-emerald-900 border border-emerald-100'
                          }`}>
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-[11px] font-black uppercase leading-none">{alt.type}</strong>
                              <p className="mt-1 leading-relaxed text-[10.5px] font-bold">{alt.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timing reservation trigger */}
                    <div className="bg-white p-4 rounded-3xl border border-slate-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h5 className="text-xs font-black uppercase text-slate-805">Water line reservation logs</h5>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Prevent pump dry runs and line leaks by reservation.</p>
                      </div>
                      <button
                        onClick={() => setShowAddIrrigation(!showAddIrrigation)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black uppercase px-3.5 py-2 rounded-xl flex items-center space-x-1 sm:ml-auto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Reserve Line Slot</span>
                      </button>
                    </div>

                    {/* Reservation Form */}
                    {showAddIrrigation && (
                      <div className="bg-white p-4.5 rounded-3xl border-2 border-emerald-600 space-y-3 animate-fadeIn">
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider block w-max">
                          Water Schedule Register
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-700">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Field Sector Code</label>
                            <input
                              type="text"
                              value={irrigationForm.fieldArea}
                              onChange={(e) => setIrrigationForm({ ...irrigationForm, fieldArea: e.target.value })}
                              placeholder="e.g. North Ridge 2"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Start Time</label>
                            <input
                              type="datetime-local"
                              value={irrigationForm.startTime}
                              onChange={(e) => setIrrigationForm({ ...irrigationForm, startTime: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none font-sans font-bold focus:bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Cycle Duration (Minutes)</label>
                            <input
                              type="number"
                              value={irrigationForm.durationMinutes}
                              onChange={(e) => setIrrigationForm({ ...irrigationForm, durationMinutes: Number(e.target.value) || 0 })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Water Resource Source</label>
                            <select
                              value={irrigationForm.waterSource}
                              onChange={(e) => setIrrigationForm({ ...irrigationForm, waterSource: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:bg-white"
                            >
                              {['Borewell 1', 'Borewell 2', 'Canal Channel', 'Rainwater Tank'].map(source => (
                                <option key={source} value={source}>{source}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddIrrigationSchedule(irrigationForm)}
                          className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black uppercase text-[10px] tracking-wider rounded-xl transition-all"
                        >
                          Establish Reservoir Reservation
                        </button>
                      </div>
                    )}

                    {/* Reservations logs board */}
                    <div className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-xs">
                      <div className="bg-slate-100 p-3 flex justify-between items-center border-b">
                        <span className="text-[9px] font-black uppercase text-slate-500">Active Allocations Line Roster</span>
                        <span className="text-[9.5px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-black uppercase">Verified APMC grids</span>
                      </div>

                      {irrigationSchedules.length === 0 ? (
                        <p className="p-10 text-center text-xs text-slate-400 font-semibold italic">No active water schedules registered for this sector.</p>
                      ) : (
                        <div className="divide-y border-t">
                          {irrigationSchedules.map((sch) => (
                            <div key={sch.id} className="p-3.5 flex justify-between items-center text-xs text-slate-750 font-bold bg-emerald-50/5 hover:bg-emerald-50/10">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-1.5">
                                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                                  <span className="font-extrabold uppercase text-slate-800">{sch.fieldArea} ({sch.waterSource})</span>
                                </div>
                                <span className="text-[10px] text-slate-400 block font-black">Planned: {new Date(sch.startTime).toLocaleString()}</span>
                              </div>

                              <div className="text-right">
                                <span className="text-[10.5px] bg-blue-50 text-blue-800 font-extrabold px-2.5 py-1 rounded-md block w-max ml-auto">{sch.durationMinutes} mins</span>
                                <span className="text-[9px] text-slate-400 font-bold mt-0.5 block uppercase">Reserved: {sch.farmerName}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* B. WhatsApp-like Group Chat */}
                {activeCoopTab === 'chat' && (
                  <div className="flex flex-col h-[320px] md:h-[420px] bg-white rounded-3xl border border-slate-200 overflow-hidden relative">
                    
                    {/* List Area */}
                    <div id="chat-scrollbox" className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col">
                      {activeChats.length === 0 ? (
                        <div className="text-center py-10 space-y-2">
                          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto animate-pulse" />
                          <h5 className="text-[11px] font-black text-slate-500">Realtime Chat Channel</h5>
                          <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto font-medium">No messages published yet. Type below to consult with your cooperative group.</p>
                        </div>
                      ) : (
                        activeChats.map((msg) => {
                          const isMe = msg.senderUid === userUid;
                          return (
                            <div key={msg.id} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                              <span className="text-[9.5px] text-slate-400 font-black mb-1">{msg.senderName} {isMe && '(You)'}</span>
                              <div className={`p-3 rounded-2xl text-xs space-y-1.5 ${
                                isMe 
                                  ? 'bg-gradient-to-tr from-emerald-800 to-emerald-750 text-white rounded-tr-none' 
                                  : 'bg-slate-100 text-slate-800 rounded-tl-none border'
                              }`}>
                                {msg.imageUrl && <img src={msg.imageUrl} alt="Shared foliage" className="rounded-xl max-h-40 max-w-full object-cover mb-1" />}
                                {msg.voiceUrl && (
                                  <div className="flex items-center space-x-1.5 bg-black/10 py-1.5 px-2.5 rounded-xl w-max">
                                    <Volume2 className="w-4 h-4 text-emerald-300 animate-bounce" />
                                    <span className="text-[8px] font-black uppercase tracking-wider text-emerald-200">Advisory Speech attached</span>
                                  </div>
                                )}
                                <p className="font-semibold leading-relaxed leading-snug break-words">{msg.content}</p>
                                
                                {msg.translatedContent && (
                                  <div className="p-2 border-t border-dashed border-white/20 mt-1 pb-0.5 text-[10px] text-yellow-200 italic font-medium">
                                    <span className="text-[8px] font-bold block uppercase not-italic text-emerald-300">Translation:</span>
                                    {msg.translatedContent}
                                  </div>
                                )}

                                {!msg.translatedContent && (
                                  <button 
                                    onClick={() => translateMessageText(msg.id, msg.content)}
                                    className="text-[9px] font-black uppercase text-yellow-300 hover:underline tracking-wider text-left block"
                                  >
                                    Translate 🌐
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Pending attachments layout previews */}
                    {(voiceBase64 || imageBase64) && (
                      <div className="bg-emerald-50 p-2.5 border-t border-emerald-100 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-800 font-extrabold uppercase">✓ Document/Signal asset attached! Click Send.</span>
                        <button onClick={() => { setVoiceBase64(null); setImageBase64(null); }} className="text-red-650 font-bold hover:underline">Clear</button>
                      </div>
                    )}

                    {/* Toolbar controller inputs */}
                    <div className="p-2.5 bg-slate-50 border-t flex items-center space-x-1.5 shrink-0">
                      <button 
                        onClick={handlePhotoSimulation}
                        className="w-8.5 h-8.5 rounded-xl bg-white hover:bg-slate-100 border flex items-center justify-center outline-none shrink-0"
                        title="Attach crop photo"
                      >
                        📸
                      </button>
                      <button 
                        onClick={handleVoiceSimulation}
                        className={`w-8.5 h-8.5 rounded-xl border flex items-center justify-center outline-none shrink-0 ${isRecordingMsg ? 'bg-red-500 animate-ping text-white' : 'bg-white hover:bg-slate-100'}`}
                        title="Record native audio"
                      >
                        🎙️
                      </button>
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                        placeholder="Type group message in any language..."
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                      />
                      <button 
                        onClick={handleSendChatMessage}
                        className="p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl flex items-center justify-center cursor-pointer outline-none active:scale-95 transition-all"
                      >
                        <Send className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>

                  </div>
                )}

                {/* C. Roster and member management */}
                {activeCoopTab === 'members' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center pb-1.5 border-b">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Group Members ({activeMembers.length})</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeMembers.map((member) => (
                        <div key={member.id} className="bg-white p-3 border rounded-2xl flex justify-between items-center shadow-xs">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                              {member.name.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-black text-slate-800">{member.name}</span>
                                {member.role === 'creator' && <span className="text-[8px] font-black uppercase text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-md">Creator</span>}
                              </div>
                              <span className="text-[9px] text-slate-400 block font-semibold leading-none">{member.village}, {member.district}</span>
                            </div>
                          </div>
                          
                          <div className="text-right text-[10px] text-slate-500 leading-tight">
                            <span className="block font-black text-emerald-800">🌱 {member.crop}</span>
                            <span className="block">{member.irrigationType} System</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* D. Smart Matches & Invites */}
                {activeCoopTab === 'match' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-white p-4.5 rounded-3xl border border-slate-150 space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-900">
                        <Compass className="w-5 h-5 text-emerald-700 animate-spin" />
                        <h4 className="text-xs font-black uppercase">{t.prospects}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                        {t.prospectsDesc} My District: <strong className="text-emerald-700 font-extrabold">{selectedCoop.district}</strong>. My Crop Focus: <strong className="text-emerald-700 font-extrabold">{selectedCoop.cropFocus}</strong>.
                      </p>
                      
                      {/* Active Invites Pending status */}
                      {activeInvites.length > 0 && (
                        <div className="bg-amber-50 p-3 rounded-2xl mt-1 border border-amber-100">
                          <span className="text-[8.5px] font-black uppercase text-amber-800 tracking-wider flex items-center">
                            <Megaphone className="w-3.5 h-3.5 mr-1" /> Pending Invitations dispatched
                          </span>
                          <div className="space-y-1.5 mt-2">
                            {activeInvites.map((invite) => (
                              <div key={invite.id} className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                                <span className="text-amber-900">👤 {invite.toName}</span>
                                <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full ${
                                  invite.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                                }`}>
                                  {invite.status === 'accepted' ? 'Joined!' : 'Awaiting APMC validation...'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Prospect filters bar */}
                    <div className="bg-slate-100 p-2 rounded-2xl flex flex-wrap gap-2 text-[10px] font-sans font-bold">
                      <button 
                        onClick={() => { setCropFilter(selectedCoop.cropFocus); triggerToast('Filtered by same crop focus!'); }}
                        className="bg-white px-3 py-1.5 rounded-lg border hover:bg-slate-50 flex items-center space-x-1"
                      >
                        <span>Same Crop Focus ({selectedCoop.cropFocus})</span>
                      </button>
                      <button 
                        onClick={() => { setDistrictFilter(selectedCoop.district); triggerToast('Filtered by same district path!'); }}
                        className="bg-white px-3 py-1.5 rounded-lg border hover:bg-slate-50 flex items-center space-x-1"
                      >
                        <span>Same District ({selectedCoop.district})</span>
                      </button>
                      <button 
                        onClick={() => { setCropFilter('all'); setDistrictFilter('all'); triggerToast('Filters reset.'); }}
                        className="bg-slate-200 px-3 py-1.5 rounded-lg border-none hover:bg-slate-300"
                      >
                        Reset filters
                      </button>
                    </div>

                    {/* Matches List Grid */}
                    <div className="space-y-3">
                      {filteredProspects.map((farmer) => {
                        const isJoined = activeMembers.some(m => m.uid === farmer.uid);
                        const isSent = activeInvites.some(i => i.toUid === farmer.uid && i.status === 'sent');
                        return (
                          <div key={farmer.uid} className="bg-white p-3.5 border-2 border-slate-150 rounded-3xl flex justify-between items-center gap-3">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{farmer.avatar}</span>
                              <div>
                                <h5 className="text-[12.5px] font-black text-slate-800 uppercase leading-none">{farmer.name}</h5>
                                <span className="text-[9px] text-slate-400 block mt-1 font-bold">📍 {farmer.village}, {farmer.district}</span>
                                <span className="text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-extrabold mt-1 inline-block uppercase">
                                  {getMatchScoreText(farmer)}
                                </span>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end space-y-2">
                              <div className="text-[10px] font-bold text-slate-500">
                                <span className="block font-black text-slate-800">🌱 {farmer.crop}</span>
                                <span className="block">{farmer.acreage} Acres • {farmer.irrigationType}</span>
                              </div>

                              <button 
                                onClick={() => handleInviteFarmer(farmer)}
                                disabled={isJoined || isSent}
                                className={`text-[9px] font-black uppercase tracking-wider py-1.5 px-3 rounded-xl flex items-center space-x-1 outline-none ${
                                  isJoined 
                                    ? 'bg-slate-100 text-slate-400' 
                                    : isSent 
                                      ? 'bg-amber-100 text-amber-800 animate-pulse' 
                                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                }`}
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>{isJoined ? 'Enrolled' : isSent ? 'Invited' : 'Recruit'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* E. AI Adviser Opportunity calculations */}
                {activeCoopTab === 'ai_advisor' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-indigo-950 text-white p-4.5 rounded-3xl space-y-2 relative overflow-hidden">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                        <h4 className="text-xs font-black uppercase tracking-wider">Gemini Coop Director</h4>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-indigo-200 font-semibold leading-relaxed">
                        Assess optimal machine uptime, track expected compound crop savings percentages, and parse bulk APMC marketing strategies utilizing our digital Gemini model.
                      </p>
                    </div>

                    {(isAiLoading || aiReport) && (
                      <div className="bg-white p-4 rounded-3xl border border-indigo-100 shadow-xl space-y-2 relative">
                        <div className="flex justify-between items-center border-b pb-2 text-[9px] font-black uppercase text-indigo-700">
                          <span>Gemini Consultation Report ({currentLang.toUpperCase()})</span>
                          {isAiLoading && <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />}
                        </div>
                        
                        {aiReport ? (
                          <p className="text-xs text-slate-700 font-semibold leading-relaxed whitespace-pre-wrap">
                            {aiReport}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Gemini is processing alliance configurations...</p>
                        )}
                      </div>
                    )}

                    <div className="bg-white p-4 rounded-3xl border border-slate-150 space-y-2">
                      <h4 className="text-[10px] font-black uppercase text-indigo-900 tracking-wider">Ask Specialized Cooperative Doubts</h4>
                      <div className="flex space-x-2">
                        <input 
                          type="text" 
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && requestCustomGeminiPrompt()}
                          placeholder="e.g. How do 5 farmers share water lines fairly?"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                        />
                        <button 
                          onClick={requestCustomGeminiPrompt}
                          disabled={isAiLoading}
                          className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all"
                        >
                          Ask AI
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeCoopTab === 'bulk_selling' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* A. Bulk Harvest Pool section */}
                    <div className="bg-white p-4.5 rounded-3xl border border-slate-200/95 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[9px] bg-emerald-50 text-emerald-800 font-extrabold px-3 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                            Feature 6 • Market Aggregator
                          </span>
                          <h4 className="text-xs sm:text-sm font-black uppercase text-slate-800 mt-1">Pooled Harvest Inventories</h4>
                        </div>
                        <button
                          onClick={() => setShowAddHarvest(!showAddHarvest)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all"
                        >
                          {showAddHarvest ? 'Close Form' : 'Pool Harvest +'}
                        </button>
                      </div>

                      {showAddHarvest && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-250/60 text-xs space-y-3">
                          <h5 className="font-bold text-slate-700">Contribute New Crop Batch</h5>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] uppercase font-black text-slate-500 block mb-1 font-mono">Crop Type</label>
                              <input
                                type="text"
                                value={harvestForm.crop}
                                onChange={(e) => setHarvestForm({ ...harvestForm, crop: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-black text-slate-500 block mb-1 font-mono">Quantity (Kg)</label>
                              <input
                                type="number"
                                value={harvestForm.quantityKg}
                                onChange={(e) => setHarvestForm({ ...harvestForm, quantityKg: Number(e.target.value) })}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono font-bold outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-black text-slate-500 block mb-1 font-mono">Target Price (Rs/Kg)</label>
                              <input
                                type="number"
                                value={harvestForm.expectedPricePerKg}
                                onChange={(e) => setHarvestForm({ ...harvestForm, expectedPricePerKg: Number(e.target.value) })}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono font-bold outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-black text-slate-500 block mb-1 font-mono">Quality Grade</label>
                              <select
                                value={harvestForm.qualityGrade}
                                onChange={(e) => setHarvestForm({ ...harvestForm, qualityGrade: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold outline-none"
                              >
                                <option>Grade-A Premium</option>
                                <option>Grade-B Medium</option>
                                <option>Organic Verified Grade</option>
                              </select>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCreatePooledHarvest(harvestForm)}
                            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black uppercase tracking-wider py-2 rounded-xl transition-all"
                          >
                            Add To Cooperative Bulk Block
                          </button>
                        </div>
                      )}

                      <div className="space-y-3.5">
                        {pooledHarvests.map((pool) => {
                          const userContrib = (pool.contributors || []).find((c: any) => c.uid === userUid);
                          const totalContribs = (pool.contributors || []).length;
                          return (
                            <div key={pool.id} className="bg-slate-50 p-4 rounded-2.5xl border border-slate-150 space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full ${
                                    pool.status === 'sold' ? 'bg-indigo-100 text-indigo-800' :
                                    pool.status === 'negotiating' ? 'bg-orange-100 text-orange-850' : 'bg-emerald-50 text-emerald-850'
                                  }`}>
                                    {pool.status.toUpperCase()}
                                  </span>
                                  <h5 className="font-extrabold text-slate-800 text-sm mt-1">{pool.crop} Pool Block</h5>
                                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Grade: {pool.qualityGrade}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Pooled weight</span>
                                  <span className="text-sm font-black text-emerald-800 font-mono">{(pool.quantityKg || 0).toLocaleString()} Kg</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 bg-white/70 p-2.5 rounded-xl border border-slate-200/50 text-slate-700 text-xs">
                                <div>
                                  <span className="text-[9.5px] font-bold text-slate-400 block uppercase font-mono">Est. Transport Cost</span>
                                  <span className="font-mono font-bold text-slate-700">Rs. {(pool.transportEst || 0).toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-[9.5px] font-bold text-slate-400 block uppercase font-mono">Expected Revenue</span>
                                  <span className="font-mono font-bold text-slate-800 font-black">Rs. {(pool.profitEst || 0).toLocaleString()}</span>
                                </div>
                              </div>

                              {/* Contributors checklist */}
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[9.5px] font-extrabold text-slate-500 uppercase tracking-widest block font-mono">
                                  {totalContribs} Cooperative Contributors
                                </span>
                                <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1">
                                  {(pool.contributors || []).map((c: any, index: number) => (
                                    <div key={index} className="bg-white px-2.5 py-1 rounded-full border border-slate-200 flex items-center space-x-1 sm:space-x-1.5 shrink-0">
                                      <span className="text-[10.5px]">👨‍🌾</span>
                                      <span className="text-[10px] text-slate-600 font-black">{c.name}</span>
                                      <span className="text-[10px] text-emerald-800 font-mono font-black border-l pl-1 sm:pl-1.5">{c.contributionKg} Kg</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Operations buttons */}
                              {pool.status !== 'sold' && (
                                <div className="border-t pt-3 flex gap-2">
                                  <div className="flex-1 flex space-x-1 bg-white p-1 rounded-xl border">
                                    <input
                                      id={`contrib-input-${pool.id}`}
                                      type="number"
                                      placeholder="Contribute (kg)"
                                      className="w-full bg-transparent px-2.5 py-1 text-xs outline-none font-mono font-bold"
                                    />
                                    <button
                                      onClick={() => {
                                        const input = document.getElementById(`contrib-input-${pool.id}`) as HTMLInputElement;
                                        if (input && input.value) {
                                          handleContributeToHarvest(pool, Number(input.value));
                                          input.value = '';
                                        } else {
                                          triggerToast('Provide weight in kilograms first!');
                                        }
                                      }}
                                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-[9.5px] font-black uppercase tracking-wider px-3 py-1 rounded-lg shrink-0 transition-all"
                                    >
                                      Add Weight
                                    </button>
                                  </div>

                                  {userUid === selectedCoop.creatorUid && (
                                    <div className="flex space-x-1 shrink-0">
                                      {pool.status === 'open' && (
                                        <button
                                          onClick={() => handleNegotiateDirectSale(pool.id)}
                                          className="bg-amber-653 hover:bg-amber-700 text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-2 rounded-xl transition-all font-mono"
                                        >
                                          Mandi Bypass
                                        </button>
                                      )}
                                      {pool.status === 'negotiating' && (
                                        <button
                                          onClick={() => handleFinalizeBulkSale(pool.id)}
                                          className="bg-indigo-700 hover:bg-indigo-850 text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-2 rounded-xl transition-all font-mono"
                                        >
                                          Lock Deal
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* B. Logistics Coordination section */}
                    <div className="bg-white p-4.5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[9px] bg-sky-50 text-sky-850 font-extrabold px-3 py-0.5 rounded-full uppercase tracking-widest">
                            Feature 7 • Transportation
                          </span>
                          <h4 className="text-xs sm:text-sm font-black uppercase text-slate-800 mt-1">Carriage Route Splitting</h4>
                        </div>
                        <button
                          onClick={() => setShowAddTransport(!showAddTransport)}
                          className="bg-sky-700 hover:bg-sky-800 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all"
                        >
                          {showAddTransport ? 'Close Form' : 'Order Carriage +'}
                        </button>
                      </div>

                      {showAddTransport && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-250/60 text-xs space-y-3">
                          <h5 className="font-bold text-slate-700">Lease Cooperative Transport Vehicle</h5>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="col-span-2">
                              <label className="text-[10px] uppercase font-black text-slate-500 block mb-1">Vehicle Type & Spec</label>
                              <input
                                type="text"
                                value={transportForm.vehicleType}
                                onChange={(e) => setTransportForm({ ...transportForm, vehicleType: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-black text-slate-500 block mb-1">Driver Name</label>
                              <input
                                type="text"
                                value={transportForm.driverName}
                                onChange={(e) => setTransportForm({ ...transportForm, driverName: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-black text-slate-500 block mb-1">Contact Phone</label>
                              <input
                                type="text"
                                value={transportForm.contact}
                                onChange={(e) => setTransportForm({ ...transportForm, contact: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-black text-slate-500 block mb-1">Capacity Tons</label>
                              <input
                                type="number"
                                step="0.1"
                                value={transportForm.capacityTons}
                                onChange={(e) => setTransportForm({ ...transportForm, capacityTons: Number(e.target.value) })}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-black text-slate-500 block mb-1">Price per Km (Rs.)</label>
                              <input
                                type="number"
                                value={transportForm.priceKm}
                                onChange={(e) => setTransportForm({ ...transportForm, priceKm: Number(e.target.value) })}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold outline-none"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="text-[10px] uppercase font-black text-slate-500 block mb-1">Destination Route specs</label>
                              <input
                                type="text"
                                value={transportForm.routeSpec}
                                onChange={(e) => setTransportForm({ ...transportForm, routeSpec: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold outline-none"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleCreateTransportBooking(transportForm)}
                            className="w-full bg-sky-700 hover:bg-sky-800 text-white text-[10px] font-black uppercase tracking-wider py-2 rounded-xl transition-all"
                          >
                            Securing Transport Carriage
                          </button>
                        </div>
                      )}

                      <div className="space-y-3">
                        {transportBookings.map((vehicle) => {
                          const userSharing = (vehicle.sharedWith || []).includes(userName);
                          const routeShareCount = (vehicle.sharedWith || []).length;
                          return (
                            <div key={vehicle.id} className="bg-slate-50 p-4 rounded-2.5xl border border-slate-150 space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full ${
                                    vehicle.status === 'transit' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-emerald-50 text-emerald-800'
                                  }`}>
                                    {vehicle.status.toUpperCase()}
                                  </span>
                                  <h5 className="font-extrabold text-slate-700 text-sm mt-1">{vehicle.vehicleType}</h5>
                                  <p className="text-[10.5px] font-black text-slate-400 uppercase mt-0.5 font-mono">Route: {vehicle.routeSpec}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Capacity Limit</span>
                                  <span className="text-xs font-black text-sky-850 font-mono">{vehicle.capacityTons} Tons Max</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 bg-white/70 p-2 text-xs border rounded-xl">
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold block uppercase font-mono">Driver Name • Contact</span>
                                  <span className="font-semibold text-slate-700">{vehicle.driverName} ({vehicle.contact})</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold block uppercase font-mono">Rate sharing per Km</span>
                                  <span className="font-mono font-black text-slate-800">Rs. {vehicle.priceKm}/Km</span>
                                </div>
                              </div>

                              {/* Route sharing details */}
                              <div className="space-y-1">
                                <span className="text-[9px] font-black leading-tight uppercase tracking-widest text-slate-400 block font-mono">
                                  {routeShareCount} Shared Route Allocations
                                </span>
                                {routeShareCount > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {(vehicle.sharedWith || []).map((name: string, i: number) => (
                                      <span key={i} className="text-[9px] bg-sky-50 text-sky-900 border border-sky-100 px-2 py-0.5 rounded-md font-bold font-mono">
                                        🚚 {name}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-slate-400 italic">No co-op farmers sharing this truck path yet.</p>
                                )}
                              </div>

                              <div className="border-t pt-3 flex justify-between items-center text-xs">
                                <div className="text-[10px] text-slate-500 font-mono">
                                  ETA: <span className="font-bold text-slate-700">{vehicle.eta || 'Standard scheduled'}</span>
                                </div>
                                <button
                                  onClick={() => handleToggleShareTransportRoute(vehicle.id)}
                                  className={`text-[9.5px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all ${
                                    userSharing 
                                      ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200' 
                                      : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200'
                                  }`}
                                >
                                  {userSharing ? 'Drop Route Split' : 'Collectively Join Split Route'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* C. Strategic Storage section */}
                    <div className="bg-white p-4.5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                      <div>
                        <span className="text-[9px] bg-amber-50 text-amber-800 font-extrabold px-3 py-0.5 rounded-full uppercase tracking-widest font-mono">
                          Feature 8 • Delay Strategic Selling
                        </span>
                        <h4 className="text-xs sm:text-sm font-black uppercase text-slate-800 mt-1">APMC Price Crash Cold Storage Space</h4>
                      </div>

                      <div className="space-y-3">
                        {warehouseStorage.map((slot) => {
                          return (
                            <div key={slot.id} className="bg-slate-50 p-4 rounded-2.5xl border border-slate-150 space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-slate-250 text-slate-800">
                                    {slot.type === 'cold' ? '❄️ High-efficiency Cold Room' : '🌾 Dry Aerated Grain Silo'}
                                  </span>
                                  <h5 className="font-extrabold text-slate-700 text-sm mt-1">{slot.name}</h5>
                                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Compatible: {slot.cropTypeAllowed}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Reserve Rate</span>
                                  <span className="text-xs font-black text-amber-800 font-mono">Rs. {slot.basePricePerTonDay}/Ton/Day</span>
                                </div>
                              </div>

                              <div className="relative w-full h-2 bg-slate-250 rounded-full overflow-hidden">
                                <div 
                                  className="absolute top-0 left-0 h-full bg-amber-500 rounded-full animate-pulse"
                                  style={{ width: `${(slot.bookedTons / (slot.capacityAvailableTons + slot.bookedTons)) * 100}%` }}
                                />
                              </div>

                              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 font-mono">
                                <span>Booked: {slot.bookedTons} Tons</span>
                                <span>Available: {slot.capacityAvailableTons} Tons Left</span>
                              </div>

                              <div className="border-t pt-3 flex gap-2">
                                <div className="flex-1 flex bg-white rounded-xl border p-1">
                                  <input
                                    id={`warehouse-tons-${slot.id}`}
                                    type="number"
                                    placeholder="Tons to reserve"
                                    className="w-full bg-transparent px-2.5 py-1 text-xs font-mono font-bold outline-none"
                                  />
                                  <button
                                    onClick={() => {
                                      const input = document.getElementById(`warehouse-tons-${slot.id}`) as HTMLInputElement;
                                      if (input && input.value) {
                                        handleBookWarehouseSlot(slot.id, Number(input.value), 30);
                                        input.value = '';
                                      } else {
                                        triggerToast('Specify storage weight in tons first!');
                                      }
                                    }}
                                    className="bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg shrink-0 transition-all font-sans"
                                  >
                                    Reserve Slot
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeCoopTab === 'shared_finance' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* A. Joint Expenses ledger */}
                    <div className="bg-white p-4.5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[9px] bg-emerald-50 text-emerald-800 font-extrabold px-3 py-0.5 rounded-full uppercase tracking-widest font-mono">
                            Feature 12 • Shared Finances
                          </span>
                          <h4 className="text-xs sm:text-sm font-black uppercase text-slate-800 mt-1">Joint Expense Settlement Ledger</h4>
                        </div>
                        <button
                          onClick={() => setShowAddFinance(!showAddFinance)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all"
                        >
                          {showAddFinance ? 'Close Form' : 'Log Shared Expense +'}
                        </button>
                      </div>

                      {showAddFinance && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-250/60 text-xs space-y-3">
                          <h5 className="font-bold text-slate-700">Split Invoice / Joint Procurement</h5>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="col-span-2">
                              <label className="text-[10px] uppercase font-black text-slate-500 block mb-1">Expense Description</label>
                              <input
                                type="text"
                                value={financeForm.description}
                                onChange={(e) => setFinanceForm({ ...financeForm, description: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-black text-slate-500 block mb-1">Expense Category</label>
                              <select
                                value={financeForm.category}
                                onChange={(e) => setFinanceForm({ ...financeForm, category: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold outline-none font-mono text-[10.5px]"
                              >
                                <option value="fertilizer">Fertilizer Split</option>
                                <option value="fuel">Diesel Fuel Split</option>
                                <option value="hired_labor">Labor Split Payout</option>
                                <option value="other">Other Supplies Split</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-black text-slate-500 block mb-1">Total Bill Invoice (Rs.)</label>
                              <input
                                type="number"
                                value={financeForm.totalAmount}
                                onChange={(e) => setFinanceForm({ ...financeForm, totalAmount: Number(e.target.value) })}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono font-bold outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-black text-slate-500 block mb-1">Diesel (Litres) - Optional</label>
                              <input
                                type="number"
                                value={financeForm.dieselLitres}
                                onChange={(e) => setFinanceForm({ ...financeForm, dieselLitres: Number(e.target.value) })}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono font-bold outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-black text-slate-500 block mb-1">Expected APMC Profit Margin</label>
                              <input
                                type="number"
                                value={financeForm.actualProfit}
                                onChange={(e) => setFinanceForm({ ...financeForm, actualProfit: Number(e.target.value) })}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono font-bold outline-none"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleCreateFinanceSplitExpense(financeForm)}
                            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black uppercase tracking-wider py-2 rounded-xl transition-all"
                          >
                            Log Split To Group Ledger
                          </button>
                        </div>
                      )}

                      <div className="space-y-3.5">
                        {cooperativeFinances.map((ledger) => {
                          const totalSettlers = (ledger.pendingSettlements || []).length;
                          const userSettlement = (ledger.pendingSettlements || []).find((s: any) => s.uid === userUid);
                          const totalPaidAmount = (ledger.pendingSettlements || []).reduce((acc: number, val: any) => val.paid ? acc + val.amount : acc, 0);

                          return (
                            <div key={ledger.id} className="bg-slate-50 p-4 rounded-2.5xl border border-slate-150 space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[9px] bg-emerald-50 text-emerald-800 border-emerald-100 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    💰 {ledger.category.toUpperCase()}
                                  </span>
                                  <h5 className="font-extrabold text-slate-700 text-sm mt-1">{ledger.description}</h5>
                                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                    Paid by: <span className="font-bold text-slate-500">{ledger.paidByName}</span>
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] text-slate-400 font-bold uppercase block font-mono">Total Invoice</span>
                                  <span className="text-sm font-black text-emerald-800 font-mono">Rs. {ledger.totalAmount.toLocaleString()}</span>
                                </div>
                              </div>

                              {ledger.dieselLitres > 0 && (
                                <div className="text-[10.5px] text-slate-400 font-bold uppercase block bg-white/60 p-2 border rounded-xl">
                                  ⛽ Diesel Fuel allocation: <span className="text-slate-800 font-mono font-bold">{ledger.dieselLitres} Litres</span> common pool fuel splitted
                                </div>
                              )}

                              <div className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase text-slate-500 font-mono">
                                  <span>Contribution Split ({totalSettlers} members)</span>
                                  <span>Paid: Rs. {totalPaidAmount.toLocaleString()} / Rs. {ledger.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="space-y-1.5 p-1 bg-white rounded-xl border max-h-[120px] overflow-y-auto pr-1">
                                  {(ledger.pendingSettlements || []).map((s: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center text-[11px] font-bold py-0.5 px-1.5 rounded-lg">
                                      <div className="flex items-center space-x-1.5">
                                        <div className={`w-2 h-2 rounded-full ${s.paid ? 'bg-emerald-500' : 'bg-red-400'}`} />
                                        <span className="text-slate-600">{s.name}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="font-mono text-slate-500">Rs. {s.amount}</span>
                                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${s.paid ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                                          {s.paid ? 'PAID' : 'PENDING'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Show profit projections if active in record */}
                              {ledger.actualProfit > 0 && (
                                <div className="bg-emerald-950 text-white p-3.5 rounded-xl space-y-1.5">
                                  <span className="text-[9px] text-emerald-300 font-black tracking-wider uppercase block font-mono">
                                    Feature 12 • Expected Profits Calculator Pro-Rate
                                  </span>
                                  <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                                    <span className="text-[11px] font-semibold text-emerald-100">Cumulative Crop Revenues</span>
                                    <span className="font-mono font-black text-xs">Rs. {ledger.actualProfit.toLocaleString()}</span>
                                  </div>
                                  <div className="text-[10px] font-medium text-emerald-200 leading-relaxed space-y-0.5">
                                    <p>Individual returns distributed against acreage proportions:</p>
                                    <div className="pl-2 border-l border-emerald-400/35 space-y-1 mt-1 text-[9.5px]">
                                      <p>• Your Estimated Paycheck: <span className="font-mono font-bold text-yellow-300">Rs. {Math.round(ledger.actualProfit * 0.40).toLocaleString()} (40% Share)</span></p>
                                      <p>• Ramesh K. Paycheck: <span className="font-mono font-bold text-emerald-100">Rs. {Math.round(ledger.actualProfit * 0.35).toLocaleString()} (35% Share)</span></p>
                                      <p>• Manju G. Paycheck: <span className="font-mono font-bold text-emerald-100">Rs. {Math.round(ledger.actualProfit * 0.25).toLocaleString()} (25% Share)</span></p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {userSettlement && !userSettlement.paid && (
                                <div className="border-t pt-2 flex justify-end">
                                  <button
                                    onClick={() => handleMarkFinancePaid(ledger.id)}
                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black uppercase text-[10px] tracking-wider px-4 py-2 rounded-xl transition-all border border-emerald-150 font-mono"
                                  >
                                    ✔️ Settle / Mark My Share Paid
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* B. Sustainability score card section */}
                    {(() => {
                      // Calculate dynamic sustainability score
                      let score = 70;
                      const hasDrip = selectedCoop.irrigationType?.toLowerCase().includes('drip');
                      if (hasDrip) score += 18;
                      const membersCount = activeMembers.length || 3;
                      score += Math.min(membersCount * 2, 7);

                      let badge = 'Earthy Steward Silver';
                      let badgeColor = 'from-slate-400 to-slate-500';
                      if (score >= 88) {
                        badge = 'Eco-Alliance Steward Gold Elite';
                        badgeColor = 'from-emerald-600 to-emerald-800';
                      }

                      return (
                        <div className="bg-white p-4.5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                          <div>
                            <span className="text-[9px] bg-emerald-50 text-emerald-800 font-extrabold px-3 py-0.5 rounded-full uppercase tracking-widest font-mono">
                              Feature 14 • Sustainability scoring
                            </span>
                            <h4 className="text-xs sm:text-sm font-black uppercase text-slate-800 mt-1">Dynamic Alliance Eco-Efficiency Score</h4>
                          </div>

                          <div className={`bg-gradient-to-r ${badgeColor} text-white p-4.5 rounded-3xl flex justify-between items-center relative overflow-hidden`}>
                            <div className="space-y-1 z-10">
                              <span className="text-[8.5px] uppercase font-black text-yellow-300 tracking-widest block font-mono">Verified Eco Shield</span>
                              <h5 className="font-extrabold text-sm sm:text-base leading-tight">{badge}</h5>
                              <p className="text-[10px] text-slate-200 font-medium leading-relaxed max-w-[210px]">
                                Awarded dynamically based on organic inputs, borewell optimization schedules, and integrated drip systems.
                              </p>
                            </div>
                            <div className="text-center shrink-0 z-10 font-mono">
                              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">{score}</span>
                              <span className="text-[9px] font-black uppercase text-yellow-300 block tracking-wider font-mono">Eco Score</span>
                            </div>
                            {/* Decorative background circle */}
                            <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-white/10 rounded-full blur-xl" />
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 space-y-1">
                              <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono">Organic Practices</span>
                              <p className="font-black text-slate-700 text-[11px] flex items-center gap-1">
                                <span className="text-emerald-500">✔</span> Enabled for crop Focus
                              </p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 space-y-1">
                              <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono">Water Conservation</span>
                              <p className="font-black text-slate-700 text-[11px] flex items-center gap-1">
                                <span className="text-emerald-500">✔</span> Drip Irrigation active
                              </p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 col-span-2 space-y-1">
                              <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono">Zero Residue Burning Policy</span>
                              <p className="font-black text-slate-700 text-[11px] flex items-center gap-1 text-emerald-800">
                                🛡️ Verified non-burning stubble mulching protocols are actively logged in FPO grids.
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {activeCoopTab === 'risk_alerts' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* A. AI District risk radar section */}
                    <div className="bg-white p-4.5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[9px] bg-red-50 text-red-800 font-extrabold px-3 py-0.5 rounded-full uppercase tracking-widest font-mono">
                            Feature 10 & 13 • Risk Outbreaks
                          </span>
                          <h4 className="text-xs sm:text-sm font-black uppercase text-slate-800 mt-1">Village Risk Alert Network</h4>
                        </div>
                        <button
                          onClick={() => setShowAddAlert(!showAddAlert)}
                          className="bg-red-700 hover:bg-red-800 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all"
                        >
                          {showAddAlert ? 'Close Form' : 'Broadcast SOS 🚨'}
                        </button>
                      </div>

                      {showAddAlert && (
                        <div className="bg-red-50/50 p-4 rounded-2xl border border-red-150 text-xs space-y-3">
                          <h5 className="font-bold text-red-900 flex items-center gap-1.5 font-sans">
                            <span>🚨</span> Broadcast Immediate District Hazard Alert
                          </h5>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] uppercase font-black text-red-700 block mb-1 font-mono">Anomalies Category</label>
                              <select
                                value={alertForm.type}
                                onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value })}
                                className="w-full bg-white border border-red-200 rounded-lg p-2 font-semibold outline-none"
                              >
                                <option value="pest">Pest Spore Outbreak</option>
                                <option value="flood">Flood Runoff Risk</option>
                                <option value="storm">Severe Storm Anomaly</option>
                                <option value="mandi_crash">Mandi Price Crash</option>
                                <option value="transport_block">Logistics Blockade</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-black text-red-700 block mb-1 font-mono">Severity Level</label>
                              <select
                                value={alertForm.severity}
                                onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}
                                className="w-full bg-white border border-red-200 rounded-lg p-2 font-semibold outline-none"
                              >
                                <option value="critical">CRITICAL (Red Priority)</option>
                                <option value="alert">ALERT (Amber Priority)</option>
                              </select>
                            </div>
                            <div className="col-span-2">
                              <label className="text-[10px] uppercase font-black text-red-700 block mb-1 font-mono">SOS Alert Message Description</label>
                              <textarea
                                value={alertForm.message}
                                onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                                rows={2}
                                className="w-full bg-white border border-red-200 rounded-lg p-2 font-semibold outline-none"
                                placeholder="Describe crop disease symptoms or emergency water flows..."
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleBroadcastSOS(alertForm)}
                            className="w-full bg-red-700 hover:bg-red-850 text-white text-[10px] font-black uppercase tracking-wider py-2 rounded-xl transition-all font-mono"
                          >
                            Broadcast Distress Wave
                          </button>
                        </div>
                      )}

                      <div className="space-y-3">
                        {emergencyAlerts.map((alt) => {
                          const isCritical = alt.severity === 'critical';
                          return (
                            <div 
                              key={alt.id} 
                              className={`p-4 rounded-2.5xl border flex gap-3.5 items-start ${
                                isCritical ? 'bg-red-50 border-red-155 text-red-950' : 'bg-amber-50 border-amber-155 text-amber-950'
                              }`}
                            >
                              <div className="p-2 bg-white rounded-full shrink-0 shadow-sm">
                                <span className="text-sm">{alt.type === 'flood' ? '🌊' : alt.type === 'pest' ? '🐛' : '⚠️'}</span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex gap-2 items-center">
                                  <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                    isCritical ? 'bg-red-200 text-red-900 animate-pulse' : 'bg-amber-200 text-amber-900'
                                  }`}>
                                    {alt.severity.toUpperCase()}
                                  </span>
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">
                                    District: {alt.district}
                                  </span>
                                </div>
                                <p className="text-xs font-semibold leading-relaxed">{alt.message}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase font-mono">
                                  Sourced by: {alt.authorName} • {new Date(alt.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* B. Subsidies section */}
                    <div className="bg-white p-4.5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                      <div>
                        <span className="text-[9px] bg-indigo-50 text-indigo-850 font-extrabold px-3 py-0.5 rounded-full uppercase tracking-widest font-mono">
                          Feature 11 • Government Benefits
                        </span>
                        <h4 className="text-xs sm:text-sm font-black uppercase text-slate-800 mt-1">Automatic Cooperative Incentives Radar</h4>
                      </div>

                      <div className="space-y-3.5">
                        {governmentBenefits.map((scheme) => {
                          return (
                            <div key={scheme.id} className="bg-slate-50 p-4 rounded-2.5xl border border-slate-150 space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                                    🏢 {scheme.category.toUpperCase()}
                                  </span>
                                  <h5 className="font-extrabold text-slate-700 text-sm mt-1">{scheme.title}</h5>
                                </div>
                              </div>

                              <div className="text-xs space-y-1 text-slate-700 leading-normal">
                                <p className="font-bold">Subsidy Incentive payout: <span className="text-emerald-800 font-black font-mono">{scheme.subsidyAmount}</span></p>
                                <p className="text-[11px] font-medium text-slate-500"><span className="font-bold">Eligibility check:</span> {scheme.eligibility}</p>
                              </div>

                              <div className="border-t pt-2.5 text-xs space-y-1.5">
                                <span className="text-[9px] font-black leading-tight uppercase tracking-widest text-slate-400 block font-mono">
                                  Mandatory Supporting Documents
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {(scheme.documentsNeeded || []).map((docStr: string, idx: number) => (
                                    <span key={idx} className="text-[9.5px] bg-white border px-2 py-0.5 rounded-md font-bold text-slate-500 font-mono">
                                      📁 {docStr}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="pt-2 flex justify-end">
                                <a
                                  href={scheme.applyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-indigo-700 hover:bg-indigo-800 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all inline-block text-center shadow-xs"
                                >
                                  Apply on Direct Gov Portal ↗
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center p-8 text-center select-none bg-slate-50">
              <Users className="w-16 h-16 text-slate-300 animate-pulse mb-3" />
              <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">{activeSegmentTab === 'discover' ? 'Select an Alliance' : 'No Cooperatives Joined'}</h4>
              <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto mt-1 font-semibold leading-relaxed">
                {activeSegmentTab === 'discover' 
                  ? 'Select any verified regional farmer alliance on the left directory to check cooperative specifications' 
                  : 'Form or join a regional alliance to engage in resource sharing and direct pricing'
                }
              </p>
            </div>
          )}
        </div>

      </div>

      {/* DRAWER: Deployment parameters of cooperative */}
      {showCreateDrawer && (
        <div className="fixed inset-0 bg-black/60 z-55 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border relative p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowCreateDrawer(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center border hover:bg-slate-200 outline-none"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>

            <span className="text-[9px] bg-emerald-50 text-emerald-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider block w-max">
              Alliance Deployment Console
            </span>

            <form onSubmit={handleDeployCooperative} className="space-y-3.5 text-xs font-bold text-slate-700">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">{t.coopName}</label>
                <input 
                  type="text" 
                  value={coopForm.name}
                  onChange={(e) => setCoopForm({...coopForm, name: e.target.value})}
                  placeholder="e.g. Mandya Sugarcane Combined Pool"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-bold uppercase focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">{t.district}</label>
                  <select 
                    value={coopForm.district}
                    onChange={(e) => setCoopForm({...coopForm, district: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-bold"
                  >
                    {KARNATAKA_DISTRICTS.map(dst => <option key={dst} value={dst}>{dst}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">{t.village}</label>
                  <input 
                    type="text" 
                    value={coopForm.village}
                    onChange={(e) => setCoopForm({...coopForm, village: e.target.value})}
                    placeholder="village/hobli"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">{t.cropFocus}</label>
                  <select 
                    value={coopForm.cropFocus}
                    onChange={(e) => setCoopForm({...coopForm, cropFocus: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-bold"
                  >
                    {FOCUS_CROPS.map(cr => <option key={cr} value={cr}>{cr}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">{t.irrigation}</label>
                  <select 
                    value={coopForm.irrigationType}
                    onChange={(e) => setCoopForm({...coopForm, irrigationType: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-bold"
                  >
                    {IRRIGATION_TYPES.map(irr => <option key={irr} value={irr}>{irr}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">{t.acreage}</label>
                <input 
                  type="number" 
                  value={coopForm.acreage}
                  onChange={(e) => setCoopForm({...coopForm, acreage: parseInt(e.target.value) || 5})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">{t.farmingGoals}</label>
                <input 
                  type="text" 
                  value={coopForm.farmingGoals}
                  onChange={(e) => setCoopForm({...coopForm, farmingGoals: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">{t.description}</label>
                <textarea 
                  value={coopForm.description}
                  onChange={(e) => setCoopForm({...coopForm, description: e.target.value})}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none font-bold leading-normal text-xs"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowCreateDrawer(false)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-black uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black uppercase tracking-wider rounded-xl shadow-lg"
                >
                  {t.createBtn}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
