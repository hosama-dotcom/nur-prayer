export interface JuzSurahRange {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
}

export interface JuzEntry {
  number: number;
  name: string;
  arabicName: string;
  surahs: JuzSurahRange[];
}

export const juzData: JuzEntry[] = [
  { number: 1, name: 'Alif Lam Mim', arabicName: 'ألم', surahs: [
    { surahNumber: 1, startVerse: 1, endVerse: 7 },
    { surahNumber: 2, startVerse: 1, endVerse: 141 },
  ]},
  { number: 2, name: 'Sayaqul', arabicName: 'سيقول', surahs: [
    { surahNumber: 2, startVerse: 142, endVerse: 252 },
  ]},
  { number: 3, name: 'Tilkal Rusul', arabicName: 'تلك الرسل', surahs: [
    { surahNumber: 2, startVerse: 253, endVerse: 286 },
    { surahNumber: 3, startVerse: 1, endVerse: 91 },
  ]},
  { number: 4, name: 'Lan Tanaloo', arabicName: 'لن تنالوا', surahs: [
    { surahNumber: 3, startVerse: 92, endVerse: 200 },
    { surahNumber: 4, startVerse: 1, endVerse: 23 },
  ]},
  { number: 5, name: 'Wal Muhsanat', arabicName: 'والمحصنات', surahs: [
    { surahNumber: 4, startVerse: 24, endVerse: 147 },
  ]},
  { number: 6, name: 'La Yuhibbu', arabicName: 'لا يحب', surahs: [
    { surahNumber: 4, startVerse: 148, endVerse: 176 },
    { surahNumber: 5, startVerse: 1, endVerse: 81 },
  ]},
  { number: 7, name: 'Wa Idha Sami\'u', arabicName: 'وإذا سمعوا', surahs: [
    { surahNumber: 5, startVerse: 82, endVerse: 120 },
    { surahNumber: 6, startVerse: 1, endVerse: 110 },
  ]},
  { number: 8, name: 'Wa Lau Annana', arabicName: 'ولو أننا', surahs: [
    { surahNumber: 6, startVerse: 111, endVerse: 165 },
    { surahNumber: 7, startVerse: 1, endVerse: 87 },
  ]},
  { number: 9, name: 'Qalal Mala\'u', arabicName: 'قال الملأ', surahs: [
    { surahNumber: 7, startVerse: 88, endVerse: 206 },
    { surahNumber: 8, startVerse: 1, endVerse: 40 },
  ]},
  { number: 10, name: 'Wa A\'lamu', arabicName: 'واعلموا', surahs: [
    { surahNumber: 8, startVerse: 41, endVerse: 75 },
    { surahNumber: 9, startVerse: 1, endVerse: 92 },
  ]},
  { number: 11, name: 'Ya\'tadhiruna', arabicName: 'يعتذرون', surahs: [
    { surahNumber: 9, startVerse: 93, endVerse: 129 },
    { surahNumber: 10, startVerse: 1, endVerse: 109 },
    { surahNumber: 11, startVerse: 1, endVerse: 5 },
  ]},
  { number: 12, name: 'Wa Ma Min Dabbah', arabicName: 'وما من دابة', surahs: [
    { surahNumber: 11, startVerse: 6, endVerse: 123 },
    { surahNumber: 12, startVerse: 1, endVerse: 52 },
  ]},
  { number: 13, name: 'Wa Ma Ubarri\'u', arabicName: 'وما أبرئ', surahs: [
    { surahNumber: 12, startVerse: 53, endVerse: 111 },
    { surahNumber: 13, startVerse: 1, endVerse: 43 },
    { surahNumber: 14, startVerse: 1, endVerse: 52 },
  ]},
  { number: 14, name: 'Rubama', arabicName: 'ربما', surahs: [
    { surahNumber: 15, startVerse: 1, endVerse: 99 },
    { surahNumber: 16, startVerse: 1, endVerse: 128 },
  ]},
  { number: 15, name: 'Subhanal Ladhi', arabicName: 'سبحان الذي', surahs: [
    { surahNumber: 17, startVerse: 1, endVerse: 111 },
    { surahNumber: 18, startVerse: 1, endVerse: 74 },
  ]},
  { number: 16, name: 'Qal Alam', arabicName: 'قال ألم', surahs: [
    { surahNumber: 18, startVerse: 75, endVerse: 110 },
    { surahNumber: 19, startVerse: 1, endVerse: 98 },
    { surahNumber: 20, startVerse: 1, endVerse: 135 },
  ]},
  { number: 17, name: 'Iqtaraba', arabicName: 'اقترب', surahs: [
    { surahNumber: 21, startVerse: 1, endVerse: 112 },
    { surahNumber: 22, startVerse: 1, endVerse: 78 },
  ]},
  { number: 18, name: 'Qad Aflaha', arabicName: 'قد أفلح', surahs: [
    { surahNumber: 23, startVerse: 1, endVerse: 118 },
    { surahNumber: 24, startVerse: 1, endVerse: 64 },
    { surahNumber: 25, startVerse: 1, endVerse: 20 },
  ]},
  { number: 19, name: 'Wa Qalal Ladhina', arabicName: 'وقال الذين', surahs: [
    { surahNumber: 25, startVerse: 21, endVerse: 77 },
    { surahNumber: 26, startVerse: 1, endVerse: 227 },
    { surahNumber: 27, startVerse: 1, endVerse: 55 },
  ]},
  { number: 20, name: 'Amman Khalaqa', arabicName: 'أمن خلق', surahs: [
    { surahNumber: 27, startVerse: 56, endVerse: 93 },
    { surahNumber: 28, startVerse: 1, endVerse: 88 },
    { surahNumber: 29, startVerse: 1, endVerse: 45 },
  ]},
  { number: 21, name: 'Utlu Ma Uhiya', arabicName: 'اتل ما أوحي', surahs: [
    { surahNumber: 29, startVerse: 46, endVerse: 69 },
    { surahNumber: 30, startVerse: 1, endVerse: 60 },
    { surahNumber: 31, startVerse: 1, endVerse: 34 },
    { surahNumber: 32, startVerse: 1, endVerse: 30 },
    { surahNumber: 33, startVerse: 1, endVerse: 30 },
  ]},
  { number: 22, name: 'Wa Man Yaqnut', arabicName: 'ومن يقنت', surahs: [
    { surahNumber: 33, startVerse: 31, endVerse: 73 },
    { surahNumber: 34, startVerse: 1, endVerse: 54 },
    { surahNumber: 35, startVerse: 1, endVerse: 45 },
    { surahNumber: 36, startVerse: 1, endVerse: 27 },
  ]},
  { number: 23, name: 'Wa Mali', arabicName: 'وما لي', surahs: [
    { surahNumber: 36, startVerse: 28, endVerse: 83 },
    { surahNumber: 37, startVerse: 1, endVerse: 182 },
    { surahNumber: 38, startVerse: 1, endVerse: 88 },
    { surahNumber: 39, startVerse: 1, endVerse: 31 },
  ]},
  { number: 24, name: 'Faman Adhlamu', arabicName: 'فمن أظلم', surahs: [
    { surahNumber: 39, startVerse: 32, endVerse: 75 },
    { surahNumber: 40, startVerse: 1, endVerse: 85 },
    { surahNumber: 41, startVerse: 1, endVerse: 46 },
  ]},
  { number: 25, name: 'Ilayhi Yuraddu', arabicName: 'إليه يرد', surahs: [
    { surahNumber: 41, startVerse: 47, endVerse: 54 },
    { surahNumber: 42, startVerse: 1, endVerse: 53 },
    { surahNumber: 43, startVerse: 1, endVerse: 89 },
    { surahNumber: 44, startVerse: 1, endVerse: 59 },
    { surahNumber: 45, startVerse: 1, endVerse: 37 },
  ]},
  { number: 26, name: 'Ha Mim', arabicName: 'حم', surahs: [
    { surahNumber: 46, startVerse: 1, endVerse: 35 },
    { surahNumber: 47, startVerse: 1, endVerse: 38 },
    { surahNumber: 48, startVerse: 1, endVerse: 29 },
    { surahNumber: 49, startVerse: 1, endVerse: 18 },
    { surahNumber: 50, startVerse: 1, endVerse: 45 },
    { surahNumber: 51, startVerse: 1, endVerse: 30 },
  ]},
  { number: 27, name: 'Qala Fama Khatbukum', arabicName: 'قال فما خطبكم', surahs: [
    { surahNumber: 51, startVerse: 31, endVerse: 60 },
    { surahNumber: 52, startVerse: 1, endVerse: 49 },
    { surahNumber: 53, startVerse: 1, endVerse: 62 },
    { surahNumber: 54, startVerse: 1, endVerse: 55 },
    { surahNumber: 55, startVerse: 1, endVerse: 78 },
    { surahNumber: 56, startVerse: 1, endVerse: 96 },
    { surahNumber: 57, startVerse: 1, endVerse: 29 },
  ]},
  { number: 28, name: 'Qad Sami\'a', arabicName: 'قد سمع', surahs: [
    { surahNumber: 58, startVerse: 1, endVerse: 22 },
    { surahNumber: 59, startVerse: 1, endVerse: 24 },
    { surahNumber: 60, startVerse: 1, endVerse: 13 },
    { surahNumber: 61, startVerse: 1, endVerse: 14 },
    { surahNumber: 62, startVerse: 1, endVerse: 11 },
    { surahNumber: 63, startVerse: 1, endVerse: 11 },
    { surahNumber: 64, startVerse: 1, endVerse: 18 },
    { surahNumber: 65, startVerse: 1, endVerse: 12 },
    { surahNumber: 66, startVerse: 1, endVerse: 12 },
  ]},
  { number: 29, name: 'Tabarakal Ladhi', arabicName: 'تبارك الذي', surahs: [
    { surahNumber: 67, startVerse: 1, endVerse: 30 },
    { surahNumber: 68, startVerse: 1, endVerse: 52 },
    { surahNumber: 69, startVerse: 1, endVerse: 52 },
    { surahNumber: 70, startVerse: 1, endVerse: 44 },
    { surahNumber: 71, startVerse: 1, endVerse: 28 },
    { surahNumber: 72, startVerse: 1, endVerse: 28 },
    { surahNumber: 73, startVerse: 1, endVerse: 20 },
    { surahNumber: 74, startVerse: 1, endVerse: 56 },
    { surahNumber: 75, startVerse: 1, endVerse: 40 },
    { surahNumber: 76, startVerse: 1, endVerse: 31 },
    { surahNumber: 77, startVerse: 1, endVerse: 50 },
  ]},
  { number: 30, name: 'Amma Yatasa\'alun', arabicName: 'عم يتساءلون', surahs: [
    { surahNumber: 78, startVerse: 1, endVerse: 40 },
    { surahNumber: 79, startVerse: 1, endVerse: 46 },
    { surahNumber: 80, startVerse: 1, endVerse: 42 },
    { surahNumber: 81, startVerse: 1, endVerse: 29 },
    { surahNumber: 82, startVerse: 1, endVerse: 19 },
    { surahNumber: 83, startVerse: 1, endVerse: 36 },
    { surahNumber: 84, startVerse: 1, endVerse: 25 },
    { surahNumber: 85, startVerse: 1, endVerse: 22 },
    { surahNumber: 86, startVerse: 1, endVerse: 17 },
    { surahNumber: 87, startVerse: 1, endVerse: 19 },
    { surahNumber: 88, startVerse: 1, endVerse: 26 },
    { surahNumber: 89, startVerse: 1, endVerse: 30 },
    { surahNumber: 90, startVerse: 1, endVerse: 20 },
    { surahNumber: 91, startVerse: 1, endVerse: 15 },
    { surahNumber: 92, startVerse: 1, endVerse: 21 },
    { surahNumber: 93, startVerse: 1, endVerse: 11 },
    { surahNumber: 94, startVerse: 1, endVerse: 8 },
    { surahNumber: 95, startVerse: 1, endVerse: 8 },
    { surahNumber: 96, startVerse: 1, endVerse: 19 },
    { surahNumber: 97, startVerse: 1, endVerse: 5 },
    { surahNumber: 98, startVerse: 1, endVerse: 8 },
    { surahNumber: 99, startVerse: 1, endVerse: 8 },
    { surahNumber: 100, startVerse: 1, endVerse: 11 },
    { surahNumber: 101, startVerse: 1, endVerse: 11 },
    { surahNumber: 102, startVerse: 1, endVerse: 8 },
    { surahNumber: 103, startVerse: 1, endVerse: 3 },
    { surahNumber: 104, startVerse: 1, endVerse: 9 },
    { surahNumber: 105, startVerse: 1, endVerse: 5 },
    { surahNumber: 106, startVerse: 1, endVerse: 4 },
    { surahNumber: 107, startVerse: 1, endVerse: 7 },
    { surahNumber: 108, startVerse: 1, endVerse: 3 },
    { surahNumber: 109, startVerse: 1, endVerse: 6 },
    { surahNumber: 110, startVerse: 1, endVerse: 3 },
    { surahNumber: 111, startVerse: 1, endVerse: 5 },
    { surahNumber: 112, startVerse: 1, endVerse: 4 },
    { surahNumber: 113, startVerse: 1, endVerse: 5 },
    { surahNumber: 114, startVerse: 1, endVerse: 6 },
  ]},
];
