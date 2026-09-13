'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronRight,
  BookOpen,
  Search,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  Code,
  Calendar,
  Layers,
} from 'lucide-react';
import { DOCS_CONFIG, getArticleBySlug } from '@/lib/docs/docs-config';
import { DOCS_CONTENT } from '@/lib/docs/docs-content';
import { DocsHeader } from '@/components/docs/docs-header';
import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { DocsToc } from '@/components/docs/docs-toc';
import { DocsCallout } from '@/components/docs/docs-callout';

export default function DocsPage() {
  const params = useParams();
  const router = useRouter();
  const slugArray = params?.slug as string[] | undefined;
  const currentSlug = slugArray && slugArray.length > 0 ? slugArray[0] : 'introduction';

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch article metadata and content
  const resolved = getArticleBySlug(currentSlug);
  const articleMeta = resolved?.article;
  const categoryMeta = resolved?.category;
  const content = DOCS_CONTENT[currentSlug] || DOCS_CONTENT['introduction'];

  // Flatten all articles for Next / Prev navigation
  const allArticles = DOCS_CONFIG.flatMap((cat) => cat.articles);
  const currentIndex = allArticles.findIndex((a) => a.slug === currentSlug);
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

  // Filter articles by search query
  const searchResults = searchQuery.trim()
    ? allArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white flex flex-col font-sans selection:bg-[#3525CD] selection:text-white">
      {/* Documentation Topbar Header */}
      <DocsHeader onSearchClick={() => setIsSearchOpen(true)} />

      {/* Mobile Sticky Sub-Header Bar */}
      <div className="lg:hidden sticky top-14 z-30 flex items-center justify-between border-b border-[#1E2A3F] bg-[#0F1727]/95 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] truncate">
          <Layers className="h-3.5 w-3.5 text-[#FFC91F] shrink-0" />
          <span className="truncate text-white">{categoryMeta?.title || content.categoryTitle}</span>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[#3525CD]/20 border border-[#3525CD]/50 px-2.5 py-1 text-xs font-bold text-[#FFC91F] hover:bg-[#3525CD]/30 active:scale-95 transition shrink-0 ml-2"
        >
          <Menu className="h-3.5 w-3.5 text-[#FFC91F]" />
          <span>Menu</span>
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-8 gap-8">
        {/* Desktop Left Sidebar */}
        <div className="hidden lg:block">
          <DocsSidebar currentSlug={currentSlug} />
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex bg-[#0B0E14]/90 backdrop-blur-md lg:hidden">
            <div className="flex w-full max-w-xs flex-col bg-[#0F1727] p-5 shadow-2xl border-r border-[#1E2A3F] h-full overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2A3F] mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#3525CD]" />
                  <span className="font-bold text-xs text-[#FFC91F] uppercase tracking-wider">
                    Documentation Categories
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-[#9CA3AF] hover:text-white bg-[#141E30]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <DocsSidebar
                currentSlug={currentSlug}
                onSelectArticle={() => setIsMobileMenuOpen(false)}
              />
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Center Article Content */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb Header */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-[#9CA3AF] mb-4 sm:mb-6 flex-wrap">
            <Link href="/docs" className="hover:text-white transition">
              Docs
            </Link>
            <ChevronRight className="h-3 w-3 text-[#6B7280] shrink-0" />
            <span className="truncate">{categoryMeta?.title || content.categoryTitle}</span>
            <ChevronRight className="h-3 w-3 text-[#6B7280] shrink-0" />
            <span className="text-[#FFC91F] truncate">{content.title}</span>
          </div>

          {/* Article Title Header */}
          <div className="border-b border-[#1E2A3F] pb-4 sm:pb-6 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 sm:mb-3 leading-tight">
              {content.title}
            </h1>
            <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-[#9CA3AF] flex-wrap">
              <span className="flex items-center gap-1.5 bg-[#141E30] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[#FFC91F] font-medium">
                <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#3525CD]" />
                {content.categoryTitle}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Updated {content.lastUpdated}
              </span>
            </div>
          </div>

          {/* Article Body Sections */}
          <div className="flex flex-col gap-6 sm:gap-8">
            {content.sections.map((section, idx) => (
              <div key={idx} id={`section-${idx}`} className="scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 flex items-center gap-2">
                  <span className="text-[#3525CD]">#</span>
                  {section.heading}
                </h2>

                <div className="text-xs sm:text-sm leading-relaxed text-[#D1D5DB] whitespace-pre-line">
                  {section.content}
                </div>

                {/* Callout alert box if present */}
                {section.callout && (
                  <DocsCallout type={section.callout.type}>
                    {section.callout.text}
                  </DocsCallout>
                )}

                {/* Code snippet block if present */}
                {section.codeSnippet && (
                  <div className="my-3 sm:my-4 rounded-xl border border-[#1E2A3F] bg-[#0A0D14] p-3 sm:p-4 font-mono text-[11px] sm:text-xs text-[#FFC91F] overflow-x-auto max-w-[calc(100vw-2rem)] sm:max-w-full">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1E2A3F] text-[10px] text-[#6B7280]">
                      <span className="flex items-center gap-1">
                        <Code className="h-3 w-3" /> FORMULA / CODE
                      </span>
                    </div>
                    <code>{section.codeSnippet}</code>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Next / Prev Article Links */}
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border-t border-[#1E2A3F] pt-6 sm:pt-8">
            {prevArticle ? (
              <Link
                href={`/docs/${prevArticle.slug}`}
                className="group flex flex-1 items-center gap-3 rounded-xl border border-[#1E2A3F] bg-[#0F1727] p-3 sm:p-4 transition hover:border-[#3525CD] w-full"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#9CA3AF] group-hover:text-[#3525CD] transition shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Previous Article
                  </span>
                  <span className="text-xs font-semibold text-white group-hover:text-[#FFC91F] transition truncate">
                    {prevArticle.title}
                  </span>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextArticle && (
              <Link
                href={`/docs/${nextArticle.slug}`}
                className="group flex flex-1 items-center justify-end gap-3 rounded-xl border border-[#1E2A3F] bg-[#0F1727] p-3 sm:p-4 transition hover:border-[#3525CD] text-right w-full"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Next Article
                  </span>
                  <span className="text-xs font-semibold text-white group-hover:text-[#FFC91F] transition truncate">
                    {nextArticle.title}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-[#9CA3AF] group-hover:text-[#3525CD] transition shrink-0" />
              </Link>
            )}
          </div>
        </main>

        {/* Right Table of Contents (On This Page - Desktop Only) */}
        <DocsToc sections={content.sections} />
      </div>

      {/* Global Documentation Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#0B0E14]/85 backdrop-blur-md pt-12 sm:pt-20 px-3 sm:px-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#1E2A3F] bg-[#0F1727] p-3.5 sm:p-4 shadow-2xl flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center justify-between border-b border-[#1E2A3F] pb-3">
              <div className="flex flex-1 items-center gap-2">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-[#3525CD] shrink-0" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-[#6B7280] focus:outline-none"
                />
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="rounded-lg p-1 text-[#9CA3AF] hover:text-white"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Search Results List */}
            <div className="max-h-72 sm:max-h-80 overflow-y-auto flex flex-col gap-2">
              {searchResults.length > 0 ? (
                searchResults.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/docs/${article.slug}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex flex-col gap-0.5 sm:gap-1 rounded-xl p-2.5 sm:p-3 bg-[#141E30] hover:bg-[#1E2A3F] transition"
                  >
                    <span className="text-xs font-bold text-[#FFC91F]">{article.title}</span>
                    <span className="text-[11px] sm:text-xs text-[#9CA3AF] line-clamp-1">
                      {article.description}
                    </span>
                  </Link>
                ))
              ) : searchQuery.trim() ? (
                <div className="p-6 sm:p-8 text-center text-xs text-[#9CA3AF]">
                  No documentation articles found matching &quot;{searchQuery}&quot;.
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-[#6B7280]">
                  Type keywords like <code className="text-[#FFC91F]">LMSR</code>,{' '}
                  <code className="text-[#FFC91F]">withdrawals</code>, or{' '}
                  <code className="text-[#FFC91F]">payouts</code> to search.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
