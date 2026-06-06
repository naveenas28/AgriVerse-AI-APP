import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  Droplets, 
  Calendar, 
  Save, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Plus, 
  Trash2, 
  Play, 
  Sliders, 
  X, 
  Check, 
  CheckCircle, 
  AlertTriangle, 
  Activity,
  Award,
  Zap,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';
import { LanguageCode } from '../types';

interface SmartIrrigationAdvisorProps {
  currentLang: LanguageCode;
  onClose: () => void;
  triggerToast: (msg: string) => void;
}

interface IrrigationLog {
  id: string;
  crop: string;
  date: string;
  liters: number;
  method: string;
  duration: number;
  status: string;
  notes: string;
}

interface CropIrrigationMetadata {
  name: { en: string; kn: string; hi: string };
  bestMethod: string;
  idealMoistureRange: string;
  dailyWaterRequirement: string;
  soilDrynessThreshold: number;
  frequency: string;
  waterSavingTips: string;
}

const CROP_METADATA_MAP: Record<string, CropIrrigationMetadata> = {
  rice: {
    name: { en: 'Sona Masuri Rice (ಭತ್ತ)', kn: 'ಭತ್ತ (Rice)', hi: 'धान (Rice)' },
    bestMethod: 'Controlled Flood Basin',
    idealMoistureRange: '70% - 90%',
    dailyWaterRequirement: '15 - 20 mm / day',
    soilDrynessThreshold: 60,
    frequency: 'Continuously Submerged (Keep 5cm water height)',
    waterSavingTips: 'Perform Alternate Wetting and Drying (AWD) to save 30% of ponding water without yield loss.'
  },
  tomato: {
    name: { en: 'Hybrid Tomato (ಟೊಮೆಟೊ)', kn: 'ಟೊಮೆಟೊ (Tomato)', hi: 'टमाटर (Tomato)' },
    bestMethod: 'Sub-surface Drip Irrigation',
    idealMoistureRange: '50% - 65%',
    dailyWaterRequirement: '5 - 7 mm / day',
    soilDrynessThreshold: 45,
    frequency: 'Once every 2 days (Prefer twilight)',
    waterSavingTips: 'Use micro-drips to target root zone strictly. Apply mulch mulch straws to reduce evaporation by 40%.'
  },
  onion: {
    name: { en: 'Bellary Onion (ಈರುಳ್ಳಿ)', kn: 'ಈರುಳ್ಳಿ (Onion)', hi: 'प्याज (Onion)' },
    bestMethod: 'Micro-Drip Lateral Lines',
    idealMoistureRange: '45% - 60%',
    dailyWaterRequirement: '3 - 5 mm / day',
    soilDrynessThreshold: 40,
    frequency: 'Once every 3 days',
    waterSavingTips: 'Onions have shallow fibrous roots. Frequent short irrigations prevent water percolation beyond roots.'
  },
  sugarcane: {
    name: { en: 'Coimbatore Sugarcane (ಕಬ್ಬು)', kn: 'ಕಬ್ಬು (Sugarcane)', hi: 'गन्ना (Sugarcane)' },
    bestMethod: 'Inter-row Furrow Drip',
    idealMoistureRange: '60% - 75%',
    dailyWaterRequirement: '12 - 16 mm / day',
    soilDrynessThreshold: 50,
    frequency: 'Every 4 to 6 days depending on canopy',
    waterSavingTips: 'Use wide-row trash mulching. Restricting water 1 month before harvesting enhances sugarcane sucrose content.'
  },
  millet: {
    name: { en: 'Organic Ragi/Millet (ರಾಗಿ)', kn: 'ರಾಗಿ/ಸಜ್ಜೆ (Rillet)', hi: 'बाजरा/रागि (Millet)' },
    bestMethod: 'Rain-port Sprinklers',
    idealMoistureRange: '30% - 45%',
    dailyWaterRequirement: '2 - 3 mm / day',
    soilDrynessThreshold: 30,
    frequency: 'Once in 7 to 10 days (Very drought-hardy)',
    waterSavingTips: 'Millet is exceptionally hardy. Irrigate only during key flowering or grain-filling stages if rains fail.'
  },
  cotton: {
    name: { en: 'Bt Cotton (ಹತ್ತಿ)', kn: 'ಹತ್ತಿ (Cotton)', hi: 'कपास (Cotton)' },
    bestMethod: 'Alternate Furrow Irrigation',
    idealMoistureRange: '40% - 55%',
    dailyWaterRequirement: '6 - 8 mm / day',
    soilDrynessThreshold: 35,
    frequency: 'Every 5 days in peak squaring stage',
    waterSavingTips: 'Adopt alternate furrow irrigation to save 50% water. Avoid irrigation entirely during boll opening stage.'
  }
};

