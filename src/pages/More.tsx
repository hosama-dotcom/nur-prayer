import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import type { CalcMethod } from '@/lib/prayer-utils';

type SettingsView = 'main' | 'about';

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

function AboutScreen({ t }: { t: (key: any) => string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="font-arabic-display text-5xl text-primary mb-2">نُور</p>
        <p className="text-xl font-semibold text-foreground">Nur</p>
        <p className="text-xs text-muted-foreground mt-1">Version 1.0</p>

        <div className="glass-card p-5 mt-8 text-center">
          <p className="text-sm text-foreground/80 leading-relaxed">
            {t('settings.madeWithLove')}
          </p>
          <p className="font-arabic text-lg text-primary/60 mt-2">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
        </div>

        <div className="mt-6">
          <button
            onClick={() => window.open('https://apps.apple.com', '_blank')}
            className="w-full glass-card px-5 py-4 flex items-center justify-between"
          >
            <span className="text-sm text-foreground">{t('settings.rateApp')}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          </button>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/40 mt-auto pt-12">© 2025 Nur · All rights reserved</p>
    </div>
  );
}

export default function More() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();
  const [view, setView] = useState<SettingsView>('main');
  const [calcOpen, setCalcOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<CalcMethod>(() => {
    return (localStorage.getItem('nur-calc-method') as CalcMethod) || 'Dubai';
  });

  const handleMethodChange = (method: CalcMethod) => {
    setSelectedMethod(method);
    localStorage.setItem('nur-calc-method', method);
    window.dispatchEvent(new Event('nur-method-changed'));
  };

  const menuItems: { label: string; view: SettingsView }[] = [
    { label: t('settings.about'), view: 'about' },
  ];

  return (
    <div className="min-h-screen night-sky-bg safe-area-top pb-24 relative">
      <div className="geometric-pattern absolute inset-0 pointer-events-none" />
      <div className="relative z-10 px-5">
        {/* Header */}
        <div className="pt-12 pb-6 text-center">
          <p className="text-xs text-muted-foreground tracking-widest uppercase">{t('settings.title')}</p>
        </div>

        <AnimatePresence mode="wait">
          {view === 'main' ? (
            <motion.div key="main" initial={{ opacity: 0, x: 0 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }}>
              
              {/* Language Toggle */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }} className="glass-card mb-4 overflow-hidden">
                <div className="px-5 py-4">
                  <p className="text-sm font-semibold text-foreground mb-3">{t('settings.language')}</p>
                  <div className="flex rounded-xl overflow-hidden border border-white/[0.08]">
                    <button
                      onClick={() => setLang('en')}
                      className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                        lang === 'en'
                          ? 'bg-primary/15 text-primary border-primary/20'
                          : 'bg-white/[0.04] text-foreground/60'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLang('ar')}
                      className={`flex-1 py-2.5 text-sm font-medium font-arabic transition-all ${
                        lang === 'ar'
                          ? 'bg-primary/15 text-primary border-primary/20'
                          : 'bg-white/[0.04] text-foreground/60'
                      }`}
                    >
                      العربية
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Calculation Method */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card mb-4 overflow-hidden">
                <button
                  onClick={() => setCalcOpen(!calcOpen)}
                  className="w-full px-5 py-4 flex items-center justify-between"
                >
                  <div className="text-start">
                    <p className="text-sm font-semibold text-foreground">{t('settings.calcMethod')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{calcMethods.find(m => m.value === selectedMethod)?.label}</p>
                  </div>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"
                    className={`transition-transform duration-200 ${calcOpen ? 'rotate-90' : ''} ${lang === 'ar' ? '-scale-x-100' : ''}`}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                {calcOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 pb-4 space-y-2"
                  >
                    {calcMethods.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => handleMethodChange(m.value)}
                        className={`w-full text-start px-4 py-3 rounded-xl text-sm transition-all ${
                          selectedMethod === m.value
                            ? 'bg-primary/15 text-primary border border-primary/20'
                            : 'bg-secondary/20 text-foreground/70 border border-transparent'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* Menu items */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
                {menuItems.map((item) => (
                  <button key={item.label} onClick={() => setView(item.view)} className="w-full glass-card px-5 py-4 flex items-center justify-between">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" className={lang === 'ar' ? '-scale-x-100' : ''}><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key={view} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.15 }}>
              <button onClick={() => setView('main')} className="flex items-center gap-1 text-sm text-primary mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={lang === 'ar' ? '-scale-x-100' : ''}><polyline points="15 18 9 12 15 6" /></svg>
                {t('duas.back')}
              </button>
              {view === 'about' && <AboutScreen t={t} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
