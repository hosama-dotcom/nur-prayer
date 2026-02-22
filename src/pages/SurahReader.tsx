import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { surahs } from '@/data/surahs';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { z } from 'zod';

const verseSchema = z.object({
  id: z.number(),
  verse_key: z.string(),
  verse_number: z.number(),
  text_uthmani: z.string(),
  page_number: z.number().optional(),
  juz_number: z.number().optional(),
  translations: z.array(z.object({ text: z.string() })).optional().default([]),
});

const apiResponseSchema = z.object({
  verses: z.array(verseSchema),
  pagination: z.object({
    total_pages: z.number(),
    current_page: z.number(),
    total_records: z.number(),
  }),
});

const audioResponseSchema = z.object({
  audio_file: z.object({
    audio_url: z.string().url(),
  }).nullable().optional(),
});

const RECITERS = [
  { id: 7, name: 'Mishary Rashid Al-Afasy', short: 'Afasy' },
  { id: 1, name: 'Abdul Rahman Al-Sudais', short: 'Sudais' },
  { id: 5, name: 'Mahmoud Khalil Al-Husary', short: 'Husary' },
  { id: 9, name: 'Saad Al-Ghamdi', short: 'Ghamdi' },
  { id: 6, name: 'Abu Bakr Al-Shatri', short: 'Shatri' },
];
const RECITER_KEY = 'nur-reciter-id';

interface Verse {
  id: number;
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
  page_number?: number;
  juz_number?: number;
  translations: { text: string }[];
}

interface ApiResponse {
  verses: Verse[];
  pagination: { total_pages: number; current_page: number; total_records: number };
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

const FONT_SIZE_KEY = 'nur-quran-font-size';
const getStoredFontSize = () => {
  const stored = localStorage.getItem(FONT_SIZE_KEY);
  return stored ? parseInt(stored, 10) : 28;
};

function saveLastRead(surahNumber: number, verseNumber: number) {
  localStorage.setItem('nur_last_read', JSON.stringify({
    surahNumber, verseNumber, timestamp: Date.now()
  }));
}

export interface Bookmark {
  surahNumber: number;
  verseNumber: number;
  surahName: string;
  timestamp: number;
}

export function getBookmarks(): Bookmark[] {
  try {
    return JSON.parse(localStorage.getItem('nur_bookmarks') || '[]');
  } catch { return []; }
}

function toggleBookmark(surahNumber: number, verseNumber: number, surahName: string) {
  const bookmarks = getBookmarks();
  const idx = bookmarks.findIndex(b => b.surahNumber === surahNumber && b.verseNumber === verseNumber);
  if (idx !== -1) {
    bookmarks.splice(idx, 1);
  } else {
    bookmarks.push({ surahNumber, verseNumber, surahName, timestamp: Date.now() });
  }
  localStorage.setItem('nur_bookmarks', JSON.stringify(bookmarks));
  return bookmarks;
}

export default function SurahReader() {
  const { number } = useParams<{ number: string }>();
  const [searchParams] = useSearchParams();
  const scrollToVerse = searchParams.get('verse') ? parseInt(searchParams.get('verse')!, 10) : null;
  const navigate = useNavigate();
  const chapterNum = parseInt(number || '1', 10);
  const surah = surahs.find(s => s.number === chapterNum);

  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fontSize, setFontSize] = useState(getStoredFontSize);
  const [showTranslation, setShowTranslation] = useState(false);
  const [currentJuz, setCurrentJuz] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const [scrollActive, setScrollActive] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(getBookmarks);

  // Audio
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [reciterId, setReciterId] = useState(() => {
    const stored = localStorage.getItem(RECITER_KEY);
    return stored ? parseInt(stored, 10) : 7;
  });
  const [showReciterPicker, setShowReciterPicker] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const verseRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  const scrollDoneRef = useRef(false);

