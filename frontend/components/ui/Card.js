import React from 'react';

export const Card = ({ children, variant = 'default', className = '', hover = false, ...props }) => {
  const variants = {
    default: 'bg-white border border-[#E5E8ED] text-[#111315]',
    lime: 'bg-[#D4F648] border border-black/[0.04] text-[#111315] shadow-sm',
    blue: 'bg-[#E1F0FD] border border-[#D0E5F9] text-[#111315]',
    dark: 'bg-[#111315] border border-neutral-800 text-white',
    transparent: 'bg-transparent border border-dashed border-[#CBD2DC]',
  };

  return (
    <div
      className={`rounded-[28px] p-5 sm:p-6 transition-all duration-200 ${
        variants[variant] || variants.default
      } ${
        hover ? 'hover:shadow-[0_12px_30px_-4px_rgba(17,19,21,0.08)] hover:-translate-y-0.5' : 'shadow-sm'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
