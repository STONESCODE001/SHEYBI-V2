"use client"

import * as React from "react"
import { Tags, Plus, FolderKanban } from "lucide-react"
import { toast } from "sonner"

/**
 * Explanatory Interface: CategoryItem
 * Represents a market category taxonomy entry.
 */
export interface CategoryItem {
  id: string
  label: string
  marketCount: number
}

/**
 * Explanatory Interface: AdminCategoriesTabProps
 * Props for rendering category management workspace.
 */
export interface AdminCategoriesTabProps {
  categories: CategoryItem[]
  onAddCategory: (label: string) => void
}

/**
 * Explanatory Component: AdminCategoriesTab
 * Interface for viewing and adding market category taxonomies.
 */
export function AdminCategoriesTab({
  categories,
  onAddCategory,
}: AdminCategoriesTabProps) {
  const [newCategoryLabel, setNewCategoryLabel] = React.useState("")

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryLabel.trim()) {
      toast.error("Please enter a category name!")
      return
    }

    onAddCategory(newCategoryLabel.trim())
    toast.success(`Category "${newCategoryLabel.trim()}" added successfully!`)
    setNewCategoryLabel("")
  }

  return (
    <div className="space-y-6">
      {/* Inline Category Creation Card */}
      <div className="rounded-xl border border-[#1E2A3F] bg-[#0F1727] p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-[#FFC107]" />
          <h3 className="text-sm font-bold text-white">Add New Market Category</h3>
        </div>

        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            placeholder="e.g. Creator Economy, Gaming, Box Office..."
            value={newCategoryLabel}
            onChange={(e) => setNewCategoryLabel(e.target.value)}
            className="flex-1 rounded-xl border border-[#1E2A3F] bg-[#0B0E14] px-4 py-2.5 text-sm text-white placeholder:text-gray-400 focus:border-[#FFC107] focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-[#FFC107] text-[#0B0E14] px-5 py-2.5 text-sm font-bold hover:bg-[#E5AD00] shadow-sm transition-all shrink-0"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </form>
      </div>

      {/* Existing Categories Grid */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-3">
          Active Categories Taxonomy ({categories.length})
        </h4>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-xl border border-[#1E2A3F] bg-[#0F1727] p-4 transition-all hover:border-[#FFC107]/40"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFC107]/10 text-[#FFC107]">
                  <Tags className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm text-white">{cat.label}</span>
              </div>
              <span className="rounded-full bg-[#141E30] px-2.5 py-0.5 text-xs font-medium text-gray-400">
                {cat.marketCount} markets
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
