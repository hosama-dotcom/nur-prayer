import { useState, useEffect } from 'react';
import { getPrayerTimes, getCurrentPrayer, getNextPrayer, getTimeUntil, getQiblaDirection, type PrayerTime, type PrayerName, type CalcMethod } from '@/lib/prayer-utils';

interface LocationState {
  lat: number;
  lng: number;
  city?: string;
}

export function usePrayerTimes(method: CalcMethod = 'NorthAmerica') {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [prayers, setPrayers] = useState<PrayerTime[]>([]);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerName>('fajr');
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          // Default to Makkah if location denied
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

  // Calculate prayer times
  useEffect(() => {
    if (!location) return;
    const times = getPrayerTimes(location.lat, location.lng, new Date(), method);
    setPrayers(times);
    setCurrentPrayer(getCurrentPrayer(times));
    setNextPrayer(getNextPrayer(times));
  }, [location, method]);

  // Countdown timer
  useEffect(() => {
    if (!nextPrayer) return;
    const interval = setInterval(() => {
      setCountdown(getTimeUntil(nextPrayer.time));
      // Recalculate current prayer
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
