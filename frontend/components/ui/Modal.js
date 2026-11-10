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
        className="fixed inset-0 bg-[#252923]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div
        className={`relative bg-white rounded-3xl border border-[#E9E8E1] shadow-2xl w-full ${maxWidth} z-10 overflow-hidden transform transition-all my-8`}
      >
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#E9E8E1] bg-[#FAF8F5]">
          <h3 className="font-semibold text-lg text-[#252923]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#777D75] hover:text-[#252923] p-1.5 rounded-lg hover:bg-[#EFECE4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

