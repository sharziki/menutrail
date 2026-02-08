import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, subDays } from "date-fns"

// GET /api/dashboard/stats - Fetch dashboard statistics
export async function GET() {
  try {
    // TODO: Get restaurantId from authenticated user session
    // For now, get the first restaurant (demo purposes)
    const restaurant = await prisma.restaurant.findFirst({
      select: { id: true }
    })

    if (!restaurant) {
      return NextResponse.json({
        todayRevenue: 0,
        todayOrders: 0,
        avgOrderValue: 0,
        newCustomers: 0,
        revenueChange: 0,
        ordersChange: 0,
      })
    }

    const restaurantId = restaurant.id
    const today = new Date()
    const yesterday = subDays(today, 1)

    // Today's stats
    const todayOrders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
        paymentStatus: "PAID",
      },
      select: {
        total: true,
      },
    })

    // Yesterday's stats for comparison
    const yesterdayOrders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: {
          gte: startOfDay(yesterday),
          lte: endOfDay(yesterday),
        },
        paymentStatus: "PAID",
      },
      select: {
        total: true,
      },
    })

    // New customers today
    const newCustomersToday = await prisma.customer.count({
      where: {
        restaurantId,
        createdAt: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
    })

    // Calculate stats
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)
    const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + o.total, 0)
    const todayOrderCount = todayOrders.length
    const yesterdayOrderCount = yesterdayOrders.length

    const avgOrderValue = todayOrderCount > 0 ? todayRevenue / todayOrderCount : 0

    // Calculate percentage changes
    const revenueChange = yesterdayRevenue > 0 
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
      : 0
    const ordersChange = yesterdayOrderCount > 0 
      ? ((todayOrderCount - yesterdayOrderCount) / yesterdayOrderCount) * 100 
      : 0

    return NextResponse.json({
      todayRevenue,
      todayOrders: todayOrderCount,
      avgOrderValue,
      newCustomers: newCustomersToday,
      revenueChange: Math.round(revenueChange * 10) / 10,
      ordersChange: Math.round(ordersChange * 10) / 10,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
