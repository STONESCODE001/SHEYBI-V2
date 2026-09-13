'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowRight, BookOpen } from 'lucide-react';

interface DocsHeaderProps {
  onSearchClick: () => void;
}

export function DocsHeader({ onSearchClick }: DocsHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E2A3F] bg-[#0B0E14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Docs Badge */}
        <div className="flex items-center gap-3">
          <Link href="/docs" className="flex items-center gap-2 transition hover:opacity-90">
            <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-[#3525CD] p-1 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white">SHEYBI</span>
              <span className="rounded-md bg-[#1E2A3F] px-2 py-0.5 text-xs font-semibold text-[#FFC91F]">
                Docs
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search Bar Trigger */}
        <button
          onClick={onSearchClick}
          className="flex h-9 w-full max-w-md items-center gap-2 rounded-xl border border-[#1E2A3F] bg-[#0F1727] px-3 text-sm text-[#6B7280] transition hover:border-[#3525CD] hover:text-white"
        >
          <Search className="h-4 w-4 text-[#6B7280]" />
          <span className="flex-1 text-left">Search documentation...</span>
          <kbd className="hidden rounded bg-[#1E2A3F] px-1.5 py-0.5 text-[10px] font-mono text-[#9CA3AF] sm:inline-block">
            ⌘K
          </kbd>
        </button>

        {/* Right CTA Links */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl bg-[#3525CD] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#4338CA] active:scale-95"
          >
            Launch App
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
