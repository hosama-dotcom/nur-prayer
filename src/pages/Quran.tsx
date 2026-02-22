import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { surahs } from '@/data/surahs';

export default function Quran() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

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
        <div className="pt-12 pb-4">
          <h1 className="text-2xl font-semibold text-foreground">Quran</h1>
          <p className="text-sm text-muted-foreground mt-1">114 Surahs</p>
        </div>

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

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{surah.name}</p>
                <p className="text-xs text-muted-foreground">{surah.englishName} · {surah.versesCount} verses</p>
              </div>

              {/* Arabic */}
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
