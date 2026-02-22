import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import type { CalcMethod } from '@/lib/prayer-utils';

type SettingsView = 'main' | 'notifications' | 'language' | 'about';

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
const AZAN_SOUNDS = ['Makkah', 'Madinah', 'Silent'] as const;

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

interface NotificationSettings {
  [prayer: string]: { enabled: boolean; sound: string; reminder: boolean };
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-sm text-primary mb-4">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
      Back
    </button>
  );
}

function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('nur-notification-settings');
    if (saved) return JSON.parse(saved);
    return Object.fromEntries(PRAYER_NAMES.map(p => [p, { enabled: true, sound: 'Makkah', reminder: false }]));
  });

  const update = (prayer: string, patch: Partial<NotificationSettings[string]>) => {
    const next = { ...settings, [prayer]: { ...settings[prayer], ...patch } };
    setSettings(next);
    localStorage.setItem('nur-notification-settings', JSON.stringify(next));
  };

  return (
    <div>
      <BackButton onClick={onBack} />
      <h2 className="text-lg font-semibold text-foreground mb-4">Notifications</h2>
      <div className="space-y-3">
        {PRAYER_NAMES.map((prayer) => (
          <div key={prayer} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">{prayer}</span>
              <Switch checked={settings[prayer]?.enabled ?? true} onCheckedChange={(v) => update(prayer, { enabled: v })} />
            </div>
            {settings[prayer]?.enabled && (
              <div className="space-y-3 pt-2 border-t border-border/30">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Azan Sound</p>
                  <div className="flex gap-2">
                    {AZAN_SOUNDS.map((sound) => (
                      <button
                        key={sound}
                        onClick={() => update(prayer, { sound })}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                          settings[prayer]?.sound === sound
                            ? 'bg-primary/15 text-primary border border-primary/20'
                            : 'bg-secondary/20 text-foreground/60 border border-transparent'
                        }`}
                      >
                        {sound}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground/70">15 min reminder</span>
                  <Switch checked={settings[prayer]?.reminder ?? false} onCheckedChange={(v) => update(prayer, { reminder: v })} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LanguageScreen({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState(() => localStorage.getItem('nur-language') || 'en');

  const handleSelect = (lang: string) => {
    setSelected(lang);
    localStorage.setItem('nur-language', lang);
    if (lang === 'ar') {
      // For now show coming soon
    }
  };

  return (
    <div>
      <BackButton onClick={onBack} />
      <h2 className="text-lg font-semibold text-foreground mb-4">Language</h2>
      <div className="space-y-2">
        <button
          onClick={() => handleSelect('en')}
          className={`w-full text-left px-4 py-4 rounded-xl text-sm transition-all flex items-center justify-between ${
            selected === 'en' ? 'bg-primary/15 text-primary border border-primary/20' : 'glass-card text-foreground/70'
          }`}
        >
          <div>
            <p className="font-medium">English</p>
            <p className="text-xs text-muted-foreground mt-0.5">Default language</p>
          </div>
          {selected === 'en' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          )}
        </button>
        <button
          onClick={() => handleSelect('ar')}
          className={`w-full text-left px-4 py-4 rounded-xl text-sm transition-all flex items-center justify-between ${
            selected === 'ar' ? 'bg-primary/15 text-primary border border-primary/20' : 'glass-card text-foreground/70'
          }`}
        >
          <div>
            <p className="font-medium font-arabic">العربية</p>
            <p className="text-xs text-muted-foreground mt-0.5">Coming soon</p>
          </div>
          {selected === 'ar' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          )}
        </button>
      </div>
      {selected === 'ar' && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mt-4 text-center">
          <p className="text-xs text-muted-foreground">Arabic language support is coming soon, insha'Allah.</p>
        </motion.div>
      )}
    </div>
  );
}

function AboutScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="font-arabic-display text-5xl text-primary mb-2">نُور</p>
        <p className="text-xl font-semibold text-foreground">Nur</p>
        <p className="text-xs text-muted-foreground mt-1">Version 1.0</p>

        <div className="glass-card p-5 mt-8 text-center">
          <p className="text-sm text-foreground/80 leading-relaxed">
            Made with love for the Muslim community
          </p>
          <p className="font-arabic text-lg text-primary/60 mt-2">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
        </div>

        <div className="mt-6">
          <button
            onClick={() => window.open('https://apps.apple.com', '_blank')}
            className="w-full glass-card px-5 py-4 flex items-center justify-between"
          >
            <span className="text-sm text-foreground">Rate the App</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          </button>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/40 mt-auto pt-12">© 2025 Nur · All rights reserved</p>
    </div>
  );
}

export default function More() {
  const [view, setView] = useState<SettingsView>('main');
  const [calcOpen, setCalcOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<CalcMethod>(() => {
    return (localStorage.getItem('nur-calc-method') as CalcMethod) || 'UmmAlQura';
  });

  const handleMethodChange = (method: CalcMethod) => {
    setSelectedMethod(method);
    localStorage.setItem('nur-calc-method', method);
    window.dispatchEvent(new Event('nur-method-changed'));
  };

  const menuItems: { label: string; view: SettingsView }[] = [
    { label: 'Notifications', view: 'notifications' },
    { label: 'Language', view: 'language' },
    { label: 'About', view: 'about' },
  ];

  return (
    <div className="min-h-screen gradient-isha safe-area-top pb-24">
      <div className="geometric-pattern absolute inset-0 pointer-events-none" />
      <div className="relative z-10 px-5">
        {/* Header */}
        <div className="pt-12 pb-6 text-center">
          <p className="text-xs text-muted-foreground tracking-widest uppercase">Settings</p>
        </div>

        <AnimatePresence mode="wait">
          {view === 'main' ? (
            <motion.div key="main" initial={{ opacity: 0, x: 0 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }}>
              {/* Calculation Method - Collapsible */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card mb-4 overflow-hidden">
                <button
                  onClick={() => setCalcOpen(!calcOpen)}
                  className="w-full px-5 py-4 flex items-center justify-between"
                >
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">Calculation Method</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{calcMethods.find(m => m.value === selectedMethod)?.label}</p>
                  </div>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"
                    className={`transition-transform duration-200 ${calcOpen ? 'rotate-90' : ''}`}
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
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key={view} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.15 }}>
              {view === 'notifications' && <NotificationsScreen onBack={() => setView('main')} />}
              {view === 'language' && <LanguageScreen onBack={() => setView('main')} />}
              {view === 'about' && <AboutScreen />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
