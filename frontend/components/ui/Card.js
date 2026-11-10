import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  variant = 'default', // 'default' | 'dark' | 'subcard'
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white rounded-[32px] border border-[#e8e8e5] text-[#0f110f] shadow-[0_4px_20px_-2px_rgba(15,17,15,0.02)]',
    dark: 'bg-[#0f110f] rounded-[32px] border border-white/10 text-white relative overflow-hidden',
    subcard: 'bg-[#f6f6f5] rounded-[22px] border border-[#ececea] text-[#0f110f]',
  };

  return (
    <div
      className={`${variantStyles[variant] || variantStyles.default} p-5 sm:p-6 md:p-7 ${
        hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-4px_rgba(15,17,15,0.06)] hover:border-[#d2d2ce]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
