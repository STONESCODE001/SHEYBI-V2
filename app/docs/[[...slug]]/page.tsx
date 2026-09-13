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

      {/* Main Content Layout */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Desktop Left Sidebar */}
        <div className="hidden lg:block">
          <DocsSidebar currentSlug={currentSlug} />
        </div>

        {/* Mobile Navigation Drawer Trigger Button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3525CD] text-white shadow-xl hover:bg-[#4338CA] active:scale-95 transition"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex bg-[#0B0E14]/90 backdrop-blur-md lg:hidden">
            <div className="flex w-full max-w-xs flex-col bg-[#0F1727] p-6 shadow-2xl border-r border-[#1E2A3F]">
              <div className="flex items-center justify-between pb-4 border-b border-[#1E2A3F] mb-4">
                <span className="font-bold text-sm text-[#FFC91F] uppercase tracking-wider">
                  Documentation Menu
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg p-1 text-[#9CA3AF] hover:text-white"
                >
                  <X className="h-5 w-5" />
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
          <div className="flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] mb-6">
            <Link href="/docs" className="hover:text-white transition">
              Docs
            </Link>
            <ChevronRight className="h-3 w-3 text-[#6B7280]" />
            <span>{categoryMeta?.title || content.categoryTitle}</span>
            <ChevronRight className="h-3 w-3 text-[#6B7280]" />
            <span className="text-[#FFC91F] truncate">{content.title}</span>
          </div>

          {/* Article Title Header */}
          <div className="border-b border-[#1E2A3F] pb-6 mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
              {content.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
              <span className="flex items-center gap-1.5 bg-[#141E30] px-2.5 py-1 rounded-md text-[#FFC91F]">
                <BookOpen className="h-3.5 w-3.5 text-[#3525CD]" />
                {content.categoryTitle}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Updated {content.lastUpdated}
              </span>
            </div>
          </div>

          {/* Article Body Sections */}
          <div className="flex flex-col gap-8">
            {content.sections.map((section, idx) => (
              <div key={idx} id={`section-${idx}`} className="scroll-mt-24">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-[#3525CD]">#</span>
                  {section.heading}
                </h2>

                <div className="text-sm leading-relaxed text-[#D1D5DB] whitespace-pre-line">
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
                  <div className="my-4 rounded-xl border border-[#1E2A3F] bg-[#0A0D14] p-4 font-mono text-xs text-[#FFC91F] overflow-x-auto">
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
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1E2A3F] pt-8">
            {prevArticle ? (
              <Link
                href={`/docs/${prevArticle.slug}`}
                className="group flex flex-1 items-center gap-3 rounded-xl border border-[#1E2A3F] bg-[#0F1727] p-4 transition hover:border-[#3525CD] w-full sm:w-auto"
              >
                <ArrowLeft className="h-5 w-5 text-[#9CA3AF] group-hover:text-[#3525CD] transition" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Previous Article
                  </span>
                  <span className="text-xs font-semibold text-white group-hover:text-[#FFC91F] transition">
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
                className="group flex flex-1 items-center justify-end gap-3 rounded-xl border border-[#1E2A3F] bg-[#0F1727] p-4 transition hover:border-[#3525CD] text-right w-full sm:w-auto"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Next Article
                  </span>
                  <span className="text-xs font-semibold text-white group-hover:text-[#FFC91F] transition">
                    {nextArticle.title}
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 text-[#9CA3AF] group-hover:text-[#3525CD] transition" />
              </Link>
            )}
          </div>
        </main>

        {/* Right Table of Contents (On This Page) */}
        <DocsToc sections={content.sections} />
      </div>

      {/* Global Documentation Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#0B0E14]/80 backdrop-blur-md pt-20 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#1E2A3F] bg-[#0F1727] p-4 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#1E2A3F] pb-3">
              <div className="flex flex-1 items-center gap-2">
                <Search className="h-5 w-5 text-[#3525CD]" />
                <input
                  type="text"
                  placeholder="Search all documentation articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-sm text-white placeholder-[#6B7280] focus:outline-none"
                />
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="rounded-lg p-1 text-[#9CA3AF] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Results List */}
            <div className="max-h-80 overflow-y-auto flex flex-col gap-2">
              {searchResults.length > 0 ? (
                searchResults.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/docs/${article.slug}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex flex-col gap-1 rounded-xl p-3 bg-[#141E30] hover:bg-[#1E2A3F] transition"
                  >
                    <span className="text-xs font-bold text-[#FFC91F]">{article.title}</span>
                    <span className="text-xs text-[#9CA3AF] line-clamp-1">
                      {article.description}
                    </span>
                  </Link>
                ))
              ) : searchQuery.trim() ? (
                <div className="p-8 text-center text-xs text-[#9CA3AF]">
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
