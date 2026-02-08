import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/orders - Fetch all orders for the restaurant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")

    const restaurant = await prisma.restaurant.findFirst({
      select: { id: true }
    })

    if (!restaurant) {
      return NextResponse.json({ orders: [] })
    }

    const orders = await prisma.order.findMany({
      where: {
        restaurantId: restaurant.id,
        ...(status && status !== "all" ? { status: status.toUpperCase() as "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "COMPLETED" | "CANCELLED" } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        items: true,
        table: {
          select: {
            number: true,
          },
        },
      },
    })

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status.toLowerCase(),
        type: order.orderType.toLowerCase(),
        table: order.table?.number,
        items: order.items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          modifiers: item.modifiers as string[] | undefined,
          notes: item.notes,
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        tip: order.tip,
        total: order.total,
        customer: {
          name: order.customerName,
          phone: order.customerPhone,
          email: order.customerEmail,
        },
        deliveryAddress: order.deliveryStreet ? {
          street: order.deliveryStreet,
          apt: order.deliveryApt,
          city: order.deliveryCity,
          state: order.deliveryState,
          zip: order.deliveryZip,
          instructions: order.deliveryInstructions,
        } : undefined,
        doordashTrackingUrl: order.doordashTrackingUrl,
        createdAt: order.createdAt,
        prepTime: order.estimatedReadyAt 
          ? Math.round((new Date(order.estimatedReadyAt).getTime() - new Date(order.createdAt).getTime()) / 60000)
          : undefined,
        estimatedReady: order.estimatedReadyAt,
      })),
    })
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

// PATCH /api/orders - Update order status
export async function PATCH(request: NextRequest) {
  try {
    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId and status are required" },
        { status: 400 }
      )
    }

    const validStatuses = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"]
    if (!validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status.toUpperCase() as "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "COMPLETED" | "CANCELLED",
        ...(status.toUpperCase() === "COMPLETED" ? { completedAt: new Date() } : {}),
      },
    })

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error("Order update error:", error)
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
}
