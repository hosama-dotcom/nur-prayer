import { useState } from 'react';
import { motion } from 'framer-motion';
import type { CalcMethod } from '@/lib/prayer-utils';

const calcMethods: { value: CalcMethod; label: string }[] = [
  { value: 'UmmAlQura', label: 'Umm al-Qura (Makkah)' },
  { value: 'NorthAmerica', label: 'ISNA (North America)' },
  { value: 'MuslimWorldLeague', label: 'Muslim World League' },
  { value: 'Egyptian', label: 'Egyptian General Authority' },
  { value: 'Karachi', label: 'University of Islamic Sciences, Karachi' },
  { value: 'Dubai', label: 'Dubai' },
  { value: 'Kuwait', label: 'Kuwait' },
  { value: 'Qatar', label: 'Qatar' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Tehran', label: 'Tehran' },
];

export default function More() {
  const [selectedMethod, setSelectedMethod] = useState<CalcMethod>(() => {
    return (localStorage.getItem('nur-calc-method') as CalcMethod) || 'UmmAlQura';
  });

  const handleMethodChange = (method: CalcMethod) => {
    setSelectedMethod(method);
    localStorage.setItem('nur-calc-method', method);
    window.dispatchEvent(new Event('nur-method-changed'));
  };

  return (
    <div className="min-h-screen gradient-isha safe-area-top pb-24">
      <div className="geometric-pattern absolute inset-0 pointer-events-none" />
      <div className="relative z-10 px-5">
        {/* Header */}
        <div className="pt-12 pb-6">
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        </div>

        {/* App info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 text-center mb-6"
        >
          <p className="font-arabic text-4xl text-primary mb-2">نُور</p>
          <p className="text-lg font-semibold text-foreground">Nur</p>
          <p className="text-xs text-muted-foreground mt-1">Your Islamic Companion</p>
          <p className="text-[10px] text-muted-foreground mt-1">Version 1.0</p>
        </motion.div>

        {/* Calculation Method */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 mb-4"
        >
          <p className="text-sm font-semibold text-foreground mb-3">Prayer Calculation Method</p>
          <div className="space-y-2">
            {calcMethods.map((m) => (
              <button
                key={m.value}
                onClick={() => handleMethodChange(m.value)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                  selectedMethod === m.value
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'bg-secondary/20 text-foreground/70 border border-transparent'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Other settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {['Notifications', 'Language', 'About'].map((item) => (
            <div key={item} className="glass-card px-5 py-4 flex items-center justify-between">
              <span className="text-sm text-foreground">{item}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(220, 10%, 60%)" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
