import React from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = "w-9 h-9" }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`shrink-0 ${className}`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Subtle outer double shadow ring to resemble the 3D double border in the uploaded logo */}
      <circle cx="50" cy="50" r="48" stroke="#E2E8F0" strokeWidth="2.5" fill="none" />
      <circle cx="50" cy="50" r="45" stroke="#F8FAFC" strokeWidth="3.5" fill="none" />
      
      {/* Primary Vibrant Blue Circle Background */}
      <circle cx="50" cy="50" r="41" fill="#20a6eb" />
      
      {/* Beautiful High-Contrast White Map Pin */}
      <path 
        d="M50 22C37.5 22 27.5 32 27.5 44.5C27.5 60.5 50 80 50 80C50 80 72.5 60.5 72.5 44.5C72.5 32 62.5 22 50 22Z" 
        fill="white" 
        filter="drop-shadow(0px 1.5px 2px rgba(0,0,0,0.06))"
      />
      
      {/* Airplane Silhouette pointing up-right at exactly 45 degrees inside the map pin */}
      <path 
        d="M50 31.5 L53.5 37.5 L65.5 41 L53.5 43.5 L52.5 50.5 L56.5 54 L50 51.5 L43.5 54 L47.5 50.5 L46.5 43.5 L34.5 41 L46.5 37.5 Z" 
        fill="#20a6eb" 
        transform="rotate(45, 50, 43.5)"
      />
    </svg>
  );
}
