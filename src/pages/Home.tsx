import { motion } from 'framer-motion';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { GradientBackground } from '@/components/GradientBackground';
import { formatTime, getHijriDate } from '@/lib/prayer-utils';

export default function Home() {
  const { prayers, currentPrayer, nextPrayer, countdown, qiblaDirection, loading } = usePrayerTimes();

  if (loading) {
    return (
      <div className="min-h-screen gradient-default flex items-center justify-center">
        <div className="geometric-pattern absolute inset-0" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <p className="font-arabic text-4xl text-primary mb-3">نُور</p>
          <p className="text-sm text-muted-foreground">Loading prayer times...</p>
        </motion.div>
      </div>
    );
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const currentPrayerData = prayers.find(p => p.name === currentPrayer);

  return (
    <GradientBackground prayer={currentPrayer}>
      <div className="min-h-screen pb-24 px-5 safe-area-top">
        {/* Top bar: time + hijri date */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="pt-12 pb-1 flex items-center justify-between"
        >
          <p className="text-sm text-white/50 tracking-wide">{timeStr}</p>
          <p className="text-xs text-white/40 font-arabic">{getHijriDate()}</p>
        </motion.div>

        {/* Hero: Current prayer name large */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center pt-12 pb-6"
        >
          {currentPrayerData && (
            <p className="font-arabic text-lg text-white/40 mb-2">{currentPrayerData.arabicLabel}</p>
          )}
          <h1 className="text-6xl font-light tracking-tight text-white">
            {currentPrayerData?.label || 'Prayer'}
          </h1>
          {nextPrayer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4"
            >
              <p className="text-white/50 text-sm">
                {nextPrayer.label} in{' '}
                <span className="text-white/80 font-medium">
                  {countdown.hours > 0 ? `${countdown.hours}h ` : ''}{countdown.minutes}m {countdown.seconds}s
                </span>
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Prayer times row — frosted glass, tight */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-x-auto no-scrollbar -mx-5 px-5 mt-4"
        >
          <div className="flex gap-2 min-w-max pb-2">
            {prayers.filter(p => p.name !== 'sunrise').map((prayer) => {
              const isActive = prayer.name === currentPrayer;
              const isNext = nextPrayer?.name === prayer.name;
              return (
                <div
                  key={prayer.name}
                  className={`rounded-xl px-3.5 py-2.5 text-center min-w-[78px] transition-all border
                    ${isActive
                      ? 'bg-white/15 border-white/20 backdrop-blur-xl'
                      : 'bg-white/[0.07] border-white/[0.08] backdrop-blur-lg'
                    }
                    ${isNext ? 'border-white/15' : ''}
                  `}
                >
                  <p className="text-[9px] uppercase tracking-widest text-white/45 mb-0.5">{prayer.label}</p>
                  <p className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-white/75'}`}>
                    {formatTime(prayer.time)}
                  </p>
                  <p className="font-arabic text-[10px] text-white/30 mt-0.5">{prayer.arabicLabel}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Qibla pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] border border-white/[0.1] backdrop-blur-lg">
            <svg width="14" height="14" viewBox="0 0 100 100" className="text-white/50">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="3" />
              <g transform={`rotate(${qiblaDirection}, 50, 50)`}>
                <line x1="50" y1="50" x2="50" y2="18" stroke="hsl(43, 50%, 54%)" strokeWidth="3" strokeLinecap="round" />
                <polygon points="50,14 46,24 54,24" fill="hsl(43, 50%, 54%)" />
              </g>
              <circle cx="50" cy="50" r="4" fill="hsl(43, 50%, 54%)" opacity="0.7" />
            </svg>
            <span className="text-xs text-white/60">Qibla: {Math.round(qiblaDirection)}°</span>
          </div>
        </motion.div>
      </div>
    </GradientBackground>
  );
}
