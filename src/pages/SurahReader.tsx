import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { surahs } from '@/data/surahs';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';

interface Verse {
  id: number;
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
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

export default function SurahReader() {
  const { number } = useParams<{ number: string }>();
  const navigate = useNavigate();
  const chapterNum = parseInt(number || '1', 10);
  const surah = surahs.find(s => s.number === chapterNum);

  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fontSize, setFontSize] = useState(getStoredFontSize);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset on chapter change
  useEffect(() => {
    setVerses([]);
    setPage(1);
    setLoading(true);
    setError(null);
    setIsPlaying(false);
    setAudioCurrentTime(0);
    setAudioDuration(0);
    setAudioUrl(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [chapterNum]);

  // Fetch verses
  useEffect(() => {
    const fetchVerses = async () => {
      setLoading(true);
      try {
        const url = `https://api.quran.com/api/v4/verses/by_chapter/${chapterNum}?language=en&words=false&translations=131&fields=text_uthmani&per_page=50&page=${page}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch verses');
        const data: ApiResponse = await res.json();
        console.log(`[SurahReader] Chapter ${chapterNum}, page ${page}:`, data);
        setVerses(prev => page === 1 ? data.verses : [...prev, ...data.verses]);
        setTotalPages(data.pagination.total_pages);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVerses();
  }, [chapterNum, page]);

  // Fetch full surah audio
  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const res = await fetch(`https://api.quran.com/api/v4/chapter_recitations/7/${chapterNum}`);
        const data = await res.json();
        const url = data.audio_file?.audio_url;
        if (url) {
          console.log(`[SurahReader] Audio URL for chapter ${chapterNum}:`, url);
          setAudioUrl(url);
        }
      } catch {
        console.warn('[SurahReader] Failed to fetch surah audio');
      }
    };
    fetchAudio();
  }, [chapterNum]);

  // Infinite scroll
  useEffect(() => {
    if (loading || page >= totalPages) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPage(p => p + 1);
        }
      },
      { threshold: 0.1 }
    );
    observerRef.current.observe(sentinel);

    return () => observerRef.current?.disconnect();
  }, [loading, page, totalPages]);

  // Font size
  const adjustFontSize = (delta: number) => {
    setFontSize(prev => {
      const next = Math.max(20, Math.min(40, prev + delta));
      localStorage.setItem(FONT_SIZE_KEY, String(next));
      return next;
    });
  };

  // Audio controls
  const togglePlay = useCallback(() => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.addEventListener('loadedmetadata', () => setAudioDuration(audio.duration));
      audio.addEventListener('timeupdate', () => setAudioCurrentTime(audio.currentTime));
      audio.addEventListener('ended', () => { setIsPlaying(false); setAudioCurrentTime(0); });
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl, isPlaying]);

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

  return (
    <div className="min-h-screen gradient-isha pb-36 safe-area-top" ref={scrollContainerRef}>
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

        {/* Font size toolbar */}
        <div className="fixed top-20 right-4 z-30 flex flex-col gap-1">
          <button
            onClick={() => adjustFontSize(2)}
            className="w-9 h-9 rounded-xl bg-secondary/70 backdrop-blur-sm flex items-center justify-center text-primary text-sm font-bold"
          >
            A+
          </button>
          <button
            onClick={() => adjustFontSize(-2)}
            className="w-9 h-9 rounded-xl bg-secondary/70 backdrop-blur-sm flex items-center justify-center text-primary text-xs font-bold"
          >
            A-
          </button>
        </div>

        {/* Bismillah */}
        {chapterNum !== 9 && chapterNum !== 1 && (
          <div className="text-center py-8 px-5">
            <p className="font-arabic-display text-2xl text-primary/60">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
          </div>
        )}

        {/* Verses — flowing layout */}
        <div className="px-6">
          {verses.map((verse, i) => (
            <motion.div
              key={verse.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
            >
              {/* Arabic text with inline verse number */}
              <div className="py-5" dir="rtl">
                <p
                  className="font-arabic-display text-primary/90 text-right leading-[2.2]"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {verse.text_uthmani}
                  <span
                    className="inline-flex items-center justify-center mx-2 align-middle rounded-full bg-primary/15 text-primary"
                    style={{ width: '1.6em', height: '1.6em', fontSize: '0.45em', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                  >
                    {verse.verse_number}
                  </span>
                </p>
              </div>

              {/* Translation */}
              {verse.translations?.[0] && (
                <p className="text-sm leading-relaxed text-muted-foreground/70 italic pb-5 text-left">
                  {stripHtml(verse.translations[0].text)}
                </p>
              )}

              {/* Divider */}
              <div className="h-px w-full bg-primary/10" />
            </motion.div>
          ))}

          {/* Infinite scroll sentinel */}
          {!loading && page < totalPages && (
            <div ref={sentinelRef} className="h-10" />
          )}

          {/* Loading */}
          {loading && (
            <div className="space-y-6 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-10 w-full bg-muted/30" />
                  <Skeleton className="h-4 w-3/4 bg-muted/20" />
                  <div className="h-px w-full bg-primary/5" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-10">
              <p className="text-sm text-destructive mb-3">{error}</p>
              <button
                onClick={() => { setError(null); setPage(1); }}
                className="text-sm text-primary underline"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mini audio player — above bottom nav */}
      {audioUrl && (
        <div className="fixed bottom-[68px] left-0 right-0 z-40 px-4 pb-2">
          <div className="glass-card-strong p-3 flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="hsl(var(--primary))">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="hsl(var(--primary))">
                  <polygon points="6,3 20,12 6,21" />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground truncate">{surah?.name}</p>
              <p className="text-[10px] text-muted-foreground">Mishary Rashid Al-Afasy</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-muted-foreground w-7 text-right">{formatTime(audioCurrentTime)}</span>
                <Slider
                  value={[audioCurrentTime]}
                  max={audioDuration || 1}
                  step={1}
                  onValueChange={seekAudio}
                  className="flex-1 h-1"
                />
                <span className="text-[9px] text-muted-foreground w-7">{formatTime(audioDuration)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
