import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { surahs } from '@/data/surahs';

interface LastRead {
  surahNumber: number;
  verseNumber: number;
  timestamp: number;
}

function getLastRead(): LastRead | null {
  try {
    const raw = localStorage.getItem('nur_last_read');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function Quran() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const lastRead = getLastRead();
  const lastReadSurah = lastRead ? surahs.find(s => s.number === lastRead.surahNumber) : null;

  const filtered = surahs.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.englishName.toLowerCase().includes(search.toLowerCase()) ||
      s.arabicName.includes(search)
  );

  return (
    <div className="min-h-screen gradient-isha pb-24 safe-area-top">
      <div className="geometric-pattern absolute inset-0 pointer-events-none" />
      <div className="relative z-10 px-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-12 pb-6 text-center"
        >
          <p className="font-arabic-display text-5xl text-primary leading-tight">القُرآن</p>
          <p className="text-sm font-light text-foreground/80 mt-1 tracking-wide">Quran</p>
          <p className="text-xs text-muted-foreground mt-2">114 Surahs</p>
        </motion.div>

        {/* Continue reading banner */}
        {lastRead && lastReadSurah && (
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate(`/quran/${lastRead.surahNumber}?verse=${lastRead.verseNumber}`)}
            className="w-full mb-4 rounded-xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform border border-primary/20"
            style={{ background: 'hsla(43, 50%, 54%, 0.08)' }}
          >
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(43, 50%, 54%)" strokeWidth="2" strokeLinecap="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-primary/60 uppercase tracking-wider mb-0.5">Continue reading</p>
              <p className="text-sm text-foreground font-medium truncate">
                {lastReadSurah.name}, Verse {lastRead.verseNumber}
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(43, 50%, 54%)" strokeWidth="2" strokeLinecap="round" opacity="0.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </motion.button>
        )}

        {/* Search */}
        <div className="mb-4">
          <div className="glass-card px-4 py-3 flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(220, 10%, 60%)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search surah..."
              className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground flex-1"
            />
          </div>
        </div>

        {/* Surah List */}
        <div className="space-y-2">
          {filtered.map((surah, i) => (
            <motion.div
              key={surah.number}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
              className="glass-card px-4 py-4 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer"
              onClick={() => navigate(`/quran/${surah.number}`)}
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-primary">{surah.number}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{surah.name}</p>
                <p className="text-xs text-muted-foreground">{surah.englishName} · {surah.versesCount} verses</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-arabic text-lg text-primary/80">{surah.arabicName}</p>
                <p className="text-[10px] text-muted-foreground">{surah.revelationType}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