  // Track visible verse for last-read saving
  const visibleVerseRef = useRef<number>(1);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setVerses([]);
    setPage(1);
    setLoading(true);
    setError(null);
    setIsPlaying(false);
    setAudioCurrentTime(0);
    setAudioDuration(0);
    setAudioUrl(null);
    scrollDoneRef.current = false;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
  }, [chapterNum]);

  useEffect(() => {
    const fetchVerses = async () => {
      setLoading(true);
      try {
        // Fetch verses and translations in parallel
        const [versesRes, translationsRes] = await Promise.all([
          fetch(`https://api.quran.com/api/v4/verses/by_chapter/${chapterNum}?language=en&words=false&fields=text_uthmani,page_number,juz_number&per_page=50&page=${page}`),
          fetch(`https://api.quran.com/api/v4/quran/translations/20?chapter_number=${chapterNum}`),
        ]);
        if (!versesRes.ok) throw new Error('Failed to fetch verses');
        const raw = await versesRes.json();
        const parsed = apiResponseSchema.safeParse(raw);
        if (!parsed.success) throw new Error('Invalid verse data received');
        const data = parsed.data as ApiResponse;

        // Merge translations into verses
        let translationTexts: string[] = [];
        if (translationsRes.ok) {
          const tData = await translationsRes.json();
          translationTexts = (tData.translations || []).map((t: { text: string }) => t.text);
        }

        const versesWithTranslations = data.verses.map((v, i) => ({
          ...v,
          translations: translationTexts[i + (page - 1) * 50] ? [{ text: translationTexts[i + (page - 1) * 50] }] : [],
        }));

        setVerses(prev => page === 1 ? versesWithTranslations : [...prev, ...versesWithTranslations]);
        setTotalPages(data.pagination.total_pages);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVerses();
  }, [chapterNum, page]);

  // Scroll to verse after load
  useEffect(() => {
    if (!scrollToVerse || scrollDoneRef.current || verses.length === 0) return;
    const el = verseRefs.current.get(scrollToVerse);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        scrollDoneRef.current = true;
      }, 300);
    }
  }, [verses, scrollToVerse]);

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const res = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${reciterId}/${chapterNum}`);
        const raw = await res.json();
        const parsed = audioResponseSchema.safeParse(raw);
        if (parsed.success && parsed.data.audio_file?.audio_url) {
          setAudioUrl(parsed.data.audio_file.audio_url);
        }
      } catch { /* silent */ }
    };
    fetchAudio();
  }, [chapterNum, reciterId]);

  const changeReciter = (id: number) => {
    if (id === reciterId) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsPlaying(false);
    setAudioCurrentTime(0);
    setAudioDuration(0);
    setAudioUrl(null);
    setReciterId(id);
    localStorage.setItem(RECITER_KEY, String(id));
    setShowReciterPicker(false);
  };

  // Infinite scroll
  useEffect(() => {
    if (loading || page >= totalPages) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const timeout = setTimeout(() => {
      observerRef.current = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setPage(p => p + 1); },
        { threshold: 0.1 }
      );
      if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    }, 100);
    return () => { clearTimeout(timeout); observerRef.current?.disconnect(); };
  }, [loading, page, totalPages]);

  // Save reading progress on scroll + track current juz/page
  const scrollFadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Find which verse badge is closest to viewport center
      const viewportCenter = window.innerHeight / 2;
      let closestVerse = 1;
      let closestDist = Infinity;
      verseRefs.current.forEach((el, num) => {
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - viewportCenter);
        if (dist < closestDist) { closestDist = dist; closestVerse = num; }
      });
      visibleVerseRef.current = closestVerse;

      // Update floating Juz/page indicator
      const currentVerseData = verses.find(v => v.verse_number === closestVerse);
      if (currentVerseData) {
        if (currentVerseData.juz_number) setCurrentJuz(currentVerseData.juz_number);
        if (currentVerseData.page_number) setCurrentPage(currentVerseData.page_number);
      }

      // Show indicator on scroll, fade after 2s
      setScrollActive(true);
      if (scrollFadeRef.current) clearTimeout(scrollFadeRef.current);
      scrollFadeRef.current = setTimeout(() => setScrollActive(false), 2000);

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveLastRead(chapterNum, visibleVerseRef.current);
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (scrollFadeRef.current) clearTimeout(scrollFadeRef.current);
    };
  }, [chapterNum, verses]);

  // Save on mount + init juz/page
  useEffect(() => {
    if (verses.length > 0) {
      saveLastRead(chapterNum, scrollToVerse || 1);
      const first = verses[0];
      if (first.juz_number && !currentJuz) setCurrentJuz(first.juz_number);
      if (first.page_number && !currentPage) setCurrentPage(first.page_number);
    }
  }, [chapterNum, verses.length, scrollToVerse]);

  const adjustFontSize = (delta: number) => {
    setFontSize(prev => {
      const next = Math.max(20, Math.min(40, prev + delta));
      localStorage.setItem(FONT_SIZE_KEY, String(next));
      return next;
    });
  };

  const togglePlay = useCallback(() => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      // Handle case where metadata already loaded
      if (audio.readyState >= 1 && audio.duration && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
      audio.addEventListener('loadedmetadata', () => { if (audio.duration && isFinite(audio.duration)) setAudioDuration(audio.duration); });
      audio.addEventListener('durationchange', () => { if (audio.duration && isFinite(audio.duration)) setAudioDuration(audio.duration); });
      audio.addEventListener('timeupdate', () => setAudioCurrentTime(audio.currentTime));
      audio.addEventListener('ended', () => { setIsPlaying(false); setAudioCurrentTime(0); });
    }
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  }, [audioUrl, isPlaying]);

  const skipBack = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
      setAudioCurrentTime(audioRef.current.currentTime);
    }
  };

  const seekAudio = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setAudioCurrentTime(value[0]);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleBookmark = (verseNum: number) => {
    const updated = toggleBookmark(chapterNum, verseNum, surah?.name || '');
    setBookmarks(updated);
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const isBookmarked = (verseNum: number) =>
    bookmarks.some(b => b.surahNumber === chapterNum && b.verseNumber === verseNum);

  const VerseBadge = ({ num }: { num: number }) => (
    <span
      ref={(el) => { if (el) verseRefs.current.set(num, el); }}
      className="inline-flex items-center justify-center mx-1 align-middle rounded-full border border-primary/30 text-primary cursor-pointer"
      style={{
        width: '20px',
        height: '20px',
        fontSize: '9px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        lineHeight: 1,
        verticalAlign: 'middle',
        background: isBookmarked(num) ? 'hsla(var(--primary) / 0.35)' : 'hsla(var(--primary) / 0.12)',
      }}
      onClick={(e) => { e.stopPropagation(); handleBookmark(num); }}
    >
      {num}
    </span>
  );

  return (
    <div className="min-h-screen gradient-isha safe-area-top" style={{ paddingBottom: audioUrl ? '180px' : '120px' }}>
      <div className="geometric-pattern absolute inset-0 pointer-events-none opacity-30" />
      <div className="relative z-10">

        {/* Header */}
        <div className="sticky top-0 z-20 px-5 pt-8 pb-4" style={{ background: 'linear-gradient(180deg, #0A0A1A 0%, #0A0A1Ae6 60%, #0A0A1A00 100%)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/quran')}
              className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center backdrop-blur-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="flex-1 text-center min-w-0">
              <p className="font-arabic-display text-xl text-primary leading-relaxed">{surah?.arabicName}</p>
              <p className="text-[11px] text-muted-foreground" style={{ fontWeight: 300, letterSpacing: '0.12em' }}>
                {surah?.name} · {surah?.englishName}
              </p>
            </div>
            <div className="text-right w-10">
              <p className="text-[9px] text-muted-foreground leading-tight">{surah?.versesCount} ayat</p>
              <p className="text-[9px] text-muted-foreground leading-tight">{surah?.revelationType}</p>
            </div>
          </div>
        </div>

        {/* Floating toolbar */}
        <div className="fixed top-20 right-4 z-30 flex items-center gap-2">
          <button
            onClick={() => setShowReciterPicker(p => !p)}
            className="h-8 px-2.5 rounded-full text-[10px] font-semibold backdrop-blur-sm bg-secondary/70 text-muted-foreground transition-colors"
          >
            {RECITERS.find(r => r.id === reciterId)?.short || 'Afasy'}
          </button>
          <button
            onClick={() => setShowTranslation(t => !t)}
            className={`h-8 px-2.5 rounded-full text-[10px] font-semibold backdrop-blur-sm transition-colors ${
              showTranslation ? 'bg-primary/25 text-primary' : 'bg-secondary/70 text-muted-foreground'
            }`}
          >
            EN
          </button>
          <div className="flex items-center bg-secondary/70 backdrop-blur-sm rounded-full overflow-hidden">
            <button onClick={() => adjustFontSize(-2)} className="h-8 w-8 flex items-center justify-center text-primary text-[11px] font-bold">A-</button>
            <div className="w-px h-4 bg-muted-foreground/20" />
            <button onClick={() => adjustFontSize(2)} className="h-8 w-8 flex items-center justify-center text-primary text-[12px] font-bold">A+</button>
          </div>
        </div>

        {/* Floating Juz/Page indicator */}
        {(currentJuz || currentPage) && (
          <div
            className="fixed top-[72px] left-1/2 -translate-x-1/2 z-25 pointer-events-none transition-opacity duration-500"
            style={{ opacity: scrollActive ? 1 : 0.4 }}
          >
            <div
              className="px-3 py-1.5 rounded-full text-[10px] font-medium tracking-wider text-white/70"
              style={{
                background: 'hsla(230, 20%, 12%, 0.85)',
                border: '1px solid hsla(0, 0%, 100%, 0.08)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {currentJuz && `Juz ${currentJuz}`}
              {currentJuz && currentPage && ' · '}
              {currentPage && `Page ${currentPage}`}
            </div>
          </div>
        )}
        {/* Reciter picker */}
        <AnimatePresence>
          {showReciterPicker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-[108px] right-4 z-40 rounded-xl border overflow-hidden"
              style={{ background: 'hsla(230, 20%, 12%, 0.95)', borderColor: 'hsla(0, 0%, 100%, 0.1)', backdropFilter: 'blur(20px)' }}
            >
              {RECITERS.map(r => (
                <button
                  key={r.id}
                  onClick={() => changeReciter(r.id)}
                  className={`block w-full text-left px-4 py-2.5 text-[12px] transition-colors ${
                    r.id === reciterId ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary/50'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bismillah */}
        {chapterNum !== 9 && chapterNum !== 1 && (
          <div className="text-center py-8 px-5">
            <p className="font-arabic-display text-2xl text-primary/50">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
          </div>
        )}

        {/* Continuous flowing text */}
        <div className="px-6">
          {verses.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              {showTranslation ? (
                // Interleaved mode: each verse with its translation
                <div className="space-y-0">
                  {verses.map((verse, idx) => {
                    const prevVerse = idx > 0 ? verses[idx - 1] : null;
                    const showJuzMarker = verse.juz_number && (!prevVerse || prevVerse.juz_number !== verse.juz_number);
                    const showPageMarker = verse.page_number && (!prevVerse || prevVerse.page_number !== verse.page_number);
                    return (
                      <div key={verse.id}>
                        {(showJuzMarker || showPageMarker) && (
                          <div className="flex items-center justify-center gap-3 my-4">
                            <div className="h-px flex-1 bg-primary/10" />
                            <span className="text-[10px] text-primary/50 font-medium tracking-wider">
                              {showJuzMarker && `Juz ${verse.juz_number}`}
                              {showJuzMarker && showPageMarker && ' · '}
                              {showPageMarker && `Page ${verse.page_number}`}
                            </span>
                            <div className="h-px flex-1 bg-primary/10" />
                          </div>
                        )}
                        <p
                          className="font-arabic-display text-primary/90 text-right leading-[2.4]"
                          style={{ fontSize: `${fontSize}px` }}
                          dir="rtl"
                        >
                          {verse.text_uthmani}
                          <VerseBadge num={verse.verse_number} />
                        </p>
                        {verse.translations?.[0] && (
                          <p className="text-[13px] leading-relaxed text-left mt-2" style={{ color: 'hsl(35, 60%, 65%)' }}>
                            <span className="text-primary/40 text-[11px] font-semibold mr-1.5">{verse.verse_number}.</span>
                            {stripHtml(verse.translations[0].text)}
                          </p>
                        )}
                        {idx < verses.length - 1 && (
                          <div className="my-5 mx-auto w-16 h-px bg-primary/20" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Continuous flowing mode with Juz/page markers
                <div dir="rtl">
                  {verses.map((verse, idx) => {
                    const prevVerse = idx > 0 ? verses[idx - 1] : null;
                    const showJuzMarker = verse.juz_number && (!prevVerse || prevVerse.juz_number !== verse.juz_number);
                    const showPageMarker = verse.page_number && (!prevVerse || prevVerse.page_number !== verse.page_number);
                    return (
                      <span key={verse.id}>
                        {(showJuzMarker || showPageMarker) && idx > 0 && (
                          <span className="block my-4" dir="ltr">
                            <span className="flex items-center justify-center gap-3">
                              <span className="h-px flex-1 bg-primary/10" />
                              <span className="text-[10px] text-primary/50 font-medium tracking-wider">
                                {showJuzMarker && `Juz ${verse.juz_number}`}
                                {showJuzMarker && showPageMarker && ' · '}
                                {showPageMarker && `Page ${verse.page_number}`}
                              </span>
                              <span className="h-px flex-1 bg-primary/10" />
                            </span>
                          </span>
                        )}
                        <span
                          className="font-arabic-display text-primary/90 leading-[2.4]"
                          style={{ fontSize: `${fontSize}px` }}
                        >
                          {verse.text_uthmani}
                          <VerseBadge num={verse.verse_number} />
                          {' '}
                        </span>
                      </span>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {!loading && page < totalPages && <div ref={sentinelRef} className="h-10" />}

          {loading && (
            <div className="space-y-4 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-muted/20" />
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-10">
              <p className="text-sm text-destructive mb-3">{error}</p>
              <button onClick={() => { setError(null); setPage(1); }} className="text-sm text-primary underline">Retry</button>
            </div>
          )}
        </div>
      </div>

      {/* Mini audio player */}
      {audioUrl && (
        <div className="fixed bottom-[68px] left-0 right-0 z-40 px-3 pb-2">
          <div
            className="rounded-2xl border p-3 flex items-center gap-3"
            style={{ background: 'hsla(230, 20%, 12%, 0.92)', borderColor: 'hsla(0, 0%, 100%, 0.1)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}
          >
            <button onClick={skipBack} className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-muted-foreground">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>
            <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="hsl(var(--primary))"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="hsl(var(--primary))"><polygon points="6,3 20,12 6,21" /></svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground truncate">{surah?.name}</p>
              <p className="text-[10px] text-muted-foreground">{RECITERS.find(r => r.id === reciterId)?.name || 'Unknown'}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-muted-foreground w-7 text-right">{formatTime(audioCurrentTime)}</span>
                <Slider value={[audioCurrentTime]} max={audioDuration || 1} step={1} onValueChange={seekAudio} className="flex-1 h-1" />
                <span className="text-[9px] text-muted-foreground w-7">{formatTime(audioDuration)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
