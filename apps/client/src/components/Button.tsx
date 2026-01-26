// Composant Button : Bouton réutilisable avec différentes variantes
// Supporte plusieurs styles et tailles, ainsi qu'un état de chargement

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; // Style du bouton
  size?: 'sm' | 'md' | 'lg'; // Taille du bouton
  isLoading?: boolean; // Affiche un spinner si true
  children: React.ReactNode; // Contenu du bouton
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Styles de base communs à tous les boutons
  const baseStyles = 'font-display font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Styles selon la variante choisie
  const variantStyles = {
    primary: 'bg-[#9747FF] hover:bg-[#8a3ae6] text-white',
    secondary: 'bg-gray-800/80 hover:bg-gray-700/80 text-white backdrop-blur-sm border border-gray-700',
    outline: 'border-2 border-[#9747FF] text-[#9747FF] hover:bg-[#9747FF] hover:text-white',
    ghost: 'text-gray-300 hover:text-white hover:bg-gray-800/50',
  };

  // Styles selon la taille
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        // Afficher un spinner pendant le chargement
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
