import { useState, useEffect, useRef, useCallback } from 'react';
import type { PrayerTime, PrayerName } from '@/lib/prayer-utils';

type AdhanPrefs = Record<string, boolean>;
type AdhanSound = 'Makkah' | 'Madinah' | 'None';

const ADHAN_URLS: Record<Exclude<AdhanSound, 'None'>, string> = {
  Makkah: 'https://cdn.islamic.network/prayer-times/audio/Abdul_Basit_Abdul_Samad_Mujawwad/adhan.mp3',
  Madinah: 'https://cdn.islamic.network/prayer-times/audio/adhan_madinah.mp3',
};

const PRAYERS_WITH_ADHAN: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function getAdhanPrefs(): AdhanPrefs {
  try {
    const saved = localStorage.getItem('nur_adhan_prefs');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore corrupt data */ }
  return { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true };
}

function getAdhanSound(): AdhanSound {
  return (localStorage.getItem('nur_adhan_sound') as AdhanSound) || 'Makkah';
}

function getLastPlayed(): { prayer: string; time: number } | null {
  try {
    const saved = localStorage.getItem('nur_last_adhan_played');
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function setLastPlayed(prayer: string) {
  localStorage.setItem('nur_last_adhan_played', JSON.stringify({ prayer, time: Date.now() }));
}

export function useAdhan(prayers: PrayerTime[]) {
  const [prefs, setPrefs] = useState<AdhanPrefs>(getAdhanPrefs);
  const [playing, setPlaying] = useState<PrayerName | null>(null);
  const [tooltipShown, setTooltipShown] = useState(() => !!localStorage.getItem('nur_adhan_tooltip_shown'));
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePrayer = useCallback((prayer: PrayerName) => {
    setPrefs(prev => {
      const updated = { ...prev, [prayer]: !prev[prayer] };
      localStorage.setItem('nur_adhan_prefs', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const stopAdhan = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlaying(null);
  }, []);

  const playAdhan = useCallback((prayer: PrayerName) => {
    const sound = getAdhanSound();
    if (sound === 'None') return;

    stopAdhan();

    const audio = new Audio(ADHAN_URLS[sound]);
    audio.play().catch(() => {});
    audio.onended = () => setPlaying(null);
    audioRef.current = audio;
    setPlaying(prayer);
    setLastPlayed(prayer);
  }, [stopAdhan]);

  // Check prayer times every 30 seconds
  useEffect(() => {
    if (!prayers.length) return;

    const check = () => {
      const now = Date.now();
      const currentPrefs = getAdhanPrefs();

      for (const prayer of prayers) {
        if (!PRAYERS_WITH_ADHAN.includes(prayer.name)) continue;
        if (!currentPrefs[prayer.name]) continue;

        const diff = Math.abs(now - prayer.time.getTime());
        if (diff < 30000) {
          // Within 30 seconds of prayer time
          const last = getLastPlayed();
          if (last && last.prayer === prayer.name && now - last.time < 600000) continue; // Already played within 10 min
          playAdhan(prayer.name);
          break;
        }
      }
    };

    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [prayers, playAdhan]);

  // Show one-time tooltip
  useEffect(() => {
    if (!tooltipShown) {
      setTooltipShown(true);
      localStorage.setItem('nur_adhan_tooltip_shown', '1');
    }
  }, [tooltipShown]);

  // Cleanup on unmount
  useEffect(() => () => { audioRef.current?.pause(); }, []);

  return {
    prefs,
    togglePrayer,
    playing,
    stopAdhan,
    showBgTooltip: !tooltipShown,
  };
}

export { PRAYERS_WITH_ADHAN };
export type { AdhanSound };
