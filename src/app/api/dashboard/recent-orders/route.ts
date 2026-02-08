import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/dashboard/recent-orders - Fetch recent orders
export async function GET() {
  try {
    const restaurant = await prisma.restaurant.findFirst({
      select: { id: true }
    })

    if (!restaurant) {
      return NextResponse.json({ orders: [] })
    }

    const recentOrders = await prisma.order.findMany({
      where: {
        restaurantId: restaurant.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      select: {
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        orderType: true,
        tableId: true,
      },
    })

    return NextResponse.json({
      orders: recentOrders.map((o) => ({
        id: o.orderNumber,
        customer: o.tableId ? `Table` : o.customerName.split(" ")[0] + " " + (o.customerName.split(" ")[1]?.[0] || "") + ".",
        total: o.total,
        status: o.status.toLowerCase(),
        type: o.orderType.toLowerCase(),
      })),
    })
  } catch (error) {
    console.error("Recent orders error:", error)
    return NextResponse.json(
      { error: "Failed to fetch recent orders" },
      { status: 500 }
    )
  }
}
