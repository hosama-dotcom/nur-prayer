import { useState, useRef, useEffect, forwardRef } from 'react';
import html2canvas from 'html2canvas';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/lib/i18n';

interface ShareVerse {
  verse_number: number;
  text_uthmani: string;
  translations: { text: string }[];
}

interface ShareVerseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verse: ShareVerse;
  surahNumber: number;
  surahArabicName: string;
}

type ContentMode = 'arabic' | 'translation';

const BACKGROUNDS = [
  { id: 'navy', gradient: 'radial-gradient(ellipse at 30% 20%, #0d2137 0%, #080f1a 100%)' },
  { id: 'green', gradient: 'radial-gradient(ellipse at 30% 20%, #0d2b1e 0%, #060f0a 100%)' },
  { id: 'amber', gradient: 'radial-gradient(ellipse at 30% 20%, #2b1a0d 0%, #0f0804 100%)' },
  { id: 'black', gradient: '#000000' },
] as const;

const SWATCH_COLORS = ['#0d2137', '#0d2b1e', '#2b1a0d', '#000000'];

const GEOMETRIC_SVG = `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0L80 40L40 80L0 40Z' fill='none' stroke='rgba(255,255,255,0.12)' stroke-width='0.5'/%3E%3Cpath d='M40 12L68 40L40 68L12 40Z' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='0.5'/%3E%3Cpath d='M40 24L56 40L40 56L24 40Z' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='0.5'/%3E%3C/svg%3E")`;

