export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

export function cleanPosterUrl(url: string | null | undefined): string | null {
  if (!url || url === 'N/A') return null;
  if (url.includes('undefined') || url.length < 10) {
    return null;
  }
  return url;
}

const HIGH_RES_WIDTH = 1000;
const HIGH_RES_HEIGHT = 1500;

export function getHighResPosterUrl(url: string | null | undefined): string | null {
  const cleaned = cleanPosterUrl(url);
  if (!cleaned) return null;
  return cleaned
    .replace(/_SX\d+/g, `_SX${HIGH_RES_WIDTH}`)
    .replace(/_SY\d+/g, `_SY${HIGH_RES_HEIGHT}`)
    .replace(/_UX\d+/g, `_UX${HIGH_RES_WIDTH}`)
    .replace(/_UY\d+/g, `_UY${HIGH_RES_HEIGHT}`);
}
