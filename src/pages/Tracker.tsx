import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { formatTime, isRamadan, getHijriDay } from '@/lib/prayer-utils';
import { ramadanDuas } from '@/data/dhikr';

interface KhatmLog {
  date: string; // ISO date string
}

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

function KhatmCounter() {
  const [khatms, setKhatms] = useState<KhatmLog[]>(() => {
    const saved = localStorage.getItem('nur-khatm-log');
    return saved ? JSON.parse(saved) : [];
  });

  const completeKhatm = () => {
    const updated = [...khatms, { date: new Date().toISOString() }];
    setKhatms(updated);
    localStorage.setItem('nur-khatm-log', JSON.stringify(updated));
    if (navigator.vibrate) navigator.vibrate(30);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-5 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Quran Completions</p>
          <p className="text-xs text-muted-foreground">{khatms.length} Khatm{khatms.length !== 1 ? 's' : ''} completed</p>
        </div>
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <p className="text-lg font-bold text-primary">{khatms.length}</p>
        </div>
      </div>

      <button
        onClick={completeKhatm}
        className="w-full py-3 rounded-xl bg-primary/15 text-primary text-sm font-medium border border-primary/20 active:scale-[0.97] transition-all"
      >
        Complete Khatm ✓
      </button>

      {khatms.length > 0 && (
        <div className="mt-4 space-y-1.5 max-h-[120px] overflow-y-auto no-scrollbar">
          {[...khatms].reverse().map((k, i) => (
            <div key={i} className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>Khatm #{khatms.length - i}</span>
              <span>{new Date(k.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function RamadanJuzGrid() {
  const [juzCompleted, setJuzCompleted] = useState<boolean[]>(() => {
    const saved = localStorage.getItem('nur-juz-progress');
    return saved ? JSON.parse(saved) : Array(30).fill(false);
  });

  const toggleJuz = (index: number) => {
    const updated = [...juzCompleted];
    updated[index] = !updated[index];
    setJuzCompleted(updated);
    localStorage.setItem('nur-juz-progress', JSON.stringify(updated));
    if (updated[index] && navigator.vibrate) navigator.vibrate(15);
  };

  const completedCount = juzCompleted.filter(Boolean).length;
  const progress = completedCount / 30;
  const progressRingCirc = 2 * Math.PI * 32;
  const progressRingOffset = progressRingCirc * (1 - progress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card p-5 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Ramadan Juz Tracker</p>
          <p className="text-xs text-muted-foreground">{completedCount}/30 Juz completed</p>
        </div>
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
  );
}

function RamadanSection() {
  const { prayers } = usePrayerTimes();
  const hijriDay = getHijriDay();
  const todayDua = ramadanDuas[(hijriDay - 1) % 30];

  const fajrTime = prayers.find((p) => p.name === 'fajr');
  const maghribTime = prayers.find((p) => p.name === 'maghrib');
  const ishaTime = prayers.find((p) => p.name === 'isha');

  const suhoorTime = fajrTime ? new Date(fajrTime.time.getTime() - 10 * 60 * 1000) : null;
  const iftarTime = maghribTime?.time || null;
  const tarawihTime = ishaTime ? new Date(ishaTime.time.getTime() + 30 * 60 * 1000) : null;

  const now = new Date();
  const suhoorIsNext = suhoorTime && suhoorTime > now;
  const iftarIsNext = iftarTime && iftarTime > now && !suhoorIsNext;

  const suhoorCountdown = useCountdownTo(suhoorIsNext ? suhoorTime : null);
  const iftarCountdown = useCountdownTo(iftarIsNext ? iftarTime : null);

  return (
    <>
      {/* Suhoor / Iftar cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-3 mb-3"
      >
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

      {/* Juz grid */}
      <RamadanJuzGrid />

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
        <p className="text-[9px] text-white/20 mt-3 text-right">Day {hijriDay} of Ramadan · Dua collection</p>
      </motion.div>
    </>
  );
}

export default function Tracker() {
  const ramadanActive = isRamadan();
  const hijriDay = getHijriDay();

  return (
    <div className="min-h-screen safe-area-top pb-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(180,30%,12%)] via-[hsl(35,40%,15%)] to-[hsl(230,25%,8%)]" />
      <div className="geometric-pattern absolute inset-0 pointer-events-none" />

      <div className="relative z-10 px-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-12 pb-6 text-center"
        >
          {ramadanActive ? (
            <>
              <p className="font-arabic-display text-5xl text-primary leading-tight">رَمَضَان</p>
              <p className="text-sm font-light text-foreground/80 mt-1 tracking-wide">Ramadan</p>
              <p className="text-xs text-muted-foreground mt-2">Day {hijriDay} of 30</p>
              <div className="mt-3 mx-auto max-w-[200px]">
                <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, hsl(43, 50%, 54%), hsl(43, 60%, 70%))' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(hijriDay / 30) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="font-arabic-display text-5xl text-primary leading-tight">المتابعة</p>
              <p className="text-sm font-light text-foreground/80 mt-1 tracking-wide">Tracker</p>
            </>
          )}
        </motion.div>

        {/* Year-round khatm counter */}
        <KhatmCounter />

        {/* Ramadan-specific section */}
        {ramadanActive && <RamadanSection />}
      </div>
    </div>
  );
}
