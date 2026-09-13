'use client';

import React from 'react';

interface Section {
  heading: string;
}

interface DocsTocProps {
  sections: Section[];
}

export function DocsToc({ sections }: DocsTocProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="hidden xl:block w-56 shrink-0">
      <div className="sticky top-20 flex flex-col gap-3 rounded-2xl border border-[#1E2A3F] bg-[#0F1727] p-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FFC91F]">
          On This Page
        </span>
        <nav className="flex flex-col gap-1.5 border-l border-[#1E2A3F] pl-3">
          {sections.map((section, idx) => {
            const anchor = `section-${idx}`;
            return (
              <a
                key={idx}
                href={`#${anchor}`}
                className="text-xs font-medium text-[#9CA3AF] transition hover:text-white truncate"
              >
                {section.heading}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
