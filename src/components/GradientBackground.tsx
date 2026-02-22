import { ReactNode } from 'react';
import { type PrayerName, getGradientClass } from '@/lib/prayer-utils';

interface GradientBackgroundProps {
  prayer: PrayerName;
  children: ReactNode;
}

export function GradientBackground({ prayer, children }: GradientBackgroundProps) {
  const gradientClass = getGradientClass(prayer);

  return (
    <div className={`min-h-screen ${gradientClass} transition-all duration-[2000ms] relative`}>
      <div className="geometric-pattern absolute inset-0 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
