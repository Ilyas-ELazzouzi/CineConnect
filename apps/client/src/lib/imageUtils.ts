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
