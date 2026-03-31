import { Link } from '@tanstack/react-router';
import React from 'react';

type LinkComponentProps = React.ComponentProps<typeof Link>;

interface ButtonLinkProps extends Omit<LinkComponentProps, 'className'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const ButtonLink: React.FC<ButtonLinkProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-display font-semibold rounded-lg transition-all duration-300 inline-block text-center';
  const variantStyles = {
    primary: 'bg-[#9747FF] hover:bg-[#8a3ae6] text-white',
    secondary: 'bg-gray-800/80 hover:bg-gray-700/80 text-white backdrop-blur-sm border border-gray-700',
    outline: 'border-2 border-[#9747FF] text-[#9747FF] hover:bg-[#9747FF] hover:text-white',
    ghost: 'text-gray-300 hover:text-white hover:bg-gray-800/50',
  };
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
