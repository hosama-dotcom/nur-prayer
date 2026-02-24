/**
 * Hardcoded lookup: each Juz number → its exact starting Surah and Ayah.
 * Derived from the traditional Quran division.
 */
export interface JuzStart {
  surahNumber: number;
  ayah: number;
}

export const juzStartVerses: Record<number, JuzStart> = {
  1:  { surahNumber: 1,  ayah: 1 },
  2:  { surahNumber: 2,  ayah: 142 },
  3:  { surahNumber: 2,  ayah: 253 },
  4:  { surahNumber: 3,  ayah: 92 },
  5:  { surahNumber: 4,  ayah: 24 },
  6:  { surahNumber: 4,  ayah: 148 },
  7:  { surahNumber: 5,  ayah: 82 },
  8:  { surahNumber: 6,  ayah: 111 },
  9:  { surahNumber: 7,  ayah: 88 },
  10: { surahNumber: 8,  ayah: 41 },
  11: { surahNumber: 9,  ayah: 93 },
  12: { surahNumber: 11, ayah: 6 },
  13: { surahNumber: 12, ayah: 53 },
  14: { surahNumber: 15, ayah: 1 },
  15: { surahNumber: 17, ayah: 1 },
  16: { surahNumber: 18, ayah: 75 },
  17: { surahNumber: 21, ayah: 1 },
  18: { surahNumber: 23, ayah: 1 },
  19: { surahNumber: 25, ayah: 21 },
  20: { surahNumber: 27, ayah: 56 },
  21: { surahNumber: 29, ayah: 46 },
  22: { surahNumber: 33, ayah: 31 },
  23: { surahNumber: 36, ayah: 28 },
  24: { surahNumber: 39, ayah: 32 },
  25: { surahNumber: 41, ayah: 47 },
  26: { surahNumber: 46, ayah: 1 },
  27: { surahNumber: 51, ayah: 31 },
  28: { surahNumber: 58, ayah: 1 },
  29: { surahNumber: 67, ayah: 1 },
  30: { surahNumber: 78, ayah: 1 },
};
