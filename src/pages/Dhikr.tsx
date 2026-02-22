import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dhikrPresets, type DhikrPreset } from '@/data/dhikr';

// Post-prayer tasbih sequence
const TASBIH_SEQUENCE = ['subhanallah', 'alhamdulillah', 'allahuakbar'];

export default function Dhikr() {
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

    // Haptic
    if (navigator.vibrate) navigator.vibrate(10);

    if (newCount >= selectedPreset.target) {
      setCompleted(true);
      setFlashGold(true);
      setCompletionText(`${selectedPreset.transliteration} ✓`);
      if (navigator.vibrate) navigator.vibrate([40, 30, 40, 30, 60]);

      // Auto-advance after 1.5s
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
    return () => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
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
    <div className="min-h-screen safe-area-top relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #070D1A 0%, #0C1629 40%, #0A1020 100%)' }}>
      <div className="geometric-pattern absolute inset-0 pointer-events-none opacity-20" />

      {/* Gold flash overlay */}
      <AnimatePresence>
        {flashGold && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle at center, rgba(201, 168, 76, 0.15) 0%, transparent 70%)' }}
          />
        )}
      </AnimatePresence>

      {/* Main tap area */}
      <div
        className="relative z-10 flex flex-col items-center justify-center min-h-screen pb-24 px-5 select-none cursor-pointer"
        onClick={!showPresets ? handleTap : undefined}
      >
        {/* Top bar */}
        <div className="absolute top-14 left-5 right-5 flex items-center justify-between">
          <button
            onClick={(e) => { e.stopPropagation(); handleReset(); }}
            className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm text-xs text-white/40 active:scale-95 transition-transform"
          >
            Reset
          </button>

          {/* Dhikr selector with chevron */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowPresets(!showPresets); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm active:scale-95 transition-transform"
          >
            <span className="text-xs text-white/60">{selectedPreset.transliteration}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4">
              <path d="M7 10l5 5 5-5" />
            </svg>
          </button>
        </div>

        {/* Arabic text */}
        <motion.p
          className="font-arabic-display text-3xl text-primary/70 mb-10"
          animate={justTapped ? { scale: [1, 1.06, 1] } : {}}
          transition={{ duration: 0.12 }}
        >
          {selectedPreset.arabic}
        </motion.p>

        {/* Progress ring + count */}
        <div className="relative w-64 h-64 mb-6">
          <svg className="w-full h-full" viewBox="0 0 240 240">
            <circle cx="120" cy="120" r="105" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
            <circle
              cx="120" cy="120" r="105"
              fill="none"
              stroke={completed ? '#C9A84C' : 'url(#goldGradient)'}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 120 120)"
              style={{
                transition: 'stroke-dashoffset 0.2s ease-out',
                ...(completed ? { filter: 'drop-shadow(0 0 8px rgba(201, 168, 76, 0.5))' } : {}),
              }}
            />
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C9A84C" />
                <stop offset="100%" stopColor="#E8D48B" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.p
              key={count}
              className={`font-light ${completed ? 'text-primary' : 'text-white'}`}
              style={{ fontSize: '88px', lineHeight: 1 }}
              initial={{ scale: 1.15, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.12 }}
            >
              {count}
            </motion.p>
            <p className="text-sm text-primary/50 mt-2 font-medium">/ {selectedPreset.target}</p>
          </div>
        </div>

        {/* Translation */}
        <p className="text-sm text-white/30 italic">{selectedPreset.translation}</p>

        {/* Completion message */}
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 text-center"
            >
              <p className="text-primary text-lg font-semibold">{completionText}</p>
              {TASBIH_SEQUENCE.indexOf(selectedPreset.id) !== -1 &&
               TASBIH_SEQUENCE.indexOf(selectedPreset.id) < TASBIH_SEQUENCE.length - 1 && (
                <p className="text-[11px] text-white/30 mt-1">Advancing to next dhikr...</p>
              )}
              {(TASBIH_SEQUENCE.indexOf(selectedPreset.id) === TASBIH_SEQUENCE.length - 1 ||
                TASBIH_SEQUENCE.indexOf(selectedPreset.id) === -1) && (
                <p className="text-[11px] text-white/30 mt-1">Tap reset to start again</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tap hint */}
        {!completed && count === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-32 text-[11px] text-white/15 tracking-wider"
          >
            Tap anywhere to count
          </motion.p>
        )}
      </div>

      {/* Preset drawer */}
      <AnimatePresence>
        {showPresets && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setShowPresets(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 pb-32 border-t border-white/[0.08]"
              style={{ background: 'hsla(230, 25%, 12%, 0.95)', backdropFilter: 'blur(30px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-white/15 mx-auto mb-6" />
              <h3 className="text-base font-semibold text-white/80 mb-4">Select Dhikr</h3>
              <div className="space-y-2.5">
                {dhikrPresets.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  const isInSequence = TASBIH_SEQUENCE.includes(preset.id);
                  return (
                    <button
                      key={preset.id}
                      onClick={() => selectPreset(preset)}
                      className={`w-full rounded-xl p-4 text-left transition-all border ${
                        isSelected
                          ? 'bg-primary/10 border-primary/30'
                          : 'bg-white/[0.04] border-white/[0.06]'
                      }`}
                    >
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
