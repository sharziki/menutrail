"use client"

import { useState } from "react"
import { X, Trash2, Upload, DollarSign, Image as ImageIcon, Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
  const [newImageUrl, setNewImageUrl] = useState("")
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Get all images (combine main image with images array)
  const allImages = item.images?.length ? item.images : (item.image ? [item.image] : [])

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return
    const updatedImages = [...allImages, newImageUrl.trim()]
    onUpdate({ 
      images: updatedImages,
      image: updatedImages[0] // Keep first image as main
    })
    setNewImageUrl("")
  }

  const handleRemoveImage = (index: number) => {
    const updatedImages = allImages.filter((_, i) => i !== index)
    onUpdate({ 
      images: updatedImages,
      image: updatedImages[0] || undefined
    })
    if (activeImageIndex >= updatedImages.length) {
      setActiveImageIndex(Math.max(0, updatedImages.length - 1))
    }
  }

  const handleSetMainImage = (index: number) => {
    const newImages = [...allImages]
    const [selected] = newImages.splice(index, 1)
    newImages.unshift(selected)
    onUpdate({ 
      images: newImages,
      image: newImages[0]
    })
    setActiveImageIndex(0)
  }

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
        {/* Images Section */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Images {allImages.length > 0 && <span className="text-gray-500">({allImages.length})</span>}
          </Label>
          
          {/* Main Preview */}
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group mb-3">
            <AnimatePresence mode="wait">
              {allImages.length > 0 ? (
                <motion.img 
                  key={activeImageIndex}
                  src={allImages[activeImageIndex]} 
                  alt="" 
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
            </AnimatePresence>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <Button size="sm" variant="secondary">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>

          {/* Image Thumbnails */}
          {allImages.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {allImages.map((img, index) => (
                <div 
                  key={index}
                  className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                    activeImageIndex === index ? 'border-orange-500' : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {index === 0 && (
                    <div className="absolute top-0 left-0 bg-orange-500 text-white text-[10px] px-1 rounded-br">
                      Main
                    </div>
                  )}
                  <button
                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-0 hover:opacity-100 transition"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveImage(index)
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {index !== 0 && (
                    <button
                      className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] py-0.5 text-center opacity-0 hover:opacity-100 transition"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSetMainImage(index)
                      }}
                    >
                      Set Main
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Image URL */}
          <div className="flex gap-2">
            <Input
              placeholder="Paste image URL..."
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
            />
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleAddImage}
              disabled={!newImageUrl.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Add multiple images for hover gallery effect
          </p>
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