const MULTILINGUAL_TRANSLATIONS: Record<string, any> = {
  en: {
    advisorTitle: 'Krishi Smart Irrigation Advisor',
    closeBtn: 'Close Dashboard',
    moistureSection: 'AI Soil Moisture Estimation',
    moistureLabel: 'Field soil wetness',
    thresholdLabel: 'Underwatering Alert Threshold',
    statusCritical: 'Critical Dry - Irrigation Urgent',
    statusOptimal: 'Optimal Moisty - Growth Stable',
    statusSaturated: 'Water Saturated - Avoid Overwatering',
    wateringLogTab: 'Watering Ledger',
    addLogTitle: 'Record Watering Session',
    logHistoryTitle: 'Cloud-synced Log History',
    cropLabel: 'Select Crop Category',
    waterMethodLabel: 'Irrigation Pattern Method',
    litersLabel: 'Water Volume (Liters)',
    durationLabel: 'Duration (Minutes)',
    notesLabel: 'Special Notes / Observations',
    notesPlaceholder: 'e.g. Twilight drip cycle, high compost...',
    submitBtn: 'Log Session to Cloud Database',
    savingTitle: 'Eco-Water Preservation',
    autoBypassLabel: 'Automated Smart Pump Override',
    dripOptimizedText: 'Drip flow minimizes fertilizer leaching and saves up to 45% canal water.',
    voiceInstructionTitle: 'Bilingual Audio Guide',
    voiceInstructBtn: 'Narrate Irrigation Report',
    voiceStopBtn: 'Mute Audio Guide',
    totalSavedNotice: 'Smart conservation saved 14.5 KL water this crop cycle',
    addLogSuccess: 'Watering recorded successfully to cloud files.',
    deleteLogSuccess: 'Irrigation audit cleared.',
    preferencesSaved: 'Farmer smart irrigation settings synced successfully.',
    rainBypassLabel: 'Cloud Monsoon Rain Bypass',
    deviceTypeLabel: 'Hardware Controller Valve Model'
  },
  kn: {
    advisorTitle: 'ಕೃಷಿ ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ ಸಲಹೆಗಾರ',
    closeBtn: 'ಮುಚ್ಚಿ',
    moistureSection: 'ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಮಣ್ಣಿನ ತೇವಾಂಶ ಅಂದಾಜು',
    moistureLabel: 'ಭೂಮಿಯ ತೇವಾಂಶ ಮಟ್ಟ',
    thresholdLabel: 'ಕಡಿಮೆ ತೇವಾಂಶ ಎಚ್ಚರಿಕೆ ಮಟ್ಟ',
    statusCritical: 'ತುಂಬಾ ಒಣಗಿದೆ - ತಕ್ಷಣ ನೀರು ಹಾಯಿಸಿ',
    statusOptimal: 'ಉತ್ತಮ ತೇವಾಂಶ - ಬೆಳೆ ಬೆಳವಣಿಗೆ ಸ್ಥಿರ',
    statusSaturated: 'ಹೆಚ್ಚು ನೀರು ನಿಂತಿದೆ - ನೀರನ್ನು ನಿಲ್ಲಿಸಿ',
    wateringLogTab: 'ನೀರಾವರಿ ದಿನಚರಿ',
    addLogTitle: ' ನೀರು ಉಣಿಸುವಿಕೆ ದಾಖಲಿಸಿ',
    logHistoryTitle: 'ಕ್ಲೌಡ್ ಸಿಂಕ್ ಇತಿಹಾಸ',
    cropLabel: 'ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ',
    waterMethodLabel: 'ನೀರಾವರಿ ವಿಧಾನ',
    litersLabel: 'ನೀರಿನ ಪ್ರಮಾಣ (ಲೀಟರ್ಗಳಲ್ಲಿ)',
    durationLabel: 'ಸಮಯ (ನಿಮಿಷಗಳಲ್ಲಿ)',
    notesLabel: 'ಟಿಪ್ಪಣಿಗಳು / ಅವಲೋಕನ',
    notesPlaceholder: 'ಉದಾ: ಸಾಯಂಕಾಲದ ಹನಿ ನೀರಾವರಿ...',
    submitBtn: 'ನೀರಾವರಿ ದಾಖಲೆಯನ್ನು ದಾಖಲಿಸಿ',
    savingTitle: 'ಹನಿ ಹನಿ ನೀರು ರಕ್ಷಣೆ',
    autoBypassLabel: 'ಸ್ವಯಂಚಾಲಿತ ಪಂಪ್ ನಿಯಂತ್ರಣ',
    dripOptimizedText: 'ಹನಿ ನೀರಾವರಿ ಪದ್ಧತಿಯು ಪೋಷಕಾಂಶಗಳ ವ್ಯರ್ಥವಾಗುವುದನ್ನು ತಡೆದು ೪೫% ರಷ್ಟು ನೀರನ್ನು ಸಂರಕ್ಷಿಸುತ್ತದೆ.',
    voiceInstructionTitle: 'ದ್ವಿಭಾಷಾ ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ',
    voiceInstructBtn: 'ನೀರಾವರಿ ವರದಿ ಆಲಿಸಿ',
    voiceStopBtn: 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ',
    totalSavedNotice: 'ಈ ಬೆಳೆ ಚಕ್ರದಲ್ಲಿ ೧೪.೫ KL ನೀರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ',
    addLogSuccess: 'ನೀರಾವರಿ ದಾಖಲೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಕ್ಲೌಡ್ ವ್ಯವಸ್ಥೆಗೆ ಸೇರಿಸಲಾಗಿದೆ.',
    deleteLogSuccess: 'ನೀರಾವರಿ ದಾಖಲೆ ಅಳಿಸಲಾಗಿದೆ.',
    preferencesSaved: 'ರೈತರ ನೀರಾವರಿ ಸಂರಚನೆ ಉಳಿಸಲಾಗಿದೆ.',
    rainBypassLabel: 'ಮಳೆ ಬಂದಾಗ ಪಂಪ್ ಸ್ವಯಂ ಬಂದ್',
    deviceTypeLabel: 'ನೀರಾವರಿ ವಾಲ್ವ್ ಸಾಧನದ ಮಾದರಿ'
  },
  hi: {
    advisorTitle: 'कृषि स्मार्ट सिंचाई सलाहकार',
    closeBtn: 'बंद करें',
    moistureSection: 'AI मिट्टी नमी स्व-मूल्यांकन',
    moistureLabel: 'खेत की मिट्टी में गीलापन',
    thresholdLabel: 'कम नमी चेतावनी सीमा',
    statusCritical: 'गंभीर सूखा - तुरंत सिंचाई की आवश्यकता',
    statusOptimal: 'सटीक नमी - फसल विकास सामान्य',
    statusSaturated: 'अत्यधिक जलमग्न - सिंचाई रोकें',
    wateringLogTab: 'सिंचाई खाता एवं रिकॉर्ड',
    addLogTitle: 'सिंचाई का नया विवरण भरें',
    logHistoryTitle: 'क्लाउड-सिंक इतिहास और पुरालेख',
    cropLabel: 'फसल का चयन करें',
    waterMethodLabel: 'सिंचाई पद्धति',
    litersLabel: 'पानी की मात्रा (लीटर में)',
    durationLabel: 'सिंचाई अवधि (मिनट)',
    notesLabel: 'टिप्पणी / अवलोकन',
    notesPlaceholder: 'जैसे: सांध्य कालीन ड्रिप सिंचाई...',
    submitBtn: 'सिंचाई लॉग को सहेजें',
    savingTitle: 'सघन जल संरक्षण प्रणाली',
    autoBypassLabel: 'स्वचालित स्मार्ट पंप बाईपास',
    dripOptimizedText: 'ड्रिप सिंचाई से उर्वरकों की बर्बादी कम होती है और नहर के जल में ४५% तक बचत होती है।',
    voiceInstructionTitle: 'द्विभाषी आवाज गाइड',
    voiceInstructBtn: 'सिंचाई सलाह आवाज में सुनें',
    voiceStopBtn: 'आवाज बंद करें',
    totalSavedNotice: 'स्मार्ट प्रबंध से इस फसल चक्र में १४.५ KL पानी की बचत हुई',
    addLogSuccess: 'सिंचाई विवरण क्लाउड में सुरक्षित हो गया है।',
    deleteLogSuccess: 'सिंचाई ऑडिट विवरण हटा दिया गया।',
    preferencesSaved: 'किसान सिंचाई प्राथमिकताएं सफलतापूर्वक सिंक हुईं।',
    rainBypassLabel: 'वर्षा होने पर पंप ऑटो-स्टॉप',
    deviceTypeLabel: 'हार्डवेयर गेट वाल्व मॉडल'
  }
};

