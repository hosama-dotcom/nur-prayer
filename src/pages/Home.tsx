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

  return (
    <GradientBackground prayer={currentPrayer}>
      <div className="min-h-screen pb-24 px-5 safe-area-top">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="pt-12 pb-2 flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-foreground/50 tracking-wider uppercase">Nur</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-foreground/50 font-arabic">{getHijriDate()}</p>
          </div>
        </motion.div>

        {/* Current time + Next prayer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-8"
        >
          <p className="text-6xl font-light tracking-tight text-foreground">{timeStr}</p>
          {nextPrayer && (
            <div className="mt-4">
              <p className="text-sm text-foreground/60">Next Prayer</p>
              <p className="text-2xl font-semibold text-primary mt-1">{nextPrayer.label}</p>
              <p className="text-lg text-foreground/80 mt-1">
                in {countdown.hours > 0 ? `${countdown.hours}h ` : ''}{countdown.minutes}m {countdown.seconds}s
              </p>
            </div>
          )}
        </motion.div>

        {/* Prayer times row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-x-auto no-scrollbar -mx-5 px-5"
        >
          <div className="flex gap-3 min-w-max pb-2">
            {prayers.filter(p => p.name !== 'sunrise').map((prayer) => {
              const isActive = prayer.name === currentPrayer;
              const isNext = nextPrayer?.name === prayer.name;
              return (
                <div
                  key={prayer.name}
                  className={`glass-card px-5 py-4 text-center min-w-[90px] transition-all ${
                    isActive ? 'prayer-glow border-primary/30' : ''
                  } ${isNext ? 'border-primary/20' : ''}`}
                >
                  <p className="text-[10px] uppercase tracking-wider text-foreground/50 mb-1">{prayer.label}</p>
                  <p className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-foreground/90'}`}>
                    {formatTime(prayer.time)}
                  </p>
                  <p className="font-arabic text-xs text-foreground/40 mt-1">{prayer.arabicLabel}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Qibla Compass */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <div className="glass-card p-6">
            <p className="text-xs uppercase tracking-wider text-foreground/50 mb-4 text-center">Qibla Direction</p>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32 animate-compass-pulse">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Outer ring */}
                  <circle cx="50" cy="50" r="45" fill="none" stroke="hsla(0, 0%, 100%, 0.1)" strokeWidth="1" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="hsla(0, 0%, 100%, 0.05)" strokeWidth="0.5" />
                  
                  {/* Cardinal directions */}
                  <text x="50" y="12" textAnchor="middle" fill="hsla(0, 0%, 100%, 0.3)" fontSize="6" fontFamily="Inter">N</text>
                  <text x="90" y="53" textAnchor="middle" fill="hsla(0, 0%, 100%, 0.3)" fontSize="6" fontFamily="Inter">E</text>
                  <text x="50" y="95" textAnchor="middle" fill="hsla(0, 0%, 100%, 0.3)" fontSize="6" fontFamily="Inter">S</text>
                  <text x="10" y="53" textAnchor="middle" fill="hsla(0, 0%, 100%, 0.3)" fontSize="6" fontFamily="Inter">W</text>

                  {/* Qibla needle */}
                  <g transform={`rotate(${qiblaDirection}, 50, 50)`}>
                    <line x1="50" y1="50" x2="50" y2="18" stroke="hsl(43, 50%, 54%)" strokeWidth="2" strokeLinecap="round" />
                    <polygon points="50,15 47,22 53,22" fill="hsl(43, 50%, 54%)" />
                  </g>

                  {/* Center dot */}
                  <circle cx="50" cy="50" r="3" fill="hsl(43, 50%, 54%)" opacity="0.8" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[8px] text-foreground/30 mt-5">
                    {Math.round(qiblaDirection)}°
                  </span>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-foreground/40 mt-3 font-arabic">🕋 مكة المكرمة</p>
          </div>
        </motion.div>
      </div>
    </GradientBackground>
  );
}
