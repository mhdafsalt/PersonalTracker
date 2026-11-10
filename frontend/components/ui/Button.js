import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-[#111315] hover:bg-black text-white shadow-sm',
    lime: 'bg-[#D4F648] hover:bg-[#c6eb38] text-[#111315] font-semibold shadow-sm',
    secondary: 'bg-white hover:bg-[#F2F4F7] text-[#111315] border border-[#E5E8ED] shadow-sm',
    blue: 'bg-[#E1F0FD] hover:bg-[#d2e8fb] text-[#19406f] border border-[#D0E5F9]',
    outline: 'border border-[#111315] text-[#111315] hover:bg-[#111315]/5',
    danger: 'bg-[#FF5722] hover:bg-[#e04817] text-white shadow-sm',
    ghost: 'hover:bg-[#E5E8ED]/60 text-[#686E77] hover:text-[#111315]',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-4.5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
    icon: 'p-2 w-9 h-9',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};


