"use client"

import { Category, MenuItem, LayoutType } from "@/types/menu"
import {
  GridLayout,
  ListLayout,
  CardLayout,
  TabsLayout,
  HeroLayout,
  CompactLayout,
} from "./layouts"

interface MenuDisplayProps {
  categories: Category[]
  layoutType: LayoutType
  onAddItem?: (item: MenuItem) => void
}

export function MenuDisplay({ categories, layoutType, onAddItem }: MenuDisplayProps) {
  const props = { categories, onAddItem }

  switch (layoutType) {
    case 'grid':
      return <GridLayout {...props} />
    case 'list':
      return <ListLayout {...props} />
    case 'card':
      return <CardLayout {...props} />
    case 'tabs':
      return <TabsLayout {...props} />
    case 'hero':
      return <HeroLayout {...props} />
    case 'compact':
      return <CompactLayout {...props} />
    default:
      return <GridLayout {...props} />
  }
}
