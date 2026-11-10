'use client';

import React from 'react';

export default function GlobalError({ error, reset }) {
  return (
    <div className="min-h-screen bg-[#efefee] text-[#0f110f] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-full bg-[#ffe5e5] border border-[#fccfcf] text-[#d96c6c] flex items-center justify-center font-mono font-bold text-xl mb-4">
        500
      </div>
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-xs sm:text-sm text-[#6b6b68] max-w-sm mt-2 mb-6">
        {error?.message || 'An unexpected error occurred while loading this view.'}
      </p>
      <button
        onClick={() => reset()}
        className="px-5 py-2.5 rounded-full bg-[#0f110f] text-white text-xs font-semibold hover:bg-[#252923] transition-all shadow-sm"
      >
        Try Again
      </button>
    </div>
  );
}

