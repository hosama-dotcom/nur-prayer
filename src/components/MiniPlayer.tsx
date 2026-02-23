import { motion, AnimatePresence } from 'framer-motion';
import { useAudioPlayer } from '@/contexts/AudioContext';
import { useLocation } from 'react-router-dom';

export function MiniPlayer() {
  const { state, togglePlay, stop } = useAudioPlayer();
  const location = useLocation();

  // Don't show on surah reader pages (they have their own controls)
  const isSurahReader = location.pathname.startsWith('/quran/');
  if (isSurahReader || !state.surahNumber) return null;

  return (
    <AnimatePresence>
      {state.surahName && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[60] safe-area-top"
        >
          <div
            className="mx-3 mt-2 rounded-2xl flex items-center gap-3 px-4 py-2.5"
            style={{
              background: 'hsla(230, 20%, 12%, 0.92)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"
            >
              {state.isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="hsl(var(--primary))">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="hsl(var(--primary))">
                  <polygon points="6,3 20,12 6,21" />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground truncate">{state.surahName}</p>
              <p className="text-[10px] text-muted-foreground">
                {state.currentVerse ? `Verse ${state.currentVerse}` : 'Paused'} · Al-Afasy
              </p>
            </div>
            <button
              onClick={stop}
              className="w-8 h-8 flex items-center justify-center text-muted-foreground"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
