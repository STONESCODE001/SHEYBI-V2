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
      <div className="rounded-2xl border border-border bg-bg-surface p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-bold text-text-primary">Add New Market Category</h3>
        </div>

        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            placeholder="e.g. Creator Economy, Gaming, Box Office..."
            value={newCategoryLabel}
            onChange={(e) => setNewCategoryLabel(e.target.value)}
            className="flex-1 rounded-xl border border-border bg-bg-surface-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none font-medium"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-primary text-on-primary px-5 py-2.5 text-sm font-bold hover:bg-primary-hover shadow-xs transition-all shrink-0"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </form>
      </div>

      {/* Existing Categories Grid */}
      <div>
        <h4 className="text-xs font-bold uppercase text-text-muted tracking-wider mb-3">
          Active Categories Taxonomy ({categories.length})
        </h4>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-bg-surface p-4 transition-all hover:border-primary/50 hover:shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Tags className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm text-text-primary">{cat.label}</span>
              </div>
              <span className="rounded-full bg-bg-surface-secondary px-2.5 py-0.5 text-xs font-bold text-text-muted">
                {cat.marketCount} markets
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
