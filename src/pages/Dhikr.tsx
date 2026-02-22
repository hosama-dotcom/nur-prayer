import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dhikrPresets, type DhikrPreset } from '@/data/dhikr';

export default function Dhikr() {
  const [selectedPreset, setSelectedPreset] = useState<DhikrPreset>(dhikrPresets[0]);
  const [count, setCount] = useState(0);
  const [showPresets, setShowPresets] = useState(false);
  const [justTapped, setJustTapped] = useState(false);
  const [completed, setCompleted] = useState(false);

  const progress = Math.min(count / selectedPreset.target, 1);
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);

  const handleTap = useCallback(() => {
    if (completed) return;
    const newCount = count + 1;
    setCount(newCount);
    setJustTapped(true);
    setTimeout(() => setJustTapped(false), 200);

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);

    if (newCount >= selectedPreset.target) {
      setCompleted(true);
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }
  }, [count, completed, selectedPreset.target]);

  const handleReset = () => {
    setCount(0);
    setCompleted(false);
  };

  const selectPreset = (preset: DhikrPreset) => {
    setSelectedPreset(preset);
    setCount(0);
    setCompleted(false);
    setShowPresets(false);
  };

  return (
    <div className="min-h-screen gradient-isha safe-area-top relative">
      <div className="geometric-pattern absolute inset-0 pointer-events-none" />

      {/* Main tap area */}
      <div
        className="relative z-10 flex flex-col items-center justify-center min-h-screen pb-24 px-5 select-none"
        onClick={!showPresets ? handleTap : undefined}
      >
        {/* Preset selector button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowPresets(!showPresets);
          }}
          className="absolute top-14 right-5 glass-card px-4 py-2 text-xs text-muted-foreground"
        >
          {selectedPreset.transliteration}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReset();
          }}
          className="absolute top-14 left-5 glass-card px-4 py-2 text-xs text-muted-foreground"
        >
          Reset
        </button>

        {/* Arabic text */}
        <motion.p
          className="font-arabic text-3xl text-primary/80 mb-8"
          animate={justTapped ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.15 }}
        >
          {selectedPreset.arabic}
        </motion.p>

        {/* Progress ring + count */}
        <div className="relative w-56 h-56 mb-6">
          <svg className="w-full h-full progress-ring" viewBox="0 0 200 200">
            {/* Background ring */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="hsla(0, 0%, 100%, 0.06)"
              strokeWidth="4"
            />
            {/* Progress ring */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="hsl(43, 50%, 54%)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-200"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.p
              key={count}
              className={`text-6xl font-light ${completed ? 'text-primary' : 'text-foreground'}`}
              animate={justTapped ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.15 }}
            >
              {count}
            </motion.p>
            <p className="text-sm text-muted-foreground mt-1">/ {selectedPreset.target}</p>
          </div>
        </div>

        {/* Translation */}
        <p className="text-sm text-foreground/40">{selectedPreset.translation}</p>

        {/* Completion */}
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 text-center"
            >
              <p className="text-primary text-lg font-semibold">Completed ✓</p>
              <p className="text-xs text-foreground/40 mt-1">Tap reset to start again</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tap hint */}
        {!completed && count === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-32 text-xs text-foreground/20"
          >
            Tap anywhere to count
          </motion.p>
        )}
      </div>

      {/* Preset drawer */}
      <AnimatePresence>
        {showPresets && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass-card-strong rounded-t-3xl p-6 pb-32"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-foreground/20 mx-auto mb-6" />
            <h3 className="text-lg font-semibold text-foreground mb-4">Select Dhikr</h3>
            <div className="space-y-3">
              {dhikrPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => selectPreset(preset)}
                  className={`w-full glass-card p-4 text-left transition-all ${
                    selectedPreset.id === preset.id ? 'border-primary/30 prayer-glow' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{preset.transliteration}</p>
                      <p className="text-xs text-muted-foreground">{preset.translation}</p>
                    </div>
                    <p className="font-arabic text-lg text-primary/70">{preset.arabic}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Target: {preset.target}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
