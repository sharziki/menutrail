"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
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
  Search,
  Trash2,
  ExternalLink,
  ChevronDown,
  UtensilsCrossed
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/lib/store/cart"

// Demo restaurant data - in production this would be fetched based on slug
const RESTAURANT = {
  id: "demo",
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
  // Custom CTA
  ctaText: "Book a Table",
  ctaUrl: "https://opentable.com/the-burger-joint",
}

// Multiple menus support
const MENUS = [
  {
    id: "all-day",
    name: "All Day Menu",
    description: "Available all day",
    categoryIds: ["1", "2", "3", "4", "5"],
  },
  {
    id: "lunch",
    name: "Lunch Special",
    description: "11am - 3pm weekdays",
    categoryIds: ["1", "2", "3"],
  },
  {
    id: "happy-hour",
    name: "Happy Hour",
    description: "4pm - 7pm daily",
    categoryIds: ["1", "4"],
  },
]

const CATEGORIES = [
  { id: "1", name: "Popular", emoji: "🔥", description: "Our most loved dishes" },
  { id: "2", name: "Burgers", emoji: "🍔", description: "Handcrafted with 100% Angus beef" },
  { id: "3", name: "Sides", emoji: "🍟", description: "Perfect companions for your meal" },
  { id: "4", name: "Drinks", emoji: "🥤", description: "Refreshing beverages" },
  { id: "5", name: "Desserts", emoji: "🍰", description: "Sweet treats to finish" },
]

// Modifier groups for items
interface ModifierGroup {
  id: string
  name: string
  required: boolean
  minSelections: number
  maxSelections: number
  modifiers: { id: string; name: string; price: number; isDefault: boolean }[]
}

interface MenuItemType {
  id: string
  categoryId: string
  name: string
  description: string
  price: number
  image?: string
  tags?: string[]
  calories?: number
  modifierGroups?: ModifierGroup[]
}

const MODIFIER_GROUPS: Record<string, ModifierGroup[]> = {
  burgers: [
    {
      id: "toppings",
      name: "Toppings",
      required: true,
      minSelections: 0,
      maxSelections: 10,
      modifiers: [
        { id: "lettuce", name: "Lettuce", price: 0, isDefault: true },
        { id: "tomato", name: "Tomato", price: 0, isDefault: true },
        { id: "onion", name: "Onion", price: 0, isDefault: true },
        { id: "pickles", name: "Pickles", price: 0, isDefault: true },
        { id: "jalapenos", name: "Jalapeños", price: 0.50, isDefault: false },
        { id: "avocado", name: "Avocado", price: 2.00, isDefault: false },
        { id: "bacon", name: "Extra Bacon", price: 2.50, isDefault: false },
        { id: "egg", name: "Fried Egg", price: 1.50, isDefault: false },
      ]
    },
    {
      id: "cheese",
      name: "Cheese Selection",
      required: true,
      minSelections: 1,
      maxSelections: 1,
      modifiers: [
        { id: "american", name: "American", price: 0, isDefault: true },
        { id: "cheddar", name: "Cheddar", price: 0, isDefault: false },
        { id: "swiss", name: "Swiss", price: 0, isDefault: false },
        { id: "pepper-jack", name: "Pepper Jack", price: 0.50, isDefault: false },
        { id: "blue", name: "Blue Cheese", price: 1.00, isDefault: false },
      ]
    },
    {
      id: "patty",
      name: "Patty Temperature",
      required: true,
      minSelections: 1,
      maxSelections: 1,
      modifiers: [
        { id: "medium", name: "Medium", price: 0, isDefault: true },
        { id: "medium-well", name: "Medium Well", price: 0, isDefault: false },
        { id: "well-done", name: "Well Done", price: 0, isDefault: false },
      ]
    }
  ],
  drinks: [
    {
      id: "size",
      name: "Size",
      required: true,
      minSelections: 1,
      maxSelections: 1,
      modifiers: [
        { id: "small", name: "Small (12oz)", price: 0, isDefault: true },
        { id: "medium", name: "Medium (16oz)", price: 1.00, isDefault: false },
        { id: "large", name: "Large (24oz)", price: 2.00, isDefault: false },
      ]
    }
  ],
  milkshake: [
    {
      id: "flavor",
      name: "Flavor",
      required: true,
      minSelections: 1,
      maxSelections: 1,
      modifiers: [
        { id: "vanilla", name: "Vanilla", price: 0, isDefault: true },
        { id: "chocolate", name: "Chocolate", price: 0, isDefault: false },
        { id: "strawberry", name: "Strawberry", price: 0, isDefault: false },
        { id: "oreo", name: "Oreo", price: 1.00, isDefault: false },
        { id: "peanut-butter", name: "Peanut Butter", price: 1.00, isDefault: false },
      ]
    },
    {
      id: "size",
      name: "Size",
      required: true,
      minSelections: 1,
      maxSelections: 1,
      modifiers: [
        { id: "regular", name: "Regular", price: 0, isDefault: true },
        { id: "large", name: "Large", price: 2.00, isDefault: false },
      ]
    }
  ]
}