function getVerseFontSize(text: string): number {
  const len = text.length;
  if (len < 50) return 86;
  if (len <= 100) return 72;
  if (len <= 150) return 58;
  return 46;
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export default function ShareVerseSheet({ open, onOpenChange, verse, surahNumber, surahArabicName }: ShareVerseSheetProps) {
  const { t } = useLanguage();
  const [contentMode, setContentMode] = useState<ContentMode>('arabic');
  const [bgIndex, setBgIndex] = useState(0);
  const [preRendering, setPreRendering] = useState(false);
  const [renderedCanvas, setRenderedCanvas] = useState<{ blob: Blob; dataUrl: string } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const scaleWrapperRef = useRef<HTMLDivElement>(null);

  const verseRef = `${surahNumber}:${verse.verse_number}`;
  const translationText = verse.translations?.[0] ? stripHtml(verse.translations[0].text) : '';
  const arabicFontSize = getVerseFontSize(verse.text_uthmani);
  const bg = BACKGROUNDS[bgIndex];

  const showTranslation = contentMode === 'translation';
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Pre-render canvas when sheet opens or when user changes options
  useEffect(() => {
    if (!open) {
      setRenderedCanvas(null);
      return;
    }

    let cancelled = false;

    const preRender = async () => {
      setPreRendering(true);
      setRenderedCanvas(null);
      try {
        // Wait for fonts (especially Scheherazade) to fully load
        await document.fonts.ready;
        // Allow 300ms for DOM mount + layout/paint to settle
        await new Promise(resolve => setTimeout(resolve, 300));

        if (cancelled || !cardRef.current) return;

        // Temporarily remove preview scale so html2canvas captures at full 1080x1080
        const wrapper = scaleWrapperRef.current;
        const origTransform = wrapper?.style.transform || '';
        if (wrapper) wrapper.style.transform = 'none';

        try {
          const canvas = await html2canvas(cardRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: null,
            logging: false,
            width: 1080,
            height: 1080,
          });

          if (cancelled) return;

          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
          });

          if (cancelled || !blob) return;

          const dataUrl = canvas.toDataURL('image/png');
          setRenderedCanvas({ blob, dataUrl });
        } finally {
          if (wrapper) wrapper.style.transform = origTransform;
        }
      } catch (err) {
        console.error('[Nur] Pre-render failed:', err);
      } finally {
        if (!cancelled) setPreRendering(false);
      }
    };

    preRender();
    return () => { cancelled = true; };
  }, [open, bgIndex, contentMode]);

  // Synchronous handler — canvas is already rendered, preserves iOS user gesture chain
  const handleShare = () => {
    if (!renderedCanvas) return;
    const { blob, dataUrl } = renderedCanvas;
    const file = new File([blob], `nur-verse-${verseRef}.png`, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Nur — Quran Verse' }).catch((err) => {
        console.error('[Nur] Share failed:', err);
        if (err instanceof Error && err.name !== 'AbortError') {
          // Fall back to opening image in new tab
          window.open(dataUrl, '_blank');
        }
      });
    } else {
      // Web Share API not available or doesn't support files — fall back
      if (isIOS) {
        window.open(dataUrl, '_blank');
        setTimeout(() => alert('Press and hold the image, then tap Save to Photos'), 300);
      } else {
        triggerDownload(blob);
      }
    }
  };

  // Synchronous handler — canvas is already rendered, preserves iOS user gesture chain
  const handleSave = () => {
    if (!renderedCanvas) return;
    const { blob, dataUrl } = renderedCanvas;

    if (isIOS) {
      window.open(dataUrl, '_blank');
      setTimeout(() => alert('Press and hold the image, then tap Save to Photos'), 300);
    } else {
      triggerDownload(blob);
    }
  };

  const triggerDownload = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nur-verse-${verseRef}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const pills: { mode: ContentMode; labelKey: TranslationKey }[] = [
    { mode: 'arabic', labelKey: 'share.arabicOnly' },
    { mode: 'translation', labelKey: 'share.translation' },
  ];

  const buttonsReady = !!renderedCanvas && !preRendering;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="night-sky-bg border-t border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="px-4 pt-2 pb-6 space-y-4">

          {/* Live preview (scaled) */}
          <div className="flex justify-center">
            <div style={{ width: '100%', maxWidth: '340px', aspectRatio: '1', overflow: 'hidden', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
              <div ref={scaleWrapperRef} style={{ width: '1080px', height: '1080px', transform: 'scale(0.315)', transformOrigin: 'top left', pointerEvents: 'none', position: 'absolute', top: 0, left: 0 }}>
                <ShareCard
                  ref={cardRef}
                  verse={verse}
                  surahNumber={surahNumber}
                  surahArabicName={surahArabicName}
                  arabicFontSize={arabicFontSize}
                  background={bg.gradient}
                  showTranslation={showTranslation}
                  translationText={translationText}
                />
              </div>
            </div>
          </div>

          {/* Content mode pills */}
          <div className="flex justify-center gap-2 flex-wrap">
            {pills.map(({ mode, labelKey }) => (
              <button
                key={mode}
                onClick={() => setContentMode(mode)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={contentMode === mode ? {
                  background: '#C9A84C',
                  color: '#0A0A1A',
                } : {
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>

          {/* Background swatches */}
          <div className="flex justify-center gap-3">
            {SWATCH_COLORS.map((color, i) => (
              <button
                key={i}
                onClick={() => setBgIndex(i)}
                className="w-8 h-8 rounded-full transition-all"
                style={{
                  background: color,
                  border: bgIndex === i ? '2px solid #C9A84C' : '2px solid rgba(255,255,255,0.15)',
                  boxShadow: bgIndex === i ? '0 0 0 2px rgba(201,168,76,0.3)' : 'none',
                }}
              />
            ))}
          </div>

          {/* Share button */}
          <button
            onClick={handleShare}
            disabled={!buttonsReady}
            className="w-full rounded-xl font-semibold text-sm transition-opacity disabled:opacity-50"
            style={{
              background: '#C9A84C',
              color: '#0A0A1A',
              position: 'relative',
              zIndex: 50,
              transform: 'translateZ(0)',
              touchAction: 'manipulation',
              minHeight: '44px',
              padding: '12px 24px',
            }}
          >
            {preRendering ? '...' : t('share.share' as TranslationKey)}
          </button>

          {/* Save to photos */}
          <button
            onClick={handleSave}
            disabled={!buttonsReady}
            className="w-full text-center text-xs text-muted-foreground underline underline-offset-2 disabled:opacity-50"
            style={{
              position: 'relative',
              zIndex: 50,
              transform: 'translateZ(0)',
              touchAction: 'manipulation',
              minHeight: '44px',
              padding: '12px 24px',
            }}
          >
            {t('share.saveToPhotos' as TranslationKey)}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/* ── The 1080x1080 share card ── */

interface ShareCardProps {
  verse: ShareVerse;
  surahNumber: number;
  surahArabicName: string;
  arabicFontSize: number;
  background: string;
  showTranslation: boolean;
  translationText: string;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({
  verse, surahNumber, surahArabicName, arabicFontSize,
  background, showTranslation, translationText,
}, ref) => {
  const verseRef = `${surahNumber}:${verse.verse_number}`;

  return (
    <div
      ref={ref}
      style={{
        width: '1080px',
        height: '1080px',
        position: 'relative',
        overflow: 'hidden',
        background,
      }}
    >
      {/* Geometric pattern overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: GEOMETRIC_SVG,
        backgroundSize: '80px 80px',
        opacity: 0.04,
      }} />

      {/* Content wrapper */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '60px 70px',
      }}>
        {/* Top section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{
            fontFamily: "'Scheherazade New', serif",
            fontSize: '53px',
            color: '#C9A84C',
            lineHeight: 1,
          }}>
            نور
          </span>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: "'Scheherazade New', serif",
              fontSize: '43px',
              color: '#C9A84C',
              lineHeight: 1.3,
            }}>
              {surahArabicName}
            </div>
            <div style={{
              fontSize: '34px',
              color: 'rgba(201, 168, 76, 0.6)',
              marginTop: '4px',
              fontFamily: 'Inter, sans-serif',
            }}>
              {verseRef}
            </div>
          </div>
        </div>

        {/* Center section — takes remaining space */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '28px',
        }}>
          {/* Arabic text */}
          <div style={{
            fontFamily: "'Scheherazade New', serif",
            fontSize: `${arabicFontSize}px`,
            color: '#C9A84C',
            lineHeight: 1.8,
            textAlign: 'center',
            direction: 'rtl',
            maxWidth: '940px',
            wordBreak: 'break-word',
          }}>
            {verse.text_uthmani}
          </div>

          {/* Gold divider */}
          <div style={{
            width: '120px',
            height: '1px',
            background: 'rgba(201, 168, 76, 0.4)',
          }} />

          {/* Translation */}
          {showTranslation && translationText && (
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '38px',
              color: 'rgba(255, 255, 255, 0.85)',
              fontStyle: 'italic',
              textAlign: 'center',
              lineHeight: 1.6,
              maxWidth: '900px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {translationText}
            </div>
          )}
        </div>

        {/* Bottom strip */}
        <div>
          <div style={{
            width: '100%',
            height: '1px',
            background: 'rgba(201, 168, 76, 0.3)',
            marginBottom: '16px',
          }} />
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '26px',
            color: 'rgba(255, 255, 255, 0.3)',
            textAlign: 'center',
          }}>
            nur-prayer.lovable.app
          </div>
        </div>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';
