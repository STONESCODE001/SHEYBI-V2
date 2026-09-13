'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ArrowRight, BookOpen } from 'lucide-react';

interface DocsHeaderProps {
  onSearchClick: () => void;
}

export function DocsHeader({ onSearchClick }: DocsHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E2A3F] bg-[#0B0E14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2">
        {/* Brand Logo & Docs Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link href="/docs" className="flex items-center gap-1.5 sm:gap-2 transition hover:opacity-90">
            <div className="relative h-7 w-7 sm:h-8 sm:w-8 overflow-hidden rounded-lg bg-[#3525CD] p-1 flex items-center justify-center">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-black text-lg sm:text-xl tracking-tight text-white">SHEYBI</span>
              <span className="rounded-md bg-[#1E2A3F] px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-[#FFC91F]">
                Docs
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search Bar Trigger */}
        <button
          onClick={onSearchClick}
          className="flex h-8 sm:h-9 flex-1 max-w-[180px] sm:max-w-md items-center gap-1.5 sm:gap-2 rounded-xl border border-[#1E2A3F] bg-[#0F1727] px-2.5 sm:px-3 text-xs sm:text-sm text-[#6B7280] transition hover:border-[#3525CD] hover:text-white"
        >
          <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#6B7280] shrink-0" />
          <span className="flex-1 text-left truncate">Search docs...</span>
          <kbd className="hidden rounded bg-[#1E2A3F] px-1.5 py-0.5 text-[10px] font-mono text-[#9CA3AF] md:inline-block">
            ⌘K
          </kbd>
        </button>

        {/* Right CTA Link */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            className="flex items-center gap-1 sm:gap-1.5 rounded-xl bg-[#3525CD] px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white transition hover:bg-[#4338CA] active:scale-95"
          >
            <span className="hidden xs:inline">Launch App</span>
            <span className="xs:hidden">App</span>
            <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
