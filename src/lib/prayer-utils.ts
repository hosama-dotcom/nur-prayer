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
  method: CalcMethod = 'UmmAlQura'
): PrayerTime[] {
  const coordinates = new Coordinates(lat, lng);
  const params = methodMap[method]();
  params.madhab = Madhab.Shafi;

  const prayerTimes = new PrayerTimes(coordinates, date, params);

  return [
    { name: 'fajr', label: 'Fajr', arabicLabel: 'الفجر', time: prayerTimes.fajr },
    { name: 'sunrise', label: 'Sunrise', arabicLabel: 'الشروق', time: prayerTimes.sunrise },
    { name: 'dhuhr', label: 'Dhuhr', arabicLabel: 'الظُّهْر', time: prayerTimes.dhuhr },
    { name: 'asr', label: 'Asr', arabicLabel: 'العَصْر', time: prayerTimes.asr },
    { name: 'maghrib', label: 'Maghrib', arabicLabel: 'المَغْرِب', time: prayerTimes.maghrib },
    { name: 'isha', label: 'Isha', arabicLabel: 'العِشَاء', time: prayerTimes.isha },
  ];
}

export function getCurrentPrayer(prayers: PrayerTime[]): PrayerName {
  const now = new Date();
  for (let i = prayers.length - 1; i >= 0; i--) {
    if (now >= prayers[i].time) return prayers[i].name;
  }
  return 'isha';
}

export function getNextPrayer(prayers: PrayerTime[], lat: number, lng: number, method: CalcMethod = 'UmmAlQura'): PrayerTime | null {
  const now = new Date();
  for (const p of prayers) {
    if (p.time > now) return p;
  }
  // After isha — return tomorrow's fajr
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowPrayers = getPrayerTimes(lat, lng, tomorrow, method);
  return tomorrowPrayers[0]; // fajr
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

export function getHijriDate(): string {
  const now = new Date();
  // Use Intl API for accurate Hijri date
  const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const parts = formatter.formatToParts(now);
  const day = parts.find(p => p.type === 'day')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const year = parts.find(p => (p.type as string) === 'relatedYear')?.value || parts.find(p => p.type === 'year')?.value || '';
  return `${day} ${month} ${year} AH`;
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
