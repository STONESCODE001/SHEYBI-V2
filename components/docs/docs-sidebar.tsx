'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Rocket,
  Calculator,
  TrendingUp,
  Wallet,
  Users,
  Cpu,
  HelpCircle,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { DOCS_CONFIG } from '@/lib/docs/docs-config';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket,
  Calculator,
  TrendingUp,
  Wallet,
  Users,
  Cpu,
  HelpCircle,
};

interface DocsSidebarProps {
  currentSlug?: string;
  onSelectArticle?: () => void;
}

export function DocsSidebar({ currentSlug, onSelectArticle }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="sticky top-20 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-6rem)] pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Navigation Categories */}
        <nav className="flex flex-col gap-6">
          {DOCS_CONFIG.map((category) => {
            const Icon = ICON_MAP[category.iconName] || BookOpen;

            return (
              <div key={category.id} className="flex flex-col gap-2">
                {/* Category Header */}
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-bold uppercase tracking-wider text-[#FFC91F]">
                  <Icon className="h-3.5 w-3.5 text-[#3525CD]" />
                  <span>{category.title}</span>
                </div>

                {/* Articles List */}
                <ul className="flex flex-col gap-1 border-l border-[#1E2A3F] ml-3 pl-3">
                  {category.articles.map((article) => {
                    const articlePath = `/docs/${article.slug}`;
                    const isActive = currentSlug === article.slug || pathname === articlePath;

                    return (
                      <li key={article.slug}>
                        <Link
                          href={articlePath}
                          onClick={onSelectArticle}
                          className={`group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                            isActive
                              ? 'bg-[#3525CD]/20 text-white font-bold border-l-2 border-[#3525CD] -ml-[13px] pl-3'
                              : 'text-[#9CA3AF] hover:bg-[#141E30] hover:text-white'
                          }`}
                        >
                          <span className="truncate">{article.title}</span>
                          {isActive && <ChevronRight className="h-3 w-3 text-[#3525CD]" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
