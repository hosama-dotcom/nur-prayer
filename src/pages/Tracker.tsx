import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { useLanguage } from '@/contexts/LanguageContext';
import { formatStreakArabic } from '@/lib/i18n';

/* ── Types ── */

interface KhatmLog {
  date: string;
}

/* ── Helpers ── */

function formatKhatmDate(dateStr: string, lang: string): string {
  const d = new Date(dateStr);
  const locale = lang === 'ar' ? 'ar-u-ca-islamic-umalqura' : 'en-u-ca-islamic-umalqura';
  const gregLocale = lang === 'ar' ? 'ar-SA' : 'en-US';
  const hijri = new Intl.DateTimeFormat(locale, {
    month: 'long', year: 'numeric',
  }).format(d);
  const greg = d.toLocaleDateString(gregLocale, { month: 'short', year: 'numeric' });
  return `${hijri} — ${greg}`;
}

function useKhatmLog() {
  const [khatms, setKhatms] = useState<KhatmLog[]>(() => {
    const saved = localStorage.getItem('nur_khatm_log');
    return saved ? JSON.parse(saved) : [];
  });

  const persist = (updated: KhatmLog[]) => {
    setKhatms(updated);
    localStorage.setItem('nur_khatm_log', JSON.stringify(updated));
  };

  const addKhatm = () => {
    persist([...khatms, { date: new Date().toISOString() }]);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const deleteKhatm = (idx: number) => {
    persist(khatms.filter((_, i) => i !== idx));
  };

  const updateDate = (idx: number, newDate: Date) => {
    const updated = [...khatms];
    updated[idx] = { ...updated[idx], date: newDate.toISOString() };
    persist(updated);
  };

  return { khatms, addKhatm, deleteKhatm, updateDate };
}

/* ── Khatm Counter ── */

function KhatmCounter({ khatmLog }: { khatmLog: ReturnType<typeof useKhatmLog> }) {
  const { khatms, addKhatm, deleteKhatm, updateDate } = khatmLog;
  const { t, lang } = useLanguage();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  const confirmKhatm = () => {
    addKhatm();
    setShowConfirm(false);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-5">
        <div className="flex flex-col items-center mb-5">
          <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/25 flex items-center justify-center mb-3">
            <p className="text-3xl font-bold text-primary">{khatms.length}</p>
          </div>
          <p className="text-xs text-muted-foreground">{t('tracker.completeReadings')}</p>
        </div>

        <button onClick={() => setShowConfirm(true)}
          className="w-full py-3.5 rounded-xl bg-primary/15 text-primary text-sm font-semibold border border-primary/25 active:scale-[0.97] transition-all">
          {t('tracker.recordKhatm')}
        </button>

        {khatms.length > 0 && (
          <div className="mt-5 space-y-2 max-h-[180px] overflow-y-auto no-scrollbar">
            {[...khatms].map((k, realIdx) => khatms.length - 1 - realIdx).map((origIdx) => {
              const k = khatms[origIdx];
              return (
                <div key={origIdx} className="flex items-center justify-between text-xs text-muted-foreground px-1 gap-2">
                  <span className="shrink-0">{lang === 'ar' ? `ختمة #${origIdx + 1}` : `Khatm #${origIdx + 1}`}</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors truncate text-right">
                        {formatKhatmDate(k.date, lang)}
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
              {t('tracker.alhamdulillah')}
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs text-muted-foreground text-center">
            {new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <button onClick={confirmKhatm}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.97] transition-all">
            {t('tracker.confirm')}
          </button>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteIdx !== null} onOpenChange={() => setDeleteIdx(null)}>
        <DialogContent className="glass-card-strong border-primary/20 max-w-[340px] rounded-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-foreground text-sm">{t('tracker.removeKhatm')}</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs mt-1">{t('tracker.cannotUndo')}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <button onClick={() => setDeleteIdx(null)}
              className="flex-1 py-2.5 rounded-xl bg-secondary/30 text-foreground/70 text-sm font-medium">
              {t('common.cancel')}
            </button>
            <button onClick={() => deleteIdx !== null && (deleteKhatm(deleteIdx), setDeleteIdx(null))}
              className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold border border-red-500/20">
              {t('tracker.remove')}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ── Reading Streak ── */

function ReadingStreak() {
  const { t, lang } = useLanguage();
  const getStreak = (): number => {
    try {
      const raw = localStorage.getItem('nur_last_read');
      if (!raw) return 0;
      const lastRead = JSON.parse(raw);
      if (!lastRead?.timestamp) return 0;

      const now = new Date();
      const lastDate = new Date(lastRead.timestamp);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
      const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays > 1) return 0;
      const historyRaw = localStorage.getItem('nur_reading_streak');
      if (historyRaw) {
        const streak = JSON.parse(historyRaw);
        return typeof streak === 'number' ? streak : 1;
      }
      return diffDays <= 1 ? 1 : 0;
    } catch { return 0; }
  };

  const streak = getStreak();
  const streakText = lang === 'ar' ? formatStreakArabic(streak) : `${streak} ${t('tracker.dayStreak')}`;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5 mb-5">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔥</span>
        <div>
          <p className="text-sm font-semibold text-primary">{streakText}</p>
          <p className="text-[11px] text-muted-foreground">{t('tracker.consecutiveDays')}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Juz Progress Grid ── */

function JuzProgress({ onAllComplete }: { onAllComplete: () => void }) {
  const { t } = useLanguage();
  const [completed, setCompleted] = useState<boolean[]>(() => {
    try {
      const saved = localStorage.getItem('nur_juz_progress');
      return saved ? JSON.parse(saved) : new Array(30).fill(false);
    } catch { return new Array(30).fill(false); }
  });

  const persist = (updated: boolean[]) => {
    setCompleted(updated);
    localStorage.setItem('nur_juz_progress', JSON.stringify(updated));
  };

  const toggle = (idx: number) => {
    const updated = [...completed];
    updated[idx] = !updated[idx];
    persist(updated);
    if (navigator.vibrate) navigator.vibrate(15);

    if (updated.every(Boolean)) {
      setTimeout(() => onAllComplete(), 500);
    }
  };

  const reset = () => {
    persist(new Array(30).fill(false));
  };

  const doneCount = completed.filter(Boolean).length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-foreground">{t('tracker.juzProgress')}</p>
          <p className="text-[11px] text-muted-foreground">{doneCount}/30 {t('tracker.completed')}</p>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {completed.map((done, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={cn(
              "aspect-square rounded-lg text-xs font-semibold flex items-center justify-center transition-all active:scale-90",
              done
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-white/[0.04] text-muted-foreground border border-white/[0.08]"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="flex justify-end mt-3">
        <button onClick={reset} className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          {t('common.reset')}
        </button>
      </div>
    </motion.div>
  );
}

/* ── Main Page ── */

export default function Tracker() {
  const { t, lang } = useLanguage();
  const khatmLog = useKhatmLog();
  const [showAutoKhatm, setShowAutoKhatm] = useState(false);
  const [juzKey, setJuzKey] = useState(0);

  const handleAllJuzComplete = () => {
    setShowAutoKhatm(true);
  };

  const confirmAutoKhatm = () => {
    khatmLog.addKhatm();
    localStorage.setItem('nur_juz_progress', JSON.stringify(new Array(30).fill(false)));
    setShowAutoKhatm(false);
    setJuzKey(k => k + 1);
  };

  return (
    <div className="min-h-screen safe-area-top pb-24 relative night-sky-bg">
      <div className="geometric-pattern absolute inset-0 pointer-events-none" />

      <div className="relative z-10 px-5">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-12 pb-6 text-center">
          <p className="font-arabic-display text-5xl text-primary leading-tight">رِحْلَتِي</p>
        </motion.div>

        <KhatmCounter khatmLog={khatmLog} />
        <ReadingStreak />
        <JuzProgress key={juzKey} onAllComplete={handleAllJuzComplete} />
      </div>

      <Dialog open={showAutoKhatm} onOpenChange={setShowAutoKhatm}>
        <DialogContent className="glass-card-strong border-primary/20 max-w-[340px] rounded-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-primary font-arabic text-2xl">مَاشَاءَ اللّٰه!</DialogTitle>
            <DialogDescription className="text-foreground/80 text-sm mt-3">
              {t('tracker.completedQuran')}
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs text-muted-foreground text-center">
            {new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <button onClick={confirmAutoKhatm}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.97] transition-all">
            {t('tracker.confirmKhatm')}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
