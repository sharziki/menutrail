import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  modifiers?: { name: string; price: number }[]
}

interface CartStore {
  items: CartItem[]
  restaurantId: string | null
  restaurantName: string | null
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setRestaurant: (id: string, name: string) => void
  
  // Computed
  getTotal: () => number
  getCount: () => number
  getSubtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,
      
      addItem: (item) => set((state) => {
        const existing = state.items.find((i) => i.id === item.id)
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          }
        }
        return { items: [...state.items, { ...item, quantity: 1 }] }
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),
      
      updateQuantity: (id, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter((i) => i.id !== id) }
        }
        return {
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }
      }),
      
      clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),
      
      setRestaurant: (id, name) => set({ restaurantId: id, restaurantName: name }),
      
      getTotal: () => {
        const state = get()
        return state.items.reduce((sum, item) => {
          const modifiersTotal = item.modifiers?.reduce((m, mod) => m + mod.price, 0) || 0
          return sum + (item.price + modifiersTotal) * item.quantity
        }, 0)
      },
      
      getCount: () => {
        const state = get()
        return state.items.reduce((sum, item) => sum + item.quantity, 0)
      },
      
      getSubtotal: () => {
        const state = get()
        return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'menutrail-cart',
    }
  )
)
