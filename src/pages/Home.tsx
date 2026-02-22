import { motion } from 'framer-motion';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { GradientBackground } from '@/components/GradientBackground';
import { formatTime, getHijriDate, isRamadan, getTimeUntil, getPrayerTimes } from '@/lib/prayer-utils';
import { useMemo, useState, useEffect } from 'react';
import { QiblaCompass } from '@/components/QiblaCompass';

const dailyVerses = [
  { arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', translation: 'Indeed, with hardship comes ease.', ref: 'Ash-Sharh 94:6' },
  { arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', translation: 'And whoever relies upon Allah — then He is sufficient for him.', ref: 'At-Talaq 65:3' },
  { arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ', translation: 'So remember Me; I will remember you.', ref: 'Al-Baqarah 2:152' },
  { arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي', translation: 'My Lord, expand for me my breast [with assurance].', ref: 'Taha 20:25' },
  { arabic: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ', translation: 'And your Lord is going to give you, and you will be satisfied.', ref: 'Ad-Duhaa 93:5' },
  { arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', translation: 'Indeed, Allah is with the patient.', ref: 'Al-Baqarah 2:153' },
  { arabic: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ', translation: 'And He is with you wherever you are.', ref: 'Al-Hadid 57:4' },
  { arabic: 'ادْعُونِي أَسْتَجِبْ لَكُمْ', translation: 'Call upon Me; I will respond to you.', ref: 'Ghafir 40:60' },
  { arabic: 'وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ', translation: 'And We are closer to him than his jugular vein.', ref: 'Qaf 50:16' },
  { arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا', translation: 'Allah does not burden a soul beyond that it can bear.', ref: 'Al-Baqarah 2:286' },
  { arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', translation: 'Verily, in the remembrance of Allah do hearts find rest.', ref: 'Ar-Ra\'d 13:28' },
  { arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', translation: 'And say, "My Lord, increase me in knowledge."', ref: 'Taha 20:114' },
  { arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', translation: 'For indeed, with hardship will be ease.', ref: 'Ash-Sharh 94:5' },
  { arabic: 'وَاصْبِرْ فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ', translation: 'And be patient, for indeed, Allah does not allow to be lost the reward of those who do good.', ref: 'Hud 11:115' },
  { arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', translation: 'Sufficient for us is Allah, and He is the best Disposer of affairs.', ref: 'Ali \'Imran 3:173' },
  { arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ', translation: 'O you who believe, seek help through patience and prayer.', ref: 'Al-Baqarah 2:153' },
  { arabic: 'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ', translation: 'And my success is not but through Allah.', ref: 'Hud 11:88' },
  { arabic: 'إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ', translation: 'Indeed, the mercy of Allah is near to the doers of good.', ref: 'Al-A\'raf 7:56' },
  { arabic: 'وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ', translation: 'And do not despair of relief from Allah.', ref: 'Yusuf 12:87' },
  { arabic: 'فَفِرُّوا إِلَى اللَّهِ', translation: 'So flee to Allah.', ref: 'Adh-Dhariyat 51:50' },
  { arabic: 'وَاللَّهُ خَيْرُ الرَّازِقِينَ', translation: 'And Allah is the best of providers.', ref: 'Al-Jumu\'ah 62:11' },
  { arabic: 'إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ', translation: 'Indeed, Allah will not change the condition of a people until they change what is in themselves.', ref: 'Ar-Ra\'d 13:11' },
  { arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', translation: 'And whoever fears Allah — He will make for him a way out.', ref: 'At-Talaq 65:2' },
  { arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً', translation: 'Our Lord, give us in this world that which is good and in the Hereafter that which is good.', ref: 'Al-Baqarah 2:201' },
  { arabic: 'وَاللَّهُ يُحِبُّ الصَّابِرِينَ', translation: 'And Allah loves the steadfast.', ref: 'Ali \'Imran 3:146' },
  { arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ', translation: 'Say, "He is Allah, the One."', ref: 'Al-Ikhlas 112:1' },
  { arabic: 'وَإِلَىٰ رَبِّكَ فَارْغَب', translation: 'And to your Lord direct your longing.', ref: 'Ash-Sharh 94:8' },
  { arabic: 'سَيَجْعَلُ اللَّهُ بَعْدَ عُسْرٍ يُسْرًا', translation: 'Allah will bring about, after hardship, ease.', ref: 'At-Talaq 65:7' },
  { arabic: 'وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ', translation: 'And rely upon the Ever-Living who does not die.', ref: 'Al-Furqan 25:58' },
  { arabic: 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ', translation: 'And We send down of the Quran that which is healing and mercy for the believers.', ref: 'Al-Isra 17:82' },
];

function getDailyVerse() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return dailyVerses[dayOfYear % dailyVerses.length];
}

function RamadanCountdown({ maghribTime, fajrTime }: { maghribTime: Date; fajrTime: Date }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const suhoorTime = new Date(fajrTime.getTime() - 10 * 60 * 1000);
  const beforeIftar = now < maghribTime;
  const target = beforeIftar ? maghribTime : new Date(suhoorTime.getTime() + 24 * 60 * 60 * 1000);
  const label = beforeIftar ? 'Iftar in' : 'Next Suhoor in';
  const subtext = beforeIftar ? 'Until Maghrib' : 'Until Fajr';

  const diff = Math.max(0, target.getTime() - now.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  // Arc progress: fasting window = suhoor to maghrib
  const fastTotal = maghribTime.getTime() - suhoorTime.getTime();
  const fastElapsed = now.getTime() - suhoorTime.getTime();
  const progress = beforeIftar ? Math.min(1, Math.max(0, fastElapsed / fastTotal)) : 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="mt-6"
    >
      <div
        className="rounded-2xl px-5 py-5 backdrop-blur-xl"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <div className="flex items-center justify-center">
          <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
            <svg width="120" height="120" viewBox="0 0 120 120" className="rotate-[-90deg]">
              <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
              <motion.circle
                cx="60" cy="60" r={radius}
                fill="none" stroke="#C9A84C" strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[9px] uppercase tracking-[0.15em] text-white/40 mb-0.5">{label}</p>
              <p className="leading-none">
                <span className="text-[32px] font-light text-[#C9A84C]">{hours}</span>
                <span className="text-[14px] text-white/30 mx-0.5">h</span>
                <span className="text-[32px] font-light text-[#C9A84C] ml-1">{minutes.toString().padStart(2, '0')}</span>
                <span className="text-[14px] text-white/30 mx-0.5">m</span>
              </p>
              <p className="text-[9px] text-white/25 mt-0.5">{subtext}</p>
            </div>
          </div>
        </div>
        {beforeIftar && (
          <p className="text-[9px] text-center text-white/20 mt-2">{Math.round(progress * 100)}% of fast completed</p>
        )}
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { prayers, currentPrayer, nextPrayer, countdown, qiblaDirection, loading, location } = usePrayerTimes();
  const verse = useMemo(() => getDailyVerse(), []);
  const [compassOpen, setCompassOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen gradient-default flex items-center justify-center">
        <div className="geometric-pattern absolute inset-0" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <p className="font-arabic-display text-4xl text-primary mb-3">نُور</p>
          <p className="text-sm text-muted-foreground">Loading prayer times...</p>
        </motion.div>
      </div>
    );
  }

  const currentPrayerData = prayers.find(p => p.name === currentPrayer);
  const fajrTime = prayers.find(p => p.name === 'fajr');
  const maghribTime = prayers.find(p => p.name === 'maghrib');

  return (
    <GradientBackground prayer={currentPrayer}>
      <div className="min-h-screen pb-24 px-5 safe-area-top">
        {/* Top bar: hijri date top-right */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="pt-12 pb-1 flex justify-end"
        >
          <p className="text-[10px] text-white/[0.6] font-arabic">{getHijriDate()}</p>
        </motion.div>

        {/* Hero: Arabic calligraphy name → English → countdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center pt-6 pb-5"
        >
          {currentPrayerData && (
            <p className="font-arabic-display text-white py-3" style={{ fontSize: '64px', lineHeight: 1.3 }}>
              {currentPrayerData.arabicLabel}
            </p>
          )}
          <h1 className="text-2xl text-white/70 mt-1" style={{ fontWeight: 300, letterSpacing: '0.15em' }}>
            {currentPrayerData?.label || 'Prayer'}
          </h1>
          {nextPrayer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-3"
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

        {/* Prayer times row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-x-auto no-scrollbar -mx-5 px-5 mt-2"
        >
          <div className="flex gap-2 min-w-max pb-2">
            {prayers.filter(p => p.name !== 'sunrise').map((prayer) => {
              const isActive = prayer.name === currentPrayer;
              const isNext = nextPrayer?.name === prayer.name;
              return (
                <div
                  key={prayer.name}
                  className={`rounded-xl px-3.5 py-2.5 text-center min-w-[78px] transition-all border backdrop-blur-xl
                    ${isActive
                      ? 'bg-white/15 border-[#C9A84C]/40'
                      : 'bg-white/[0.07] border-white/[0.08]'
                    }
                    ${isNext ? 'border-white/15' : ''}
                  `}
                  style={isActive ? { boxShadow: '0 0 16px rgba(201, 168, 76, 0.25), 0 0 32px rgba(201, 168, 76, 0.1)' } : undefined}
                >
                  <p className="text-[9px] uppercase tracking-widest text-white/45 mb-0.5">{prayer.label}</p>
                  <p className={`text-xs font-semibold ${isActive ? 'text-[#C9A84C]' : 'text-white/75'}`}>
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
          className="flex justify-center mt-6"
        >
          <button
            onClick={() => setCompassOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] border border-white/[0.1] backdrop-blur-lg active:scale-95 transition-transform"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="12,2 14.5,9.5 12,8 9.5,9.5" fill="#C9A84C" />
              <polygon points="12,22 9.5,14.5 12,16 14.5,14.5" fill="rgba(255,255,255,0.3)" />
            </svg>
            <span className="text-xs text-white/60">Qibla</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </motion.div>

        {/* Qibla Compass overlay */}
        <QiblaCompass
          open={compassOpen}
          onClose={() => setCompassOpen(false)}
          qiblaDirection={qiblaDirection}
          latitude={location?.lat || 0}
          longitude={location?.lng || 0}
        />

        {/* Daily Verse card — soft frosted glass */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <div
            className="rounded-2xl px-5 py-4 backdrop-blur-xl"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p className="text-[9px] uppercase tracking-widest text-white/40 mb-3">Daily Verse</p>
            <p className="font-arabic text-xl text-white/90 text-center leading-relaxed mb-3">{verse.arabic}</p>
            <p className="text-sm text-white/60 text-center italic leading-relaxed">{verse.translation}</p>
            <p className="text-[10px] text-white/30 text-center mt-2">{verse.ref}</p>
          </div>
        </motion.div>

        {/* Suhoor & Iftar chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-4 flex gap-3 justify-center"
        >
          {fajrTime && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.07] border border-white/[0.08] backdrop-blur-lg">
              <span className="text-[10px] uppercase tracking-wider text-white/40">Suhoor</span>
              <span className="text-xs font-semibold text-white/80">{formatTime(new Date(fajrTime.time.getTime() - 10 * 60 * 1000))}</span>
            </div>
          )}
          {maghribTime && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.07] border border-white/[0.08] backdrop-blur-lg">
              <span className="text-[10px] uppercase tracking-wider text-white/40">Iftar</span>
              <span className="text-xs font-semibold text-white/80">{formatTime(maghribTime.time)}</span>
            </div>
          )}
        </motion.div>

        {/* Iftar/Suhoor countdown hero — Ramadan only */}
        {isRamadan() && maghribTime && fajrTime && (
          <RamadanCountdown maghribTime={maghribTime.time} fajrTime={fajrTime.time} />
        )}
      </div>
    </GradientBackground>
  );
}
