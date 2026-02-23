import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dhikrPresets, type DhikrPreset } from '@/data/dhikr';
import { duaTopics, duas, type DuaTopic, type Dua } from '@/data/duas';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// Post-prayer tasbih sequence
const TASBIH_SEQUENCE = ['subhanallah', 'alhamdulillah', 'allahuakbar'];

type ActiveTab = 'dhikr' | 'duas';
type DuasView = 'topics' | 'list' | 'bookmarks' | 'myDuas';

const DHIKR_SESSION_KEY = 'nur_dhikr_session';
const PERSONAL_DUAS_KEY = 'nur_personal_duas';

interface PersonalDua {
  id: number;
  title: string;
  arabic: string;
  text: string;
  createdAt: string;
}

function getDhikrSession(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(DHIKR_SESSION_KEY) || '{}');
  } catch { return {}; }
}

function saveDhikrSession(session: Record<string, number>) {
  localStorage.setItem(DHIKR_SESSION_KEY, JSON.stringify(session));
}

function getPersonalDuas(): PersonalDua[] {
  try {
    return JSON.parse(localStorage.getItem(PERSONAL_DUAS_KEY) || '[]');
  } catch { return []; }
}

function savePersonalDuas(duas: PersonalDua[]) {
  localStorage.setItem(PERSONAL_DUAS_KEY, JSON.stringify(duas));
}

/* ── Duas Sub-components ── */

function BackButton({ onClick }: { onClick: () => void }) {
  const { t, lang } = useLanguage();
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-sm text-primary mb-4">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={lang === 'ar' ? '-scale-x-100' : ''}><polyline points="15 18 9 12 15 6" /></svg>
      {t('duas.back')}
    </button>
  );
}

