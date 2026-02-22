import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dhikrPresets, type DhikrPreset } from '@/data/dhikr';
import { duaTopics, duas, type DuaTopic, type Dua } from '@/data/duas';

// Post-prayer tasbih sequence
const TASBIH_SEQUENCE = ['subhanallah', 'alhamdulillah', 'allahuakbar'];

type ActiveTab = 'dhikr' | 'duas';
type DuasView = 'topics' | 'list' | 'bookmarks';

/* ── Duas Sub-components ── */

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-sm text-primary mb-4">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
      Back
    </button>
  );
}

function DuaCard({ dua, bookmarked, onToggleBookmark }: { dua: Dua; bookmarked: boolean; onToggleBookmark: () => void }) {
  const topicInfo = duaTopics.find(t => t.id === dua.topic);
  const copyDua = () => {
    const text = `${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}\n\n— ${dua.source}`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 relative">
      <button onClick={onToggleBookmark} className="absolute top-4 right-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarked ? 'hsl(43,50%,54%)' : 'none'} stroke="hsl(43,50%,54%)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
      </button>
      {topicInfo && (
        <p className="text-[10px] uppercase tracking-wider text-primary/50 mb-3">{topicInfo.icon} {topicInfo.label}</p>
      )}
      <p className="font-arabic text-xl text-foreground/90 text-right leading-loose mb-4 pr-6">{dua.arabic}</p>
      <p className="text-xs text-muted-foreground italic mb-2">{dua.transliteration}</p>
      <p className="text-sm text-foreground/80 leading-relaxed mb-3">{dua.translation}</p>
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-primary/60 font-medium">{dua.source}</p>
        <button onClick={copyDua} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy
        </button>
      </div>
    </motion.div>
  );
}

