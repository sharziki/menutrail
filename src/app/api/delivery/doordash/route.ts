import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// DoorDash Drive API integration
// Docs: https://developer.doordash.com/en-US/docs/drive/reference/createdelivery

const DOORDASH_API_URL = "https://openapi.doordash.com"

interface DeliveryRequest {
  orderId: string
  pickupAddress: {
    street: string
    city: string
    state: string
    zip: string
    businessName: string
    phoneNumber: string
  }
  dropoffAddress: {
    street: string
    city: string
    state: string
    zip: string
    firstName: string
    lastName: string
    phoneNumber: string
  }
  orderValue: number
  items: Array<{ name: string; quantity: number }>
  pickupInstructions?: string
  dropoffInstructions?: string
  tip?: number
}

// Generate DoorDash JWT
function generateDoorDashJWT(): string {
  const decodedAccessKey = Buffer.from(
    process.env.DOORDASH_SIGNING_SECRET || "",
    "base64"
  )

  const header = {
    alg: "HS256",
    typ: "JWT",
    "dd-ver": "DD-JWT-V1",
  }

  const payload = {
    aud: "doordash",
    iss: process.env.DOORDASH_DEVELOPER_ID,
    kid: process.env.DOORDASH_KEY_ID,
    exp: Math.floor(Date.now() / 1000) + 300, // 5 min expiry
    iat: Math.floor(Date.now() / 1000),
  }

  return jwt.sign(payload, decodedAccessKey, { header })
}

// Create delivery quote
export async function POST(request: NextRequest) {
  try {
    const body: DeliveryRequest = await request.json()
    
    // Validate required env vars
    if (!process.env.DOORDASH_DEVELOPER_ID || !process.env.DOORDASH_KEY_ID) {
      return NextResponse.json(
        { error: "DoorDash not configured" },
        { status: 500 }
      )
    }

    const token = generateDoorDashJWT()

    // Create delivery request
    const deliveryPayload = {
      external_delivery_id: `menutrail-${body.orderId}-${Date.now()}`,
      pickup_address: `${body.pickupAddress.street}, ${body.pickupAddress.city}, ${body.pickupAddress.state} ${body.pickupAddress.zip}`,
      pickup_business_name: body.pickupAddress.businessName,
      pickup_phone_number: body.pickupAddress.phoneNumber,
      pickup_instructions: body.pickupInstructions || "Order ready for pickup",
      dropoff_address: `${body.dropoffAddress.street}, ${body.dropoffAddress.city}, ${body.dropoffAddress.state} ${body.dropoffAddress.zip}`,
      dropoff_contact_given_name: body.dropoffAddress.firstName,
      dropoff_contact_family_name: body.dropoffAddress.lastName,
      dropoff_phone_number: body.dropoffAddress.phoneNumber,
      dropoff_instructions: body.dropoffInstructions || "Leave at door",
      order_value: Math.round(body.orderValue * 100), // cents
      items: body.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
      })),
      tip: body.tip ? Math.round(body.tip * 100) : 0,
    }

    const response = await fetch(`${DOORDASH_API_URL}/drive/v2/deliveries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(deliveryPayload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("DoorDash API error:", errorData)
      return NextResponse.json(
        { error: "Failed to create delivery", details: errorData },
        { status: response.status }
      )
    }

    const delivery = await response.json()

    return NextResponse.json({
      success: true,
      deliveryId: delivery.external_delivery_id,
      trackingUrl: delivery.tracking_url,
      estimatedPickupTime: delivery.pickup_time_estimated,
      estimatedDeliveryTime: delivery.dropoff_time_estimated,
      fee: delivery.fee / 100, // Convert back to dollars
    })
  } catch (error) {
    console.error("Delivery error:", error)
    return NextResponse.json(
      { error: "Failed to process delivery request" },
      { status: 500 }
    )
  }
}

// Get delivery status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deliveryId = searchParams.get("id")

    if (!deliveryId) {
      return NextResponse.json(
        { error: "Delivery ID required" },
        { status: 400 }
      )
    }

    const token = generateDoorDashJWT()

    const response = await fetch(
      `${DOORDASH_API_URL}/drive/v2/deliveries/${deliveryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to get delivery status" },
        { status: response.status }
      )
    }

    const delivery = await response.json()

    return NextResponse.json({
      status: delivery.delivery_status,
      trackingUrl: delivery.tracking_url,
      dasherName: delivery.dasher?.first_name,
      dasherPhone: delivery.dasher?.phone_number,
      estimatedPickupTime: delivery.pickup_time_estimated,
      estimatedDeliveryTime: delivery.dropoff_time_estimated,
    })
  } catch (error) {
    console.error("Delivery status error:", error)
    return NextResponse.json(
      { error: "Failed to get delivery status" },
      { status: 500 }
    )
  }
}
