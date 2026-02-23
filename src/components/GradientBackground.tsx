import { ReactNode } from 'react';
import { type PrayerName } from '@/lib/prayer-utils';
import bgFajr from '@/assets/bg-fajr.png';
import bgSunrise from '@/assets/bg-sunrise.png';
import bgDhuhr from '@/assets/bg-dhuhr.png';
import bgAsr from '@/assets/bg-asr.png';
import bgMaghrib from '@/assets/bg-maghrib.png';
import bgIsha from '@/assets/bg-isha.png';

const prayerBackgrounds: Record<PrayerName, string> = {
  fajr: bgFajr,
  sunrise: bgSunrise,
  dhuhr: bgDhuhr,
  asr: bgAsr,
  maghrib: bgMaghrib,
  isha: bgIsha,
};

interface GradientBackgroundProps {
  prayer: PrayerName;
  children: ReactNode;
}

export function GradientBackground({ prayer, children }: GradientBackgroundProps) {
  const bgImage = prayerBackgrounds[prayer];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-bleed background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[2000ms]"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      {/* Dark gradient overlay — bottom 60%, opacity 0.6 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
