// Composant ButtonLink : Bouton qui est en fait un lien
// Même API que Button mais utilise Link de TanStack Router pour la navigation

import { Link, LinkProps } from '@tanstack/react-router';
import React from 'react';

interface ButtonLinkProps extends Omit<LinkProps, 'className'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; // Style du bouton
  size?: 'sm' | 'md' | 'lg'; // Taille du bouton
  children: React.ReactNode; // Contenu du bouton
  className?: string; // Classes CSS supplémentaires
}

export const ButtonLink: React.FC<ButtonLinkProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  // Styles de base
  const baseStyles = 'font-display font-semibold rounded-lg transition-all duration-300 inline-block text-center';
  
  // Styles selon la variante
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
    <Link
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
};
