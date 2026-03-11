const GOOGLE_TRANSLATE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_KEY || '';

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

  // Qibla
  qiblaFromNorth: 'من الشمال',
  qiblaFromEast: 'من الشرق',
  qiblaFromSouth: 'من الجنوب',
  qiblaFromWest: 'من الغرب',

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

  // Sub-category labels
  subCategories: 'أقسام',
  totalDuas: 'دعاء',
  duaSubBeforeSleep: 'قبل النوم',
  duaSubAfterWakeUp: 'بعد الاستيقاظ',
  duaSubNightmare: 'عند الكابوس',
  duaSubBeforeWudu: 'قبل الوضوء',
  duaSubAfterWudu: 'بعد الوضوء',
  duaSubEnteringMosque: 'دخول المسجد',
  duaSubLeavingMosque: 'الخروج من المسجد',
  duaSubOpeningSalah: 'استفتاح الصلاة',
  duaSubDuringSalah: 'أثناء الصلاة',
  duaSubAfterSalah: 'بعد الصلاة',
  duaSubEnteringHome: 'دخول المنزل',
  duaSubLeavingHome: 'الخروج من المنزل',
  duaSubWearingNew: 'لبس ثوب جديد',
  duaSubRemovingClothes: 'خلع الملابس',
  duaSubSeeingSomeoneNew: 'رؤية شخص بثوب جديد',
  duaSubStartTravel: 'بداية السفر',
  duaSubReturnTravel: 'العودة من السفر',
  duaSubRidingVehicle: 'ركوب المركبة',
  duaSubBeforeEating: 'قبل الأكل',
  duaSubAfterEating: 'بعد الأكل',
  duaSubDrinking: 'عند الشرب',
  duaSubGuestFood: 'عند الضيافة',
  duaSubMorningAdhkar: 'أذكار الصباح',
  duaSubEveningAdhkar: 'أذكار المساء',
  duaSubGeneralDhikr: 'ذكر عام',
  duaSubProtectionAdhkar: 'أذكار الحماية',
  duaSubSalawat: 'الصلاة على النبي',
  duaSubImmediateAfter: 'مباشرة بعد الصلاة',
  duaSubTasbeehAfter: 'التسبيح بعد الصلاة',
  duaSubAskingRizq: 'طلب الرزق',
  duaSubSeekingKnowledge: 'طلب العلم',
  duaSubBeforeExam: 'قبل الامتحان',
  duaSubStrengtheningFaith: 'تثبيت الإيمان',
  duaSubProtectionHereafter: 'الحماية في الآخرة',
  duaSubSeekingForgiveness: 'طلب المغفرة',
  duaSubPraisingAllah: 'الثناء على الله',
  duaSubForChildren: 'للأبناء',
  duaSubForParents: 'للوالدين',
  duaSubForSpouse: 'للزوج/الزوجة',
  duaSubWhenSick: 'عند المرض',
  duaSubVisitingSick: 'زيارة المريض',
  duaSubRuqyah: 'الرقية الشرعية',
  duaSubWhenAfflicted: 'عند المصيبة',
  duaSubAnxietyRelief: 'تخفيف القلق',
  duaSubHappiness: 'عند الفرح',
  duaSubAskingPatience: 'طلب الصبر',
  duaSubPayingDebt: 'قضاء الدين',
  duaSubDhikrDuringPeriod: 'أذكار أثناء الحيض',
  duaSubFuneralPrayer: 'صلاة الجنازة',
  duaSubCondolences: 'التعزية',
  duaSubVisitingGrave: 'زيارة القبور',
  duaSubTalbiyah: 'التلبية',
  duaSubTawaf: 'الطواف',
  duaSubSaiBetween: 'السعي بين الصفا والمروة',
  duaSubArafat: 'يوم عرفة',
  duaSubSuhoor: 'السحور',
  duaSubIftar: 'الإفطار',
  duaSubLaylatulQadr: 'ليلة القدر',
  duaSubWhenRaining: 'عند المطر',
  duaSubThunderStorm: 'عند الرعد',
  duaSubWhenWindy: 'عند الريح',
  duaSubGoodCharacter: 'حسن الخلق',
  duaSubIstikhara: 'صلاة الاستخارة',
  duaSubMakingDecision: 'عند اتخاذ القرار',

  // Quick access items
  quickTasbeeh: 'تسبيح',
  quickQibla: 'القبلة',
  quickQuran: 'القرآن',
  quickDuas: 'الأدعية',
  quickStories: 'قصص',
  quickZakat: 'الزكاة',

  // Index page
  remaining: 'متبقي',
  nextPrayerLabel: 'الصلاة القادمة',
  prayerTracking: 'متابعة الصلاة',
  athanLabel: 'الأذان',
  enableLocation: 'تفعيل الموقع',
  mosqueTimes: 'أوقات المساجد',
  chooseNearbyMosque: 'اختر مسجدك القريب',
  moreLabel: 'المزيد',
  liveLabel: 'مباشر',
  unlinkMosque: 'إلغاء',
  mosqueUnlinked: 'تم إلغاء ربط المسجد',
  iftar: 'إفطار',
  ramadanChallenge: 'تحدي رمضان',
  duaOfDay: 'دعاء اليوم',
  readWithTranslation: 'اقرأ مع الترجمة →',
  quranCompletion: '📖 إتمام القرآن',
  startDailyRecitation: 'ابدأ تلاوة القرآن يوميًا',
  setYourPace: 'حدّد وتيرتك واحصل على تذكيرات يومية',
  setQuranGoal: 'حدّد هدف القرآن →',
  hijriCalendarTitle: 'التقويم الهجري',
  quickAccessLabel: 'وصول سريع',

  // Duas page categories
  catSleep: 'النوم',
  catWudu: 'الوضوء',
  catMosque: 'مسجد',
  catSalah: 'صلاة',
  catHome: 'منزل',
  catClothes: 'ملابس',
  catTravel: 'سفر',
  catFood: 'طعام',
  catDailyDhikr: 'الذكر اليومي',
  catDailyRevival: 'إحياء الذكرى اليومي',
  catAfterPrayer: 'بعد الصلوات',
  catRizq: 'رزق',
  catKnowledge: 'معرفة',
  catFaith: 'الإيمان',
  catJudgment: 'يوم الحساب',
  catForgiveness: 'مغفرة',
  catPraising: 'مشيداً بالله',
  catFamily: 'عائلة',
  catHealth: 'الصحة / المرض',
  catLoss: 'الخسارة / الفشل',
  catSadness: 'الحزن / السعادة',
  catPatience: 'الصبر',
  catDebt: 'الدّين',
  catMenstruation: 'أثناء الحيض',
  catDeceased: 'المتوفى',
  catHajj: 'الحج / العمرة',
  catRamadan: 'رمضان',
  catNature: 'طبيعة',
  catGoodManners: 'السلوكيات الحميدة',
  catGuidance: 'إتخاذ القرار / التوجيه',
  duasSubtitle: 'أدعية وأذكار من الكتاب والسنة',
  searchDua: 'ابحث عن دعاء...',
  resultCount: 'نتيجة',
  noResultsFound: 'لا توجد نتائج',
  favoritesLabel: 'المفضلة',
  noFavoriteDuas: 'لا توجد أدعية مفضلة بعد',
  sectionsLabel: 'أقسام',

  // Stories page
  storiesTitle: '📖 قصص حقيقية',
  storiesSubtitle: 'شارك قصتك وألهم الآخرين',
  yourStoryMayGuide: 'قصتك قد تكون سبباً في هداية شخص',
  shareYourExperience: 'شارك تجربتك الحقيقية — نص، فيديو، أو صوت.\nيتم مراجعة القصص قبل نشرها لضمان جودة المحتوى.',
  publishYourStory: 'انشر قصتك الآن',
  loginToPublish: 'سجّل دخولك لنشر قصتك',
  chooseCategory: 'اختر الفئة',
  publishStory: 'انشر قصة',
  noStoriesYet: 'لا توجد قصص بعد',
  beFirstToShare: 'كن أول من يشارك قصته!',
  publishFirstStory: 'انشر أول قصة',
  catIstighfar: 'قصص الاستغفار',
  catSahaba: 'قصص الصحابة',
  catRuqyahStory: 'قصص الرقية الشرعية',
  catHawqala: 'قصص الحوقلة',
  catRizqStory: 'قصص الرزق',
  mediaText: 'نص',
  mediaVideo: 'فيديو',
  mediaAudio: 'صوت',

  // Ruqyah page
  ruqyahTitle: '🛡️ العلاج بالرقية الشرعية',
  ruqyahSubtitle: 'رقية شرعية من القرآن والسنة',
  ruqyahDisclaimer: '⚠️ الرقية الشرعية مأخوذة من القرآن الكريم والسنة النبوية الشريفة.\nهذا القسم للاستماع والتحصين وليس بديلاً عن العلاج الطبي.',
  ruqyahCount: 'رقية',
  noRuqyahYet: 'لا توجد رقيات في هذا القسم بعد',

  // Quran page
  quranSubtitle: 'القرآن الكريم',
  noBookmarksYet: 'لا توجد سور محفوظة بعد',
  loginToSaveBookmarksQuran: 'سجّل دخولك لحفظ المفضلة',
  removedFromBookmarks: 'تم الإزالة من المفضلة',
  addedToBookmarks: 'تم الإضافة للمفضلة',

  // Calendar
  gregorianCalendar: 'ميلادي',
  hijriCalendar2: 'هجري',
  nextMonth: 'الشهر التالي',
  prevMonth: 'الشهر السابق',

  // SurahView
  meaningTranslation: 'ترجمة المعنى',

  // New dua translations
  duaSleepBefore6: 'اللهم أسلمت نفسي إليك وفوضت أمري إليك ووجهت وجهي إليك وألجأت ظهري إليك، رغبة ورهبة إليك، لا ملجأ ولا منجا منك إلا إليك، آمنت بكتابك الذي أنزلت وبنبيك الذي أرسلت',
  duaWakeUp1: 'الحمد لله الذي أحيانا بعدما أماتنا وإليه النشور',
  duaWakeUp2: 'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، سبحان الله والحمد لله ولا إله إلا الله والله أكبر ولا حول ولا قوة إلا بالله العلي العظيم',
  duaNightmare1: 'أعوذ بكلمات الله التامات من غضبه وعقابه وشر عباده ومن همزات الشياطين وأن يحضرون',
  duaNightmare2: 'أعوذ بالله من الشيطان الرجيم',
  duaMosqueLeave1: 'بسم الله والصلاة والسلام على رسول الله، اللهم إني أسألك من فضلك',
  duaMosqueLeave2: 'اللهم اعصمني من الشيطان الرجيم',
  duaHomeLeave1: 'بسم الله، توكلت على الله، ولا حول ولا قوة إلا بالله',
  duaHomeLeave2: 'اللهم إني أعوذ بك أن أضل أو أُضل أو أزل أو أُزل أو أظلم أو أُظلم أو أجهل أو يُجهل علي',
  duaClothesRemove1: 'بسم الله',
  duaClothesSee1: 'تُبلي ويُخلف الله تعالى',
  duaClothesSee2: 'البس جديداً وعش حميداً ومت شهيداً',
  duaTravelReturn1: 'آيبون تائبون عابدون لربنا حامدون',
  duaTravelReturn2: 'اللهم إني أسألك خير المولج وخير المخرج',
  duaVehicle1: 'سبحان الذي سخر لنا هذا وما كنا له مقرنين وإنا إلى ربنا لمنقلبون',
  duaVehicle2: 'بسم الله، الحمد لله',
  duaFoodBefore2: 'اللهم بارك لنا فيما رزقتنا وقنا عذاب النار',
  duaFoodBefore3: 'بسم الله في أوله وآخره',
  duaDrink1: 'اللهم بارك لنا فيه وزدنا منه',
  duaGuestFood1: 'اللهم بارك لهم فيما رزقتهم واغفر لهم وارحمهم',
  duaGuestFood2: 'أفطر عندكم الصائمون وأكل طعامكم الأبرار وصلت عليكم الملائكة',
  duaMorning1: 'اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت',
  duaEvening1: 'أمسينا وأمسى الملك لله والحمد لله، لا إله إلا الله وحده لا شريك له',
  duaEvening2: 'اللهم بك أمسينا وبك أصبحنا وبك نحيا وبك نموت وإليك المصير',
  duaEvening3: 'اللهم ما أمسى بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر',
  duaProtection1: 'بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم',
  duaProtection2: 'حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم',
  duaSalawat1: 'اللهم صلِّ وسلم على نبينا محمد',
  duaSalawat2: 'اللهم صلِّ على محمد وعلى آل محمد كما صليت على إبراهيم وعلى آل إبراهيم إنك حميد مجيد',
  duaDebt2: 'اللهم اكفني بحلالك عن حرامك وأغنني بفضلك عمن سواك',
  duaExam1: 'رب اشرح لي صدري ويسر لي أمري واحلل عقدة من لساني يفقهوا قولي',
  duaExam2: 'اللهم لا سهل إلا ما جعلته سهلاً وأنت تجعل الحزن إذا شئت سهلاً',
  duaParents1: 'رب ارحمهما كما ربياني صغيراً',
  duaParents2: 'ربنا اغفر لي ولوالدي وللمؤمنين يوم يقوم الحساب',
  duaSpouse1: 'اللهم بارك لهما وبارك عليهما واجمع بينهما في خير',
  duaVisitSick1: 'لا بأس طهور إن شاء الله',
  duaRuqyah1: 'بسم الله (ثلاثاً) أعوذ بالله وقدرته من شر ما أجد وأحاذر',
  duaHappy1: 'الحمد لله الذي بنعمته تتم الصالحات',
  duaHappy2: 'اللهم لك الحمد كما ينبغي لجلال وجهك وعظيم سلطانك',
  duaCondolence1: 'إن لله ما أخذ وله ما أعطى وكل شيء عنده بأجل مسمى فلتصبر ولتحتسب',
  duaGrave1: 'السلام عليكم أهل الديار من المؤمنين والمسلمين، وإنا إن شاء الله بكم لاحقون، نسأل الله لنا ولكم العافية',
  duaSai1: 'إن الصفا والمروة من شعائر الله',
  duaSai2: 'نبدأ بما بدأ الله به',
  duaArafat1: 'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير',
  duaSuhoor1: 'نويت صوم غد من شهر رمضان',
  duaRain1: 'مُطرنا بفضل الله ورحمته',
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
    // If no API key configured, fall back to Arabic
    if (!GOOGLE_TRANSLATE_API_KEY) {
      return arabicStrings;
    }

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
