export interface DhikrPreset {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  target: number;
}

export const dhikrPresets: DhikrPreset[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'Subhanallah',
    translation: 'Glory be to Allah',
    target: 33,
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'Praise be to Allah',
    target: 33,
  },
  {
    id: 'allahuakbar',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    target: 33,
  },
  {
    id: 'lailahaillallah',
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    transliteration: 'La ilaha illallah',
    translation: 'There is no deity except Allah',
    target: 100,
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
    target: 100,
  },
];

export const ramadanDuas: { day: number; arabic: string; translation: string }[] = [
  { day: 1, arabic: "اللَّهُمَّ اجْعَلْ صِيَامِي فِيهِ صِيَامَ الصَّائِمِينَ", translation: "O Allah, make my fasting in it the fasting of those who truly fast." },
  { day: 2, arabic: "اللَّهُمَّ قَرِّبْنِي فِيهِ إِلَى مَرْضَاتِكَ", translation: "O Allah, bring me closer to Your pleasure in it." },
  { day: 3, arabic: "اللَّهُمَّ ارْزُقْنِي فِيهِ الذِّهْنَ وَالتَّنْبِيهَ", translation: "O Allah, grant me awareness and alertness in it." },
  { day: 4, arabic: "اللَّهُمَّ قَوِّنِي فِيهِ عَلَى إِقَامَةِ أَمْرِكَ", translation: "O Allah, strengthen me in it to establish Your commands." },
  { day: 5, arabic: "اللَّهُمَّ اجْعَلْنِي فِيهِ مِنَ الْمُسْتَغْفِرِينَ", translation: "O Allah, make me among those who seek forgiveness in it." },
  { day: 6, arabic: "اللَّهُمَّ لَا تَخْذُلْنِي فِيهِ لِتَعَرُّضِ مَعْصِيَتِكَ", translation: "O Allah, do not forsake me in it for committing disobedience to You." },
  { day: 7, arabic: "اللَّهُمَّ أَعِنِّي فِيهِ عَلَى صِيَامِهِ وَقِيَامِهِ", translation: "O Allah, help me in it to fast and pray." },
  { day: 8, arabic: "اللَّهُمَّ ارْزُقْنِي فِيهِ رَحْمَةَ الْأَيْتَامِ", translation: "O Allah, grant me in it mercy towards orphans." },
  { day: 9, arabic: "اللَّهُمَّ اجْعَلْ لِي فِيهِ نَصِيبًا مِنْ رَحْمَتِكَ", translation: "O Allah, grant me a share of Your mercy in it." },
  { day: 10, arabic: "اللَّهُمَّ اجْعَلْنِي فِيهِ مِنَ الْمُتَوَكِّلِينَ عَلَيْكَ", translation: "O Allah, make me among those who rely on You in it." },
  { day: 11, arabic: "اللَّهُمَّ حَبِّبْ إِلَيَّ فِيهِ الْإِحْسَانَ", translation: "O Allah, make me love doing good in it." },
  { day: 12, arabic: "اللَّهُمَّ زَيِّنِّي فِيهِ بِالسِّتْرِ وَالْعَفَافِ", translation: "O Allah, adorn me in it with modesty and chastity." },
  { day: 13, arabic: "اللَّهُمَّ طَهِّرْنِي فِيهِ مِنَ الدَّنَسِ", translation: "O Allah, purify me in it from impurity." },
  { day: 14, arabic: "اللَّهُمَّ لَا تُؤَاخِذْنِي فِيهِ بِالْعَثَرَاتِ", translation: "O Allah, do not take me to task in it for my slips." },
  { day: 15, arabic: "اللَّهُمَّ ارْزُقْنِي فِيهِ طَاعَةَ الْخَاشِعِينَ", translation: "O Allah, grant me in it the obedience of the humble." },
  { day: 16, arabic: "اللَّهُمَّ وَفِّقْنِي فِيهِ لِمُوَافَقَةِ الْأَبْرَارِ", translation: "O Allah, guide me in it to the company of the righteous." },
  { day: 17, arabic: "اللَّهُمَّ اهْدِنِي فِيهِ لِصَالِحِ الْأَعْمَالِ", translation: "O Allah, guide me in it to righteous deeds." },
  { day: 18, arabic: "اللَّهُمَّ نَبِّهْنِي فِيهِ لِبَرَكَاتِ أَسْحَارِهِ", translation: "O Allah, awaken me in it to the blessings of its dawns." },
  { day: 19, arabic: "اللَّهُمَّ وَفِّرْ حَظِّي فِيهِ مِنْ بَرَكَاتِهِ", translation: "O Allah, increase my share in it of its blessings." },
  { day: 20, arabic: "اللَّهُمَّ افْتَحْ لِي فِيهِ أَبْوَابَ الْجِنَانِ", translation: "O Allah, open for me in it the gates of Paradise." },
  { day: 21, arabic: "اللَّهُمَّ اجْعَلْ لِي فِيهِ إِلَى مَرْضَاتِكَ دَلِيلًا", translation: "O Allah, make for me in it a guide to Your pleasure." },
  { day: 22, arabic: "اللَّهُمَّ افْتَحْ لِي فِيهِ أَبْوَابَ فَضْلِكَ", translation: "O Allah, open for me in it the doors of Your bounty." },
  { day: 23, arabic: "اللَّهُمَّ اغْسِلْنِي فِيهِ مِنَ الذُّنُوبِ", translation: "O Allah, wash me in it from sins." },
  { day: 24, arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ فِيهِ مَا يُرْضِيكَ", translation: "O Allah, I ask You in it for what pleases You." },
  { day: 25, arabic: "اللَّهُمَّ اجْعَلْنِي فِيهِ مُحِبًّا لِأَوْلِيَائِكَ", translation: "O Allah, make me in it a lover of Your friends." },
  { day: 26, arabic: "اللَّهُمَّ اجْعَلْ سَعْيِي فِيهِ مَشْكُورًا", translation: "O Allah, make my effort in it appreciated." },
  { day: 27, arabic: "اللَّهُمَّ ارْزُقْنِي فِيهِ فَضْلَ لَيْلَةِ الْقَدْرِ", translation: "O Allah, grant me in it the merit of the Night of Power." },
  { day: 28, arabic: "اللَّهُمَّ وَفِّرْ حَظِّي فِيهِ مِنَ النَّوَافِلِ", translation: "O Allah, increase my share in it of voluntary prayers." },
  { day: 29, arabic: "اللَّهُمَّ غَشِّنِي فِيهِ بِالرَّحْمَةِ", translation: "O Allah, cover me in it with mercy." },
  { day: 30, arabic: "اللَّهُمَّ اجْعَلْ صِيَامِي فِيهِ بِالشُّكْرِ وَالْقَبُولِ", translation: "O Allah, make my fasting in it one of gratitude and acceptance." },
];
