import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"

// GET /api/dashboard/top-customers - Fetch top customers by spending
export async function GET() {
  try {
    const restaurant = await prisma.restaurant.findFirst({
      select: { id: true }
    })

    if (!restaurant) {
      return NextResponse.json({ customers: [] })
    }

    const topCustomers = await prisma.customer.findMany({
      where: {
        restaurantId: restaurant.id,
      },
      orderBy: {
        totalSpent: "desc",
      },
      take: 10,
      select: {
        id: true,
        name: true,
        totalOrders: true,
        totalSpent: true,
        lastOrderAt: true,
      },
    })

    return NextResponse.json({
      customers: topCustomers.map((c) => ({
        id: c.id,
        name: c.name,
        orders: c.totalOrders,
        spent: Math.round(c.totalSpent * 100) / 100,
        lastOrder: c.lastOrderAt
          ? formatDistanceToNow(c.lastOrderAt, { addSuffix: true })
          : "Never",
      })),
    })
  } catch (error) {
    console.error("Top customers error:", error)
    return NextResponse.json(
      { error: "Failed to fetch top customers" },
      { status: 500 }
    )
  }
}
