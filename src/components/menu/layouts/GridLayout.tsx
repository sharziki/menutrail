"use client"

import { motion } from "framer-motion"
import { Category, MenuItem } from "@/types/menu"
import { MenuItemCard } from "../MenuItemCard"

interface GridLayoutProps {
  categories: Category[]
  onAddItem?: (item: MenuItem) => void
}

export function GridLayout({ categories, onAddItem }: GridLayoutProps) {
  return (
    <div className="space-y-12">
      {categories.map((category, categoryIndex) => (
        <motion.section
          key={category.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categoryIndex * 0.1 }}
        >
          {/* Category Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
            {category.description && (
              <p className="text-gray-500 mt-1">{category.description}</p>
            )}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {category.items.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                variant="grid"
                onAdd={onAddItem}
              />
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  )
}
