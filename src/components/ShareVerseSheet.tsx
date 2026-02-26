import { useState, useRef, useEffect, forwardRef } from 'react';
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

/* ── Canvas 2D rendering (replaces html2canvas — works reliably on iOS Safari) ── */

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  if (words.length === 0) return [''];
  const lines: string[] = [];
  let currentLine = words[0];
  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    if (ctx.measureText(testLine).width > maxWidth) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);
  return lines;
}

function drawCardBackground(ctx: CanvasRenderingContext2D, size: number, bgId: string) {
  if (bgId === 'black') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);
    return;
  }
  const gradientColors: Record<string, [string, string]> = {
    navy: ['#0d2137', '#080f1a'],
    green: ['#0d2b1e', '#060f0a'],
    amber: ['#2b1a0d', '#0f0804'],
  };
  const [inner, outer] = gradientColors[bgId] || gradientColors.navy;
  const grad = ctx.createRadialGradient(size * 0.3, size * 0.2, 0, size * 0.3, size * 0.2, size * 0.85);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
}

function drawGeometricPattern(ctx: CanvasRenderingContext2D, size: number) {
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < size; x += 80) {
    for (let y = 0; y < size; y += 80) {
      const cx = x + 40, cy = y + 40;
      ctx.globalAlpha = 0.0048;
      ctx.beginPath();
      ctx.moveTo(cx, y); ctx.lineTo(x + 80, cy); ctx.lineTo(cx, y + 80); ctx.lineTo(x, cy);
      ctx.closePath(); ctx.stroke();
      ctx.globalAlpha = 0.0032;
      ctx.beginPath();
      ctx.moveTo(cx, y + 12); ctx.lineTo(x + 68, cy); ctx.lineTo(cx, y + 68); ctx.lineTo(x + 12, cy);
      ctx.closePath(); ctx.stroke();
      ctx.globalAlpha = 0.002;
      ctx.beginPath();
      ctx.moveTo(cx, y + 24); ctx.lineTo(x + 56, cy); ctx.lineTo(cx, y + 56); ctx.lineTo(x + 24, cy);
      ctx.closePath(); ctx.stroke();
    }
  }
  ctx.restore();
}

