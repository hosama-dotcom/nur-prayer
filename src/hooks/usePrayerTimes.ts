import { useState, useEffect } from 'react';
import { getPrayerTimes, getCurrentPrayer, getNextPrayer, getTimeUntil, getQiblaDirection, type PrayerTime, type PrayerName, type CalcMethod } from '@/lib/prayer-utils';

interface LocationState {
  lat: number;
  lng: number;
  city?: string;
}

const CALC_METHOD_LABELS: Record<CalcMethod, string> = {
  MuslimWorldLeague: 'MWL',
  Egyptian: 'Egyptian',
  Karachi: 'Karachi',
  UmmAlQura: 'Umm al-Qura',
  NorthAmerica: 'ISNA',
  Dubai: 'Dubai',
  Kuwait: 'Kuwait',
  Qatar: 'Qatar',
  Singapore: 'Singapore',
  Tehran: 'Tehran',
};

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = await res.json();
    return data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.state || null;
  } catch { return null; }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function usePrayerTimes() {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [prayers, setPrayers] = useState<PrayerTime[]>([]);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerName>('fajr');
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState(new Date());
  const [cityName, setCityName] = useState<string>(() => {
    return localStorage.getItem('nur_location_name') || '';
  });
  const [method, setMethod] = useState<CalcMethod>(() => {
    return (localStorage.getItem('nur-calc-method') as CalcMethod) || 'Dubai';
  });

  const methodLabel = CALC_METHOD_LABELS[method] || method;

  // Reset date at midnight
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const timer = setTimeout(() => setToday(new Date()), msUntilMidnight);
    return () => clearTimeout(timer);
  }, [today]);

  // Listen for calc method changes from Settings
  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem('nur-calc-method') as CalcMethod;
      if (stored && stored !== method) {
        setMethod(stored);
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('nur-method-changed', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('nur-method-changed', handleStorage);
    };
  }, [method]);

  // Get location with watch for significant changes
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ lat: 21.4225, lng: 39.8262, city: 'Makkah' });
      setCityName('Makkah');
      setLoading(false);
      return;
    }

    let lastLat = 0, lastLng = 0;

    const handlePosition = async (pos: GeolocationPosition) => {
      const { latitude, longitude } = pos.coords;

      // Only update if moved >10km or first time
      if (lastLat !== 0 && haversineKm(lastLat, lastLng, latitude, longitude) < 10) return;
      lastLat = latitude;
      lastLng = longitude;

      setLocation({ lat: latitude, lng: longitude });
      setQiblaDirection(getQiblaDirection(latitude, longitude));
      setLoading(false);

      // Reverse geocode
      const city = await reverseGeocode(latitude, longitude);
      if (city) {
        setCityName(city);
        localStorage.setItem('nur_location_name', city);
      }
    };

    const handleError = () => {
      setLocation({ lat: 21.4225, lng: 39.8262, city: 'Makkah' });
      setCityName('');
      setQiblaDirection(0);
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(handlePosition, handleError);

    const watchId = navigator.geolocation.watchPosition(handlePosition, () => {}, {
      enableHighAccuracy: false,
      maximumAge: 300000, // 5 min
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Calculate prayer times
  useEffect(() => {
    if (!location) return;
    const times = getPrayerTimes(location.lat, location.lng, today, method);
    setPrayers(times);
    setCurrentPrayer(getCurrentPrayer(times));
    setNextPrayer(getNextPrayer(times, location.lat, location.lng, method));
  }, [location, method, today]);

  // Countdown timer
  useEffect(() => {
    if (!nextPrayer) return;
    const interval = setInterval(() => {
      setCountdown(getTimeUntil(nextPrayer.time));
      if (prayers.length > 0) {
        const cp = getCurrentPrayer(prayers);
        if (cp !== currentPrayer) {
          setCurrentPrayer(cp);
          setNextPrayer(getNextPrayer(prayers, location!.lat, location!.lng, method));
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer, prayers, currentPrayer]);

  return {
    location,
    prayers,
    currentPrayer,
    nextPrayer,
    countdown,
    qiblaDirection,
    loading,
    error,
    cityName,
    methodLabel,
  };
}
