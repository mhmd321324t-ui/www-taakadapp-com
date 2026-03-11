export interface Dua {
  arabic: string;
  translationKey: string;
  count: number;
  reference?: string;
}

export interface DuaSubCategory {
  labelKey: string;
  emoji?: string;
  duas: Dua[];
}

export interface DuaCategory {
  labelKey: string;
  subCategories: DuaSubCategory[];
}

export const duasData: Record<string, DuaCategory> = {
  // ===== يومي =====
  sleep: {
    labelKey: 'duaCatSleep',
    subCategories: [
      {
        labelKey: 'duaSubBeforeSleep',
        emoji: '🌙',
        duas: [
          { arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', translationKey: 'duaSleep1', count: 1, reference: 'البخاري' },
          { arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', translationKey: 'duaSleep2', count: 3, reference: 'أبو داود' },
          { arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ', translationKey: 'duaSleep3', count: 1, reference: 'البخاري ومسلم' },
          { arabic: 'اللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ', translationKey: 'duaSleep4', count: 1, reference: 'مسلم' },
          { arabic: 'اللَّهُمَّ رَبَّ السَّمَاوَاتِ وَرَبَّ الْأَرْضِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَى، وَمُنْزِلَ التَّوْرَاةِ وَالْإِنْجِيلِ وَالْفُرْقَانِ، أَعُوذُ بِكَ مِنْ شَرِّ كُلِّ شَيْءٍ أَنْتَ آخِذٌ بِنَاصِيَتِهِ', translationKey: 'duaSleep5', count: 1, reference: 'مسلم' },
          { arabic: 'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ', translationKey: 'duaSleepBefore6', count: 1, reference: 'البخاري ومسلم' },
        ],
      },
      {
        labelKey: 'duaSubAfterWakeUp',
        emoji: '☀️',
        duas: [
          { arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَمَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', translationKey: 'duaWakeUp1', count: 1, reference: 'البخاري' },
          { arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ', translationKey: 'duaWakeUp2', count: 1, reference: 'البخاري' },
        ],
      },
      {
        labelKey: 'duaSubNightmare',
        emoji: '😰',
        duas: [
          { arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ غَضَبِهِ وَعِقَابِهِ وَشَرِّ عِبَادِهِ وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ', translationKey: 'duaNightmare1', count: 1, reference: 'أبو داود' },
          { arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', translationKey: 'duaNightmare2', count: 3, reference: 'مسلم' },
        ],
      },
    ],
  },

  wudu: {
    labelKey: 'duaCatWudu',
    subCategories: [
      {
        labelKey: 'duaSubBeforeWudu',
        emoji: '💧',
        duas: [
          { arabic: 'بِسْمِ اللَّهِ', translationKey: 'duaWudu1', count: 1 },
        ],
      },
      {
        labelKey: 'duaSubAfterWudu',
        emoji: '✨',
        duas: [
          { arabic: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ', translationKey: 'duaWudu2', count: 1, reference: 'مسلم' },
          { arabic: 'اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ', translationKey: 'duaWudu3', count: 1, reference: 'الترمذي' },
          { arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ', translationKey: 'duaWudu4', count: 1, reference: 'النسائي' },
        ],
      },
    ],
  },

  mosque: {
    labelKey: 'duaCatMosque',
    subCategories: [
      {
        labelKey: 'duaSubEnteringMosque',
        emoji: '🚪',
        duas: [
          { arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', translationKey: 'duaMosque1', count: 1, reference: 'مسلم' },
          { arabic: 'أَعُوذُ بِاللَّهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ', translationKey: 'duaMosque2', count: 1, reference: 'أبو داود' },
          { arabic: 'بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ اغْفِرْ لِي ذُنُوبِي، وَافْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', translationKey: 'duaMosque3', count: 1, reference: 'ابن ماجه' },
        ],
      },
      {
        labelKey: 'duaSubLeavingMosque',
        emoji: '🚶',
        duas: [
          { arabic: 'بِسْمِ اللَّهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ', translationKey: 'duaMosqueLeave1', count: 1, reference: 'مسلم' },
          { arabic: 'اللَّهُمَّ اعْصِمْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ', translationKey: 'duaMosqueLeave2', count: 1, reference: 'ابن ماجه' },
        ],
      },
    ],
  },

  salah: {
    labelKey: 'duaCatSalah',
    subCategories: [
      {
        labelKey: 'duaSubOpeningSalah',
        emoji: '🕋',
        duas: [
          { arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ', translationKey: 'duaSalah1', count: 1, reference: 'أبو داود' },
        ],
      },
      {
        labelKey: 'duaSubDuringSalah',
        emoji: '🤲',
        duas: [
          { arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', translationKey: 'duaSalah2', count: 1, reference: 'القرآن 2:201' },
          { arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، وَمِنْ عَذَابِ جَهَنَّمَ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ', translationKey: 'duaSalah3', count: 1, reference: 'البخاري ومسلم' },
        ],
      },
      {
        labelKey: 'duaSubAfterSalah',
        emoji: '✅',
        duas: [
          { arabic: 'أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ', translationKey: 'duaAfterPrayer1', count: 3, reference: 'مسلم' },
          { arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ', translationKey: 'duaAfterPrayer2', count: 1, reference: 'مسلم' },
          { arabic: 'سُبْحَانَ اللَّهِ (٣٣) وَالْحَمْدُ لِلَّهِ (٣٣) وَاللَّهُ أَكْبَرُ (٣٣)', translationKey: 'duaAfterPrayer3', count: 33, reference: 'مسلم' },
          { arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', translationKey: 'duaAfterPrayer4', count: 1, reference: 'مسلم' },
          { arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', translationKey: 'duaAfterPrayer5', count: 1, reference: 'أبو داود' },
          { arabic: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلاةِ وَمِنْ ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ', translationKey: 'duaSalah4', count: 1, reference: 'القرآن 14:40' },
        ],
      },
    ],
  },

  home: {
    labelKey: 'duaCatHome',
    subCategories: [
      {
        labelKey: 'duaSubEnteringHome',
        emoji: '🏠',
        duas: [
          { arabic: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا', translationKey: 'duaHome1', count: 1, reference: 'أبو داود' },
        ],
      },
      {
        labelKey: 'duaSubLeavingHome',
        emoji: '🚶',
        duas: [
          { arabic: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', translationKey: 'duaHomeLeave1', count: 1, reference: 'أبو داود والترمذي' },
          { arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ أَوْ أُضَلَّ، أَوْ أَزِلَّ أَوْ أُزَلَّ، أَوْ أَظْلِمَ أَوْ أُظْلَمَ، أَوْ أَجْهَلَ أَوْ يُجْهَلَ عَلَيَّ', translationKey: 'duaHomeLeave2', count: 1, reference: 'أبو داود والترمذي' },
        ],
      },
    ],
  },

  clothes: {
    labelKey: 'duaCatClothes',
    subCategories: [
      {
        labelKey: 'duaSubWearingNew',
        emoji: '👔',
        duas: [
          { arabic: 'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا الثَّوْبَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', translationKey: 'duaClothes1', count: 1, reference: 'أبو داود والترمذي' },
          { arabic: 'اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ، أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ', translationKey: 'duaClothes2', count: 1, reference: 'أبو داود والترمذي' },
        ],
      },
      {
        labelKey: 'duaSubRemovingClothes',
        emoji: '🧥',
        duas: [
          { arabic: 'بِسْمِ اللَّهِ', translationKey: 'duaClothesRemove1', count: 1, reference: 'الترمذي' },
        ],
      },
      {
        labelKey: 'duaSubSeeingSomeoneNew',
        emoji: '😊',
        duas: [
          { arabic: 'تُبْلِي وَيُخْلِفُ اللَّهُ تَعَالَى', translationKey: 'duaClothesSee1', count: 1, reference: 'أبو داود' },
          { arabic: 'الْبَسْ جَدِيدًا وَعِشْ حَمِيدًا وَمُتْ شَهِيدًا', translationKey: 'duaClothesSee2', count: 1, reference: 'ابن ماجه' },
        ],
      },
    ],
  },

  travel: {
    labelKey: 'duaCatTravel',
    subCategories: [
      {
        labelKey: 'duaSubStartTravel',
        emoji: '✈️',
        duas: [
          { arabic: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ', translationKey: 'duaTravel1', count: 1, reference: 'مسلم' },
          { arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى', translationKey: 'duaTravel2', count: 1, reference: 'مسلم' },
          { arabic: 'اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ', translationKey: 'duaTravel3', count: 1, reference: 'مسلم' },
        ],
      },
      {
        labelKey: 'duaSubReturnTravel',
        emoji: '🏡',
        duas: [
          { arabic: 'آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ', translationKey: 'duaTravelReturn1', count: 1, reference: 'مسلم' },
          { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ', translationKey: 'duaTravelReturn2', count: 1, reference: 'أبو داود' },
        ],
      },
      {
        labelKey: 'duaSubRidingVehicle',
        emoji: '🚗',
        duas: [
          { arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ', translationKey: 'duaVehicle1', count: 1, reference: 'القرآن 43:13-14' },
          { arabic: 'بِسْمِ اللَّهِ، الْحَمْدُ لِلَّهِ', translationKey: 'duaVehicle2', count: 1, reference: 'أبو داود' },
        ],
      },
    ],
  },

  food: {
    labelKey: 'duaCatFood',
    subCategories: [
      {
        labelKey: 'duaSubBeforeEating',
        emoji: '🍽️',
        duas: [
          { arabic: 'بِسْمِ اللَّهِ', translationKey: 'duaFood1', count: 1 },
          { arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ', translationKey: 'duaFoodBefore2', count: 1, reference: 'ابن السني' },
          { arabic: 'بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ', translationKey: 'duaFoodBefore3', count: 1, reference: 'أبو داود - إذا نسي التسمية' },
        ],
      },
      {
        labelKey: 'duaSubAfterEating',
        emoji: '🤲',
        duas: [
          { arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', translationKey: 'duaFood2', count: 1, reference: 'أبو داود والترمذي' },
          { arabic: 'الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ، غَيْرَ مَكْفِيٍّ وَلَا مُوَدَّعٍ وَلَا مُسْتَغْنًى عَنْهُ رَبَّنَا', translationKey: 'duaFood4', count: 1, reference: 'البخاري' },
        ],
      },
      {
        labelKey: 'duaSubDrinking',
        emoji: '🥛',
        duas: [
          { arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَأَطْعِمْنَا خَيْرًا مِنْهُ', translationKey: 'duaFood3', count: 1, reference: 'الترمذي - عند شرب اللبن' },
          { arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَزِدْنَا مِنْهُ', translationKey: 'duaDrink1', count: 1, reference: 'الترمذي' },
        ],
      },
      {
        labelKey: 'duaSubGuestFood',
        emoji: '🏠',
        duas: [
          { arabic: 'اللَّهُمَّ بَارِكْ لَهُمْ فِيمَا رَزَقْتَهُمْ، وَاغْفِرْ لَهُمْ وَارْحَمْهُمْ', translationKey: 'duaGuestFood1', count: 1, reference: 'مسلم' },
          { arabic: 'أَفْطَرَ عِنْدَكُمُ الصَّائِمُونَ، وَأَكَلَ طَعَامَكُمُ الْأَبْرَارُ، وَصَلَّتْ عَلَيْكُمُ الْمَلَائِكَةُ', translationKey: 'duaGuestFood2', count: 1, reference: 'أبو داود' },
        ],
      },
    ],
  },

  // ===== أذكار =====
  'daily-dhikr': {
    labelKey: 'duaCatDailyDhikr',
    subCategories: [
      {
        labelKey: 'duaSubMorningAdhkar',
        emoji: '🌅',
        duas: [
          { arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', translationKey: 'duaRevival1', count: 1, reference: 'مسلم' },
          { arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ', translationKey: 'duaRevival2', count: 1, reference: 'الترمذي' },
          { arabic: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ', translationKey: 'duaRevival3', count: 1, reference: 'أبو داود' },
          { arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', translationKey: 'duaRevival4', count: 3, reference: 'مسلم' },
          { arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ', translationKey: 'duaMorning1', count: 3, reference: 'أبو داود' },
        ],
      },
      {
        labelKey: 'duaSubEveningAdhkar',
        emoji: '🌙',
        duas: [
          { arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', translationKey: 'duaEvening1', count: 1, reference: 'مسلم' },
          { arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ', translationKey: 'duaEvening2', count: 1, reference: 'الترمذي' },
          { arabic: 'اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ', translationKey: 'duaEvening3', count: 1, reference: 'أبو داود' },
        ],
      },
      {
        labelKey: 'duaSubGeneralDhikr',
        emoji: '📿',
        duas: [
          { arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', translationKey: 'duaDhikr1', count: 100, reference: 'مسلم' },
          { arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', translationKey: 'duaDhikr2', count: 10, reference: 'البخاري ومسلم' },
          { arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ', translationKey: 'duaDhikr3', count: 33, reference: 'البخاري ومسلم' },
          { arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', translationKey: 'duaDhikr4', count: 33, reference: 'البخاري ومسلم' },
          { arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', translationKey: 'duaDhikr5', count: 100, reference: 'البخاري ومسلم' },
        ],
      },
    ],
  },

  'daily-revival': {
    labelKey: 'duaCatDailyRevival',
    subCategories: [
      {
        labelKey: 'duaSubProtectionAdhkar',
        emoji: '🛡️',
        duas: [
          { arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', translationKey: 'duaProtection1', count: 3, reference: 'أبو داود والترمذي' },
          { arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', translationKey: 'duaRevival4', count: 3, reference: 'مسلم' },
          { arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ', translationKey: 'duaProtection2', count: 7, reference: 'أبو داود' },
        ],
      },
      {
        labelKey: 'duaSubSalawat',
        emoji: '💚',
        duas: [
          { arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', translationKey: 'duaSalawat1', count: 10, reference: 'مسلم' },
          { arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ', translationKey: 'duaSalawat2', count: 1, reference: 'البخاري ومسلم' },
        ],
      },
    ],
  },

  'after-prayer': {
    labelKey: 'duaCatAfterPrayer',
    subCategories: [
      {
        labelKey: 'duaSubImmediateAfter',
        emoji: '🤲',
        duas: [
          { arabic: 'أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ', translationKey: 'duaAfterPrayer1', count: 3, reference: 'مسلم' },
          { arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ', translationKey: 'duaAfterPrayer2', count: 1, reference: 'مسلم' },
        ],
      },
      {
        labelKey: 'duaSubTasbeehAfter',
        emoji: '📿',
        duas: [
          { arabic: 'سُبْحَانَ اللَّهِ (٣٣) وَالْحَمْدُ لِلَّهِ (٣٣) وَاللَّهُ أَكْبَرُ (٣٣)', translationKey: 'duaAfterPrayer3', count: 33, reference: 'مسلم' },
          { arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', translationKey: 'duaAfterPrayer4', count: 1, reference: 'مسلم' },
          { arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', translationKey: 'duaAfterPrayer5', count: 1, reference: 'أبو داود' },
        ],
      },
    ],
  },

  rizq: {
    labelKey: 'duaCatRizq',
    subCategories: [
      {
        labelKey: 'duaSubAskingRizq',
        emoji: '🍎',
        duas: [
          { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا', translationKey: 'duaRizq1', count: 1, reference: 'ابن ماجه' },
          { arabic: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ', translationKey: 'duaRizq2', count: 1, reference: 'الترمذي' },
          { arabic: 'اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، اقْضِ عَنِّي الدَّيْنَ وَأَغْنِنِي مِنَ الْفَقْرِ', translationKey: 'duaRizq3', count: 1, reference: 'الطبراني' },
        ],
      },
    ],
  },

  knowledge: {
    labelKey: 'duaCatKnowledge',
    subCategories: [
      {
        labelKey: 'duaSubSeekingKnowledge',
        emoji: '📖',
        duas: [
          { arabic: 'رَبِّ زِدْنِي عِلْمًا', translationKey: 'duaKnowledge1', count: 1, reference: 'القرآن 20:114' },
          { arabic: 'اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي، وَعَلِّمْنِي مَا يَنْفَعُنِي، وَزِدْنِي عِلْمًا', translationKey: 'duaKnowledge2', count: 1, reference: 'الترمذي' },
          { arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عِلْمٍ لَا يَنْفَعُ، وَمِنْ قَلْبٍ لَا يَخْشَعُ، وَمِنْ نَفْسٍ لَا تَشْبَعُ، وَمِنْ دَعْوَةٍ لَا يُسْتَجَابُ لَهَا', translationKey: 'duaKnowledge3', count: 1, reference: 'مسلم' },
        ],
      },
      {
        labelKey: 'duaSubBeforeExam',
        emoji: '📝',
        duas: [
          { arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي', translationKey: 'duaExam1', count: 1, reference: 'القرآن 20:25-28' },
          { arabic: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا', translationKey: 'duaExam2', count: 1, reference: 'ابن حبان' },
        ],
      },
    ],
  },

  faith: {
    labelKey: 'duaCatFaith',
    subCategories: [
      {
        labelKey: 'duaSubStrengtheningFaith',
        emoji: '🕌',
        duas: [
          { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى', translationKey: 'duaFaith1', count: 1, reference: 'مسلم' },
          { arabic: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ', translationKey: 'duaFaith2', count: 1, reference: 'الترمذي' },
          { arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ', translationKey: 'duaFaith3', count: 1, reference: 'القرآن 3:8' },
        ],
      },
    ],
  },

  judgment: {
    labelKey: 'duaCatJudgment',
    subCategories: [
      {
        labelKey: 'duaSubProtectionHereafter',
        emoji: '⚖️',
        duas: [
          { arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، وَأَعُوذُ بِكَ مِنْ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ', translationKey: 'duaJudgment1', count: 1, reference: 'البخاري ومسلم' },
          { arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', translationKey: 'duaJudgment2', count: 1, reference: 'القرآن 2:201' },
          { arabic: 'اللَّهُمَّ أَجِرْنِي مِنَ النَّارِ', translationKey: 'duaJudgment3', count: 7, reference: 'أبو داود' },
        ],
      },
    ],
  },

  forgiveness: {
    labelKey: 'duaCatForgiveness',
    subCategories: [
      {
        labelKey: 'duaSubSeekingForgiveness',
        emoji: '💚',
        duas: [
          { arabic: 'أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ', translationKey: 'duaForgiveness1', count: 3, reference: 'أبو داود والترمذي' },
          { arabic: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ', translationKey: 'duaForgiveness2', count: 1, reference: 'أبو داود' },
          { arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ', translationKey: 'duaForgiveness3', count: 1, reference: 'البخاري - سيد الاستغفار' },
        ],
      },
    ],
  },

  praising: {
    labelKey: 'duaCatPraising',
    subCategories: [
      {
        labelKey: 'duaSubPraisingAllah',
        emoji: '🤲',
        duas: [
          { arabic: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ', translationKey: 'duaPraising1', count: 33, reference: 'مسلم' },
          { arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ', translationKey: 'duaPraising2', count: 1, reference: 'مسلم' },
          { arabic: 'سُبْحَانَ اللَّهِ عَدَدَ خَلْقِهِ، سُبْحَانَ اللَّهِ رِضَا نَفْسِهِ، سُبْحَانَ اللَّهِ زِنَةَ عَرْشِهِ، سُبْحَانَ اللَّهِ مِدَادَ كَلِمَاتِهِ', translationKey: 'duaPraising3', count: 3, reference: 'مسلم' },
        ],
      },
    ],
  },

  // ===== أخرى =====
  family: {
    labelKey: 'duaCatFamily',
    subCategories: [
      {
        labelKey: 'duaSubForChildren',
        emoji: '👶',
        duas: [
          { arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا', translationKey: 'duaFamily1', count: 1, reference: 'القرآن 25:74' },
          { arabic: 'رَبِّ هَبْ لِي مِنَ الصَّالِحِينَ', translationKey: 'duaFamily2', count: 1, reference: 'القرآن 37:100' },
        ],
      },
      {
        labelKey: 'duaSubForParents',
        emoji: '👨‍👩‍👧',
        duas: [
          { arabic: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلاةِ وَمِنْ ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ', translationKey: 'duaFamily3', count: 1, reference: 'القرآن 14:40' },
          { arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', translationKey: 'duaParents1', count: 1, reference: 'القرآن 17:24' },
          { arabic: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ', translationKey: 'duaParents2', count: 1, reference: 'القرآن 14:41' },
        ],
      },
      {
        labelKey: 'duaSubForSpouse',
        emoji: '💍',
        duas: [
          { arabic: 'اللَّهُمَّ بَارِكْ لَهُمَا وَبَارِكْ عَلَيْهِمَا وَاجْمَعْ بَيْنَهُمَا فِي خَيْرٍ', translationKey: 'duaSpouse1', count: 1, reference: 'أبو داود والترمذي' },
        ],
      },
    ],
  },

  health: {
    labelKey: 'duaCatHealth',
    subCategories: [
      {
        labelKey: 'duaSubWhenSick',
        emoji: '🤒',
        duas: [
          { arabic: 'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا', translationKey: 'duaHealth1', count: 3, reference: 'البخاري ومسلم' },
          { arabic: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ', translationKey: 'duaHealth2', count: 7, reference: 'أبو داود والترمذي' },
        ],
      },
      {
        labelKey: 'duaSubVisitingSick',
        emoji: '🏥',
        duas: [
          { arabic: 'لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ', translationKey: 'duaVisitSick1', count: 1, reference: 'البخاري' },
          { arabic: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ', translationKey: 'duaHealth2', count: 7, reference: 'أبو داود والترمذي' },
        ],
      },
      {
        labelKey: 'duaSubRuqyah',
        emoji: '🛡️',
        duas: [
          { arabic: 'بِسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ اللَّهُ يَشْفِيكَ', translationKey: 'duaHealth3', count: 3, reference: 'مسلم' },
          { arabic: 'بِسْمِ اللَّهِ (ثلاثًا) أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ', translationKey: 'duaRuqyah1', count: 7, reference: 'مسلم' },
        ],
      },
    ],
  },

  loss: {
    labelKey: 'duaCatLoss',
    subCategories: [
      {
        labelKey: 'duaSubWhenAfflicted',
        emoji: '😢',
        duas: [
          { arabic: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا', translationKey: 'duaLoss1', count: 1, reference: 'مسلم' },
          { arabic: 'قَدَرُ اللَّهِ وَمَا شَاءَ فَعَلَ', translationKey: 'duaLoss2', count: 1, reference: 'مسلم' },
          { arabic: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا', translationKey: 'duaLoss3', count: 1, reference: 'ابن حبان' },
        ],
      },
    ],
  },

  sadness: {
    labelKey: 'duaCatSadness',
    subCategories: [
      {
        labelKey: 'duaSubAnxietyRelief',
        emoji: '😔',
        duas: [
          { arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ', translationKey: 'duaSadness1', count: 1, reference: 'البخاري' },
          { arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ', translationKey: 'duaSadness2', count: 1, reference: 'القرآن 21:87' },
          { arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', translationKey: 'duaSadness3', count: 7, reference: 'البخاري' },
        ],
      },
      {
        labelKey: 'duaSubHappiness',
        emoji: '😊',
        duas: [
          { arabic: 'الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ', translationKey: 'duaHappy1', count: 1, reference: 'ابن ماجه' },
          { arabic: 'اللَّهُمَّ لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ وَعَظِيمِ سُلْطَانِكَ', translationKey: 'duaHappy2', count: 1, reference: 'ابن ماجه' },
        ],
      },
    ],
  },

  patience: {
    labelKey: 'duaCatPatience',
    subCategories: [
      {
        labelKey: 'duaSubAskingPatience',
        emoji: '🏔️',
        duas: [
          { arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ', translationKey: 'duaPatience1', count: 1, reference: 'القرآن 2:250' },
          { arabic: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا', translationKey: 'duaPatience2', count: 1, reference: 'ابن حبان' },
        ],
      },
    ],
  },

  debt: {
    labelKey: 'duaCatDebt',
    subCategories: [
      {
        labelKey: 'duaSubPayingDebt',
        emoji: '💰',
        duas: [
          { arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْمَأْثَمِ وَالْمَغْرَمِ', translationKey: 'duaDebt1', count: 1, reference: 'البخاري ومسلم' },
          { arabic: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ', translationKey: 'duaDebt2', count: 1, reference: 'الترمذي' },
        ],
      },
    ],
  },

  menstruation: {
    labelKey: 'duaCatMenstruation',
    subCategories: [
      {
        labelKey: 'duaSubDhikrDuringPeriod',
        emoji: '🤲',
        duas: [
          { arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', translationKey: 'duaMens1', count: 100, reference: 'مسلم' },
          { arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', translationKey: 'duaMens2', count: 100, reference: 'البخاري ومسلم' },
          { arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', translationKey: 'duaMens3', count: 10 },
        ],
      },
    ],
  },

  // ===== متقطع =====
  deceased: {
    labelKey: 'duaCatDeceased',
    subCategories: [
      {
        labelKey: 'duaSubFuneralPrayer',
        emoji: '🕌',
        duas: [
          { arabic: 'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ وَوَسِّعْ مُدْخَلَهُ', translationKey: 'duaDeceased1', count: 1, reference: 'مسلم' },
          { arabic: 'اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا، وَشَاهِدِنَا وَغَائِبِنَا، وَصَغِيرِنَا وَكَبِيرِنَا، وَذَكَرِنَا وَأُنْثَانَا', translationKey: 'duaDeceased2', count: 1, reference: 'أبو داود' },
        ],
      },
      {
        labelKey: 'duaSubCondolences',
        emoji: '🤝',
        duas: [
          { arabic: 'إِنَّ لِلَّهِ مَا أَخَذَ وَلَهُ مَا أَعْطَى، وَكُلُّ شَيْءٍ عِنْدَهُ بِأَجَلٍ مُسَمًّى، فَلْتَصْبِرْ وَلْتَحْتَسِبْ', translationKey: 'duaCondolence1', count: 1, reference: 'البخاري ومسلم' },
          { arabic: 'اللَّهُمَّ لَا تَحْرِمْنَا أَجْرَهُ وَلَا تَفْتِنَّا بَعْدَهُ، وَاغْفِرْ لَنَا وَلَهُ', translationKey: 'duaDeceased3', count: 1, reference: 'مسلم' },
        ],
      },
      {
        labelKey: 'duaSubVisitingGrave',
        emoji: '🪦',
        duas: [
          { arabic: 'السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لَاحِقُونَ، نَسْأَلُ اللَّهَ لَنَا وَلَكُمُ الْعَافِيَةَ', translationKey: 'duaGrave1', count: 1, reference: 'مسلم' },
        ],
      },
    ],
  },

  hajj: {
    labelKey: 'duaCatHajj',
    subCategories: [
      {
        labelKey: 'duaSubTalbiyah',
        emoji: '🕋',
        duas: [
          { arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ', translationKey: 'duaHajj1', count: 1, reference: 'البخاري ومسلم' },
        ],
      },
      {
        labelKey: 'duaSubTawaf',
        emoji: '🔄',
        duas: [
          { arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', translationKey: 'duaHajj2', count: 1, reference: 'القرآن 2:201' },
          { arabic: 'بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ', translationKey: 'duaHajj3', count: 1, reference: 'عند استلام الحجر الأسود' },
        ],
      },
      {
        labelKey: 'duaSubSaiBetween',
        emoji: '🏃',
        duas: [
          { arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ', translationKey: 'duaSai1', count: 1, reference: 'القرآن 2:158' },
          { arabic: 'نَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ', translationKey: 'duaSai2', count: 1, reference: 'مسلم' },
        ],
      },
      {
        labelKey: 'duaSubArafat',
        emoji: '🏔️',
        duas: [
          { arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', translationKey: 'duaArafat1', count: 1, reference: 'الترمذي' },
        ],
      },
    ],
  },

  ramadan: {
    labelKey: 'duaCatRamadan',
    subCategories: [
      {
        labelKey: 'duaSubSuhoor',
        emoji: '🌅',
        duas: [
          { arabic: 'نَوَيْتُ صَوْمَ غَدٍ مِنْ شَهْرِ رَمَضَانَ', translationKey: 'duaSuhoor1', count: 1 },
        ],
      },
      {
        labelKey: 'duaSubIftar',
        emoji: '🌙',
        duas: [
          { arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ', translationKey: 'duaRamadan2', count: 1, reference: 'أبو داود' },
          { arabic: 'اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ', translationKey: 'duaRamadan3', count: 1, reference: 'أبو داود' },
        ],
      },
      {
        labelKey: 'duaSubLaylatulQadr',
        emoji: '✨',
        duas: [
          { arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي', translationKey: 'duaRamadan1', count: 1, reference: 'الترمذي' },
        ],
      },
    ],
  },

  nature: {
    labelKey: 'duaCatNature',
    subCategories: [
      {
        labelKey: 'duaSubWhenRaining',
        emoji: '🌧️',
        duas: [
          { arabic: 'اللَّهُمَّ صَيِّبًا نَافِعًا', translationKey: 'duaNature1', count: 1, reference: 'البخاري' },
          { arabic: 'مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ', translationKey: 'duaRain1', count: 1, reference: 'البخاري ومسلم' },
        ],
      },
      {
        labelKey: 'duaSubThunderStorm',
        emoji: '⛈️',
        duas: [
          { arabic: 'سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ', translationKey: 'duaNature2', count: 1, reference: 'الموطأ' },
        ],
      },
      {
        labelKey: 'duaSubWhenWindy',
        emoji: '💨',
        duas: [
          { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا فِيهَا وَخَيْرَ مَا أُرْسِلَتْ بِهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا فِيهَا وَشَرِّ مَا أُرْسِلَتْ بِهِ', translationKey: 'duaNature3', count: 1, reference: 'مسلم' },
        ],
      },
    ],
  },

  goodManners: {
    labelKey: 'duaCatGoodManners',
    subCategories: [
      {
        labelKey: 'duaSubGoodCharacter',
        emoji: '🤝',
        duas: [
          { arabic: 'اللَّهُمَّ اهْدِنِي لِأَحْسَنِ الْأَخْلَاقِ لَا يَهْدِي لِأَحْسَنِهَا إِلَّا أَنْتَ، وَاصْرِفْ عَنِّي سَيِّئَهَا لَا يَصْرِفُ عَنِّي سَيِّئَهَا إِلَّا أَنْتَ', translationKey: 'duaManners1', count: 1, reference: 'مسلم' },
          { arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ مُنْكَرَاتِ الْأَخْلَاقِ وَالْأَعْمَالِ وَالْأَهْوَاءِ', translationKey: 'duaManners2', count: 1, reference: 'الترمذي' },
        ],
      },
    ],
  },

  guidance: {
    labelKey: 'duaCatGuidance',
    subCategories: [
      {
        labelKey: 'duaSubIstikhara',
        emoji: '🤲',
        duas: [
          { arabic: 'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ', translationKey: 'duaGuidance1', count: 1, reference: 'البخاري - صلاة الاستخارة' },
        ],
      },
      {
        labelKey: 'duaSubMakingDecision',
        emoji: '🪧',
        duas: [
          { arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', translationKey: 'duaGuidance2', count: 1, reference: 'القرآن 20:25-26' },
          { arabic: 'اللَّهُمَّ خِرْ لِي وَاخْتَرْ لِي', translationKey: 'duaGuidance3', count: 1, reference: 'الترمذي' },
        ],
      },
    ],
  },
};
