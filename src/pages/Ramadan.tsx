import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { formatTime, isRamadan } from '@/lib/prayer-utils';
import { ramadanDuas } from '@/data/dhikr';

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
  };

  const completedCount = juzCompleted.filter(Boolean).length;
  const progress = completedCount / 30;

  // Get today's dua (cycle through 30)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayDua = ramadanDuas[(dayOfYear - 1) % 30];

  const fajrTime = prayers.find((p) => p.name === 'fajr');
  const maghribTime = prayers.find((p) => p.name === 'maghrib');

  const ramadanActive = isRamadan();

  return (
    <div className="min-h-screen safe-area-top pb-24 relative">
      {/* Ramadan-specific gradient */}
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
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <div className="glass-card p-5 text-center">
            <p className="text-[10px] uppercase tracking-wider text-foreground/40 mb-2">Suhoor ends</p>
            <p className="text-xl font-semibold text-foreground">
              {fajrTime ? formatTime(fajrTime.time) : '--:--'}
            </p>
            <p className="font-arabic text-xs text-primary/60 mt-1">السحور</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-[10px] uppercase tracking-wider text-foreground/40 mb-2">Iftar</p>
            <p className="text-xl font-semibold text-primary">
              {maghribTime ? formatTime(maghribTime.time) : '--:--'}
            </p>
            <p className="font-arabic text-xs text-primary/60 mt-1">الإفطار</p>
          </div>
        </motion.div>

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
            <div className="text-right">
              <p className="text-lg font-semibold text-primary">{Math.round(progress * 100)}%</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-secondary/50 mb-4 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Juz grid */}
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 30 }, (_, i) => (
              <button
                key={i}
                onClick={() => toggleJuz(i)}
                className={`aspect-square rounded-xl text-xs font-medium flex items-center justify-center transition-all ${
                  juzCompleted[i]
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-secondary/30 text-muted-foreground border border-transparent'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Dua of the day */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <p className="text-[10px] uppercase tracking-wider text-foreground/40 mb-3">Dua of the Day</p>
          <p className="font-arabic text-xl text-foreground/90 text-right leading-loose mb-3">{todayDua.arabic}</p>
          <p className="text-sm text-muted-foreground italic">{todayDua.translation}</p>
        </motion.div>
      </div>
    </div>
  );
}
