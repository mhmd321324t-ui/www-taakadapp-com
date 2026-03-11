export interface DhikrDetail {
  key: string;
  title: string;
  arabic: string;
  transliteration: string;
  target: number;
  category: 'dhikr' | 'quran' | 'general';
}

export const dhikrDetails: DhikrDetail[] = [
  {
    key: 'strengthen_faith',
    title: 'قوّي إيمانك',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'Subhan Allah wa bihamdihi',
    target: 7,
    category: 'dhikr',
  },
  {
    key: 'quran_reward',
    title: 'ثواب ثلث القرآن',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    transliteration: 'Qul huwa Allahu ahad, Allahu as-Samad, lam yalid wa lam yulad, wa lam yakun lahu kufuwan ahad',
    target: 3,
    category: 'quran',
  },
  {
    key: 'repentance',
    title: 'للتوبة والمغفرة',
    arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
    transliteration: 'Astaghfirullaha al-Azeem alladhi la ilaha illa huwa al-Hayyu al-Qayyum wa atubu ilayh',
    target: 11,
    category: 'dhikr',
  },
];

export const dailyDuas = [
  {
    title: 'آية الكرسي',
    subtitle: 'للحفظ والحماية',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: 'Allahu la ilaha illa huwa al-Hayyu al-Qayyum...',
    reference: 'البقرة 255',
  },
  {
    title: 'دعاء الهم والحزن',
    subtitle: 'لإزالة الهم',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحُزْنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',
    transliteration: 'Allahumma inni a\'udhu bika minal-hammi wal-hazan...',
    reference: 'البخاري',
  },
  {
    title: 'سيد الاستغفار',
    subtitle: 'أفضل صيغ الاستغفار',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration: 'Allahumma anta Rabbi la ilaha illa anta...',
    reference: 'البخاري',
  },
  {
    title: 'دعاء الرزق',
    subtitle: 'لطلب الرزق والبركة',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    transliteration: 'Allahumma inni as\'aluka ilman nafi\'an...',
    reference: 'ابن ماجه',
  },
  {
    title: 'دعاء دخول المسجد',
    subtitle: 'عند الذهاب للصلاة',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    transliteration: 'Allahumma iftah li abwaba rahmatik',
    reference: 'مسلم',
  },
  {
    title: 'التوكل على الله',
    subtitle: 'عند الخروج من المنزل',
    arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'Bismillah, tawakkaltu ala Allah...',
    reference: 'أبو داود',
  },
  {
    title: 'دعاء الشفاء',
    subtitle: 'للمريض',
    arabic: 'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأسَ اشْفِهِ وَأَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا',
    transliteration: 'Allahumma Rabba an-nas, adhibil-ba\'s...',
    reference: 'البخاري ومسلم',
  },
];
