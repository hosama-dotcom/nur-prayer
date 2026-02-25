import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import { surahs } from '@/data/surahs';

// Compute cumulative verse counts for global ayah numbering
const cumulativeVerses: number[] = [];
let total = 0;
surahs.forEach((s) => {
  cumulativeVerses[s.number] = total;
  total += s.versesCount;
});

function getGlobalVerseNumber(surahNumber: number, verseNumber: number): number {
  return (cumulativeVerses[surahNumber] || 0) + verseNumber;
}

const DEFAULT_RECITER = 'ar.alafasy';

interface AudioState {
  isPlaying: boolean;
  surahNumber: number | null;
  surahName: string | null;
  currentVerse: number | null;
  totalVerses: number | null;
  reciterIdentifier: string;
}

interface AudioContextValue {
  state: AudioState;
  playVerse: (surahNumber: number, surahName: string, verseNumber: number, totalVerses: number, reciterIdentifier?: string) => void;
  togglePlay: () => void;
  stop: () => void;
  activeVerseNumber: number | null;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export function useAudioPlayer() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudioPlayer must be used within AudioProvider');
  return ctx;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    surahNumber: null,
    surahName: null,
    currentVerse: null,
    totalVerses: null,
    reciterIdentifier: DEFAULT_RECITER,
  });

  // Keep refs in sync for callbacks
  const stateRef = useRef(state);
  stateRef.current = state;

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.removeAttribute('src');
    }
    setState(prev => ({
      isPlaying: false,
      surahNumber: null,
      surahName: null,
      currentVerse: null,
      totalVerses: null,
      reciterIdentifier: prev.reciterIdentifier,
    }));
  }, []);

  const playVerseAudio = useCallback((surahNumber: number, verseNumber: number, reciterIdentifier: string) => {
    const globalNum = getGlobalVerseNumber(surahNumber, verseNumber);
    const url = `https://cdn.islamic.network/quran/audio/128/${reciterIdentifier}/${globalNum}.mp3`;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.pause();
    audio.src = url;

    audio.onended = () => {
      const s = stateRef.current;
      if (s.surahNumber === surahNumber && s.currentVerse === verseNumber && s.totalVerses) {
        if (verseNumber < s.totalVerses) {
          const next = verseNumber + 1;
          setState(prev => ({ ...prev, currentVerse: next }));
          playVerseAudio(surahNumber, next, s.reciterIdentifier);
        } else {
          setState(prev => ({ ...prev, isPlaying: false, currentVerse: null }));
        }
      }
    };

    audio.onerror = () => {
      const s = stateRef.current;
      if (s.totalVerses && verseNumber < s.totalVerses) {
        const next = verseNumber + 1;
        setState(prev => ({ ...prev, currentVerse: next }));
        playVerseAudio(surahNumber, next, s.reciterIdentifier);
      } else {
        setState(prev => ({ ...prev, isPlaying: false }));
      }
    };

    audio.play().catch(() => {});
  }, []);

  const playVerse = useCallback((
    surahNumber: number,
    surahName: string,
    verseNumber: number,
    totalVerses: number,
    reciterIdentifier: string = DEFAULT_RECITER,
  ) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setState({
      isPlaying: true,
      surahNumber,
      surahName,
      currentVerse: verseNumber,
      totalVerses,
      reciterIdentifier,
    });
    playVerseAudio(surahNumber, verseNumber, reciterIdentifier);
  }, [playVerseAudio]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const s = stateRef.current;
    if (s.isPlaying) {
      audio.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    } else if (s.surahNumber && s.currentVerse) {
      audio.play().catch(() => {});
      setState(prev => ({ ...prev, isPlaying: true }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return (
    <AudioCtx.Provider value={{
      state,
      playVerse,
      togglePlay,
      stop: stopAudio,
      activeVerseNumber: state.isPlaying ? state.currentVerse : null,
    }}>
      {children}
    </AudioCtx.Provider>
  );
}
