// DoorDash API integration with sandbox support
import jwt from "jsonwebtoken"

// DoorDash API URLs
const DOORDASH_PRODUCTION_URL = "https://openapi.doordash.com"
const DOORDASH_SANDBOX_URL = "https://openapi.doordash.com" // Same URL, different mode

export interface DoorDashConfig {
  developerId: string
  keyId: string
  signingSecret: string
  isSandbox: boolean
}

export interface DeliveryRequest {
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

export interface DeliveryQuote {
  externalDeliveryId: string
  fee: number
  currency: string
  estimatedPickupTime: string
  estimatedDeliveryTime: string
}

export interface DeliveryStatus {
  status: string
  trackingUrl: string
  dasherName?: string
  dasherPhone?: string
  estimatedPickupTime?: string
  estimatedDeliveryTime?: string
  pickupTimeActual?: string
  dropoffTimeActual?: string
}

// Generate DoorDash JWT token
export function generateDoorDashJWT(config: DoorDashConfig): string {
  const decodedAccessKey = Buffer.from(config.signingSecret, "base64")

  const header = {
    alg: "HS256",
    typ: "JWT",
    "dd-ver": "DD-JWT-V1",
  }

  const payload = {
    aud: "doordash",
    iss: config.developerId,
    kid: config.keyId,
    exp: Math.floor(Date.now() / 1000) + 300, // 5 min expiry
    iat: Math.floor(Date.now() / 1000),
  }

  return jwt.sign(payload, decodedAccessKey, { header })
}

// DoorDash API client
export class DoorDashClient {
  private config: DoorDashConfig
  private baseUrl: string

  constructor(config: DoorDashConfig) {
    this.config = config
    this.baseUrl = config.isSandbox ? DOORDASH_SANDBOX_URL : DOORDASH_PRODUCTION_URL
  }

  private getAuthHeader(): string {
    return `Bearer ${generateDoorDashJWT(this.config)}`
  }

  // Create a delivery
  async createDelivery(request: DeliveryRequest): Promise<{
    success: boolean
    deliveryId?: string
    trackingUrl?: string
    estimatedPickupTime?: string
    estimatedDeliveryTime?: string
    fee?: number
    error?: string
  }> {
    // In sandbox mode, simulate delivery creation with test data
    if (this.config.isSandbox) {
      return this.createSandboxDelivery(request)
    }

    try {
      const deliveryPayload = {
        external_delivery_id: `menutrail-${request.orderId}-${Date.now()}`,
        pickup_address: `${request.pickupAddress.street}, ${request.pickupAddress.city}, ${request.pickupAddress.state} ${request.pickupAddress.zip}`,
        pickup_business_name: request.pickupAddress.businessName,
        pickup_phone_number: request.pickupAddress.phoneNumber,
        pickup_instructions: request.pickupInstructions || "Order ready for pickup",
        dropoff_address: `${request.dropoffAddress.street}, ${request.dropoffAddress.city}, ${request.dropoffAddress.state} ${request.dropoffAddress.zip}`,
        dropoff_contact_given_name: request.dropoffAddress.firstName,
        dropoff_contact_family_name: request.dropoffAddress.lastName,
        dropoff_phone_number: request.dropoffAddress.phoneNumber,
        dropoff_instructions: request.dropoffInstructions || "Leave at door",
        order_value: Math.round(request.orderValue * 100),
        items: request.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
        })),
        tip: request.tip ? Math.round(request.tip * 100) : 0,
      }

      const response = await fetch(`${this.baseUrl}/drive/v2/deliveries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getAuthHeader(),
        },
        body: JSON.stringify(deliveryPayload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.message || "Failed to create delivery",
        }
      }

      const delivery = await response.json()
      return {
        success: true,
        deliveryId: delivery.external_delivery_id,
        trackingUrl: delivery.tracking_url,
        estimatedPickupTime: delivery.pickup_time_estimated,
        estimatedDeliveryTime: delivery.dropoff_time_estimated,
        fee: delivery.fee / 100,
      }
    } catch (error) {
      console.error("DoorDash API error:", error)
      return {
        success: false,
        error: "Failed to connect to DoorDash API",
      }
    }
  }

  // Sandbox mode: Simulate delivery creation
  private createSandboxDelivery(request: DeliveryRequest): {
    success: boolean
    deliveryId: string
    trackingUrl: string
    estimatedPickupTime: string
    estimatedDeliveryTime: string
    fee: number
    isSandbox: boolean
  } {
    const now = new Date()
    const pickupTime = new Date(now.getTime() + 15 * 60000) // 15 mins
    const deliveryTime = new Date(now.getTime() + 45 * 60000) // 45 mins

    const deliveryId = `sandbox-${request.orderId}-${Date.now()}`
    
    // Calculate simulated fee based on distance (just a rough estimate for demo)
    const baseFee = 5.99
    const distanceFee = Math.random() * 3 // Random 0-3 dollars
    const fee = Math.round((baseFee + distanceFee) * 100) / 100

    return {
      success: true,
      deliveryId,
      trackingUrl: `/track/${deliveryId}?sandbox=true`,
      estimatedPickupTime: pickupTime.toISOString(),
      estimatedDeliveryTime: deliveryTime.toISOString(),
      fee,
      isSandbox: true,
    }
  }

  // Get delivery status
  async getDeliveryStatus(deliveryId: string): Promise<DeliveryStatus | null> {
    // In sandbox mode, simulate status
    if (this.config.isSandbox || deliveryId.startsWith("sandbox-")) {
      return this.getSandboxDeliveryStatus(deliveryId)
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/drive/v2/deliveries/${deliveryId}`,
        {
          headers: {
            Authorization: this.getAuthHeader(),
          },
        }
      )

