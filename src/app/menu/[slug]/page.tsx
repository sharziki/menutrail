"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Phone, 
  MapPin, 
  Clock,
  Star,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Demo restaurant data - in production this would be fetched based on slug
const RESTAURANT = {
  name: "The Burger Joint",
  description: "Handcrafted burgers made with love since 2015",
  logo: null,
  coverImage: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200",
  primaryColor: "#f97316",
  phone: "(555) 123-4567",
  address: "123 Main Street, Brooklyn, NY 11201",
  hours: "11am - 10pm Daily",
  rating: 4.8,
  reviewCount: 234,
}

const CATEGORIES = [
  { id: "1", name: "Popular", emoji: "🔥" },
  { id: "2", name: "Burgers", emoji: "🍔" },
  { id: "3", name: "Sides", emoji: "🍟" },
  { id: "4", name: "Drinks", emoji: "🥤" },
  { id: "5", name: "Desserts", emoji: "🍰" },
]

const MENU_ITEMS = [
  { id: "1", categoryId: "1", name: "Truffle Mushroom Burger", description: "Wagyu beef, truffle aioli, sautéed mushrooms, gruyère", price: 18.99, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", tags: ["popular", "chef-special"], calories: 850 },
  { id: "2", categoryId: "1", name: "Classic Cheeseburger", description: "Angus beef, American cheese, lettuce, tomato, special sauce", price: 14.99, image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400", tags: ["popular"], calories: 650 },
  { id: "3", categoryId: "2", name: "BBQ Bacon Burger", description: "Angus beef, crispy bacon, cheddar, BBQ sauce, onion rings", price: 16.99, image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400", calories: 920 },
  { id: "4", categoryId: "2", name: "Veggie Burger", description: "House-made black bean patty, avocado, sprouts, chipotle mayo", price: 13.99, image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400", tags: ["vegetarian"], calories: 480 },
  { id: "5", categoryId: "3", name: "Sweet Potato Fries", description: "Crispy sweet potato fries with chipotle aioli", price: 6.99, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400", tags: ["popular"], calories: 380 },
  { id: "6", categoryId: "3", name: "Onion Rings", description: "Beer-battered onion rings with ranch", price: 7.99, calories: 450 },
  { id: "7", categoryId: "4", name: "Craft Lemonade", description: "Fresh-squeezed lemonade with mint", price: 4.99, calories: 120 },
  { id: "8", categoryId: "4", name: "Milkshake", description: "Vanilla, chocolate, or strawberry", price: 6.99, calories: 580 },
  { id: "9", categoryId: "5", name: "Brownie Sundae", description: "Warm brownie, vanilla ice cream, hot fudge, whipped cream", price: 8.99, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400", calories: 780 },
]

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  modifiers?: { name: string; price: number }[]
}

export default function PublicMenuPage({ params: _params }: { params: { slug: string } }) {
  void _params // Will be used to fetch restaurant data
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id)
  const [search, setSearch] = useState("")
  const [selectedItem, setSelectedItem] = useState<typeof MENU_ITEMS[0] | null>(null)

  // Filter items
  const filteredItems = MENU_ITEMS.filter(item => {
    if (search) {
      return item.name.toLowerCase().includes(search.toLowerCase())
    }
    return item.categoryId === activeCategory
  })

  // Cart functions
  const addToCart = (item: typeof MENU_ITEMS[0], modifiers?: { name: string; price: number }[]) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, modifiers }]
    })
    setSelectedItem(null)
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta
          if (newQty <= 0) return null
          return { ...item, quantity: newQty }
        }
        return item
      }).filter(Boolean) as CartItem[]
    })
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div 
        className="h-48 sm:h-64 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${RESTAURANT.coverImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{RESTAURANT.name}</h1>
          <p className="text-white/80 mb-3">{RESTAURANT.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{RESTAURANT.rating}</span>
              <span className="text-white/60">({RESTAURANT.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{RESTAURANT.hours}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-gray-50 border-b border-gray-200 py-3 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <a href={`tel:${RESTAURANT.phone}`} className="flex items-center gap-2 hover:text-gray-900">
              <Phone className="w-4 h-4" />
              {RESTAURANT.phone}
            </a>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {RESTAURANT.address}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-green-100 text-green-700">Delivery</Badge>
            <Badge className="bg-blue-100 text-blue-700">Pickup</Badge>
            <Badge className="bg-purple-100 text-purple-700">Dine-in</Badge>
          </div>
        </div>
      </div>

      {/* Search & Categories */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search menu..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSearch(""); }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition",
                  activeCategory === cat.id && !search
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                <span>{cat.emoji}</span>
                <span className="font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredItems.map(item => (
            <motion.button
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden text-left hover:shadow-lg transition group"
            >
              <div className="flex gap-4 p-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold group-hover:text-orange-600 transition">{item.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">${item.price.toFixed(2)}</span>
                    {item.calories && (
                      <span className="text-xs text-gray-500">{item.calories} cal</span>
                    )}
                  </div>
                  {item.tags && (
                    <div className="flex gap-1 mt-2">
                      {item.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag === "popular" && "🔥 "}
                          {tag === "chef-special" && "⭐ "}
                          {tag === "vegetarian" && "🌱 "}
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                {item.image && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No items found</p>
          </div>
        )}
      </main>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSelectedItem(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-auto"
            >
              {selectedItem.image && (
                <div className="h-48 bg-gray-100">
                  <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
                  <button onClick={() => setSelectedItem(null)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-2xl font-bold">${selectedItem.price.toFixed(2)}</span>
                  {selectedItem.calories && (
                    <Badge variant="outline">{selectedItem.calories} calories</Badge>
                  )}
                </div>

                {/* TODO: Add modifiers/customization UI here */}
                
                <Button 
                  className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-red-600"
                  onClick={() => addToCart(selectedItem)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add to Cart — ${selectedItem.price.toFixed(2)}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Button */}
      {cartCount > 0 && !showCart && (
        <motion.button
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-6 left-4 right-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full py-4 px-6 flex items-center justify-between shadow-lg z-40"
          onClick={() => setShowCart(true)}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span>{cartCount} items</span>
          </div>
          <span className="font-bold">${cartTotal.toFixed(2)}</span>
        </motion.button>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold">Your Order</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            className="p-2 hover:bg-gray-100"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 font-medium">{item.quantity}</span>
                          <button
                            className="p-2 hover:bg-gray-100"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                        </div>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold text-xl">${cartTotal.toFixed(2)}</span>
                  </div>
                  <Link href="/checkout">
                    <Button className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-red-600">
                      Checkout
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
