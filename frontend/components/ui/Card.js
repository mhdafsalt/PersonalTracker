import React from 'react';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#E9E8E1] p-5 sm:p-6 card-shadow ${
        hover ? 'card-shadow-hover' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

