// Go High Level CRM Integration
// Docs: https://highlevel.stoplight.io/docs/integrations

export interface GHLConfig {
  apiKey: string
  locationId: string
}

export interface GHLContact {
  id?: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  address1?: string
  city?: string
  state?: string
  postalCode?: string
  tags?: string[]
  customFields?: Record<string, string>
}

export interface GHLNote {
  body: string
}

export interface OrderData {
  orderId: string
  orderNumber: string
  items: Array<{ name: string; quantity: number; price: number }>
  subtotal: number
  tax: number
  total: number
  orderType: "DINE_IN" | "PICKUP" | "DELIVERY"
  createdAt: Date
}

const GHL_API_BASE = "https://rest.gohighlevel.com/v1"

export class GoHighLevelClient {
  private config: GHLConfig

  constructor(config: GHLConfig) {
    this.config = config
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | null> {
    try {
      const response = await fetch(`${GHL_API_BASE}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        console.error("GHL API error:", response.status, error)
        return null
      }

      return response.json()
    } catch (error) {
      console.error("GHL request error:", error)
      return null
    }
  }

  // Search for existing contact by phone
  async findContactByPhone(phone: string): Promise<GHLContact | null> {
    // Normalize phone number
    const normalizedPhone = phone.replace(/\D/g, "")
    
    const result = await this.request<{ contacts: GHLContact[] }>(
      `/contacts/lookup?phone=${encodeURIComponent(normalizedPhone)}`
    )

    if (result?.contacts && result.contacts.length > 0) {
      return result.contacts[0]
    }

    return null
  }

  // Search for existing contact by email
  async findContactByEmail(email: string): Promise<GHLContact | null> {
    const result = await this.request<{ contacts: GHLContact[] }>(
      `/contacts/lookup?email=${encodeURIComponent(email)}`
    )

    if (result?.contacts && result.contacts.length > 0) {
      return result.contacts[0]
    }

    return null
  }

  // Create a new contact
  async createContact(contact: GHLContact): Promise<GHLContact | null> {
    const payload = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      address1: contact.address1,
      city: contact.city,
      state: contact.state,
      postalCode: contact.postalCode,
      tags: contact.tags || ["MenuTrail Customer"],
      locationId: this.config.locationId,
      customField: contact.customFields,
    }

    return this.request<GHLContact>("/contacts/", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  // Update existing contact
  async updateContact(
    contactId: string,
    updates: Partial<GHLContact>
  ): Promise<GHLContact | null> {
    const payload: Record<string, unknown> = {}
    
    if (updates.firstName) payload.firstName = updates.firstName
    if (updates.lastName) payload.lastName = updates.lastName
    if (updates.email) payload.email = updates.email
    if (updates.phone) payload.phone = updates.phone
    if (updates.address1) payload.address1 = updates.address1
    if (updates.city) payload.city = updates.city
    if (updates.state) payload.state = updates.state
    if (updates.postalCode) payload.postalCode = updates.postalCode
    if (updates.tags) payload.tags = updates.tags
    if (updates.customFields) payload.customField = updates.customFields

    return this.request<GHLContact>(`/contacts/${contactId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  }

  // Add note to contact
  async addContactNote(contactId: string, note: string): Promise<boolean> {
    const result = await this.request(`/contacts/${contactId}/notes`, {
      method: "POST",
      body: JSON.stringify({ body: note }),
    })
    return result !== null
  }

  // Add tag to contact
  async addTag(contactId: string, tag: string): Promise<boolean> {
    const result = await this.request(`/contacts/${contactId}/tags`, {
      method: "POST",
      body: JSON.stringify({ tags: [tag] }),
    })
    return result !== null
  }

  // Get contact's order history count (using custom field or notes)
  async getOrderCount(contactId: string): Promise<number> {
    // We'll track this via custom field
    const contact = await this.request<GHLContact>(`/contacts/${contactId}`)
    if (!contact?.customFields?.menutrail_order_count) {
      return 0
    }
    return parseInt(contact.customFields.menutrail_order_count) || 0
  }

  // Create or update contact on order
  async syncOrderToContact(
    customerInfo: {
      firstName: string
      lastName: string
      email?: string
      phone: string
      address?: {
        street?: string
        city?: string
        state?: string
        zip?: string
      }
    },
    orderData: OrderData
  ): Promise<{ contactId: string; orderNumber: number } | null> {
    try {
      // Try to find existing contact by phone first, then email
      let contact = await this.findContactByPhone(customerInfo.phone)
      
      if (!contact && customerInfo.email) {
        contact = await this.findContactByEmail(customerInfo.email)
      }

      let orderCount = 1
      let contactId: string

      if (contact && contact.id) {
        // Update existing contact
        contactId = contact.id
        orderCount = await this.getOrderCount(contactId) + 1

        // Update contact with latest info
        await this.updateContact(contactId, {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          address1: customerInfo.address?.street,
          city: customerInfo.address?.city,
          state: customerInfo.address?.state,
          postalCode: customerInfo.address?.zip,
          customFields: {
            menutrail_order_count: orderCount.toString(),
            menutrail_last_order: new Date().toISOString(),
          },
        })

        // Add repeat customer tag if appropriate
        if (orderCount === 2) {
          await this.addTag(contactId, "Repeat Customer")
        } else if (orderCount === 5) {
          await this.addTag(contactId, "Loyal Customer")
        } else if (orderCount === 10) {
          await this.addTag(contactId, "VIP Customer")
        }
      } else {
        // Create new contact
        const newContact = await this.createContact({
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address1: customerInfo.address?.street,
          city: customerInfo.address?.city,
          state: customerInfo.address?.state,
          postalCode: customerInfo.address?.zip,
          tags: ["MenuTrail Customer", "New Customer"],
          customFields: {
            menutrail_order_count: "1",
            menutrail_first_order: new Date().toISOString(),
            menutrail_last_order: new Date().toISOString(),
          },
        })

        if (!newContact?.id) {
          console.error("Failed to create GHL contact")
          return null
        }

        contactId = newContact.id
      }

      // Format order items for note
      const itemsList = orderData.items
        .map((item) => `  • ${item.name} x${item.quantity} - $${item.price.toFixed(2)}`)
        .join("\n")

      // Create order note
      const orderNote = `📦 Order #${orderData.orderNumber}
Type: ${orderData.orderType.replace("_", " ")}
Date: ${new Date(orderData.createdAt).toLocaleString()}

Items Ordered:
${itemsList}

Subtotal: $${orderData.subtotal.toFixed(2)}
Tax: $${orderData.tax.toFixed(2)}
Total: $${orderData.total.toFixed(2)}

🔢 Order ${orderCount} out of ${orderCount} total orders`

      await this.addContactNote(contactId, orderNote)

      return { contactId, orderNumber: orderCount }
    } catch (error) {
      console.error("GHL sync error:", error)
      return null
    }
  }
}

// Create client from environment or restaurant config
export function createGHLClient(options?: {
  apiKey?: string
  locationId?: string
}): GoHighLevelClient | null {
  const apiKey = options?.apiKey || process.env.GHL_API_KEY
  const locationId = options?.locationId || process.env.GHL_LOCATION_ID

  if (!apiKey || !locationId) {
    return null
  }

  return new GoHighLevelClient({ apiKey, locationId })
}
