import { motion } from 'framer-motion';

interface VerseActionBarProps {
  isBookmarked: boolean;
  onCopy: () => void;
  onBookmark: () => void;
  onShare: () => void;
}

export default function VerseActionBar({ isBookmarked, onCopy, onBookmark, onShare }: VerseActionBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -4 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="flex items-center gap-1 px-2 py-1.5 rounded-full z-50"
      style={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Copy */}
      <button
        onClick={(e) => { e.stopPropagation(); onCopy(); }}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      </button>

      {/* Bookmark */}
      <button
        onClick={(e) => { e.stopPropagation(); onBookmark(); }}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? '#C9A84C' : 'none'} stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
      </button>

      {/* Share */}
      <button
        onClick={(e) => { e.stopPropagation(); onShare(); }}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>
    </motion.div>
  );
}
