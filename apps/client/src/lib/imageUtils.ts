// Utilitaires pour la gestion des images
// Nettoie et optimise les URLs d'images

/**
 * Nettoie l'URL d'un poster de film
 * Remplace "N/A" par une image par défaut et corrige les URLs
 */
export function cleanPosterUrl(url: string | undefined | null): string {
  if (!url || url === 'N/A' || url.trim() === '') {
    // Image par défaut (placeholder)
    return 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=No+Image';
  }
  
  // S'assurer que l'URL est valide
  try {
    new URL(url);
    return url;
  } catch {
    // Si l'URL n'est pas valide, retourner l'image par défaut
    return 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=No+Image';
  }
}

/**
 * Optimise une URL d'image pour une taille spécifique
 */
export function optimizeImageUrl(url: string, width?: number, height?: number): string {
  const cleaned = cleanPosterUrl(url);
  
  // Si c'est une image placeholder, retourner tel quel
  if (cleaned.includes('placeholder')) {
    return cleaned;
  }
  
  // Pour les vraies images, on pourrait utiliser un service de redimensionnement
  // Pour l'instant, on retourne l'URL telle quelle
  return cleaned;
}
