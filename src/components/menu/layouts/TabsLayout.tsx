"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Category, MenuItem } from "@/types/menu"
import { MenuItemCard } from "../MenuItemCard"
import { cn } from "@/lib/utils"

interface TabsLayoutProps {
  categories: Category[]
  onAddItem?: (item: MenuItem) => void
}

export function TabsLayout({ categories, onAddItem }: TabsLayoutProps) {
  const [activeCategory, setActiveCategory] = useState(0)
  const tabsRef = useRef<HTMLDivElement>(null)
  const categoryRefs = useRef<(HTMLElement | null)[]>([])

  // Scroll tab into view when active
  useEffect(() => {
    const activeTab = tabsRef.current?.children[activeCategory] as HTMLElement
    if (activeTab && tabsRef.current) {
      const container = tabsRef.current
      const scrollLeft = activeTab.offsetLeft - container.offsetWidth / 2 + activeTab.offsetWidth / 2
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }, [activeCategory])

  // Scroll to category section
  const scrollToCategory = (index: number) => {
    setActiveCategory(index)
    categoryRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      {/* Sticky Category Tabs */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 -mx-4 px-4">
        <div
          ref={tabsRef}
          className="flex gap-1 overflow-x-auto py-3 scrollbar-hide"
        >
          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => scrollToCategory(index)}
              className={cn(
                "px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all",
                activeCategory === index
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {category.name}
              <span className="ml-1.5 text-xs opacity-70">
                ({category.items.length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Sections */}
      <div className="space-y-10 pt-6">
        {categories.map((category, categoryIndex) => (
          <section
            key={category.id}
            ref={(el) => { categoryRefs.current[categoryIndex] = el }}
            className="scroll-mt-20"
          >
            {/* Category Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              onViewportEnter={() => setActiveCategory(categoryIndex)}
              className="mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
              {category.description && (
                <p className="text-gray-500 mt-1">{category.description}</p>
              )}
            </motion.div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {category.items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  variant="list"
                  onAdd={onAddItem}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