function DuaCard({ dua, bookmarked, onToggleBookmark, isPersonal, onEdit, onDelete }: {
  dua: Dua | PersonalDua;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  isPersonal?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { t } = useLanguage();
  const isCurated = 'topic' in dua;
  const topicInfo = isCurated ? duaTopics.find(t => t.id === (dua as Dua).topic) : null;

  const copyDua = () => {
    const text = isCurated
      ? `${(dua as Dua).arabic}\n\n${(dua as Dua).transliteration}\n\n${(dua as Dua).translation}\n\n— ${(dua as Dua).source}`
      : `${(dua as PersonalDua).title}\n\n${(dua as PersonalDua).arabic}\n\n${(dua as PersonalDua).text}`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 relative">
      <button onClick={onToggleBookmark} className="absolute top-4 end-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarked ? 'hsl(43,50%,54%)' : 'none'} stroke="hsl(43,50%,54%)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
      </button>

      {topicInfo && (
        <p className="text-[10px] uppercase tracking-wider text-primary/50 mb-3">{topicInfo.icon} {topicInfo.label}</p>
      )}

      {isPersonal && (
        <p className="text-[10px] uppercase tracking-wider text-primary/50 mb-3">✏️ {t('duas.personal')}</p>
      )}

      {isPersonal && (
        <p className="text-sm font-semibold text-foreground mb-2">{(dua as PersonalDua).title}</p>
      )}

      {isCurated ? (
        <>
          <p className="font-arabic text-xl text-foreground/90 text-right leading-loose mb-4 pe-6">{(dua as Dua).arabic}</p>
          <p className="text-xs text-muted-foreground italic mb-2">{(dua as Dua).transliteration}</p>
          <p className="text-sm text-foreground/80 leading-relaxed mb-3">{(dua as Dua).translation}</p>
        </>
      ) : (
        <>
          {(dua as PersonalDua).arabic && (
            <p className="font-arabic text-xl text-foreground/90 text-right leading-loose mb-4">{(dua as PersonalDua).arabic}</p>
          )}
          <p className="text-sm text-foreground/80 leading-relaxed mb-3">{(dua as PersonalDua).text}</p>
        </>
      )}

      <div className="flex items-center justify-between">
        {isCurated ? (
          <p className="text-[10px] text-primary/60 font-medium">{(dua as Dua).source}</p>
        ) : (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button onClick={onEdit} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="text-[10px] text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            )}
          </div>
        )}
        <button onClick={copyDua} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          {t('duas.copy')}
        </button>
      </div>
    </motion.div>
  );
}

/* ── Personal Dua Modal ── */

function PersonalDuaModal({ open, onClose, onSave, editingDua }: {
  open: boolean;
  onClose: () => void;
  onSave: (dua: Omit<PersonalDua, 'id' | 'createdAt'>) => void;
  editingDua?: PersonalDua | null;
}) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [arabic, setArabic] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    if (editingDua) {
      setTitle(editingDua.title);
      setArabic(editingDua.arabic);
      setText(editingDua.text);
    } else {
      setTitle('');
      setArabic('');
      setText('');
    }
  }, [editingDua, open]);

  const handleSave = () => {
    if (!title.trim() || !text.trim()) return;
    onSave({ title: title.trim(), arabic: arabic.trim(), text: text.trim() });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card-strong border-primary/20 max-w-[380px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground text-sm font-semibold">
            {editingDua ? t('duas.editDua') : t('duas.addDua')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {editingDua ? t('duas.editDua') : t('duas.addDua')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <input
            type="text"
            placeholder={t('duas.titleField')}
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/30"
          />
          <textarea
            placeholder={t('duas.arabicField')}
            value={arabic}
            onChange={e => setArabic(e.target.value)}
            dir="rtl"
            className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/30 font-arabic text-right min-h-[80px] resize-none"
          />
          <textarea
            placeholder={t('duas.textField')}
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/30 min-h-[100px] resize-none"
          />
          <button
            onClick={handleSave}
            disabled={!title.trim() || !text.trim()}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.97] transition-all disabled:opacity-40"
          >
            {t('duas.save')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Duas Section ── */

function DuasSection() {
  const { t } = useLanguage();
  const [view, setView] = useState<DuasView>('topics');
  const [selectedTopic, setSelectedTopic] = useState<DuaTopic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    const saved = localStorage.getItem('nur_bookmarked_duas');
    return saved ? JSON.parse(saved) : [];
  });
  const [personalBookmarks, setPersonalBookmarks] = useState<number[]>(() => {
    const saved = localStorage.getItem('nur_bookmarked_personal_duas');
    return saved ? JSON.parse(saved) : [];
  });
  const [personalDuas, setPersonalDuas] = useState<PersonalDua[]>(getPersonalDuas);
  const [showModal, setShowModal] = useState(false);
  const [editingDua, setEditingDua] = useState<PersonalDua | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const toggleBookmark = (id: number) => {
    const updated = bookmarks.includes(id) ? bookmarks.filter(b => b !== id) : [...bookmarks, id];
    setBookmarks(updated);
    localStorage.setItem('nur_bookmarked_duas', JSON.stringify(updated));
  };

  const togglePersonalBookmark = (id: number) => {
    const updated = personalBookmarks.includes(id) ? personalBookmarks.filter(b => b !== id) : [...personalBookmarks, id];
    setPersonalBookmarks(updated);
    localStorage.setItem('nur_bookmarked_personal_duas', JSON.stringify(updated));
  };

  const handleSavePersonalDua = (data: Omit<PersonalDua, 'id' | 'createdAt'>) => {
    let updated: PersonalDua[];
    if (editingDua) {
      updated = personalDuas.map(d => d.id === editingDua.id ? { ...d, ...data } : d);
    } else {
      const newId = Date.now();
      updated = [...personalDuas, { ...data, id: newId, createdAt: new Date().toISOString() }];
    }
    setPersonalDuas(updated);
    savePersonalDuas(updated);
    setEditingDua(null);
  };

  const handleDeletePersonalDua = (id: number) => {
    const updated = personalDuas.filter(d => d.id !== id);
    setPersonalDuas(updated);
    savePersonalDuas(updated);
    setPersonalBookmarks(prev => prev.filter(b => b !== id));
    localStorage.setItem('nur_bookmarked_personal_duas', JSON.stringify(personalBookmarks.filter(b => b !== id)));
    setDeleteConfirmId(null);
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
  const bookmarkedPersonalDuas = useMemo(() => personalDuas.filter(d => personalBookmarks.includes(d.id)), [personalDuas, personalBookmarks]);
  const totalBookmarks = bookmarks.length + personalBookmarks.length;

  return (
    <div className="px-5 pb-24">
      <div className="pt-2 pb-2" />

      <AnimatePresence mode="wait">
        {view === 'topics' && !selectedTopic && (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-4">
              <div className="glass-card flex items-center px-4 py-2.5 gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder={t('duas.search')}
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

            <div className="flex gap-2 mb-5">
              <button
                onClick={() => setView('bookmarks')}
                className="px-4 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                ★ {t('duas.bookmarks')} ({totalBookmarks})
              </button>
            </div>

            {searchQuery.trim() ? (
              <div className="space-y-4">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">{t('duas.noResults')}</p>
                ) : (
                  searchResults.map(dua => (
                    <DuaCard key={dua.id} dua={dua} bookmarked={bookmarks.includes(dua.id)} onToggleBookmark={() => toggleBookmark(dua.id)} />
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* My Duas - first in grid */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setView('myDuas')}
                  className="glass-card p-4 text-start active:scale-[0.97] transition-all border-primary/30"
                  style={{ border: '1px solid hsl(43 50% 54% / 0.3)' }}
                >
                  <span className="text-2xl mb-2 block">✏️</span>
                  <p className="font-arabic text-sm text-primary/70 mb-0.5">{t('duas.myDuasArabic')}</p>
                  <p className="text-xs text-foreground/80 font-medium">{t('duas.myDuas')}</p>
                  {personalDuas.length > 0 && (
                    <p className="text-[10px] text-primary/50 mt-1">{personalDuas.length}</p>
                  )}
                </motion.button>

                {duaTopics.map((topic, i) => (
                  <motion.button
                    key={topic.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i + 1) * 0.03 }}
                    onClick={() => setSelectedTopic(topic)}
                    className="glass-card p-4 text-start active:scale-[0.97] transition-all"
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

        {view === 'myDuas' && (
          <motion.div key="myDuas" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <BackButton onClick={() => setView('topics')} />
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-foreground">✏️ {t('duas.myDuas')}</p>
              <button
                onClick={() => { setEditingDua(null); setShowModal(true); }}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/25 active:scale-95 transition-transform"
              >
                + {t('duas.addDua')}
              </button>
            </div>

            {personalDuas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-4">🤲</p>
                <p className="text-sm text-muted-foreground mb-4">{t('duas.emptyState')}</p>
                <button
                  onClick={() => { setEditingDua(null); setShowModal(true); }}
                  className="px-5 py-2.5 rounded-xl bg-primary/15 text-primary text-sm font-semibold border border-primary/25 active:scale-95 transition-transform"
                >
                  {t('duas.addDua')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {personalDuas.map(dua => (
                  <DuaCard
                    key={dua.id}
                    dua={dua}
                    bookmarked={personalBookmarks.includes(dua.id)}
                    onToggleBookmark={() => togglePersonalBookmark(dua.id)}
                    isPersonal
                    onEdit={() => { setEditingDua(dua); setShowModal(true); }}
                    onDelete={() => setDeleteConfirmId(dua.id)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {view === 'bookmarks' && (
          <motion.div key="bookmarks" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <BackButton onClick={() => setView('topics')} />
            <p className="text-sm font-semibold text-foreground mb-4">★ {t('duas.bookmarkedDuas')}</p>
            {totalBookmarks === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('duas.noBookmarks')}</p>
            ) : (
              <div className="space-y-4">
                {bookmarkedPersonalDuas.map(dua => (
                  <DuaCard key={`p-${dua.id}`} dua={dua} bookmarked isPersonal onToggleBookmark={() => togglePersonalBookmark(dua.id)} />
                ))}
                {bookmarkedDuas.map(dua => (
                  <DuaCard key={dua.id} dua={dua} bookmarked onToggleBookmark={() => toggleBookmark(dua.id)} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <PersonalDuaModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditingDua(null); }}
        onSave={handleSavePersonalDua}
        editingDua={editingDua}
      />

      {/* Delete confirmation */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="glass-card-strong border-primary/20 max-w-[340px] rounded-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-foreground text-sm">{t('duas.deleteConfirm')}</DialogTitle>
            <DialogDescription className="sr-only">{t('duas.deleteConfirm')}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirmId(null)}
              className="flex-1 py-2.5 rounded-xl bg-secondary/30 text-foreground/70 text-sm font-medium">
              {t('duas.cancel')}
            </button>
            <button onClick={() => deleteConfirmId !== null && handleDeletePersonalDua(deleteConfirmId)}
              className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold border border-red-500/20">
              {t('duas.delete')}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Dhikr Counter Section ── */

function DhikrCounter() {
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';
  const [session, setSession] = useState<Record<string, number>>(getDhikrSession);
  const [selectedPreset, setSelectedPreset] = useState<DhikrPreset>(dhikrPresets[0]);
  const [count, setCount] = useState(() => {
    const s = getDhikrSession();
    return s[dhikrPresets[0].id] || 0;
  });
  const [showPresets, setShowPresets] = useState(false);
  const [justTapped, setJustTapped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [flashGold, setFlashGold] = useState(false);
  const [completionText, setCompletionText] = useState('');
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progress = Math.min(count / selectedPreset.target, 1);
  const circumference = 2 * Math.PI * 105;
  const strokeDashoffset = circumference * (1 - progress);

  useEffect(() => {
    const newSession = { ...session, [selectedPreset.id]: count };
    setSession(newSession);
    saveDhikrSession(newSession);
  }, [count, selectedPreset.id]);

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
            const savedCount = session[nextPreset.id] || 0;
            setCount(savedCount);
            setCompleted(savedCount >= nextPreset.target);
            setCompletionText('');
          }, 1800);
        }
      } else {
        setTimeout(() => setFlashGold(false), 1500);
      }
    }
  }, [count, completed, selectedPreset, showPresets, session]);

  useEffect(() => {
    return () => { if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current); };
  }, []);

  const handleReset = () => {
    const cleared: Record<string, number> = {};
    dhikrPresets.forEach(p => { cleared[p.id] = 0; });
    setSession(cleared);
    saveDhikrSession(cleared);
    setCount(0);
    setCompleted(false);
    setFlashGold(false);
    setCompletionText('');
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
  };

  const selectPreset = (preset: DhikrPreset) => {
    const newSession = { ...session, [selectedPreset.id]: count };
    setSession(newSession);
    saveDhikrSession(newSession);

    setSelectedPreset(preset);
    const savedCount = newSession[preset.id] || 0;
    setCount(savedCount);
    setCompleted(savedCount >= preset.target);
    setFlashGold(false);
    setCompletionText('');
    setShowPresets(false);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-5 select-none cursor-pointer" onClick={!showPresets ? handleTap : undefined}>
      <AnimatePresence>
        {flashGold && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle at center, rgba(201, 168, 76, 0.15) 0%, transparent 70%)' }}
          />
        )}
      </AnimatePresence>

      <div className="absolute top-28 left-5 right-5 flex items-center justify-between z-30">
        <button onClick={(e) => { e.stopPropagation(); handleReset(); }}
          className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm text-xs text-white/40 active:scale-95 transition-transform">
          {t('dhikr.reset')}
        </button>
        <button onClick={(e) => { e.stopPropagation(); setShowPresets(!showPresets); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm active:scale-95 transition-transform">
          <span className="text-white/60" style={{ fontSize: lang === 'ar' ? '16px' : '12px' }}>{lang === 'ar' ? selectedPreset.arabic : selectedPreset.transliteration}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4"><path d="M7 10l5 5 5-5" /></svg>
        </button>
      </div>

      <motion.p className="font-arabic-display text-primary/70 mb-10" style={{ fontSize: '36px' }} animate={justTapped ? { scale: [1, 1.06, 1] } : {}} transition={{ duration: 0.12 }}>
        {selectedPreset.arabic}
      </motion.p>

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

      {!isAr && <p className="text-sm text-white/30 italic">{selectedPreset.translation}</p>}

      <AnimatePresence>
        {completed && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-6 text-center">
            <p className="text-primary text-lg font-semibold">{completionText}</p>
            {TASBIH_SEQUENCE.indexOf(selectedPreset.id) !== -1 && TASBIH_SEQUENCE.indexOf(selectedPreset.id) < TASBIH_SEQUENCE.length - 1 && (
              <p className="text-[11px] text-white/30 mt-1">{t('dhikr.advancingNext')}</p>
            )}
            {(TASBIH_SEQUENCE.indexOf(selectedPreset.id) === TASBIH_SEQUENCE.length - 1 || TASBIH_SEQUENCE.indexOf(selectedPreset.id) === -1) && (
              <p className="text-[11px] text-white/30 mt-1">{t('dhikr.tapReset')}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!completed && count === 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-32 text-[11px] text-white/15 tracking-wider">
          {t('dhikr.tapAnywhere')}
        </motion.p>
      )}

      <AnimatePresence>
        {showPresets && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowPresets(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 pb-32 border-t border-white/[0.08]"
              style={{ background: 'hsla(230, 25%, 12%, 0.95)', backdropFilter: 'blur(30px)' }}
              onClick={(e) => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full bg-white/15 mx-auto mb-6" />
              <h3 className="text-base font-semibold text-white/80 mb-4">{t('dhikr.selectDhikr')}</h3>
              <div className="space-y-2.5">
                {dhikrPresets.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  const isInSequence = TASBIH_SEQUENCE.includes(preset.id);
                  const savedCount = session[preset.id] || 0;
                  const presetProgress = Math.min(savedCount / preset.target, 1);
                  return (
                    <button key={preset.id} onClick={() => selectPreset(preset)}
                      className={`w-full rounded-xl p-4 text-start transition-all border ${isSelected ? 'bg-primary/10 border-primary/30' : 'bg-white/[0.04] border-white/[0.06]'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-white/70'}`}>
                            {lang === 'ar' ? preset.arabic : preset.transliteration}
                            {isInSequence && <span className="text-[9px] text-white/20 ms-2">tasbih</span>}
                          </p>
                          {!isAr && <p className="text-[11px] text-white/30 mt-0.5">{preset.translation}</p>}
                          {savedCount > 0 && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden max-w-[100px]">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${presetProgress * 100}%`,
                                    background: presetProgress >= 1 ? '#C9A84C' : 'rgba(201, 168, 76, 0.5)',
                                  }}
                                />
                              </div>
                              <span className="text-[9px] text-white/25">{savedCount}/{preset.target}</span>
                            </div>
                          )}
                        </div>
                        <p className="font-arabic text-lg text-primary/50 flex-shrink-0 ms-3">{preset.arabic}</p>
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
  const { t } = useLanguage();
  const [tab, setTab] = useState<ActiveTab>('dhikr');

  return (
    <div className="min-h-screen safe-area-top relative overflow-hidden flex flex-col night-sky-bg">
      <div className="geometric-pattern absolute inset-0 pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-30 pt-12 pb-2 text-center">
        <p className="font-arabic-display text-5xl text-primary leading-tight">الأَذْكَار وَالأَدْعِيَة</p>
      </motion.div>

      <div className="relative z-30 flex justify-center pt-2 pb-2">
        <div className="inline-flex rounded-full p-1 bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm">
          {(['dhikr', 'duas'] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`relative px-6 py-1.5 rounded-full text-xs font-medium transition-all ${
                tab === tabKey ? 'text-primary' : 'text-white/40'
              }`}
            >
              {tab === tabKey && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-primary/15 border border-primary/25"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
              <span className="relative z-10">{tabKey === 'dhikr' ? t('nav.dhikr') : t('duas.title')}</span>
            </button>
          ))}
        </div>
      </div>

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
