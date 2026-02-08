"use client"

import { motion } from "framer-motion"
import { Category, MenuItem } from "@/types/menu"
import { MenuItemCard } from "../MenuItemCard"
import { Separator } from "@/components/ui/separator"

interface CompactLayoutProps {
  categories: Category[]
  onAddItem?: (item: MenuItem) => void
}

export function CompactLayout({ categories, onAddItem }: CompactLayoutProps) {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Classic menu header style */}
      <div className="text-center mb-8 pb-4 border-b-2 border-double border-gray-300">
        <span className="text-sm uppercase tracking-[0.3em] text-gray-500">Menu</span>
      </div>

      <div className="space-y-8">
        {categories.map((category, categoryIndex) => (
          <motion.section
            key={category.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: categoryIndex * 0.1 }}
          >
            {/* Category Header - Classic style */}
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold uppercase tracking-wider text-gray-800">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-sm text-gray-500 italic mt-1">{category.description}</p>
              )}
              <div className="flex items-center justify-center mt-2">
                <div className="h-px w-12 bg-gray-300" />
                <span className="mx-3 text-gray-400">✦</span>
                <div className="h-px w-12 bg-gray-300" />
              </div>
            </div>

            {/* Items - Compact list */}
            <div className="bg-white rounded-lg p-4">
              {category.items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  variant="compact"
                  onAdd={onAddItem}
                />
              ))}
            </div>

            {categoryIndex < categories.length - 1 && (
              <Separator className="mt-8" />
            )}
          </motion.section>
        ))}
      </div>

      {/* Classic footer */}
      <div className="text-center mt-8 pt-4 border-t-2 border-double border-gray-300">
        <p className="text-xs text-gray-400 uppercase tracking-wider">
          Prices subject to change • Gratuity not included
        </p>
      </div>
    </div>
  )
}
