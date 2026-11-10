import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default: 'bg-[#F0F2F5] text-[#111315] border border-[#E5E8ED]',
    lime: 'bg-[#D4F648] text-[#111315] font-bold border border-[#C5EB38]',
    dark: 'bg-[#111315] text-white border border-[#111315]',
    black: 'bg-[#111315] text-white border border-[#111315]',
    blue: 'bg-[#E1F0FD] text-[#0369A1] border border-[#D0E5F9]',
    success: 'bg-[#10B981]/15 text-[#059669] border border-[#10B981]/30',
    warning: 'bg-[#F59E0B]/15 text-[#D97706] border border-[#F59E0B]/30',
    danger: 'bg-[#FF5722]/15 text-[#FF5722] border border-[#FF5722]/30',
    sage: 'bg-[#D4F648]/25 text-[#2C4A2E] border border-[#D4F648]/40',
    info: 'bg-[#E1F0FD] text-[#0284C7] border border-[#D0E5F9]',
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant] || variants.default} ${
        sizes[size] || sizes.sm
      } ${className}`}
    >
      {children}
    </span>
  );
};


