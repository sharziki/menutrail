"use client"

import { useState } from "react"
import { X, Trash2, Upload, DollarSign, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { MenuItem } from "@/types/menu"

interface ItemEditorProps {
  item: MenuItem
  onUpdate: (updates: Partial<MenuItem>) => void
  onDelete: () => void
  onClose: () => void
}

export function ItemEditor({ item, onUpdate, onDelete, onClose }: ItemEditorProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold">Edit Item</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Image */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Image</Label>
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
            {item.image ? (
              <img src={item.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ImageIcon className="w-12 h-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <Button size="sm" variant="secondary">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          <Input
            className="mt-2"
            placeholder="Or paste image URL..."
            value={item.image || ""}
            onChange={(e) => onUpdate({ image: e.target.value })}
          />
        </div>

        {/* Name */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Name</Label>
          <Input
            value={item.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Item name"
          />
        </div>

        {/* Description */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Description</Label>
          <Textarea
            value={item.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Describe this item..."
            rows={3}
          />
        </div>

        {/* Price */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Price</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="number"
              step="0.01"
              min="0"
              className="pl-9"
              value={item.price}
              onChange={(e) => onUpdate({ price: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {["vegetarian", "vegan", "gluten-free", "spicy", "popular", "new"].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  const currentTags = item.tags || []
                  const newTags = currentTags.includes(tag)
                    ? currentTags.filter((t) => t !== tag)
                    : [...currentTags, tag]
                  onUpdate({ tags: newTags })
                }}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  item.tags?.includes(tag)
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Calories */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Calories (optional)</Label>
          <Input
            type="number"
            value={item.calories || ""}
            onChange={(e) => onUpdate({ calories: parseInt(e.target.value) || undefined })}
            placeholder="e.g., 450"
          />
        </div>

        {/* Availability */}
        <div className="flex items-center justify-between py-2">
          <div>
            <Label className="text-sm font-medium">Available</Label>
            <p className="text-xs text-gray-500">Show this item on the menu</p>
          </div>
          <Switch
            checked={item.isAvailable !== false}
            onCheckedChange={(checked) => onUpdate({ isAvailable: checked })}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 flex-1">Delete this item?</span>
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              Delete
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Item
          </Button>
        )}
      </div>
    </div>
  )
}
