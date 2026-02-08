import { NextRequest, NextResponse } from "next/server"

// DoorDash Sandbox Testing Endpoint
// Allows restaurant owners to test the delivery flow without real deliveries

interface SandboxDelivery {
  id: string
  orderId: string
  status: string
  createdAt: number
  pickupAddress: string
  dropoffAddress: string
  dasherName?: string
  dasherPhone?: string
  estimatedPickupTime: string
  estimatedDeliveryTime: string
  fee: number
  events: Array<{ status: string; timestamp: number }>
}

// In-memory store for sandbox deliveries
const sandboxDeliveries = new Map<string, SandboxDelivery>()

// Status progression for sandbox mode
const STATUS_PROGRESSION = [
  { status: "created", minutesFromStart: 0 },
  { status: "confirmed", minutesFromStart: 2 },
  { status: "dasher_confirmed", minutesFromStart: 5 },
  { status: "dasher_at_store", minutesFromStart: 10 },
  { status: "picked_up", minutesFromStart: 15 },
  { status: "enroute_to_consumer", minutesFromStart: 20 },
  { status: "arrived_at_consumer", minutesFromStart: 35 },
  { status: "delivered", minutesFromStart: 40 },
]

function calculateCurrentStatus(createdAt: number): string {
  const elapsedMinutes = (Date.now() - createdAt) / 60000
  
  let currentStatus = "created"
  for (const stage of STATUS_PROGRESSION) {
    if (elapsedMinutes >= stage.minutesFromStart) {
      currentStatus = stage.status
    }
  }
  return currentStatus
}

// POST - Create sandbox delivery
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      orderId,
      pickupAddress,
      dropoffAddress,
      orderValue: _orderValue, // Used for delivery calculations in production
      items: _items, // Used for order verification in production
    } = body
    
    // Prevent unused variable warnings (used in production)
    void _orderValue
    void _items

    const now = Date.now()
    const deliveryId = `sandbox-${orderId}-${now}`
    
    // Calculate simulated fee
    const baseFee = 5.99
    const distanceFee = 2.50 // Fixed for sandbox
    const fee = baseFee + distanceFee

    const delivery: SandboxDelivery = {
      id: deliveryId,
      orderId,
      status: "created",
      createdAt: now,
      pickupAddress: typeof pickupAddress === "object" 
        ? `${pickupAddress.street}, ${pickupAddress.city}, ${pickupAddress.state} ${pickupAddress.zip}`
        : pickupAddress,
      dropoffAddress: typeof dropoffAddress === "object"
        ? `${dropoffAddress.street}, ${dropoffAddress.city}, ${dropoffAddress.state} ${dropoffAddress.zip}`
        : dropoffAddress,
      estimatedPickupTime: new Date(now + 15 * 60000).toISOString(),
      estimatedDeliveryTime: new Date(now + 45 * 60000).toISOString(),
      fee,
      events: [{ status: "created", timestamp: now }],
    }

    sandboxDeliveries.set(deliveryId, delivery)

    return NextResponse.json({
      success: true,
      deliveryId,
      trackingUrl: `/track/${deliveryId}?sandbox=true`,
      estimatedPickupTime: delivery.estimatedPickupTime,
      estimatedDeliveryTime: delivery.estimatedDeliveryTime,
      fee,
      isSandbox: true,
      message: "Sandbox delivery created. Status will auto-progress for testing.",
    })
  } catch (error) {
    console.error("Sandbox delivery error:", error)
    return NextResponse.json(
      { error: "Failed to create sandbox delivery" },
      { status: 500 }
    )
  }
}

// GET - Get sandbox delivery status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const deliveryId = searchParams.get("id")
  const action = searchParams.get("action")

  if (!deliveryId) {
    return NextResponse.json(
      { error: "Delivery ID required" },
      { status: 400 }
    )
  }

  // List all sandbox deliveries
  if (action === "list") {
    const deliveries = Array.from(sandboxDeliveries.values()).map(d => ({
      ...d,
      status: calculateCurrentStatus(d.createdAt),
    }))
    return NextResponse.json({ deliveries })
  }

  const delivery = sandboxDeliveries.get(deliveryId)

  if (!delivery) {
    // For any sandbox-prefixed ID, generate dynamic status
    if (deliveryId.startsWith("sandbox-")) {
      const parts = deliveryId.split("-")
      const createdAt = parseInt(parts[parts.length - 1]) || Date.now() - 10 * 60000
      const currentStatus = calculateCurrentStatus(createdAt)

      const statusHasDasher = [
        "dasher_confirmed",
        "dasher_at_store",
        "picked_up",
        "enroute_to_consumer",
        "arrived_at_consumer",
        "delivered"
      ].includes(currentStatus)

      return NextResponse.json({
        deliveryId,
        status: currentStatus,
        trackingUrl: `/track/${deliveryId}?sandbox=true`,
        dasherName: statusHasDasher ? "Alex (Sandbox)" : undefined,
        dasherPhone: statusHasDasher ? "+1 (555) 000-0000" : undefined,
        estimatedPickupTime: new Date(createdAt + 15 * 60000).toISOString(),
        estimatedDeliveryTime: new Date(createdAt + 45 * 60000).toISOString(),
        isSandbox: true,
      })
    }

    return NextResponse.json(
      { error: "Sandbox delivery not found" },
      { status: 404 }
    )
  }

  // Update status based on time elapsed
  const currentStatus = calculateCurrentStatus(delivery.createdAt)
  
  const statusHasDasher = [
    "dasher_confirmed",
    "dasher_at_store",
    "picked_up",
    "enroute_to_consumer",
    "arrived_at_consumer",
    "delivered"
  ].includes(currentStatus)

  return NextResponse.json({
    ...delivery,
    status: currentStatus,
    dasherName: statusHasDasher ? "Alex (Sandbox)" : undefined,
    dasherPhone: statusHasDasher ? "+1 (555) 000-0000" : undefined,
    isSandbox: true,
  })
}

// DELETE - Cancel sandbox delivery
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const deliveryId = searchParams.get("id")

  if (!deliveryId) {
    return NextResponse.json(
      { error: "Delivery ID required" },
      { status: 400 }
    )
  }

  if (sandboxDeliveries.has(deliveryId)) {
    sandboxDeliveries.delete(deliveryId)
  }

  return NextResponse.json({
    success: true,
    message: "Sandbox delivery cancelled",
  })
}

// PUT - Manually set status (for testing specific scenarios)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { deliveryId, status, simulateError } = body

    if (simulateError) {
      return NextResponse.json({
        success: false,
        error: `Simulated error: ${simulateError}`,
        errorCode: "SANDBOX_SIMULATED_ERROR",
      })
    }

    const delivery = sandboxDeliveries.get(deliveryId)
    if (delivery) {
      delivery.status = status
      delivery.events.push({ status, timestamp: Date.now() })
      sandboxDeliveries.set(deliveryId, delivery)
    }

    return NextResponse.json({
      success: true,
      deliveryId,
      status,
      message: `Sandbox delivery status set to: ${status}`,
    })
  } catch (error) {
    console.error("Sandbox status update error:", error)
    return NextResponse.json(
      { error: "Failed to update sandbox delivery" },
      { status: 500 }
    )
  }
}