async function renderShareCardCanvas(params: {
  verseText: string;
  surahArabicName: string;
  verseRef: string;
  arabicFontSize: number;
  bgId: string;
  showTranslation: boolean;
  translationText: string;
}): Promise<HTMLCanvasElement> {
  const SIZE = 1080;
  const SCALE = 2;
  console.log('[Nur] Creating canvas', SIZE * SCALE, 'x', SIZE * SCALE);

  const canvas = document.createElement('canvas');
  canvas.width = SIZE * SCALE;
  canvas.height = SIZE * SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2d context');
  ctx.scale(SCALE, SCALE);

  // Background + geometric pattern
  drawCardBackground(ctx, SIZE, params.bgId);
  drawGeometricPattern(ctx, SIZE);
  console.log('[Nur] Background + pattern drawn');

  // "نور" branding top-left
  ctx.save();
  ctx.font = "53px 'Scheherazade New', serif";
  ctx.fillStyle = '#C9A84C';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('نور', 70, 55);
  ctx.restore();

  // Surah name top-right
  ctx.save();
  ctx.font = "43px 'Scheherazade New', serif";
  ctx.fillStyle = '#C9A84C';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(params.surahArabicName, SIZE - 70, 60);
  ctx.restore();

  // Verse reference below surah name
  ctx.save();
  ctx.font = "34px 'Inter', sans-serif";
  ctx.fillStyle = 'rgba(201, 168, 76, 0.6)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(params.verseRef, SIZE - 70, 120);
  ctx.restore();

  // ── Middle content (vertically centered) ──
  const TOP_AREA = 180;
  const BOTTOM_AREA = 80;
  const middleHeight = SIZE - TOP_AREA - BOTTOM_AREA;

  // Measure Arabic verse
  ctx.font = `${params.arabicFontSize}px 'Scheherazade New', serif`;
  const arabicLineHeight = params.arabicFontSize * 1.8;
  const arabicLines = wrapCanvasText(ctx, params.verseText, 940);
  const arabicBlockHeight = arabicLines.length * arabicLineHeight;

  // Measure translation
  let translationLines: string[] = [];
  const transFontSize = 38;
  const transLineHeight = transFontSize * 1.6;
  let transBlockHeight = 0;
  if (params.showTranslation && params.translationText) {
    ctx.font = `italic ${transFontSize}px 'Inter', sans-serif`;
    translationLines = wrapCanvasText(ctx, params.translationText, 900).slice(0, 3);
    transBlockHeight = translationLines.length * transLineHeight;
  }

  // Total content height + vertical centering
  const GAP = 28;
  let totalHeight = arabicBlockHeight + GAP + 1; // text + gap + divider
  if (transBlockHeight > 0) totalHeight += GAP + transBlockHeight;
  let y = TOP_AREA + (middleHeight - totalHeight) / 2;

  // Draw Arabic verse text
  ctx.save();
  ctx.font = `${params.arabicFontSize}px 'Scheherazade New', serif`;
  ctx.fillStyle = '#C9A84C';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (const line of arabicLines) {
    ctx.fillText(line, SIZE / 2, y);
    y += arabicLineHeight;
  }
  ctx.restore();
  console.log('[Nur] Arabic text drawn,', arabicLines.length, 'lines');

  // Gold divider
  y += GAP;
  ctx.fillStyle = 'rgba(201, 168, 76, 0.4)';
  ctx.fillRect(SIZE / 2 - 60, y, 120, 1);
  y += 1;

  // Translation text
  if (translationLines.length > 0) {
    y += GAP;
    ctx.save();
    ctx.font = `italic ${transFontSize}px 'Inter', sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (const line of translationLines) {
      ctx.fillText(line, SIZE / 2, y);
      y += transLineHeight;
    }
    ctx.restore();
    console.log('[Nur] Translation drawn,', translationLines.length, 'lines');
  }

  // Bottom divider
  ctx.fillStyle = 'rgba(201, 168, 76, 0.3)';
  ctx.fillRect(70, SIZE - BOTTOM_AREA, SIZE - 140, 1);

  // Footer URL
  ctx.save();
  ctx.font = "26px 'Inter', sans-serif";
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('nur-prayer.lovable.app', SIZE / 2, SIZE - BOTTOM_AREA + 16);
  ctx.restore();

  console.log('[Nur] Canvas render complete');
  return canvas;
}

/* ── Component ── */

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
      console.log('[Nur] Pre-render starting');

      try {
        await document.fonts.ready;
        console.log('[Nur] Fonts ready');
        // Allow 300ms for DOM mount + layout/paint to settle
        await new Promise(resolve => setTimeout(resolve, 300));

        if (cancelled) return;

        console.log('[Nur] Starting canvas render');
        const canvas = await renderShareCardCanvas({
          verseText: verse.text_uthmani,
          surahArabicName,
          verseRef,
          arabicFontSize,
          bgId: bg.id,
          showTranslation,
          translationText,
        });
        console.log('[Nur] Canvas rendered:', canvas.width, 'x', canvas.height);

        if (cancelled) return;

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
        });
        console.log('[Nur] Blob created:', blob ? blob.size + ' bytes' : 'null');

        if (cancelled || !blob) return;

        const dataUrl = canvas.toDataURL('image/png');
        console.log('[Nur] Data URL created, length:', dataUrl.length);

        setRenderedCanvas({ blob, dataUrl });
        console.log('[Nur] Pre-render complete, buttons should be enabled');
      } catch (err) {
        console.error('[Nur] Pre-render failed:', err);
        alert('Share card render failed: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        if (!cancelled) setPreRendering(false);
      }
    };

    preRender();
    return () => { cancelled = true; };
  }, [open, bgIndex, contentMode]);

  const handleShare = () => {
    console.log('[Nur] Share button tapped');
    try {
      if (!renderedCanvas) {
        console.log('[Nur] No rendered canvas available');
        alert('Image not ready yet. Please wait a moment and try again.');
        return;
      }
      const { blob, dataUrl } = renderedCanvas;
      console.log('[Nur] Creating file from blob, size:', blob.size);
      const file = new File([blob], `nur-verse-${verseRef}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        console.log('[Nur] Sharing via Web Share API...');
        navigator.share({ files: [file], title: 'Nur — Quran Verse' }).catch((err) => {
          console.error('[Nur] Share API rejected:', err);
          if (err instanceof Error && err.name !== 'AbortError') {
            window.open(dataUrl, '_blank');
          }
        });
      } else {
        console.log('[Nur] Web Share not available, using fallback');
        if (isIOS) {
          console.log('[Nur] iOS fallback: opening data URL in new tab');
          window.open(dataUrl, '_blank');
          setTimeout(() => alert('Press and hold the image, then tap Save to Photos'), 300);
        } else {
          console.log('[Nur] Desktop fallback: triggering download');
          triggerDownload(blob);
        }
      }
    } catch (err) {
      console.error('[Nur] handleShare error:', err);
      alert('Share failed: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleSave = () => {
    console.log('[Nur] Save button tapped');
    try {
      if (!renderedCanvas) {
        console.log('[Nur] No rendered canvas available');
        alert('Image not ready yet. Please wait a moment and try again.');
        return;
      }
      const { blob, dataUrl } = renderedCanvas;
      console.log('[Nur] Saving, blob size:', blob.size);

      if (isIOS) {
        console.log('[Nur] iOS save: opening data URL in new tab');
        window.open(dataUrl, '_blank');
        setTimeout(() => alert('Press and hold the image, then tap Save to Photos'), 300);
      } else {
        console.log('[Nur] Desktop save: triggering download');
        triggerDownload(blob);
      }
    } catch (err) {
      console.error('[Nur] handleSave error:', err);
      alert('Save failed: ' + (err instanceof Error ? err.message : String(err)));
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

/* ── The 1080x1080 share card (used for live preview only) ── */

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
