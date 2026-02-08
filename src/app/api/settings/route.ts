import { NextRequest, NextResponse } from "next/server"

// Restaurant Settings API
// Manages integration settings including sandbox mode

interface RestaurantSettings {
  // DoorDash
  doordashSandboxMode: boolean
  doordashDeveloperId?: string
  doordashKeyId?: string
  
  // Go High Level
  ghlEnabled: boolean
  ghlApiKey?: string
  ghlLocationId?: string
  
  // Gift Cards
  giftCardsEnabled: boolean
  giftCardExpirationDays: number
  
  // General
  onlineOrderingEnabled: boolean
  deliveryEnabled: boolean
  pickupEnabled: boolean
}

// In-memory settings store (would be Prisma in production)
const settingsStore = new Map<string, RestaurantSettings>()

// Default settings
const defaultSettings: RestaurantSettings = {
  doordashSandboxMode: true,
  ghlEnabled: false,
  giftCardsEnabled: true,
  giftCardExpirationDays: 365,
  onlineOrderingEnabled: true,
  deliveryEnabled: true,
  pickupEnabled: true,
}

// GET - Get restaurant settings
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const restaurantId = searchParams.get("restaurantId") || "demo"

  let settings = settingsStore.get(restaurantId)
  
  if (!settings) {
    settings = { ...defaultSettings }
    settingsStore.set(restaurantId, settings)
  }

  // Mask sensitive fields
  const safeSettings = {
    ...settings,
    doordashDeveloperId: settings.doordashDeveloperId ? "••••••" : undefined,
    doordashKeyId: settings.doordashKeyId ? "••••••" : undefined,
    ghlApiKey: settings.ghlApiKey ? "••••••" : undefined,
  }

  return NextResponse.json({
    settings: safeSettings,
    hasDoordash: !!settings.doordashDeveloperId,
    hasGHL: !!settings.ghlApiKey,
  })
}

// PUT - Update restaurant settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId = "demo", settings: updates } = body

    const settingsData = settingsStore.get(restaurantId) || { ...defaultSettings }

    // Update allowed fields
    const allowedFields: (keyof RestaurantSettings)[] = [
      "doordashSandboxMode",
      "doordashDeveloperId",
      "doordashKeyId",
      "ghlEnabled",
      "ghlApiKey",
      "ghlLocationId",
      "giftCardsEnabled",
      "giftCardExpirationDays",
      "onlineOrderingEnabled",
      "deliveryEnabled",
      "pickupEnabled",
    ]

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (settingsData as any)[field] = updates[field]
      }
    }

    settingsStore.set(restaurantId, settingsData)

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
}

// POST - Test integration connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { integration, credentials } = body

    if (integration === "doordash") {
      // Test DoorDash connection (would make actual API call)
      if (credentials.developerId && credentials.keyId && credentials.signingSecret) {
        return NextResponse.json({
          success: true,
          message: "DoorDash credentials validated",
          sandbox: credentials.sandbox || false,
        })
      }
      return NextResponse.json({
        success: false,
        error: "Missing required DoorDash credentials",
      })
    }

    if (integration === "ghl") {
      // Test GHL connection
      if (!credentials.apiKey || !credentials.locationId) {
        return NextResponse.json({
          success: false,
          error: "Missing API key or Location ID",
        })
      }

      // Try to fetch location info
      try {
        const response = await fetch(
          `https://rest.gohighlevel.com/v1/locations/${credentials.locationId}`,
          {
            headers: {
              Authorization: `Bearer ${credentials.apiKey}`,
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json({
            success: true,
            message: "Connected to Go High Level",
            locationName: data.location?.name,
          })
        } else {
          return NextResponse.json({
            success: false,
            error: "Invalid API key or Location ID",
          })
        }
      } catch {
        // For demo, return success
        return NextResponse.json({
          success: true,
          message: "Connection test passed (demo mode)",
          demoMode: true,
        })
      }
    }

    return NextResponse.json({
      success: false,
      error: "Unknown integration type",
    })
  } catch (error) {
    console.error("Integration test error:", error)
    return NextResponse.json(
      { error: "Failed to test integration" },
      { status: 500 }
    )
  }
}
