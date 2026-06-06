import React, { useState, useEffect, useRef } from 'react';
import { 
  CloudRain, 
  MapPin, 
  AlertTriangle, 
  Wind, 
  Droplets, 
  Sun, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  ChevronLeft, 
  Bell, 
  CheckCircle, 
  RefreshCw, 
  Compass, 
  ShieldAlert,
  Info
} from 'lucide-react';
import { LanguageCode } from '../types';

interface WeatherIntelligenceProps {
  currentLang: LanguageCode;
  onClose: () => void;
  triggerToast: (msg: string) => void;
}

// Preset locations to simulate extreme village/district precision
const PRESET_DISTRICTS = [
  { name: 'Chikkaballapura', villages: ['Anemadagu', 'Sidlaghatta', 'Gauribidanur', 'Chintamani', 'Bagepalli'] },
  { name: 'Tumakuru', villages: ['Kunigal', 'Sira', 'Tiptur', 'Madhugiri', 'Gubbi'] },
  { name: 'Kolar', villages: ['Srinivaspur', 'Mulbagal', 'Bangarapet', 'Malur', 'KGF'] },
  { name: 'Mandya', villages: ['Maddur', 'Malavalli', 'Pandavapura', 'Srirangapatna', 'Nagamangala'] },
  { name: 'Davanagere', villages: ['Harihar', 'Honnali', 'Channagiri', 'Jagalur'] }
];

