import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Restaurant {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  coverImage?: string
  primaryColor: string
  accentColor: string
  phone?: string
  email?: string
  street?: string
  city?: string
  state?: string
  zip?: string
  taxRate: number
  onlineOrderingEnabled: boolean
  deliveryEnabled: boolean
  pickupEnabled: boolean
  dineInEnabled: boolean
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
  // API Keys (masked in UI)
  hasStripeKeys: boolean
  hasDoorDashKeys: boolean
}

export interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  role: 'OWNER' | 'MANAGER' | 'STAFF'
}

interface RestaurantStore {
  // Auth state
  user: User | null
  isLoading: boolean
  
  // Restaurant state
  restaurant: Restaurant | null
  
  // Actions
  setUser: (user: User | null) => void
  setRestaurant: (restaurant: Restaurant | null) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useRestaurantStore = create<RestaurantStore>()(
  persist(
    (set) => ({
      user: null,
      restaurant: null,
      isLoading: true,
      
      setUser: (user) => set({ user }),
      setRestaurant: (restaurant) => set({ restaurant }),
      setLoading: (isLoading) => set({ isLoading }),
      clear: () => set({ user: null, restaurant: null }),
    }),
    {
      name: 'menutrail-store',
      partialize: (state) => ({ 
        // Only persist certain fields
        restaurant: state.restaurant ? { 
          id: state.restaurant.id,
          slug: state.restaurant.slug,
          name: state.restaurant.name,
        } : null,
      }),
    }
  )
)
