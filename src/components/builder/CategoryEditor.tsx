"use client"

import { useState } from "react"
import { X, Trash2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Category } from "@/types/menu"

interface CategoryEditorProps {
  category: Category
  onUpdate: (updates: Partial<Category>) => void
  onDelete: () => void
  onClose: () => void
}

export function CategoryEditor({ category, onUpdate, onDelete, onClose }: CategoryEditorProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold">Edit Category</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Name */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Category Name</Label>
          <Input
            value={category.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g., Appetizers, Main Course, Drinks"
          />
        </div>

        {/* Description */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Description (optional)</Label>
          <Textarea
            value={category.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Add a description for this category..."
            rows={3}
          />
        </div>

        {/* Availability Hours */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-500" />
            <Label className="text-sm font-medium">Availability Hours</Label>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Set specific hours when this category is available (e.g., Breakfast only 6am-11am)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Start Time</Label>
              <Input type="time" placeholder="06:00" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">End Time</Label>
              <Input type="time" placeholder="23:00" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Leave empty for always available</p>
        </div>

        {/* Stats */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Category Stats</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Items</p>
              <p className="text-xl font-bold">{category.items.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Avg. Price</p>
              <p className="text-xl font-bold">
                ${category.items.length > 0
                  ? (category.items.reduce((sum, i) => sum + i.price, 0) / category.items.length).toFixed(2)
                  : "0.00"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {confirmDelete ? (
          <div className="space-y-3">
            <p className="text-sm text-red-600">
              This will delete the category and all {category.items.length} items inside it.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" className="flex-1" onClick={onDelete}>
                Delete All
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Category
          </Button>
        )}
      </div>
    </div>
  )
}
