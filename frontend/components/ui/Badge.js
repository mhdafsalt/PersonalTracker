import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default: 'bg-[#f1f1ef] text-[#4a4a47] border border-[#e8e8e5]',
    success: 'bg-[#f1f7da] text-[#3f7a1e] border border-[#e1efc5]',
    warning: 'bg-[#ffd9c7] text-[#b4501e] border border-[#ffc4a8]',
    danger: 'bg-[#ffe5e5] text-[#d96c6c] border border-[#fccfcf]',
    sage: 'bg-[#f1f7da] text-[#3f7a1e] border border-[#e1efc5]',
    lime: 'bg-[#d7f43a] text-[#0f110f] font-medium',
    dark: 'bg-[#0f110f] text-white',
    info: 'bg-[#eef4ff] text-[#2b4c7e] border border-[#d2e2ff]',
  };

  const sizes = {
    sm: 'text-[11px] font-mono px-2.5 py-0.5 tracking-tight',
    md: 'text-xs font-mono px-3 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant] || variants.default} ${
        sizes[size]
      } ${className}`}
    >
      {children}
    </span>
  );
};
