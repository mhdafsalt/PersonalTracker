import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default: 'bg-[#FAF8F5] text-[#252923] border border-[#E9E8E1]',
    success: 'bg-[#4F9B72]/15 text-[#4F9B72] border border-[#4F9B72]/30',
    warning: 'bg-[#D6A24A]/15 text-[#D6A24A] border border-[#D6A24A]/30',
    danger: 'bg-[#D96C6C]/15 text-[#D96C6C] border border-[#D96C6C]/30',
    sage: 'bg-[#6B8F71]/15 text-[#6B8F71] border border-[#6B8F71]/30',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
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

