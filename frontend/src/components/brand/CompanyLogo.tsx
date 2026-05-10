import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface CompanyLogoProps {
  variant?: 'full' | 'icon' | 'dark';
  // full = main logo (sidebar, PDFs)
  // icon = small square mark (avatar, favicon)
  // dark = logo for light backgrounds
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: boolean; // show text fallback if no logo uploaded
}

export const CompanyLogo = ({
  variant = 'full',
  size = 'md',
  className = '',
  fallback = true
}: CompanyLogoProps) => {
  const { theme } = useTheme();

  const sizeMap = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-14',
  };

  const brand = theme?.brand;
  const companyName = brand?.companyName || 'African Holding';

  const logoSrc = {
    full: brand?.logoUrl,
    icon: brand?.faviconUrl || brand?.logoUrl,
    dark: brand?.logoDarkUrl || brand?.logoUrl,
  }[variant];

  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt={companyName}
        className={`${sizeMap[size]} w-auto object-contain ${className}`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  // Text fallback when no logo uploaded
  if (fallback) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center
                        justify-center text-white font-bold text-sm flex-shrink-0">
          {companyName.charAt(0)}
        </div>
        {variant !== 'icon' && (
          <span className="font-semibold text-text-primary truncate">
            {companyName}
          </span>
        )}
      </div>
    );
  }

  return null;
};
