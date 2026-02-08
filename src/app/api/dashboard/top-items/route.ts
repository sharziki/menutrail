import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { subDays } from "date-fns"

// GET /api/dashboard/top-items - Fetch top selling menu items
export async function GET() {
  try {
    const restaurant = await prisma.restaurant.findFirst({
      select: { id: true }
    })

    if (!restaurant) {
      return NextResponse.json({ items: [] })
    }

    // Get orders from last 30 days
    const thirtyDaysAgo = subDays(new Date(), 30)

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          restaurantId: restaurant.id,
          createdAt: { gte: thirtyDaysAgo },
          paymentStatus: "PAID",
        },
      },
      select: {
        name: true,
        quantity: true,
        total: true,
      },
    })

    // Aggregate by item name
    const itemMap = new Map<string, { orders: number; revenue: number }>()

    for (const item of orderItems) {
      const existing = itemMap.get(item.name) || { orders: 0, revenue: 0 }
      itemMap.set(item.name, {
        orders: existing.orders + item.quantity,
        revenue: existing.revenue + item.total,
      })
    }

    // Convert to array and sort by orders
    const topItems = Array.from(itemMap.entries())
      .map(([name, stats]) => ({
        name,
        orders: stats.orders,
        revenue: Math.round(stats.revenue * 100) / 100,
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10)

    return NextResponse.json({ items: topItems })
  } catch (error) {
    console.error("Top items error:", error)
    return NextResponse.json(
      { error: "Failed to fetch top items" },
      { status: 500 }
    )
  }
}
