const GOOGLE_TRANSLATE_API_KEY = 'AIzaSyBwFHv3bkEEWemeykzLK8oqB-ps6OrO5po';

// All UI strings in Arabic (source language)
const arabicStrings: Record<string, string> = {
  appName: 'أذاني',
  home: 'الرئيسية',
  prayerTimes: 'مواقيت الصلاة',
  qibla: 'القبلة',
  quran: 'القرآن',
  more: 'المزيد',
  tasbeeh: 'المسبحة',
  duas: 'الأدعية',
  calendar: 'التقويم',
  tracker: 'متتبع الصلاة',
  settings: 'الإعدادات',
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
  nextPrayer: 'الصلاة القادمة',
  timeRemaining: 'الوقت المتبقي',
  today: 'اليوم',
  hijriDate: 'التاريخ الهجري',
  location: 'الموقع',
  detectLocation: 'تحديد الموقع',
  quickAccess: 'وصول سريع',
  distanceToMakkah: 'المسافة إلى مكة',
  qiblaDirection: 'اتجاه القبلة',
  surah: 'سورة',
  juz: 'جزء',
  search: 'بحث',
  bookmarks: 'المفضلة',
  reset: 'إعادة ضبط',
  count: 'العدد',
  total: 'المجموع',
  subhanAllah: 'سبحان الله',
  alhamdulillah: 'الحمد لله',
  allahuAkbar: 'الله أكبر',
  morningAdhkar: 'أذكار الصباح',
  eveningAdhkar: 'أذكار المساء',
  completed: 'مكتملة',
  streak: 'سلسلة',
  days: 'أيام',
  zakatCalculator: 'حاسبة الزكاة',
  loading: 'جاري التحميل...',
  error: 'خطأ',
  retry: 'إعادة المحاولة',
  noResults: 'لا توجد نتائج',
  loginPrompt: 'سجّل دخولك لحفظ تقدمك عبر الأجهزة',
  loginSignup: 'تسجيل الدخول / إنشاء حساب',
  loginWithGoogle: 'تسجيل الدخول بحساب Google',
  or: 'أو',
  name: 'الاسم',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  login: 'تسجيل الدخول',
  signup: 'إنشاء حساب',
  noAccount: 'ليس لديك حساب؟',
  hasAccount: 'لديك حساب بالفعل؟',
  yourIslamicApp: 'تطبيقك الإسلامي الشامل',
  loginSuccess: 'تم تسجيل الدخول بنجاح',
  signupSuccess: 'تم إنشاء الحساب! تحقق من بريدك الإلكتروني',
  addedToFavorites: 'تمت إضافة السورة إلى المفضلات',
  removedFromFavorites: 'تمت إزالة السورة من المفضلات',
  loginToSave: 'سجّل دخولك لحفظ المفضلات',
  languageChanged: 'تم تغيير اللغة',
  ayahs: 'آيات',
  istighfar: 'الاستغفار',
  hijriCalendar: 'التقويم الهجري',
  ramadanCountdown: 'العد التنازلي لرمضان',
  daysRemaining: 'يوم متبقي',
  ramadanMubarak: 'رمضان مبارك! 🌙',
  upcomingEvents: 'المناسبات القادمة',
  newYear: 'رأس السنة الهجرية',
  ashura: 'يوم عاشوراء',
  mawlidNabi: 'المولد النبوي',
  israMiraj: 'الإسراء والمعراج',
  shaabanMid: 'ليلة النصف من شعبان',
  ramadanStart: 'بداية رمضان',
  lailatAlQadr: 'ليلة القدر',
  eidFitr: 'عيد الفطر',
  hajjStart: 'بداية الحج',
  dayArafah: 'يوم عرفة',
  eidAdha: 'عيد الأضحى',
  cashBalance: 'النقد والرصيد البنكي',
  goldValue: 'قيمة الذهب',
  silverValue: 'قيمة الفضة',
  stocksInvestments: 'الأسهم والاستثمارات',
  debtsOwed: 'الديون المستحقة لك',
  calculateZakat: 'حساب الزكاة',
  yourZakat: 'زكاتك (٢.٥٪)',
  belowNisab: 'أموالك أقل من النصاب',
  km: 'كم',
  revelationMeccan: 'مكية',
  revelationMedinan: 'مدنية',
  notificationsEnabled: 'تم تفعيل إشعارات الأذان 🔔',
  notificationsDisabled: 'تم إيقاف إشعارات الأذان',
  notificationsDenied: 'لم يتم السماح بالإشعارات',
  loginToSaveBookmarks: 'سجّل دخولك لحفظ المفضلات',
  surahAddedToFav: 'تمت إضافة السورة إلى المفضلات',
  surahRemovedFromFav: 'تمت إزالة السورة من المفضلات',
  loginToSaveProgress: 'سجّل دخولك لحفظ تقدمك عبر الأجهزة',
  sunday: 'أحد',
  monday: 'اثن',
  tuesday: 'ثلا',
  wednesday: 'أرب',
  thursday: 'خمي',
  friday: 'جمع',
  saturday: 'سبت',
};