export const SmartIrrigationAdvisor: React.FC<SmartIrrigationAdvisorProps> = ({
  currentLang,
  onClose,
  triggerToast
}) => {
  const trans = MULTILINGUAL_TRANSLATIONS[currentLang] || MULTILINGUAL_TRANSLATIONS['en'];

  // DB Sync states
  const [history, setHistory] = useState<IrrigationLog[]>([]);
  const [preferences, setPreferences] = useState({
    deviceType: 'Smart Drip Valve V2',
    pumpAutomatic: true,
    selectedCrop: 'tomato',
    soilMoistureTrigger: 45,
    rainBypass: true
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Dynamic simulation soil states
  const [estimatedMoisture, setEstimatedMoisture] = useState<number>(54);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Form input states
  const [addCrop, setAddCrop] = useState<string>('tomato');
  const [addLiters, setAddLiters] = useState<string>('1500');
  const [addMethod, setAddMethod] = useState<string>('Drip Irrigation');
  const [addDuration, setAddDuration] = useState<string>('20');
  const [addNotes, setAddNotes] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Fetch initial history & settings from DB
  useEffect(() => {
    fetchIrrigationData();
  }, []);

  const fetchIrrigationData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/irrigation');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
        if (data.preferences) {
          setPreferences(data.preferences);
          setAddCrop(data.preferences.selectedCrop || 'tomato');
          recalculateMoisture(data.preferences.selectedCrop || 'tomato');
        }
      }
    } catch (err) {
      console.error('Error fetching irrigation state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Recalculate soil moisture base purely of representative climate model plus specific crop absorption behavior
  const recalculateMoisture = (cropType: string) => {
    // Standard ambient baseline: 52% wetness. Alternate depending on crop dryness index
    const cropMeta = CROP_METADATA_MAP[cropType];
    if (!cropMeta) return;

    // Simulate dry offset
    if (cropType === 'rice') {
      setEstimatedMoisture(78); // Rice fields are artificially saturated (flooded)
    } else if (cropType === 'millet') {
      setEstimatedMoisture(34); // Millets thrive in arid dry conditions
    } else if (cropType === 'tomato') {
      setEstimatedMoisture(52);
    } else if (cropType === 'onion') {
      setEstimatedMoisture(48);
    } else {
      setEstimatedMoisture(42);
    }
  };

  const handleSavePreferences = async (newPrefs: typeof preferences) => {
    try {
      const res = await fetch('/api/irrigation/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs)
      });
      if (res.ok) {
        const updated = await res.json();
        setPreferences(updated);
        triggerToast(trans.preferencesSaved);
      }
    } catch (err) {
      console.error('Error saving presets:', err);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addLiters || isNaN(parseFloat(addLiters))) {
      triggerToast('Please supply a valid numeric volume parameter');
      return;
    }
    try {
      setIsAdding(true);
      const res = await fetch('/api/irrigation/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: CROP_METADATA_MAP[addCrop]?.name[currentLang] || addCrop,
          liters: parseFloat(addLiters),
          method: addMethod,
          duration: parseInt(addDuration) || 15,
          notes: addNotes
        })
      });
      if (res.ok) {
        const created = await res.json();
        setHistory([created, ...history]);
        triggerToast(trans.addLogSuccess);
        // Reset form inputs
        setAddNotes('');
        // Saturate moisture value to signify sudden irrigation watering
        setEstimatedMoisture(prev => Math.min(95, prev + 18));
      }
    } catch (err) {
      console.error('Error logging irrigation run:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      const res = await fetch(`/api/irrigation/history/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setHistory(history.filter(log => log.id !== id));
        triggerToast(trans.deleteLogSuccess);
      }
    } catch (err) {
      console.error('Error purging irrigation log:', err);
    }
  };

  // Text-To-Speech guidance logic
  const handleTTSVoiceGuide = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const activeMeta = CROP_METADATA_MAP[preferences.selectedCrop];
      if (!activeMeta) return;

      const cropLocalizedName = activeMeta.name[currentLang];
      let promptText = '';

      if (currentLang === 'kn') {
        promptText = `${trans.advisorTitle} ವರದಿ. ನಿಮ್ಮ ಆಯ್ಕೆ ಬೆಳೆ: ${cropLocalizedName}. ಮಣ್ಣಿನ ತೇವಾಂಶ ಶೇಕಡಾ ${estimatedMoisture} ರಷ್ಟಿದೆ. ಶಿಫಾರಸು ಮಾಡಲಾದ ವಿಧಾನ: ${activeMeta.bestMethod}. ಹನಿ ನೀರಾವರಿಯಿಂದ ಪ್ರತಿ ವರ್ಷ ಶೇಕಡಾ ನಲವತ್ತೈದು ನೀರು ಉಳಿಸಬಹುದು. ಮಳೆ ಬೈಪಾಸ್ ಸಕ್ರಿಯವಾಗಿದೆ.`;
      } else if (currentLang === 'hi') {
        promptText = `${trans.advisorTitle} रिपोर्ट। आपकी चयनित फसल: ${cropLocalizedName}। मिट्टी की वर्तमान आर्द्रता ${estimatedMoisture} प्रतिशत है। अनुशंसित प्रणाली: ${activeMeta.bestMethod}। ड्रिप वाल्व चालू है, और वर्षा होने पर सिंचाई स्वतः टल जाएगी।`;
      } else {
        promptText = `Welcome to the ${trans.advisorTitle}. Selected crop is ${cropLocalizedName}. Soil moisture index is evaluated at ${estimatedMoisture} percent. Recommended water technique is ${activeMeta.bestMethod}, needing ${activeMeta.dailyWaterRequirement}. Drip conservation is active to reduce water evaporation in dry climates.`;
      }

      const utterance = new SpeechSynthesisUtterance(promptText);
      
      // Attempt language-matching voice selection
      if (currentLang === 'kn') utterance.lang = 'kn-IN';
      else if (currentLang === 'hi') utterance.lang = 'hi-IN';
      else utterance.lang = 'en-IN';

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      triggerToast('Audio narrative voice engine is unavailable inside browser iframe frame properties.');
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Determine warnings dynamically
  const isSoilUnderwatered = estimatedMoisture < preferences.soilMoistureTrigger;
  const isSoilOverwatered = estimatedMoisture > 80;

  return (
    <div 
      className="absolute inset-x-0 top-0 min-h-full bg-slate-900/40 backdrop-blur-md z-50 p-4 flex justify-center items-start animate-fade-in"
      onClick={() => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        setIsSpeaking(false);
        onClose();
      }}
    >
      <div 
        className="bg-white rounded-[32px] w-full max-w-md shadow-2xl border border-blue-100 overflow-hidden mt-6 mb-12 flex flex-col animate-slide-up pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sky-Blue Water Visual Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-emerald-800 p-5 text-white flex justify-between items-center relative">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center animate-pulse">
              <Droplets className="w-5.5 h-5.5 text-blue-200" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight uppercase leading-tight">{trans.advisorTitle}</h1>
              <p className="text-[10px] text-blue-100 font-bold opacity-90">AgriVerse Smart Irrigation Matrix</p>
            </div>
          </div>
          <button 
            id="close_irrigation_advisor"
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              setIsSpeaking(false);
              onClose();
            }}
            className="p-1.5 bg-black/20 hover:bg-black/40 rounded-full cursor-pointer transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Moisture Estimation Dashboard Section */}
        <div className="p-4 bg-blue-50/50 border-b border-blue-50 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-blue-700" />
              <span>{trans.moistureSection}</span>
            </h3>
            <span className="text-[9px] text-blue-800 bg-blue-100 font-black px-2 py-0.5 rounded-full uppercase border border-blue-200 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
              <span>Sensors Active</span>
            </span>
          </div>

          {/* Large Arc-like progress bar indicator for Soil Moisture */}
          <div className="bg-white rounded-2xl p-4 border border-blue-100 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider leading-none">{trans.moistureLabel}</p>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-black text-blue-950 font-mono tracking-tight">{estimatedMoisture}%</span>
                <span className="text-xs text-blue-600 font-bold">VMC</span>
              </div>
              <p className={`text-[10px] font-extrabold flex items-center space-x-1 ${
                isSoilUnderwatered ? 'text-amber-700' : isSoilOverwatered ? 'text-red-700' : 'text-emerald-700'
              }`}>
                {isSoilUnderwatered ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{trans.statusCritical}</span>
                  </>
                ) : isSoilOverwatered ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{trans.statusSaturated}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{trans.statusOptimal}</span>
                  </>
                )}
              </p>
            </div>

            {/* Simulated Pie / Visual Gauge */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${isSoilUnderwatered ? 'text-amber-500' : isSoilOverwatered ? 'text-blue-400' : 'text-emerald-600'}`}
                  strokeWidth="3.5"
                  strokeDasharray={`${estimatedMoisture}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Droplet className={`w-5 h-5 ${isSoilUnderwatered ? 'text-amber-500 animate-bounce' : 'text-blue-600 animate-pulse'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Central configurations & control settings */}
        <div id="irrigation_presets_card" className="p-4 space-y-3.5">
          {/* Smart Alerts Box */}
          {isSoilUnderwatered && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex space-x-2.5 items-start">
              <div className="bg-amber-500 text-white p-1.5 rounded-lg shrink-0">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <p className="text-[11px] text-amber-950 font-black uppercase tracking-wider">Root-Zone Dryness Detected</p>
                <p className="text-[10px] text-amber-800 font-bold leading-normal mt-0.5">
                  Moisture level fallen below trigger threshold of {preferences.soilMoistureTrigger}%. Schedule drip loop or initiate smart water pump valve now.
                </p>
              </div>
            </div>
          )}

          {/* Voice advisor button */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-3 rounded-2xl text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isSpeaking ? (
                <Volume2 className="w-5 h-5 text-emerald-400 animate-ping shrink-0" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-300 shrink-0" />
              )}
              <div>
                <p className="text-[10px] text-slate-200 font-bold leading-none">{trans.voiceInstructionTitle}</p>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Audible weather-aware guide</p>
              </div>
            </div>
            <button
              onClick={handleTTSVoiceGuide}
              className={`text-[9px] font-extrabold uppercase px-3 py-1.5 rounded-xl cursor-pointer transition-all active:scale-95 ${
                isSpeaking ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isSpeaking ? trans.voiceStopBtn : trans.voiceInstructBtn}
            </button>
          </div>

          {/* Crop Config Grid */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 space-y-3">
            <div>
              <label className="block text-[10px] text-slate-400 font-black uppercase tracking-wide mb-1">
                {trans.cropLabel}
              </label>
              <select
                value={preferences.selectedCrop}
                onChange={(e) => {
                  const val = e.target.value;
                  const upd = { ...preferences, selectedCrop: val };
                  setPreferences(upd);
                  setAddCrop(val);
                  recalculateMoisture(val);
                  handleSavePreferences(upd);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-black outline-none focus:border-blue-500 text-slate-800"
              >
                <option value="rice"> Rice / Paddy / Sona Masuri</option>
                <option value="tomato">Tomato / Hybrid Roma</option>
                <option value="onion">Onion / Red Bellary</option>
                <option value="sugarcane">Sugarcane / High-Sucrose CoM</option>
                <option value="millet">Millet / Organic Ragi / Sajjey</option>
                <option value="cotton">Cotton / BT Long-Staple</option>
              </select>
            </div>

            {/* Dynamic crop specific advice cards */}
            {CROP_METADATA_MAP[preferences.selectedCrop] && (
              <div className="bg-white rounded-xl p-3 border border-blue-50 space-y-2">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-50">
                  <span className="text-[9px] text-blue-800 font-bold bg-blue-100/70 px-2 py-0.5 rounded-md uppercase">
                    {CROP_METADATA_MAP[preferences.selectedCrop].bestMethod}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono font-bold">
                    Range: {CROP_METADATA_MAP[preferences.selectedCrop].idealMoistureRange}
                  </span>
                </div>
                
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-slate-500">Need / Day:</span>
                  <span className="font-extrabold text-blue-900 font-mono">{CROP_METADATA_MAP[preferences.selectedCrop].dailyWaterRequirement}</span>
                </div>

                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-slate-500">Frequency:</span>
                  <span className="font-extrabold text-slate-700">{CROP_METADATA_MAP[preferences.selectedCrop].frequency}</span>
                </div>

                <div className="p-2 bg-yellow-50/50 rounded-lg text-[10px] text-slate-600 font-semibold border border-yellow-100 flex items-start space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-yellow-700 shrink-0 mt-0.5" />
                  <span>{CROP_METADATA_MAP[preferences.selectedCrop].waterSavingTips}</span>
                </div>
              </div>
            )}

            {/* Smart sliders: Adjust triggering threshold level & toggle hardware values */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-slate-600 text-[10px] uppercase">{trans.thresholdLabel}</span>
                <span className="font-mono font-black text-blue-800 text-xs">{preferences.soilMoistureTrigger}% Moisture</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={preferences.soilMoistureTrigger}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  const upd = { ...preferences, soilMoistureTrigger: val };
                  setPreferences(upd);
                }}
                onMouseUp={() => handleSavePreferences(preferences)}
                onTouchEnd={() => handleSavePreferences(preferences)}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
              />
            </div>

            {/* Toggle Switch elements */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] font-extrabold">
              <label 
                onClick={() => {
                  const upd = { ...preferences, rainBypass: !preferences.rainBypass };
                  setPreferences(upd);
                  handleSavePreferences(upd);
                }}
                className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  preferences.rainBypass 
                    ? 'bg-blue-50/70 border-blue-400 text-blue-900 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <span>{trans.rainBypassLabel}</span>
                <input 
                  type="checkbox" 
                  checked={preferences.rainBypass} 
                  onChange={() => {}} // handled by parent click
                  className="hidden" 
                />
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${preferences.rainBypass ? 'bg-blue-600 border-transparent text-white' : 'border-slate-300'}`}>
                  {preferences.rainBypass && <Check className="w-2.5 h-2.5" />}
                </span>
              </label>

              <label 
                onClick={() => {
                  const upd = { ...preferences, pumpAutomatic: !preferences.pumpAutomatic };
                  setPreferences(upd);
                  handleSavePreferences(upd);
                }}
                className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  preferences.pumpAutomatic 
                    ? 'bg-emerald-50/70 border-emerald-400 text-emerald-900 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <span>{trans.autoBypassLabel}</span>
                <input 
                  type="checkbox" 
                  checked={preferences.pumpAutomatic} 
                  onChange={() => {}} // handled by parent click
                  className="hidden" 
                />
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${preferences.pumpAutomatic ? 'bg-emerald-600 border-transparent text-white' : 'border-slate-300'}`}>
                  {preferences.pumpAutomatic && <Check className="w-2.5 h-2.5" />}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* ECO WATER PRESERVATION SCORE CARD */}
        <div className="px-4 pb-2">
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 p-3 rounded-2xl border border-emerald-500/20 flex space-x-2.5 items-center">
            <div className="bg-emerald-500 text-white p-2 rounded-xl shrink-0">
              <Award className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[10px] text-emerald-900 font-extrabold uppercase tracking-wide flex items-center space-x-1">
                <span>{trans.savingTitle}</span>
                <span className="bg-emerald-200/60 font-black text-[8px] text-emerald-850 px-1.5 rounded">Active</span>
              </p>
              <p className="text-[9px] text-emerald-800 font-bold mt-0.5">
                {trans.totalSavedNotice}. Micro-drips prevent canopy root rot disease.
              </p>
            </div>
          </div>
        </div>

        {/* LOG WATER SESSION MANUALLY */}
        <div className="p-4 space-y-3">
          <div className="border-t border-slate-100 pt-3">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1 mb-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>{trans.addLogTitle}</span>
            </h4>

            <form onSubmit={handleAddLog} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] uppercase font-black text-slate-400 mb-0.5">Liters Applied</label>
                  <input
                    type="number"
                    value={addLiters}
                    onChange={(e) => setAddLiters(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border text-xs font-bold p-2 rounded-xl outline-none"
                    placeholder="e.g. 1500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase font-black text-slate-400 mb-0.5">Method Pattern</label>
                  <select
                    value={addMethod}
                    onChange={(e) => setAddMethod(e.target.value)}
                    className="w-full bg-slate-50 transition-all border text-xs font-bold p-2 rounded-xl outline-none"
                  >
                    <option value="Drip Irrigation">Drip Irrigation</option>
                    <option value="Flood Basin">Flood Basin</option>
                    <option value="Micro-Sprinkler">Micro-Sprinkler</option>
                    <option value="Manual Spray">Manual Spray</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] uppercase font-black text-slate-400 mb-0.5">Duration (mins)</label>
                  <input
                    type="number"
                    value={addDuration}
                    onChange={(e) => setAddDuration(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border text-xs font-bold p-2 rounded-xl outline-none"
                    placeholder="e.g. 25"
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase font-black text-slate-400 mb-0.5">Special Comment</label>
                  <input
                    type="text"
                    value={addNotes}
                    onChange={(e) => setAddNotes(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border text-xs font-bold p-2 rounded-xl outline-none"
                    placeholder={trans.notesPlaceholder}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAdding}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black text-[10px] uppercase py-2.5 rounded-xl cursor-pointer shadow-md transition-all active:scale-95 text-center flex items-center justify-center space-x-1"
              >
                <span>{isAdding ? 'Syncing...' : trans.submitBtn}</span>
              </button>
            </form>
          </div>

          {/* HISTORIC CLOUD LOGS LISTING */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-extrabold text-slate-600 text-[10px] uppercase tracking-wide">
              {trans.logHistoryTitle}
            </h4>

            {isLoading ? (
              <p className="text-[10px] text-slate-400 font-bold">Syncing live database registries...</p>
            ) : history.length === 0 ? (
              <p className="text-[10px] text-slate-400 font-bold">No historic schedules logged yet.</p>
            ) : (
              <div className="space-y-1.5 pr-1">
                {history.map((log) => (
                  <div key={log.id} className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex justify-between items-start text-[10px]">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-black text-slate-800 truncate">{log.crop}</span>
                        <span className="text-[8px] bg-slate-200 text-slate-700 px-1 rounded font-mono">{log.date}</span>
                      </div>
                      <p className="text-slate-500 font-bold">
                        {log.liters.toLocaleString()} Liters • {log.duration} mins • <span className="text-blue-800 font-extrabold">{log.method}</span>
                      </p>
                      {log.notes && (
                        <p className="text-slate-400 italic font-medium leading-none mt-0.5 truncate pr-2">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="text-red-500 hover:text-red-800 p-1 shrink-0 cursor-pointer transition-all hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
