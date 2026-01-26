// Utilitaires pour gérer les URLs d'images
// Vérifie la validité des URLs et nettoie celles provenant d'OMDb

/**
 * Vérifie si une URL d'image est valide
 * @param url - URL à vérifier
 * @returns true si l'URL est valide, false sinon
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  // Vérifier que c'est une URL HTTP ou HTTPS valide
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    // Si la création de l'URL échoue, ce n'est pas une URL valide
    return false;
  }
}

/**
 * Nettoie une URL d'image provenant d'OMDb
 * OMDb peut retourner "N/A" ou des URLs invalides
 * @param url - URL à nettoyer
 * @returns URL nettoyée ou null si invalide
 */
export function cleanPosterUrl(url: string | null | undefined): string | null {
  // Si pas d'URL ou valeur "N/A" d'OMDb, retourner null
  if (!url || url === 'N/A') return null;

  // Vérifier si l'URL contient des caractères suspects ou est trop courte
  if (url.includes('undefined') || url.length < 10) {
    return null;
  }

  return url;
}