// RTL languages
const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'yi', 'ku'];

// Cache translated strings
const translationCache: Record<string, Record<string, string>> = {
  ar: { ...arabicStrings },
};

/**
 * Detect device language - returns the 2-letter language code
 */
export function detectDeviceLanguage(): string {
  const lang = navigator.language || (navigator as any).userLanguage || 'ar';
  return lang.split('-')[0].toLowerCase();
}

/**
 * Check if language is RTL
 */
export function isRTLLanguage(lang: string): boolean {
  return rtlLanguages.includes(lang);
}

/**
 * Get direction for language
 */
export function getDirection(lang: string): 'rtl' | 'ltr' {
  return isRTLLanguage(lang) ? 'rtl' : 'ltr';
}

/**
 * Translate all strings to target language using Google Translate API
 */
async function translateBatch(targetLang: string): Promise<Record<string, string>> {
  if (translationCache[targetLang]) {
    return translationCache[targetLang];
  }

  // If target is Arabic, return source strings
  if (targetLang === 'ar') {
    return arabicStrings;
  }

  try {
    const keys = Object.keys(arabicStrings);
    const texts = Object.values(arabicStrings);

    // Google Translate API - batch translate
    const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: texts,
        source: 'ar',
        target: targetLang,
        format: 'text',
      }),
    });

    if (!response.ok) {
      console.error('Translation API error:', response.status);
      return arabicStrings;
    }

    const data = await response.json();
    const translations = data.data.translations;

    const result: Record<string, string> = {};
    keys.forEach((key, i) => {
      result[key] = translations[i]?.translatedText || arabicStrings[key];
    });

    // Cache the result
    translationCache[targetLang] = result;

    // Also cache in localStorage for offline use
    try {
      localStorage.setItem(`translations-${targetLang}`, JSON.stringify(result));
    } catch {}

    return result;
  } catch (error) {
    console.error('Translation failed:', error);

    // Try loading from localStorage cache
    try {
      const cached = localStorage.getItem(`translations-${targetLang}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        translationCache[targetLang] = parsed;
        return parsed;
      }
    } catch {}

    return arabicStrings;
  }
}

/**
 * Load translations for a language (with caching)
 */
export async function loadTranslations(lang: string): Promise<Record<string, string>> {
  // Check memory cache first
  if (translationCache[lang]) {
    return translationCache[lang];
  }

  // Check localStorage cache
  try {
    const cached = localStorage.getItem(`translations-${lang}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      translationCache[lang] = parsed;
      return parsed;
    }
  } catch {}

  // Fetch from API
  return translateBatch(lang);
}

/**
 * Get a single translation key (synchronous - uses cache)
 */
export function getTranslation(key: string, lang: string): string {
  return translationCache[lang]?.[key] || arabicStrings[key] || key;
}

/**
 * Get all Arabic source strings
 */
export function getArabicStrings(): Record<string, string> {
  return arabicStrings;
}
