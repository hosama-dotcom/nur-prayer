import { useState } from 'react';
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

/* Canvas gradient stop colors matching the CSS backgrounds above */
const BG_CANVAS_COLORS: [string, string][] = [
  ['#0d2137', '#080f1a'],
  ['#0d2b1e', '#060f0a'],
  ['#2b1a0d', '#0f0804'],
  ['#000000', '#000000'],
];

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

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const testLine = line ? line + ' ' + word : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/* ── Component ── */

export default function ShareVerseSheet({ open, onOpenChange, verse, surahNumber, surahArabicName }: ShareVerseSheetProps) {
  const { t } = useLanguage();
  const [contentMode, setContentMode] = useState<ContentMode>('arabic');
  const [bgIndex, setBgIndex] = useState(0);

  const translationText = verse.translations?.[0] ? stripHtml(verse.translations[0].text) : '';
  const arabicFontSize = getVerseFontSize(verse.text_uthmani);
  const bg = BACKGROUNDS[bgIndex];

  const showTranslation = contentMode === 'translation';

  /* ── Pure Canvas 2D card generator (no html2canvas, no cross-origin issues) ── */
  const generateCard = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d')!;

    await document.fonts.ready;

    // Background gradient
    const [c0, c1] = BG_CANVAS_COLORS[bgIndex];
    if (c0 === c1) {
      ctx.fillStyle = c0;
    } else {
      const g = ctx.createRadialGradient(324, 216, 0, 540, 540, 900);
      g.addColorStop(0, c0);
      g.addColorStop(1, c1);
      ctx.fillStyle = g;
    }
    ctx.fillRect(0, 0, 1080, 1080);

    // Geometric diamond pattern overlay (very subtle)
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < 1080; x += 80) {
      for (let y = 0; y < 1080; y += 80) {
        const cx = x + 40, cy = y + 40;
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(x + 80, cy);
        ctx.lineTo(cx, y + 80);
        ctx.lineTo(x, cy);
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.restore();

    // "نور" logo — top left
    ctx.fillStyle = '#C9A84C';
    ctx.font = "500 53px 'Scheherazade New', serif";
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('نور', 70, 100);

    // Surah name — top right
    ctx.textAlign = 'right';
    ctx.font = "400 43px 'Scheherazade New', serif";
    ctx.fillText(surahArabicName, 1010, 100);

    // Verse reference
    ctx.font = '400 34px Inter, sans-serif';
    ctx.fillStyle = 'rgba(201, 168, 76, 0.6)';
    ctx.fillText(`${surahNumber}:${verse.verse_number}`, 1010, 140);

    // Arabic verse text — centered, word-wrapped
    ctx.fillStyle = '#C9A84C';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.font = `400 ${arabicFontSize}px 'Scheherazade New', serif`;

    const verseLines = wrapText(ctx, verse.text_uthmani, 900);
    const lineHeight = arabicFontSize * 1.8;
    const verseTotalHeight = verseLines.length * lineHeight;

    // Vertically center the verse block between header and footer
    const topBound = 170;
    const bottomBound = showTranslation ? 780 : 940;
    const verseCenterY = topBound + (bottomBound - topBound) / 2;
    let verseY = verseCenterY - verseTotalHeight / 2 + lineHeight * 0.6;

    for (const line of verseLines) {
      ctx.fillText(line, 540, verseY);
      verseY += lineHeight;
    }

    // Short gold divider (centered, 120px wide)
    const dividerY = verseY + 14;
    ctx.strokeStyle = 'rgba(201, 168, 76, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(480, dividerY);
    ctx.lineTo(600, dividerY);
    ctx.stroke();

    // Translation (if enabled)
    if (showTranslation && translationText) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = 'italic 38px Inter, sans-serif';
      ctx.direction = 'ltr';
      ctx.textAlign = 'center';
      const transLines = wrapText(ctx, translationText, 860);
      const transLineHeight = 38 * 1.6;
      let transY = dividerY + 50;
      for (let i = 0; i < Math.min(transLines.length, 3); i++) {
        ctx.fillText(transLines[i], 540, transY);
        transY += transLineHeight;
      }
    }

    // Bottom full-width divider
    ctx.strokeStyle = 'rgba(201, 168, 76, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(70, 1000);
    ctx.lineTo(1010, 1000);
    ctx.stroke();

    // Watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '26px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.direction = 'ltr';
    ctx.fillText('nur-prayer.lovable.app', 540, 1040);

    return canvas;
  };

  const handleShare = async () => {
    try {
      const canvas = await generateCard();
      canvas.toBlob(async (blob) => {
        if (!blob) { alert('Failed to generate image'); return; }
        const file = new File([blob], 'nur-verse.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Nur — Quran Verse' });
        } else {
          window.open(canvas.toDataURL('image/png'), '_blank');
        }
      }, 'image/png');
    } catch (err: any) {
      alert('Share failed: ' + err.message);
    }
  };

  const handleSave = async () => {
    try {
      const canvas = await generateCard();
      const dataUrl = canvas.toDataURL('image/png');
      window.open(dataUrl, '_blank');
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    }
  };

  const pills: { mode: ContentMode; labelKey: TranslationKey }[] = [
    { mode: 'arabic', labelKey: 'share.arabicOnly' },
    { mode: 'translation', labelKey: 'share.translation' },
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="night-sky-bg border-t border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="px-4 pt-2 pb-6 space-y-4">

          {/* Live preview (scaled DOM card — not used for export) */}
          <div className="flex justify-center">
            <div style={{ width: '100%', maxWidth: '340px', aspectRatio: '1', overflow: 'hidden', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
              <div style={{ width: '1080px', height: '1080px', transform: 'scale(0.315)', transformOrigin: 'top left', pointerEvents: 'none', position: 'absolute', top: 0, left: 0 }}>
                <ShareCard
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
            className="w-full rounded-xl font-semibold text-sm"
            style={{
              background: '#C9A84C',
              color: '#0A0A1A',
              position: 'relative',
              zIndex: 50,
              touchAction: 'manipulation',
              minHeight: '44px',
              cursor: 'pointer',
              padding: '12px 24px',
            }}
          >
            {t('share.share' as TranslationKey)}
          </button>

          {/* Save to photos */}
          <button
            onClick={handleSave}
            className="w-full text-center text-xs text-muted-foreground underline underline-offset-2"
            style={{
              position: 'relative',
              zIndex: 50,
              touchAction: 'manipulation',
              minHeight: '44px',
              cursor: 'pointer',
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

/* ── The 1080x1080 share card (DOM version — used for live preview only) ── */

interface ShareCardProps {
  verse: ShareVerse;
  surahNumber: number;
  surahArabicName: string;
  arabicFontSize: number;
  background: string;
  showTranslation: boolean;
  translationText: string;
}

function ShareCard({
  verse, surahNumber, surahArabicName, arabicFontSize,
  background, showTranslation, translationText,
}: ShareCardProps) {
  const verseRef = `${surahNumber}:${verse.verse_number}`;

  return (
    <div
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
}
