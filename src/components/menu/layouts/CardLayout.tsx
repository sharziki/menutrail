"use client"

import { useState } from "react"
import { motion, AnimatePresence, PanInfo } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Category, MenuItem } from "@/types/menu"
import { MenuItemCard } from "../MenuItemCard"
import { Button } from "@/components/ui/button"

interface CardLayoutProps {
  categories: Category[]
  onAddItem?: (item: MenuItem) => void
}

export function CardLayout({ categories, onAddItem }: CardLayoutProps) {
  const [activeCategory, setActiveCategory] = useState(0)
  const [activeItem, setActiveItem] = useState(0)
  
  const currentCategory = categories[activeCategory]
  const items = currentCategory?.items || []
  const currentItem = items[activeItem]

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && activeItem < items.length - 1) {
      setActiveItem(activeItem + 1)
    } else if (direction === 'right' && activeItem > 0) {
      setActiveItem(activeItem - 1)
    }
  }

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    if (info.offset.x > threshold) {
      handleSwipe('right')
    } else if (info.offset.x < -threshold) {
      handleSwipe('left')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {categories.map((category, index) => (
          <button
            key={category.id}
            onClick={() => {
              setActiveCategory(index)
              setActiveItem(0)
            }}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              activeCategory === index
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Card Stack */}
      <div className="flex-1 relative flex items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {currentItem && (
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, scale: 0.9, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -100 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              className="w-full max-w-md"
            >
              <MenuItemCard
                item={currentItem}
                variant="card"
                onAdd={onAddItem}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Arrows (desktop) */}
        <div className="hidden md:flex absolute inset-x-0 top-1/2 -translate-y-1/2 justify-between pointer-events-none px-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white shadow-lg pointer-events-auto"
            onClick={() => handleSwipe('right')}
            disabled={activeItem === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white shadow-lg pointer-events-auto"
            onClick={() => handleSwipe('left')}
            disabled={activeItem === items.length - 1}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 py-4">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveItem(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              activeItem === index
                ? 'bg-primary w-6'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Swipe hint (mobile) */}
      <p className="text-center text-sm text-gray-400 md:hidden">
        ← Swipe to browse →
      </p>
    </div>
  )
}
