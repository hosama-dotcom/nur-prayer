import { Coordinates, CalculationMethod, PrayerTimes, Madhab, SunnahTimes } from 'adhan';

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTime {
  name: PrayerName;
  label: string;
  arabicLabel: string;
  time: Date;
}

export type CalcMethod = 'MuslimWorldLeague' | 'Egyptian' | 'Karachi' | 'UmmAlQura' | 'NorthAmerica' | 'Dubai' | 'Kuwait' | 'Qatar' | 'Singapore' | 'Tehran';

const methodMap: Record<CalcMethod, () => any> = {
  MuslimWorldLeague: () => CalculationMethod.MuslimWorldLeague(),
  Egyptian: () => CalculationMethod.Egyptian(),
  Karachi: () => CalculationMethod.Karachi(),
  UmmAlQura: () => CalculationMethod.UmmAlQura(),
  NorthAmerica: () => CalculationMethod.NorthAmerica(),
  Dubai: () => CalculationMethod.Dubai(),
  Kuwait: () => CalculationMethod.Kuwait(),
  Qatar: () => CalculationMethod.Qatar(),
  Singapore: () => CalculationMethod.Singapore(),
  Tehran: () => CalculationMethod.Tehran(),
};

export function getPrayerTimes(
  lat: number,
  lng: number,
  date: Date = new Date(),
  method: CalcMethod = 'NorthAmerica'
): PrayerTime[] {
  const coordinates = new Coordinates(lat, lng);
  const params = methodMap[method]();
  params.madhab = Madhab.Shafi;

  const prayerTimes = new PrayerTimes(coordinates, date, params);

  return [
    { name: 'fajr', label: 'Fajr', arabicLabel: 'الفجر', time: prayerTimes.fajr },
    { name: 'sunrise', label: 'Sunrise', arabicLabel: 'الشروق', time: prayerTimes.sunrise },
    { name: 'dhuhr', label: 'Dhuhr', arabicLabel: 'الظهر', time: prayerTimes.dhuhr },
    { name: 'asr', label: 'Asr', arabicLabel: 'العصر', time: prayerTimes.asr },
    { name: 'maghrib', label: 'Maghrib', arabicLabel: 'المغرب', time: prayerTimes.maghrib },
    { name: 'isha', label: 'Isha', arabicLabel: 'العشاء', time: prayerTimes.isha },
  ];
}

export function getCurrentPrayer(prayers: PrayerTime[]): PrayerName {
  const now = new Date();
  for (let i = prayers.length - 1; i >= 0; i--) {
    if (now >= prayers[i].time) return prayers[i].name;
  }
  return 'isha';
}

export function getNextPrayer(prayers: PrayerTime[]): PrayerTime | null {
  const now = new Date();
  for (const p of prayers) {
    if (p.time > now) return p;
  }
  // Next day's fajr
  return null;
}

export function getTimeUntil(target: Date): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const diff = Math.max(0, target.getTime() - now.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function getGradientClass(prayer: PrayerName): string {
  const map: Record<PrayerName, string> = {
    fajr: 'gradient-fajr',
    sunrise: 'gradient-dhuhr',
    dhuhr: 'gradient-dhuhr',
    asr: 'gradient-asr',
    maghrib: 'gradient-maghrib',
    isha: 'gradient-isha',
  };
  return map[prayer] || 'gradient-default';
}

// Simple Hijri date approximation
export function getHijriDate(): string {
  const now = new Date();
  // Using a known reference: 1 Muharram 1446 = July 8, 2024
  const refGregorian = new Date(2024, 6, 8); // July 8, 2024
  const refHijriYear = 1446;
  const refHijriMonth = 1;
  const refHijriDay = 1;
  
  const diffDays = Math.floor((now.getTime() - refGregorian.getTime()) / (1000 * 60 * 60 * 24));
  
  // Average Hijri month is ~29.53 days, year ~354.37 days
  const totalHijriDays = refHijriDay + diffDays - 1;
  const hijriYearsElapsed = Math.floor(totalHijriDays / 354.37);
  const remainingDays = totalHijriDays - Math.floor(hijriYearsElapsed * 354.37);
  const hijriMonth = Math.floor(remainingDays / 29.53) + 1;
  const hijriDay = Math.floor(remainingDays % 29.53) + 1;
  const hijriYear = refHijriYear + hijriYearsElapsed;

  const months = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Shaban',
    'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah'
  ];
  
  const monthName = months[Math.min(Math.max(hijriMonth - 1, 0), 11)];
  return `${hijriDay} ${monthName} ${hijriYear} AH`;
}

export function isRamadan(): boolean {
  const hijri = getHijriDate();
  return hijri.includes('Ramadan');
}

// Qibla direction from a given location
export function getQiblaDirection(lat: number, lng: number): number {
  const makkahLat = 21.4225 * (Math.PI / 180);
  const makkahLng = 39.8262 * (Math.PI / 180);
  const userLat = lat * (Math.PI / 180);
  const userLng = lng * (Math.PI / 180);

  const y = Math.sin(makkahLng - userLng);
  const x = Math.cos(userLat) * Math.tan(makkahLat) - Math.sin(userLat) * Math.cos(makkahLng - userLng);
  let qibla = Math.atan2(y, x) * (180 / Math.PI);
  return (qibla + 360) % 360;
}
