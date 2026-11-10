'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0f110f]/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div
        className={`relative bg-white rounded-[32px] border border-[#e8e8e5] shadow-[0_24px_60px_-12px_rgba(15,17,15,0.18)] w-full ${maxWidth} z-10 overflow-hidden transform transition-all my-8`}
      >
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#e8e8e5] bg-[#f6f6f5]">
          <div>
            <h3 className="font-semibold text-lg text-[#0f110f]">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6b6b68] hover:text-[#0f110f] hover:bg-[#ececea] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
