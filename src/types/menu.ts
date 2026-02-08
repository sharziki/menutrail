// Menu Types

export type LayoutType = 'grid' | 'list' | 'card' | 'tabs' | 'hero' | 'compact'

export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  comparePrice?: number
  image?: string
  images?: string[]  // Multi-photo support
  tags?: string[]
  dietaryTags?: string[]
  spiceLevel?: number
  calories?: number
  isAvailable: boolean
  modifierGroups?: ModifierGroup[]
}

export interface ModifierGroup {
  id: string
  name: string
  required: boolean
  minSelections: number
  maxSelections: number
  modifiers: Modifier[]
}

export interface Modifier {
  id: string
  name: string
  price: number
  isDefault: boolean
}

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  items: MenuItem[]
}

export interface Menu {
  id: string
  name: string
  description?: string
  isActive: boolean
  availableFrom?: string
  availableTo?: string
  availableDays?: string[]
  layoutType?: LayoutType
  categories: Category[]
}

export interface Restaurant {
  id: string
  slug: string
  name: string
  description?: string
  logo?: string
  coverImage?: string
  layoutType: LayoutType
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  categories: Category[]
  menus?: Menu[]  // Multiple menus support
  ctaText?: string  // Custom CTA button text
  ctaUrl?: string   // Custom CTA button URL
}

export interface Theme {
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  layoutType: LayoutType
}

// Layout configuration
export const LAYOUT_CONFIG: Record<LayoutType, {
  name: string
  description: string
  icon: string
  bestFor: string
}> = {
  grid: {
    name: 'Grid',
    description: 'Photos forward, Instagram-style',
    icon: '🔲',
    bestFor: 'Trendy cafes, Instagram-worthy dishes'
  },
  list: {
    name: 'List',
    description: 'Classic, scannable layout',
    icon: '📋',
    bestFor: 'Diners, delis, large menus'
  },
  card: {
    name: 'Card Stack',
    description: 'Swipeable cards on mobile',
    icon: '🃏',
    bestFor: 'Mobile-first, modern restaurants'
  },
  tabs: {
    name: 'Category Tabs',
    description: 'Horizontal scrolling categories',
    icon: '📑',
    bestFor: 'Large menus with many categories'
  },
  hero: {
    name: 'Full-Page Hero',
    description: 'One item at a time, high-end feel',
    icon: '✨',
    bestFor: 'Fine dining, limited menus'
  },
  compact: {
    name: 'Compact',
    description: 'Text-dense, traditional style',
    icon: '📄',
    bestFor: 'Traditional diners, quick scanning'
  }
}
