import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Leaf, 
  MapPin, 
  DollarSign, 
  ShieldCheck, 
  CloudRain, 
  Volume2, 
  VolumeX, 
  Layers, 
  Sun, 
  Activity, 
  Check,
  Award,
  ChevronRight,
  ChevronLeft,
  ArrowRight
} from 'lucide-react';
import { LanguageCode } from '../types';
import { db } from '../firebase';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';

interface AICropPredictionSystemProps {
  currentLang: LanguageCode;
  onClose: () => void;
  triggerToast: (msg: string) => void;
  initialCropName?: string;
}

interface CropPredictionData {
  id: string;
  keyName: string;
  name: { en: string; kn: string; hi: string };
  expectedDemand: 'HIGH' | 'MEDIUM' | 'LOW';
  demandText: { en: string; kn: string; hi: string };
  profitPotential: 'HIGH' | 'MEDIUM' | 'LOW';
  expectedProfitRange: { en: string; kn: string; hi: string };
  investmentRequired: { en: string; kn: string; hi: string };
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  topDistricts: { en: string[]; kn: string[]; hi: string[] };
  mandiPriceAnalysis: { en: string; kn: string; hi: string };
  seasonalTrendData: number[]; // 4 Quarters demand index (0-100)
  climateRisks: {
    rainfall: 'HIGH' | 'MEDIUM' | 'LOW';
    drought: 'HIGH' | 'MEDIUM' | 'LOW';
    pest: 'HIGH' | 'MEDIUM' | 'LOW';
    instability: number; // percentage index
  };
  narrativeInsight: { en: string; kn: string; hi: string };
}

