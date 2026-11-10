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
        className="fixed inset-0 bg-[#111315]/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div
        className={`relative bg-white rounded-[32px] border border-[#E5E8ED] shadow-[0_20px_60px_rgba(0,0,0,0.12)] w-full ${maxWidth} z-10 overflow-hidden transform transition-all my-8`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E8ED] bg-[#F7F8FA]">
          <h3 className="font-semibold text-lg text-[#111315]">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E5E8ED] text-[#686E77] hover:text-[#111315] flex items-center justify-center hover:bg-[#EDEFF2] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};


