export type Language = 'en' | 'ar';

const translations = {
  // Bottom nav
  'nav.home': { en: 'Home', ar: 'الرئيسية' },
  'nav.quran': { en: 'Quran', ar: 'القرآن' },
  'nav.dhikr': { en: 'Dhikr', ar: 'الذكر' },
  'nav.tracker': { en: 'Tracker', ar: 'المتابعة' },
  'nav.more': { en: 'More', ar: 'المزيد' },

  // Home
  'home.dailyVerse': { en: 'Daily Verse', ar: 'الآية اليومية' },
  'home.qibla': { en: 'Qibla', ar: 'القبلة' },
  'home.location': { en: 'Location unknown', ar: 'الموقع غير معروف' },
  'home.method': { en: 'Method', ar: 'طريقة' },
  'home.loading': { en: 'Loading prayer times...', ar: 'جاري تحميل مواقيت الصلاة...' },
  'home.iftarIn': { en: 'Iftar in', ar: 'موعد الإفطار بعد' },
  'home.nextSuhoor': { en: 'Next Suhoor in', ar: 'السحور بعد' },
  'home.untilMaghrib': { en: 'Until Maghrib', ar: 'حتى المغرب' },
  'home.untilFajr': { en: 'Until Fajr', ar: 'حتى الفجر' },
  'home.imsak': { en: 'IMSAK', ar: 'إمساك' },
  'home.iftar': { en: 'IFTAR', ar: 'إفطار' },
  'home.nextPrayerIn': { en: 'in', ar: 'بعد' },
  'home.hours': { en: 'h', ar: 'س' },
  'home.minutes': { en: 'm', ar: 'د' },
  'home.seconds': { en: 's', ar: 'ث' },

  // Prayer names
  'prayer.fajr': { en: 'Fajr', ar: 'الفجر' },
  'prayer.sunrise': { en: 'Sunrise', ar: 'الشروق' },
  'prayer.dhuhr': { en: 'Dhuhr', ar: 'الظهر' },
  'prayer.asr': { en: 'Asr', ar: 'العصر' },
  'prayer.maghrib': { en: 'Maghrib', ar: 'المغرب' },
  'prayer.isha': { en: 'Isha', ar: 'العشاء' },

  // Dhikr
  'dhikr.reset': { en: 'Reset', ar: 'إعادة' },
  'dhikr.selectDhikr': { en: 'Select Dhikr', ar: 'اختر الذكر' },
  'dhikr.tapAnywhere': { en: 'Tap anywhere to count', ar: 'اضغط في أي مكان للعد' },
  'dhikr.advancingNext': { en: 'Advancing to next dhikr...', ar: 'الانتقال إلى الذكر التالي...' },
  'dhikr.tapReset': { en: 'Tap reset to start again', ar: 'اضغط إعادة للبدء من جديد' },

  // Duas
  'duas.title': { en: 'Duas & Adhkar', ar: 'الأدعية والأذكار' },
  'duas.search': { en: 'Search duas...', ar: 'ابحث عن دعاء...' },
  'duas.bookmarks': { en: 'Bookmarks', ar: 'المحفوظات' },
  'duas.noResults': { en: 'No duas found', ar: 'لم يتم العثور على أدعية' },
  'duas.noBookmarks': { en: 'No bookmarked duas yet', ar: 'لا توجد أدعية محفوظة بعد' },
  'duas.bookmarkedDuas': { en: 'Bookmarked Duas', ar: 'الأدعية المحفوظة' },
  'duas.copy': { en: 'Copy', ar: 'نسخ' },
  'duas.back': { en: 'Back', ar: 'رجوع' },
  'duas.myDuas': { en: 'My Duas', ar: 'أدعيتي' },
  'duas.myDuasArabic': { en: 'أدعيتي', ar: 'أدعيتي' },
  'duas.emptyState': { en: 'Your personal duas will appear here', ar: 'ستظهر أدعيتك الشخصية هنا' },
  'duas.addDua': { en: 'Add Dua', ar: 'أضف دعاء' },
  'duas.editDua': { en: 'Edit Dua', ar: 'تعديل الدعاء' },
  'duas.titleField': { en: 'Title (e.g. For my family)', ar: 'العنوان (مثلاً: لعائلتي)' },
  'duas.arabicField': { en: 'Arabic text (optional)', ar: 'النص العربي (اختياري)' },
  'duas.textField': { en: 'Dua text / translation', ar: 'نص الدعاء / الترجمة' },
  'duas.save': { en: 'Save', ar: 'حفظ' },
  'duas.delete': { en: 'Delete', ar: 'حذف' },
  'duas.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'duas.deleteConfirm': { en: 'Delete this dua?', ar: 'حذف هذا الدعاء؟' },
  'duas.personal': { en: 'Personal', ar: 'شخصي' },

  // Tracker
  'tracker.completeReadings': { en: 'Complete Quran readings', ar: 'ختمات القرآن الكريم' },
  'tracker.recordKhatm': { en: 'Record Khatm ✦', ar: 'تسجيل ختمة ✦' },
  'tracker.alhamdulillah': { en: 'Alhamdulillah! Record a completed Quran reading?', ar: 'الحمد لله! هل تريد تسجيل ختمة جديدة؟' },
  'tracker.confirm': { en: 'Confirm ✓', ar: 'تأكيد ✓' },
  'tracker.remove': { en: 'Remove', ar: 'حذف' },
  'tracker.removeKhatm': { en: 'Remove this Khatm record?', ar: 'حذف سجل هذه الختمة؟' },
  'tracker.cannotUndo': { en: 'This action cannot be undone.', ar: 'لا يمكن التراجع عن هذا الإجراء.' },
  'tracker.dayStreak': { en: 'day streak', ar: 'أيام متتالية' },
  'tracker.consecutiveDays': { en: 'Consecutive days with Quran reading', ar: 'أيام متتالية في قراءة القرآن' },
  'tracker.juzProgress': { en: 'Juz Progress', ar: 'تقدم الأجزاء' },
  'tracker.completed': { en: 'completed', ar: 'مكتمل' },
  'tracker.completedQuran': { en: 'You have completed the Quran!', ar: 'لقد أتممت ختمة القرآن!' },
  'tracker.confirmKhatm': { en: 'Alhamdulillah, record this Khatm ✓', ar: 'الحمد لله، سجّل هذه الختمة ✓' },

  // Settings
  'settings.title': { en: 'Settings', ar: 'الإعدادات' },
  'settings.calcMethod': { en: 'Calculation Method', ar: 'طريقة الحساب' },
  'settings.about': { en: 'About', ar: 'حول التطبيق' },
  'settings.language': { en: 'Language', ar: 'اللغة' },
  'settings.rateApp': { en: 'Rate the App', ar: 'قيّم التطبيق' },
  'settings.madeWithLove': { en: 'Made with love for the Muslim community', ar: 'صُنع بحب للمجتمع المسلم' },

  // Quran
  'quran.continueReading': { en: 'Continue reading', ar: 'متابعة القراءة' },
  'quran.searchSurah': { en: 'Search surah...', ar: 'ابحث عن سورة...' },
  'quran.surah': { en: 'Surah', ar: 'سورة' },
  'quran.juz': { en: 'Juz', ar: 'جزء' },
  'quran.verse': { en: 'Verse', ar: 'الآية' },
  'quran.verses': { en: 'verses', ar: 'آيات' },
  'quran.surahs': { en: 'Surahs', ar: 'السور' },

  // Common
  'common.in': { en: 'in', ar: 'بعد' },
  'common.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'common.reset': { en: 'Reset', ar: 'إعادة' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Language): string {
  return translations[key]?.[lang] || translations[key]?.en || key;
}

