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
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const perm = await (DeviceOrientationEvent as any).requestPermission();
        if (perm !== 'granted') { setPermissionDenied(true); return; }
      } catch { setPermissionDenied(true); return; }
    }
    const handler = (e: DeviceOrientationEvent) => {
      let h: number | null = null;
      if ((e as any).webkitCompassHeading != null) h = (e as any).webkitCompassHeading;
      else if (e.alpha != null) h = 360 - e.alpha;
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

  useEffect(() => {
    if (heading === null) return;
    const diff = Math.abs(((heading - qiblaDirection) % 360 + 360) % 360);
    const isAligned = diff < 5 || diff > 355;
    setAligned(isAligned);
    if (isAligned && navigator.vibrate) navigator.vibrate(30);
  }, [heading, qiblaDirection]);

  const compassRotation = heading !== null ? -heading : 0;

  const cardinals = [
    { label: 'N', angle: 0, gold: true },
    { label: 'NE', angle: 45, gold: false },
    { label: 'E', angle: 90, gold: false },
    { label: 'SE', angle: 135, gold: false },
    { label: 'S', angle: 180, gold: false },
    { label: 'SW', angle: 225, gold: false },
    { label: 'W', angle: 270, gold: false },
    { label: 'NW', angle: 315, gold: false },
  ];

  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 140;
  const tickOuterR = 132;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, #0F1825 0%, #070B12 100%)', paddingBottom: '40px' }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-12 left-5 z-10 w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Kaaba icon — sits close above compass */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col items-center mb-4"
          >
            <svg width="44" height="44" viewBox="0 0 64 64" fill="none">
              <rect x="12" y="16" width="40" height="38" rx="2" fill={aligned ? '#34D399' : '#1A1A2E'} stroke={aligned ? '#34D399' : '#C9A84C'} strokeWidth="1.5" />
              <rect x="12" y="28" width="40" height="6" fill={aligned ? '#6EE7B7' : '#C9A84C'} opacity="0.85" />
              <rect x="28" y="36" width="8" height="14" rx="1" fill={aligned ? '#166534' : '#C9A84C'} opacity="0.5" />
              <line x1="16" y1="31" x2="24" y2="31" stroke={aligned ? '#065F46' : '#8B6914'} strokeWidth="0.7" opacity="0.6" />
              <line x1="40" y1="31" x2="48" y2="31" stroke={aligned ? '#065F46' : '#8B6914'} strokeWidth="0.7" opacity="0.6" />
              <line x1="12" y1="16" x2="52" y2="16" stroke={aligned ? '#6EE7B7' : '#C9A84C'} strokeWidth="0.5" opacity="0.4" />
            </svg>
            <p className={`text-[10px] mt-2 font-semibold tracking-[0.15em] uppercase ${aligned ? 'text-emerald-400' : 'text-primary/60'}`}>
              {aligned ? '✓ Qibla Found' : 'Kaaba · Makkah'}
            </p>
          </motion.div>

          {/* Compass */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 22 }}
            className="relative"
            style={{ width: size, height: size }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: aligned
                  ? '0 0 40px rgba(52, 211, 153, 0.2), inset 0 0 30px rgba(52, 211, 153, 0.05)'
                  : '0 0 40px rgba(201, 168, 76, 0.15), inset 0 0 30px rgba(201, 168, 76, 0.05)',
              }}
            />

            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              style={{ transform: `rotate(${compassRotation}deg)`, transition: 'transform 0.12s ease-out' }}
            >
              <circle cx={cx} cy={cy} r={outerR} fill="#0C1219" />
              <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={aligned ? '#34D399' : '#C9A84C'} strokeWidth="2" opacity="0.5" />
              <circle cx={cx} cy={cy} r={outerR - 3} fill="none" stroke={aligned ? '#34D399' : '#C9A84C'} strokeWidth="0.5" opacity="0.2" />
              <circle cx={cx} cy={cy} r="50" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

              {/* Tick marks */}
              {Array.from({ length: 72 }).map((_, i) => {
                const angle = i * 5;
                const isMajor = angle % 45 === 0;
                const isMinor = angle % 15 === 0 && !isMajor;
                const len = isMajor ? 16 : isMinor ? 10 : 5;
                const r1 = tickOuterR - len;
                const r2 = tickOuterR;
                const rad = (angle * Math.PI) / 180;
                const color = isMajor ? (aligned ? '#34D399' : '#C9A84C') : 'rgba(255,255,255,0.12)';
                const width = isMajor ? 2 : isMinor ? 1 : 0.5;
                return (
                  <line
                    key={i}
                    x1={cx + r1 * Math.sin(rad)}
                    y1={cy - r1 * Math.cos(rad)}
                    x2={cx + r2 * Math.sin(rad)}
                    y2={cy - r2 * Math.cos(rad)}
                    stroke={color}
                    strokeWidth={width}
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Cardinal labels */}
              {cardinals.map(({ label, angle, gold }) => {
                const rad = (angle * Math.PI) / 180;
                const r = outerR - 26;
                const isPrimary = ['N', 'S', 'E', 'W'].includes(label);
                return (
                  <text
                    key={label}
                    x={cx + r * Math.sin(rad)}
                    y={cy - r * Math.cos(rad)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={gold ? (aligned ? '#34D399' : '#C9A84C') : 'rgba(255,255,255,0.5)'}
                    fontSize={isPrimary ? 14 : 10}
                    fontWeight={isPrimary ? 700 : 400}
                    fontFamily="Inter, sans-serif"
                    letterSpacing="0.05em"
                  >
                    {label}
                  </text>
                );
              })}

              {/* Qibla needle — rotated to point toward Makkah */}
              <g transform={`rotate(${qiblaDirection}, ${cx}, ${cy})`}>
                <polygon
                  points={`${cx},${cy - 65} ${cx - 7},${cy} ${cx},${cy - 10} ${cx + 7},${cy}`}
                  fill={aligned ? '#34D399' : '#C9A84C'}
                  opacity="0.9"
                />
                <polygon
                  points={`${cx},${cy + 65} ${cx - 7},${cy} ${cx},${cy + 10} ${cx + 7},${cy}`}
                  fill="rgba(255,255,255,0.15)"
                />
              </g>

              {/* Center jewel */}
              <circle cx={cx} cy={cy} r="6" fill="#0C1219" stroke={aligned ? '#34D399' : '#C9A84C'} strokeWidth="1.5" />
              <circle cx={cx} cy={cy} r="2.5" fill={aligned ? '#34D399' : '#C9A84C'} opacity="0.8" />
            </svg>
          </motion.div>

          {/* Info below compass */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-5 text-center px-8"
          >
            {heading !== null ? (
              <>
                <p className={`text-base font-medium ${aligned ? 'text-emerald-400' : 'text-white/70'}`}>
                  {aligned ? 'You are facing the Qibla ✦' : 'Face this direction to pray'}
                </p>
                <p className="text-xs text-white/30 mt-1.5">{Math.round(qiblaDirection)}° from North</p>
              </>
            ) : permissionDenied ? (
              <p className="text-sm text-white/50 leading-relaxed">
                Compass access denied. Enable motion sensors in your device settings.
              </p>
            ) : (
              <p className="text-sm text-white/40">Waiting for compass data...</p>
            )}
          </motion.div>

          {/* Instruction */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-20 text-[11px] text-white/20 text-center px-10 leading-relaxed italic"
          >
            On mobile, rotate your device until the needle points to the Kaaba
          </motion.p>

          {/* Coordinates */}
          <div className="absolute bottom-10 text-center">
            <p className="text-[9px] text-white/15 tracking-wider">
              {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
