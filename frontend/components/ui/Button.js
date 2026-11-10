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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#6B8F71] hover:bg-[#547359] text-white shadow-sm',
    secondary: 'bg-[#FAF8F5] hover:bg-[#EFECE4] text-[#252923] border border-[#E9E8E1]',
    outline: 'border border-[#6B8F71] text-[#6B8F71] hover:bg-[#6B8F71]/10',
    danger: 'bg-[#D96C6C] hover:bg-[#c85656] text-white',
    ghost: 'hover:bg-[#EFECE4]/50 text-[#777D75] hover:text-[#252923]',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
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

