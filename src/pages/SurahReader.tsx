import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { surahs } from '@/data/surahs';
import { Skeleton } from '@/components/ui/skeleton';

interface Word {
  id: number;
  text_uthmani: string;
  translation?: { text: string };
}

interface Verse {
  id: number;
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
  words: Word[];
  translations: { text: string }[];
  audio?: { url: string };
}

interface ApiResponse {
  verses: Verse[];
  pagination: { total_pages: number; current_page: number; total_records: number };
}

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
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setVerses([]);
    setPage(1);
    setLoading(true);
    setError(null);
  }, [chapterNum]);

  useEffect(() => {
    const fetchVerses = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.quran.com/api/v4/verses/by_chapter/${chapterNum}?language=en&words=true&translations=131&per_page=50&page=${page}`
        );
        if (!res.ok) throw new Error('Failed to fetch verses');
        const data: ApiResponse = await res.json();
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

  const playAudio = async (verseKey: string, verseNumber: number) => {
    if (playingAudio === verseNumber) {
      audioRef.current?.pause();
      setPlayingAudio(null);
      return;
    }

    try {
      const res = await fetch(
        `https://api.quran.com/api/v4/recitations/7/by_ayah/${verseKey}`
      );
      const data = await res.json();
      const audioUrl = data.audio_files?.[0]?.url;
      if (!audioUrl) return;

      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(`https://verses.quran.com/${audioUrl}`);
      audioRef.current = audio;
      setPlayingAudio(verseNumber);
      audio.onended = () => setPlayingAudio(null);
      audio.play();
    } catch {
      // silently fail
    }
  };

  return (
    <div className="min-h-screen gradient-isha pb-24 safe-area-top">
      <div className="geometric-pattern absolute inset-0 pointer-events-none" />
      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-20 px-5 pt-10 pb-4" style={{ background: 'linear-gradient(180deg, #0A0A1A 0%, #0A0A1Acc 70%, transparent 100%)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/quran')}
              className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-arabic text-xl text-primary/80 leading-relaxed">{surah?.arabicName}</p>
              <p className="text-xs text-muted-foreground" style={{ fontWeight: 300, letterSpacing: '0.15em' }}>
                {surah?.name} · {surah?.englishName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">{surah?.versesCount} verses</p>
              <p className="text-[10px] text-muted-foreground">{surah?.revelationType}</p>
            </div>
          </div>
        </div>

        {/* Bismillah */}
        {chapterNum !== 9 && (
          <div className="text-center py-6 px-5">
            <p className="font-arabic-display text-2xl text-primary/70">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
          </div>
        )}

        {/* Verses */}
        <div className="px-5 space-y-4">
          {verses.map((verse, i) => (
            <motion.div
              key={verse.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.6) }}
              className="glass-card p-5"
            >
              {/* Verse header */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-[11px] font-semibold text-primary">{verse.verse_number}</span>
                </div>
                <button
                  onClick={() => playAudio(verse.verse_key, verse.verse_number)}
                  className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center transition-colors hover:bg-primary/20"
                >
                  {playingAudio === verse.verse_number ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="hsl(var(--primary))">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="hsl(var(--primary))">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Arabic text */}
              <p className="font-arabic-display text-[22px] leading-[2.2] text-foreground text-right mb-4" dir="rtl">
                {verse.text_uthmani}
              </p>

              {/* Translation */}
              {verse.translations?.[0] && (
                <p
                  className="text-[13px] leading-relaxed text-muted-foreground italic"
                  dangerouslySetInnerHTML={{ __html: verse.translations[0].text }}
                />
              )}
            </motion.div>
          ))}

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="glass-card p-5 space-y-3">
                  <Skeleton className="h-4 w-8 bg-muted/40" />
                  <Skeleton className="h-8 w-full bg-muted/40" />
                  <Skeleton className="h-4 w-3/4 bg-muted/40" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="glass-card p-5 text-center">
              <p className="text-sm text-destructive mb-3">{error}</p>
              <button
                onClick={() => { setError(null); setPage(1); }}
                className="text-sm text-primary underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Load more */}
          {!loading && page < totalPages && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="w-full glass-card py-3 text-sm text-primary font-medium"
            >
              Load more verses
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
