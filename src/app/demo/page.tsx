"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { demoCategories, demoRestaurant } from "@/lib/demo-data"
import { MenuDisplay } from "@/components/menu/MenuDisplay"
import { LayoutType, LAYOUT_CONFIG, MenuItem } from "@/types/menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DemoPage() {
  const [activeLayout, setActiveLayout] = useState<LayoutType>('grid')
  const [cart, setCart] = useState<Array<MenuItem & { quantity: number }>>([])
  const [showCart, setShowCart] = useState(false)

  const handleAddItem = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {demoRestaurant.name}
              </h1>
              <p className="text-sm text-gray-500">{demoRestaurant.description}</p>
            </div>

            {/* Cart Button */}
            <Button
              variant="outline"
              className="relative"
              onClick={() => setShowCart(true)}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Layout Selector */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <span className="text-sm font-medium text-gray-500 shrink-0">Layout:</span>
            {(Object.keys(LAYOUT_CONFIG) as LayoutType[]).map((layout) => (
              <button
                key={layout}
                onClick={() => setActiveLayout(layout)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0",
                  activeLayout === layout
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <span>{LAYOUT_CONFIG[layout].icon}</span>
                <span>{LAYOUT_CONFIG[layout].name}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {LAYOUT_CONFIG[activeLayout].description} — Best for: {LAYOUT_CONFIG[activeLayout].bestFor}
          </p>
        </div>
      </div>

      {/* Menu Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLayout}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <MenuDisplay
              categories={demoCategories}
              layoutType={activeLayout}
              onAddItem={handleAddItem}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowCart(false)}
            />

            {/* Cart Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Cart Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">Your Order</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCart(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4">
                  {cart.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Your cart is empty</p>
                      <p className="text-sm mt-1">Add items to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-500">
                              ${item.price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                          <span className="font-semibold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cart Footer */}
                {cart.length > 0 && (
                  <div className="p-4 border-t bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-xl font-bold">${cartTotal.toFixed(2)}</span>
                    </div>
                    <Button className="w-full" size="lg">
                      Checkout
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Cart Button (Mobile) */}
      {cartCount > 0 && !showCart && (
        <motion.button
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 left-4 right-4 bg-primary text-white py-4 px-6 rounded-full shadow-lg flex items-center justify-between md:hidden"
          onClick={() => setShowCart(true)}
        >
          <span className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span>{cartCount} items</span>
          </span>
          <span className="font-bold">${cartTotal.toFixed(2)}</span>
        </motion.button>
      )}
    </div>
  )
}
