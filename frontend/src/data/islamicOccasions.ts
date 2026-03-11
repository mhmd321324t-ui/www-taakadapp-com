/**
 * Islamic Occasions System
 * Uses Hijri calendar to detect current Islamic occasions
 * and provide themed content for each one
 */

export interface IslamicOccasion {
  id: string;
  nameAr: string;
  nameEn: string;
  emoji: string;
  hijriMonth: number;
  hijriDayStart: number;
  hijriDayEnd: number;
  gradient: string;
  message: string;
  duaAr: string;
  specialAthan?: boolean; // Special athan behavior (e.g., cannon before maghrib)
  hasCannon?: boolean; // Show cannon animation at maghrib
  takbirat?: boolean; // Play takbirat instead of normal athan
  colors: { primary: string; secondary: string; accent: string };
}

export const ISLAMIC_OCCASIONS: IslamicOccasion[] = [
  // Ramadan - Month 9
  {
    id: 'ramadan',
    nameAr: 'رمضان كريم 🌙',
    nameEn: 'Ramadan Kareem',
    emoji: '🌙',
    hijriMonth: 9,
    hijriDayStart: 1,
    hijriDayEnd: 30,
    gradient: 'from-purple-900 via-indigo-900 to-slate-900',
    message: 'اللهم بلغنا رمضان وأعنا على صيامه وقيامه',
    duaAr: 'اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    specialAthan: true,
    hasCannon: true,
    colors: { primary: '#7C3AED', secondary: '#4F46E5', accent: '#F59E0B' },
  },
  // Last 10 nights of Ramadan
  {
    id: 'laylat-al-qadr',
    nameAr: 'ليالي القدر ✨',
    nameEn: 'Laylat al-Qadr',
    emoji: '✨',
    hijriMonth: 9,
    hijriDayStart: 21,
    hijriDayEnd: 30,
    gradient: 'from-amber-900 via-yellow-900 to-slate-900',
    message: 'ليلة القدر خير من ألف شهر',
    duaAr: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    colors: { primary: '#F59E0B', secondary: '#D97706', accent: '#FBBF24' },
  },
  // Eid al-Fitr - Month 10, Days 1-3
  {
    id: 'eid-fitr',
    nameAr: 'عيد الفطر المبارك 🎉',
    nameEn: 'Eid al-Fitr',
    emoji: '🎉',
    hijriMonth: 10,
    hijriDayStart: 1,
    hijriDayEnd: 3,
    gradient: 'from-emerald-800 via-green-900 to-teal-900',
    message: 'تقبل الله منا ومنكم صالح الأعمال',
    duaAr: 'اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ لَا إِلَٰهَ إِلَّا اللَّهُ',
    takbirat: true,
    colors: { primary: '#059669', secondary: '#047857', accent: '#34D399' },
  },
  // Dhul Hijjah 1-9 (First 10 days)
  {
    id: 'dhul-hijjah',
    nameAr: 'عشر ذي الحجة 🕋',
    nameEn: 'First 10 Days of Dhul Hijjah',
    emoji: '🕋',
    hijriMonth: 12,
    hijriDayStart: 1,
    hijriDayEnd: 9,
    gradient: 'from-amber-800 via-orange-900 to-red-900',
    message: 'ما من أيام العمل الصالح فيها أحب إلى الله من هذه الأيام',
    duaAr: 'اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ لَا إِلَٰهَ إِلَّا اللَّهُ',
    colors: { primary: '#D97706', secondary: '#B45309', accent: '#FBBF24' },
  },
  // Day of Arafah
  {
    id: 'arafah',
    nameAr: 'يوم عرفة 🤲',
    nameEn: 'Day of Arafah',
    emoji: '🤲',
    hijriMonth: 12,
    hijriDayStart: 9,
    hijriDayEnd: 9,
    gradient: 'from-sky-900 via-blue-900 to-indigo-900',
    message: 'صيام يوم عرفة يكفّر السنة التي قبله والسنة التي بعده',
    duaAr: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    colors: { primary: '#0284C7', secondary: '#0369A1', accent: '#38BDF8' },
  },
  // Eid al-Adha - Month 12, Days 10-13
  {
    id: 'eid-adha',
    nameAr: 'عيد الأضحى المبارك 🐑',
    nameEn: 'Eid al-Adha',
    emoji: '🐑',
    hijriMonth: 12,
    hijriDayStart: 10,
    hijriDayEnd: 13,
    gradient: 'from-emerald-900 via-teal-900 to-green-900',
    message: 'عيدكم مبارك، تقبل الله منا ومنكم',
    duaAr: 'اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ لَا إِلَٰهَ إِلَّا اللَّهُ',
    takbirat: true,
    colors: { primary: '#059669', secondary: '#047857', accent: '#6EE7B7' },
  },
  // Islamic New Year - Muharram 1
  {
    id: 'hijri-new-year',
    nameAr: 'رأس السنة الهجرية 🕌',
    nameEn: 'Islamic New Year',
    emoji: '🕌',
    hijriMonth: 1,
    hijriDayStart: 1,
    hijriDayEnd: 1,
    gradient: 'from-teal-900 via-cyan-900 to-blue-900',
    message: 'كل عام وأنتم بخير، عام هجري مبارك',
    duaAr: 'اللَّهُمَّ أَدْخِلْهُ عَلَيْنَا بِالْأَمْنِ وَالْإِيمَانِ وَالسَّلَامَةِ وَالْإِسْلَامِ',
    colors: { primary: '#0D9488', secondary: '#0F766E', accent: '#2DD4BF' },
  },
  // Ashura - Muharram 10
  {
    id: 'ashura',
    nameAr: 'يوم عاشوراء',
    nameEn: 'Day of Ashura',
    emoji: '📿',
    hijriMonth: 1,
    hijriDayStart: 9,
    hijriDayEnd: 10,
    gradient: 'from-slate-800 via-gray-900 to-slate-900',
    message: 'صيام يوم عاشوراء يكفّر ذنوب سنة ماضية',
    duaAr: 'اللَّهُمَّ اغْفِرْ لِي ذُنُوبِي',
    colors: { primary: '#475569', secondary: '#334155', accent: '#94A3B8' },
  },
  // Mawlid al-Nabi - Rabi al-Awwal 12
  {
    id: 'mawlid',
    nameAr: 'المولد النبوي الشريف ﷺ',
    nameEn: 'Prophet\'s Birthday',
    emoji: '🕌',
    hijriMonth: 3,
    hijriDayStart: 12,
    hijriDayEnd: 12,
    gradient: 'from-green-800 via-emerald-900 to-teal-900',
    message: 'اللهم صل وسلم وبارك على نبينا محمد ﷺ',
    duaAr: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
    colors: { primary: '#059669', secondary: '#047857', accent: '#6EE7B7' },
  },
  // Isra and Mi'raj - Rajab 27
  {
    id: 'isra-miraj',
    nameAr: 'الإسراء والمعراج ✨',
    nameEn: 'Isra and Mi\'raj',
    emoji: '🌌',
    hijriMonth: 7,
    hijriDayStart: 27,
    hijriDayEnd: 27,
    gradient: 'from-indigo-900 via-violet-900 to-purple-900',
    message: 'سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا',
    duaAr: 'سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا مِنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى',
    colors: { primary: '#7C3AED', secondary: '#6D28D9', accent: '#A78BFA' },
  },
  // Shaban 15 - Night of Mid-Shaban
  {
    id: 'mid-shaban',
    nameAr: 'ليلة النصف من شعبان',
    nameEn: 'Night of Mid-Shaban',
    emoji: '🌕',
    hijriMonth: 8,
    hijriDayStart: 15,
    hijriDayEnd: 15,
    gradient: 'from-blue-900 via-indigo-900 to-slate-900',
    message: 'اللهم بارك لنا في شعبان وبلغنا رمضان',
    duaAr: 'اللَّهُمَّ بَارِكْ لَنَا فِي شَعْبَانَ وَبَلِّغْنَا رَمَضَانَ',
    colors: { primary: '#3B82F6', secondary: '#2563EB', accent: '#60A5FA' },
  },
];

