import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { duaTopics, duas, type DuaTopic, type Dua } from '@/data/duas';

type DuasView = 'topics' | 'list' | 'bookmarks';

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
      {/* Bookmark */}
      <button onClick={onToggleBookmark} className="absolute top-4 right-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarked ? 'hsl(43,50%,54%)' : 'none'} stroke="hsl(43,50%,54%)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
      </button>

      {/* Topic label (shown in search/bookmarks) */}
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

function TopicGrid({ onSelect }: { onSelect: (topic: DuaTopic) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {duaTopics.map((topic, i) => (
        <motion.button
          key={topic.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          onClick={() => onSelect(topic)}
          className="glass-card p-4 text-left active:scale-[0.97] transition-all"
        >
          <span className="text-2xl mb-2 block">{topic.icon}</span>
          <p className="font-arabic text-sm text-primary/70 mb-0.5">{topic.arabicLabel}</p>
          <p className="text-xs text-foreground/80 font-medium">{topic.label}</p>
        </motion.button>
      ))}
    </div>
  );
}

function DuasList({ topic, bookmarks, onToggleBookmark, onBack }: {
  topic: DuaTopic;
  bookmarks: number[];
  onToggleBookmark: (id: number) => void;
  onBack: () => void;
}) {
  const topicDuas = duas.filter(d => d.topic === topic.id);

  return (
    <div>
      <BackButton onClick={onBack} />
      <div className="mb-5">
        <p className="text-2xl mb-1">{topic.icon}</p>
        <p className="font-arabic text-lg text-primary/70">{topic.arabicLabel}</p>
        <p className="text-sm font-semibold text-foreground">{topic.label}</p>
      </div>
      <div className="space-y-4">
        {topicDuas.map(dua => (
          <DuaCard key={dua.id} dua={dua} bookmarked={bookmarks.includes(dua.id)} onToggleBookmark={() => onToggleBookmark(dua.id)} />
        ))}
      </div>
    </div>
  );
}

export default function Duas() {
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
    <div className="min-h-screen safe-area-top pb-24 relative night-sky-bg">
      <div className="geometric-pattern absolute inset-0 pointer-events-none" />

      <div className="relative z-10 px-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-12 pb-4 text-center">
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

              {/* Search results or topic grid */}
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
                <TopicGrid onSelect={t => setSelectedTopic(t)} />
              )}
            </motion.div>
          )}

          {selectedTopic && (
            <motion.div key="list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <DuasList topic={selectedTopic} bookmarks={bookmarks} onToggleBookmark={toggleBookmark} onBack={() => setSelectedTopic(null)} />
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
    </div>
  );
}
