import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { formatTime, isRamadan, getHijriDay, getHijriParts } from '@/lib/prayer-utils';
import { ramadanDuas } from '@/data/dhikr';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

/* ── Helpers ── */

interface KhatmLog {
  date: string;
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

function getReadingStreak(): number {
  const raw = localStorage.getItem('nur_last_read');
  if (!raw) return 0;
  try {
    const timestamps: number[] = JSON.parse(raw);
    if (!timestamps.length) return 0;
    const days = [...new Set(timestamps.map(t => new Date(t).toDateString()))].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (days[0] !== today && days[0] !== yesterday) return 0;
    let streak = 1;
    for (let i = 0; i < days.length - 1; i++) {
      const curr = new Date(days[i]).getTime();
      const prev = new Date(days[i + 1]).getTime();
      if (curr - prev <= 86400000 + 1000) streak++;
      else break;
    }
    return streak;
  } catch { return 0; }
}

function formatKhatmDate(dateStr: string): string {
  const d = new Date(dateStr);
  const hijri = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    month: 'long', year: 'numeric',
  }).format(d);
  const greg = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return `${hijri} — ${greg}`;
}

/* ── Khatm Counter Section ── */

function KhatmCounter() {
  const [khatms, setKhatms] = useState<KhatmLog[]>(() => {
    const saved = localStorage.getItem('nur_khatm_log');
    return saved ? JSON.parse(saved) : [];
  });
  const [showConfirm, setShowConfirm] = useState(false);

  const confirmKhatm = () => {
    const updated = [...khatms, { date: new Date().toISOString() }];
    setKhatms(updated);
    localStorage.setItem('nur_khatm_log', JSON.stringify(updated));
    if (navigator.vibrate) navigator.vibrate(30);
    setShowConfirm(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-5"
      >
        <div className="flex flex-col items-center mb-5">
          <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/25 flex items-center justify-center mb-3">
            <p className="text-3xl font-bold text-primary">{khatms.length}</p>
          </div>
          <p className="text-xs text-muted-foreground">Complete Quran readings</p>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-3.5 rounded-xl bg-primary/15 text-primary text-sm font-semibold border border-primary/25 active:scale-[0.97] transition-all"
        >
          Record Khatm ✦
        </button>

        {khatms.length > 0 && (
          <div className="mt-5 space-y-2 max-h-[140px] overflow-y-auto no-scrollbar">
            {[...khatms].reverse().map((k, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>Khatm #{khatms.length - i}</span>
                <span>{formatKhatmDate(k.date)}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="glass-card-strong border-primary/20 max-w-[340px] rounded-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-primary font-arabic text-lg">الحمد لله</DialogTitle>
            <DialogDescription className="text-foreground/80 text-sm mt-2">
              Alhamdulillah! Record a completed Quran reading?
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs text-muted-foreground text-center">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <button
            onClick={confirmKhatm}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.97] transition-all"
          >
            Confirm ✓
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ── Reading Streak ── */

function ReadingStreak() {
  const streak = getReadingStreak();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card p-5 mb-5 flex items-center gap-4"
    >
      <div className="text-2xl">🔥</div>
      <div>
        <p className="text-sm font-semibold text-primary">{streak} day streak</p>
        <p className="text-[11px] text-muted-foreground">Consecutive days with Quran reading</p>
      </div>
    </motion.div>
  );
}

/* ── Juz Progress Grid ── */

function JuzProgress({ storageKey = 'nur_juz_progress', label = 'Current Reading — Juz Progress', onAllComplete }: {
  storageKey?: string;
  label?: string;
  onAllComplete?: () => void;
}) {
  const [juz, setJuz] = useState<boolean[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : Array(30).fill(false);
  });

  const toggle = (i: number) => {
    const updated = [...juz];
    updated[i] = !updated[i];
    setJuz(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    if (updated[i] && navigator.vibrate) navigator.vibrate(15);
    if (updated.every(Boolean) && onAllComplete) onAllComplete();
  };

  const reset = () => {
    const fresh = Array(30).fill(false);
    setJuz(fresh);
    localStorage.setItem(storageKey, JSON.stringify(fresh));
  };

  const completed = juz.filter(Boolean).length;
  const progress = completed / 30;
  const circ = 2 * Math.PI * 32;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-5 mb-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{completed}/30 Juz completed</p>
        </div>
        <div className="relative w-14 h-14">
          <svg className="w-full h-full progress-ring" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <circle cx="36" cy="36" r="32" fill="none" stroke="hsl(43, 50%, 54%)" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)} className="transition-all duration-500" />
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
            onClick={() => toggle(i)}
            className={`aspect-square rounded-xl text-[10px] font-medium flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 ${
              juz[i]
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-secondary/30 text-muted-foreground border border-transparent hover:border-white/[0.08]'
            }`}
          >
            {juz[i] ? (
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

      <button onClick={reset} className="mt-3 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">
        Reset Progress
      </button>
    </motion.div>
  );
}

/* ── Ramadan Section ── */

function RamadanSection() {
  const { prayers } = usePrayerTimes();
  const hijriDay = getHijriDay();
  const todayDua = ramadanDuas[(hijriDay - 1) % 30];
  const year = new Date().getFullYear();

  const fajrTime = prayers.find(p => p.name === 'fajr');
  const maghribTime = prayers.find(p => p.name === 'maghrib');
  const ishaTime = prayers.find(p => p.name === 'isha');

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
      {/* Ramadan banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 mb-5 text-center">
        <p className="font-arabic-display text-4xl text-primary leading-tight">رَمَضَان</p>
        <p className="text-xs text-muted-foreground mt-1">Day {hijriDay} of 30</p>
        <div className="mt-3 mx-auto max-w-[200px]">
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, hsl(43,50%,54%), hsl(43,60%,70%))' }}
              initial={{ width: 0 }} animate={{ width: `${(hijriDay / 30) * 100}%` }} transition={{ duration: 1 }} />
          </div>
        </div>
      </motion.div>

      {/* Suhoor / Iftar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 gap-3 mb-3">
        <div className={`glass-card p-5 text-center ${suhoorIsNext ? 'border-primary/20' : ''}`}>
          <p className="text-[10px] uppercase tracking-wider text-foreground/40 mb-2">Suhoor ends</p>
          <p className={`text-xl font-semibold ${suhoorIsNext ? 'text-primary' : 'text-foreground'}`}>{suhoorTime ? formatTime(suhoorTime) : '--:--'}</p>
          {suhoorIsNext && <p className="text-[11px] text-primary/70 mt-1.5 font-medium tabular-nums">in {suhoorCountdown.hours}h {suhoorCountdown.minutes}m {suhoorCountdown.seconds}s</p>}
          <p className="font-arabic text-xs text-primary/40 mt-1">السحور</p>
        </div>
        <div className={`glass-card p-5 text-center ${iftarIsNext ? 'border-primary/20' : ''}`}>
          <p className="text-[10px] uppercase tracking-wider text-foreground/40 mb-2">Iftar</p>
          <p className={`text-xl font-semibold ${iftarIsNext ? 'text-primary' : 'text-foreground'}`}>{iftarTime ? formatTime(iftarTime) : '--:--'}</p>
          {iftarIsNext && <p className="text-[11px] text-primary/70 mt-1.5 font-medium tabular-nums">in {iftarCountdown.hours}h {iftarCountdown.minutes}m {iftarCountdown.seconds}s</p>}
          <p className="font-arabic text-xs text-primary/40 mt-1">الإفطار</p>
        </div>
      </motion.div>

      {tarawihTime && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.06]">
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Tarawih</span>
            <span className="text-xs text-white/60 font-medium">{formatTime(tarawihTime)}</span>
          </div>
        </motion.div>
      )}

      {/* Ramadan-specific Juz grid */}
      <JuzProgress storageKey={`nur_ramadan_juz_${year}`} label="Khatm in Ramadan" />

      {/* Dua of the day */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5 mb-5">
        <p className="text-[10px] uppercase tracking-wider text-foreground/40 mb-3">Dua of the Day</p>
        <div className="max-h-[220px] overflow-y-auto no-scrollbar">
          <p className="font-arabic text-xl text-foreground/90 text-right leading-loose mb-4">{todayDua.arabic}</p>
          <p className="text-sm text-muted-foreground italic leading-relaxed">{todayDua.translation}</p>
        </div>
        <p className="text-[9px] text-white/20 mt-3 text-right">Day {hijriDay} of Ramadan</p>
      </motion.div>
    </>
  );
}

/* ── Main Page ── */

export default function Tracker() {
  const ramadanActive = isRamadan();
  const [showKhatmModal, setShowKhatmModal] = useState(false);

  return (
    <div className="min-h-screen safe-area-top pb-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(180,30%,12%)] via-[hsl(35,40%,15%)] to-[hsl(230,25%,8%)]" />
      <div className="geometric-pattern absolute inset-0 pointer-events-none" />

      <div className="relative z-10 px-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-12 pb-6 text-center">
          <p className="font-arabic-display text-5xl text-primary leading-tight">القُرآن الكريم</p>
          <p className="text-sm font-light text-foreground/80 mt-1 tracking-wide">My Quran Journey</p>
        </motion.div>

        <KhatmCounter />
        <ReadingStreak />
        <JuzProgress onAllComplete={() => setShowKhatmModal(true)} />

        {ramadanActive && <RamadanSection />}
      </div>

      {/* Auto-khatm modal when all 30 juz completed */}
      <Dialog open={showKhatmModal} onOpenChange={setShowKhatmModal}>
        <DialogContent className="glass-card-strong border-primary/20 max-w-[340px] rounded-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-primary font-arabic text-xl">ما شاء الله</DialogTitle>
            <DialogDescription className="text-foreground/80 text-sm mt-2">
              You've completed all 30 Juz! Would you like to record this as a Khatm?
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => {
              const saved = localStorage.getItem('nur_khatm_log');
              const khatms: KhatmLog[] = saved ? JSON.parse(saved) : [];
              khatms.push({ date: new Date().toISOString() });
              localStorage.setItem('nur_khatm_log', JSON.stringify(khatms));
              setShowKhatmModal(false);
            }}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.97] transition-all"
          >
            Record Khatm ✓
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
