import { useState, useEffect } from 'react';
import { getPrayerTimes, getCurrentPrayer, getNextPrayer, getTimeUntil, getQiblaDirection, type PrayerTime, type PrayerName, type CalcMethod } from '@/lib/prayer-utils';

interface LocationState {
  lat: number;
  lng: number;
  city?: string;
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
  const [method, setMethod] = useState<CalcMethod>(() => {
    return (localStorage.getItem('nur-calc-method') as CalcMethod) || 'UmmAlQura';
  });

  // Listen for calc method changes from Settings
  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem('nur-calc-method') as CalcMethod;
      if (stored && stored !== method) {
        setMethod(stored);
      }
    };
    window.addEventListener('storage', handleStorage);
    // Also listen for custom event for same-tab updates
    window.addEventListener('nur-method-changed', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('nur-method-changed', handleStorage);
    };
  }, [method]);

  // Get location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ lat: latitude, lng: longitude });
          setQiblaDirection(getQiblaDirection(latitude, longitude));
          setLoading(false);
        },
        () => {
          setLocation({ lat: 21.4225, lng: 39.8262, city: 'Makkah' });
          setQiblaDirection(0);
          setLoading(false);
        }
      );
    } else {
      setLocation({ lat: 21.4225, lng: 39.8262, city: 'Makkah' });
      setLoading(false);
    }
  }, []);

  // Calculate prayer times — reactive to location, method, and date
  useEffect(() => {
    if (!location) return;
    const times = getPrayerTimes(location.lat, location.lng, new Date(), method);
    setPrayers(times);
    setCurrentPrayer(getCurrentPrayer(times));
    setNextPrayer(getNextPrayer(times));

    // Debug logging
    console.log('[Nur] Prayer Times Calculated:', {
      method,
      coordinates: { lat: location.lat, lng: location.lng },
      times: times.map(t => ({ name: t.name, time: t.time.toLocaleTimeString() })),
    });
  }, [location, method]);

  // Countdown timer
  useEffect(() => {
    if (!nextPrayer) return;
    const interval = setInterval(() => {
      setCountdown(getTimeUntil(nextPrayer.time));
      if (prayers.length > 0) {
        const cp = getCurrentPrayer(prayers);
        if (cp !== currentPrayer) {
          setCurrentPrayer(cp);
          setNextPrayer(getNextPrayer(prayers));
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
  };
}