const PREDICTION_DATA_LIST: CropPredictionData[] = [
  {
    id: 'p1',
    keyName: 'rice',
    name: { en: 'Sona Masuri Rice (ಭತ್ತ)', kn: 'ಭತ್ತ / ಅಕ್ಕಿ (Rice)', hi: 'धान / चावल (Paddy)' },
    expectedDemand: 'HIGH',
    demandText: {
      en: 'Strong export orders coupled with high state procurement guarantees stable top-tier market volume.',
      kn: 'ಬಲವಾದ ರಫ್ತು ಆರ್ಡರ್‌ಗಳು ಹಾಗೂ ಹೆಚ್ಚಿನ ಸರ್ಕಾರಿ ಖರೀದಿ ಖಾತರಿಯಿಂದಾಗಿ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಗರಿಷ್ಠ ಬೇಡಿಕೆ ಇದೆ.',
      hi: 'मजबूत निर्यात सौदों और सरकारी खरीद के कारण बाजार में धान की निरंतर बहुत अच्छी मांग रहेगी।'
    },
    profitPotential: 'HIGH',
    expectedProfitRange: { en: '₹48,000 - ₹55,000 / Acre', kn: 'ಎಕರೆಗೆ ₹೪೮,೦೦೦ - ₹೫೫,೦೦೦ ಲಾಭ', hi: '₹48,000 - ₹55,000 प्रति एकड़ मुनाफा' },
    investmentRequired: { en: '₹14,000 / Acre', kn: 'ಬಂಡವಾಳ ಎಕರೆಗೆ ₹೧೪,೦೦೦', hi: 'निवेश लग-भग ₹14,000 प्रति एकड़' },
    riskLevel: 'LOW',
    topDistricts: {
      en: ['Raichur', 'Mandya', 'Ballari', 'Koppal'],
      kn: ['ರಾಯಚೂರು', 'ಮಂಡ್ಯ', 'ಬಳ್ಳಾರಿ', 'ಕೊಪ್ಪಳ'],
      hi: ['रायचूर', 'मंड्या', 'बल्लारी', 'कोप्पल']
    },
    mandiPriceAnalysis: {
      en: 'Expected APMC Price Range: ₹2,400 - ₹2,850 / Quintal. Trend shows steady 8% harvest-time raise.',
      kn: 'ಅಂದಾಜು APMC ದರ: ಕ್ವಿಂಟಾಲ್‌ಗೆ ₹೨,೪೦೦ - ₹೨,೮೫೦. ಕಟಾವಿನ ಅವಧಿಯಲ್ಲಿ ಸ್ಥಿರ ೮% ದರ ಏರಿಕೆಯ ಸಾಧ್ಯತೆಯಿದೆ.',
      hi: 'अनुमानित मंडी दर: ₹2,400 से ₹2,850 प्रति क्विंटल। कटाई अवधि में 8% मूल्य वृद्धि की प्रबल संभावना है।'
    },
    seasonalTrendData: [65, 80, 95, 75], // Q1, Q2, Q3, Q4
    climateRisks: {
      rainfall: 'LOW',
      drought: 'MEDIUM',
      pest: 'MEDIUM',
      instability: 25
    },
    narrativeInsight: {
      en: 'Water logged soil baselines remain adequate. Minimize direct seed loss using wet bed nursery methods.',
      kn: 'ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಉತ್ತಮವಾಗಿದೆ. ವೆಟ್ ಬೆಡ್ ನರ್ಸರಿ ವಿಧಾನದಿಂದ ಬೀಜಗಳ ನಷ್ಟವನ್ನು ಶೂನ್ಯಕ್ಕೆ ಇಳಿಸಿ.',
      hi: 'मिट्टी में उचित पानी और नमी स्तर मौजूद है। जैविक तरीकों से नर्सरी प्रबंधन कर बीज हानि कम करें।'
    }
  },
  {
    id: 'p2',
    keyName: 'tomato',
    name: { en: 'Tomato (ಟೊಮೆಟೊ)', kn: 'ಟೊಮೆಟೊ (Tomato)', hi: 'टमाटर (Tomato)' },
    expectedDemand: 'HIGH',
    demandText: {
      en: 'Substantial processing demands from cities combined with occasional festive supply crunches keep demand elevated.',
      kn: 'ನಗರಗಳಲ್ಲಿ ನಿರಂತರ ಟೊಮೆಟೊ ಪ್ರೊಸೆಸಿಂಗ್ ಬೇಡಿಕೆ ಹಾಗೂ ಹಬ್ಬಗಳ ಕಾರಣದಿಂದ ಮಾರುಕಟ್ಟೆ ಬೇಡಿಕೆ ಉನ್ನತ ಮಟ್ಟದಲ್ಲಿದೆ.',
      hi: 'सब्जी मंडियों और शहरी बाजारों में हमेशा उच्च मांग। त्योहारों के मौसम में आपूर्ति घटने पर भारी मुनाफा मिलेगा।'
    },
    profitPotential: 'HIGH',
    expectedProfitRange: { en: '₹65,000 - ₹82,000 / Acre', kn: 'ಎಕರೆಗೆ ₹೬೫,೦೦೦ - ₹೮೨,೦೦೦ ಗರಿಷ್ಠ ಲಾಭ', hi: '₹65,000 - ₹82,000 प्रति एकड़ भारी मुनाफा' },
    investmentRequired: { en: '₹18,000 / Acre', kn: 'ಬಂಡವಾಳ ಎಕರೆಗೆ ₹೧೮,೦೦೦', hi: 'निवेश लग-भग ₹18,000 प्रति एकड़' },
    riskLevel: 'HIGH',
    topDistricts: {
      en: ['Kolar', 'Chikkaballapur', 'Belagavi', 'Mysuru'],
      kn: ['ಕೋಲಾರ', 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ', 'ಬೆಳಗಾವಿ', 'ಮೈಸೂರು'],
      hi: ['कोलार', 'चिक्काबल्लापुर', 'बेलगावी', 'मैसूर']
    },
    mandiPriceAnalysis: {
      en: 'Mandi Price target: ₹35 - ₹52 / kg. High volatility expected mid-monsoon. Time your sowing intervals.',
      kn: 'ಮಂಡಿ ಬೆಲೆ ಗುರಿ: ಕೆಜಿಗೆ ₹೩೫ - ₹೫೨. ಮುಂಗಾರು ಮಧ್ಯದಲ್ಲಿ ಭಾರಿ ಏರುಪೇರು ನಿರೀಕ್ಷಿತ. ಸಕಾಲಿಕ ಬಿತ್ತನೆಗೆ ಸಲಹೆ.',
      hi: 'मंडी भाव लक्ष्य: ₹35 से ₹52 प्रति किलो। अगस्त-सितंबर में भारी उतार-चढ़ाव संभव। योजनाबद्ध तरीक़े से ही रोपें।'
    },
    seasonalTrendData: [45, 90, 85, 30],
    climateRisks: {
      rainfall: 'HIGH',
      drought: 'LOW',
      pest: 'HIGH',
      instability: 70
    },
    narrativeInsight: {
      en: 'Extreme susceptibility to leaf blight and wilt under sudden rain spikes. Rigorous drip scheduling highly recommended.',
      kn: 'ಧಾರಾಕಾರ ಮಳೆಯಿಂದಾಗಿ ಎಲೆ ಮುರುಟು ಹಾಗೂ ಬ್ಲೈಟ್ ರೋಗ ಉಲ್ಬಣಿಸುವ ಅಪಾಯವಿದೆ. ವ್ಯವಸ್ಥಿತ ಹನಿ ನೀರಾವರಿ ಬಳಸಿ.',
      hi: 'अचानक अधिक बारिश से अंगमारी और झुलसा रोग का खतरा। ड्रिप सिंचाई का व्यवस्थित छिड़काव अत्यंत लाभकारी होगा।'
    }
  },
  {
    id: 'p3',
    keyName: 'onion',
    name: { en: 'Bellary Flat Onion (ಈರುಳ್ಳಿ)', kn: 'ರಾಜ ಈರುಳ್ಳಿ (Onion)', hi: 'लाल प्याज (Onion)' },
    expectedDemand: 'MEDIUM',
    demandText: {
      en: 'Steady institutional purchase alongside standard household stockpiles provides predictable trade volume.',
      kn: 'ನಿರಂತರ ಗೃಹಾವಶ್ಯಕ ಹಾಗು ಹೋಟೆಲ್ ಮಾರುಕಟ್ಟೆ ಖರೀದಿ ಇರುವುದರಿಂದ ಮಾರುಕಟ್ಟೆ ವ್ಯಾಪಾರ ಯಾವಾಗಲೂ ಸ್ಥಿರವಾಗಿರುತ್ತದೆ.',
      hi: 'सालों भर चलने वाली घरेलू और थोक मांग। भंडारण क्षमता मजबूत होने से विपणन और दाम सुरक्षित रहते हैं।'
    },
    profitPotential: 'MEDIUM',
    expectedProfitRange: { en: '₹35,000 - ₹42,000 / Acre', kn: 'ಎಕರೆಗೆ ₹೩೫,೦೦೦ - ₹೪೨,೦೦೦ ಮಧ್ಯಮ ಲಾಭ', hi: '₹35,000 - ₹42,000 प्रति एकड़ मध्यम लाभ' },
    investmentRequired: { en: '₹10,500 / Acre', kn: 'ಬಂಡವಾಳ ಎಕರೆಗೆ ₹೧೦,೫೦೦', hi: 'निवेश लग-भग ₹10,500 प्रति एकड़' },
    riskLevel: 'LOW',
    topDistricts: {
      en: ['Chitradurga', 'Gadag', 'Bagalkote', 'Dharwad'],
      kn: ['ಚಿತ್ರದುರ್ಗ', 'ಗದಗ', 'ಬಾಗಲಕೋಟೆ', 'ಧಾರವಾಡ'],
      hi: ['चित्रदुर्ग', 'गदग', 'बागलकोट', 'धारवाड़']
    },
    mandiPriceAnalysis: {
      en: 'Mandi Price Target: ₹28 - ₹38 / kg. Post-harvest curing ensures the highest export premium returns.',
      kn: 'ಮಂಡಿ ಬೆಲೆ ಗುರಿ: ಕೆಜಿಗೆ ₹೨೮ - ₹೩೮. ಕಟಾವಿನ ನಂತರ ಉತ್ತಮ ಒಣಗಿಸುವಿಕೆಯಿಂದ ಗರಿಷ್ಠ ಲಾಭ ಪಡೆಯಬಹುದು.',
      hi: 'मंडी भाव लक्ष्य: ₹28 से ₹38 प्रति किलो। तुड़ाई के बाद प्याज को सुखाना सर्वोत्तम मूल्य पाने की कुंजी है।'
    },
    seasonalTrendData: [70, 75, 60, 85],
    climateRisks: {
      rainfall: 'MEDIUM',
      drought: 'LOW',
      pest: 'LOW',
      instability: 35
    },
    narrativeInsight: {
      en: 'Onion thrives with limited watering. Sowing on raised beds prevents bulb saturation and soil rot.',
      kn: 'ಈರುಳ್ಳಿ ಕಡಿಮೆ ನೀರಿನಲ್ಲಿ ಬೆಳೆಯುತ್ತದೆ. ಬೆಡ್ ಸಿಸ್ಟಮ್ ವಿಧಾನ ಬಳಸಿ ಮಣ್ಣಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
      hi: 'कम पानी में बेहतरीन पैदावार। उठी हुई क्यारियों (Raised Beds) में बुवाई करने से कंद सड़न रोग से बचाव होता है।'
    }
  },
  {
    id: 'p4',
    keyName: 'sugarcane',
    name: { en: 'Sugarcane (ಕಬ್ಬು)', kn: 'ಕಬ್ಬು (Sugarcane)', hi: 'गन्ना (Sugarcane)' },
    expectedDemand: 'MEDIUM',
    demandText: {
      en: 'Sugar mill processing commitments and bio-ethanol state targets provide safe direct-to-mill purchase contracts.',
      kn: 'ಸಕ್ಕರೆ ಕಾರ್ಖಾನೆಗಳ ಕಾಂಟ್ರಾಕ್ಟ್ ಹಾಗೂ ಬಯೋ-ಎಥೆನಾಲ್ ಮಿಷನ್ ದೇಶಾದ್ಯಂತ ಕಬ್ಬಿಗೆ ಸುರಕ್ಷಿತ ಖರೀದಿ ಖಾತರಿ ಒದಗಿಸುತ್ತದೆ.',
      hi: 'चीनी मिलों और बायो-इथेनॉल संयंत्रों द्वारा सीधे खेत से उठाने की गारंटी। घाटे का कोई खतरा नहीं।'
    },
    profitPotential: 'HIGH',
    expectedProfitRange: { en: '₹80,000 - ₹95,000 / Acre', kn: 'ಎಕರೆಗೆ ₹೮೦,೦೦೦ - ₹೯೫,೦೦೦ ನಿವ್ವಳ ಲಾಭ', hi: '₹80,000 - ₹95,000 प्रति एकड़ भारी निश्चित लाभ' },
    investmentRequired: { en: '₹22,000 / Acre', kn: 'ಬಂಡವಾಳ ಎಕರೆಗೆ ₹೨೨,೦೦೦', hi: 'निवेश लग-भग ₹22,000 प्रति एकड़' },
    riskLevel: 'LOW',
    topDistricts: {
      en: ['Belagavi', 'Mandya', 'Bagalkote', 'Mysuru'],
      kn: ['ಬೆಳಗಾವಿ', 'ಮಂಡ್ಯ', 'ಬಾಗಲಕೋಟೆ', 'ಮೈಸೂರು'],
      hi: ['बेलगावी', 'मंड्या', 'बागलकोट', 'मैसूर']
    },
    mandiPriceAnalysis: {
      en: 'Mill Fair Price index: ₹3,150 - ₹3,400 / ton. Government FRP keeps return baseline fully secured.',
      kn: 'ಮಿಲ್ ಮೌಲ್ಯ ದರ: ಟನ್‌ಗೆ ₹೩,೧೫೦ - ₹೩,೪೦೦. ಸರ್ಕಾರದ ಹೆಚ್-ಎಫ್-ಆರ್-ಪಿ ನಿಯಮಗಳಿಂದಾಗಿ ಬೆಲೆ ಖಾತರಿ ಕಚಿತ.',
      hi: 'अनुमानित मिल मूल्य: ₹3,150 से ₹3,400 प्रति टन। सरकारी एफआरपी मूल्य जोखिम को शून्य कर देता है।'
    },
    seasonalTrendData: [85, 90, 80, 85],
    climateRisks: {
      rainfall: 'LOW',
      drought: 'HIGH',
      pest: 'LOW',
      instability: 20
    },
    narrativeInsight: {
      en: 'Extremely high primary moisture demand. Pair with the Smart Irrigation system to reduce pumping bills by 35%.',
      kn: 'ಕಬ್ಬಿಗೆ ಹೆಚ್ಚಿನ ನೀರಿನ ಅವಶ್ಯಕತೆ ಇದೆ. ಸ್ಮಾರ್ಟ್ ಹನಿ ನೀರಾವರಿ ಯಂತ್ರ ಬಳಸಿ ವಿದ್ಯುತ್ ಹಾಗು ನೀರು ಉಳಿಸಿ.',
      hi: 'अत्यधिक जल की मांग वाली दीर्घकालिक फसल। स्मार्ट सिंचाई और मल्चिंग से पानी का खर्च 35% तक कम करें।'
    }
  },
  {
    id: 'p5',
    keyName: 'millet',
    name: { en: 'Foxtail Millet / Ragi (ರಾಗಿ)', kn: 'ರಾಗಿ / ಹೆಜ್ಜೆನೆಲ (Millet)', hi: 'बाजरा / रागी (Millet)' },
    expectedDemand: 'HIGH',
    demandText: {
      en: 'Rising health food demands, central superfood incentives, and high protein retail margins cause a demand surge.',
      kn: 'ಸಾವಯವ ಆಹಾರ ಪದ್ಧತಿಯ ಹೆಚ್ವುಳ ಬೇಡಿಕೆ ಹಾಗು ಸರ್ಕಾರದ ಒತ್ತು ನೀತಿಯಿಂದಾಗಿ ಸಿರಿಧಾನ್ಯಗಳಿಗೆ ಬಲವಾದ ಬೇಡಿಕೆ ಮೂಡಿದೆ.',
      hi: 'शहरी क्षेत्रों में सुपरफूड और स्वास्थ्य जागरूकता बढ़ने से रागी और बाजरा की मांग रिकॉर्ड स्तर पर।'
    },
    profitPotential: 'MEDIUM',
    expectedProfitRange: { en: '₹28,000 - ₹36,000 / Acre', kn: 'ಎಕರೆಗೆ ₹೨೮,೦೦೦ - ₹೩೬,೦೦೦ ರಾಗಿ ಲಾಭ', hi: '₹28,000 - ₹36,000 प्रति एकड़ सीधा मुनाफा' },
    investmentRequired: { en: '₹4,500 / Acre', kn: 'ಬಂಡವಾಳ ಎಕರೆಗೆ ಕೇವಲ ₹೪,೫೦೦', hi: 'अति-न्यून निवेश लग-भग ₹4,500 प्रति एकड़' },
    riskLevel: 'LOW',
    topDistricts: {
      en: ['Tumakuru', 'Chitradurga', 'Kolar', 'Hassan'],
      kn: ['ತುಮಕೂರು', 'ಚಿತ್ರದುರ್ಗ', 'ಕೋಲಾರ', 'ಹಾಸನ'],
      hi: ['तुमकुर', 'चित्रदुर्ग', 'कोलार', 'हासन']
    },
    mandiPriceAnalysis: {
      en: 'Mandi APMC Average: ₹3,800 - ₹4,400 / Quintal. Extremely low farming costs yield beautiful safety nets.',
      kn: 'ಮಂಡಿ ಸರಾಸರಿ ದರ: ಕ್ವಿಂಟಾಲ್‌ಗೆ ₹೩,೮೦೦ - ₹೪,೪೦೦. ಕಡಿಮೆ ಬಿತ್ತನೆ ಖರ್ಚು ಇರುವುದರಿಂದ ಅತ್ಯಂತ ನಂಬಿಕಸ್ಥ ಬೆಳೆ.',
      hi: 'मंडी भाव: ₹3,800 से ₹4,400 प्रति क्विंटल। मामूली लागत होने के कारण यह फसल सबसे सुरक्षित बीमा समान है।'
    },
    seasonalTrendData: [50, 60, 75, 95],
    climateRisks: {
      rainfall: 'LOW',
      drought: 'LOW',
      pest: 'LOW',
      instability: 10
    },
    narrativeInsight: {
      en: 'Superb micro-drought resilience. Almost zero chemical fertilizer demand makes it highly organic.',
      kn: 'ಅತಿ ಹೆಚ್ಚು ಬರ ನಿರೋಧಕ ಶಕ್ತಿ ಹೊಂದಿದೆ. ಶೂನ್ಯ ಕೆಮಿಕಲ್ ಗೊಬ್ಬರ ಬಳಕೆಯಿಂದ ಈ ಬೆಳೆ ಅತ್ಯಂತ ನೈಸರ್ಗಿಕ.',
      hi: 'सूखे और भीषण गर्मी को सहने में पूरी तरह समर्थ। बिना रसायनों के उगने वाली सर्वश्रेष्ठ पर्यावरण-अनुकूल फसल।'
    }
  },
  {
    id: 'p6',
    keyName: 'cotton',
    name: { en: 'Long Staple Cotton (ಹತ್ತಿ)', kn: 'ಹತ್ತಿ / ಬಿಳಿ ಚಿನ್ನ (Cotton)', hi: 'कपास / सफेद सोना (Cotton)' },
    expectedDemand: 'LOW',
    demandText: {
      en: 'Moderate domestic supply abundance and lower global ginning margins may affect swift immediate trade liquidations.',
      kn: 'ಜಾಗತಿಕವಾಗಿ ಹತ್ತಿ ಇಳುವರಿ ಉತ್ತಮವಾಗಿರುವುದರಿಂದ ಮತ್ತು ವಿದೇಶಿ ಮಾರುಕಟ್ಟೆಗಳಲ್ಲಿ ಬೇಡಿಕೆ ಕಡಿಮೆ ಇರುವುದರಿಂದ ನಿಧಾನ ವ್ಯಾಪಾರ.',
      hi: 'वैश्विक स्तर पर कपास के भारी बफर स्टॉक होने से कीमतों में मंदी का रुख, संभलकर निर्णय लें।'
    },
    profitPotential: 'MEDIUM',
    expectedProfitRange: { en: '₹40,000 - ₹48,000 / Acre', kn: 'ಎಕರೆಗೆ ₹೪೦,೦೦೦ - ₹೪೮,೦೦೦ ಹತ್ತಿ ಲಾಭ', hi: '₹40,000 - ₹48,000 प्रति एकड़ सामान्य लाभ' },
    investmentRequired: { en: '₹15,000 / Acre', kn: 'ಬಂಡವಾಳ ಎಕರೆಗೆ ₹೧೫,೦೦೦', hi: 'निवेश लग-भग ₹15,000 प्रति एकड़' },
    riskLevel: 'HIGH',
    topDistricts: {
      en: ['Dharwad', 'Haveri', 'Kalaburagi', 'Raichur'],
      kn: ['ಧಾರವಾಡ', 'ಹಾವೇರಿ', 'ಕಲಬುರಗಿ', 'ರಾಯಚೂರು'],
      hi: ['धारवाड़', 'हावेरी', 'कलबुर्गी', 'रायचूर']
    },
    mandiPriceAnalysis: {
      en: 'Mandi pricing target: ₹6,900 - ₹7,450 / Quintal. Sowing redgram borders reduces bollworm pest transmission risk.',
      kn: 'ಮಂಡಿ ಬೆಲೆ ಗುರಿ: ಕ್ವಿಂಟಾಲ್‌ಗೆ ₹೬,೯೦೦ - ₹೭,೪೫೦. ತೊಗರಿ ಅಂಚು ಬೆಳೆಯುವುದರಿಂದ ಕೀಟ ಹಾವಳಿ ಕಿರಿದಾಗಿಸಲು ಅನುಕೂಲ.',
      hi: 'मंडी भाव लक्ष्य: ₹6,900 से ₹7,450 प्रति क्विंटल। कीटों से बचाव के लिए अरहर की मिश्रित खेती की सलाह।'
    },
    seasonalTrendData: [90, 60, 45, 50],
    climateRisks: {
      rainfall: 'HIGH',
      drought: 'MEDIUM',
      pest: 'HIGH',
      instability: 60
    },
    narrativeInsight: {
      en: 'Vulnerable to pink bollworm outbreaks if atmospheric relative humidity scales high. Watch soil iron baselines.',
      kn: 'ಗಾಳಿಯಲ್ಲಿ ಆರ್ದ್ರತೆ ಮೀರಿದರೆ ಗುಲಾಬಿ ಕಾಯಿ ಕೊರಕ ಜೀವಿಗಳ ಭೀತಿ ಹೆಚ್ಚುತ್ತದೆ. ಮಣ್ಣಿನ ಜಿಂಕ್ ಮಟ್ಟ ಪರಿಶೀಲಿಸಿ.',
      hi: 'हवा में अधिक नमी रहने पर गुलाबी कीट (Bollworm) का प्रकोप बढ़ सकता है। खेत की निगरानी बढ़ाएं।'
    }
  }
];

const TRANSLATIONS: Record<string, any> = {
  en: {
    title: 'AI Future Crop Forecast Hub',
    sub: 'Geo-Meteorological Demand & Profit Predictor',
    close: 'Exit Prediction Hub',
    recTitle: 'Recommended Crop Selection Matrix',
    recSub: 'AI selected crops matching local climate forecasts',
    profCrops: 'Highly Profitable Crops',
    safeCrops: 'Climate-Safe Super Crops',
    lowRiskCrops: 'Low-capital Low-risk Crops',
    demandLabel: 'A.I. Market Demand Projection',
    profitLabel: 'A.I. Net Profit Potential',
    riskLabel: 'Climate Risk Mitigation Match',
    estProfit: 'Net Expected Return',
    estInvest: 'Estimated Sowing Cost',
    climateRiskHeader: 'Met-Station Risk Matrix',
    pestsRisk: 'Pest Outbreak Hazard',
    droughtRisk: 'Drought Dryness Factor',
    rainRisk: 'Fungal Rainfall Decay Risk',
    instability: 'Atmospheric Instability Rate',
    mandiAnalysis: 'APMC Price Forecast Rate',
    topDistrictsLabel: 'High Yield District Hotspots',
    narrativeTitle: 'Micro-Climate Farm Advisor Directives',
    mandiTargetTrend: 'Expected Demand Cycle (Q1-Q4 Trend index)',
    voiceReport: 'Hear AI Auditory Forecast',
    voiceStop: 'Mute AI Audio',
    swipeTip: 'Swipe or Tap crops below to toggle forecast parameters'
  },
  kn: {
    title: 'ಎಐ ಭವಿಷ್ಯದ ಬೆಳೆ ಮುನ್ಸೂಚನೆ ಕೇಂದ್ರ',
    sub: 'ಮಾರುಕಟ್ಟೆ ಬೇಡಿಕೆ ಮತ್ತು ಲಾಭದ ಅಂದಾಜು',
    close: 'ಮುನ್ಸೂಚನೆ ಕೇಂದ್ರದಿಂದ ನಿರ್ಗಮಿಸಿ',
    recTitle: 'ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆ ಆಯ್ಕೆಗಳು',
    recSub: 'ಸ್ಥಳೀಯ ಹವಾಮಾನಕ್ಕೆ ಸೂಕ್ತವಾದ ಬೆಳೆಗಳು',
    profCrops: 'ಗರಿಷ್ಠ ಲಾಭ ನೀಡುವ ಬೆಳೆಗಳು',
    safeCrops: 'ಹವಾಮಾನ ನಿರೋಧಕ ಬೆಳೆಗಳು',
    lowRiskCrops: 'ಕಡಿಮೆ ಬಂಡವಾಳದ ಸುಭದ್ರ ಬೆಳೆಗಳು',
    demandLabel: 'ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಮಾರುಕಟ್ಟೆ ಬೇಡಿಕೆ',
    profitLabel: 'ಲಾಭ ಗಳಿಸುವ ಸಾಮರ್ಥ್ಯ',
    riskLabel: 'ಹವಾಮಾನ ವಿಪತ್ತು ಪರೀಕ್ಷೆ',
    estProfit: 'ನಿರೀಕ್ಷಿತ ನಿವ್ವಳ ಲಾಭ',
    estInvest: 'ಅಂದಾಜು ಬಿತ್ತನೆ ವೆಚ್ಚ',
    climateRiskHeader: 'ಹವಾಮಾನ ವಿಪತ್ತು ಸೂಚಕಗಳು',
    pestsRisk: 'ಕೀಟ ಹಾವಳಿಯ ತೊಂದರೆಗಳು',
    droughtRisk: 'ಬರಗಾಲದ ಒಣಹವೆ ಸೂಚ್ಯಂಕ',
    rainRisk: 'ಮಳೆಯಿಂದ ಬೆಳೆ ಕೊಳೆಯುವ ಅಪಾಯ',
    instability: 'ಹವಾಮಾನ ಏರುಪೇರು ಪ್ರಮಾಣ',
    mandiAnalysis: 'ಮಂಡಿ ಎಪಿಎಂಸಿ ದರ ಮುನ್ಸೂಚನೆ',
    topDistrictsLabel: 'ಉತ್ತಮ ಇಳುವರಿ ನೀಡುವ ಜಿಲ್ಲೆಗಳು',
    narrativeTitle: 'ಕೃಷಿ ಹವಾಮಾನ ತಜ್ಞರ ನೇರ ಸಲಹೆಗಳು',
    mandiTargetTrend: 'ತ್ರೈಮಾಸಿಕ ಬೇಡಿಕೆ ಏರಿಳಿತದ ಗ್ರಾಫ್ (Q1-Q4)',
    voiceReport: 'ಧ್ವನಿ ಮುನ್ಸೂಚನೆ ಆಲಿಸಿ',
    voiceStop: 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ',
    swipeTip: 'ಬೆಳೆಗಳ ಮುನ್ಸೂಚನೆ ನೋಡಲು ಕೆಳಗಿನ ಬೆಳೆಗಳ ಮೇಲೆ ಟ್ಯಾಪ್ ಮಾಡಿ'
  },
  hi: {
    title: 'AI भविष्य फसल पूर्वानुमान केंद्र',
    sub: 'मौसम-सक्षम मांग और मंडी लाभ अनुमानक',
    close: 'पूर्वानुमान केंद्र बंद करें',
    recTitle: 'अनुशंसित फसल चयन प्रणाली',
    recSub: 'स्थानीय जलवायु के अनुकूल सर्वोत्तम फसलें',
    profCrops: 'अत्यधिक लाभदायक फसलें',
    safeCrops: 'मौसम-अनुकूल सुपर फसलें',
    lowRiskCrops: 'कम लागत वाली सुरक्षित फसलें',
    demandLabel: 'A.I. बाजार मांग पूर्वानुमान',
    profitLabel: 'कृत्रिम बुद्धिमत्ता शुद्ध लाभ क्षमता',
    riskLabel: 'जलवायु जोखिम मुकाबला योग्यता',
    estProfit: 'अनुमानित शुद्ध आय (प्रति एकड़)',
    estInvest: 'अनुमानित बुवाई लागत',
    climateRiskHeader: 'मौसम स्टेशन जोखिम विश्लेषण',
    pestsRisk: 'कीट प्रकोप का जोखिम',
    droughtRisk: 'सूखे और प्रचंड गर्मी का सूचकांक',
    rainRisk: 'अत्यधिक वर्षा से फसलों के सड़ने का खतरा',
    instability: 'मौसम अस्थिरता का प्रतिशत दर',
    mandiAnalysis: 'मंडी एपीएमसी दर पूर्वानुमान',
    topDistrictsLabel: 'सर्वोत्तम पैदावार वाले जिले',
    narrativeTitle: 'कृषि मौसम वैज्ञानिक सलाह',
    mandiTargetTrend: 'त्रैमासिक मांग चक्र (Q1-Q4 ट्रेंड ग्राफ)',
    voiceReport: 'AI से विश्लेषण आवाज में सुनें',
    voiceStop: 'आवाज बंद करें',
    swipeTip: 'फसल का पूर्वानुमान बदलने के लिए नीचे फ़सलों पर स्पर्श करें'
  }
};

export const AICropPredictionSystem: React.FC<AICropPredictionSystemProps> = ({
  currentLang,
  onClose,
  triggerToast,
  initialCropName
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];

  const [cropList, setCropList] = useState<CropPredictionData[]>(PREDICTION_DATA_LIST);

  // Real-time listener for cropPredictions
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'cropPredictions'), (snapshot) => {
      if (!snapshot.empty) {
        const list: CropPredictionData[] = [];
        snapshot.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() } as any);
        });
        setCropList(list);
      } else {
        // Auto-seed crop predictions as back-compatibility fallback
        PREDICTION_DATA_LIST.forEach(async (item) => {
          try {
            await setDoc(doc(db, 'cropPredictions', item.id), item);
          } catch (e) {
            console.warn("Target crop prediction seed bypassed:", e);
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Select initial crop matched against user search parameters
  const getInitialIndex = () => {
    if (!initialCropName) return 1; // Tomato as default sweet point
    const cleanName = initialCropName.toLowerCase();
    const idx = cropList.findIndex(p => cleanName.includes(p.keyName));
    return idx !== -1 ? idx : 1;
  };

  const [activeIndex, setActiveIndex] = useState<number>(getInitialIndex());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const activeCrop = cropList[activeIndex] || cropList[0] || PREDICTION_DATA_LIST[0];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % cropList.length);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + cropList.length) % cropList.length);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Speaks prediction insights loud
  const handleVoiceReport = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const name = activeCrop.name[currentLang] || activeCrop.name['en'];
      const profit = activeCrop.expectedProfitRange[currentLang] || activeCrop.expectedProfitRange['en'];
      const demand = activeCrop.expectedDemand;
      const narrative = activeCrop.narrativeInsight[currentLang] || activeCrop.narrativeInsight['en'];
      const mandi = activeCrop.mandiPriceAnalysis[currentLang] || activeCrop.mandiPriceAnalysis['en'];

      let message = '';
      if (currentLang === 'kn') {
        message = `${t.title}. ಬೆಳೆ: ${name}. ಮಾರುಕಟ್ಟೆ ಬೇಡಿಕೆ ಮಟ್ಟ: ${demand}. ನಿರೀಕ್ಷಿತ ಆದಾಯ: ${profit}. ಎಪಿಎಂಸಿ ದರ ವಿಶ್ಲೇಷಣೆ: ${mandi}. ಹವಾಮಾನ ಸಲಹೆ: ${narrative}`;
      } else if (currentLang === 'hi') {
        message = `${t.title} रिपोर्ट। फसल: ${name}। बाजार मांग: ${demand}। कुल लाभ अनुमान: ${profit}। मंडी भाव समीक्षा: ${mandi}। कृषि वैज्ञानिक निर्देश: ${narrative}`;
      } else {
        message = `AI Future Sowing Report for ${name}. Expected global demand level is evaluated as ${demand}, offering a return estimate of ${profit}. Mandi analysis: ${mandi}. Climate advisory instructions: ${narrative}`;
      }

      const utterance = new SpeechSynthesisUtterance(message);
      
      if (currentLang === 'kn') utterance.lang = 'kn-IN';
      else if (currentLang === 'hi') utterance.lang = 'hi-IN';
      else utterance.lang = 'en-IN';

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      triggerToast('Audio speech synthesis is not supported inside frame options.');
    }
  };

  return (
    <div 
      className="absolute inset-x-0 top-0 min-h-full bg-slate-950/50 backdrop-blur-md z-50 p-4 flex justify-center items-start animate-fade-in"
      onClick={() => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        setIsSpeaking(false);
        onClose();
      }}
    >
      <div 
        className="bg-white rounded-[32px] w-full max-w-md shadow-2xl border border-emerald-100 overflow-hidden mt-6 mb-12 flex flex-col animate-slide-up pb-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Emerald Sparkle Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-900 p-5 text-white flex justify-between items-center relative">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center animate-pulse">
              <Sparkles className="w-5.5 h-5.5 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-widest uppercase leading-tight">{t.title}</h1>
              <p className="text-[10px] text-emerald-200 font-bold opacity-90">{t.sub}</p>
            </div>
          </div>
          <button 
            id="exit_prediction_hub"
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

        {/* Swipeable Prediction Card Carousel container */}
        <div className="p-4 space-y-4">
          
          <div className="relative bg-gradient-to-b from-slate-50 to-slate-100/50 rounded-[28px] p-4.5 border border-slate-100 shadow-inner">
            
            {/* Header controls inside card */}
            <div className="flex justify-between items-center mb-3">
              <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full ${
                activeCrop.expectedDemand === 'HIGH' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : activeCrop.expectedDemand === 'MEDIUM' 
                  ? 'bg-slate-200 text-slate-700 border border-slate-300' 
                  : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                Demand: {activeCrop.expectedDemand}
              </span>

              <div className="flex space-x-2 items-center">
                <button 
                  onClick={handlePrev}
                  className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer active:scale-95 transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-700" />
                </button>
                <span className="text-[10px] font-mono font-black text-slate-500">
                  {activeIndex + 1} / {cropList.length}
                </span>
                <button 
                  onClick={handleNext}
                  className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer active:scale-95 transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </button>
              </div>
            </div>

            {/* Crop name & brief demand narrative */}
            <div className="space-y-1.5 pb-3">
              <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <Leaf className="w-5.5 h-5.5 text-emerald-600" />
                <span>{activeCrop.name[currentLang] || activeCrop.name['en']}</span>
              </h2>
              <p className="text-[11px] text-slate-600 font-bold leading-normal">
                {activeCrop.demandText[currentLang] || activeCrop.demandText['en']}
              </p>
            </div>

            {/* Direct Market APMC pricing box */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-150 space-y-2 mb-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
                  {t.mandiAnalysis}
                </span>
                <span className="uppercase text-[8px] tracking-widest font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  APMC Trend Validated
                </span>
              </div>
              <p className="text-xs font-black text-slate-800 leading-normal">
                {activeCrop.mandiPriceAnalysis[currentLang] || activeCrop.mandiPriceAnalysis['en']}
              </p>
            </div>

            {/* Visual Indicators & estimated investment data */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white border border-slate-150 rounded-2xl p-2.5">
                <span className="block text-[8px] uppercase font-black text-slate-400 mb-0.5">{t.estProfit}</span>
                <span className="text-[11.5px] font-black text-emerald-700">{activeCrop.expectedProfitRange[currentLang] || activeCrop.expectedProfitRange['en']}</span>
              </div>
              <div className="bg-white border border-slate-150 rounded-2xl p-2.5">
                <span className="block text-[8px] uppercase font-black text-slate-400 mb-0.5">{t.estInvest}</span>
                <span className="text-[11.5px] font-black text-slate-700">{activeCrop.investmentRequired[currentLang] || activeCrop.investmentRequired['en']}</span>
              </div>
            </div>
          </div>

          {/* Clean, lightweight custom SVG chart displaying seasonal demand shift trends */}
          <div className="bg-slate-900 rounded-[28px] p-4 text-white space-y-3 shadow-lg border border-slate-950">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-emerald-400 text-[10px] uppercase tracking-wider">
                {t.mandiTargetTrend}
              </span>
              <span className="text-[9px] text-slate-400 font-mono font-bold">Base Year 2026</span>
            </div>

            {/* Stylized CSS bars simulating a beautiful micro-mobile chart */}
            <div className="flex items-end justify-between h-20 px-2 pt-2 pb-1 bg-black/20 rounded-xl relative">
              
              {/* Background baseline rings */}
              <div className="absolute left-0 right-0 top-1/4 border-t border-white/5 pointer-events-none"></div>
              <div className="absolute left-0 right-0 top-2/4 border-t border-white/5 pointer-events-none"></div>
              <div className="absolute left-0 right-0 top-3/4 border-t border-white/5 pointer-events-none"></div>

              {activeCrop.seasonalTrendData.map((val, qIdx) => (
                <div key={qIdx} className="flex flex-col items-center flex-1 space-y-2 group">
                  <div className="text-[8px] font-mono font-black text-emerald-300 opacity-80 mb-0.5">
                    {val}%
                  </div>
                  <div className="w-6.5 bg-gradient-to-t from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-yellow-400 rounded-lg transition-all" style={{ height: `${val * 0.45}px` }}></div>
                  <p className="text-[8px] font-black uppercase text-slate-400 font-mono">Q{qIdx + 1}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-1 text-[8px] font-black uppercase text-center text-slate-400">
              <div>Sowing phase</div>
              <div>Monsoon peak</div>
              <div>Harvest rush</div>
              <div>Winter export</div>
            </div>
          </div>

          {/* Met Station Climate Risk Engine indicator gauges */}
          <div className="bg-red-50/50 border border-red-100 rounded-[28px] p-4 space-y-3.5">
            <div className="flex justify-between items-center">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-red-600 animate-pulse" />
                <span>{t.climateRiskHeader}</span>
              </h4>
              <span className="text-[9px] font-mono bg-red-100 text-red-800 font-black px-2 py-0.5 rounded-full uppercase">
                Risk Instability: {activeCrop.climateRisks.instability}%
              </span>
            </div>

            {/* Direct gauges */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-extrabold uppercase">
              <div className="bg-white border border-red-100 p-2 rounded-2xl flex flex-col items-center">
                <span className="text-slate-400 text-[8px] mb-1">{t.rainRisk}</span>
                <span className={`text-[10px] inline-block font-mono ${
                  activeCrop.climateRisks.rainfall === 'HIGH' ? 'text-red-700 font-black' : 'text-slate-700'
                }`}>
                  {activeCrop.climateRisks.rainfall}
                </span>
              </div>
              <div className="bg-white border border-red-100 p-2 rounded-2xl flex flex-col items-center">
                <span className="text-slate-400 text-[8px] mb-1">{t.droughtRisk}</span>
                <span className={`text-[10px] inline-block font-mono ${
                  activeCrop.climateRisks.drought === 'HIGH' ? 'text-red-700 font-black' : 'text-slate-700'
                }`}>
                  {activeCrop.climateRisks.drought}
                </span>
              </div>
              <div className="bg-white border border-red-100 p-2 rounded-2xl flex flex-col items-center">
                <span className="text-slate-400 text-[8px] mb-1">{t.pestsRisk}</span>
                <span className={`text-[10px] inline-block font-mono ${
                  activeCrop.climateRisks.pest === 'HIGH' ? 'text-red-700 font-black' : 'text-slate-700'
                }`}>
                  {activeCrop.climateRisks.pest}
                </span>
              </div>
            </div>
          </div>

          {/* Auditory Narrative voice button */}
          <div className="bg-slate-900 hover:bg-slate-800 p-3.5 rounded-[24px] text-white flex items-center justify-between border border-slate-800 pr-4">
            <div className="flex items-center space-x-2.5">
              {isSpeaking ? (
                <Volume2 className="w-5.5 h-5.5 text-yellow-300 animate-bounce shrink-0" />
              ) : (
                <VolumeX className="w-5.5 h-5.5 text-slate-400 shrink-0" />
              )}
              <div>
                <p className="text-[10px] text-slate-200 font-black leading-none">{t.voiceReport}</p>
                <p className="text-[8.5px] text-slate-400 font-semibold mt-1">Sowing analysis narrated</p>
              </div>
            </div>
            <button
              onClick={handleVoiceReport}
              className={`text-[9px] font-extrabold uppercase px-3 py-2 rounded-xl cursor-pointer transition-all active:scale-95 text-white ${
                isSpeaking ? 'bg-red-650 hover:bg-red-750' : 'bg-emerald-650 hover:bg-emerald-750'
              }`}
            >
              {isSpeaking ? t.voiceStop : 'Narrate'}
            </button>
          </div>

          {/* Sowing recommendations advisory matrix */}
          <div className="bg-white rounded-3xl p-4 border border-slate-150 space-y-3">
            <div>
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                {t.narrativeTitle}
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                {activeCrop.narrativeInsight[currentLang] || activeCrop.narrativeInsight['en']}
              </p>
            </div>

            {/* Geographical district hubs */}
            <div className="bg-emerald-50/20 rounded-2xl p-3 border border-emerald-50 space-y-1.5">
              <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block">
                {t.topDistrictsLabel}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(activeCrop.topDistricts[currentLang] || activeCrop.topDistricts['en']).map((dst, dIdx) => (
                  <span key={dIdx} className="bg-white border border-slate-150 text-[10px] font-black text-slate-700 px-2 py-0.5 rounded-lg flex items-center space-x-1 shadow-sm">
                    <MapPin className="w-3 h-3 text-red-500" />
                    <span>{dst}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Swipe Indicator bottom footer */}
          <div className="text-center text-[9px] font-black text-emerald-800 uppercase tracking-wider mt-1 flex items-center justify-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span>{t.swipeTip}</span>
          </div>

          {/* Best Crop Recommendation Widget */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-[28px] p-4 space-y-3">
            <div>
              <p className="font-black text-slate-800 text-xs uppercase tracking-wider">{t.recTitle}</p>
              <p className="text-[9.5px] text-slate-500 font-semibold leading-none mt-0.5">{t.recSub}</p>
            </div>

            <div className="space-y-2">
              <div className="bg-white rounded-xl p-2.5 border border-emerald-50 flex items-center justify-between text-[11px] shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="p-1 bg-yellow-100 text-yellow-800 rounded-lg">🏆</span>
                  <div>
                    <span className="block font-black text-slate-800">{t.profCrops}</span>
                    <span className="text-[9px] text-slate-400 font-semibold">Top pricing yields</span>
                  </div>
                </div>
                <span className="font-bold text-slate-700">Paddy, Tomato</span>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-emerald-50 flex items-center justify-between text-[11px] shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="p-1 bg-emerald-100 text-emerald-800 rounded-lg">🛡️</span>
                  <div>
                    <span className="block font-black text-slate-800">{t.safeCrops}</span>
                    <span className="text-[9px] text-slate-400 font-semibold">Resists sudden droughts</span>
                  </div>
                </div>
                <span className="font-bold text-slate-700">Millet, Sugarcane</span>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-emerald-50 flex items-center justify-between text-[11px] shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="p-1 bg-blue-100 text-blue-800 rounded-lg">⚙️</span>
                  <div>
                    <span className="block font-black text-slate-800">{t.lowRiskCrops}</span>
                    <span className="text-[9px] text-slate-400 font-semibold">Minimum overhead costs</span>
                  </div>
                </div>
                <span className="font-bold text-slate-700">Onion, Millet</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