      if (!response.ok) {
        return null
      }

      const delivery = await response.json()
      return {
        status: delivery.delivery_status,
        trackingUrl: delivery.tracking_url,
        dasherName: delivery.dasher?.first_name,
        dasherPhone: delivery.dasher?.phone_number,
        estimatedPickupTime: delivery.pickup_time_estimated,
        estimatedDeliveryTime: delivery.dropoff_time_estimated,
      }
    } catch (error) {
      console.error("DoorDash status error:", error)
      return null
    }
  }

  // Sandbox mode: Simulate delivery status
  private getSandboxDeliveryStatus(deliveryId: string): DeliveryStatus {
    // Parse timestamp from delivery ID to calculate simulated progress
    const parts = deliveryId.split("-")
    const createdAt = parseInt(parts[parts.length - 1]) || Date.now()
    const elapsedMinutes = (Date.now() - createdAt) / 60000

    // Simulate status progression
    let status: string
    let dasherName: string | undefined
    let dasherPhone: string | undefined

    if (elapsedMinutes < 5) {
      status = "created"
    } else if (elapsedMinutes < 10) {
      status = "confirmed"
    } else if (elapsedMinutes < 15) {
      status = "dasher_confirmed"
      dasherName = "Alex"
      dasherPhone = "+1 (555) 123-4567"
    } else if (elapsedMinutes < 20) {
      status = "dasher_at_store"
      dasherName = "Alex"
      dasherPhone = "+1 (555) 123-4567"
    } else if (elapsedMinutes < 25) {
      status = "picked_up"
      dasherName = "Alex"
      dasherPhone = "+1 (555) 123-4567"
    } else if (elapsedMinutes < 35) {
      status = "enroute_to_consumer"
      dasherName = "Alex"
      dasherPhone = "+1 (555) 123-4567"
    } else if (elapsedMinutes < 45) {
      status = "arrived_at_consumer"
      dasherName = "Alex"
      dasherPhone = "+1 (555) 123-4567"
    } else {
      status = "delivered"
      dasherName = "Alex"
      dasherPhone = "+1 (555) 123-4567"
    }

    const now = new Date()
    return {
      status,
      trackingUrl: `/track/${deliveryId}?sandbox=true`,
      dasherName,
      dasherPhone,
      estimatedPickupTime: new Date(createdAt + 15 * 60000).toISOString(),
      estimatedDeliveryTime: new Date(createdAt + 45 * 60000).toISOString(),
    }
  }

  // Cancel delivery
  async cancelDelivery(deliveryId: string): Promise<boolean> {
    if (this.config.isSandbox || deliveryId.startsWith("sandbox-")) {
      return true // Always succeed in sandbox
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/drive/v2/deliveries/${deliveryId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: this.getAuthHeader(),
          },
        }
      )
      return response.ok
    } catch (error) {
      console.error("DoorDash cancel error:", error)
      return false
    }
  }

  // Get delivery quote (estimate before creating)
  async getDeliveryQuote(request: DeliveryRequest): Promise<DeliveryQuote | null> {
    if (this.config.isSandbox) {
      return {
        externalDeliveryId: `quote-${Date.now()}`,
        fee: 5.99 + Math.random() * 3,
        currency: "USD",
        estimatedPickupTime: new Date(Date.now() + 15 * 60000).toISOString(),
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60000).toISOString(),
      }
    }

    try {
      const quotePayload = {
        external_delivery_id: `quote-${request.orderId}-${Date.now()}`,
        pickup_address: `${request.pickupAddress.street}, ${request.pickupAddress.city}, ${request.pickupAddress.state} ${request.pickupAddress.zip}`,
        dropoff_address: `${request.dropoffAddress.street}, ${request.dropoffAddress.city}, ${request.dropoffAddress.state} ${request.dropoffAddress.zip}`,
        order_value: Math.round(request.orderValue * 100),
      }

      const response = await fetch(`${this.baseUrl}/drive/v2/deliveries/quotes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getAuthHeader(),
        },
        body: JSON.stringify(quotePayload),
      })

      if (!response.ok) {
        return null
      }

      const quote = await response.json()
      return {
        externalDeliveryId: quote.external_delivery_id,
        fee: quote.fee / 100,
        currency: quote.currency,
        estimatedPickupTime: quote.pickup_time_estimated,
        estimatedDeliveryTime: quote.dropoff_time_estimated,
      }
    } catch (error) {
      console.error("DoorDash quote error:", error)
      return null
    }
  }
}

// Helper to create client from environment or restaurant config
export function createDoorDashClient(options?: {
  developerId?: string
  keyId?: string
  signingSecret?: string
  isSandbox?: boolean
}): DoorDashClient | null {
  const developerId = options?.developerId || process.env.DOORDASH_DEVELOPER_ID
  const keyId = options?.keyId || process.env.DOORDASH_KEY_ID
  const signingSecret = options?.signingSecret || process.env.DOORDASH_SIGNING_SECRET
  const isSandbox = options?.isSandbox ?? process.env.DOORDASH_SANDBOX_MODE === "true"

  if (!developerId || !keyId || !signingSecret) {
    return null
  }

  return new DoorDashClient({
    developerId,
    keyId,
    signingSecret,
    isSandbox,
  })
}