/**
 * Get current Islamic occasion based on Hijri date
 */
export function getCurrentOccasion(hijriMonth: number, hijriDay: number): IslamicOccasion | null {
  const day = parseInt(String(hijriDay));
  const month = parseInt(String(hijriMonth));

  // Guard: don't return occasions when hijri data hasn't loaded
  if (isNaN(day) || isNaN(month) || month === 0 || day === 0) return null;

  // Special handling for Ramadan: always return the Ramadan occasion
  // (laylat-al-qadr is a subset, not a separate display occasion)
  if (month === 9) {
    const ramadan = ISLAMIC_OCCASIONS.find(o => o.id === 'ramadan');
    if (ramadan && day >= 1 && day <= 30) {
      if (day >= 21) {
        // Last 10 nights — update message but keep Ramadan occasion
        return {
          ...ramadan,
          message: 'العشر الأواخر من رمضان - اللهم إنك عفو تحب العفو فاعف عنا',
        };
      }
      return ramadan;
    }
  }

  // For all other occasions (skip ramadan & laylat-al-qadr in the loop)
  for (const occasion of ISLAMIC_OCCASIONS) {
    if (occasion.id === 'ramadan' || occasion.id === 'laylat-al-qadr') continue;
    if (occasion.hijriMonth === month && day >= occasion.hijriDayStart && day <= occasion.hijriDayEnd) {
      return occasion;
    }
  }
  return null;
}

/**
 * Check if we're in Ramadan
 */
export function isRamadan(hijriMonth: number): boolean {
  return parseInt(String(hijriMonth)) === 9;
}

/**
 * Get all upcoming occasions
 */
export function getUpcomingOccasions(hijriMonth: number, hijriDay: number): IslamicOccasion[] {
  const month = parseInt(String(hijriMonth));
  const day = parseInt(String(hijriDay));
  
  return ISLAMIC_OCCASIONS.filter(o => {
    if (o.hijriMonth > month) return true;
    if (o.hijriMonth === month && o.hijriDayStart > day) return true;
    return false;
  }).sort((a, b) => {
    if (a.hijriMonth !== b.hijriMonth) return a.hijriMonth - b.hijriMonth;
    return a.hijriDayStart - b.hijriDayStart;
  });
}
