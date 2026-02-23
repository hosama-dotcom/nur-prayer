import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/quran', label: 'Quran', icon: QuranIcon },
  { path: '/dhikr', label: 'Dhikr', icon: DhikrIcon },
  { path: '/tracker', label: 'Tracker', icon: TrackerIcon },
  { path: '/more', label: 'More', icon: MoreIcon },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {/* Subtle bottom gradient for contrast */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
        style={{
          height: '120px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 100%)',
        }}
      />
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bottom-nav-container" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
        <div
          className="flex items-center justify-around"
          style={{
            width: '90%',
            maxWidth: '420px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '32px',
            padding: '10px 24px',
          }}
        >
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center gap-1 py-1 px-3"
              >
                <tab.icon active={isActive} />
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-white/60'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'hsl(43, 50%, 54%)' : 'rgba(255,255,255,0.6)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function QuranIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'hsl(43, 50%, 54%)' : 'rgba(255,255,255,0.6)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <path d="M12 6v7" />
      <path d="M9 9h6" />
    </svg>
  );
}

function DhikrIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'hsl(43, 50%, 54%)' : 'rgba(255,255,255,0.6)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
    </svg>
  );
}

function TrackerIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'hsl(43, 50%, 54%)' : 'rgba(255,255,255,0.6)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  );
}

function MoreIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'hsl(43, 50%, 54%)' : 'rgba(255,255,255,0.6)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}