/** Format Arabic streak text with proper grammar */
export function formatStreakArabic(n: number): string {
  if (n === 0) return '٠ أيام متتالية';
  if (n === 1) return 'يوم متتالي واحد';
  if (n === 2) return 'يومان متتاليان';
  return `${n} أيام متتالية`;
}

/** Get Hijri date formatted for the given language */
export function getHijriDateLocalized(lang: Language): string {
  const now = new Date();
  if (lang === 'ar') {
    const formatter = new Intl.DateTimeFormat('ar-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    return formatter.format(now) + ' هـ';
  }
  // English
  const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  return formatter.format(now) + ' AH';
}

/** Map English verse reference to Arabic surah name */
const verseRefArabicMap: Record<string, string> = {
  'Ash-Sharh': 'الشرح',
  'At-Talaq': 'الطلاق',
  'Al-Baqarah': 'البقرة',
  'Taha': 'طه',
  'Ad-Duhaa': 'الضحى',
  'Al-Hadid': 'الحديد',
  'Ghafir': 'غافر',
  'Qaf': 'ق',
  'Al-A\'raf': 'الأعراف',
  'Yusuf': 'يوسف',
  'Adh-Dhariyat': 'الذاريات',
  'Al-Jumu\'ah': 'الجمعة',
  'Ar-Ra\'d': 'الرعد',
  'Ali \'Imran': 'آل عمران',
  'Al-Ikhlas': 'الإخلاص',
  'Al-Isra': 'الإسراء',
  'Hud': 'هود',
  'Al-Furqan': 'الفرقان',
  'At-Tawbah': 'التوبة',
};

export function localizeVerseRef(ref: string, lang: Language): string {
  if (lang !== 'ar') return ref;
  // ref format: "SurahName Number:Verse"
  const match = ref.match(/^(.+?)\s+(\d+:\d+)$/);
  if (!match) return ref;
  const [, surahName, verseNum] = match;
  const arabicName = verseRefArabicMap[surahName] || surahName;
  return `${arabicName} ${verseNum}`;
}

export function getStoredLanguage(): Language {
  return (localStorage.getItem('nur_language') as Language) || 'en';
}

export function setStoredLanguage(lang: Language) {
  localStorage.setItem('nur_language', lang);
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
}

// Apply on load
export function initLanguage() {
  const lang = getStoredLanguage();
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
}
