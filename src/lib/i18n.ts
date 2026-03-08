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

  // Duas page sections
  duasAndDhikr: 'الدُعاء والذكر',
  daily: 'يومي',
  adhkar: 'أذكار',
  otherDuas: 'أخرى',
  occasional: 'متقطع',

  // Dua translations
  duaSleep1: 'باسمك اللهم أموت وأحيا',
  duaSleep2: 'اللهم قني عذابك يوم تبعث عبادك',
  duaSleep3: 'باسمك ربي وضعت جنبي وبك أرفعه، فإن أمسكت نفسي فارحمها، وإن أرسلتها فاحفظها بما تحفظ به عبادك الصالحين',
  duaSleep4: 'اللهم إنك خلقت نفسي وأنت توفاها، لك مماتها ومحياها، إن أحييتها فاحفظها، وإن أمتها فاغفر لها، اللهم إني أسألك العافية',
  duaSleep5: 'اللهم رب السماوات ورب الأرض ورب العرش العظيم، ربنا ورب كل شيء، فالق الحب والنوى، ومنزل التوراة والإنجيل والفرقان، أعوذ بك من شر كل شيء أنت آخذ بناصيته',
  duaWudu1: 'بسم الله',
  duaWudu2: 'أشهد أن لا إله إلا الله وحده لا شريك له وأشهد أن محمداً عبده ورسوله',
  duaWudu3: 'اللهم اجعلني من التوابين واجعلني من المتطهرين',
  duaWudu4: 'سبحانك اللهم وبحمدك، أشهد أن لا إله إلا أنت، أستغفرك وأتوب إليك',
  duaMosque1: 'اللهم افتح لي أبواب رحمتك',
  duaMosque2: 'أعوذ بالله العظيم وبوجهه الكريم وسلطانه القديم من الشيطان الرجيم',
  duaMosque3: 'بسم الله والصلاة والسلام على رسول الله، اللهم اغفر لي ذنوبي وافتح لي أبواب رحمتك',
  duaSalah1: 'سبحانك اللهم وبحمدك، وتبارك اسمك، وتعالى جدك، ولا إله غيرك',
  duaSalah2: 'ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار',
  duaSalah3: 'اللهم إني أعوذ بك من عذاب القبر ومن عذاب جهنم ومن فتنة المحيا والممات ومن شر فتنة المسيح الدجال',
  duaSalah4: 'رب اجعلني مقيم الصلاة ومن ذريتي ربنا وتقبل دعاء',
  duaHome1: 'بسم الله ولجنا، وبسم الله خرجنا، وعلى الله ربنا توكلنا',
  duaHome2: 'اللهم إني أسألك خير المولج وخير المخرج، بسم الله ولجنا وبسم الله خرجنا وعلى الله ربنا توكلنا',
  duaClothes1: 'الحمد لله الذي كساني هذا الثوب ورزقنيه من غير حول مني ولا قوة',
  duaClothes2: 'اللهم لك الحمد أنت كسوتنيه، أسألك من خيره وخير ما صنع له، وأعوذ بك من شره وشر ما صنع له',
  duaTravel1: 'الله أكبر، سبحان الذي سخر لنا هذا وما كنا له مقرنين وإنا إلى ربنا لمنقلبون',
  duaTravel2: 'اللهم إنا نسألك في سفرنا هذا البر والتقوى ومن العمل ما ترضى',
  duaTravel3: 'اللهم هوّن علينا سفرنا هذا واطو عنا بعده',
  duaFood1: 'بسم الله',
  duaFood2: 'الحمد لله الذي أطعمني هذا ورزقنيه من غير حول مني ولا قوة',
  duaFood3: 'اللهم بارك لنا فيه وأطعمنا خيراً منه',
  duaFood4: 'الحمد لله حمداً كثيراً طيباً مباركاً فيه، غير مكفي ولا مودع ولا مستغنى عنه ربنا',
  duaDhikr1: 'سبحان الله وبحمده',
  duaDhikr2: 'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير',
  duaDhikr3: 'سبحان الله وبحمده سبحان الله العظيم',
  duaDhikr4: 'لا حول ولا قوة إلا بالله',
  duaDhikr5: 'أستغفر الله وأتوب إليه',
  duaRevival1: 'أصبحنا وأصبح الملك لله والحمد لله، لا إله إلا الله وحده لا شريك له',
  duaRevival2: 'اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور',
  duaRevival3: 'اللهم ما أصبح بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر',
  duaRevival4: 'أعوذ بكلمات الله التامات من شر ما خلق',
  duaAfterPrayer1: 'أستغفر الله، أستغفر الله، أستغفر الله',
  duaAfterPrayer2: 'اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام',
  duaAfterPrayer3: 'سبحان الله (٣٣) والحمد لله (٣٣) والله أكبر (٣٣)',
  duaAfterPrayer4: 'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير',
  duaAfterPrayer5: 'اللهم أعني على ذكرك وشكرك وحسن عبادتك',
  duaRizq1: 'اللهم إني أسألك علماً نافعاً ورزقاً طيباً وعملاً متقبلاً',
  duaRizq2: 'اللهم اكفني بحلالك عن حرامك وأغنني بفضلك عمن سواك',
  duaRizq3: 'اللهم رب السماوات السبع ورب العرش العظيم، اقض عني الدين وأغنني من الفقر',
  duaKnowledge1: 'رب زدني علماً',
  duaKnowledge2: 'اللهم انفعني بما علمتني وعلمني ما ينفعني وزدني علماً',
  duaKnowledge3: 'اللهم إني أعوذ بك من علم لا ينفع ومن قلب لا يخشع ومن نفس لا تشبع ومن دعوة لا يستجاب لها',
  duaFaith1: 'اللهم إني أسألك الهدى والتقى والعفاف والغنى',
  duaFaith2: 'يا مقلب القلوب ثبت قلبي على دينك',
  duaFaith3: 'ربنا لا تزغ قلوبنا بعد إذ هديتنا وهب لنا من لدنك رحمة إنك أنت الوهاب',
  duaJudgment1: 'اللهم إني أعوذ بك من عذاب القبر وأعوذ بك من فتنة المسيح الدجال',
  duaJudgment2: 'ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار',
  duaJudgment3: 'اللهم أجرني من النار',
  duaForgiveness1: 'أستغفر الله الذي لا إله إلا هو الحي القيوم وأتوب إليه',
  duaForgiveness2: 'رب اغفر لي وتب علي إنك أنت التواب الرحيم',
  duaForgiveness3: 'اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك علي وأبوء بذنبي فاغفر لي فإنه لا يغفر الذنوب إلا أنت',
  duaPraising1: 'سبحان الله والحمد لله ولا إله إلا الله والله أكبر',
  duaPraising2: 'الحمد لله رب العالمين حمداً كثيراً طيباً مباركاً فيه',
  duaPraising3: 'سبحان الله عدد خلقه، سبحان الله رضا نفسه، سبحان الله زنة عرشه، سبحان الله مداد كلماته',
  duaFamily1: 'ربنا هب لنا من أزواجنا وذرياتنا قرة أعين واجعلنا للمتقين إماماً',
  duaFamily2: 'رب هب لي من الصالحين',
  duaFamily3: 'رب اجعلني مقيم الصلاة ومن ذريتي ربنا وتقبل دعاء',
  duaHealth1: 'اللهم رب الناس أذهب البأس، اشف أنت الشافي، لا شفاء إلا شفاؤك، شفاء لا يغادر سقماً',
  duaHealth2: 'أسأل الله العظيم رب العرش العظيم أن يشفيك',
  duaHealth3: 'بسم الله أرقيك، من كل شيء يؤذيك، من شر كل نفس أو عين حاسد الله يشفيك',
  duaLoss1: 'إنا لله وإنا إليه راجعون، اللهم أجرني في مصيبتي وأخلف لي خيراً منها',
  duaLoss2: 'قدر الله وما شاء فعل',
  duaLoss3: 'اللهم لا سهل إلا ما جعلته سهلاً وأنت تجعل الحزن إذا شئت سهلاً',
  duaSadness1: 'اللهم إني أعوذ بك من الهم والحزن والعجز والكسل والبخل والجبن وضلع الدين وغلبة الرجال',
  duaSadness2: 'لا إله إلا أنت سبحانك إني كنت من الظالمين',
  duaSadness3: 'حسبنا الله ونعم الوكيل',
  duaPatience1: 'ربنا أفرغ علينا صبراً وثبت أقدامنا وانصرنا على القوم الكافرين',
  duaPatience2: 'اللهم لا سهل إلا ما جعلته سهلاً وأنت تجعل الحزن إذا شئت سهلاً',
  duaDebt1: 'اللهم إني أعوذ بك من المأثم والمغرم',
  duaMens1: 'سبحان الله وبحمده',
  duaMens2: 'أستغفر الله وأتوب إليه',
  duaMens3: 'لا إله إلا الله وحده لا شريك له',
  duaDeceased1: 'اللهم اغفر له وارحمه وعافه واعف عنه، وأكرم نزله ووسع مدخله',
  duaDeceased2: 'اللهم اغفر لحينا وميتنا وشاهدنا وغائبنا وصغيرنا وكبيرنا وذكرنا وأنثانا',
  duaDeceased3: 'اللهم لا تحرمنا أجره ولا تفتنا بعده واغفر لنا وله',
  duaHajj1: 'لبيك اللهم لبيك، لبيك لا شريك لك لبيك، إن الحمد والنعمة لك والملك لا شريك لك',
  duaHajj2: 'ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار',
  duaHajj3: 'بسم الله والله أكبر',
  duaRamadan1: 'اللهم إنك عفو تحب العفو فاعف عني',
  duaRamadan2: 'ذهب الظمأ وابتلت العروق وثبت الأجر إن شاء الله',
  duaRamadan3: 'اللهم إني لك صمت وعلى رزقك أفطرت',
  duaNature1: 'اللهم صيباً نافعاً',
  duaNature2: 'سبحان الذي يسبح الرعد بحمده والملائكة من خيفته',
  duaNature3: 'اللهم إني أسألك خيرها وخير ما فيها وخير ما أرسلت به وأعوذ بك من شرها وشر ما فيها وشر ما أرسلت به',
  duaManners1: 'اللهم اهدني لأحسن الأخلاق لا يهدي لأحسنها إلا أنت واصرف عني سيئها لا يصرف عني سيئها إلا أنت',
  duaManners2: 'اللهم إني أعوذ بك من منكرات الأخلاق والأعمال والأهواء',
  duaGuidance1: 'اللهم إني أستخيرك بعلمك وأستقدرك بقدرتك وأسألك من فضلك العظيم',
  duaGuidance2: 'رب اشرح لي صدري ويسر لي أمري',
  duaGuidance3: 'اللهم خر لي واختر لي',
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
