"use client"

import { useState, useCallback } from "react"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Settings, 
  Eye, 
  Save, 
  Undo, 
  Redo, 
  GripVertical,
  ChevronDown,
  ChevronRight,
  X,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { LayoutType, LAYOUT_CONFIG, Category, MenuItem } from "@/types/menu"
import { MenuDisplay } from "@/components/menu/MenuDisplay"
import { demoCategories } from "@/lib/demo-data"
import { SortableItem } from "@/components/builder/SortableItem"
import { ItemEditor } from "@/components/builder/ItemEditor"
import { CategoryEditor } from "@/components/builder/CategoryEditor"
import { ThemeEditor } from "@/components/builder/ThemeEditor"

export interface MenuTheme {
  primaryColor: string
  backgroundColor: string
  textColor: string
  accentColor: string
  borderRadius: "none" | "sm" | "md" | "lg" | "xl"
  fontFamily: "default" | "serif" | "mono"
}

const DEFAULT_THEME: MenuTheme = {
  primaryColor: "#f97316",
  backgroundColor: "#ffffff",
  textColor: "#111827",
  accentColor: "#ef4444",
  borderRadius: "lg",
  fontFamily: "default",
}

export default function BuilderPage() {
  // Menu state
  const [categories, setCategories] = useState<Category[]>(demoCategories)
  const [activeLayout, setActiveLayout] = useState<LayoutType>("grid")
  const [theme, setTheme] = useState<MenuTheme>(DEFAULT_THEME)
  
  // Editor state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories.map(c => c.id)))
  const [activeTab, setActiveTab] = useState<"items" | "layout" | "theme">("items")
  const [isDirty, setIsDirty] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  // Drag state
  const [activeId, setActiveId] = useState<string | null>(null)
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )
  
  // Find item or category by ID
  const findItem = useCallback((id: string): MenuItem | undefined => {
    for (const cat of categories) {
      const item = cat.items.find(i => i.id === id)
      if (item) return item
    }
    return undefined
  }, [categories])
  
  const findCategory = useCallback((id: string): Category | undefined => {
    return categories.find(c => c.id === id)
  }, [categories])
  
  // Toggle category expansion
  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  
  // Add new category
  const addCategory = () => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: "New Category",
      items: [],
    }
    setCategories([...categories, newCategory])
    setExpandedCategories(prev => new Set([...prev, newCategory.id]))
    setSelectedCategory(newCategory.id)
    setSelectedItem(null)
    setIsDirty(true)
  }
  
  // Add new item to category
  const addItem = (categoryId: string) => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: "New Item",
      description: "Add a description",
      price: 0,
      image: "/placeholder.jpg",
      isAvailable: true,
    }
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, items: [...cat.items, newItem] }
        : cat
    ))
    setSelectedItem(newItem.id)
    setSelectedCategory(categoryId)
    setIsDirty(true)
  }
  
  // Update category
  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    ))
    setIsDirty(true)
  }
  
  // Update item
  const updateItem = (categoryId: string, itemId: string, updates: Partial<MenuItem>) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            items: cat.items.map(item =>
              item.id === itemId ? { ...item, ...updates } : item
            ),
          }
        : cat
    ))
    setIsDirty(true)
  }
  
  // Delete category
  const deleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id))
    if (selectedCategory === id) {
      setSelectedCategory(null)
      setSelectedItem(null)
    }
    setIsDirty(true)
  }
  
  // Delete item
  const deleteItem = (categoryId: string, itemId: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, items: cat.items.filter(i => i.id !== itemId) }
        : cat
    ))
    if (selectedItem === itemId) {
      setSelectedItem(null)
    }
    setIsDirty(true)
  }
  
  // Handle drag events
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    
    if (!over || active.id === over.id) return
    
    // Check if dragging categories
    const activeCategory = findCategory(active.id as string)
    const overCategory = findCategory(over.id as string)
    
    if (activeCategory && overCategory) {
      // Reorder categories
      const oldIndex = categories.findIndex(c => c.id === active.id)
      const newIndex = categories.findIndex(c => c.id === over.id)
      setCategories(arrayMove(categories, oldIndex, newIndex))
      setIsDirty(true)
      return
    }
    
    // Check if dragging items within same category
    for (const cat of categories) {
      const activeItemIndex = cat.items.findIndex(i => i.id === active.id)
      const overItemIndex = cat.items.findIndex(i => i.id === over.id)
      
      if (activeItemIndex !== -1 && overItemIndex !== -1) {
        setCategories(categories.map(c =>
          c.id === cat.id
            ? { ...c, items: arrayMove(c.items, activeItemIndex, overItemIndex) }
            : c
        ))
        setIsDirty(true)
        return
      }
    }
  }
  
  // Save menu
  const saveMenu = async () => {
    // TODO: API call to save
    console.log("Saving menu:", { categories, theme, activeLayout })
    setIsDirty(false)
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="font-bold text-xl">MenuTrail</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">Menu Builder</span>
            {isDirty && (
              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                Unsaved changes
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Redo className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-red-600"
              onClick={saveMenu}
              disabled={!isDirty}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex">
        {/* Left Sidebar - Item List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
            <TabsList className="w-full rounded-none border-b border-gray-200 bg-gray-50 p-0 h-auto">
              <TabsTrigger 
                value="items" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-white py-3"
              >
                Items
              </TabsTrigger>
              <TabsTrigger 
                value="layout"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-white py-3"
              >
                Layout
              </TabsTrigger>
              <TabsTrigger 
                value="theme"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-white py-3"
              >
                Theme
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="items" className="flex-1 mt-0 overflow-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="p-4">
                  <Button 
                    variant="outline" 
                    className="w-full mb-4"
                    onClick={addCategory}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                  
                  <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <SortableItem id={category.id}>
                            <div
                              className={cn(
                                "flex items-center gap-2 p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition",
                                selectedCategory === category.id && !selectedItem && "bg-orange-50 border-l-4 border-orange-500"
                              )}
                              onClick={() => {
                                setSelectedCategory(category.id)
                                setSelectedItem(null)
                              }}
                            >
                              <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleCategory(category.id)
                                }}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                {expandedCategories.has(category.id) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                              <span className="flex-1 font-medium truncate">{category.name}</span>
                              <span className="text-xs text-gray-500">{category.items.length}</span>
                            </div>
                          </SortableItem>
                          
                          <AnimatePresence>
                            {expandedCategories.has(category.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <SortableContext items={category.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                  <div className="py-1">
                                    {category.items.map((item) => (
                                      <SortableItem key={item.id} id={item.id}>
                                        <div
                                          className={cn(
                                            "flex items-center gap-2 px-3 py-2 pl-10 cursor-pointer hover:bg-gray-50 transition",
                                            selectedItem === item.id && "bg-orange-50 border-l-4 border-orange-500"
                                          )}
                                          onClick={() => {
                                            setSelectedCategory(category.id)
                                            setSelectedItem(item.id)
                                          }}
                                        >
                                          <GripVertical className="w-3 h-3 text-gray-400 cursor-grab" />
                                          <div className="w-8 h-8 bg-gray-200 rounded overflow-hidden shrink-0">
                                            {item.image && (
                                              <img src={item.image} alt="" className="w-full h-full object-cover" />
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">${item.price.toFixed(2)}</p>
                                          </div>
                                          {!item.isAvailable && (
                                            <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                                              Hidden
                                            </span>
                                          )}
                                        </div>
                                      </SortableItem>
                                    ))}
                                    <button
                                      className="w-full flex items-center gap-2 px-3 py-2 pl-10 text-sm text-gray-500 hover:text-orange-600 hover:bg-gray-50 transition"
                                      onClick={() => addItem(category.id)}
                                    >
                                      <Plus className="w-4 h-4" />
                                      Add item
                                    </button>
                                  </div>
                                </SortableContext>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                </div>
                
                <DragOverlay>
                  {activeId ? (
                    <div className="bg-white shadow-lg rounded-lg p-3 border-2 border-orange-500">
                      {findCategory(activeId)?.name || findItem(activeId)?.name || "Dragging..."}
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </TabsContent>
            
            <TabsContent value="layout" className="flex-1 mt-0 p-4 overflow-auto">
              <h3 className="font-medium mb-4">Choose Layout</h3>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(LAYOUT_CONFIG) as LayoutType[]).map((layout) => (
                  <button
                    key={layout}
                    onClick={() => {
                      setActiveLayout(layout)
                      setIsDirty(true)
                    }}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition",
                      activeLayout === layout
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <span className="text-2xl mb-2 block">{LAYOUT_CONFIG[layout].icon}</span>
                    <p className="font-medium text-sm">{LAYOUT_CONFIG[layout].name}</p>
                    <p className="text-xs text-gray-500 mt-1">{LAYOUT_CONFIG[layout].bestFor}</p>
                  </button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="theme" className="flex-1 mt-0 p-4 overflow-auto">
              <ThemeEditor theme={theme} onChange={(t) => { setTheme(t); setIsDirty(true); }} />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Center - Live Preview */}
        <div className="flex-1 p-8 overflow-auto bg-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-sm text-gray-500">Live Preview</span>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(true)}>
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Full Preview
                </Button>
              </div>
              <div className="p-6" style={{ backgroundColor: theme.backgroundColor }}>
                <MenuDisplay
                  categories={categories}
                  layoutType={activeLayout}
                  onAddItem={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar - Item/Category Editor */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-auto">
          {selectedItem && selectedCategory ? (
            <ItemEditor
              item={findItem(selectedItem)!}
              onUpdate={(updates) => updateItem(selectedCategory, selectedItem, updates)}
              onDelete={() => deleteItem(selectedCategory, selectedItem)}
              onClose={() => setSelectedItem(null)}
            />
          ) : selectedCategory ? (
            <CategoryEditor
              category={findCategory(selectedCategory)!}
              onUpdate={(updates) => updateCategory(selectedCategory, updates)}
              onDelete={() => deleteCategory(selectedCategory)}
              onClose={() => setSelectedCategory(null)}
            />
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a category or item to edit</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Full Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold">Menu Preview</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="overflow-auto max-h-[calc(90vh-60px)] p-6" style={{ backgroundColor: theme.backgroundColor }}>
                <MenuDisplay
                  categories={categories}
                  layoutType={activeLayout}
                  onAddItem={() => {}}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
