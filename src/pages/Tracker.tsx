import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { isRamadan, getHijriDay } from '@/lib/prayer-utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

/* ── Helpers ── */

interface KhatmLog {
  date: string;
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

/* ── Ramadan Header ── */

function RamadanHeader() {
  const hijriDay = getHijriDay();
  return (
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
  );
}

/* ── Reading Streak ── */

function ReadingStreak() {
  const streak = getReadingStreak();
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 mb-5 flex items-center gap-4">
      <div className="text-2xl">🔥</div>
      <div>
        <p className="text-sm font-semibold text-primary">{streak} day streak</p>
        <p className="text-[11px] text-muted-foreground">Consecutive days with Quran reading</p>
      </div>
    </motion.div>
  );
}

/* ── Khatm Counter Section ── */

function KhatmCounter() {
  const [khatms, setKhatms] = useState<KhatmLog[]>(() => {
    const saved = localStorage.getItem('nur_khatm_log');
    return saved ? JSON.parse(saved) : [];
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  const persist = (updated: KhatmLog[]) => {
    setKhatms(updated);
    localStorage.setItem('nur_khatm_log', JSON.stringify(updated));
  };

  const confirmKhatm = () => {
    persist([...khatms, { date: new Date().toISOString() }]);
    if (navigator.vibrate) navigator.vibrate(30);
    setShowConfirm(false);
  };

  const deleteKhatm = (idx: number) => {
    const updated = khatms.filter((_, i) => i !== idx);
    persist(updated);
    setDeleteIdx(null);
  };

  const updateDate = (idx: number, newDate: Date) => {
    const updated = [...khatms];
    updated[idx] = { ...updated[idx], date: newDate.toISOString() };
    persist(updated);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 mb-5">
        <div className="flex flex-col items-center mb-5">
          <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/25 flex items-center justify-center mb-3">
            <p className="text-3xl font-bold text-primary">{khatms.length}</p>
          </div>
          <p className="text-xs text-muted-foreground">Complete Quran readings</p>
        </div>

        <button onClick={() => setShowConfirm(true)}
          className="w-full py-3.5 rounded-xl bg-primary/15 text-primary text-sm font-semibold border border-primary/25 active:scale-[0.97] transition-all">
          Record Khatm ✦
        </button>

        {khatms.length > 0 && (
          <div className="mt-5 space-y-2 max-h-[180px] overflow-y-auto no-scrollbar">
            {[...khatms].map((k, realIdx) => khatms.length - 1 - realIdx).map((origIdx) => {
              const k = khatms[origIdx];
              return (
                <div key={origIdx} className="flex items-center justify-between text-xs text-muted-foreground px-1 gap-2">
                  <span className="shrink-0">Khatm #{origIdx + 1}</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors truncate text-right">
                        {formatKhatmDate(k.date)}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={new Date(k.date)}
                        onSelect={(d) => d && updateDate(origIdx, d)}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <button onClick={() => setDeleteIdx(origIdx)} className="shrink-0 text-muted-foreground/40 hover:text-red-400 transition-colors p-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Confirm new khatm */}
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
          <button onClick={confirmKhatm}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.97] transition-all">
            Confirm ✓
          </button>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteIdx !== null} onOpenChange={() => setDeleteIdx(null)}>
        <DialogContent className="glass-card-strong border-primary/20 max-w-[340px] rounded-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-foreground text-sm">Remove this Khatm record?</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs mt-1">This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <button onClick={() => setDeleteIdx(null)}
              className="flex-1 py-2.5 rounded-xl bg-secondary/30 text-foreground/70 text-sm font-medium">
              Cancel
            </button>
            <button onClick={() => deleteIdx !== null && deleteKhatm(deleteIdx)}
              className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold border border-red-500/20">
              Remove
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ── Main Page ── */

export default function Tracker() {
  const ramadanActive = isRamadan();

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

        {ramadanActive && <RamadanHeader />}

        <ReadingStreak />
        <KhatmCounter />
      </div>
    </div>
  );
}
