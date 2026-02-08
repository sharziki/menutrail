"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Plus, Flame, Leaf, Star } from "lucide-react"
import { MenuItem } from "@/types/menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MenuItemCardProps {
  item: MenuItem
  variant?: 'grid' | 'list' | 'card' | 'compact' | 'hero'
  onAdd?: (item: MenuItem) => void
  className?: string
}

export function MenuItemCard({ 
  item, 
  variant = 'grid', 
  onAdd,
  className 
}: MenuItemCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getDietaryIcon = (tag: string) => {
    switch (tag) {
      case 'vegetarian':
      case 'vegan':
        return <Leaf className="w-3 h-3" />
      case 'spicy':
        return <Flame className="w-3 h-3" />
      default:
        return null
    }
  }

  // Grid Layout
  if (variant === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className={cn(
          "group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer",
          !item.isAvailable && "opacity-60",
          className
        )}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-4xl">🍽</span>
            </div>
          )}
          
          {/* Tags overlay */}
          {item.tags?.includes('popular') && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-amber-500 text-white border-0">
                <Star className="w-3 h-3 mr-1" /> Popular
              </Badge>
            </div>
          )}
          
          {/* Quick add button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              onAdd?.(item)
            }}
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
            <span className="font-bold text-primary shrink-0">{formatPrice(item.price)}</span>
          </div>
          
          {item.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-2">{item.description}</p>
          )}
          
          {/* Dietary tags */}
          {item.dietaryTags && item.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.dietaryTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {getDietaryIcon(tag)}
                  <span className="ml-1 capitalize">{tag}</span>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // List Layout
  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 4 }}
        className={cn(
          "flex gap-4 p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors cursor-pointer",
          !item.isAvailable && "opacity-60",
          className
        )}
      >
        {/* Image (smaller) */}
        {item.image && (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              {item.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{item.description}</p>
              )}
            </div>
            <span className="font-bold text-primary shrink-0">{formatPrice(item.price)}</span>
          </div>
          
          {/* Dietary tags */}
          {item.dietaryTags && item.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.dietaryTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {getDietaryIcon(tag)}
                  <span className="ml-1 capitalize">{tag}</span>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Add button */}
        <Button
          size="sm"
          variant="outline"
          className="shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            onAdd?.(item)
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </motion.div>
    )
  }

  // Compact Layout
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "flex items-center justify-between py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 px-2 -mx-2 rounded",
          !item.isAvailable && "opacity-60",
          className
        )}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{item.name}</h3>
            {item.dietaryTags?.map((tag) => (
              <span key={tag} className="text-green-600">
                {getDietaryIcon(tag)}
              </span>
            ))}
          </div>
          {item.description && (
            <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900">{formatPrice(item.price)}</span>
          <button 
            className="text-primary hover:text-primary/80"
            onClick={(e) => {
              e.stopPropagation()
              onAdd?.(item)
            }}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    )
  }

  // Hero Layout
  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "relative h-[70vh] min-h-[500px] rounded-3xl overflow-hidden",
          !item.isAvailable && "opacity-60",
          className
        )}
      >
        {/* Background Image */}
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          {item.tags?.includes('popular') && (
            <Badge className="bg-amber-500 text-white border-0 mb-4">
              <Star className="w-3 h-3 mr-1" /> Chef&apos;s Pick
            </Badge>
          )}
          
          <h2 className="text-4xl font-bold mb-2">{item.name}</h2>
          
          {item.description && (
            <p className="text-lg text-white/80 mb-4 max-w-xl">{item.description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{formatPrice(item.price)}</span>
            <Button 
              size="lg"
              className="bg-white text-black hover:bg-white/90"
              onClick={() => onAdd?.(item)}
            >
              <Plus className="w-5 h-5 mr-2" /> Add to Order
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Card Layout (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      className={cn(
        "bg-white rounded-3xl overflow-hidden shadow-lg cursor-grab active:cursor-grabbing",
        !item.isAvailable && "opacity-60",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-6xl">🍽️</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
          <span className="text-xl font-bold text-primary">{formatPrice(item.price)}</span>
        </div>
        
        {item.description && (
          <p className="text-gray-500 mb-4">{item.description}</p>
        )}
        
        <Button 
          className="w-full"
          onClick={() => onAdd?.(item)}
        >
          <Plus className="w-4 h-4 mr-2" /> Add to Order
        </Button>
      </div>
    </motion.div>
  )
}
