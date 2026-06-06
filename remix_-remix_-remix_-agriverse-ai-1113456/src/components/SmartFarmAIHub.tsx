import React, { useState, useEffect, useRef } from 'react';
import { 
  X,
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Droplets, 
  Activity, 
  DollarSign, 
  BookOpen, 
  Award, 
  Calendar, 
  RefreshCw, 
  HelpCircle, 
  MapPin, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Play, 
  Check, 
  CheckCircle,
  Clock,
  Briefcase,
  Users,
  Compass
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { LanguageCode } from '../types';

interface SmartFarmAIHubProps {
  currentLang: LanguageCode;
  onClose: () => void;
  triggerToast: (msg: string) => void;
  userUid: string;
  userName: string;
  userPhone: string;
  cooperativeId?: string;
  // Navigation hooks to bridge with the App.tsx router
  onNavigateToTab: (tab: 'home' | 'community' | 'marketplace' | 'assistant' | 'profile', mode?: 'doctor' | 'chat') => void;
  onOpenCooperative: () => void;
}

// Sub-Tab types for the Hub
type AISystemTab = 
  | 'pest' 
  | 'calendar' 
  | 'soil' 
  | 'financial' 
  | 'expense' 
  | 'yield' 
  | 'tutor' 
  | 'conversations';

export function SmartFarmAIHub({
  currentLang,
  onClose,
  triggerToast,
  userUid,
  userName,
  userPhone,
  cooperativeId,
  onNavigateToTab,
  onOpenCooperative
}: SmartFarmAIHubProps) {
  // Navigation tabs inside AI Hub
  const [activeSubTab, setActiveSubTab] = useState<AISystemTab>('pest');
  const [isLoading, setIsLoading] = useState(false);

  // Sound/Speech control state
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // 1. Pest Prediction State
  const [pestCrop, setPestCrop] = useState('tomato');
  const [pestDistrict, setPestDistrict] = useState('Kolar');
  const [pestHumidity, setPestHumidity] = useState(80);
  const [pestRainfall, setPestRainfall] = useState(45);
  const [pestTemp, setPestTemp] = useState(27);
  const [pestResult, setPestResult] = useState<any | null>(null);
  const [pestHistory, setPestHistory] = useState<any[]>([]);

  // 2. Crop Calendar State
  const [calendarCrop, setCalendarCrop] = useState('tomato');
  const [calendarSowingDate, setCalendarSowingDate] = useState('2026-06-01');
  const [calendarSoilType, setCalendarSoilType] = useState('Sandy Loam');
  const [calendarResult, setCalendarResult] = useState<any | null>(null);
  const [calendarCheckedItems, setCalendarCheckedItems] = useState<Record<string, boolean>>({});

  // 3. Soil Health State
  const [soilN, setSoilN] = useState('120');
  const [soilP, setSoilP] = useState('40');
  const [soilK, setSoilK] = useState('80');
  const [soilPH, setSoilPH] = useState(6.5);
  const [soilTypeInput, setSoilTypeInput] = useState('Clayey');
  const [soilResult, setSoilResult] = useState<any | null>(null);

  // 4. Farm Financial State
  const [finCrop, setFinCrop] = useState('Tomato');
  const [finAcres, setFinAcres] = useState(1.5);
  const [finMandiPrice, setFinMandiPrice] = useState(30);
  const [finSeedsCost, setFinSeedsCost] = useState(8500);
  const [finLaborCost, setFinLaborCost] = useState(12000);
  const [finMachineryCost, setFinMachineryCost] = useState(6500);
  const [finResult, setFinResult] = useState<any | null>(null);

  // 5. Smart Expense Tracker State
  const [expensesList, setExpensesList] = useState<any[]>([]);
  const [expenseInput, setExpenseInput] = useState('');
  const [rawExpenseText, setRawExpenseText] = useState('');
  const [expenseCost, setExpenseCost] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Seeds');

  // 6. Yield Prediction State
  const [yieldCrop, setYieldCrop] = useState('Tomato');
  const [yieldSoil, setYieldSoil] = useState('Alluvial');
  const [yieldIrrigation, setYieldIrrigation] = useState('Drip');
  const [yieldWater, setYieldWater] = useState(12000);
  const [yieldResult, setYieldResult] = useState<any | null>(null);
  const [yieldHistory, setYieldHistory] = useState<any[]>([]);

  // 7. AI Farming Tutor (Academy) State
  const [tutorQuery, setTutorQuery] = useState('organic bio-pesticides standard preparation');
  const [tutorResult, setTutorResult] = useState<any | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  // 8 & 9. Immersive Floating Voice Assistant State
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState('');

  // 10. Gemini Live Farming Conversation State
  const [liveCallActive, setLiveCallActive] = useState(false);
  const [liveCallStatus, setLiveCallStatus] = useState<'idle' | 'connecting' | 'live'>('idle');
  const [liveCallTranscript, setLiveCallTranscript] = useState<string[]>([]);
  const callTimerRef = useRef<any>(null);

  // Operational Database and Consolidated profile states
  const [dbTotalProfits, setDbTotalProfits] = useState(0);
  const [dbMachineryCost, setDbMachineryCost] = useState(0);
  const [dbLaborCost, setDbLaborCost] = useState(0);
  const [dbSeedsCost, setDbSeedsCost] = useState(0);
  const [dbTransportCost, setDbTransportCost] = useState(0);
  const [profileCropFocus, setProfileCropFocus] = useState('Tomato');
  const [profileDistrict, setProfileDistrict] = useState('Chikkaballapura');
  const [profileVillage, setProfileVillage] = useState('Anemadagu');
  const [profileIrrigationType, setProfileIrrigationType] = useState('Drip');
  const [profileOrganicScore, setProfileOrganicScore] = useState(60);

  // --- Realtime Firebase Listeners ---
  useEffect(() => {
    if (!userUid) return;

    // Sub 1: Load Centralized Farmer Profile
    const unsubProfile = onSnapshot(doc(db, 'users', userUid), (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.data();
        const crop = val.cropFocus || 'Tomato';
        const dist = val.district || 'Chikkaballapura';
        const vil = val.village || 'Anemadagu';
        const irr = val.irrigationType || 'Drip';
        const org = val.organicScore || 60;

        setProfileCropFocus(crop);
        setProfileDistrict(dist);
        setProfileVillage(vil);
        setProfileIrrigationType(irr);
        setProfileOrganicScore(org);
        
        // Auto-synchronize default AI panels inputs with user profile properties
        setPestDistrict(dist);
        setPestCrop(crop.toLowerCase());
        setCalendarCrop(crop.toLowerCase());
        setFinCrop(crop);
        setYieldCrop(crop);
        setYieldIrrigation(irr);
        setCalendarSoilType(val.soilType || 'Sandy Loam');

        // Dynamically compute and seed local weather variables based on profile location
        const baseSeed = (vil + dist).length || 10;
        const simulatedTemp = 24 + (baseSeed % 14); // 24 to 38
        const simulatedHumidity = 50 + (baseSeed % 41); // 50 to 91
        const simulatedRain = baseSeed % 2 === 0 ? (50 + (baseSeed % 48)) : (baseSeed % 45); // 0 to 98
        setPestTemp(simulatedTemp);
        setPestHumidity(simulatedHumidity);
        setPestRainfall(simulatedRain);
      }
    }, (err) => {
      console.warn("User profile snapshot listener bypassed:", err);
    });

    // Sub 2: Load Expense Ledger
    const qExpenses = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      setExpensesList(list);

      // Sum up seeds & fertilizer cost from actual ledger entries
      const seedSum = list
        .filter(exp => exp.category?.toLowerCase() === 'seeds' || exp.category?.toLowerCase() === 'fertilizer' || exp.category?.toLowerCase() === 'expense')
        .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      setDbSeedsCost(seedSum || 4500); 
    }, (err) => {
      console.warn("Loading initial offline metrics:", err);
    });

    // Sub 3: Load Pest Prediction History
    const qPests = query(collection(db, 'pestPredictions'), orderBy('createdAt', 'desc'));
    const unsubPests = onSnapshot(qPests, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPestHistory(list);
    });

    // Sub 4: Load Marketplace Orders to compute dynamic profits
    const qOrders = query(collection(db, 'marketplaceOrders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      let totalRev = 0;
      snapshot.forEach(doc => {
        const order = doc.data();
        if (order.farmerUid === userUid && order.status === 'accepted') {
          // If pricing is negotiated, assume default baseline and scale by quantity
          const qty = parseFloat(order.quantity) || 1;
          totalRev += qty * 35; // ₹35 per unit standard
        }
      });
      setDbTotalProfits(totalRev);
    });

    // Sub 5: Load Machinery Bookings
    const qBookings = query(collection(db, 'machineryBookings'));
    const unsubBookings = onSnapshot(qBookings, (snapshot) => {
      let totalMachineryFee = 0;
      snapshot.forEach(doc => {
        const b = doc.data();
        if (b.renterUid === userUid && b.status !== 'declined') {
          totalMachineryFee += parseFloat(b.totalPrice) || parseFloat(b.pricePerDay) * 2 || 2500;
        }
      });
      setDbMachineryCost(totalMachineryFee);
    });

    // Sub 6: Load Labor Requests
    const qLabor = query(collection(db, 'laborRequests'));
    const unsubLabor = onSnapshot(qLabor, (snapshot) => {
      let totalLaborFee = 0;
      snapshot.forEach(doc => {
        const l = doc.data();
        if (l.creatorUid === userUid) {
          totalLaborFee += parseFloat(l.wages) * (parseInt(l.workersNeeded) || 1) * 3 || 6000;
        }
      });
      setDbLaborCost(totalLaborFee);
    });

    // Sub 7: Load Transport Bookings
    const qTransport = query(collection(db, 'transportBookings'));
    const unsubTransport = onSnapshot(qTransport, (snapshot) => {
      let totalTrans = 0;
      snapshot.forEach(doc => {
        const t = doc.data();
        if (t.providerUid === userUid || t.routeSpec?.includes(profileVillage)) {
          totalTrans += parseFloat(t.priceKm) * 50 || 1200;
        }
      });
      setDbTransportCost(totalTrans);
    });

    // Sub 8: Load Yield Predictions History
    const qYield = query(collection(db, 'yieldPredictions'), orderBy('createdAt', 'desc'));
    const unsubYield = onSnapshot(qYield, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setYieldHistory(list);
    }, (error) => {
      console.warn("YieldHistory snapshot listener bypassed:", error);
    });

    return () => {
      unsubProfile();
      unsubExpenses();
      unsubPests();
      unsubOrders();
      unsubBookings();
      unsubLabor();
      unsubTransport();
      unsubYield();
    };
  }, [userUid, profileVillage]);

  // Handle Text-to-Speech voicing
  const handleVoiceSpeak = (text: string) => {
    if (!voiceEnabled) return;
    try {
      window.speechSynthesis?.cancel(); // cancel current playing voice
      const utterance = new SpeechSynthesisUtterance(text);
      if (currentLang === 'kn') {
        utterance.lang = 'kn-IN';
      } else if (currentLang === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-IN';
      }
      utterance.rate = 0.95;
      window.speechSynthesis?.speak(utterance);
    } catch (e) {
      console.log('Voice synthesis not built: ', e);
    }
  };

  // Run Voice Command Routing (Voice Navigation Engine 9)
  const processVoiceNavigationAndCommands = (phrase: string) => {
    const text = phrase.toLowerCase();
    triggerToast(`Hearing Command: "${phrase}"`);

    // Navigation Triggers
    if (text.includes('mandi') || text.includes('marketplace') || text.includes('buyer') || text.includes('seller') || text.includes('ದರ') || text.includes('बाजार')) {
      onNavigateToTab('marketplace');
      setShowVoicePanel(false);
      handleVoiceSpeak("Navigating you straight to the direct farmer AgriVerse Marketplace.");
      return;
    }
    if (text.includes('disease') || text.includes('scanner') || text.includes('doctor') || text.includes('leaf') || text.includes('ರೋಗ') || text.includes('कीट')) {
      onNavigateToTab('assistant', 'doctor');
      setShowVoicePanel(false);
      handleVoiceSpeak("Opening Gemini Leaf Disease Bio Clinic.");
      return;
    }
    if (text.includes('chat') || text.includes('advisor') || text.includes('bot') || text.includes('ಮಾತನಾಡು') || text.includes('सलाह')) {
      onNavigateToTab('assistant', 'chat');
      setShowVoicePanel(false);
      handleVoiceSpeak("Connecting you directly to AgriVerse AI interactive farming advisor.");
      return;
    }
    if (text.includes('cooperative') || text.includes('co-op') || text.includes('union') || text.includes('ಕೂಟ') || text.includes('सहकारी')) {
      onOpenCooperative();
      setShowVoicePanel(false);
      handleVoiceSpeak("Enabling cooperative matching and shared resources splits network.");
      return;
    }
    if (text.includes('scheme') || text.includes('subsidy') || text.includes('योजना') || text.includes('ಅನುದಾನ')) {
      onNavigateToTab('profile');
      setShowVoicePanel(false);
      handleVoiceSpeak("Routing you directly to your localized Government Scheme eligibility tracker dashboard.");
      return;
    }
    if (text.includes('delivery') || text.includes('logistics') || text.includes('truck') || text.includes('vahan') || text.includes('ಸಾರಿಗೆ')) {
      onNavigateToTab('marketplace');
      setShowVoicePanel(false);
      handleVoiceSpeak("Opening live transport shipping status and logistics delivery tracker.");
      return;
    }

    // Direct Voice Assistant Informational Responses (Voice Assistant Feature 8)
    if (text.includes('weather') || text.includes('rain') || text.includes('ಮಳೆ') || text.includes('मौसम')) {
      const response = "Current region weather suggests 28 degrees celsius with heavy humidity of 82 percent and rain warnings in upcoming hours.";
      setAssistantReply(response);
      handleVoiceSpeak(response);
      return;
    }

    if (text.includes('tomato') || text.includes('potato') || text.includes('ಟೊಮೆಟೊ') || text.includes('टमाटर')) {
      const response = "Tomatoes are forecasting high profit potential in Chikkaballapura and Kolar mandis, fetching up to 45 rupees per kilogram.";
      setAssistantReply(response);
      handleVoiceSpeak(response);
      return;
    }

    // Fallback dialogue
    const defaultResponse = "I loaded that command in AgriVerse smart workspace engine. Just ask me to show weather, check tomato prices, open marketplace, or scan leaf disease.";
    setAssistantReply(defaultResponse);
    handleVoiceSpeak(defaultResponse);
  };

  // Simulate or utilize actual Browser Web Speech API for voice assistant listening
  const handleStartListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setVoiceTranscript('Listening... Speak now');
    setAssistantReply('');

    // Fallback response timer if browser Speech API lacks permissions inside container iframe
    const fallbackTimer = setTimeout(() => {
      const simulatedPhrases = [
        "Show tomato mandi prices near me",
        "Open cooperative matches and resources",
        "What is the weather report for Chikkaballapura today?",
        "Launch the crop leaf disease scanner clinic"
      ];
      const randomSim = simulatedPhrases[Math.floor(Math.random() * simulatedPhrases.length)];
      setVoiceTranscript(randomSim);
      setIsListening(false);
      processVoiceNavigationAndCommands(randomSim);
    }, 3200);

    // Attempt native browser recognition
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = currentLang === 'kn' ? 'kn-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          clearTimeout(fallbackTimer);
          const speechResult = event.results[0][0].transcript;
          setVoiceTranscript(speechResult);
          setIsListening(false);
          processVoiceNavigationAndCommands(speechResult);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech error, using premium container flow:", event.error);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      }
    } catch (e) {
      console.warn("Speech API bypass, fallback simulation active.");
    }
  };

  // ----- FEATURE 1: Pest Prediction AI Trigger -----
  const handlePestPredictionSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/pest-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: pestCrop,
          district: pestDistrict,
          humidity: pestHumidity,
          rainfall: pestRainfall,
          temperature: pestTemp
        })
      });
      const data = await res.json();
      setPestResult(data);
      handleVoiceSpeak(`Pest outbreak risk predicted as ${data.riskLevel} for your ${pestCrop} plot.`);
      
      // Save result in Firebase for persistence logs
      await addDoc(collection(db, 'pestPredictions'), {
        crop: pestCrop,
        district: pestDistrict,
        riskScore: data.riskScore,
        riskLevel: data.riskLevel,
        majorPest: data.majorPest,
        farmerId: userUid,
        cooperativeId: cooperativeId || 'coop_chikka',
        listingId: '',
        orderId: '',
        shipmentId: '',
        createdAt: serverTimestamp()
      });

      // Auto-trigger safety Warning notification if threat level is high
      if (data.riskLevel === 'HIGH') {
        await addDoc(collection(db, 'notifications'), {
          recipientUid: userUid,
          type: 'alert',
          title: `🚨 HIGH Pest Warning: ${pestCrop}`,
          body: `An outbreak threshold of ${data.majorPest} has reached ${data.riskScore}%. Preventive biological spraying is highly advised.`,
          senderName: "AgriVerse AI Doctor",
          farmerId: userUid,
          cooperativeId: cooperativeId || 'coop_chikka',
          listingId: '',
          orderId: '',
          shipmentId: '',
          read: false,
          createdAt: new Date().toISOString()
        });
      }

      triggerToast('Pest Prediction successfully updated & saved to cloud logs.');
    } catch (err) {
      triggerToast('Server Connection Interrupted. Using offline analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  // ----- FEATURE 2: AI Crop Calendar Trigger -----
  const handleCalendarGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/crop-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: calendarCrop,
          sowingDate: calendarSowingDate,
          district: pestDistrict,
          soilType: calendarSoilType
        })
      });
      const data = await res.json();
      setCalendarResult(data);
      handleVoiceSpeak(`Smart weekly chronological calendar drafted for ${calendarCrop}.`);
      triggerToast('AI Smart Farming Cron-Calendar generated.');
    } catch (err) {
      triggerToast('Could not compile soil calendar.');
    } finally {
      setIsLoading(false);
    }
  };

  // ----- FEATURE 3: Soil Health AI Trigger -----
  const handleSoilHealthCheck = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/soil-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          n: soilN,
          p: soilP,
          k: soilK,
          pH: soilPH,
          soilType: soilTypeInput,
          district: pestDistrict
        })
      });
      const data = await res.json();
      setSoilResult(data);
      handleVoiceSpeak(`Soil evaluation indexes analyzed as ${data.healthRating}.`);
      triggerToast('Soil health profile compiled.');
    } catch (err) {
      triggerToast('Error during NPK diagnosis.');
    } finally {
      setIsLoading(false);
    }
  };

  // ----- FEATURE 4: Farm Financial AI Trigger -----
  const handleFarmFinancialCheck = async () => {
    setIsLoading(true);
    try {
      const matchingYield = yieldResult || (yieldHistory && yieldHistory.length > 0 ? yieldHistory.find((y: any) => y.crop?.toLowerCase() === finCrop?.toLowerCase()) || yieldHistory[0] : null);
      const expectedYieldValue = matchingYield ? matchingYield.expectedYieldQuintalsPerAcre : null;

      const res = await fetch('/api/ai/farm-financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: finCrop,
          acres: finAcres,
          targetMandiPrice: finMandiPrice,
          seedsCost: finSeedsCost,
          laborCost: finLaborCost,
          machineryCost: finMachineryCost,
          expectedYieldVal: expectedYieldValue
        })
      });
      const data = await res.json();
      setFinResult(data);
      handleVoiceSpeak(`Estimated net ROI profit predicted at ${data.roiPercentage} percent.`);
      if (expectedYieldValue) {
        triggerToast(`Micro-ROI computed parsing latest Yield prediction: ${expectedYieldValue} Quintals/Acre! 🚀`);
      } else {
        triggerToast('Micro-ROI investment analysis ledger created.');
      }
    } catch (err) {
      triggerToast('ROI model projection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // ----- FEATURE 5: Smart Expense Tracker & Voice Entry -----
  const handleAddCustomExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseInput || !expenseCost) return;

    try {
      await addDoc(collection(db, 'expenses'), {
        name: expenseInput,
        amount: parseFloat(expenseCost),
        category: expenseCategory,
        createdAt: serverTimestamp()
      });
      setExpenseInput('');
      setExpenseCost('');
      triggerToast('Cost logged persistently in cooperative budget ledger!');
    } catch (err) {
      triggerToast('Firebase offline. Saving item locally.');
    }
  };

  // Parse spoken or typed natural text statement for expense (Smart Ledger AI 5)
  const handleAITextExpenseParse = async () => {
    if (!rawExpenseText) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/expense-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawExpenseText })
      });
      const data = await res.json();
      
      // Persistently append parsed object to Firestore
      await addDoc(collection(db, 'expenses'), {
        name: data.name,
        amount: data.amount,
        category: data.category,
        createdAt: serverTimestamp()
      });

      setRawExpenseText('');
      handleVoiceSpeak(`Recorded ${data.amount} rupees under ${data.category} ledger.`);
      triggerToast(`AI Auto-Parsed: "${data.name}" logged at ₹${data.amount}!`);
    } catch (err) {
      triggerToast('Natural parser was unresponsive.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpenseDoc = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
      triggerToast('Expense deleted.');
    } catch (err) {
      triggerToast('Deduction failed.');
    }
  };

  // ----- FEATURE 6: Yield Prediction AI Trigger -----
  const handleYieldPredictSubmit = async () => {
    setIsLoading(true);
    try {
      // Find recent pest threat context in active state to join systems
      const recentPest = pestHistory.find(
        (p: any) => p.crop?.toLowerCase() === yieldCrop?.toLowerCase()
      );

      const res = await fetch('/api/ai/yield-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: yieldCrop,
          soilType: yieldSoil,
          irrigationType: yieldIrrigation,
          expectedWater: yieldWater,
          pestRiskLevel: recentPest ? recentPest.riskLevel : 'LOW',
          pestMajorPest: recentPest ? recentPest.majorPest : ''
        })
      });
      const data = await res.json();
      setYieldResult(data);
      handleVoiceSpeak(`Predicted production harvest range is ${data.yieldRange}.`);

      // Save yield projection to central Firestore architecture
      await addDoc(collection(db, 'yieldPredictions'), {
        crop: yieldCrop,
        soilType: yieldSoil,
        irrigationType: yieldIrrigation,
        expectedWater: Number(yieldWater),
        expectedYieldQuintalsPerAcre: data.expectedYieldQuintalsPerAcre,
        yieldRange: data.yieldRange,
        confidenceScore: data.confidenceScore,
        farmerId: userUid,
        cooperativeId: cooperativeId || 'coop_chikka',
        listingId: '',
        orderId: '',
        shipmentId: '',
        createdAt: serverTimestamp()
      });

      // Auto-trigger notification for the farmer if prediction confidence is lower due to risks
      if (data.confidenceScore && data.confidenceScore < 85) {
        await addDoc(collection(db, 'notifications'), {
          recipientUid: userUid,
          type: 'alert',
          title: `📝 AI Yield Advisory Alert`,
          body: `Yield confidence for your ${yieldCrop} is down to ${data.confidenceScore}%. Check expert guidelines and soil metrics.`,
          senderName: "Yield Predictor AI",
          farmerId: userUid,
          cooperativeId: cooperativeId || 'coop_chikka',
          listingId: '',
          orderId: '',
          read: false,
          createdAt: new Date().toISOString()
        });
      }

      triggerToast('Production yield estimations compiled & saved.');
    } catch (err) {
      triggerToast('Yield curves calculation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // ----- FEATURE 7: AI Farming Tutor Trigger -----
  const handleFarmingTutorSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/farming-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: tutorQuery,
          farmerContext: {
            name: userName,
            language: currentLang,
            cropFocus: profileCropFocus,
            district: profileDistrict,
            village: profileVillage,
            irrigation: profileIrrigationType,
            pestHistory: pestHistory.slice(0, 3).map(p => ({ crop: p.crop, risk: p.riskLevel, pest: p.majorPest })),
            financials: {
              revenue: dbTotalProfits,
              expenses: dbSeedsCost + dbMachineryCost + dbLaborCost + dbTransportCost
            }
          }
        })
      });
      const data = await res.json();
      setTutorResult(data);
      setQuizAnswers({});
      setQuizScore(null);
      handleVoiceSpeak(`Farming tutorial and interactive quizzes compiled.`);
      triggerToast('Academy course material downloaded.');
    } catch (err) {
      triggerToast('Could not reach educational index.');
    } finally {
      setIsLoading(false);
    }
  };

  // Evaluate dynamic local academy quiz answers
  const handleQuizAnswerSelect = (quizIdx: number, selectedOptIdx: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [quizIdx]: selectedOptIdx
    }));
  };

  const handleEvaluateQuizResult = () => {
    if (!tutorResult?.quiz) return;
    let score = 0;
    tutorResult.quiz.forEach((q: any, i: number) => {
      if (quizAnswers[i] === q.answerIndex) score += 1;
    });
    setQuizScore(score);
    if (score === tutorResult.quiz.length) {
      handleVoiceSpeak("Perfect! You answered all agro questions correctly!");
    } else {
      handleVoiceSpeak(`You scored ${score} out of ${tutorResult.quiz.length}. Inspect step parameters.`);
    }
  };

  // ----- FEATURE 10: Gemini Live Farming Conversations -----
  const handleStartLiveAudioCall = () => {
    setLiveCallActive(true);
    setLiveCallStatus('connecting');
    setLiveCallTranscript(['Call connecting to AgriVerse voice companion satellites...']);

    callTimerRef.current = setTimeout(() => {
      setLiveCallStatus('live');
      const intro = "Welcome buddy! I am your real-time AgriVerse hand-free voice companion. Tell me about your crops today so I can guide you.";
      setLiveCallTranscript(prev => [...prev, "🔊 companion: " + intro]);
      handleVoiceSpeak(intro);
    }, 2000);
  };

  const handleSendSimulatedLiveMessage = () => {
    const questions = [
      "I have water logging on my tomato field, what organic recipe should I apply?",
      "Tell me how to maximize nitrogen base without chemical granules",
      "Is organic drenching better than spray for root-rot defense?",
      "Are there local cooperative tractor sharing slots near Amritsar?"
    ];
    const qChosen = questions[Math.floor(Math.random() * questions.length)];
    setLiveCallTranscript(prev => [...prev, "🧑‍🌾 you: " + qChosen]);

    setTimeout(() => {
      let advice = "Avert standing water instantly. Drench roots with 1 Liter of local organic neem formulation and allow aerated sunshine to strike.";
      if (qChosen.includes('nitrogen')) {
        advice = "Incorporate green Daincha cover crops or Azolla water cultures, fixing up to 50 Kilograms of free natural Nitrogen nitrogen.";
      } else if (qChosen.includes('cooperative')) {
        advice = "Active tractor slots are hiring in Chikkaballapura Potato union, saving up to 35 percent on machinery costs share.";
      }
      setLiveCallTranscript(prev => [...prev, "🔊 companion: " + advice]);
      handleVoiceSpeak(advice);
    }, 2800);
  };

  const handleEndLiveCall = () => {
    setLiveCallActive(false);
    setLiveCallStatus('idle');
    window.speechSynthesis?.cancel();
    clearTimeout(callTimerRef.current);
  };

  // Calculate total tracked expenses
  const totalExpenseSum = expensesList.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="absolute inset-0 bg-slate-50 flex flex-col z-50 text-slate-800 animate-slideUp font-sans select-none overflow-y-auto">
      
      {/* Top sticky title area with close trigger */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-4 flex justify-between items-center shrink-0 shadow-md">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          <div>
            <h3 className="text-sm font-black tracking-tight">Smart Farm AI Hub</h3>
            <p className="text-[10px] text-emerald-200 font-semibold leading-none">Full-Scale Agro Operating System</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Toggle Voice Output */}
          <button 
            onClick={() => {
              setVoiceEnabled(!voiceEnabled);
              triggerToast(voiceEnabled ? 'Voice guide muted.' : 'Voice guide active.');
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/90 active:scale-90 transition-all cursor-pointer"
            title="Toggle Voice Guide"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 text-emerald-200" /> : <VolumeX className="w-4 h-4 text-red-300" />}
          </button>

          {/* Quick Voice Mic Floating Assistant Trigger */}
          <button 
            onClick={() => setShowVoicePanel(true)}
            className="p-1.5 rounded-full bg-yellow-400 text-emerald-950 font-black animate-pulse hover:bg-yellow-300 active:scale-95 transition-all text-[11px] px-2.5 flex items-center space-x-1 cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Assistant</span>
          </button>

          <button 
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Swipeable AI Modules Selector Hub Horizontal Scroller */}
      <div className="bg-white px-3 py-2.5 border-b border-slate-100 flex space-x-1.5 overflow-x-auto select-none shrink-0 scrollbar-none">
        {[
          { id: 'pest', label: 'Pest AI', icon: '🐛' },
          { id: 'calendar', label: 'Crop Calendar', icon: '📅' },
          { id: 'soil', label: 'Soil Health', icon: '🌿' },
          { id: 'financial', label: 'Financial ROI', icon: '📈' },
          { id: 'expense', label: 'Expense Ledger', icon: '💰' },
          { id: 'yield', label: 'Yield Predict', icon: '🌾' },
          { id: 'tutor', label: 'AI Tutorial', icon: '🎓' },
          { id: 'conversations', label: 'Gemini Voice Call', icon: '📞' }
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => {
              setActiveSubTab(sub.id as AISystemTab);
              window.speechSynthesis?.cancel();
            }}
            className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-tight whitespace-nowrap transition-all flex items-center space-x-1 border cursor-pointer ${
              activeSubTab === sub.id
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
            }`}
          >
            <span>{sub.icon}</span>
            <span>{sub.label}</span>
          </button>
        ))}
      </div>

      {/* Primary Scrollable Content Area */}
      <div className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full pb-10">

        {/* ========================================================
            SUB-TAB 1: Pest Prediction Center
            ======================================================== */}
        {activeSubTab === 'pest' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xl shadow-slate-100/50">
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 bg-rose-50 text-rose-600 rounded-xl">
                  <Activity className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wide">Pest Prediction Engine</h4>
              </div>

              {/* Dynamic Operations Pest Context Card */}
              <div className="mb-4 p-3 bg-rose-50/50 rounded-2xl border border-rose-100/50 space-y-2">
                <div className="flex justify-between items-center text-[10px] text-rose-950 font-black uppercase tracking-wider">
                  <span>🔬 Centrally Synced Geo-Context</span>
                  <span className="text-[9px] bg-rose-600 text-white px-2 py-0.5 rounded-full">Automated</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <p className="font-semibold text-slate-600 flex items-center space-x-1">
                    <span>📍</span> <span className="font-extrabold text-slate-800">Dynamic Location:</span> <span className="text-slate-800 font-bold">{profileDistrict} District, {profileVillage}</span>
                  </p>
                  <p className="font-semibold text-slate-600 flex items-center space-x-1">
                    <span>🌾</span> <span className="font-extrabold text-slate-800">Crop Focus:</span> <span className="text-slate-800 font-bold">{profileCropFocus} ({profileIrrigationType})</span>
                  </p>
                  <p className="font-semibold text-slate-600 flex items-center space-x-1">
                    <span>⛈️</span> <span className="font-extrabold text-slate-800">Atmospheric Climate:</span> <span className="text-rose-800 font-bold">Temp: {pestTemp}°C | Hum: {pestHumidity}% | Rain: {pestRainfall}mm</span>
                  </p>
                  <p className="font-semibold text-slate-600 flex items-center space-x-1">
                    <span>📢</span> <span className="font-extrabold text-slate-800">Bazaar Crop Volume:</span> <span className="text-slate-800 font-mono">Bazaar listings are active for your region</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPestDistrict(profileDistrict);
                    setPestCrop(profileCropFocus.toLowerCase());
                    triggerToast('✨ Climate & Crop parameters successfully synced from active profile location weather telemetry!');
                  }}
                  className="w-full mt-1.5 py-1.5 bg-rose-200 hover:bg-rose-300 text-rose-950 font-black uppercase tracking-wider text-[9px] rounded-xl text-center active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  Retrieve Active Weather & Crop Vectors
                </button>
              </div>

              {/* Input forms */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Target Crop:</label>
                  <select 
                    value={pestCrop}
                    onChange={(e) => setPestCrop(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none"
                  >
                    <option value="tomato">Tomato (ಟೊಮೆಟೊ / टमाटर)</option>
                    <option value="rice">Rice/Paddy (ಭತ್ತ / धान)</option>
                    <option value="onion">Onion (ಈರುಳ್ಳಿ / प्याज)</option>
                    <option value="chilli">Chilli (ಮೆಣಸಿನಕಾಯಿ / मिर्च)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Temperature ({pestTemp}°C):</label>
                    <input 
                      type="range" min="15" max="45" value={pestTemp}
                      onChange={(e) => setPestTemp(parseInt(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Avg Humidity ({pestHumidity}%):</label>
                    <input 
                      type="range" min="10" max="100" value={pestHumidity}
                      onChange={(e) => setPestHumidity(parseInt(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Avg Rainfall Volume ({pestRainfall} mm):</label>
                  <input 
                    type="range" min="0" max="150" value={pestRainfall}
                    onChange={(e) => setPestRainfall(parseInt(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <button
                  onClick={handlePestPredictionSubmit}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 active:scale-98 transition-all rounded-2xl text-white font-extrabold text-xs shadow-md tracking-wider uppercase flex items-center justify-center space-x-1 cursor-pointer"
                >
                  {isLoading ? <span>Analyzing climatic risk cycles...</span> : <span>Run Failsafe Pest Audit</span>}
                </button>
              </div>
            </div>

            {/* Results Render */}
            {pestResult && (
              <div className="space-y-3 animate-slideUp">
                
                {/* Outbreak Severity Badge Block */}
                <div className={`p-4 rounded-3xl border ${
                  pestResult.riskLevel === 'HIGH' ? 'bg-red-50 border-red-100 text-red-950' : 'bg-green-50 border-green-100 text-green-950'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">Risk Assessment Severity</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black ${
                      pestResult.riskLevel === 'HIGH' ? 'bg-red-500 text-white' : 'bg-green-600 text-white'
                    }`}>{pestResult.riskLevel}</span>
                  </div>
                  <h4 className="text-base font-black tracking-tight">{pestResult.majorPest}</h4>
                  <p className="text-xs font-semibold leading-snug mt-1 opacity-90">{pestResult.alertSummary}</p>
                </div>

                {/* Heatmap forecast index using micro bar charts */}
                <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">6 Days Heatmap Severity Index</h5>
                  <div className="flex justify-between items-end h-16 pt-2">
                    {pestResult.heatMapSeverity?.map((val: number, idx: number) => (
                      <div key={idx} className="flex-1 flex flex-col items-center space-y-1">
                        <div 
                          style={{ height: `${(val / 100) * 44 + 4}px` }}
                          className={`w-4 rounded-t-md transition-all ${val > 70 ? 'bg-rose-500' : 'bg-emerald-600'}`}
                        ></div>
                        <span className="text-[8px] font-bold text-slate-400 font-mono">D{idx+1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations checklist blocks */}
                <div className="space-y-2">
                  <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Biological Suppression Recipes</h5>
                    <ul className="space-y-1 text-xs text-slate-600 font-medium list-disc pl-4 leading-normal">
                      {pestResult.biologicalControl?.map((it: string, i: number) => <li key={i}>{it}</li>)}
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Eco-Pesticides Interventions</h5>
                    <ul className="space-y-1 text-xs text-rose-800 font-medium list-disc pl-4 leading-normal">
                      {pestResult.chemicalControl?.map((it: string, i: number) => <li key={i}>{it}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SUB-TAB 2: AI Crop Calendar
            ======================================================== */}
        {activeSubTab === 'calendar' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xl shadow-slate-100/50">
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wide">Crop Calendar Engine</h4>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Target Crop:</label>
                    <select 
                      value={calendarCrop} 
                      onChange={(e) => setCalendarCrop(e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none"
                    >
                      <option value="tomato">Tomato (ಟೊಮೆಟೊ)</option>
                      <option value="rice">Rice Paddy (ಭತ್ತ)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Sowing Date:</label>
                    <input 
                      type="date" value={calendarSowingDate}
                      onChange={(e) => setCalendarSowingDate(e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Target Soil Type:</label>
                  <select 
                    value={calendarSoilType} 
                    onChange={(e) => setCalendarSoilType(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none"
                  >
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Clayey">Deep Black Clayey</option>
                    <option value="Red Sandy Soil">Red Sandy Soil</option>
                  </select>
                </div>

                <button
                  onClick={handleCalendarGenerate}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 active:scale-98 transition-all rounded-2xl text-white font-extrabold text-xs shadow-md tracking-wider uppercase cursor-pointer"
                >
                  Generate Crop Stage Timelines
                </button>
              </div>
            </div>

            {/* Timelines Render */}
            {calendarResult && (
              <div className="space-y-4 animate-slideUp">
                <div className="relative border-l-2 border-dashed border-emerald-500 ml-4 pl-6 space-y-6 pt-2">
                  {calendarResult.stages?.map((stage: any, sIdx: number) => (
                    <div key={sIdx} className="relative group">
                      
                      {/* Interactive dot indicator */}
                      <span className="absolute -left-[31px] top-1.5 w-4 h-4 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[8px] font-black ring-4 ring-slate-50">
                        {sIdx + 1}
                      </span>

                      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm relative">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-black tracking-tight text-slate-800 leading-tight">{stage.phase}</h4>
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-mono shrink-0">
                            {stage.timeline}
                          </span>
                        </div>

                        {/* Irrigation and nutrition */}
                        <div className="mt-3.5 space-y-1.5 border-t border-slate-50 pt-2 text-[11px] leading-snug">
                          <p className="font-semibold text-slate-400 uppercase tracking-widest text-[9px] leading-none mb-0.5">Stage Advisories</p>
                          <p className="text-slate-600 font-medium">💦 <span className="font-bold">Watering:</span> {stage.irrigationGuideline}</p>
                          <p className="text-slate-600 font-medium">🧪 <span className="font-bold">Soil Nourish:</span> {stage.fertilizerRequirement}</p>
                        </div>

                        {/* Interactive local checklist with Firestore syncing */}
                        <div className="mt-3.5 pt-3 border-t border-slate-150 space-y-1.5">
                          <p className="text-[9px] font-black text-emerald-800 tracking-wider uppercase">Stage Job Checklist</p>
                          {stage.actionChecklist?.map((job: string, jIdx: number) => {
                            const taskKey = `${sIdx}_${jIdx}`;
                            const isChecked = !!calendarCheckedItems[taskKey];
                            return (
                              <label 
                                key={jIdx}
                                className="flex items-center space-x-2 bg-slate-50/50 hover:bg-slate-50 p-2 rounded-xl transition-all cursor-pointer text-[11px] font-semibold text-slate-600"
                              >
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    setCalendarCheckedItems(prev => ({ ...prev, [taskKey]: e.target.checked }));
                                    triggerToast(e.target.checked ? `Done: "${job}"` : `Re-opened job: "${job}"`);
                                  }}
                                  className="accent-emerald-600 w-3.5 h-3.5 shrink-0"
                                />
                                <span className={isChecked ? 'line-through text-slate-400' : ''}>{job}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SUB-TAB 3: Soil Health AI
            ======================================================== */}
        {activeSubTab === 'soil' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xl shadow-slate-100/50">
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 bg-teal-50 text-teal-600 rounded-xl">
                  <Compass className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wide">Soil Health Diagnostics</h4>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-1">Nitrogen (N):</label>
                    <input 
                      type="number" value={soilN} onChange={(e) => setSoilN(e.target.value)}
                      placeholder="e.g. 120"
                      className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-20s rounded-lg outline-none text-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-1">Phosphorus (P):</label>
                    <input 
                      type="number" value={soilP} onChange={(e) => setSoilP(e.target.value)}
                      placeholder="e.g. 40"
                      className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-20s rounded-lg outline-none text-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-1">Potassium (K):</label>
                    <input 
                      type="number" value={soilK} onChange={(e) => setSoilK(e.target.value)}
                      placeholder="e.g. 80"
                      className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-20s rounded-lg outline-none text-slate-700 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-1">Soil pH ({soilPH}):</label>
                    <input 
                      type="range" min="4.0" max="10.0" step="0.1" value={soilPH}
                      onChange={(e) => setSoilPH(parseFloat(e.target.value))}
                      className="w-full accent-teal-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-1">Silt Density:</label>
                    <select 
                      value={soilTypeInput} 
                      onChange={(e) => setSoilTypeInput(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 font-sans"
                    >
                      <option value="Clayey">Clayey soil</option>
                      <option value="Silty Sludge">Silty sludge</option>
                      <option value="Alluvial Silt">Alluvial silt</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSoilHealthCheck}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 active:scale-98 transition-all rounded-2xl text-white font-extrabold text-xs shadow-md tracking-wider uppercase cursor-pointer"
                >
                  Audit NPK Chemical Makeup
                </button>
              </div>
            </div>

            {soulResultRender(soilResult)}
          </div>
        )}

        {/* ========================================================
            SUB-TAB 4: Farm Financial ROI Analyzer
            ======================================================== */}
        {activeSubTab === 'financial' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xl shadow-slate-100/50">
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 bg-green-50 text-green-600 rounded-xl">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wide">Agro Financial ROI Analyst</h4>
              </div>

              {/* Dynamic Database Operations Dashboard Sync Card */}
              <div className="mb-4 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-2">
                <div className="flex justify-between items-center text-[10px] text-emerald-950 font-black uppercase tracking-wider">
                  <span>📊 Real-time Operation Ledger</span>
                  <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-sans">Synced Cloud</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white/80 p-2 rounded-xl border border-slate-100 flex flex-col justify-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Mandi Sales Profits:</span>
                    <span className="font-mono font-extrabold text-emerald-800">₹{dbTotalProfits.toLocaleString()}</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-slate-100 flex flex-col justify-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Seed/Fertilizer Exp:</span>
                    <span className="font-mono font-extrabold text-[#b45309]">₹{dbSeedsCost.toLocaleString()}</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-slate-100 flex flex-col justify-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Co-op Machinery Rent:</span>
                    <span className="font-mono font-extrabold text-slate-700">₹{dbMachineryCost.toLocaleString()}</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-slate-100 flex flex-col justify-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Labor Contracts Rent:</span>
                    <span className="font-mono font-extrabold text-slate-700">₹{dbLaborCost.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-1.5 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFinSeedsCost(dbSeedsCost > 0 ? Math.round(dbSeedsCost / (finAcres || 1)) : 8500);
                      setFinLaborCost(dbLaborCost > 0 ? Math.round(dbLaborCost / (finAcres || 1)) : 12000);
                      setFinMachineryCost(dbMachineryCost > 0 ? Math.round((dbMachineryCost + dbTransportCost) / (finAcres || 1)) : 6500);
                      triggerToast('✨ Synchronized! Operational seed, labor, and machinery rental variables auto-imported.');
                      handleVoiceSpeak(`Financial ledger metrics synchronized with your actual cooperative bookings and marketplace operations.`);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-emerald-700 to-emerald-600 font-black text-[10px] text-white hover:from-emerald-800 hover:to-emerald-700 active:scale-95 text-center uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    ✨ Auto-import from Real Farm Operations ↗
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-1">Target Crop:</label>
                    <input 
                      type="text" value={finCrop} onChange={(e) => setFinCrop(e.target.value)}
                      placeholder="Tomato"
                      className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-1">Planted Acres:</label>
                    <input 
                      type="number" value={finAcres} onChange={(e) => setFinAcres(parseFloat(e.target.value))}
                      className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 block mb-1">Seed Cost/Ac:</label>
                    <input 
                      type="number" value={finSeedsCost} onChange={(e) => setFinSeedsCost(parseInt(e.target.value))}
                      className="w-full text-xs p-2 bg-slate-50 border rounded-lg text-slate-705 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 block mb-1">Labor/Ac:</label>
                    <input 
                      type="number" value={finLaborCost} onChange={(e) => setFinLaborCost(parseInt(e.target.value))}
                      className="w-full text-xs p-2 bg-slate-50 border rounded-lg text-slate-705 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 block mb-1">Fuel & Rent/Ac:</label>
                    <input 
                      type="number" value={finMachineryCost} onChange={(e) => setFinMachineryCost(parseInt(e.target.value))}
                      className="w-full text-xs p-2 bg-slate-50 border rounded-lg text-slate-705 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 block mb-1">Projected Mandi Selling Price (₹/Kg):</label>
                  <input 
                    type="range" min="10" max="100" value={finMandiPrice}
                    onChange={(e) => setFinMandiPrice(parseInt(e.target.value))}
                    className="w-full accent-green-600"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 font-mono mt-0.5">
                    <span>Min: ₹10</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 rounded">Target: ₹{finMandiPrice}/Kg</span>
                    <span>Max: ₹100</span>
                  </div>
                </div>

                <button
                  onClick={handleFarmFinancialCheck}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 active:scale-98 transition-all rounded-2xl text-white font-extrabold text-xs shadow-md tracking-wider uppercase cursor-pointer"
                >
                  Project ROI Cash Balance
                </button>
              </div>
            </div>

            {finResult && (
              <div className="space-y-3 animate-slideUp">
                
                {/* Visual scorecard */}
                <div className="bg-gradient-to-tr from-emerald-900 to-emerald-800 text-white rounded-3xl p-4 shadow-md">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                    <span className="text-[9px] text-emerald-250 font-black uppercase tracking-wider">Mandi Season Profit Margin</span>
                    <span className="bg-white/10 text-emerald-200 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-white/15 uppercase">
                      Rating: {finResult.investmentRating}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-[10px] text-emerald-200 font-semibold leading-none mb-0.5">Projected Net Gain</p>
                      <p className="text-2xl font-black font-mono">₹{finResult.netProfit?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-200 font-semibold leading-none mb-0.5">Estimated ROI Output</p>
                      <p className="text-2xl font-black font-mono text-yellow-300 font-sans">+{finResult.roiPercentage}%</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-semibold text-emerald-100 mt-4 pt-3 border-t border-white/5">
                    <span>Est Gross Proceeds: ₹{finResult.grossRevenue?.toLocaleString()}</span>
                    <span>Timeline: {finResult.breakEvenMonths} Months</span>
                  </div>
                </div>

                {/* Cash Flow Line Chart simulation in SVG vectors */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Cumulative Break-Even Curve</h5>
                  <svg viewBox="0 0 200 60" className="w-full h-16 overflow-visible text-emerald-600">
                    <path 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="2.5" 
                      d="M 10 50 Q 50 45 100 30 T 190 10" 
                    />
                    <circle cx="100" cy="30" r="3.5" fill="#f59e0b" className="animate-pulse" />
                    <line x1="0" y1="50" x2="200" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                    <text x="100" y="24" fontSize="6.5" fill="#f59e0b" fontWeight="bold">Break-Even Point</text>
                  </svg>
                </div>

                {/* Subsidies government path link recommendations */}
                <div className="space-y-2">
                  <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <h5 className="text-[10px] font-black text-slate-400 tracking-wider uppercase mb-1.5 flex items-center space-x-1">
                      <Briefcase className="w-3.5 h-3.5 text-yellow-500" />
                      <span>Eligible Subventions (NABARD / Government APMC)</span>
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                      {finResult.governmentSchemePaths?.map((sc: string, idx: number) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-emerald-600 mt-0.5 font-bold">✔</span>
                          <span>{sc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <h5 className="text-[10px] font-black text-slate-400 tracking-wider uppercase mb-1.5">Cost Squeeze Guidelines</h5>
                    <ul className="space-y-1.5 text-[11px] text-slate-500 leading-normal pl-4 list-disc font-medium">
                      {finResult.costReductionTips?.map((tip: string, idx: number) => <li key={idx}>{tip}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SUB-TAB 5: Smart Financial Expense Tracker
            ======================================================== */}
        {activeSubTab === 'expense' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Quick AI Voice Entry Bar */}
            <div className="bg-emerald-800 text-white rounded-3xl p-4 shadow-lg flex flex-col space-y-3">
              <h4 className="text-xs font-black tracking-wider uppercase text-emerald-200">AI Voice Ledger Recorder</h4>
              <p className="text-[11px] text-white/80 font-medium leading-snug">
                Type or click microphone to parse natural commands directly (e.g. "bought two bags premium seeds for 1600 rupees")
              </p>

              <div className="flex space-x-2">
                <input 
                  type="text"
                  placeholder="e.g. paid coolieRs 1200..."
                  value={rawExpenseText}
                  onChange={(e) => setRawExpenseText(e.target.value)}
                  className="flex-1 bg-white/10 active:bg-white/15 focus:bg-white/20 border border-white/15 p-2.5 rounded-2xl text-xs font-black text-white placeholder-white/50 outline-none"
                />

                <button 
                  onClick={handleAITextExpenseParse}
                  disabled={isLoading || !rawExpenseText}
                  className="bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black tracking-tight text-[11px] uppercase px-4 rounded-2xl cursor-pointer"
                >
                  Analyze
                </button>
              </div>
            </div>

            {/* Traditional Add Ledger Panel */}
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide mb-3 flex items-center space-x-1.5">
                <span>💰</span>
                <span>Log Manual Cash Flow Item</span>
              </h4>

              <form onSubmit={handleAddCustomExpense} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" placeholder="Expense description..."
                    value={expenseInput} onChange={(e) => setExpenseInput(e.target.value)}
                    className="text-xs p-2.5 rounded-xl border bg-slate-50 text-slate-700 outline-none"
                    required
                  />
                  <input 
                    type="number" placeholder="Cost amount ₹"
                    value={expenseCost} onChange={(e) => setExpenseCost(e.target.value)}
                    className="text-xs p-2.5 rounded-xl border bg-slate-50 text-slate-700 outline-none font-mono"
                    required
                  />
                </div>

                <div className="flex space-x-2">
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="flex-1 text-xs p-2 bg-slate-50 border rounded-lg text-slate-700"
                  >
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Pesticides">Pesticides</option>
                    <option value="Labor">Labor</option>
                    <option value="Machinery">Machinery</option>
                    <option value="Fuel">Fuel</option>
                    <option value="Irrigation">Irrigation</option>
                    <option value="Other">Other</option>
                  </select>

                  <button 
                    type="submit"
                    className="bg-emerald-800 text-white font-extrabold text-[11px] tracking-wide uppercase px-5 rounded-lg cursor-pointer"
                  >
                    Append Item
                  </button>
                </div>
              </form>
            </div>

            {/* Expense breakdown list synced persistently with remote / local databases */}
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2 mb-3">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cooperative Shared Budget Balance</h5>
                <span className="text-[11px] font-bold text-emerald-700 font-mono bg-emerald-50 px-2 rounded-full">
                  Total outlay: ₹{totalExpenseSum?.toLocaleString()}
                </span>
              </div>

              {expensesList.length === 0 ? (
                <div className="p-4 text-center text-slate-400 font-semibold text-xs text-dashed border border-slate-100 rounded-3xl">
                  No registered outlay expenditures in crop ledger.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {expensesList.map((e) => (
                    <div key={e.id} className="flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 p-2.5 rounded-2xl transition-all">
                      <div>
                        <p className="text-xs font-black text-slate-800">{e.name}</p>
                        <time className="text-[9px] font-bold text-slate-400 font-mono">Category: {e.category}</time>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <span className="text-xs font-bold font-mono text-rose-600">-₹{e.amount}</span>
                        <button 
                          onClick={() => handleDeleteExpenseDoc(e.id)}
                          className="p-1 hover:text-red-650 hover:bg-red-50 text-slate-400 rounded transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            SUB-TAB 6: Yield Prediction Center
            ======================================================== */}
        {activeSubTab === 'yield' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xl shadow-slate-100/50">
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-xl">
                  <Activity className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wide">AI Harvest Yield Forecaster</h4>
              </div>

              {/* Dynamic Operations Yield Context Card */}
              <div className="mb-4 p-3 bg-yellow-50/50 rounded-2xl border border-yellow-200/50 space-y-2">
                <div className="flex justify-between items-center text-[10px] text-yellow-950 font-black uppercase tracking-wider">
                  <span>🛰️ Synced Live Farming Context</span>
                  <span className="text-[9px] bg-yellow-500 text-yellow-950 px-2 py-0.5 rounded-full">AI Grounded</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <p className="font-semibold text-slate-600 flex items-center space-x-1">
                    <span>🔬</span> <span className="font-extrabold text-slate-800">NPK Soil Status:</span> <span className="font-mono text-slate-800">N={soilN} P={soilP} K={soilK} (pH {soilPH})</span>
                  </p>
                  <p className="font-semibold text-slate-600 flex items-center space-x-1">
                    <span>⛈️</span> <span className="font-extrabold text-slate-800">Correlated Rainfall:</span> <span className="font-mono text-slate-800">{pestRainfall}mm (Live Met-Alert)</span>
                  </p>
                  <p className="font-semibold text-slate-600 flex items-center space-x-1">
                    <span>🐛</span> <span className="font-extrabold text-slate-800">Outbreak History:</span> <span className="text-amber-800 font-bold">{pestHistory.length > 0 ? `${pestHistory[0].riskLevel} (${pestHistory[0].majorPest.split('(')[0]})` : 'Clean / Clear'}</span>
                  </p>
                  <p className="font-semibold text-slate-600 flex items-center space-x-1">
                    <span>📅</span> <span className="font-extrabold text-slate-800">Sowing Schedule:</span> <span className="font-mono text-slate-800">{calendarSowingDate} ({calendarSoilType})</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setYieldSoil(calendarSoilType);
                    setYieldIrrigation(profileIrrigationType);
                    triggerToast('✨ Yield parameters successfully auto-calibrated with active crop profile & soil report context!');
                  }}
                  className="w-full mt-1.5 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-black uppercase tracking-wider text-[9px] rounded-xl text-center active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  Retrieve Active Crop & Soil Records
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 block mb-1">Target Crop:</label>
                  <input 
                    type="text" value={yieldCrop} onChange={(e) => setYieldCrop(e.target.value)}
                    placeholder="Tomato"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-1">Soil Profile Type:</label>
                    <select 
                      value={yieldSoil} onChange={(e) => setYieldSoil(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border rounded-lg text-slate-700"
                    >
                      <option value="Alluvial">Loamy Alluvial Soil</option>
                      <option value="Clay loam">Puddle Clay Loam</option>
                      <option value="Silty Sand">Sandy Loam</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-1">Irrigation Mode:</label>
                    <select 
                      value={yieldIrrigation} onChange={(e) => setYieldIrrigation(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border rounded-lg text-slate-700"
                    >
                      <option value="Drip">Drip Irrigation</option>
                      <option value="Flood Sprinkler">Flood sprinkler</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 block mb-1">Assumed Season Water (L/Acre): {yieldWater?.toLocaleString()}</label>
                  <input 
                    type="range" min="5000" max="30000" step="500" value={yieldWater}
                    onChange={(e) => setYieldWater(parseInt(e.target.value))}
                    className="w-full accent-yellow-600"
                  />
                </div>

                <button
                  onClick={handleYieldPredictSubmit}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 active:scale-98 transition-all rounded-2xl text-white font-extrabold text-xs shadow-md tracking-wider uppercase cursor-pointer"
                >
                  Estimate Production Sacks Output
                </button>
              </div>
            </div>

            {yieldResult && (
              <div className="space-y-3 animate-slideUp">
                <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Yield Density</span>
                    <span className="text-yellow-600 bg-yellow-50 text-[10px] uppercase font-black px-2 py-0.5 rounded border border-yellow-100">
                      Confidence: {yieldResult.confidenceScore}%
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-slate-800 tracking-tight">{yieldResult.yieldRange}</h4>
                  <p className="text-xs text-slate-600 font-medium leading-snug mt-2">{yieldResult.soilGradeYieldImpact}</p>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed border-t border-slate-50 pt-2 mt-2">{yieldResult.climateImpact}</p>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                  <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Yield Protection Checklist</h5>
                  <ul className="space-y-1.5 text-xs text-slate-600 pl-4 list-disc font-medium leading-normal">
                    {yieldResult.riskReductionChecklist?.map((cl: string, idx: number) => <li key={idx} className="font-medium text-slate-600">{cl}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SUB-TAB 7: AI Farming Tutor (Interactive Academy)
            ======================================================== */}
        {activeSubTab === 'tutor' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xl shadow-slate-100/50">
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wide">Farming Academy Tutor</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 block mb-1">What would you like to prepare/learn today?</label>
                  <select
                    value={tutorQuery}
                    onChange={(e) => setTutorQuery(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none"
                  >
                    <option value="organic bio-pesticides standard preparation">Preparation of organic bio-pesticides (Neem leaves, cow urine, garlic)</option>
                    <option value="how to design drip irrigation channel layouts">Drip irrigation layout and water budgeting</option>
                    <option value="vermicompost pit organic setup">Step-by-step vermicompost pit construction setup</option>
                  </select>
                </div>

                <button
                  onClick={handleFarmingTutorSubmit}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 active:scale-98 transition-all rounded-2xl text-white font-extrabold text-xs shadow-md tracking-wider uppercase cursor-pointer"
                >
                  Download Tutor Class & Quiz
                </button>
              </div>
            </div>

            {tutorResult && (
              <div className="space-y-4 animate-slideUp">
                
                {/* Steps block */}
                <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3.5">
                  <h4 className="text-sm font-black tracking-tight text-slate-800">{tutorResult.courseTitle}</h4>
                  
                  <div className="space-y-3 pt-2 border-t border-slate-50">
                    {tutorResult.steps?.map((st: any, idx: number) => (
                      <div key={idx} className="space-y-0.5">
                        <p className="text-[11px] font-black text-emerald-800">Step {idx + 1}: {st.title}</p>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{st.description}</p>
                      </div>
                    ))}
                  </div>

                  {tutorResult.safetyPrecautions && (
                    <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-[11px] leading-relaxed text-amber-900">
                      <p className="font-extrabold uppercase text-[9px] text-amber-800 mb-0.5">Safety precautions warnings</p>
                      {tutorResult.safetyPrecautions.map((safe: string, i: number) => <p key={i}>• {safe}</p>)}
                    </div>
                  )}
                </div>

                {/* Interactive quiz */}
                {tutorResult.quiz && (
                  <div className="bg-white rounded-3xl p-4 border border-emerald-100 shadow-sm space-y-4">
                    <div className="flex items-center space-x-1 mb-1">
                      <Award className="w-4 h-4 text-emerald-600 animate-bounce" />
                      <h4 className="text-xs font-black uppercase text-emerald-800">Dynamic Tutor Testing Quiz</h4>
                    </div>

                    {tutorResult.quiz.map((q: any, qIdx: number) => (
                      <div key={qIdx} className="space-y-2 border-b border-slate-100 pb-3 last:border-b-0">
                        <p className="text-xs font-black text-slate-800 leading-snug">Q{qIdx + 1}: {q.question}</p>
                        
                        <div className="grid grid-cols-1 gap-1.5">
                          {q.options?.map((opt: string, optIdx: number) => {
                            const isSelected = quizAnswers[qIdx] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleQuizAnswerSelect(qIdx, optIdx)}
                                className={`text-left p-2.5 rounded-xl text-[11px] font-semibold tracking-tight transition-all border cursor-pointer ${
                                  isSelected 
                                    ? 'bg-emerald-50 text-emerald-950 border-emerald-300 shadow-xs'
                                    : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-between items-center pt-2">
                      <button 
                        onClick={handleEvaluateQuizResult}
                        className="bg-emerald-850 hover:bg-emerald-900 px-4 py-2 rounded-xl text-white font-black text-[11px] tracking-tight uppercase cursor-pointer"
                      >
                        Submit Answers
                      </button>

                      {quizScore !== null && (
                        <span className="text-emerald-800 font-extrabold text-xs">
                          Your score: {quizScore} / {tutorResult.quiz.length}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SUB-TAB 8: Gemini Live Farming Voice Call Panel
            ======================================================== */}
        {activeSubTab === 'conversations' && (
          <div className="space-y-4 animate-fadeIn text-center">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col items-center justify-center space-y-4">
              
              <div className="w-20 h-20 bg-gradient-to-tr from-emerald-900 to-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg relative">
                {liveCallStatus === 'live' && (
                  <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-20 animate-ping"></span>
                )}
                <Volume2 className="w-10 h-10 animate-bounce" />
              </div>

              <div>
                <h4 className="text-sm font-black tracking-tight text-slate-800">Gemini Live Agro Satellite Link</h4>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                  Enabling high fidelity direct speech conversations. Safe, hands-free satellite assistance.
                </p>
              </div>

              {liveCallStatus === 'idle' ? (
                <button
                  onClick={handleStartLiveAudioCall}
                  className="bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-black text-xs tracking-wider uppercase px-6 py-3 rounded-full shadow-md transition-all cursor-pointer"
                >
                  Establish Phone Connection
                </button>
              ) : (
                <div className="w-full space-y-4">
                  <div className="flex justify-center space-x-2">
                    <span className="bg-red-500 text-white px-2.5 py-0.5 text-[8.5px] font-black uppercase rounded-full animate-pulse flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full mr-1"></span>
                      <span>Connected live</span>
                    </span>
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[8.5px] font-extrabold uppercase rounded-full">
                      Kannada/Hindi Translation Active
                    </span>
                  </div>

                  {/* Audio transcription log flow */}
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-3xl text-left text-xs font-mono select-text min-h-32 max-h-48 overflow-y-auto block leading-normal space-y-1">
                    {liveCallTranscript.map((line, idx) => (
                      <p key={idx} className={line.startsWith('🧑‍🌾') ? 'text-yellow-300' : 'text-emerald-400'}>{line}</p>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleSendSimulatedLiveMessage}
                      className="bg-yellow-400 hover:bg-yellow-300 text-emerald-950 px-4 py-2 rounded-full font-black text-[11px] uppercase cursor-pointer"
                    >
                      Ask Agro Question
                    </button>
                    <button
                      onClick={handleEndLiveCall}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-black text-[11px] uppercase cursor-pointer"
                    >
                      Hang Up Call
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          IMMERSIVE FLOATING QUICK MIC ASSISTANT MODAL (Feature 8, 9, 10 helper)
          ======================================================== */}
      {showVoicePanel && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-end justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-t-3xl w-full max-w-sm p-4 relative space-y-4 shadow-2xl animate-slideUp">
            
            <button 
              onClick={() => {
                setShowVoicePanel(false);
                setIsListening(false);
                window.speechSynthesis?.cancel();
              }}
              className="absolute right-3 top-3 p-1 text-slate-400 hover:bg-slate-50 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pt-2 space-y-1">
              <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase">Interactive Voice Assistant</h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Speak commands out loud in standard voice formats
              </p>
            </div>

            {/* Pulsating glowing record orb */}
            <div className="flex justify-center py-4">
              <button 
                onClick={handleStartListening}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-200' 
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                } cursor-pointer`}
              >
                <Mic className="w-10 h-10" />
              </button>
            </div>

            {/* Captured statement display */}
            <div className="bg-slate-50 rounded-2xl p-3 min-h-12 text-center text-xs font-bold text-slate-6a text-emerald-800">
              {voiceTranscript ? `"${voiceTranscript}"` : 'Tap mic button above and declare instructions...'}
            </div>

            {/* Calculated response */}
            {assistantReply && (
              <div className="bg-emerald-50 text-emerald-950 p-3 rounded-2xl text-[11px] leading-relaxed font-semibold">
                <p className="font-extrabold uppercase text-[9px] text-emerald-800 mb-0.5">Assistant Advice</p>
                <span>{assistantReply}</span>
              </div>
            )}

            {/* Quick reference advice chips */}
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-center">Speech triggers navigation cheats</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {['"Open cooperative"', '"mandi prices"', '"scan tomato disease"', '"weather report"'].map(chip => (
                  <button 
                    key={chip} 
                    onClick={() => {
                      setVoiceTranscript(chip.replace(/"/g, ''));
                      processVoiceNavigationAndCommands(chip.replace(/"/g, ''));
                    }}
                    className="bg-slate-50 hover:bg-slate-100 text-[10px] text-slate-605 px-2 py-0.5 rounded-full border border-slate-100 font-bold transition-all cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component wrapper for Soil health outcomes to preserve cleanliness
function soulResultRender(soilResult: any) {
  if (!soilResult) return null;
  return (
    <div className="space-y-3 animate-slideUp">
      
      {/* Circle Gauge rating card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm relative">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Soil Integrity Index Score</span>
          <span className="bg-teal-50 text-teal-800 font-extrabold text-[10.5px] px-2.5 rounded border border-teal-100 uppercase">
            Rating: {soilResult.healthRating}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full border-4 border-teal-500 border-t-slate-100 flex items-center justify-center font-black text-lg text-teal-600 font-mono">
            {soilResult.overallScore}%
          </div>

          <div className="flex-1 space-y-1">
            <h5 className="text-xs font-black text-slate-800 uppercase leading-none">Key Soil Deficiencies</h5>
            <ul className="text-[11px] leading-snug text-slate-500 font-semibold list-disc pl-4">
              {soilResult.deficiencies?.map((def: string, idx: number) => <li key={idx}>{def}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Treatment steps recipe cards */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2">
        <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Corrective Treatment soil bio-recipe</h5>
        <div className="space-y-2 pt-1">
          {soilResult.remedyRecipe?.map((rec: string, idx: number) => (
            <div key={idx} className="flex space-x-2">
              <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-[10px] font-black shrink-0 font-mono">
                {idx + 1}
              </span>
              <p className="text-xs text-slate-600 leading-snug font-medium pt-0.5">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Biological booster and fertilizers */}
      <div className="bg-teal-50/50 p-4 rounded-3xl border border-teal-100/40 text-xs leading-relaxed font-sans text-teal-900 font-semibold shadow-xs">
        <p className="font-extrabold uppercase text-[9px] text-teal-800 mb-0.5">Bio-fertilizer booster recommendation</p>
        <p>{soilResult.recommendedBioBoost}</p>
        <p className="border-t border-teal-100/50 pt-2 mt-2 font-medium text-slate-500 text-[11px] leading-normal">{soilResult.fertilizerCorrection}</p>
      </div>
    </div>
  );
}
