/**
 * Tafseer API — fetches Ibn Kathir tafseer from islamic.network CDN.
 * Results are cached in localStorage to avoid repeat API calls.
 */

const CACHE_PREFIX = 'nur_tafseer_';

/** Truncate text to the first 3 sentences, adding '...' if truncated. */
function truncateToSentences(text: string, max = 3): string {
  // Split on sentence-ending punctuation followed by a space or end-of-string
  const sentences = text.match(/[^.!?]*[.!?]+/g);
  if (!sentences || sentences.length <= max) return text.trim();
  return sentences.slice(0, max).join('').trim() + '...';
}

/** Strip HTML tags from API response text. */
function stripTags(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export type TafseerResult =
  | { status: 'loading' }
  | { status: 'loaded'; text: string }
  | { status: 'error' };

/** Check localStorage cache for tafseer. */
export function getCachedTafseer(surahNumber: number, verseNumber: number): string | null {
  try {
    return localStorage.getItem(`${CACHE_PREFIX}${surahNumber}_${verseNumber}`);
  } catch {
    return null;
  }
}

/** Fetch tafseer from API, cache it, and return the truncated text. */
export async function fetchTafseer(surahNumber: number, verseNumber: number): Promise<string> {
  // Check cache first
  const cached = getCachedTafseer(surahNumber, verseNumber);
  if (cached) return cached;

  const res = await fetch(
    `https://cdn.islamic.network/quran/tafseer/en.ibn-kathir/${surahNumber}/${verseNumber}.json`,
    { signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) throw new Error('Tafseer fetch failed');

  const data = await res.json();
  const rawText: string = data?.text || data?.tafseer || '';
  const cleaned = stripTags(rawText);
  const truncated = truncateToSentences(cleaned);

  // Cache in localStorage
  try {
    localStorage.setItem(`${CACHE_PREFIX}${surahNumber}_${verseNumber}`, truncated);
  } catch {
    // localStorage full — ignore
  }

  return truncated;
}
