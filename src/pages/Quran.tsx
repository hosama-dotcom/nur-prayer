import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { surahs } from '@/data/surahs';
import { juzData } from '@/data/juzData';
import { useLanguage } from '@/contexts/LanguageContext';

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

type ViewMode = 'surah' | 'juz';

export default function Quran() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('surah');
  const [expandedJuz, setExpandedJuz] = useState<number | null>(null);
  const lastRead = getLastRead();
  const lastReadSurah = lastRead ? surahs.find(s => s.number === lastRead.surahNumber) : null;
  const isAr = lang === 'ar';

  const filtered = surahs.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.englishName.toLowerCase().includes(search.toLowerCase()) ||
      s.arabicName.includes(search)
  );

  return (
    <div className="min-h-screen night-sky-bg pb-24 safe-area-top relative">
      <div className="geometric-pattern absolute inset-0 pointer-events-none" />
      <div className="relative z-10 px-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-12 pb-6 text-center"
        >
          <p className="font-arabic-display text-5xl text-primary leading-tight">القُرآن الكريم</p>
        </motion.div>

        {/* Surah / Juz toggle */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-full p-1 bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm">
           {([{ key: 'surah', label: t('quran.surah') }, { key: 'juz', label: t('quran.juz') }] as const).map((m) => (
              <button
                key={m.key}
                onClick={() => setViewMode(m.key as ViewMode)}
                className={`relative px-6 py-1.5 rounded-full text-xs font-medium transition-all ${
                  viewMode === m.key ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {viewMode === m.key && (
                  <motion.div
                    layoutId="quran-view-pill"
                    className="absolute inset-0 rounded-full bg-primary/15 border border-primary/25"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
                <span className="relative z-10">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

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
              <p className="text-[10px] text-primary/60 uppercase tracking-wider mb-0.5">{t('quran.continueReading')}</p>
              <p className="text-sm text-foreground font-medium truncate">
                {isAr
                  ? `${lastReadSurah.arabicName}، ${t('quran.verse')} ${lastRead.verseNumber}`
                  : `${lastReadSurah.name}, ${t('quran.verse')} ${lastRead.verseNumber}`
                }
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(43, 50%, 54%)" strokeWidth="2" strokeLinecap="round" opacity="0.5" className={isAr ? '-scale-x-100' : ''}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </motion.button>
        )}

        {/* Search (surah view only) */}
        {viewMode === 'surah' && (
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
                placeholder={t('quran.searchSurah')}
                className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground flex-1"
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {viewMode === 'surah' ? (
            <motion.div key="surah" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Surah List */}
              <div className="space-y-2">
                {filtered.map((surah, i) => (
                  <motion.div
                    key={surah.number}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.5) }}
                    className={`glass-card px-4 py-4 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer ${isAr ? 'flex-row-reverse' : ''}`}
                    onClick={() => navigate(`/quran/${surah.number}`)}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-primary">{surah.number}</span>
                    </div>
                    {isAr ? (
                      <>
                        <div className="flex-shrink-0 order-first">
                          <p className="font-arabic text-primary/80" style={{ fontSize: '18px' }}>{surah.arabicName}</p>
                        </div>
                        <div className="flex-1 min-w-0 text-start">
                          <p className="text-xs text-muted-foreground">{surah.versesCount} {t('quran.verses')} · {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{surah.name}</p>
                          <p className="text-xs text-muted-foreground">{surah.englishName} · {surah.versesCount} {t('quran.verses')}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-arabic text-lg text-primary/80">{surah.arabicName}</p>
                          <p className="text-[10px] text-muted-foreground">{surah.revelationType}</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="juz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Juz List */}
              <div className="space-y-2">
                {juzData.map((juz, i) => {
                  const isExpanded = expandedJuz === juz.number;
                  return (
                    <motion.div
                      key={juz.number}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.5) }}
                      className="glass-card overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedJuz(isExpanded ? null : juz.number)}
                        className="w-full px-4 py-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-primary">{juz.number}</span>
                        </div>
                        <div className={`flex-1 min-w-0 ${isAr ? 'text-end' : 'text-left'}`}>
                          <p className="text-sm font-medium text-foreground">
                            {isAr ? juz.arabicName : `${t('quran.juz')} ${juz.number} — ${juz.name}`}
                          </p>
                          <p className="text-xs text-muted-foreground">{juz.surahs.length} {t('quran.surah')}{juz.surahs.length > 1 && !isAr ? 's' : ''}</p>
                        </div>
                        {!isAr && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <p className="font-arabic text-lg text-primary/80">{juz.arabicName}</p>
                            <svg
                              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"
                              className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </div>
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-3 space-y-1">
                              {juz.surahs.map((js) => {
                                const surah = surahs.find(s => s.number === js.surahNumber);
                                if (!surah) return null;
                                return (
                                  <button
                                    key={`${juz.number}-${js.surahNumber}`}
                                    onClick={() => navigate(`/quran/${js.surahNumber}?verse=${js.startVerse}`)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] active:scale-[0.97] transition-transform text-left"
                                  >
                                    <span className="text-[10px] font-semibold text-primary/60 w-6 text-center">{surah.number}</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-foreground">{isAr ? surah.arabicName : surah.name}</p>
                                      <p className="text-[10px] text-muted-foreground">
                                        {t('quran.verses')} {js.startVerse}–{js.endVerse}
                                      </p>
                                    </div>
                                    {!isAr && <p className="font-arabic text-sm text-primary/60">{surah.arabicName}</p>}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
