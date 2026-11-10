'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#efefee] text-[#0f110f] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-full bg-[#f1f1ef] border border-[#e8e8e5] flex items-center justify-center font-mono font-bold text-xl mb-4">
        404
      </div>
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
        Page Not Found
      </h1>
      <p className="text-xs sm:text-sm text-[#6b6b68] max-w-sm mt-2 mb-6">
        The portal or tracker page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-full bg-[#0f110f] text-white text-xs font-semibold hover:bg-[#252923] transition-all shadow-sm"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

