// Composant Loading : Indicateur de chargement
// Affiche un spinner animé avec un texte optionnel

import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'; // Taille du spinner
  text?: string; // Texte à afficher sous le spinner
}

export const Loading: React.FC<LoadingProps> = ({ size = 'md', text }) => {
  // Tailles du spinner selon la prop size
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {/* Spinner animé en violet */}
      <svg
        className={`animate-spin ${sizeStyles[size]} text-[#9747FF]`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {/* Texte optionnel sous le spinner */}
      {text && <p className="text-gray-400">{text}</p>}
    </div>
  );
};
