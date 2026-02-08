"use client"

import { motion } from "framer-motion"
import { Category, MenuItem } from "@/types/menu"
import { MenuItemCard } from "../MenuItemCard"

interface ListLayoutProps {
  categories: Category[]
  onAddItem?: (item: MenuItem) => void
}

export function ListLayout({ categories, onAddItem }: ListLayoutProps) {
  return (
    <div className="space-y-10">
      {categories.map((category, categoryIndex) => (
        <motion.section
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categoryIndex * 0.1 }}
        >
          {/* Category Header */}
          <div className="mb-4 pb-2 border-b-2 border-primary/20">
            <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
            {category.description && (
              <p className="text-sm text-gray-500 mt-0.5">{category.description}</p>
            )}
          </div>

          {/* Items List */}
          <div className="space-y-2">
            {category.items.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                variant="list"
                onAdd={onAddItem}
              />
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  )
}
