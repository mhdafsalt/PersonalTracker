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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-[#0f110f] hover:bg-[#252923] text-white shadow-sm',
    secondary: 'bg-[#f1f1ef] hover:bg-[#e8e8e5] text-[#0f110f] border border-[#e8e8e5]',
    lime: 'bg-[#d7f43a] hover:bg-[#cbf026] text-[#0f110f] font-semibold shadow-sm',
    outline: 'border border-[#d2d2ce] bg-transparent text-[#0f110f] hover:bg-[#f1f1ef]',
    danger: 'bg-[#d96c6c] hover:bg-[#c85656] text-white',
    ghost: 'hover:bg-[#f1f1ef] text-[#6b6b68] hover:text-[#0f110f]',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-6 py-3 gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
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
