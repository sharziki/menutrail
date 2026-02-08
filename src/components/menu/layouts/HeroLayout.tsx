"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Category, MenuItem } from "@/types/menu"
import { MenuItemCard } from "../MenuItemCard"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeroLayoutProps {
  categories: Category[]
  onAddItem?: (item: MenuItem) => void
}

export function HeroLayout({ categories, onAddItem }: HeroLayoutProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  
  // Flatten all items with category info
  const allItems = categories.flatMap((category) =>
    category.items.map((item) => ({ ...item, categoryName: category.name }))
  )
  
  const currentItem = allItems[activeIndex]
  const totalItems = allItems.length

  const goToNext = () => {
    if (activeIndex < totalItems - 1) {
      setActiveIndex(activeIndex + 1)
    }
  }

  const goToPrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1)
    }
  }

  // Handle scroll/wheel navigation
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      goToNext()
    } else {
      goToPrev()
    }
  }

  return (
    <div 
      className="relative h-[calc(100vh-200px)] min-h-[600px]"
      onWheel={handleWheel}
    >
      {/* Main Hero Card */}
      <AnimatePresence mode="wait">
        {currentItem && (
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="h-full"
          >
            <MenuItemCard
              item={currentItem}
              variant="hero"
              onAdd={onAddItem}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Badge */}
      {currentItem && (
        <div className="absolute top-6 left-6">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm">
            {(currentItem as { categoryName: string }).categoryName}
          </span>
        </div>
      )}

      {/* Navigation */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white/90 backdrop-blur-sm"
          onClick={goToPrev}
          disabled={activeIndex === 0}
        >
          <ChevronUp className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white/90 backdrop-blur-sm"
          onClick={goToNext}
          disabled={activeIndex === totalItems - 1}
        >
          <ChevronDown className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2">
        <div className="flex flex-col gap-1">
          {allItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "w-1 rounded-full transition-all",
                activeIndex === index
                  ? "h-8 bg-white"
                  : "h-2 bg-white/40 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      </div>

      {/* Item Counter */}
      <div className="absolute bottom-6 left-6 text-white">
        <span className="text-2xl font-bold">{activeIndex + 1}</span>
        <span className="text-white/60"> / {totalItems}</span>
      </div>

      {/* Scroll Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 right-6 text-white/60 text-sm flex items-center gap-2"
      >
        <span>Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </div>
  )
}
