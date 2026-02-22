import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QiblaCompassProps {
  open: boolean;
  onClose: () => void;
  qiblaDirection: number;
  latitude: number;
  longitude: number;
}

export function QiblaCompass({ open, onClose, qiblaDirection, latitude, longitude }: QiblaCompassProps) {
  const [heading, setHeading] = useState<number | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [aligned, setAligned] = useState(false);

  const requestPermission = useCallback(async () => {
    // iOS 13+ requires explicit permission
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const perm = await (DeviceOrientationEvent as any).requestPermission();
        if (perm !== 'granted') {
          setPermissionDenied(true);
          return;
        }
      } catch {
        setPermissionDenied(true);
        return;
      }
    }

    const handler = (e: DeviceOrientationEvent) => {
      // Use webkitCompassHeading for iOS, alpha for Android
      let h: number | null = null;
      if ((e as any).webkitCompassHeading != null) {
        h = (e as any).webkitCompassHeading;
      } else if (e.alpha != null) {
        h = 360 - e.alpha;
      }
      if (h !== null) setHeading(h);
    };

    window.addEventListener('deviceorientation', handler, true);
    return () => window.removeEventListener('deviceorientation', handler, true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const cleanup = requestPermission();
    return () => { cleanup?.then?.(fn => fn?.()); };
  }, [open, requestPermission]);

  // Check alignment
  useEffect(() => {
    if (heading === null) return;
    const diff = Math.abs(((heading - qiblaDirection) % 360 + 360) % 360);
    const isAligned = diff < 5 || diff > 355;
    setAligned(isAligned);

    if (isAligned && navigator.vibrate) {
      navigator.vibrate(30);
    }
  }, [heading, qiblaDirection]);

  const compassRotation = heading !== null ? -heading : 0;
  const qiblaAngle = qiblaDirection;

  const cardinalPoints = [
    { label: 'N', angle: 0 },
    { label: 'E', angle: 90 },
    { label: 'S', angle: 180 },
    { label: 'W', angle: 270 },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: 'radial-gradient(ellipse at center, #0D1420 0%, #060810 100%)' }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-12 left-5 z-10 w-10 h-10 rounded-xl bg-white/[0.08] flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="absolute top-14 text-center"
          >
            <p className="text-xs text-white/40 uppercase tracking-[0.2em]">Qibla Direction</p>
          </motion.div>

          {/* Fixed Kaaba arrow at top — points to Qibla */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-28 flex flex-col items-center"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="6" y="6" width="12" height="12" rx="1.5" fill={aligned ? '#4ADE80' : '#C9A84C'} opacity={aligned ? 1 : 0.9} />
              <rect x="9" y="3" width="6" height="4" rx="0.5" fill={aligned ? '#4ADE80' : '#C9A84C'} opacity={aligned ? 0.9 : 0.6} />
              <circle cx="12" cy="12" r="1.5" fill={aligned ? '#166534' : '#7A5E1E'} />
            </svg>
            <p className={`text-[10px] mt-1 font-semibold tracking-wider ${aligned ? 'text-green-400' : 'text-primary/70'}`}>
              {aligned ? 'ALIGNED' : 'KAABA'}
            </p>
          </motion.div>

          {/* Compass rose */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 25 }}
            className="relative"
            style={{ width: 280, height: 280 }}
          >
            <svg
              width="280"
              height="280"
              viewBox="0 0 280 280"
              style={{ transform: `rotate(${compassRotation}deg)`, transition: 'transform 0.15s ease-out' }}
            >
              {/* Outer ring */}
              <circle cx="140" cy="140" r="130" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <circle cx="140" cy="140" r="120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

              {/* Degree marks */}
              {Array.from({ length: 72 }).map((_, i) => {
                const angle = i * 5;
                const isMajor = angle % 30 === 0;
                const r1 = isMajor ? 108 : 114;
                const r2 = 120;
                const rad = (angle * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    x1={140 + r1 * Math.sin(rad)}
                    y1={140 - r1 * Math.cos(rad)}
                    x2={140 + r2 * Math.sin(rad)}
                    y2={140 - r2 * Math.cos(rad)}
                    stroke={isMajor ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}
                    strokeWidth={isMajor ? 1.5 : 0.5}
                  />
                );
              })}

              {/* Cardinal points */}
              {cardinalPoints.map(({ label, angle }) => {
                const rad = (angle * Math.PI) / 180;
                const r = 96;
                return (
                  <text
                    key={label}
                    x={140 + r * Math.sin(rad)}
                    y={140 - r * Math.cos(rad)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={label === 'N' ? '#C9A84C' : 'rgba(255,255,255,0.4)'}
                    fontSize={label === 'N' ? 16 : 13}
                    fontWeight={label === 'N' ? 700 : 400}
                    fontFamily="Inter, sans-serif"
                  >
                    {label}
                  </text>
                );
              })}

              {/* North needle */}
              <polygon points="140,35 136,60 144,60" fill="#C9A84C" />

              {/* Qibla direction line */}
              <line
                x1="140"
                y1="140"
                x2={140 + 105 * Math.sin((qiblaAngle * Math.PI) / 180)}
                y2={140 - 105 * Math.cos((qiblaAngle * Math.PI) / 180)}
                stroke={aligned ? '#4ADE80' : '#C9A84C'}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
                strokeDasharray="4 4"
              />

              {/* Qibla marker on ring */}
              <circle
                cx={140 + 120 * Math.sin((qiblaAngle * Math.PI) / 180)}
                cy={140 - 120 * Math.cos((qiblaAngle * Math.PI) / 180)}
                r="6"
                fill={aligned ? '#4ADE80' : '#C9A84C'}
              />

              {/* Center dot */}
              <circle cx="140" cy="140" r="4" fill="rgba(255,255,255,0.15)" />
              <circle cx="140" cy="140" r="2" fill="#C9A84C" />
            </svg>
          </motion.div>

          {/* Alignment status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-8 text-center"
          >
            {heading !== null ? (
              <>
                <p className={`text-lg font-semibold ${aligned ? 'text-green-400' : 'text-white/60'}`}>
                  {aligned ? 'You are facing the Qibla' : 'Rotate to find Qibla'}
                </p>
                <p className="text-xs text-white/30 mt-2">{Math.round(qiblaDirection)}° from North</p>
              </>
            ) : permissionDenied ? (
              <p className="text-sm text-white/50 px-8 text-center">
                Compass access denied. Please enable motion sensors in your device settings.
              </p>
            ) : (
              <p className="text-sm text-white/40">
                Waiting for compass data...
              </p>
            )}
          </motion.div>

          {/* Location info */}
          <div className="absolute bottom-12 text-center">
            <p className="text-[10px] text-white/20">
              {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