function DuasSection() {
  const [view, setView] = useState<DuasView>('topics');
  const [selectedTopic, setSelectedTopic] = useState<DuaTopic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    const saved = localStorage.getItem('nur_bookmarked_duas');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleBookmark = (id: number) => {
    const updated = bookmarks.includes(id) ? bookmarks.filter(b => b !== id) : [...bookmarks, id];
    setBookmarks(updated);
    localStorage.setItem('nur_bookmarked_duas', JSON.stringify(updated));
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return duas.filter(d =>
      d.arabic.includes(searchQuery) ||
      d.transliteration.toLowerCase().includes(q) ||
      d.translation.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const bookmarkedDuas = useMemo(() => duas.filter(d => bookmarks.includes(d.id)), [bookmarks]);

  return (
    <div className="px-5 pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 pb-4 text-center">
        <p className="font-arabic-display text-5xl text-primary leading-tight">الأدعية</p>
        <p className="text-sm font-light text-foreground/80 mt-1 tracking-wide">Duas & Adhkar</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {view === 'topics' && !selectedTopic && (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Search */}
            <div className="mb-4">
              <div className="glass-card flex items-center px-4 py-2.5 gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search duas..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none flex-1"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-muted-foreground">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                )}
              </div>
            </div>

            {/* Bookmarks pill */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => setView('bookmarks')}
                className="px-4 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                ★ Bookmarks ({bookmarks.length})
              </button>
            </div>

            {searchQuery.trim() ? (
              <div className="space-y-4">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No duas found</p>
                ) : (
                  searchResults.map(dua => (
                    <DuaCard key={dua.id} dua={dua} bookmarked={bookmarks.includes(dua.id)} onToggleBookmark={() => toggleBookmark(dua.id)} />
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {duaTopics.map((topic, i) => (
                  <motion.button
                    key={topic.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedTopic(topic)}
                    className="glass-card p-4 text-left active:scale-[0.97] transition-all"
                  >
                    <span className="text-2xl mb-2 block">{topic.icon}</span>
                    <p className="font-arabic text-sm text-primary/70 mb-0.5">{topic.arabicLabel}</p>
                    <p className="text-xs text-foreground/80 font-medium">{topic.label}</p>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {selectedTopic && (
          <motion.div key="list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <BackButton onClick={() => setSelectedTopic(null)} />
            <div className="mb-5">
              <p className="text-2xl mb-1">{selectedTopic.icon}</p>
              <p className="font-arabic text-lg text-primary/70">{selectedTopic.arabicLabel}</p>
              <p className="text-sm font-semibold text-foreground">{selectedTopic.label}</p>
            </div>
            <div className="space-y-4">
              {duas.filter(d => d.topic === selectedTopic.id).map(dua => (
                <DuaCard key={dua.id} dua={dua} bookmarked={bookmarks.includes(dua.id)} onToggleBookmark={() => toggleBookmark(dua.id)} />
              ))}
            </div>
          </motion.div>
        )}

        {view === 'bookmarks' && (
          <motion.div key="bookmarks" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <BackButton onClick={() => setView('topics')} />
            <p className="text-sm font-semibold text-foreground mb-4">★ Bookmarked Duas</p>
            {bookmarkedDuas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No bookmarked duas yet</p>
            ) : (
              <div className="space-y-4">
                {bookmarkedDuas.map(dua => (
                  <DuaCard key={dua.id} dua={dua} bookmarked onToggleBookmark={() => toggleBookmark(dua.id)} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Dhikr Counter Section ── */

function DhikrCounter() {
  const [selectedPreset, setSelectedPreset] = useState<DhikrPreset>(dhikrPresets[0]);
  const [count, setCount] = useState(0);
  const [showPresets, setShowPresets] = useState(false);
  const [justTapped, setJustTapped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [flashGold, setFlashGold] = useState(false);
  const [completionText, setCompletionText] = useState('');
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progress = Math.min(count / selectedPreset.target, 1);
  const circumference = 2 * Math.PI * 105;
  const strokeDashoffset = circumference * (1 - progress);

  const handleTap = useCallback(() => {
    if (completed || showPresets) return;
    const newCount = count + 1;
    setCount(newCount);
    setJustTapped(true);
    setTimeout(() => setJustTapped(false), 150);
    if (navigator.vibrate) navigator.vibrate(10);

    if (newCount >= selectedPreset.target) {
      setCompleted(true);
      setFlashGold(true);
      setCompletionText(`${selectedPreset.transliteration} ✓`);
      if (navigator.vibrate) navigator.vibrate([40, 30, 40, 30, 60]);

      const seqIdx = TASBIH_SEQUENCE.indexOf(selectedPreset.id);
      if (seqIdx !== -1 && seqIdx < TASBIH_SEQUENCE.length - 1) {
        const nextId = TASBIH_SEQUENCE[seqIdx + 1];
        const nextPreset = dhikrPresets.find(p => p.id === nextId);
        if (nextPreset) {
          advanceTimeoutRef.current = setTimeout(() => {
            setFlashGold(false);
            setSelectedPreset(nextPreset);
            setCount(0);
            setCompleted(false);
            setCompletionText('');
          }, 1800);
        }
      } else {
        setTimeout(() => setFlashGold(false), 1500);
      }
    }
  }, [count, completed, selectedPreset, showPresets]);

  useEffect(() => {
    return () => { if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current); };
  }, []);

  const handleReset = () => {
    setCount(0);
    setCompleted(false);
    setFlashGold(false);
    setCompletionText('');
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
  };

  const selectPreset = (preset: DhikrPreset) => {
    setSelectedPreset(preset);
    setCount(0);
    setCompleted(false);
    setFlashGold(false);
    setCompletionText('');
    setShowPresets(false);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-5 select-none cursor-pointer" onClick={!showPresets ? handleTap : undefined}>
      {/* Gold flash overlay */}
      <AnimatePresence>
        {flashGold && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle at center, rgba(201, 168, 76, 0.15) 0%, transparent 70%)' }}
          />
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="absolute top-28 left-5 right-5 flex items-center justify-between z-30">
        <button onClick={(e) => { e.stopPropagation(); handleReset(); }}
          className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm text-xs text-white/40 active:scale-95 transition-transform">
          Reset
        </button>
        <button onClick={(e) => { e.stopPropagation(); setShowPresets(!showPresets); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm active:scale-95 transition-transform">
          <span className="text-xs text-white/60">{selectedPreset.transliteration}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4"><path d="M7 10l5 5 5-5" /></svg>
        </button>
      </div>

      {/* Arabic text */}
      <motion.p className="font-arabic-display text-3xl text-primary/70 mb-10" animate={justTapped ? { scale: [1, 1.06, 1] } : {}} transition={{ duration: 0.12 }}>
        {selectedPreset.arabic}
      </motion.p>

      {/* Progress ring + count */}
      <div className="relative w-64 h-64 mb-6">
        <svg className="w-full h-full" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r="105" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
          <circle cx="120" cy="120" r="105" fill="none" stroke={completed ? '#C9A84C' : 'url(#goldGradient)'} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} transform="rotate(-90 120 120)"
            style={{ transition: 'stroke-dashoffset 0.2s ease-out', ...(completed ? { filter: 'drop-shadow(0 0 8px rgba(201, 168, 76, 0.5))' } : {}) }}
          />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C9A84C" /><stop offset="100%" stopColor="#E8D48B" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.p key={count} className={`font-light ${completed ? 'text-primary' : 'text-white'}`} style={{ fontSize: '88px', lineHeight: 1 }}
            initial={{ scale: 1.15, opacity: 0.7 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.12 }}>
            {count}
          </motion.p>
          <p className="text-sm text-primary/50 mt-2 font-medium">/ {selectedPreset.target}</p>
        </div>
      </div>

      <p className="text-sm text-white/30 italic">{selectedPreset.translation}</p>

      <AnimatePresence>
        {completed && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-6 text-center">
            <p className="text-primary text-lg font-semibold">{completionText}</p>
            {TASBIH_SEQUENCE.indexOf(selectedPreset.id) !== -1 && TASBIH_SEQUENCE.indexOf(selectedPreset.id) < TASBIH_SEQUENCE.length - 1 && (
              <p className="text-[11px] text-white/30 mt-1">Advancing to next dhikr...</p>
            )}
            {(TASBIH_SEQUENCE.indexOf(selectedPreset.id) === TASBIH_SEQUENCE.length - 1 || TASBIH_SEQUENCE.indexOf(selectedPreset.id) === -1) && (
              <p className="text-[11px] text-white/30 mt-1">Tap reset to start again</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!completed && count === 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-32 text-[11px] text-white/15 tracking-wider">
          Tap anywhere to count
        </motion.p>
      )}

      {/* Preset drawer */}
      <AnimatePresence>
        {showPresets && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowPresets(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 pb-32 border-t border-white/[0.08]"
              style={{ background: 'hsla(230, 25%, 12%, 0.95)', backdropFilter: 'blur(30px)' }}
              onClick={(e) => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full bg-white/15 mx-auto mb-6" />
              <h3 className="text-base font-semibold text-white/80 mb-4">Select Dhikr</h3>
              <div className="space-y-2.5">
                {dhikrPresets.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  const isInSequence = TASBIH_SEQUENCE.includes(preset.id);
                  return (
                    <button key={preset.id} onClick={() => selectPreset(preset)}
                      className={`w-full rounded-xl p-4 text-left transition-all border ${isSelected ? 'bg-primary/10 border-primary/30' : 'bg-white/[0.04] border-white/[0.06]'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-white/70'}`}>
                            {preset.transliteration}
                            {isInSequence && <span className="text-[9px] text-white/20 ml-2">tasbih</span>}
                          </p>
                          <p className="text-[11px] text-white/30 mt-0.5">{preset.translation}</p>
                        </div>
                        <p className="font-arabic text-lg text-primary/50">{preset.arabic}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Page with Tab Toggle ── */

export default function Dhikr() {
  const [tab, setTab] = useState<ActiveTab>('dhikr');

  return (
    <div className="min-h-screen safe-area-top relative overflow-hidden flex flex-col" style={{ background: 'linear-gradient(180deg, #070D1A 0%, #0C1629 40%, #0A1020 100%)' }}>
      <div className="geometric-pattern absolute inset-0 pointer-events-none opacity-20" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-30 pt-12 pb-2 text-center">
        <p className="font-arabic-display text-5xl text-primary leading-tight">الأَذْكَار وَالأَدْعِيَة</p>
        <p className="text-sm font-light text-foreground/80 mt-1 tracking-wide">Adhkar & Duas</p>
      </motion.div>

      {/* Pill toggle */}
      <div className="relative z-30 flex justify-center pt-2 pb-2">
        <div className="inline-flex rounded-full p-1 bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm">
          {(['dhikr', 'duas'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-6 py-1.5 rounded-full text-xs font-medium transition-all ${
                tab === t ? 'text-primary' : 'text-white/40'
              }`}
            >
              {tab === t && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-primary/15 border border-primary/25"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
              <span className="relative z-10 capitalize">{t}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === 'dhikr' ? (
          <motion.div key="dhikr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex-1 flex flex-col">
            <DhikrCounter />
          </motion.div>
        ) : (
          <motion.div key="duas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex-1 overflow-y-auto">
            <DuasSection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
