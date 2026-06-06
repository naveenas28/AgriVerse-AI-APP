import { LanguageCode, TranslationSet, CropPrice, Post, ProductItem, GovernmentScheme, WeatherAlert } from './types';

export const LANGUAGES: { code: LanguageCode; name: string; localName: string }[] = [
  { code: 'en', name: 'English', localName: 'English' },
  { code: 'kn', name: 'Kannada', localName: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', localName: 'தமிழ்' },
  { code: 'hi', name: 'Hindi', localName: 'हिन्दी' },
  { code: 'te', name: 'Telugu', localName: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', localName: 'മലയാളം' },
  { code: 'bn', name: 'Bengali', localName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', localName: 'मराठी' },
  { code: 'pa', name: 'Punjabi', localName: 'ਪੰਜਾਬੀ' }
];

export const TRANSLATIONS: Record<LanguageCode, TranslationSet> = {
  en: {
    appName: 'AgriVerse AI',
    tabs: {
      home: 'Home',
      community: 'Community',
      marketplace: 'Marketplace',
      assistant: 'AI Assistant',
      profile: 'Profile'
    },
    home: {
      greeting: 'Welcome back, Farmer Partner!',
      offlineMode: 'Browsing offline (using saved info)',
      assistantShortcut: 'Talk to AgriVerse Assistant',
      voiceSearchPlaceholder: 'Press & say "How to grow tomato?"...',
      quickActions: 'Quick Tools',
      cropDoctor: 'Crop Doctor',
      irrigation: 'Water Tracker',
      schemes: 'Govt Schemes',
      rental: 'Equipment rental',
      weatherCard: 'Weather Advisory',
      currentWeather: 'Light rain expected today',
      humidity: 'Humidity',
      rainfallChance: 'Rainfall',
      alertTitle: 'Heavy rain predicted in next 48 hours. Protect harvested bags!',
      forecast: '5-Day Forecast',
      cropPrices: 'Market Price Alerts',
      currentMarketPrice: 'Current price',
      predictedPrice: 'Predicted next month',
      predictionTitle: 'Future Crop Predictions',
      demandLevel: 'Estimated demand',
      profitPotential: 'Profit margin',
      climateRisk: 'Weather risk',
      growReminders: 'Today\'s Farming Reminders',
      waterReminder: 'Water the tomato beds - Soil dryness is index 4',
      pestReminder: 'Check onion leaves for purple blotch dampness',
      fertilizerReminder: 'Apply bio-fertilizer to paddy blocks - 10 days since last dose',
      governmentSchemes: 'Recommended Schemes',
      applyNow: 'Check Scheme Eligibility'
    },
    community: {
      title: 'Farmer Community',
      createPost: 'Share with neighboring farmers',
      postPlaceholder: 'What is happening in your fields? Write in any local language...',
      postButton: 'Share Post',
      comments: 'Farmer Discussion',
      addCommentPlaceholder: 'Write an advisory comment...',
      voicePostBtn: 'Record Voice Note',
      shareImageBtn: 'Add Field Image',
      verifiedFarmer: 'Verified Farmer'
    },
    marketplace: {
      title: 'Krishi Marketplace',
      sellTitle: 'List Your Harvest',
      sellDescription: 'Fill simple details to get buyers immediately',
      cropName: 'Crop name',
      quantity: 'Quantity available (Quintal/Kg)',
      price: 'Expected Price per kg (₹)',
      imageUpload: 'Add harvest photo',
      submitOffer: 'List for Sale',
      buyNow: 'Call Buyer/Seller',
      negotiate: 'AI Price Advice',
      verifiedSeller: 'Verified Farm',
      searchPlaceholder: 'Search crops, seeds, or equipment...'
    },
    assistant: {
      title: 'AgriVerse AI Advisor',
      welcomeMessage: 'How can I assist you today? You can ask me in your native language by speaking or typing. I can solve plant diseases, suggest sowing times, or estimate profits.',
      voiceRecording: 'Listening... Speak in any language',
      speakInstruction: 'Tap to Ask by Voice',
      cropDoctorTitle: 'AI Crop Doctor',
      cropDoctorDesc: 'Upload a picture of a diseased leaf to get instant detection and solution',
      uploadLeaf: 'Take Photo / Upload Leaf',
      diagnoseBtn: 'Diagnose Disease',
      diagnosisResult: 'AI Doctor Report',
      suggestion: 'Suggested Chemical/Bio Treatment',
      backBtn: 'Back',
      askPlaceholder: 'Type a question (e.g., tomato leaf rust treatment)...',
      sendBtn: 'Ask'
    },
    profile: {
      title: 'My Krishi Farm Profile',
      farmerName: 'Naveen S',
      farmLocation: 'Anemadagu Village, Chikkaballapura, Karnataka',
      languageSettings: 'Application Language',
      notificationTitle: 'Farming Warning Alerts',
      notificationDesc: 'Receive severe storm warnings and local pest outbreaks',
      reportsTitle: 'Farm Report PDF',
      reportsDesc: 'Download soil nutrient logs, past yields, and pricing metrics',
      eligibilityTitle: 'Government Schemes Checker',
      eligibilityDesc: 'We match your land records to discover eligible subsidies',
      financeTitle: 'Farm Budget planner',
      financeDesc: 'Interactive list of expenses and profit logs',
      sustainabilityScore: 'My Sustainable Farming Score'
    },
    common: {
      loading: 'Updating systems...',
      success: 'Task completed successfully',
      error: 'Network slow. Tried alternate server.',
      retry: 'Retry',
      otpTitle: 'Krishi Verification',
      otpSubtitle: 'Enter phone number for instant login & verified farm badge',
      phonePlaceholder: '10-digit mobile number',
      sendOtp: 'Get Verification Code',
      verifyOtp: 'Verify & Continue',
      otpPlaceholder: 'Enter 6-digit OTP code',
      guestLogin: 'Continue as Guest Farmer'
    }
  },
  kn: {
    appName: 'ಅಗ್ರಿ ವರ್ಸ್ AI',
    tabs: {
      home: 'ಮುಖಪುಟ',
      community: 'ಕೂಟ',
      marketplace: 'ಮಾರುಕಟ್ಟೆ',
      assistant: 'ಸಹಾಯಕ',
      profile: 'ನನ್ನ ಖಾತೆ'
    },
    home: {
      greeting: 'ಶುಭೋದಯ, ರೈತ ಮಿತ್ರ!',
      offlineMode: 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಬ್ರೌಸ್ ಮಾಡಲಾಗುತ್ತಿದೆ (ಸೇವ್ ಮಾಡಿದ ಮಾಹಿತಿ)',
      assistantShortcut: 'ಅಗ್ರಿ ವರ್ಸ್ ಸಹಾಯಕರೊಂದಿಗೆ ಮಾತನಾಡಿ',
      voiceSearchPlaceholder: 'ಒತ್ತಿ ಹಿಡಿದು "ಟೊಮೆಟೊ ಬೆಳೆಯುವುದು ಹೇಗೆ?" ಎಂದು ಕೇಳಿ...',
      quickActions: 'ತ್ವರಿತ ಪರಿಕರ',
      cropDoctor: 'ಬೆಳೆ ವೈದ್ಯ',
      irrigation: 'ನೀರಿನ ಟ್ರ್ಯಾಕರ್',
      schemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆ',
      rental: 'ಉಪಕರಣ ಬಾಡಿಗೆ',
      weatherCard: 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
      currentWeather: 'ಇಂದು ಸಾಧಾರಣ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ',
      humidity: 'ಆರ್ದ್ರತೆ',
      rainfallChance: 'ಮಳೆಯ ಸಾಧ್ಯತೆ',
      alertTitle: 'ಮುಂದಿನ 48 ಗಂಟೆಗಳಲ್ಲಿ ಭಾರೀ ಮಳೆಯ ಮುನ್ಸೂಚನೆ. ಕೊಯ್ಲು ಮಾಡಿದ ಮೂಟೆಗಳನ್ನು ಜೋಪಾನ ಮಾಡಿ!',
      forecast: '5-ದಿನಗಳ ಹವಾಮಾನ',
      cropPrices: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಎಚ್ಚರಿಕೆ',
      currentMarketPrice: 'ಪ್ರಸ್ತುತ ಬೆಲೆ',
      predictedPrice: 'ಮುಂದಿನ ತಿಂಗಳ ಅಂದಾಜು',
      predictionTitle: 'ಭವಿಷ್ಯದ ಬೆಳೆ ಮುನ್ಸೂಚನೆ',
      demandLevel: 'ಅಂದಾಜು ಬೇಡಿಕೆ',
      profitPotential: 'ಲಾಭದ ಪ್ರಮಾಣ',
      climateRisk: 'ಹವಾಮಾನ ಮಾಹಿತಿ',
      growReminders: 'ಇಂದಿನ ಕೃಷಿ ಕೆಲಸಗಳು',
      waterReminder: 'ಟೊಮೆಟೊ ಪಾತಿಗಳಿಗೆ ನೀರು ಹಾಯಿಸಿ - ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಕಡಿಮೆ ಇದೆ',
      pestReminder: 'ಈರುಳ್ಳಿ ಎಲೆಗಳಲ್ಲಿ ನೇರಳೆ ರೋಗ ತಡೆಗಟ್ಟಿ',
      fertilizerReminder: 'ಭತ್ತಕ್ಕೆ ಸಾವಯವ ಗೊಬ್ಬರ ಹಾಕಿ - 10 ದಿನಗಳು ಕಳೆದಿವೆ',
      governmentSchemes: 'ನಿಮಗಾಗಿ ಯೋಜನೆಗಳು',
      applyNow: 'ಯೋಜನೆ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ'
    },
    community: {
      title: 'ರೈತರ ಸಂಘ',
      createPost: 'ನೆರೆಹೊರೆಯ ರೈತರೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ',
      postPlaceholder: 'ನಿಮ್ಮ ಜಮೀನಿನಲ್ಲಿ ಏನಾಗುತ್ತಿದೆ? ಕನ್ನಡದಲ್ಲಿ ಬರೆಯಿರಿ...',
      postButton: 'ಪೋಸ್ಟ್ ಮಾಡಿ',
      comments: 'ಚರ್ಚೆಗಳು',
      addCommentPlaceholder: 'ಸಲಹೆ ನೀಡಿ...',
      voicePostBtn: 'ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಮಾಡಿ',
      shareImageBtn: 'ಚಿತ್ರ ಸೇರಿಸಿ',
      verifiedFarmer: 'ಧೃಡೀಕೃತ ರೈತ'
    },
    marketplace: {
      title: 'ಕೃಷಿ ಮಾರುಕಟ್ಟೆ',
      sellTitle: 'ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಮಾರಾಟ ಮಾಡಿ',
      sellDescription: 'ಖರೀದಿದಾರರನ್ನು ತಕ್ಷಣ ಪಡೆಯಲು ಇಲ್ಲಿ ವಿವರಗಳನ್ನು ನೀಡಿ',
      cropName: 'ಬೆಳೆಯ ಹೆಸರು',
      quantity: 'ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣ (ಕ್ವಿಂಟಾಲ್/ಕೆಜಿ)',
      price: 'ಪ್ರತಿ ಕೆಜಿ ನಿರೀಕ್ಷಿತ ಬೆಲೆ (₹)',
      imageUpload: 'ಕೊಯ್ಲಿನ ಚಿತ್ರ ಸೇರಿಸಿ',
      submitOffer: 'ಮಾರಾಟಕ್ಕೆ ಇಡಿ',
      buyNow: 'ಖರೀದಿದಾರಿಗೆ ಕರೆ ಮಾಡಿ',
      negotiate: 'AI ಬೆಲೆ ಸಲಹೆ',
      verifiedSeller: 'ಸ್ವಚ್ಛ ಜಮೀನು',
      searchPlaceholder: 'ತರಕಾರಿಗಳು, ಬೀಜಗಳು ಅಥವಾ ಉಪಕರಣಗಳನ್ನು ಹುಡುಕಿ...'
    },
    assistant: {
      title: 'ಅಗ್ರಿ ವರ್ಸ್ ಕೃಷಿ ಸಲಹೆಗಾರ',
      welcomeMessage: 'ಇಂದು ನಿಮಗೆ ಏನು ಬೇಕು? ಮಣ್ಣು, ಬೆಳೆ ರೋಗ, ಮಾರುಕಟ್ಟೆ ಬೆಲೆ - ಯಾವುದನ್ನಾದರೂ ಧ್ವನಿಯ ಮೂಲಕ ಕೇಳಿ. ನಾನು ನಿಮಗೆ ಸರಳವಾಗಿ ಉತ್ತರಿಸುತ್ತೇನೆ.',
      voiceRecording: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ... ಮಾತನಾಡಿ',
      speakInstruction: 'ಧ್ವನಿ ಮೂಲಕ ಕೇಳಲು ಒತ್ತಿ',
      cropDoctorTitle: 'AI ಬೆಳೆ ವೈದ್ಯ',
      cropDoctorDesc: 'ರೋಗಗ್ರಸ್ತ ಎಲೆಯ ಫೋಟೋ ತೆಗೆದು ಅಪ್ಲೋಡ್ ಮಾಡಿ ತಕ್ಷಣ ಪರಿಹಾರ ಪಡೆಯಿರಿ',
      uploadLeaf: 'ಫೋಟೋ ತೆಗೆಯಿರಿ / ಎಲೆ ಅಪ್ಲೋಡ್ ಮಾಡಿ',
      diagnoseBtn: 'ರೋಗ ಪತ್ತೆ ಮಾಡಿ',
      diagnosisResult: 'AI ವೈದ್ಯರ ವರದಿ',
      suggestion: 'ಸೂಚಿಸಲಾದ ಔಷಧ/ಪರಿಹಾರ',
      backBtn: 'ಹಿಂದಕ್ಕೆ',
      askPlaceholder: 'ಪ್ರಶ್ನೆಯನ್ನು ಬರೆಯಿರಿ (ಉದಾ: ಟೊಮೆಟೊ ಕೊಳೆ ರೋಗ)...',
      sendBtn: 'ಕೇಳಿ'
    },
    profile: {
      title: 'ನನ್ನ ಜಮೀನಿನ ವಿವರ',
      farmerName: 'Naveen S',
      farmLocation: 'ಆನೆಮಡಗು ಗ್ರಾಮ, ಚಿಕ್ಕಬಳ್ಳಾಪುರ, ಕರ್ನಾಟಕ',
      languageSettings: 'ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ',
      notificationTitle: 'ಕೃಷಿ ಎಚ್ಚರಿಕೆಗಳು',
      notificationDesc: 'ತೀವ್ರ ಚಂಡಮಾರುತ ಮತ್ತು ಸಣ್ಣ ಕಿಟ ಕೀಟಗಳ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಸ್ವೀಕರಿಸಿ',
      reportsTitle: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ವರದಿ',
      reportsDesc: 'ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳು ಮತ್ತು ಇತಿಹಾಸದ ಇಳುವರಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
      eligibilityTitle: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಅರ್ಹತೆ',
      eligibilityDesc: 'ಸಹಾಯಧನ ಪಡೆಯಲು ನಿಮ್ಮ ಭೂದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
      financeTitle: 'ಬಜೆಟ್ ಸಹಾಯ',
      financeDesc: 'ಖರ್ಚು ಮತ್ತು ಆದಾಯದ ಲೆಕ್ಕಾಚಾರ',
      sustainabilityScore: 'ನನ್ನ ಸಾವಯವ ಕೃಷಿ ಅಂಕಗಳು'
    },
    common: {
      loading: 'ಅಪ್ಡೇಟ್ ಆಗುತ್ತಿದೆ...',
      success: 'ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ',
      error: 'ನೆಟ್‌ವರ್ಕ್ ನಿಧಾನವಾಗಿದೆ. ಪರ್ಯಾಯ ಸರ್ವರ್ ಮೂಲಕ ಸಂಪರ್ಕಿಸಲಾಗಿದೆ.',
      retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
      otpTitle: 'ಕೃಷಿ ದೃಡೀಕರಣ',
      otpSubtitle: 'ರೈತರ ಬ್ಯಾಡ್ಜ್ ಪಡೆಯಲು ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ',
      phonePlaceholder: '೧೦ ಅಂಕಿಯ ಫೋನ್ ನಂಬರ್',
      sendOtp: 'ಕೋಡ್ ಕಳುಹಿಸಿ',
      verifyOtp: 'ಖಚಿತಪಡಿಸಿ',
      otpPlaceholder: '೬ ಅಂಕಿಯ OTP ಕೋಡ್ ಹಾಕಿ',
      guestLogin: 'ಅತಿಥಿ ರೈತನಾಗಿ ಮುಂದುವರಿಯಿರಿ'
    }
  },
  // We'll map the remaining languages comprehensively using realistic equivalents
  ta: {
    appName: 'அக்ரிவெர்ஸ் AI',
    tabs: {
      home: 'முகப்பு',
      community: 'சமூகம்',
      marketplace: 'சந்தை',
      assistant: 'AI உதவியாளர்',
      profile: 'சுயவிவரம்'
    },
    home: {
      greeting: 'வணக்கம், விவசாய நண்பரே!',
      offlineMode: 'ஆஃப்லைனில் உலாவுதல் (சேமித்த தகவல்)',
      assistantShortcut: 'அக்ரிவெர்ஸ் உதவியாளரிடம் பேசவும்',
      voiceSearchPlaceholder: 'அழுத்தி "தக்காளி வளர்ப்பது எப்படி?" என்று கேளுங்கள்...',
      quickActions: 'விரைவான கருவிகள்',
      cropDoctor: 'பயிர் மருத்துவர்',
      irrigation: 'நீர் கண்காணிப்பு',
      schemes: 'அரசு திட்டங்கள்',
      rental: 'கருவி வாடகை',
      weatherCard: 'வானிலை தகவல்',
      currentWeather: 'இன்று லேசான மழை எதிர்பார்க்கப்படுகிறது',
      humidity: 'ஈரப்பதம்',
      rainfallChance: 'மழை வாய்ப்பு',
      alertTitle: 'மழை எச்சரிக்கை! அறுவடை மூட்டைகளை பத்திரப்படுத்துங்கள்!',
      forecast: '5-நாள் வானிலை',
      cropPrices: 'சந்தை விலை எச்சரிக்கை',
      currentMarketPrice: 'தற்போதைய விலை',
      predictedPrice: 'அடுத்த மாத கணிப்பு',
      predictionTitle: 'எதிர்கால பயிர் கணிப்பு',
      demandLevel: 'தேவை நிலவரம்',
      profitPotential: 'லாப வரம்பு',
      climateRisk: 'வானிலை ஆபத்து',
      growReminders: 'இன்றைய விவசாய நினைவூட்டல்',
      waterReminder: 'தக்காளிக்கு நீர் பாய்ச்சவும் - மண் வறட்சியாக உள்ளது',
      pestReminder: 'வெங்காயத்தில் இலை அழுகல் நோய் உள்ளதா என பார்க்கவும்',
      fertilizerReminder: 'நெற்பயிருக்கு இயற்கை உரம் இடுங்கள்',
      governmentSchemes: 'பரிந்துரைக்கப்பட்ட திட்டங்கள்',
      applyNow: 'தகுதியை பார்க்கவும்'
    },
    community: {
      title: 'விவசாயிகள் கூடம்',
      createPost: 'விவசாயிகளுடன் பகிர்ந்து கொள்ளுங்கள்',
      postPlaceholder: 'உங்கள் காடுகளில் என்ன நடக்கிறது? தமிழில் எழுதவும்...',
      postButton: 'பகிர்க',
      comments: 'கலந்துரையாடல்',
      addCommentPlaceholder: 'பதில் எழுதவும்...',
      voicePostBtn: 'குரல் பதிவு',
      shareImageBtn: 'படம் சேர்க்க',
      verifiedFarmer: 'சான்றளிக்கப்பட்ட விவசாயி'
    },
    marketplace: {
      title: 'உழவர் சந்தை',
      sellTitle: 'அறுவடை காய்கறிகளை விற்கவும்',
      sellDescription: 'வாடிக்கையாளர்களை உடனடியாக பெற விவரங்களை நிரப்புக',
      cropName: 'பயிரின் பெயர்',
      quantity: 'அளவு (விவரம்)',
      price: 'எதிர்பார்க்கும் விலை (₹/கிலோ)',
      imageUpload: 'புகைப்படம் சேர்க்க',
      submitOffer: 'விற்பனைக்கு இடுக',
      buyNow: 'வியாபாரியை அழைக்க',
      negotiate: 'AI விலை ஆலோசனை',
      verifiedSeller: 'உறுதிசெய்யப்பட்ட பண்ணை',
      searchPlaceholder: 'பயிர்கள், விதைகள் தேடுக...'
    },
    assistant: {
      title: 'அக்ரிவெர்ஸ் AI ஆலோசகர்',
      welcomeMessage: 'வணக்கம், உங்களுக்கு எப்படி உதவ முடியும்? குரல் அல்லது தட்டச்சு மூலம் தமிழில் கேளுங்கள். நோய்கள் தீர்வு, உற்பத்தி லாபம் குறித்து விளக்குகிறேன்.',
      voiceRecording: 'கேட்கிறது... தமிழில் பேசுங்கள்',
      speakInstruction: 'குரல் மூலம் கேட்க அழுத்தவும்',
      cropDoctorTitle: 'AI பயிர் மருத்துவர்',
      cropDoctorDesc: 'நோய் தாக்கிய இலையின் புகைப்படத்தை பதிவேற்றி உடனடி தீர்வு பெறுக',
      uploadLeaf: 'படம் எடுக்க / பதிவேற்றவும்',
      diagnoseBtn: 'நோய் கண்டறிக',
      diagnosisResult: 'AI பயிர் அறிக்கை',
      suggestion: 'பரிந்துரைக்கப்படும் மருந்து',
      backBtn: 'திரும்புக',
      askPlaceholder: 'கேள்வியை எழுதவும்...',
      sendBtn: 'கேள்'
    },
    profile: {
      title: 'எனது பண்ணை சுயவிவரம்',
      farmerName: 'Naveen S',
      farmLocation: 'ஆனேமடகு கிராமம், சிக்கபள்ளாப்பூர், கர்நாடகா',
      languageSettings: 'செயலி மொழி',
      notificationTitle: 'விவசாய எச்சரிக்கைகள்',
      notificationDesc: 'புயல் மற்றும் வறட்சி எச்சரிக்கைகளைப் பெறுங்கள்',
      reportsTitle: 'மண் பரிசோதனை',
      reportsDesc: 'பரிசோதனை முடிவுகளைப் பதிவிறக்கவும்',
      eligibilityTitle: 'அரசு மானியங்கள் தகுதி',
      eligibilityDesc: 'உங்கள் நிலத்திற்கு தகுதியான திட்டங்கள்',
      financeTitle: 'வரவு செலவு திட்டம்',
      financeDesc: 'விவசாய லாப நஷ்ட கணக்கு',
      sustainabilityScore: 'எனது நிலையான கிருஷி மதிப்பெண்'
    },
    common: {
      loading: 'மறுபதிவு செய்யப்படுகிறது...',
      success: 'வெற்றிகரமாக முடிந்தது',
      error: 'வலைப்பின்னல் மெதுவாக உள்ளது. மாற்று சேவையைப் பயன்படுத்துகிறது.',
      retry: 'மீண்டும் முயற்சி',
      otpTitle: 'உழவர் சரிபார்ப்பு',
      otpSubtitle: 'உறுதிப்படுத்தப்பட்ட பேட்ஜ் பெற மொபைல் எண்ணை உள்ளிடவும்',
      phonePlaceholder: '10-இலக்க மொபைல் எண்',
      sendOtp: 'சரிபார்ப்பு குறியீடு அனுப்புக',
      verifyOtp: 'சரிபார்',
      otpPlaceholder: 'OTP குறியீட்டை உள்ளிடவும்',
      guestLogin: 'விருந்தினராக தொடரவும்'
    }
  },
  hi: {
    appName: 'एग्रीवर्स AI',
    tabs: {
      home: 'होम',
      community: 'चौपाल',
      marketplace: 'मंडी',
      assistant: 'सहायक AI',
      profile: 'प्रोफाइल'
    },
    home: {
      greeting: 'स्वागत है, किसान भाइयों!',
      offlineMode: 'ऑफ़लाइन मोड (सुरक्षित डेटा)',
      assistantShortcut: 'एग्रीवर्स सहायक से बात करें',
      voiceSearchPlaceholder: 'दबाएं और कहें "टमाटर कैसे उगाएं?"...',
      quickActions: 'त्वरित उपकरण',
      cropDoctor: 'फसल चिकित्सक',
      irrigation: 'सिंचाई ट्रैकर',
      schemes: 'सरकारी योजनाएं',
      rental: 'ट्रैक्टर/मशीन किराया',
      weatherCard: 'मौसम और सलाह',
      currentWeather: 'आज हल्की बारिश की संभावना है',
      humidity: 'नमी',
      rainfallChance: 'बारिश',
      alertTitle: 'मौसम चेतावनी! अगले 48 घंटों में भारी बारिश की उम्मीद।',
      forecast: '5-दिन का पूर्वानुमान',
      cropPrices: 'मंडी भाव अलर्ट',
      currentMarketPrice: 'वर्तमान भाव',
      predictedPrice: 'अगले महीने की भविष्यवाणी',
      predictionTitle: 'भविष्य की फसल भविष्यवाणी',
      demandLevel: 'अनुमानित मांग',
      profitPotential: 'लाभ की संभावना',
      climateRisk: 'प्राकृतिक जोखिम',
      growReminders: 'आज के कृषि कार्य',
      waterReminder: 'टमाटर के क्यारियों में पानी दें - मिट्टी में नमी कम है',
      pestReminder: 'प्याज की पत्तियों के बैंगनी धब्बों की जाँच करें',
      fertilizerReminder: 'धान की फसल में जैविक खाद का प्रयोग करें',
      governmentSchemes: 'आपके लिए योजनाएं',
      applyNow: 'पात्रता की जाँच करें'
    },
    community: {
      title: 'किसान चौपाल',
      createPost: 'किसान भाइयों के साथ साझा करें',
      postPlaceholder: 'आपके खेतों में क्या हो रहा है? अपनी भाषा में साझा करें...',
      postButton: 'पोस्ट करें',
      comments: 'चर्चा और सलाह',
      addCommentPlaceholder: 'अपनी राय लिखें...',
      voicePostBtn: 'आवाज रिकॉर्ड करें',
      shareImageBtn: 'फोटो जोड़ें',
      verifiedFarmer: 'सत्यापित किसान'
    },
    marketplace: {
      title: 'कृषि मंडी',
      sellTitle: 'अपनी फसल बेचें',
      sellDescription: 'खरीदार सीधे आपसे संपर्क करेंगे, जानकारी भरें',
      cropName: 'फसल का नाम',
      quantity: 'उपलब्ध मात्रा (क्विंटल/किलो)',
      price: 'अपेक्षित मूल्य प्रति किलो (₹)',
      imageUpload: 'फसल की फोटो डालें',
      submitOffer: 'मंडी में सूचीबद्ध करें',
      buyNow: 'किसान/व्यापारी को कॉल करें',
      negotiate: 'AI भाव सलाह',
      verifiedSeller: 'सत्यापित खेत',
      searchPlaceholder: 'फसलों, बीजों या उपकरणों को खोजें...'
    },
    assistant: {
      title: 'एग्रीवर्स AI मित्र',
      welcomeMessage: 'नमस्ते, मैं आपकी कैसे मदद कर सकता हूँ? आप मुझसे अपनी भाषा में बोलकर या लिखकर प्रश्न पूछ सकते हैं। मैं फसल कीटों, खाद और मुनाफे के बारे में सलाह दे सकता हूँ।',
      voiceRecording: 'सुन रहा हूँ... अपनी भाषा में बोलें',
      speakInstruction: 'बोलकर पूछने के लिए दबाएं',
      cropDoctorTitle: 'AI फसल डॉक्टर',
      cropDoctorDesc: 'बीमार पत्ती की फोटो अपलोड करके तुरंत बीमारी और उसका इलाज जानें',
      uploadLeaf: 'फोटो लें / पत्ती अपलोड करें',
      diagnoseBtn: 'बीमारी का पता लगाएं',
      diagnosisResult: 'डॉक्टर रिपोर्ट',
      suggestion: 'अनुशंसित उपचार',
      backBtn: 'पीछे',
      askPlaceholder: 'अपना सवाल लिखें (जैसे: टमाटर पत्ती रोग उपचार)...',
      sendBtn: 'पूछें'
    },
    profile: {
      title: 'मेरी किसान प्रोफाइल',
      farmerName: 'Naveen S',
      farmLocation: 'आनेमडगु गांव, चिक्काबल्लापुरा, पानागढ़, कर्नाटक',
      languageSettings: 'ऐप की भाषा',
      notificationTitle: 'मौसम व संकट अलर्ट',
      notificationDesc: 'तूफान और स्थानीय कीट प्रकोप की तत्काल चेतावनियां प्राप्त करें',
      reportsTitle: 'मिट्टी परीक्षण लॉग',
      reportsDesc: 'मिट्टी के स्वास्थ्य की रिपोर्ट डाउनलोड करें',
      eligibilityTitle: 'सरकारी योजनाओं की पात्रता',
      eligibilityDesc: 'अपनी जमीन के अनुसार सब्सिडी खोजें',
      financeTitle: 'कृषि लेखा-जोखा',
      financeDesc: 'लागत और मुनाफे का आसान रिकॉर्ड रखें',
      sustainabilityScore: 'कृषि संधारणीयता स्कोर'
    },
    common: {
      loading: 'अपडेट हो रहा है...',
      success: 'सफलतापूर्वक पूर्ण',
      error: 'नेटवर्क धीमा है, वैकल्पिक सर्वर से जुड़े हैं।',
      retry: 'पुनः प्रयास',
      otpTitle: 'किसान सत्यापन',
      otpSubtitle: 'विशेष बैज प्राप्त करने के लिए मोबाइल नंबर दर्ज करें',
      phonePlaceholder: '10 अंकों का मोबाइल नंबर',
      sendOtp: 'सत्यापन कोड प्राप्त करें',
      verifyOtp: 'सत्यापित करें',
      otpPlaceholder: '6 अंकों का ओटीपी कोड डालें',
      guestLogin: 'अतिथि किसान के रूप में आगे बढ़ें'
    }
  },
  // We'll fallback beautifully for Telugu, Malayalam, Bengali, Marathi, Punjabi by cloning/adapting keys or serving them correctly.
  te: {
    appName: 'అగ్రివర్స్ AI',
    tabs: { home: 'హోమ్', community: 'సమూహం', marketplace: 'మార్కెట్', assistant: 'AI సహాయకుడు', profile: 'ప్రొఫైల్' },
    home: {
      greeting: 'స్వాగతం, రైతు మిత్రమా!', offlineMode: 'ఆఫ్‌లైన్ బ్రౌజింగ్ (సేవ్ చేసిన సమాచారం)', assistantShortcut: 'అగ్రివర్స్ అసిస్టెంట్‌తో మాట్లాడండి',
      voiceSearchPlaceholder: 'నొక్కి పట్టి "టమోటాలు ఎలా పండించాలి?" అని అడగండి...', quickActions: 'త్వరిత సాధనాలు', cropDoctor: 'పంట డాక్టర్',
      irrigation: 'నీటి ట్రాకర్', schemes: 'ప్రభుత్వ పథకాలు', rental: 'పరికరాల అద్దె', weatherCard: 'వాతావరణ సూచన',
      currentWeather: 'ఈ రోజు తెలికపాటి వర్షం కురిసే అవకాశం ఉంది', humidity: 'తేమ', rainfallChance: 'వర్షాపాతం', alertTitle: 'భారీ వర్షం హెచ్చరిక! కోసిన పంట సంచులను జాగ్రత్త చేసుకోండి!',
      forecast: '5 రోజుల సూచన', cropPrices: 'మార్కెట్ ధర హెచ్చరికలు', currentMarketPrice: 'ప్రస్తుత ధర', predictedPrice: 'వచ్చే నెల అంచనా',
      predictionTitle: 'భవిष्य పంట సూచన', demandLevel: 'అంచనా డిమాండ్', profitPotential: 'లాభాల మార్జిన్', climateRisk: 'వాతావరణ ప్రమాదం',
      growReminders: 'నేటి వ్యవసాయ పనులు', waterReminder: 'టమోటా మడులకు నీరు పెట్టండి', pestReminder: 'ఉల్లి ఆకులకు తెగుళ్ళను తనిఖీ చేయండి',
      fertilizerReminder: 'వరి పొలానికి సేంద్రీయ ఎరువులు వేయండి', governmentSchemes: 'సిఫార్సు చేసిన పథకాలు', applyNow: 'అర్హత చూడండి'
    },
    community: {
      title: 'రైతు సమూహం', createPost: 'పొరుగు రైతులతో పంచుకోండి', postPlaceholder: 'మీ పొలంలో ఏం జరుగుతోంది? తెలుగలో రాయండి...', postButton: 'పోస్ట్ చేయండి', comments: 'రైతుల చర్చ', addCommentPlaceholder: 'రాయండి...', voicePostBtn: 'వాయిస్ రికార్డ్', shareImageBtn: 'ఫోటో జోడించండి', verifiedFarmer: 'ధృవీకరించబడిన రైతు' },
    marketplace: {
      title: 'కృషి మార్కెట్', sellTitle: 'మీ పంటను అమ్మకానికి పెట్టండి', sellDescription: 'వివరాలు పూరిస్తే కొనుగోలుదారులు నేరుగా వస్తారు', cropName: 'పంట పేరు', quantity: 'పరిమాణం (క్వింటాల్/కేజీ)', price: 'ధర కేజీకి (₹)', imageUpload: 'పంట ఫోటో జోడించండి', submitOffer: 'అమ్మకానికి పెట్టండి', buyNow: 'కాల్ చేయండి', negotiate: 'AI ధర సలహా', verifiedSeller: 'ధృవీకృత ఫాం', searchPlaceholder: 'పంటలు, విత్తనాల కోసం వెతకండి...'
    },
    assistant: {
      title: 'అగ్రివర్స్ AI సలహాదారు', welcomeMessage: 'నమస్కారం! నేను మీకు ఎలా సహాయపడగలను? పంట తెగుళ్లు, మార్కెట్ ధరలపై తెలుగులో నాతో మాట్లాడండి.', voiceRecording: 'వింటున్నాను... మాట్లాడండి', speakInstruction: 'వాయిస్ ద్వారా అడగడానికి నొక్కండి', cropDoctorTitle: 'AI పంట డాక్టర్', cropDoctorDesc: 'యాప్ లో ఫోటో అప్‌లోడ్ చేసి క్షణాల్లో తెగుళ్ళ నివారణ కనుగొనండి', uploadLeaf: 'ఫోటో లేదా పత్రం అప్‌లోड్', diagnoseBtn: 'తెగులు గుర్తింపు', diagnosisResult: 'AI పంట రిపోర్టు', suggestion: 'సూచించిన మందులు', backBtn: 'వెనుకకు', askPlaceholder: 'ప్రశ్న రాయండి...', sendBtn: 'పంపించు'
    },
    profile: {
      title: 'నా వ్యవసాయ ప్రొఫైల్', farmerName: 'Naveen S', farmLocation: 'ఆనెమడగు గ్రామం, చిక్కబళ్లాపూర్, కర్ణాటక', languageSettings: 'యాప్ భాష', notificationTitle: 'హెచ్చరికలు', notificationDesc: 'తుఫాను మరియు పురుగుల దాడి హెచ్చరికలు', reportsTitle: 'నేల పరీక్ష', reportsDesc: 'నేల పరీక్ష రిపోర్టును డౌన్‌లోడ్ చేసుకోండి', eligibilityTitle: 'పథక అర్హత', eligibilityDesc: 'మీ భూమి సమాచారం సరిపోల్చండి', financeTitle: 'వ్యవసాయ అంచనాలు', financeDesc: 'లాభ నష్టాల స్కోరు', sustainabilityScore: 'నా సేంద్రీય వ్యవసాయ స్కోరు'
    },
    common: { loading: 'అప్‌డేట్ అవుతోంది...', success: 'విజయవంతంగా పూర్తయింది', error: 'నెట్‌వర్క్ నెమ్మదిగా ఉంది.', retry: 'మళ్లీ ప్రయత్నించండి', otpTitle: 'వ్యవసాయ ధృవీకరణ', otpSubtitle: 'కృషి బ్యాడ్జ్ పొందడానికి మొబైల్ నంబర్ వేయండి', phonePlaceholder: '10 అంకెల ఫోన్ నంబరు', sendOtp: 'OTP పంపించండి', verifyOtp: 'ధృవీకరించండి', otpPlaceholder: '6 అంకెల OTP నమోదు చేయండి', guestLogin: 'గెస్ట్ రైతుగా కొనసాగండి' }
  },
  ml: {
    appName: 'അഗ്രിവേഴ്സ് AI',
    tabs: { home: 'ഹോം', community: 'കൂട്ടായ്മ', marketplace: 'ചന്ത', assistant: 'AI സഹായി', profile: 'പ്രൊഫൈൽ' },
    home: {
      greeting: 'സ്വാഗതം, കൃഷി പങ്കാളി!', offlineMode: 'ഓഫ്‌ലൈൻ ബ്രൗസിംഗ് (സേവ് ചെയ്ത വിവരങ്ങൾ)', assistantShortcut: 'അഗ്രിവേഴ്സ് സഹായിയുമായി സംസാരിക്കുക',
      voiceSearchPlaceholder: 'അമർത്തിപ്പിടിച്ച് സംസാരിക്കുക "തക്കാളി എങ്ങനെ കൃഷി ചെയ്യാം?"...', quickActions: 'ദ്രുത ഉപകരണങ്ങൾ', cropDoctor: 'വിള ഡോക്ടർ',
      irrigation: 'ജല ട്രാക്കർ', schemes: 'സർക്കാർ പദ്ധതികൾ', rental: 'യന്ത്രങ്ങൾ വാടകയ്ക്ക്', weatherCard: 'കാലാവസ്ഥാ മുന്നറിയിപ്പ്',
      currentWeather: 'ഇന്ന് നേരിയ മഴയ്ക്ക് സാധ്യത', humidity: 'ആർദ്രത', rainfallChance: 'മഴയുടെ അളവ്', alertTitle: 'ശക്തമായ മഴ മുന്നറിയിപ്പ്! വിളവെടുത്ത നെല്ല് ചാക്കുകൾ സുരക്ഷിതമാക്കുക!',
      forecast: '5-ദിവസത്തെ പ്രവചനം', cropPrices: 'വിപണി വിലകൾ', currentMarketPrice: 'ഇന്നത്തെ വില', predictedPrice: 'അടുത്ത മാസത്തെ പ്രവചനം',
      predictionTitle: 'ഭാവി വിള പ്രവചനം', demandLevel: 'ആവശ്യകത', profitPotential: 'ലാഭസാധ്യത', climateRisk: 'കാലാവസ്ഥാ അപായം',
      growReminders: 'ഇന്നത്തെ കൃഷി ജോലികൾ', waterReminder: 'തക്കാളി പത്തികൾക്ക് നനയ്ക്കുക - ഈർപ്പം കുറവാണ്', pestReminder: 'സവാള ഇലകളിൽ കീടബാധയുണ്ടോ എന്ന് നോക്കുക',
      fertilizerReminder: 'നെല്ലിന് ജൈവവളം ചേർക്കുക', governmentSchemes: 'ശുപാർശ ചെയ്യുന്ന പദ്ധതികൾ', applyNow: 'യോഗ്യത പരിശോധിക്കുക'
    },
    community: {
      title: 'കർഷക കൂട്ടായ്മ', createPost: 'മറ്റ് കർഷകരുമായി പങ്കിടുക', postPlaceholder: 'നിങ്ങളുടെ കൃഷിയിടത്തിൽ എന്ത് നടക്കുന്നു? മലയാളത്തിൽ എഴുതുക...', postButton: 'പങ്കിടുക', comments: 'കർഷക ചർച്ച', addCommentPlaceholder: 'അഭിപ്രായം എഴുതുക...', voicePostBtn: 'ശബ്ദം റെക്കോർഡ് ചെയ്യുക', shareImageBtn: 'ഫോട്ടോ ചേർക്കുക', verifiedFarmer: 'അംഗീകൃത കർഷകൻ'
    },
    marketplace: {
      title: 'കൃഷി ചന്ത', sellTitle: 'വിളവുകൾ വിൽക്കാൻ വെയ്ക്കുക', sellDescription: 'വിവരങ്ങൾ നൽകിയാൽ ആവശ്യക്കാർ നേരിട്ട് വിളിക്കും', cropName: 'വിളയുടെ പേര്', quantity: 'ലഭ്യമായ അളവ്', price: 'പ്രതീക്ഷിക്കുന്ന വില (₹/കിലോ)', imageUpload: 'ചിത്രം ചേർക്കുക', submitOffer: 'വിൽക്കാൻ വെയ്ക്കുക', buyNow: 'ബന്ധപ്പെടുക', negotiate: 'AI വില നിർദ്ദേശം', verifiedSeller: 'അംഗീകൃത കൃഷിയിടം', searchPlaceholder: 'വിളകൾ, വിത്തുകൾ തിരയുക...'
    },
    assistant: {
      title: 'അഗ്രിവേഴ്സ് AI ഉപദേശകൻ', welcomeMessage: 'ഹലോ, എനിക്ക് എങ്ങനെ സഹായിക്കാനാകും? മലയാളത്തിൽ സംസാരിക്കുകയോ എഴുതുകയോ ചെയ്യാം. വിള രോഗങ്ങൾക്കും വിലവിവരങ്ങൾക്കും ഉത്തരം നൽകാം.', voiceRecording: 'കേൾക്കുന്നു... സംസാരിക്കുക', speakInstruction: 'ശബ്ദത്തിലൂടെ ചോദിക്കാൻ അമർത്തുക', cropDoctorTitle: 'AI വിള ഡോക്ടർ', cropDoctorDesc: 'രോഗം ബാധിച്ച ഇലയുടെ ചിത്രം അപ്‌ലോഡ് ചെയ്ത് ഉടൻ പരിഹാരം കണ്ടെത്തുക', uploadLeaf: 'ഫോട്ടോ എടുക്കുക / അപ്‌ലോഡ് ചെയ്യുക', diagnoseBtn: 'രോഗം കണ്ടെത്തുക', diagnosisResult: 'AI പരിശോധനാ റിപ്പോർട്ട്', suggestion: 'നിർദ്ദേശിച്ച മരുന്ന്', backBtn: 'പിന്നോട്ട്', askPlaceholder: 'ചോദ്യം ടൈപ്പ് ചെയ്യുക...', sendBtn: 'ചോദിക്കുക'
    },
    profile: {
      title: 'എന്റെ കൃഷി പ്രൊഫൈൽ', farmerName: 'Naveen S', farmLocation: 'ആനെമഡഗു ഗ്രാമം, ചിക്കബല്ലാപ്പൂർ, കർണാടക', languageSettings: 'ആപ്പ് ഭാഷ', notificationTitle: 'കൃഷി മുന്നറിയിപ്പുകൾ', notificationDesc: 'കാലാവസ്ഥാ വ്യതിയാനങ്ങളും കീടബാധ മുന്നറിയിപ്പുകളും', reportsTitle: 'മണ്ണ് പരിശോധന', reportsDesc: 'മണ്ണ് പരിശോധനാ റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക', eligibilityTitle: 'പദ്ധതി യോഗ്യത', eligibilityDesc: 'സബ്‌സിഡി യോഗ്യതയുള്ള പദ്ധതികൾ', financeTitle: 'കൃഷി ബജറ്റ്', financeDesc: 'ആദായവും ചെലവുകളും', sustainabilityScore: 'എന്റെ ജൈവകൃഷി സ്കോർ'
    },
    common: { loading: 'അപ്‌ഡേറ്റ് ചെയ്യുന്നു...', success: 'വിജയകരമായി പൂർത്തിയായി', error: 'നെറ്റ്‌വർക്ക് വേഗത കുറവാണ്.', retry: 'വീണ്ടും ശ്രമിക്കുക', otpTitle: 'കർഷക പരിശോധന', otpSubtitle: 'വരിഫൈഡ് ബാഡ്ജ് ലഭിക്കുന്നതിന് മൊബൈൽ നമ്പർ നൽകുക', phonePlaceholder: '10 അക്ക മൊബൈൽ നമ്പർ', sendOtp: 'കൂപ്പൺ അയയ്ക്കുക', verifyOtp: 'പരിശോധിക്കുക', otpPlaceholder: '6 അക്ക ഒ.ടി.പി നൽകുക', guestLogin: 'അഥിതി കർഷകനായി തുടരുക' }
  },
  bn: {
    appName: 'এগ্রিভার্স AI',
    tabs: { home: 'হোম', community: 'কৃষক সভা', marketplace: 'কৃষি বাজার', assistant: 'AI সহকারী', profile: 'প্রোফাইল' },
    home: {
      greeting: 'স্বাগতম, কৃষক ভাই!', offlineMode: 'অফলাইন মোড (সংরক্ষিত ডেটা)', assistantShortcut: 'এগ্রিভার্স সহকারীর সাথে কথা বলুন',
      voiceSearchPlaceholder: 'টিপে বলুন "টমেটো কিভাবে চাষ করব?"...', quickActions: 'দ্রুত সরঞ্জাম', cropDoctor: 'ফসল ডাক্তার',
      irrigation: 'সেচ ট্র্যাকার', schemes: 'সরকারি প্রকল্প', rental: 'যন্ত্রপাতি ভাড়া', weatherCard: 'আবহাওয়া পূর্বাভাস',
      currentWeather: 'আজ হালকা বৃষ্টির সম্ভাবনা আছে', humidity: 'আর্দ্রতা', rainfallChance: 'বৃষ্টির সম্ভাবনা', alertTitle: 'আবহাওয়া সতর্কবার্তা! ফসল কেটে রাখা বস্তা সুরক্ষিত করুন।',
      forecast: '৫ দিনের পূর্বাভাস', cropPrices: 'বাজার দর এলার্ট', currentMarketPrice: 'বর্তমান বাজার দর', predictedPrice: 'আগামী মাসের পূর্বাভাস',
      predictionTitle: 'ভবিষ্যত ফসল পূর্বাভাস', demandLevel: 'আনুমানিক চাহিদা', profitPotential: 'মুনাফার সম্ভাবনা', climateRisk: 'জলবায়ু ঝুঁকি',
      growReminders: 'আজকের কৃষি কাজ', waterReminder: 'টমেটো ক্ষেতে জল দিন - মাটিতে আর্দ্রতা কম', pestReminder: 'পেঁয়াজের পাতায় বেগুনি দাগের পরীক্ষা করুন',
      fertilizerReminder: 'ধানে জৈব সার ব্যবহার করুন - ১০ দিন অতিক্রম হয়েছে', governmentSchemes: 'প্রস্তাবিত প্রকল্পসমূহ', applyNow: 'যোগ্যতা পরীক্ষা করুন'
    },
    community: {
      title: 'কৃষক নেটওয়ার্ক', createPost: 'অন্যান্য কৃষকদের সাথে তথ্য ভাগ করুন', postPlaceholder: 'আপনার ক্ষেতে আজ কি ঘটছে? বাংলায় লিখুন...', postButton: 'পোস্ট করুন', comments: 'কৃষক আলোচনা', addCommentPlaceholder: 'আপনার মতামত লিখুন...', voicePostBtn: 'ভয়েস রেকর্ড করুন', shareImageBtn: 'ছবি যুক্ত করুন', verifiedFarmer: 'যাচাইকৃত কৃষক'
    },
    marketplace: {
      title: 'কৃষ্টি বাজার', sellTitle: 'আপনার ফসল বিক্রি করুন', sellDescription: 'ক্রেতারা যাতে যোগাযোগ করতে পারে সেই তথ্য দিন', cropName: 'ফসলের নাম', quantity: 'পরিমাণ (কুইন্টাল/কেজি)', price: 'প্রত্যাশিত দাম (₹/কেজি)', imageUpload: 'ফসলের ছবি দিন', submitOffer: 'বাজারে তুলুন', buyNow: 'কল করুন', negotiate: 'AI দাম পরামর্শ', verifiedSeller: 'যাচাইকৃত খামার', searchPlaceholder: 'ফসল, বীজ বা যন্ত্রপাতি খুঁজুন...'
    },
    assistant: {
      title: 'এগ্রিভার্স AI উপদেষ্টা', welcomeMessage: 'নমস্কার! আমি আপনাকে কীভাবে সাহায্য করতে পারি? আপনার নিজের ভাষায় বলুন বা লিখুন। ফসলের রোগ বা বাজার দর জানতে চান?', voiceRecording: 'শুনছি... আপনার ভাষায় বলুন', speakInstruction: 'ভয়েসের মাধ্যমে জিজ্ঞাসা করতে টিপুন', cropDoctorTitle: 'AI ফসল ডাক্তার', cropDoctorDesc: 'রোগাক্রান্ত পাতার ছবি পোস্ট করে সাথে সাথে সমাধান পান', uploadLeaf: 'ছবি তুলুন / পাতা আপলোড করুন', diagnoseBtn: 'রোগ নির্ণয় করুন', diagnosisResult: 'AI ডাক্তার রিপোর্ট', suggestion: 'প্রস্তাবিত চিকিৎসা', backBtn: 'ফিরে যান', askPlaceholder: 'প্রশ্ন লিখুন...', sendBtn: 'জিজ্ঞাসা'
    },
    profile: {
      title: 'আমার কৃষি প্রোফাইল', farmerName: 'Naveen S', farmLocation: 'আনেমাদাগু গ্রাম, চিকবল্লাপুরা, কর্ণাটক', languageSettings: 'অ্যাপের ভাষা', notificationTitle: 'কৃষি সতর্কবার্তা', notificationDesc: 'বন্যা এবং পোকার আক্রমণ সম্পর্কে সরাসরি আপডেট পান', reportsTitle: 'মাটি পরীক্ষার রিপোর্ট', reportsDesc: 'মাটির পুষ্টির রিপোর্ট ডাউনলোড করুন', eligibilityTitle: 'সরকারি প্রকল্পের যোগ্যতা', eligibilityDesc: 'আপনার জমির খতিয়ান যাচাই করুন', financeTitle: 'কৃষি হিসাব-নিকাশ', financeDesc: 'খরচ এবং আয়ের বিবরণী', sustainabilityScore: 'আমার টেকসই চাষের স্কোর'
    },
    common: { loading: 'আপডেট হচ্ছে...', success: 'সফলভাবে সম্পন্ন হয়েছে', error: 'নেটওয়ার্ক ধীরগতির। বিকল্প সার্ভার ব্যবহার হচ্ছে।', retry: 'আবার চেষ্টা করুন', otpTitle: 'কৃষক যাচাইকরণ', otpSubtitle: 'ভেরিফায়েড ব্যাজ পেতে আপনার ফোন নম্বর লিখুন', phonePlaceholder: '১০ সংখ্যার মোবাইল নম্বর', sendOtp: 'যাচাইকরণ কোড পাঠান', verifyOtp: 'যাচাই করুন', otpPlaceholder: '৬ সংখ্যার ওটিপি কোড দিন', guestLogin: 'অতিথি কৃষক হিসেবে এগিয়ে যান' }
  },
  mr: {
    appName: 'एग्रीव्हर्स AI',
    tabs: { home: 'होम', community: 'शेतकरी मंच', marketplace: 'बाजारपेठ', assistant: 'AI सल्लागार', profile: 'माझी प्रोफाइल' },
    home: {
      greeting: 'स्वागत आहे, शेतकरी मित्रा!', offlineMode: 'ऑफलाईन मोड (साठवलेली माहिती)', assistantShortcut: 'एग्रीव्हर्स सहाय्यकाशी बोला',
      voiceSearchPlaceholder: 'दाबा आणि विचारा "टोमॅटो कसा उगवायचा?"...', quickActions: 'त्वरित साधने', cropDoctor: 'पीक डॉक्टर',
      irrigation: 'पाणी ट्रॅकर', schemes: 'सरकारी योजना', rental: 'कृषी यंत्रे भाड्याने', weatherCard: 'हवामान अंदाज',
      currentWeather: 'आज हलक्या पावसाची शक्यता आहे', humidity: 'हवेतील दमटपणा', rainfallChance: 'पावसाची शक्यता', alertTitle: 'हवामान सतर्कता! पुढील ४८ तासांत मुसळधार पाऊस. काढणी केलेले पोते झाकून ठेवा!',
      forecast: '५-दिवसांचा अंदाज', cropPrices: 'बाजार भाव थेट अपडेट', currentMarketPrice: 'सध्याचा भाव', predictedPrice: 'पुढील महिन्याचा अंदाज',
      predictionTitle: 'भविष्यातील पीक अंदाज', demandLevel: 'अंदाजित मागणी', profitPotential: 'नफ्याची शक्यता', climateRisk: 'हवामान जोखीम',
      growReminders: 'आजची शेती कामे', waterReminder: 'टोमॅटो पिकाला पाणी द्या - माती कोरडी झाली आहे', pestReminder: 'कांद्याच्या पानावर करपा रोगाची तपासणी करा',
      fertilizerReminder: 'भाताच्या पिकाला सेंद्रिय खत घाला', governmentSchemes: 'शिफारस केलेल्या योजना', applyNow: 'पात्रता तपासा'
    },
    community: {
      title: 'शेतकरी मंच', createPost: 'इतर शेतकरी मित्रांसोबत शेअर करा', postPlaceholder: 'तुमच्या शेतात काय घडते आहे? मराठीत लिहा...', postButton: 'पोस्ट करा', comments: 'शेतकरी चर्चा', addCommentPlaceholder: 'तुमचे मत लिहा...', voicePostBtn: 'आवाज रेकॉर्ड करा', shareImageBtn: 'शेताचा फोटो जोडा', verifiedFarmer: 'सत्यापित शेतकरी'
    },
    marketplace: {
      title: 'कृषी बाजार', sellTitle: 'तुमचे पीक थेट विक्रीला काढा', sellDescription: 'माहिती भरा जेणेकरून खरेदीदार थेट तुमच्याशी संपर्क करतील', cropName: 'पिकाचे नाव', quantity: 'उपलब्ध प्रमाण (क्विंटल/किलो)', price: 'अपेक्षित दर प्रति किलो (₹)', imageUpload: 'पिकाचा फोटो जोडा', submitOffer: 'विक्रीसाठी नोंदवा', buyNow: 'कॉल करा', negotiate: 'AI दर सल्ला', verifiedSeller: 'सत्यापित शेती', searchPlaceholder: 'पिके, बियाणे शोधा...'
    },
    assistant: {
      title: 'एग्रीव्हर्स AI सल्लागार', welcomeMessage: 'नमस्कार! मी आपली काय मदत करू शकतो? मराठीत बोलून किंवा लिहून प्रश्न विचारा. पीक रोग किंवा नफ्याविषयी सविस्तर सल्ला देईन.', voiceRecording: 'ऐकत आहे... बोला', speakInstruction: 'बोलून प्रश्न विचारण्यासाठी दाबा', cropDoctorTitle: 'AI पीक डॉक्टर', cropDoctorDesc: 'किडलेल्या पानाचा फोटो अपलोड करा आणि थेट रोग आणि उपाय जाणून घ्या', uploadLeaf: 'फोटो घ्या / पान अपलोड करा', diagnoseBtn: 'रोग निदान करा', diagnosisResult: 'AI डॉक्टर अहवाल', suggestion: 'सुचवलेले औषध आणि उपाय', backBtn: 'मागे', askPlaceholder: 'तुमचा प्रश्न लिहा...', sendBtn: 'विचारा'
    },
    profile: {
      title: 'माझी शेती प्रोफाइल', farmerName: 'Naveen S', farmLocation: 'आनेमडगु गाव, चिक्काबल्लापूर, कर्नाटक', languageSettings: 'अॅपची भाषा', notificationTitle: 'कृषी सतर्कता', notificationDesc: 'वादळ किंवा कीड हल्ल्याची वेळेवर माहिती मिळवा', reportsTitle: 'माती परीक्षण अहवाल', reportsDesc: 'मातीच्या आरोग्याचा अहवाल डाऊनलोड करा', eligibilityTitle: 'सरकारी अनुदान पात्रता', eligibilityDesc: 'तुमच्या सातबारा नुसार सवलती शोधा', financeTitle: 'कृषी बजेट', financeDesc: 'शेतीचा जमा खर्च ठेवा सहज', sustainabilityScore: 'माझा सेंद्रिय शेती स्कोअर'
    },
    common: { loading: 'अपडेट होत आहे...', success: 'यशस्वीरित्या पूर्ण', error: 'नेटवर्क मंद आहे. पर्यायी सर्व्हरशी जोडले गेले आहे.', retry: 'पुन्हा प्रयत्न करा', otpTitle: 'शेतकरी पडताळणी', otpSubtitle: 'सत्यापित शेतकरी बॅज मिळवण्यासाठी मोबाईल नंबर टाका', phonePlaceholder: '१० अंकी मोबाईल नंबर', sendOtp: 'ओटीपी मिळवा', verifyOtp: 'पडताळणी करा', otpPlaceholder: '६ अंकी ओटीपी टाका', guestLogin: 'अतिथी शेतकरी म्हणून पुढे जा' }
  },
  pa: {
    appName: 'ਐਗਰੀਵਰਸ AI',
    tabs: { home: 'ਮੁੱਖ ਪੰਨਾ', community: 'ਕਿਸਾਨ ਚੌਪਾਲ', marketplace: 'ਮੰਡੀ', assistant: 'AI ਸਹਾਇਕ', profile: 'ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ' },
    home: {
      greeting: 'ਜੀ ਆਇਆਂ ਨੂੰ, ਕਿਸਾਨ ਭਰਾਵੋ!', offlineMode: 'ਆਫਲਾਈਨ ਮੋਡ (ਸੁਰੱਖਿਅਤ ਡੇਟਾ)', assistantShortcut: 'ਐਗਰੀਵਰਸ ਸਹਾਇਕ ਨਾਲ ਗੱਲ ਕਰੋ',
      voiceSearchPlaceholder: 'ਦਬਾਓ ਅਤੇ ਆਖੋ "ਟਮਾਟਰ ਕਿਵੇਂ ਉਗਾਈਏ?"...', quickActions: 'ਤੁਰੰਤ ਟੂਲਸ', cropDoctor: 'ਫ਼ਸਲ ਡਾਕਟਰ',
      irrigation: 'ਸਿੰਚਾਈ ਟ੍ਰੈਕਰ', schemes: 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ', rental: 'ਮਸ਼ੀਨਰੀ ਕਿਰਾਇਆ', weatherCard: 'ਮੌਸਮ ਅਤੇ ਸਲਾਹ',
      currentWeather: 'ਅੱਜ ਹਲਕੀ ਬਾਰਿਸ਼ ਦੀ ਸੰਭਾਵਨਾ ਹੈ', humidity: 'ਨਮੀ', rainfallChance: 'ਬਾਰਿਸ਼', alertTitle: 'ਮੌਸਮ ਚੇਤਾਵਨੀ! ਅਗਲੇ 48 ਘੰਟਿਆਂ ਵਿੱਚ ਭਾਰੀ ਮੀਂਹ ਦੀ ਉਮੀਦ ਹੈ।',
      forecast: '੫ ਦਿਨਾਂ ਦਾ ਅਨੁਮਾਨ', cropPrices: 'ਮੰਡੀ ਅਲਰਟ', currentMarketPrice: 'ਮੌਜੂਦਾ ਭਾਅ', predictedPrice: 'ਅਗਲੇ ਮਹੀਨੇ ਦਾ ਅਨੁਮਾਨ',
      predictionTitle: 'ਭਵਿੱਖ ਦੀ ਫ਼ਸਲ ਭਵਿੱਖਬਾਣੀ', demandLevel: 'ਅਨੁਮਾਨਿਤ ਮੰਗ', profitPotential: 'ਮੁਨਾਫ਼ੇ ਦੀ ਸੰਭਾਵਨਾ', climateRisk: 'ਕੁਦਰਤੀ ਜੋਖਮ',
      growReminders: 'ਅੱਜ ਦੇ ਖੇਤੀ ਕਾਰਜ', waterReminder: 'ਟਮਾਟਰ ਦੇ ਕਿਆਰਿਆਂ ਵਿੱਚ ਪਾਣੀ ਦਿਓ', pestReminder: 'ਪਿਆਜ਼ ਦੇ ਪੱਤਿਆਂ ਦੀ ਜਾਂਚ ਕਰੋ',
      fertilizerReminder: 'ਝੋਨੇ ਵਿੱਚ ਜੈਵਿਕ ਖਾਦ ਦੀ ਵਰਤੋਂ ਕਰੋ', governmentSchemes: 'ਤੁਹਾਡੇ ਲਈ ਸਕੀਮਾਂ', applyNow: 'ਪਾਤਰਤਾ ਦੀ ਜਾਂਚ ਕਰੋ'
    },
    community: {
      title: 'ਕਿਸਾਨ ਚੌਪਾਲ', createPost: 'ਦੂਜੇ ਕਿਸਾਨ ਵੀਰਾਂ ਨਾਲ ਸਾਂਝਾ ਕਰੋ', postPlaceholder: 'ਤੁਹਾਡੇ ਖੇਤਾਂ ਵਿੱਚ ਕੀ ਹੋ ਰਿਹਾ ਹੈ? ਪੰਜਾਬੀ ਵਿੱਚ ਸਾਂਝਾ ਕਰੋ...', postButton: 'ਪੋਸਟ ਕਰੋ', comments: 'ਕਿਸਾਨ ਚਰਚਾ', addCommentPlaceholder: 'ਆਪਣੀ ਰਾਏ ਲਿਖੋ...', voicePostBtn: 'ਆਵਾਜ਼ ਰਿਕਾਰਡ ਕਰੋ', shareImageBtn: 'ਫ਼ੋਟੋ ਜੋੜੋ', verifiedFarmer: 'ਸਤਿਆਪਿਤ ਕਿਸਾਨ'
    },
    marketplace: {
      title: 'ਕ੍ਰਿਸ਼ੀ ਮੰਡੀ', sellTitle: 'ਆਪਣੀ ਫ਼ਸਲ ਵੇਚੋ', sellDescription: 'ਖਰੀਦਦਾਰ ਸਿੱਧਾ ਤੁਹਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰਨਗੇ, ਜਾਣਕਾਰੀ ਭਰੋ', cropName: 'ਫ਼ਸਲ ਦਾ ਨਾਮ', quantity: 'ਉਪਲਬਧ ਮਾਤਰਾ (ਕੁਇੰਟਲ/ਕਿੱਲੋ)', price: 'ਅਪੇਖਿਅਤ ਮੁੱਲ ਪ੍ਰਤੀ ਕਿੱਲो (₹)', imageUpload: 'ਫ਼ਸਲ ਦੀ ਫ਼ੋਟੋ ਪਾਓ', submitOffer: 'ਮੰਡੀ ਵਿੱਚ ਸੂਚੀਬੱਧ ਕਰੋ', buyNow: 'ਕਾਲ ਕਰੋ', negotiate: 'AI ਭਾਅ ਸਲਾਹ', verifiedSeller: 'ਸਤਿਆਪਿਤ ਖੇਤ', searchPlaceholder: 'ਫ਼ਸਲਾਂ, ਬੀਜਾਂ ਜਾਂ ਸੰਦਾਂ ਦੀ ਖੋਜ ਕਰੋ...'
    },
    assistant: {
      title: 'ਐਗਰੀਵਰਸ AI ਮਿੱਤਰ', welcomeMessage: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਸਹਾਇਕਤਾ ਕਰ ਸਕਦਾ ਹਾਂ? ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਬੋਲ ਕੇ ਜਾਂ ਲਿਖ ਕੇ ਪੁੱਛੋ। ਮੈਂ ਫ਼ਸਲ ਕੀੜਿਆਂ ਅਤੇ ਰੇਹ-ਸਪ੍ਰੇ ਬਾਰੇ ਸਲਾਹ ਦੇਵਾਂਗਾ।', voiceRecording: 'ਸੁਣ ਰਿਹਾ ਹਾਂ... ਬੋਲੋ', speakInstruction: 'ਬੋਲ ਕੇ ਪੁੱਛਣ ਲਈ ਦਬਾਓ', cropDoctorTitle: 'AI ਫ਼ਸਲ ਡਾਕਟਰ', cropDoctorDesc: 'ਬੀਮਾਰ ਪੱਤੇ ਦੀ ਫ਼ੋਟੋ ਅਪਲੋਡ ਕਰਕੇ ਤੁਰੰਤ ਬੀਮਾਰੀ ਤੇ ਇਲਾਜ ਜਾਣੋ', uploadLeaf: 'ਫ਼ੋਟੋ ਲਓ / ਪੱਤਾ ਅਪਲੋਡ ਕਰੋ', diagnoseBtn: 'ਬੀਮਾਰੀ ਦਾ ਪਤਾ ਲਗਾਓ', diagnosisResult: 'ਡਾਕਟਰ ਰਿਪੋਰਟ', suggestion: 'ਸੁਝਾਇਆ ਗਿਆ ਇਲਾਜ', backBtn: 'ਪਿੱਛੇ', askPlaceholder: 'ਆਪਣਾ ਸਵਾਲ ਲਿਖੋ...', sendBtn: 'ਪੁੱਛੋ'
    },
    profile: {
      title: 'ਮੇਰੀ ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ', farmerName: 'Naveen S', farmLocation: 'ਆਨੇਮਡਗੂ ਪਿੰਡ, ਚਿੱਕਬੱਲਾਪੁਰਾ, ਕਰਨਾਟਕ', languageSettings: 'ਐਪ ਦੀ ਭਾਸ਼ਾ', notificationTitle: 'ਮੌਸਮ ਤੇ ਕੀਟ ਅਲਰਟ', notificationDesc: 'ਤੂਫਾਨ ਅਤੇ ਕੀਟ ਹਮਲੇ ਦੀਆਂ ਤੁਰੰत ਚੇਤਾਵਨੀਆਂ ਪ੍ਰਾਪਤ ਕਰੋ', reportsTitle: 'ਮਿੱਟੀ ਪਰਖ ਰਿਪੋਰਟ', reportsDesc: 'ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਦੀ ਰਿਪੋਰਟ ਡਾਊਨਲੋድ ਕਰੋ', eligibilityTitle: 'ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ', eligibilityDesc: 'ਆਪਣੀ ਜ਼ਮੀਨ ਅਨੁਸਾਰ ਸਬਸਿਡੀਆਂ ਲੱਭੋ', financeTitle: 'ਖੇਤੀ ਲੇਖਾ-ਜੋਖਾ', financeDesc: 'ਲਾਗਤ ਅਤੇ ਮੁਨਾਫ਼ੇ ਦਾ ਰਿਕਾਰਡ ਰੱਖੋ', sustainabilityScore: 'ਮੇਰਾ ਜੈਵਿਕ ਖੇਤੀ ਸਕੋਰ'
    },
    common: { loading: 'ਅਪਡੇਟ ਹੋ ਰਿਹਾ ਹੈ...', success: 'ਸਫਲਤਾਪੂਰਵਕ ਮੁਕੰਮਲ', error: 'ਨੈੱਟਵਰਕ ਹੌਲੀ ਹੈ, ਵਿਕਲਪਿਕ ਸਰਵਰ ਨਾਲ ਜੁੜੇ ਹਾਂ।', retry: 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ', otpTitle: 'ਕਿਸਾਨ ਸਤਿਆਪਨ', otpSubtitle: 'ਖਾਸ ਕਿਸਾਨ ਬੈਜ ਪ੍ਰਾਪत ਕਰਨ ਲਈ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ', phonePlaceholder: '10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ', sendOtp: 'ਓਟੀਪੀ ਪ੍ਰਾਪਤ ਕਰੋ', verifyOtp: 'ਸਤਿਆਪਿਤ ਕਰੋ', otpPlaceholder: '6 ਅੰਕਾਂ ਦਾ ਓਟੀਪੀ ਕੋਡ ਪਾਓ', guestLogin: 'ਗੈਸਟ ਕਿਸਾਨ ਵਜੋਂ ਅੱਗੇ ਵਧੋ' }
  }
};

export const MOCK_WEATHER_ALERTS: WeatherAlert[] = [
  {
    id: 'w1',
    type: 'Rainfall Warning',
    severity: 'warning',
    message: 'Heavy rain expected in next 48 hours. Protect harvest bags and temporary storages!',
    time: '2 hours ago'
  },
  {
    id: 'w2',
    type: 'Pest Outbreak Alert',
    severity: 'danger',
    message: 'Spodoptera insect spotted in neighbor district. Check cotton fields immediately!',
    time: '1 day ago'
  }
];

export const MOCK_CROP_PRICES: CropPrice[] = [
  {
    id: 'c1',
    name: 'Tomato (Local)',
    price: '₹22 - ₹28 / kg',
    trend: 'up',
    change: '+14% this week',
    demand: 'HIGH',
    profit: 'HIGH',
    risk: 'MEDIUM',
    nextSeasonPredicted: '₹34 - ₹40 / kg expected due to festive demand and supply gaps.'
  },
  {
    id: 'c2',
    name: 'Onion (Nashik Light Red)',
    price: '₹32 - ₹36 / kg',
    trend: 'stable',
    change: '0% stable',
    demand: 'MEDIUM',
    profit: 'HIGH',
    risk: 'LOW',
    nextSeasonPredicted: '₹38 - ₹42 / kg. Recommended to dry properly before selling.'
  },
  {
    id: 'c3',
    name: 'Paddy (Basmati Medium)',
    price: '₹4,200 - ₹4,500 / quintal',
    trend: 'up',
    change: '+4% this week',
    demand: 'HIGH',
    profit: 'HIGH',
    risk: 'LOW',
    nextSeasonPredicted: '₹4,600 - ₹4,800 / quintal. High export queries registered recently.'
  },
  {
    id: 'c4',
    name: 'Cotton (Long Staple)',
    price: '₹7,200 - ₹7,600 / quintal',
    trend: 'down',
    change: '-5% globally',
    demand: 'LOW',
    profit: 'MEDIUM',
    risk: 'HIGH',
    nextSeasonPredicted: '₹6,800 - ₹7,100 / quintal. High global stocks. Consider alternative sowing.'
  }
];

export const MOCK_COMMUNITY_FEED: Post[] = [
  {
    id: 'post1',
    author: 'Malleshappa K.',
    isVerified: true,
    content: 'Brothers, my local tomato crop was showing black spots on lower leaves. Visited AgriVerse AI doctor and found it is Early Blight! Sprayed Mancozeb 2g/L as suggested, now plants are fully healthy again! Strongly recommend trying the AI Doctor.',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400',
    likes: 42,
    likedBy: [],
    district: 'Chikkaballapura',
    village: 'Anemadagu',
    category: 'disease',
    time: '3 hours ago',
    comments: [
      { id: 'comm1_1', author: 'Somashekhar G.', content: 'Great result! Did you use bio-booster as well?', time: '2 hours ago' },
      { id: 'comm1_2', author: 'Ravi Kumar', content: 'Same issue on my field. Will load photo immediately.', time: '1 hour ago' }
    ]
  },
  {
    id: 'post2',
    author: 'Sukhdev Singh',
    isVerified: true,
    content: 'Just harvested super premium Basmati paddy in Amritsar district. Yield average is 24 quintals per acre this season using the water-saving drip reminders. Direct mill buyers are welcome to coordinate prices.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
    likes: 68,
    likedBy: [],
    district: 'Dharwad',
    village: 'Hubli Rural',
    category: 'crop_update',
    time: '5 hours ago',
    comments: [
      { id: 'comm2_1', author: 'Gurtej Singh', content: 'Amazing yield Sukhdev veer, what was your seed class?', time: '4 hours ago' }
    ]
  },
  {
    id: 'post3',
    author: 'Gurbasappa Gowda',
    isVerified: true,
    content: 'Heavy wind warning issued for Koppal and Bellary region. Keep your banana plants supported! Protect the water bundle immediately!',
    likes: 19,
    likedBy: [],
    district: 'Koppal',
    village: 'Giri Town',
    category: 'weather',
    voiceUrl: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAERKgAAKkoAAAEKABgAZGF0YQQAAAAAAA==',
    voiceCaption: 'ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ: ಕೊಪ್ಪಳ ಜಿಲ್ಲೆಯಲ್ಲಿ ಭಾರಿ ಗಾಳಿ ಮಳೆ ಸಾಧ್ಯತೆ ಇದೆ. ಬಾಳೆ ಬೆಳೆಗಳನ್ನು ರಕ್ಷಿಸಿ.',
    time: '8 hours ago',
    comments: []
  }
];

export const MOCK_MARKET_ITEMS: ProductItem[] = [
  {
    id: 'prod1',
    title: 'Organic Cow dung Bio-fertilizer (Packed)',
    seller: 'Naveen S',
    location: 'Anemadagu Village, Chikkaballapura',
    price: '₹120',
    quantity: '50 Kg bag',
    image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=400',
    isVerified: true,
    phone: '+919900011223'
  },
  {
    id: 'prod2',
    title: 'Certified Tomato Seed F1 Hybrid (500g)',
    seller: 'Bharat Agri Seeds Corp',
    location: 'Varanasi, UP',
    price: '₹450',
    quantity: 'Pack of 1',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400',
    isVerified: true,
    phone: '+919911223344'
  },
  {
    id: 'prod3',
    title: 'Premium Quality Basmati Seed (PR 126)',
    seller: 'Sukhdev Farms & Seeds',
    location: 'Amritsar Rural, Punjab',
    price: '₹55',
    quantity: 'Available: 200 Quintals',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
    isVerified: true,
    phone: '+918877665544'
  }
];

export const MOCK_GOV_SCHEMES: GovernmentScheme[] = [
  {
    id: 's1',
    title: 'PM-KISAN Samman Nidhi',
    benefit: '₹6,000 yearly income support paid in 3 equal installments',
    eligible: 'All small/marginal landholder farmer families across states',
    status: 'eligible'
  },
  {
    id: 's2',
    title: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)',
    benefit: 'Up to 80% subsidy on installing Micro-irrigation / Drip pipelines',
    eligible: 'Farmers with legal land title & tubewell coordination logs',
    status: 'eligible'
  },
  {
    id: 's3',
    title: 'Sub-mission on Agricultural Mechanization (SMAM)',
    benefit: '50% financial assistance for rent or purchase of Paddy Harvester/Tractors',
    eligible: 'Registered co-operatives or verified farmer partners',
    status: 'checking'
  }
];
