import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { formatTime, isRamadan } from '@/lib/prayer-utils';
import { ramadanDuas } from '@/data/dhikr';

function useCountdownTo(target: Date | null) {
  const [remaining, setRemaining] = useState({ hours: 0, minutes: 0, seconds: 0, total: 0 });
  useEffect(() => {
    if (!target) return;
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setRemaining({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        total: diff,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return remaining;
}

export default function Ramadan() {
  const { prayers } = usePrayerTimes();
  const [juzCompleted, setJuzCompleted] = useState<boolean[]>(() => {
    const saved = localStorage.getItem('nur-juz-progress');
    return saved ? JSON.parse(saved) : Array(30).fill(false);
  });

  const toggleJuz = (index: number) => {
    const updated = [...juzCompleted];
    updated[index] = !updated[index];
    setJuzCompleted(updated);
    localStorage.setItem('nur-juz-progress', JSON.stringify(updated));
    if (!updated[index]) return;
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const completedCount = juzCompleted.filter(Boolean).length;
  const progress = completedCount / 30;

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayDua = ramadanDuas[(dayOfYear - 1) % 30];

  const fajrTime = prayers.find((p) => p.name === 'fajr');
  const maghribTime = prayers.find((p) => p.name === 'maghrib');
  const ishaTime = prayers.find((p) => p.name === 'isha');

  // Suhoor = fajr - 10min
  const suhoorTime = fajrTime ? new Date(fajrTime.time.getTime() - 10 * 60 * 1000) : null;
  const iftarTime = maghribTime?.time || null;
  const tarawihTime = ishaTime ? new Date(ishaTime.time.getTime() + 30 * 60 * 1000) : null;

  // Determine which is next
  const now = new Date();
  const suhoorIsNext = suhoorTime && suhoorTime > now;
  const iftarIsNext = iftarTime && iftarTime > now && !suhoorIsNext;

  const suhoorCountdown = useCountdownTo(suhoorIsNext ? suhoorTime : null);
  const iftarCountdown = useCountdownTo(iftarIsNext ? iftarTime : null);

  const ramadanActive = isRamadan();
  const progressRingCirc = 2 * Math.PI * 32;
  const progressRingOffset = progressRingCirc * (1 - progress);

  return (
    <div className="min-h-screen safe-area-top pb-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(180,30%,12%)] via-[hsl(35,40%,15%)] to-[hsl(230,25%,8%)]" />
      <div className="geometric-pattern absolute inset-0 pointer-events-none" />

      <div className="relative z-10 px-5">
        {/* Header */}
        <div className="pt-12 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌙</span>
            <h1 className="text-2xl font-semibold text-foreground">Ramadan</h1>
          </div>
          {!ramadanActive && (
            <p className="text-xs text-muted-foreground mt-1">Track your Ramadan journey anytime</p>
          )}
        </div>

        {/* Suhoor / Iftar cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3 mb-3"
        >
          {/* Suhoor */}
          <div className={`glass-card p-5 text-center transition-all ${suhoorIsNext ? 'border-primary/20' : ''}`}>
            <p className="text-[10px] uppercase tracking-wider text-foreground/40 mb-2">Suhoor ends</p>
            <p className={`text-xl font-semibold ${suhoorIsNext ? 'text-primary' : 'text-foreground'}`}>
              {suhoorTime ? formatTime(suhoorTime) : '--:--'}
            </p>
            {suhoorIsNext && (
              <p className="text-[11px] text-primary/70 mt-1.5 font-medium tabular-nums">
                in {suhoorCountdown.hours}h {suhoorCountdown.minutes}m {suhoorCountdown.seconds}s
              </p>
            )}
            <p className="font-arabic text-xs text-primary/40 mt-1">السحور</p>
          </div>

          {/* Iftar */}
          <div className={`glass-card p-5 text-center transition-all ${iftarIsNext ? 'border-primary/20' : ''}`}>
            <p className="text-[10px] uppercase tracking-wider text-foreground/40 mb-2">Iftar</p>
            <p className={`text-xl font-semibold ${iftarIsNext ? 'text-primary' : 'text-foreground'}`}>
              {iftarTime ? formatTime(iftarTime) : '--:--'}
            </p>
            {iftarIsNext && (
              <p className="text-[11px] text-primary/70 mt-1.5 font-medium tabular-nums">
                in {iftarCountdown.hours}h {iftarCountdown.minutes}m {iftarCountdown.seconds}s
              </p>
            )}
            <p className="font-arabic text-xs text-primary/40 mt-1">الإفطار</p>
          </div>
        </motion.div>

        {/* Tarawih chip */}
        {tarawihTime && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.06]">
              <span className="text-[10px] text-white/30 uppercase tracking-wider">Tarawih</span>
              <span className="text-xs text-white/60 font-medium">{formatTime(tarawihTime)}</span>
            </div>
          </motion.div>
        )}

        {/* Quran Khatm Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Quran Khatm</p>
              <p className="text-xs text-muted-foreground">{completedCount}/30 Juz completed</p>
            </div>
            {/* Progress ring */}
            <div className="relative w-16 h-16">
              <svg className="w-full h-full progress-ring" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <circle
                  cx="36" cy="36" r="32"
                  fill="none"
                  stroke="hsl(43, 50%, 54%)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={progressRingCirc}
                  strokeDashoffset={progressRingOffset}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs font-bold text-primary">{Math.round(progress * 100)}%</p>
              </div>
            </div>
          </div>

          {/* Juz grid */}
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 30 }, (_, i) => (
              <button
                key={i}
                onClick={() => toggleJuz(i)}
                className={`aspect-square rounded-xl text-[10px] font-medium flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 ${
                  juzCompleted[i]
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-secondary/30 text-muted-foreground border border-transparent hover:border-white/[0.08]'
                }`}
              >
                {juzCompleted[i] ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className="text-[8px] text-muted-foreground/50">Juz</span>
                )}
                <span>{i + 1}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Dua of the day */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 mb-6"
        >
          <p className="text-[10px] uppercase tracking-wider text-foreground/40 mb-3">Dua of the Day</p>
          <div className="max-h-[220px] overflow-y-auto no-scrollbar">
            <p className="font-arabic text-xl text-foreground/90 text-right leading-loose mb-4">{todayDua.arabic}</p>
            <p className="text-sm text-muted-foreground italic leading-relaxed">{todayDua.translation}</p>
          </div>
          <p className="text-[9px] text-white/20 mt-3 text-right">Day {((dayOfYear - 1) % 30) + 1} of Ramadan · Dua collection</p>
        </motion.div>
      </div>
    </div>
  );
}