const MENU_ITEMS: MenuItemType[] = [
  { id: "1", categoryId: "1", name: "Truffle Mushroom Burger", description: "Wagyu beef, truffle aioli, sautéed mushrooms, gruyère", price: 18.99, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", tags: ["popular", "chef-special"], calories: 850, modifierGroups: MODIFIER_GROUPS.burgers },
  { id: "2", categoryId: "1", name: "Classic Cheeseburger", description: "Angus beef, American cheese, lettuce, tomato, special sauce", price: 14.99, image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400", tags: ["popular"], calories: 650, modifierGroups: MODIFIER_GROUPS.burgers },
  { id: "3", categoryId: "2", name: "BBQ Bacon Burger", description: "Angus beef, crispy bacon, cheddar, BBQ sauce, onion rings", price: 16.99, image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400", calories: 920, modifierGroups: MODIFIER_GROUPS.burgers },
  { id: "4", categoryId: "2", name: "Veggie Burger", description: "House-made black bean patty, avocado, sprouts, chipotle mayo", price: 13.99, image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400", tags: ["vegetarian"], calories: 480, modifierGroups: MODIFIER_GROUPS.burgers },
  { id: "5", categoryId: "3", name: "Sweet Potato Fries", description: "Crispy sweet potato fries with chipotle aioli", price: 6.99, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400", tags: ["popular"], calories: 380 },
  { id: "6", categoryId: "3", name: "Onion Rings", description: "Beer-battered onion rings with ranch", price: 7.99, calories: 450 },
  { id: "7", categoryId: "4", name: "Craft Lemonade", description: "Fresh-squeezed lemonade with mint", price: 4.99, calories: 120, modifierGroups: MODIFIER_GROUPS.drinks },
  { id: "8", categoryId: "4", name: "Milkshake", description: "Vanilla, chocolate, or strawberry", price: 6.99, calories: 580, modifierGroups: MODIFIER_GROUPS.milkshake },
  { id: "9", categoryId: "5", name: "Brownie Sundae", description: "Warm brownie, vanilla ice cream, hot fudge, whipped cream", price: 8.99, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400", calories: 780 },
]

export default function PublicMenuPage({ params: _params }: { params: { slug: string } }) {
  void _params // Will be used to fetch restaurant data
  const router = useRouter()
  const { items: cart, addItem, updateQuantity, removeItem, getTotal, getCount, setRestaurant } = useCartStore()
  
  const [showCart, setShowCart] = useState(false)
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id)
  const [search, setSearch] = useState("")
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null)
  const [mounted, setMounted] = useState(false)
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({})
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [itemQuantity, setItemQuantity] = useState(1)
  const [selectedMenu, setSelectedMenu] = useState(MENUS[0])
  const [showMenuSelector, setShowMenuSelector] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get categories for selected menu
  const menuCategories = useMemo(() => {
    return CATEGORIES.filter(cat => selectedMenu.categoryIds.includes(cat.id))
  }, [selectedMenu])

  // Reset active category when menu changes
  useEffect(() => {
    if (!selectedMenu.categoryIds.includes(activeCategory)) {
      setActiveCategory(menuCategories[0]?.id || CATEGORIES[0].id)
    }
  }, [selectedMenu, activeCategory, menuCategories])

  // Filter items based on selected menu and search
  const filteredItems = MENU_ITEMS.filter(item => {
    // First filter by selected menu categories
    if (!selectedMenu.categoryIds.includes(item.categoryId)) {
      return false
    }
    if (search) {
      return item.name.toLowerCase().includes(search.toLowerCase())
    }
    return item.categoryId === activeCategory
  })

  // Get active category for description
  const activeCategoryData = CATEGORIES.find(c => c.id === activeCategory)

  // Open item modal with default modifiers
  const openItemModal = (item: MenuItemType) => {
    // Initialize default modifiers
    const defaults: Record<string, string[]> = {}
    item.modifierGroups?.forEach(group => {
      const defaultMods = group.modifiers
        .filter(m => m.isDefault)
        .map(m => m.id)
      defaults[group.id] = defaultMods
    })
    setSelectedModifiers(defaults)
    setSpecialInstructions("")
    setItemQuantity(1)
    setSelectedItem(item)
  }

  // Toggle modifier selection
  const toggleModifier = (groupId: string, modifierId: string, maxSelections: number) => {
    setSelectedModifiers(prev => {
      const current = prev[groupId] || []
      if (maxSelections === 1) {
        // Radio behavior - single select
        return { ...prev, [groupId]: [modifierId] }
      } else {
        // Checkbox behavior - multi select
        if (current.includes(modifierId)) {
          return { ...prev, [groupId]: current.filter(id => id !== modifierId) }
        } else if (current.length < maxSelections || maxSelections === 0) {
          return { ...prev, [groupId]: [...current, modifierId] }
        }
        return prev
      }
    })
  }

  // Calculate total price with modifiers
  const calculateItemTotal = () => {
    if (!selectedItem) return 0
    let total = selectedItem.price
    selectedItem.modifierGroups?.forEach(group => {
      const selected = selectedModifiers[group.id] || []
      selected.forEach(modId => {
        const mod = group.modifiers.find(m => m.id === modId)
        if (mod) total += mod.price
      })
    })
    return total * itemQuantity
  }

  // Check if all required modifiers are selected
  const canAddToCart = () => {
    if (!selectedItem) return false
    for (const group of selectedItem.modifierGroups || []) {
      if (group.required && group.minSelections > 0) {
        const selected = selectedModifiers[group.id] || []
        if (selected.length < group.minSelections) return false
      }
    }
    return true
  }

  // Add to cart with modifiers
  const handleAddToCart = () => {
    if (!selectedItem || !canAddToCart()) return
    
    if (cart.length === 0) {
      setRestaurant(RESTAURANT.id, RESTAURANT.name)
    }
    
    // Build modifier list for display
    const modifierList: { name: string; price: number }[] = []
    selectedItem.modifierGroups?.forEach(group => {
      const selected = selectedModifiers[group.id] || []
      selected.forEach(modId => {
        const mod = group.modifiers.find(m => m.id === modId)
        if (mod) {
          modifierList.push({ name: mod.name, price: mod.price })
        }
      })
    })
    
    // Create unique ID for this configuration
    const configId = `${selectedItem.id}-${JSON.stringify(selectedModifiers)}-${Date.now()}`
    
    for (let i = 0; i < itemQuantity; i++) {
      addItem({
        id: configId,
        name: selectedItem.name,
        price: calculateItemTotal() / itemQuantity,
        image: selectedItem.image,
        modifiers: modifierList,
        notes: specialInstructions || undefined,
      })
    }
    
    setSelectedItem(null)
  }

  const cartTotal = mounted ? getTotal() : 0
  const cartCount = mounted ? getCount() : 0

  const handleCheckout = () => {
    setShowCart(false)
    router.push('/checkout')
  }

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
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700">Delivery</Badge>
            <Badge className="bg-blue-100 text-blue-700">Pickup</Badge>
            <Badge className="bg-purple-100 text-purple-700">Dine-in</Badge>
            
            {/* Custom CTA Button */}
            {RESTAURANT.ctaText && RESTAURANT.ctaUrl && (
              <a
                href={RESTAURANT.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2"
              >
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  {RESTAURANT.ctaText}
                  <ExternalLink className="w-3 h-3 ml-1.5" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Menu Selector & Search & Categories */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* Menu Selector (if multiple menus) */}
          {MENUS.length > 1 && (
            <div className="relative mb-3">
              <button
                onClick={() => setShowMenuSelector(!showMenuSelector)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition w-full sm:w-auto"
              >
                <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                <span className="font-medium">{selectedMenu.name}</span>
                <span className="text-gray-500 text-sm hidden sm:inline">— {selectedMenu.description}</span>
                <ChevronDown className={cn("w-4 h-4 ml-auto transition-transform", showMenuSelector && "rotate-180")} />
              </button>
              
              <AnimatePresence>
                {showMenuSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 sm:right-auto sm:w-80 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
                  >
                    {MENUS.map((menu) => (
                      <button
                        key={menu.id}
                        onClick={() => {
                          setSelectedMenu(menu)
                          setShowMenuSelector(false)
                        }}
                        className={cn(
                          "w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-center gap-3 border-b border-gray-100 last:border-0",
                          selectedMenu.id === menu.id && "bg-orange-50"
                        )}
                      >
                        <div className={cn(
                          "w-3 h-3 rounded-full border-2",
                          selectedMenu.id === menu.id 
                            ? "border-orange-500 bg-orange-500" 
                            : "border-gray-300"
                        )} />
                        <div>
                          <div className="font-medium">{menu.name}</div>
                          <div className="text-sm text-gray-500">{menu.description}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

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
            {menuCategories.map(cat => (
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
        {/* Category Description - Item 14 */}
        {activeCategoryData?.description && !search && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-600 mb-4 text-center"
          >
            {activeCategoryData.description}
          </motion.p>
        )}
        
        {/* 2x2 Grid on Mobile - Item 12 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
          {filteredItems.map(item => (
            <motion.button
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => openItemModal(item)}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden text-left hover:shadow-lg transition group"
            >
              {/* Mobile-optimized compact card layout */}
              <div className="flex flex-col">
                {/* Image at top */}
                {item.image ? (
                  <div className="aspect-square sm:aspect-video w-full overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="aspect-square sm:aspect-video w-full bg-gray-100 flex items-center justify-center">
                    <span className="text-3xl">🍽️</span>
                  </div>
                )}
                
                {/* Content */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-base group-hover:text-orange-600 transition line-clamp-2 mb-1">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2 hidden sm:block">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm sm:text-lg">${item.price.toFixed(2)}</span>
                    {item.modifierGroups && item.modifierGroups.length > 0 && (
                      <Badge variant="outline" className="text-xs">Customizable</Badge>
                    )}
                  </div>
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {item.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag === "popular" && "🔥"}
                          {tag === "chef-special" && "⭐"}
                          {tag === "vegetarian" && "🌱"}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
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

      {/* Item Detail Modal with Modifiers - Items 13 & 15 */}
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
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] flex flex-col"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              
              {/* Scrollable content */}
              <div className="flex-1 overflow-auto">
                {selectedItem.image && (
                  <div className="h-48 sm:h-64 bg-gray-100 relative">
                    <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setSelectedItem(null)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                
                <div className="p-6">
                  {!selectedItem.image && (
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
                      <button onClick={() => setSelectedItem(null)}>
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                  {selectedItem.image && (
                    <h2 className="text-2xl font-bold mb-2">{selectedItem.name}</h2>
                  )}
                  <p className="text-gray-600 mb-4">{selectedItem.description}</p>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-2xl font-bold">${selectedItem.price.toFixed(2)}</span>
                    {selectedItem.calories && (
                      <Badge variant="outline">{selectedItem.calories} calories</Badge>
                    )}
                  </div>
                  
                  {/* Modifier Groups */}
                  {selectedItem.modifierGroups && selectedItem.modifierGroups.length > 0 && (
                    <div className="space-y-6 mb-6">
                      {selectedItem.modifierGroups.map(group => (
                        <div key={group.id} className="border-t border-gray-100 pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">{group.name}</h3>
                              <p className="text-xs text-gray-500">
                                {group.required ? (
                                  group.maxSelections === 1 
                                    ? "Required • Select one" 
                                    : `Required • Select ${group.minSelections}${group.maxSelections > group.minSelections ? `-${group.maxSelections}` : ''}`
                                ) : (
                                  group.maxSelections === 0 
                                    ? "Optional • Select any" 
                                    : `Optional • Select up to ${group.maxSelections}`
                                )}
                              </p>
                            </div>
                            {group.required && (
                              <Badge className="bg-red-100 text-red-700 text-xs">Required</Badge>
                            )}
                          </div>
                          
                          {group.maxSelections === 1 ? (
                            // Radio buttons for single select
                            <RadioGroup 
                              value={selectedModifiers[group.id]?.[0] || ""} 
                              onValueChange={(val) => toggleModifier(group.id, val, 1)}
                              className="space-y-2"
                            >
                              {group.modifiers.map(mod => (
                                <div key={mod.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <RadioGroupItem value={mod.id} id={`${group.id}-${mod.id}`} />
                                    <Label htmlFor={`${group.id}-${mod.id}`} className="font-medium cursor-pointer">
                                      {mod.name}
                                    </Label>
                                  </div>
                                  {mod.price > 0 && (
                                    <span className="text-sm text-gray-600">+${mod.price.toFixed(2)}</span>
                                  )}
                                </div>
                              ))}
                            </RadioGroup>
                          ) : (
                            // Checkboxes for multi select
                            <div className="space-y-2">
                              {group.modifiers.map(mod => (
                                <div 
                                  key={mod.id} 
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer"
                                  onClick={() => toggleModifier(group.id, mod.id, group.maxSelections)}
                                >
                                  <div className="flex items-center gap-3">
                                    <Checkbox 
                                      checked={selectedModifiers[group.id]?.includes(mod.id) || false}
                                      onCheckedChange={() => toggleModifier(group.id, mod.id, group.maxSelections)}
                                    />
                                    <span className="font-medium">{mod.name}</span>
                                  </div>
                                  {mod.price > 0 && (
                                    <span className="text-sm text-gray-600">+${mod.price.toFixed(2)}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Special Instructions */}
                  <div className="border-t border-gray-100 pt-4 mb-6">
                    <h3 className="font-semibold mb-2">Special Instructions</h3>
                    <Textarea 
                      placeholder="Add any special requests..."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              
              {/* Fixed footer with quantity and add to cart */}
              <div className="p-4 border-t border-gray-200 bg-white safe-area-inset-bottom">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      className="p-3 hover:bg-gray-100 disabled:opacity-50"
                      onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                      disabled={itemQuantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-medium">{itemQuantity}</span>
                    <button
                      className="p-3 hover:bg-gray-100"
                      onClick={() => setItemQuantity(itemQuantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <Button 
                    className="flex-1 h-14 text-lg bg-gradient-to-r from-orange-500 to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAddToCart}
                    disabled={!canAddToCart()}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add to Cart — ${calculateItemTotal().toFixed(2)}
                  </Button>
                </div>
                {!canAddToCart() && (
                  <p className="text-sm text-red-500 text-center">
                    Please make all required selections
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Button */}
      {mounted && cartCount > 0 && !showCart && (
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
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                          <button
                            className="p-2 hover:bg-gray-100"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 font-medium">{item.quantity}</span>
                          <button
                            className="p-2 hover:bg-gray-100"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="text-right">
                          <span className="font-medium block">${(item.price * item.quantity).toFixed(2)}</span>
                          <button
                            className="text-red-500 hover:text-red-600"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                  <Button 
                    className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-red-600"
                    onClick={handleCheckout}
                  >
                    Checkout
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