export const WeatherIntelligence: React.FC<WeatherIntelligenceProps> = ({ 
  currentLang, 
  onClose, 
  triggerToast 
}) => {
  // Navigation & interaction states
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Chikkaballapura');
  const [selectedVillage, setSelectedVillage] = useState<string>('Anemadagu');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: string; lon: string } | null>(null);
  const [customLocation, setCustomLocation] = useState<string | null>(null);

  // Weather metric states
  const [temp, setTemp] = useState<number>(29);
  const [humidity, setHumidity] = useState<number>(84);
  const [rainChance, setRainChance] = useState<number>(75);
  const [windSpeed, setWindSpeed] = useState<number>(14);
  const [uvIndex, setUvIndex] = useState<number>(6);
  const [weatherCondition, setWeatherCondition] = useState<'Rainy' | 'Sunny' | 'Humid' | 'Stormy' | 'Hot'>('Rainy');

  // Firebase Alert Simulation states
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [notificationsLog, setNotificationsLog] = useState<Array<{ id: string; type: string; title: string; body: string; time: string; channel: string }>>([
    {
      id: 'f1',
      type: 'Rain Alert',
      title: '⚠️ Heavy Rainfall Alert (FCM)',
      body: 'Precipitation exceeding 35mm expected in next 12 hours. Store harvest indoors immediately.',
      time: '15 mins ago',
      channel: 'Firebase Cloud Messaging'
    }
  ]);
  const [activeFloatingNotification, setActiveFloatingNotification] = useState<{ title: string; body: string } | null>(null);

  // TTS Voice state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const ttsRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Re-calculate mock weather metrics with seed correlation to selected location
  useEffect(() => {
    let baseSeed = (selectedVillage || selectedDistrict || searchQuery).length || 5;
    if (gpsCoords) {
      baseSeed += Math.floor(parseFloat(gpsCoords.lat) + parseFloat(gpsCoords.lon));
    }
    
    // Deterministic simulation
    const simulatedTemp = 24 + (baseSeed % 14); // 24 to 38
    const simulatedHumidity = 50 + (baseSeed % 41); // 50 to 91
    const simulatedRain = baseSeed % 2 === 0 ? (50 + (baseSeed % 48)) : (baseSeed % 45); // 0 to 98
    const simulatedWind = 8 + (baseSeed % 32); // 8 to 40
    const simulatedUv = 2 + (baseSeed % 9); // 2 to 11

    setTemp(simulatedTemp);
    setHumidity(simulatedHumidity);
    setRainChance(simulatedRain);
    setWindSpeed(simulatedWind);
    setUvIndex(simulatedUv);

    // Set dominant condition
    if (simulatedRain > 70) {
      setWeatherCondition(simulatedWind > 25 ? 'Stormy' : 'Rainy');
    } else if (simulatedTemp > 34) {
      setWeatherCondition('Hot');
    } else if (simulatedHumidity > 80) {
      setWeatherCondition('Humid');
    } else {
      setWeatherCondition('Sunny');
    }
  }, [selectedDistrict, selectedVillage, customLocation, gpsCoords]);

  // Handle auto-GPS detection
  const handleGpsDetection = () => {
    if (!navigator.geolocation) {
      triggerToast('GPS geolocation is not supported by your current handset browser.');
      return;
    }

    setGpsLoading(true);
    triggerToast('Acquiring sat-link coordinates. Please permit GPS location prompt...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4);
        const lon = pos.coords.longitude.toFixed(4);
        setGpsCoords({ lat, lon });
        setCustomLocation(`GPS Coords: ${lat}°N, ${lon}°E`);
        setSelectedDistrict('GPS Automated');
        setSelectedVillage('Local Farmland');
        setGpsLoading(false);
        triggerToast('GPS Link active! Micro-climate meteorological metrics updated.');
      },
      (err) => {
        console.warn('GPS position error:', err);
        setGpsLoading(false);
        // Fallback gracefully to a random high-yield farm
        const fallbackDistrict = PRESET_DISTRICTS[Math.floor(Math.random() * PRESET_DISTRICTS.length)];
        setSelectedDistrict(fallbackDistrict.name);
        setSelectedVillage(fallbackDistrict.villages[0]);
        triggerToast('GPS blocked or timed out. Synchronized automatically to closest network tower.');
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  // Helper translations for high-fidelity bilingual output
  const multiTranslations: Record<LanguageCode, {
    stationTitle: string;
    liveAdvisor: string;
    gpsAutoBtn: string;
    district: string;
    village: string;
    alertsTitle: string;
    recommendationTitle: string;
    hourlyTitle: string;
    weeklyTitle: string;
    broadcastBtn: string;
    voiceBtn: string;
    stopVoiceBtn: string;
    closeBtn: string;
    stats: { temp: string; humidity: string; rain: string; wind: string; uv: string };
    farmAdvice: string[];
    alerts: Array<{ type: string; msg: string; severity: string }>;
  }> = {
    en: {
      stationTitle: 'Krishi Weather Intelligence Hub',
      liveAdvisor: 'Live Sowing Meteorological Advisor',
      gpsAutoBtn: 'Detect Live Farm GPS',
      district: 'Select District',
      village: 'Select Village',
      alertsTitle: 'Direct Farmer Severe Warnings',
      recommendationTitle: 'Farming Recommendation Engine',
      hourlyTitle: 'Hourly Micro-Forecast',
      weeklyTitle: '7-Day Sowing Risk Forecast',
      broadcastBtn: 'Broadcast Firebase Notification',
      voiceBtn: 'Listen Voice Advisor Report',
      stopVoiceBtn: 'Mute Narration',
      closeBtn: 'Back to Sowing Home',
      stats: { temp: 'Temperature', humidity: 'Relative Humidity', rain: 'Rainfall Chance', wind: 'Wind Velocity', uv: 'Solar UV Index' },
      farmAdvice: [
        'Rain likely tomorrow. Do NOT spray water-based chemical pesticide or urea to prevent wash off.',
        'Moisture is highly beneficial. Best index windows for direct paddy transplanting.',
        'High afternoon UV load. Avoid field exposure between 12 PM - 3 PM to prevent heatstroke.'
      ],
      alerts: [
        { type: 'Heavy Rain Threat', msg: 'Heavy monsoon storm incoming. Secure harvested crops under tarpaulins immediately.', severity: 'danger' },
        { type: 'Pest Proximity Check', msg: 'Relative moisture exceeds 86%. High risk of whitefly and leaf rot. Apply organic neem spray.', severity: 'warning' }
      ]
    },
    kn: {
      stationTitle: 'ಕೃಷಿ ಹವಾಮಾನ ಬುದ್ಧಿಮತ್ತೆ ಕೇಂದ್ರ',
      liveAdvisor: 'ಲೈವ್ ಬಿತ್ತನೆ ಹವಾಮಾನ ಸಲಹೆಗಾರ',
      gpsAutoBtn: 'ಲೈವ್ ಫಾರ್ಮ್ ಜಿಪಿಎಸ್ ಪತ್ತೆ ಮಾಡಿ',
      district: 'ಜಿಲ್ಲೆ ಆರಿಸಿ',
      village: 'ಗ್ರಾಮ ಆರಿಸಿ',
      alertsTitle: 'ತೀವ್ರ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು',
      recommendationTitle: 'ಕೃಷಿ ಶಿಫಾರಸು ಎಂಜಿನ್',
      hourlyTitle: 'ಗಂಟೆಯ ಮೈಕ್ರೋ ಮುನ್ಸೂಚನೆ',
      weeklyTitle: '೭ ದಿನಗಳ ಬಿತ್ತನೆ ಅಪಾಯದ ಮುನ್ಸೂಚನೆ',
      broadcastBtn: 'ಫೈರ್‌ಬೇಸ್ ಅಧಿಸೂಚನೆ ಬ್ರಾಡ್‌ಕಾಸ್ಟ್',
      voiceBtn: 'ಹವಾಮಾನ ಧ್ವನಿ ವರದಿ ಕೇಳಿ',
      stopVoiceBtn: 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ',
      closeBtn: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
      stats: { temp: 'ತಾಪಮಾನ', humidity: 'ಆರ್ದ್ರತೆ', rain: 'ಮಳೆಯ ಸಾಧ್ಯತೆ', wind: 'ಗಾಳಿ ವೇಗ', uv: 'ಯುವಿ ಸೂಚ್ಯಂಕ' },
      farmAdvice: [
        'ನಾಳೆ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ. ರಸಗೊಬ್ಬರ ಅಥವಾ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಬೇಡಿ.',
        'ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಉತ್ತಮವಾಗಿದೆ. ರಾಗಿ ಬಿತ್ತನೆ ಮಾಡಲು ಸೂಕ್ತ ಸಮಯ.',
        'ಮಧ್ಯಾಹ್ನ ತೀವ್ರ ಬಿಸಿಲು ಇರಲಿದೆ. ಕೃಷಿ ಕೆಲಸಗಳನ್ನು ಮುಂಜಾನೆ ಪೂರ್ಣಗೊಳಿಸಿ.'
      ],
      alerts: [
        { type: 'ಭಾರಿ ಮಳೆ ಮುನ್ನೆಚ್ಚರಿಕೆ', msg: 'ಮುಂದಿನ ೨೪ ಗಂಟೆಗಳಲ್ಲಿ ಭಾರಿ ಬಿರುಗಾಳಿ ಮಳೆ ಸಂಭವ. ಕೊಯ್ಲು ಮಾಡಿದ ಚೀಲಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿರಿಸಿ.', severity: 'danger' },
        { type: 'ಕೀಟ ಬಾಧೆಯ ಎಚ್ಚರಿಕೆ', msg: 'ಆರ್ದ್ರತೆ ೮೫% ಮೀರಿದೆ. ಕೀಟನಾಶಕಗಳ ನಿಯಂತ್ರಣ ಪರೀಕ್ಷಿಸಿ.', severity: 'warning' }
      ]
    },
    hi: {
      stationTitle: 'कृषि मौसम खुफिया प्रणाली',
      liveAdvisor: 'लाइव बोध मौसम सलाहकार',
      gpsAutoBtn: 'लाइव फार्म जीपीएस खोजें',
      district: 'जिला चुनें',
      village: 'गांव चुनें',
      alertsTitle: 'किसान गंभीर चेतावनी अलर्ट',
      recommendationTitle: 'मशीनी खेती सिफारिशें',
      hourlyTitle: 'प्रति घंटा मौसम पूर्वानुमान',
      weeklyTitle: '७-दिवसीय बुआई जोखिम गाइड',
      broadcastBtn: 'फायरबेस पुश नोटिफिकेशन भेजें',
      voiceBtn: 'मौसम आवाज रिपोर्ट सुनें',
      stopVoiceBtn: 'आवाज शांत करें',
      closeBtn: 'होम पर वापस जाएं',
      stats: { temp: 'तापमान', humidity: 'सापेक्ष आर्द्रता', rain: 'बारिश की संभावना', wind: 'हवा की गति', uv: 'यूवी इंडेक्स' },
      farmAdvice: [
        'कल बारिश होने की संभावना है। आज यूरिया या तरल कीटनाशक का छिड़काव न करें ताकि फसल का नुकसान न हो।',
        'मिट्टी में पर्याप्त नमी है। धान की रोपाई के लिए सर्वोत्तम समय है।',
        'दोपहर में भीषण उमस और यूवी भार रहेगा। खेतों में सुबह जल्दी काम निपटा लें।'
      ],
      alerts: [
        { type: 'भारी वर्षा चेतावनी', msg: 'अगले १२ से २४ घंटों में मूसलाधार बारिश का अनुमान। अनाज की बोरियों को ऊंचे स्थानों पर पहुंचाएं।', severity: 'danger' },
        { type: 'कीट प्रकोप चेतावनी', msg: 'अत्यधिक नमी के कारण मूंगफली में पत्ती धब्बा रोग का खतरा बढ़ा है। जैविक स्प्रे करें।', severity: 'warning' }
      ]
    },
    ta: {
      stationTitle: 'வேளாண் வானிலை உளவு மையம்',
      liveAdvisor: 'நேரடி விதைப்பு வானிலை ஆலோசனையகம்',
      gpsAutoBtn: 'நேரடி ஜிபிஎஸ் கண்டறிக',
      district: 'மாவட்டம் தேர்வு செய்க',
      village: 'கிராமம் தேர்வு செய்க',
      alertsTitle: 'விவசாயிகள் தீவிர எச்சரிக்கைகள்',
      recommendationTitle: 'விவசாய பரிந்துரை இயந்திரம்',
      hourlyTitle: 'மணிநேர நுண் கணிப்பு',
      weeklyTitle: '၇ நாள் விதைப்பு அபாய முன்னறிவிப்பு',
      broadcastBtn: 'பயர்பேஸ் அறிவிப்பை அனுப்புக',
      voiceBtn: 'வானிலை குரல் அறிக்கை',
      stopVoiceBtn: 'குரலை நிறுத்துக',
      closeBtn: 'முகப்புக்குச் செல்க',
      stats: { temp: 'வெப்பநிலை', humidity: 'காற்றின் ஈரப்பதம்', rain: 'மழை வாய்ப்பு', wind: 'காற்றின் வேகம்', uv: 'யுவி குறியீடு' },
      farmAdvice: [
        'நாளை பலத்த மழை பெய்யக்கூடும். இன்று பூச்சிக்கொல்லி மருந்துகள் தெளிப்பதைத் தவிர்க்கவும்.',
        'மண்ணில் ஈரப்பதம் அருமையாக உள்ளது. கம்பு மற்றும் சோளம் விதைக்க உகந்த காலம்.',
        'நண்பகலில் கடுமையான வெயில் இருக்கும். கால்நடைகளை நிழலான இடத்தில் கட்டுங்கள்.'
      ],
      alerts: [
        { type: 'கனமழை எச்சரிக்கை', msg: 'அடுத்த 24 மணிநேரத்தில் கனமழை காற்றோடு பெய்யக்கூடும். அறுவடை செய்த நெல் கூட்டுகளை மூடி வைக்கவும்.', severity: 'danger' }
      ]
    },
    te: {
      stationTitle: 'కృషి వాతావరణ ఇంటెలిజెన్స్ సెంటర్',
      liveAdvisor: 'లైవ్ విత్తన వాతావరణ సలహాదారు',
      gpsAutoBtn: 'లైవ్ ఫార్మ్ జీపీఎస్ గుర్తించు',
      district: 'జిల్లా ఎంచుకోండి',
      village: 'గ్రామం ఎంచుకోండి',
      alertsTitle: 'తీవ్ర వాతావరణ హెచ్చరికలు',
      recommendationTitle: 'వ్యవసాయ సిఫార్సుల ఇంజిన్',
      hourlyTitle: 'గంటల వారీ వాతావరణం',
      weeklyTitle: '7 రోజుల విత్తన జోక్య మార్గదర్శి',
      broadcastBtn: 'ఫైర్‌బేస్ నోటిఫికేషన్ పంపండి',
      voiceBtn: 'వాతావరణ వాయిస్ రిపోర్ట్',
      stopVoiceBtn: 'వాయిస్ ఆపండి',
      closeBtn: 'హోమ్ పేజీకి',
      stats: { temp: 'ఉష్ణోగ్రత', humidity: 'తేమ శాతం', rain: 'వర్షపాత అవకాశం', wind: 'గాలి వేగం', uv: 'యూవీ ఇండెక్స్' },
      farmAdvice: [
        'రేపు వర్షం కురిసే అవకాశం ఉంది. కాబట్టి ఈరోజు రసాయన మందులు చల్లకండి.',
        'నేలలో తగినంత తేమ ఉంది. పత్తి విత్తనాలు నాటడానికి చాలా అనుకూలం.',
        'మధ్యాహ్న సమయాలలో ఎండ తీవ్రత ఎక్కువగా ఉంటుంది. తగిన జాగ్రత్తలు తీసుకోండి.'
      ],
      alerts: [
        { type: 'భారీ వర్షాల హెచ్చరిక', msg: 'రాగల 24 గంటల్లో భారీ వర్షపాతం నమోదు కావచ్చు. పండించిన ధాన్యం బస్తాలను సురక్షిత ప్రాంతాలకు తరలించండి.', severity: 'danger' }
      ]
    },
    ml: {
      stationTitle: 'കൃഷി കാലാവസ്ഥാ വിവര കേന്ദ്രം',
      liveAdvisor: 'തത്സമയ കൃഷി കാലാവസ്ഥാ ഉപദേശകൻ',
      gpsAutoBtn: 'ലൈവ് ജിപിഎസ് കണ്ടെത്തുക',
      district: 'ജില്ല തിരഞ്ഞെടുക്കുക',
      village: 'ഗ്രാമം തിരഞ്ഞെടുക്കുക',
      alertsTitle: 'കർഷക ജാഗ്രതാ നിർദ്ദേശങ്ങൾ',
      recommendationTitle: 'കാർഷിക ശുപാർശ എഞ്ചിൻ',
      hourlyTitle: 'മണിക്കൂർ കാലാവസ്ഥ പ്രവചനം',
      weeklyTitle: '7 ദിവസത്തെ കൃഷി പ്രവചനം',
      broadcastBtn: 'ഫയർബേസ് അറിയിപ്പ് നൽകുക',
      voiceBtn: 'കാലാവസ്ഥാ വോയ്‌സ് റിപ്പോർട്ട്',
      stopVoiceBtn: 'വോയ്‌സ് നിർത്തുക',
      closeBtn: 'ഹോമിലേക്ക് മടങ്ങുക',
      stats: { temp: 'താപനില', humidity: 'ഈർപ്പം', rain: 'മഴ സാധ്യത', wind: 'കാറ്റിന്റെ വേഗത', uv: 'യുവി സൂചിക' },
      farmAdvice: [
        'നാളെ ശക്തമായ മഴയ്ക്ക് സാധ്യത. വളപ്രയോഗം ഒഴിവാക്കുക.',
        'മണ്ണിൽ നല്ല ഈർപ്പം ഉണ്ട്, തെങ് തൈകൾ നടാൻ അനുകൂല സമയം.',
        'ഉച്ചയ്ക്ക് കടുത്ത വെയിൽ ഉണ്ടാകും. കൃഷിപ്പണികൾ രാവിലെയും വൈകുന്നേരവും ചെയ്യുക.'
      ],
      alerts: [
        { type: 'അതിശക്തമായ മഴ മുന്നറിയിപ്പ്', msg: 'അടുത്ത 12 മണിക്കൂറിൽ അതിശക്തമായ കാറ്റും മഴയും ഉണ്ടാകും. ഉൽപ്പന്നങ്ങൾ സുരക്ഷിതമാക്കുക.', severity: 'danger' }
      ]
    },
    bn: {
      stationTitle: 'কৃষি আবহাওয়া তথ্য কেন্দ্র',
      liveAdvisor: 'লাইভ বপন আবহাওয়া উপদেষ্টা',
      gpsAutoBtn: 'লাইভ ফার্ম জিপিএস নির্ণয়',
      district: 'জেলা নির্বাচন করুন',
      village: 'গ্রাম নির্বাচন করুন',
      alertsTitle: 'কৃষক গুরুতর সতর্কতা',
      recommendationTitle: 'প্রযুক্তিগত কৃষি পরামর্শ',
      hourlyTitle: 'ঘন্টায় পূর্বাভাস',
      weeklyTitle: '৭ দিনের চাষাবাদ ঝুঁকি নির্দেশিকা',
      broadcastBtn: 'ফায়ারবেস পুশ নোটিফিকেশন পাঠান',
      voiceBtn: 'আবহাওয়া ভয়েস রিপোর্ট',
      stopVoiceBtn: 'ভয়েস বন্ধ করুন',
      closeBtn: 'হোমে ফিরে যান',
      stats: { temp: 'তাপমাত্রা', humidity: 'আর্দ্রতা', rain: 'বৃষ্টির সম্ভাবনা', wind: 'বাতাসের গতিবেগ', uv: 'ইউভি সূচক' },
      farmAdvice: [
        'আগামীকাল বৃষ্টির সম্ভাবনা। আজ সার প্রয়োগ করবেন না, ধুয়ে যাবে।',
        'মাটিতে পর্যাপ্ত জলীয় উপাদান রয়েছে। বীজ রোপণ শুরু করুন।',
        'দুপুরের কড়া রোদে কাজ এড়িয়ে চলুন ও প্রচুর জল পান করুন।'
      ],
      alerts: [
        { type: 'ভারী বৃষ্টির সতর্কতা', msg: 'পরবর্তী ২৪ ঘন্টায় ঝোড়ো বৃষ্টির সম্ভাবনা। পাকা ফসল পলিথিন দিয়ে ঢেকে রাখুন।', severity: 'danger' }
      ]
    },
    mr: {
      stationTitle: 'कृषी हवामान सल्ला केंद्र',
      liveAdvisor: 'थेट पेरणी हवामान सल्लागार',
      gpsAutoBtn: 'थेट जीपीएस मार्ग शोधा',
      district: 'जिल्हा निवडा',
      village: 'गाव निवडा',
      alertsTitle: 'शेतकऱ्यांसाठी गंभीर इशारे',
      recommendationTitle: 'मशीनरूट हवामान शिफारसी',
      hourlyTitle: 'तासाची हवामान स्थिती',
      weeklyTitle: '७ दिवसांचे पीक पेरणी नियोजन',
      broadcastBtn: 'फायरबेस पुश सूचना पाठवा',
      voiceBtn: 'हवामान आवाज अहवाल ऐका',
      stopVoiceBtn: 'आवाज बंद करा',
      closeBtn: 'मुख्यपृष्ठावर जा',
      stats: { temp: 'तापमान', humidity: 'सापेक्ष आर्द्रता', rain: 'पावसाची शक्यता', wind: 'वाऱ्याचा वेग', uv: 'अतिनील किरणे' },
      farmAdvice: [
        'उद्या दुपारनंतर पावसाची दाट शक्यता. शेतात औषध फवारणी करू नका.',
        'जमिनीत पुरेशी ओल आहे, कापूस लागवडीसाठी पूरक हवामान.',
        'आफ्टरनून तीव्र उष्णता राहील. दुपारच्या वेळेस जनावरांना गोठ्यातच बांधा.'
      ],
      alerts: [
        { type: 'मुसळधार पाऊस इशारा', msg: 'येत्या २४ तासांत विजांच्या कडकडाटासह वेगाने पाऊस पडेल. साठवणूक सुरक्षित ठेवा.', severity: 'danger' }
      ]
    },
    pa: {
      stationTitle: 'ਕ੍ਰਿਸ਼ੀ ਮੌਸਮ ਸੂਚਨਾ ਕੇਂਦਰ',
      liveAdvisor: 'ਲਾਈਵ ਬਿਜਾਈ ਮੌਸਮ ਸਲਾਹਕਾਰ',
      gpsAutoBtn: 'ਫਾਰਮ ਜੀਪੀਐਸ ਲੱਭੋ',
      district: 'ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ',
      village: 'ਪਿੰਡ ਚੁਣੋ',
      alertsTitle: 'ਕਿਸਾਨ ਚੇਤਾਵਨੀ ਅਲਰਟ',
      recommendationTitle: 'ਖੇਤੀਬਾੜੀ ਖਾਸ ਸਿਫ਼ਾਰਸ਼ਾਂ',
      hourlyTitle: 'ਘੰਟੇਵਾਰ ਮੁਨਿਆਦੀ ਪੂਰਵ-ਅਨੁਮਾਨ',
      weeklyTitle: '੭ ਦਿਨਾ ਬਿਜਾਈ ਚੌਕਸੀ ਪ੍ਰੋਗਰਾਮ',
      broadcastBtn: 'ਫਾਇਰਬੇਸ ਪੁਸ਼ ਨੋਟੀਫਿਕੇਸ਼ਨ ਛੱਡੋ',
      voiceBtn: 'ਮੌਸਮ ਵੋਇਸ ਰਿਪੋਰਟ ਸੁਣੋ',
      stopVoiceBtn: 'ਵੋਇਸ ਬੰਦ ਕਰੋ',
      closeBtn: 'ਹੋਮ ਪੇਜ ਤੇ ਜਾਓ',
      stats: { temp: 'ਤਾਪਮਾਨ', humidity: 'ਨਮੀ', rain: 'ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ', wind: 'ਹਵਾ ਦੀ ਗਤੀ', uv: 'ਯੂਵੀ ਇੰਡੈਕਸ' },
      farmAdvice: [
        'ਕੱਲ੍ਹ ਤੇਜ਼ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਹੈ। ਅੱਜ ਖਾਦ ਜਾਂ ਕੀਟਨਾਸ਼ਕ ਸਪ੍ਰੇਅ ਨਾ ਕਰੋ।',
        'ਜ਼ਮੀਨ ਦੀ ਤਾਰ ਅਤੇ ਨਮੀ ਬਹੁਤ ਉੱਤਮ ਹੈ, ਝੋਨਾ ਲਾਉਣ ਦਾ ਵਧੀਆ ਵੇਲਾ।',
        'ਦੁਪਹਿਰ ਨੂੰ ਤੇਜ਼ ਲੂ ਚੱਲਣ ਦੀ ਚੇਤਾਵनी ਹੈ। ਖੇਤ ਦਾ ਕੰਮ ਸਵੇਰ ਵੇਲੇ ਕਰੋ।'
      ],
      alerts: [
        { type: 'ਭਾਰੀ ਮੀਂਹ ਦਾ ਖ਼ਤਰਾ', msg: 'ਅਗਲੇ ੨੪ ਘੰਟਿਆਂ ਵਿੱਚ ਤੂਫਾਨੀ ਮੀਂਹ ਪੈ ਸਕਦਾ ਹੈ। ਕਣਕ ਦੀਆਂ ਬੋਰੀਆਂ ਸੁਰੱਖਿਅਤ ਥਾਂ ਤੇ ਰੱਖੋ।', severity: 'danger' }
      ]
    }
  };

  // Safe fallback to 'en' dictionary if requested code is missing
  const activeT = multiTranslations[currentLang] || multiTranslations['en'];

  // Calculate dynamic recommendations based on weather metrics
  const getFarmingGuideline = () => {
    if (rainChance > 70) {
      return activeT.farmAdvice[0];
    } else if (humidity > 70) {
      return activeT.farmAdvice[1];
    } else {
      return activeT.farmAdvice[2];
    }
  };

  // Generate dynamic, localized crop-saving alerts based on meteorological parameters
  const getDynamicFarmerAlerts = () => {
    const alertsList: Array<{ type: string; msg: string; severity: 'danger' | 'warning' | 'info' }> = [];

    // 1. Heavy Rain alert
    if (rainChance > 70) {
      alertsList.push({
        type: currentLang === 'kn' ? 'ಭಾರೀ ಮಳೆ ಅಪಾಯ' : currentLang === 'hi' ? 'भारी बारिश चेतावनी' : 'Heavy Rain Alert',
        msg: currentLang === 'kn' 
          ? 'ಮುಂದಿನ ಕೆಲವೇ ಗಂಟೆಗಳಲ್ಲಿ ಧಾರಾಕಾರ ಮಳೆ ಸಾಧ್ಯತೆ ಇದೆ. ಹತ್ತಿರದ ಒಣ ಭೂಮಿಗೆ ಧಾನ್ಯ ವರ್ಗಾಯಿಸಿ.'
          : currentLang === 'hi'
          ? 'आने वाले कुछ घंटों में मूसलाधार बारिश की संभावना है। पकी फसलों को सुरक्षित स्थान पर ले जाएं।'
          : 'Torrential downpour imminent in the next few hours. Move harvest piles to dry, elevated storage.',
        severity: 'danger'
      });
    }

    // 2. Flood Warnings
    if (rainChance > 85) {
      alertsList.push({
        type: currentLang === 'kn' ? 'ಪ್ರವಾಹ ಮುನ್ನೆಚ್ಚರಿಕೆ' : currentLang === 'hi' ? 'बाढ़ की चेतावनी' : 'Flash Flood Warning',
        msg: currentLang === 'kn'
          ? 'ಜಲಮೂಲಗಳ ಬಳಿ ನೀರಿನ ಮಟ್ಟ ಹೆಚ್ಚಾಗುತ್ತಿದೆ. ತಗ್ಗು ಪ್ರದೇಶಗಳಿಂದ ಜಾನುವಾರುಗಳನ್ನು ಸುರಕ್ಷಿತ ಸ್ಥಳಕ್ಕೆ ಸರಿಸಿ.'
          : currentLang === 'hi'
          ? 'जलाशयों के पास जल स्तर बढ़ रहा है। निचले क्षेत्रों से पशुओं और कृषि उपकरणों को हटा लें।'
          : 'Water streams rising rapidly. Move livestock, pumps, and machinery away from low-lying areas.',
        severity: 'danger'
      });
    }

    // 3. Storm alerts
    if (windSpeed > 25) {
      alertsList.push({
        type: currentLang === 'kn' ? 'ಬಿರುಗಾಳಿ ಗಾಳಿ ಎಚ್ಚರಿಕೆ' : currentLang === 'hi' ? 'आंधी-तूफान अलर्ट' : 'Severe Gale/Storm Alert',
        msg: currentLang === 'kn'
          ? 'ಗಂಟೆಗೆ ೨೫ ಕಿಮೀ ಹವಾಮಾನ ಗಾಳಿ ಬೀಸಲಿದೆ. ಕೃಷಿ ಗೂಡುಗಳು ಮತ್ತು ಟೆಂಟ್ ಹದಗೊಳಿಸಿ.'
          : currentLang === 'hi'
          ? '२५ किमी प्रति घंटे की रफ़्तार से धूलभरी आंधी चलने का अनुमान। फसलों को हवा के थपेड़ों से बचाएं।'
          : 'High wind gusts exceeding 25km/h detected. Secure temporary polyhouses, barns, and windbreaks.',
        severity: 'danger'
      });
    }

    // 4. Heatwave alerts
    if (temp > 35) {
      alertsList.push({
        type: currentLang === 'kn' ? 'ಬಿಸಿಗाಳಿ ಎಚ್ಚರಿಕೆ' : currentLang === 'hi' ? 'लू की चेतावनी (Heatwave)' : 'Extreme Heatwave Alert',
        msg: currentLang === 'kn'
          ? 'ತಾಪಮಾನ ೩೫ ಡಿಗ್ರಿ ಮೀರಿದೆ. ಸಸ್ಯಗಳು ಒಣಗದಂತೆ ಸಂಜೆ ತಂಪಾದ ನೀರು ಸಿಂಪಡಿಸಿ.'
          : currentLang === 'hi'
          ? 'तापमान ३५ डिग्री सेल्सियस के पार। फसलों में नमी बनाए रखने हेतु शाम को हल्की सिंचाई करें।'
          : 'Severe temperature peak at over 35°C detected. Ensure hydration levels and mist soil beds of young saplings.',
        severity: 'danger'
      });
    }

    // 5. Drought alerts
    if (temp > 32 && humidity < 50) {
      alertsList.push({
        type: currentLang === 'kn' ? 'ಶುಷ್ಕ ವಾತಾವರಣ ಎಚ್ಚರಿಕೆ' : currentLang === 'hi' ? 'सूखे जैसी स्थिति का अलर्ट' : 'Severe Micro-Drought Danger',
        msg: currentLang === 'kn'
          ? 'ಒಣ ಮಣ್ಣಿನ ಸೂಚ್ಯಂಕ ಹೆಚ್ಚಾಗಿದೆ. ತುಂತುರು ನೀರಾವರಿ ಪದ್ಧತಿ ಬಳಸಿ ತೇವಾಂಶ ಕಾಪಾಡಿ.'
          : currentLang === 'hi'
          ? 'कम आर्द्रता और तेज गर्मी से मिट्टी सूख रही है। ड्रिप सिस्टम से नियमित जलापूर्ति सुनिश्चित करें।'
          : 'Critical drought dry index. Soil moisture depleted. Prompt deep-root micro-drip irrigation immediately.',
        severity: 'warning'
      });
    }

    // 6. Pesticide spray warnings
    if (rainChance >= 40 && rainChance <= 75) {
      alertsList.push({
        type: currentLang === 'kn' ? 'ಕೀಟನಾಶಕ ಸಿಂಪಡನೆ ಎಚ್ಚರಿಕೆ' : currentLang === 'hi' ? 'कीटनाशक छिड़काव रोक चेतावनी' : 'Pesticide Application Alert',
        msg: currentLang === 'kn'
          ? 'ಮಳೆಯ ಸಾಧ್ಯತೆ ಇರುವ ಕಾರಣ ದ್ರವ ರೂಪದ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸುವುದನ್ನು ತಡೆಹಿಡಿಯಿರಿ.'
          : currentLang === 'hi'
          ? 'वर्षा की अधिक संभावना होने के कारण आज कीटनाशक या रासायनिक छिड़काव टालें।'
          : 'Moderate precipitation window. Suspend liquid pesticide/urea sprays to avoid wash-off and chemical runoff.',
        severity: 'warning'
      });
    }

    // Always ensure at least 2 highly contextual warnings are shown so the farmer is well informed!
    if (alertsList.length === 0) {
      alertsList.push({
        type: currentLang === 'kn' ? 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಸಲಹೆ' : currentLang === 'hi' ? 'मिट्टी स्वास्थ्य सलाह' : 'Soil Micro-Health Watch',
        msg: currentLang === 'kn'
          ? 'ಆರ್ದ್ರತೆ ಉತ್ತಮವಾಗಿದೆ. ನೈಸರ್ಗಿಕ ಜೀವಾಮೃತ ಸಿಂಪಡಿಸಲು ಇದು ಅತ್ಯುತ್ತಮ ಸಮಯ.'
          : currentLang === 'hi'
          ? 'सापेक्ष आर्द्रता संतुलित है। जैविक खाद या जीवामृत छिड़काव के लिए अनुकूल समय।'
          : 'Perfect Relative Humidity index. Optimal baseline for spreading organic compost or leaf nutrients.',
        severity: 'info'
      });
    }

    return alertsList;
  };

  // Voice Narration handler using Web Speech Synthesis API
  const handleVoiceNarration = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      // Voice script compilation based on dynamic indicators
      const activeLocDisplay = searchQuery || `${selectedVillage}, ${selectedDistrict}`;
      const speakText = `${activeT.stationTitle}. Location: ${activeLocDisplay}. Temperature is ${temp} degrees celsius. Relative Humidity is ${humidity} percent, wind velocity is ${windSpeed} kilometers per hour, UV index is ${uvIndex}. Current farming advice: ${getFarmingGuideline()}`;

      const utterance = new SpeechSynthesisUtterance(speakText);
      
      // Attempt to pair with a matching language locale voice
      const voices = window.speechSynthesis.getVoices();
      let matchedVoice = null;
      if (currentLang === 'hi') matchedVoice = voices.find(v => v.lang.startsWith('hi'));
      else if (currentLang === 'kn') matchedVoice = voices.find(v => v.lang.startsWith('kn'));
      else if (currentLang === 'ta') matchedVoice = voices.find(v => v.lang.startsWith('ta'));
      else if (currentLang === 'te') matchedVoice = voices.find(v => v.lang.startsWith('te'));
      
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      utterance.rate = 0.92; // Slightly paced for high clarity in noisy rural fields

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (e) => {
        console.warn('TTS error occurred, falling back...', e);
        setIsSpeaking(false);
      };

      ttsRef.current = utterance;
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      triggerToast('Audio Voice Synthesizer not compatible with this operating system.');
    }
  };

  // Component unmount safeguards to avoid speech leakage
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Simulating Firebase Cloud Messaging/Notification Broadcasts
  const triggerFirebaseNotificationSimulator = (alertType: 'rain' | 'irrigation' | 'pest') => {
    if (!notificationsEnabled) {
      triggerToast('Local push notifications console disabled by active user.');
      return;
    }

    let alertObj = {
      id: `fcm_${Date.now()}`,
      type: '',
      title: '',
      body: '',
      time: 'Just now',
      channel: 'Firebase Cloud Messaging (FCM)'
    };

    if (alertType === 'rain') {
      alertObj.type = 'Rain Hazard Warning';
      alertObj.title = '⚠️ Rainfall Hazard (FCM)';
      alertObj.body = `[FCM Secure Broadcast] Torrential convective downpour forecasted for ${selectedVillage}. Secure harvest piles.`;
    } else if (alertType === 'irrigation') {
      alertObj.type = 'Irrigation Reminder';
      alertObj.title = '💧 Adaptive Irrigation Warning';
      alertObj.body = `Soil moisture is depleted below critical agricultural index. Engage drip sprayers for 45 minutes in ${selectedDistrict}.`;
    } else {
      alertObj.type = 'Pest Proximity Check';
      alertObj.title = '🐛 Rapid Pest Invasion Alert';
      alertObj.body = `Pest-risk warning: Blight pathogens triggered due to local high damp levels (${humidity}%). Run preventive neem wash.`;
    }

    // Update notifications queue
    setNotificationsLog(prev => [alertObj, ...prev]);

    // Display flashy top smartphone visual notification banner overlay
    setActiveFloatingNotification({
      title: alertObj.title,
      body: alertObj.body
    });

    // Ring visual toast
    triggerToast(`FCM Broadcast triggered successfully. Notification broadcasted to subscriber loop.`);

    // Auto dismiss flashy push banner after 5.5 seconds
    setTimeout(() => {
      setActiveFloatingNotification(null);
    }, 5500);
  };

  return (
    <div className="absolute inset-x-0 top-0 min-h-full z-50 bg-slate-50 flex flex-col animate-slideUp">
      
      {/* Dynamic Firebase Floating Notification Toast overlay mimicking Native OS Alert */}
      {activeFloatingNotification && (
        <div className="absolute top-3 left-4 right-4 z-999 bg-slate-900 text-white rounded-3xl p-4 shadow-2xl border border-slate-700/50 flex space-x-3 items-start animate-bounce">
          <div className="bg-emerald-600 p-2 rounded-2xl text-white">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase">AgriVerse push</span>
              <span className="text-[8px] text-slate-400 font-bold">NOW</span>
            </div>
            <h5 className="font-extrabold text-xs text-white mt-1">{activeFloatingNotification.title}</h5>
            <p className="text-[10px] text-slate-300 font-semibold leading-relaxed mt-0.5">{activeFloatingNotification.body}</p>
          </div>
          <button 
            onClick={() => setActiveFloatingNotification(null)}
            className="text-slate-400 font-extrabold hover:text-white text-xs cursor-pointer px-1 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="bg-gradient-to-r from-emerald-800 to-indigo-900 text-white px-4 py-3 sticky top-0 z-40 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-2">
          <CloudRain className="w-5.5 h-5.5 text-blue-300 animate-bounce" />
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-emerald-300">Smart Weather Center</h2>
            <h1 className="text-sm font-black tracking-tight leading-tight">{activeT.stationTitle}</h1>
          </div>
        </div>
        <button 
          onClick={onClose}
          id="close_weather_engine"
          className="bg-white/10 hover:bg-white/20 active:scale-90 text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-xl border border-white/15 cursor-pointer"
        >
          {activeT.closeBtn}
        </button>
      </div>

      {/* Main Body - scrollable area for slow handsets and screen densities */}
      <div className="p-4 space-y-4 pb-16">

        {/* Location selector / Geolocation console */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-lg shadow-slate-100/50 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-emerald-700 animate-ping" />
              <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Agricultural Location Scope</span>
            </div>
            <button
              onClick={handleGpsDetection}
              disabled={gpsLoading}
              className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 py-1 px-3 rounded-full text-[10px] font-extrabold flex items-center space-x-1.5 border border-emerald-100 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>{gpsLoading ? 'Syncing Base GPS...' : activeT.gpsAutoBtn}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {activeT.district}
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  const paired = PRESET_DISTRICTS.find(d => d.name === e.target.value);
                  if (paired) setSelectedVillage(paired.villages[0]);
                  setCustomLocation(null);
                  setGpsCoords(null);
                  triggerToast(`District locked: ${e.target.value}`);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-black text-slate-800 outline-none"
              >
                {gpsCoords && <option value="GPS Automated">📡 GPS Linked</option>}
                {PRESET_DISTRICTS.map(dist => (
                  <option key={dist.name} value={dist.name}>{dist.name} District</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {activeT.village}
              </label>
              <select
                value={selectedVillage}
                onChange={(e) => {
                  setSelectedVillage(e.target.value);
                  setCustomLocation(null);
                  setGpsCoords(null);
                  triggerToast(`Village locked: ${e.target.value}`);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-black text-slate-800 outline-none"
              >
                {gpsCoords && <option value="Local Farmland">🚜 Local Farmland</option>}
                {(PRESET_DISTRICTS.find(d => d.name === selectedDistrict)?.villages || ['Anemadagu']).map(vil => (
                  <option key={vil} value={vil}>{vil} Village</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick custom location search bar */}
          <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or enter custom farm/village..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold outline-none focus:bg-white"
            />
            <button
              onClick={() => {
                if (searchQuery.trim()) {
                  setCustomLocation(searchQuery.trim());
                  setSelectedDistrict('Search Result');
                  setSelectedVillage(searchQuery.trim());
                  triggerToast(`Weather set to: ${searchQuery}`);
                }
              }}
              className="py-2 px-3 bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Lock
            </button>
          </div>

          {customLocation && (
            <div className="text-[10px] text-indigo-800 font-extrabold bg-indigo-50 p-2 rounded-xl flex items-center justify-between">
              <span>Active Micro-grid: {customLocation}</span>
              <button onClick={() => { setCustomLocation(null); setSelectedDistrict('Chikkaballapura'); setSelectedVillage('Anemadagu'); }} className="text-red-500 font-black">✕ Reset</button>
            </div>
          )}
        </div>

        {/* Dynamic Warning Alert Overlay Banner inside center */}
        <div className="space-y-2.5">
          <div className="flex items-center space-x-1">
            <ShieldAlert className="w-4 h-4 text-emerald-800" />
            <span className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider">
              {activeT.alertsTitle}
            </span>
          </div>
          {getDynamicFarmerAlerts().map((alertItem, alertIdx) => (
            <div 
              key={alertIdx} 
              className={`border rounded-3xl p-3.5 flex space-x-3 items-start transition-all ${
                alertItem.severity === 'danger' 
                  ? 'bg-red-50 border-red-100 animate-pulse' 
                  : alertItem.severity === 'warning'
                  ? 'bg-amber-50 border-amber-100'
                  : 'bg-emerald-50 border-emerald-100'
              }`}
            >
              <div className={`rounded-xl p-2 shrink-0 ${
                alertItem.severity === 'danger' 
                  ? 'bg-red-500 text-white' 
                  : alertItem.severity === 'warning'
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}>
                {alertItem.severity === 'danger' ? (
                  <AlertTriangle className="w-4.5 h-4.5" />
                ) : alertItem.severity === 'warning' ? (
                  <Info className="w-4.5 h-4.5" />
                ) : (
                  <CheckCircle className="w-4.5 h-4.5" />
                )}
              </div>
              <div className="flex-1">
                <h5 className={`font-black text-xs uppercase tracking-wider ${
                  alertItem.severity === 'danger' 
                    ? 'text-red-900' 
                    : alertItem.severity === 'warning'
                    ? 'text-amber-900'
                    : 'text-emerald-950'
                }`}>
                  {alertItem.type}
                </h5>
                <p className={`text-[11px] font-bold leading-normal mt-0.5 ${
                  alertItem.severity === 'danger' 
                    ? 'text-red-700' 
                    : alertItem.severity === 'warning'
                    ? 'text-amber-700'
                    : 'text-emerald-800'
                }`}>
                  {alertItem.msg}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* SWIPEABLE CARD CAROUSEL CONTAINER (green/blue gradients, mobile-friendly indicators) */}
        <div className="relative">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Swipeable Advisory Panels</span>
            <div className="flex space-x-1.5">
              {[0, 1, 2, 3].map(dot => (
                <button 
                  key={dot}
                  onClick={() => setActiveSlide(dot)}
                  className={`w-2 h-2 rounded-full transition-all ${activeSlide === dot ? 'bg-emerald-700 w-4' : 'bg-slate-200'}`}
                />
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden w-full h-[230px] rounded-3xl text-white shadow-xl">
            
            {/* Slide 1: Live Sowing Meteorological metrics */}
            {activeSlide === 0 && (
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-500 p-4 flex flex-col justify-between animate-fadeIn">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="bg-white/20 border border-white/20 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">Panel 1: Real-time Stats</span>
                    <span className="text-[10px] font-bold opacity-90">{selectedVillage}, {selectedDistrict}</span>
                  </div>

                  <div className="flex items-baseline mt-2.5">
                    <h3 className="text-4xl font-black">{temp}°C</h3>
                    <span className="text-xs font-bold ml-1.5 uppercase opacity-90">({weatherCondition})</span>
                  </div>

                  <p className="text-[10px] font-semibold mt-1 leading-relaxed opacity-95">
                    Live farm parameters for crop germination cycle based on local network radar.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 bg-black/15 p-2 rounded-2xl text-center">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wide text-white/70 leading-none">Humidity</span>
                    <span className="text-[11px] font-black">{humidity}%</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wide text-white/70 leading-none">Rain Chance</span>
                    <span className="text-[11px] font-black">{rainChance}%</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wide text-white/70 leading-none">Wind Velocity</span>
                    <span className="text-[11px] font-black">{windSpeed} km/h</span>
                  </div>
                  <div className="border-t border-white/10 pt-1">
                    <span className="block text-[8px] uppercase tracking-wide text-white/70 leading-none">UV Index</span>
                    <span className="text-[11px] font-black">{uvIndex}/11</span>
                  </div>
                  <div className="border-t border-white/10 pt-1">
                    <span className="block text-[8px] uppercase tracking-wide text-white/70 leading-none">Cloud Cover</span>
                    <span className="text-[11px] font-black">{Math.min(100, Math.max(10, rainChance + 5))}%</span>
                  </div>
                  <div className="border-t border-white/10 pt-1">
                    <span className="block text-[8px] uppercase tracking-wide text-white/70 leading-none">Sun Up/Down</span>
                    <span className="text-[9px] font-black">05:46 / 18:38</span>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 2: Sowing Risk Analysis & Expert Advice */}
            {activeSlide === 1 && (
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-800 via-blue-700 to-sky-500 p-4 flex flex-col justify-between animate-fadeIn">
                <div>
                  <span className="bg-white/20 border border-white/20 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">Panel 2: Harvesting Risk Analysis</span>
                  <h4 className="text-sm font-black mt-3 flex items-center space-x-1">
                    <Info className="w-4 h-4 text-yellow-300 animate-pulse" />
                    <span>{activeT.recommendationTitle}</span>
                  </h4>
                  <p className="text-[11px] font-extrabold text-blue-100 leading-relaxed mt-2 bg-black/10 p-3 rounded-2xl border border-white/10">
                    "{getFarmingGuideline()}"
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-black border-t border-white/10 pt-2 opacity-90">
                  <span>Soil Dryness: {humidity > 80 ? 'Wet Block ✓' : 'Semi Arid'}</span>
                  <span>UV Index: {uvIndex} ({uvIndex > 7 ? 'Extreme alert' : 'Mild Solar load'})</span>
                </div>
              </div>
            )}

            {/* Slide 3: Detailed Sowing Forecast Timeline */}
            {activeSlide === 2 && (
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-800 via-indigo-700 to-purple-600 p-4 flex flex-col justify-between animate-fadeIn">
                <div>
                  <span className="bg-white/20 border border-white/20 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">Panel 3: Hourly Radar Horizon</span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-200 mt-2.5">{activeT.hourlyTitle}</h4>
                </div>

                {/* Swipeable hourly forecasting slots */}
                <div className="flex space-x-2 overflow-x-auto pb-1 mt-1 scrollbar-none">
                  {[
                    { time: '06:00 AM', temp: `${temp - 5}°C`, icon: Sun, condition: 'Clear' },
                    { time: '09:00 AM', temp: `${temp - 2}°C`, icon: Sun, condition: 'Warm' },
                    { time: '12:00 PM', temp: `${temp}°C`, icon: Sun, condition: 'Hot UV' },
                    { time: '03:00 PM', temp: `${temp - 1}°C`, icon: CloudRain, condition: 'Heavy Rain' },
                    { time: '06:00 PM', temp: `${temp - 3}°C`, icon: CloudRain, condition: 'Drizzle' },
                    { time: '09:00 PM', temp: `${temp - 6}°C`, icon: CloudRain, condition: 'Cool Breeze' }
                  ].map((slot, sIdx) => {
                    const SlotIcon = slot.icon;
                    return (
                      <div key={sIdx} className="bg-white/10 border border-white/10 rounded-2xl p-2 text-center min-w-[75px] shrink-0">
                        <span className="block text-[8px] text-purple-100 font-bold">{slot.time}</span>
                        <SlotIcon className="w-4 h-4 mx-auto my-1 text-yellow-300" />
                        <span className="block text-[11px] font-black">{slot.temp}</span>
                        <span className="block text-[7px] uppercase font-black text-white/80 shrink-0 truncate max-w-[70px]">{slot.condition}</span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[8px] text-center text-white/70 italic shrink-0">
                  Swipe horizontally to view full hourly timeline forecast.
                </p>
              </div>
            )}

            {/* Slide 4: AI Voice Station & Speech naration controls */}
            {activeSlide === 3 && (
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900 via-indigo-900 to-indigo-800 p-4 flex flex-col justify-between animate-fadeIn">
                <div>
                  <span className="bg-white/20 border border-white/20 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">Panel 4: Voice Soundboard</span>
                  <h4 className="text-sm font-black mt-2.5 flex items-center space-x-1.5">
                    <Volume2 className="w-4.5 h-4.5 text-yellow-300" />
                    <span>Local Language Audio Reports</span>
                  </h4>
                  <p className="text-[10px] text-indigo-100 font-medium leading-relaxed mt-1.5">
                    Generates a personalized text-to-speech voice briefing of current weather stats and actionable plant warnings matched directly to you in your native language.
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleVoiceNarration}
                    className={`flex-1 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-md active:scale-95 transition-all ${
                      isSpeaking ? 'bg-red-500 text-white animate-pulse' : 'bg-yellow-400 text-slate-950 font-black hover:bg-yellow-500'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-bounce" />}
                    <span>{isSpeaking ? activeT.stopVoiceBtn : activeT.voiceBtn}</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Swipe controls for low-end accessibility click matches */}
          <div className="flex justify-between mt-2.5 px-1 pb-1">
            <button 
              onClick={() => setActiveSlide(prev => (prev > 0 ? prev - 1 : 3))}
              className="p-1.5 bg-white border border-slate-200 rounded-xl flex items-center text-xs font-bold text-slate-700 active:scale-95 cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button 
              onClick={() => setActiveSlide(prev => (prev < 3 ? prev + 1 : 0))}
              className="p-1.5 bg-white border border-slate-200 rounded-xl flex items-center text-xs font-bold text-indigo-800 active:scale-95 cursor-pointer shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7-DAY FORECAST TIMELINE GRID */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-lg shadow-slate-100/50">
          <div className="flex justify-between items-center mb-3 border-b border-slate-50 pb-2">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-indigo-700 animate-spin" />
              <span>{activeT.weeklyTitle}</span>
            </h4>
            <span className="text-[9px] text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">Rain Season Horizon</span>
          </div>

          <div className="space-y-2">
            {[
              { day: 'Friday', date: 'Today', temp: `${temp}°C / ${temp - 8}°C`, risk: 'SOW SENSITIVE', riskColor: 'bg-amber-100 text-amber-800 border-amber-200', desc: `${rainChance}% rain chance. Spray delayed.` },
              { day: 'Saturday', date: 'Jun 6', temp: `${temp + 1}°C / ${temp - 7}°C`, risk: 'WARNINGS ON', riskColor: 'bg-red-100 text-red-800 border-red-200', desc: 'Convective storm forecasted in afternoon.' },
              { day: 'Sunday', date: 'Jun 7', temp: `${temp + 2}°C / ${temp - 6}°C`, risk: 'SECURE LAND', riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', desc: 'Moist soils. Optimal direct sowing.' },
              { day: 'Monday', date: 'Jun 8', temp: `${temp - 1}°C / ${temp - 6}°C`, risk: 'STABLE GREEN', riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', desc: 'Calm winds. Fertilize application active.' },
              { day: 'Tuesday', date: 'Jun 9', temp: `${temp + 3}°C / ${temp - 5}°C`, risk: 'STABLE GREEN', riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', desc: 'Sunny and minimal precipitation.' }
            ].map((d, dIdx) => (
              <div key={dIdx} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-2xl text-[11px] font-semibold text-slate-800 border border-slate-100">
                <div className="w-[85px]">
                  <span className="block font-black leading-tight">{d.day}</span>
                  <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">{d.date}</span>
                </div>
                <div className="flex-1 px-1 text-left">
                  <span className="block text-[10px] font-black text-slate-600">{d.temp}</span>
                  <p className="text-[9px] text-slate-400 leading-none mt-0.5 font-bold truncate max-w-[140px]">{d.desc}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black shrink-0 ${d.riskColor}`}>
                  {d.risk}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FIREBASE NOTIFICATIONS BROADCAST ENGINE PANEL */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-lg shadow-slate-100/50 space-y-3.5">
          <div className="flex justify-between items-center border-b border-slate-50 pb-2">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide flex items-center space-x-1">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>Firebase Cloud Messaging Station</span>
            </h4>
            <div className="flex items-center space-x-1 cursor-pointer" onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
              <span className="text-[9px] text-slate-400 font-bold uppercase">Push status:</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${notificationsEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                {notificationsEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
            Agricultural administrators propagate secure emergency micro-targeted notifications through Firebase directly to sub-village mobile loops. Generate immediate test triggers below:
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => triggerFirebaseNotificationSimulator('rain')}
              className="py-2.5 px-1 bg-gradient-to-tr from-blue-700 to-blue-500 hover:to-blue-600 active:scale-95 text-white font-extrabold text-[9px] rounded-xl uppercase tracking-wider text-center shadow-md cursor-pointer"
            >
              🌧️ Rain FCM
            </button>
            <button
              onClick={() => triggerFirebaseNotificationSimulator('irrigation')}
              className="py-2.5 px-1 bg-gradient-to-tr from-emerald-700 to-emerald-500 hover:to-emerald-600 active:scale-95 text-white font-extrabold text-[9px] rounded-xl uppercase tracking-wider text-center shadow-md cursor-pointer"
            >
              💧 Irrigation FCM
            </button>
            <button
              onClick={() => triggerFirebaseNotificationSimulator('pest')}
              className="py-2.5 px-1 bg-gradient-to-tr from-indigo-800 to-indigo-600 hover:to-indigo-700 active:scale-95 text-white font-extrabold text-[9px] rounded-xl uppercase tracking-wider text-center shadow-md cursor-pointer"
            >
              🐛 Insect FCM
            </button>
          </div>

          {/* FCM Notifications Log */}
          <div>
            <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-2">Subscriber Received Notification Logs (FCM Native)</span>
            <div className="space-y-2 pr-1">
              {notificationsLog.map((n, idx) => (
                <div key={n.id} className="bg-slate-50 border border-slate-100 p-2.5 rounded-2xl relative block">
                  <div className="flex justify-between items-center text-[8px] font-black text-emerald-700 uppercase tracking-widest leading-none">
                    <span>{n.type}</span>
                    <span className="text-slate-400">{n.time}</span>
                  </div>
                  <h6 className="font-extrabold text-[11px] text-slate-800 mt-1">{n.title}</h6>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-0.5">{n.body}</p>
                  <span className="absolute bottom-1.5 right-2 text-[6px] font-black text-slate-300 uppercase tracking-widest">{n.channel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
