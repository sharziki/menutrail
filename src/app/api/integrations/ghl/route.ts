import { NextRequest, NextResponse } from "next/server"

// Go High Level CRM Sync Endpoint
// Syncs order data to GHL contacts

interface GHLContact {
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

// In-memory store for demo mode
const demoContacts = new Map<string, GHLContact & { orderCount: number; notes: string[] }>()

const GHL_API_BASE = "https://rest.gohighlevel.com/v1"

// POST - Sync order to GHL contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerInfo,
      orderData,
      ghlApiKey,
      ghlLocationId,
    } = body

    // Validate required fields
    if (!customerInfo?.phone) {
      return NextResponse.json(
        { error: "Customer phone number required" },
        { status: 400 }
      )
    }

    // Demo mode - no API key configured
    if (!ghlApiKey && !process.env.GHL_API_KEY) {
      return handleDemoMode(customerInfo, orderData)
    }

    const apiKey = ghlApiKey || process.env.GHL_API_KEY
    const locationId = ghlLocationId || process.env.GHL_LOCATION_ID

    if (!locationId) {
      return NextResponse.json(
        { error: "GHL Location ID required" },
        { status: 400 }
      )
    }

    // Search for existing contact
    const normalizedPhone = customerInfo.phone.replace(/\D/g, "")
    
    let contactId: string | null = null
    let orderCount = 1

    // Try to find by phone
    const searchResponse = await fetch(
      `${GHL_API_BASE}/contacts/lookup?phone=${encodeURIComponent(normalizedPhone)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (searchResponse.ok) {
      const searchData = await searchResponse.json()
      if (searchData.contacts?.length > 0) {
        contactId = searchData.contacts[0].id
        orderCount = parseInt(searchData.contacts[0].customField?.menutrail_order_count || "0") + 1
      }
    }

    // If not found by phone, try email
    if (!contactId && customerInfo.email) {
      const emailSearchResponse = await fetch(
        `${GHL_API_BASE}/contacts/lookup?email=${encodeURIComponent(customerInfo.email)}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (emailSearchResponse.ok) {
        const emailSearchData = await emailSearchResponse.json()
        if (emailSearchData.contacts?.length > 0) {
          contactId = emailSearchData.contacts[0].id
          orderCount = parseInt(emailSearchData.contacts[0].customField?.menutrail_order_count || "0") + 1
        }
      }
    }

    const customFields = {
      menutrail_order_count: orderCount.toString(),
      menutrail_last_order: new Date().toISOString(),
    }

    if (contactId) {
      // Update existing contact
      await fetch(`${GHL_API_BASE}/contacts/${contactId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          address1: customerInfo.address?.street,
          city: customerInfo.address?.city,
          state: customerInfo.address?.state,
          postalCode: customerInfo.address?.zip,
          customField: customFields,
        }),
      })

      // Add loyalty tags
      const tags: string[] = []
      if (orderCount === 2) tags.push("Repeat Customer")
      if (orderCount === 5) tags.push("Loyal Customer")
      if (orderCount === 10) tags.push("VIP Customer")

      if (tags.length > 0) {
        await fetch(`${GHL_API_BASE}/contacts/${contactId}/tags`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tags }),
        })
      }
    } else {
      // Create new contact
      const createResponse = await fetch(`${GHL_API_BASE}/contacts/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address1: customerInfo.address?.street,
          city: customerInfo.address?.city,
          state: customerInfo.address?.state,
          postalCode: customerInfo.address?.zip,
          tags: ["MenuTrail Customer", "New Customer"],
          locationId,
          customField: {
            ...customFields,
            menutrail_first_order: new Date().toISOString(),
          },
        }),
      })

      if (createResponse.ok) {
        const createData = await createResponse.json()
        contactId = createData.contact?.id
      }
    }

    if (!contactId) {
      return NextResponse.json(
        { error: "Failed to create or find contact in GHL" },
        { status: 500 }
      )
    }

    // Add order note
    const orderNote = formatOrderNote(orderData, orderCount)
    await fetch(`${GHL_API_BASE}/contacts/${contactId}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body: orderNote }),
    })

    return NextResponse.json({
      success: true,
      contactId,
      orderNumber: orderCount,
      message: orderCount === 1 
        ? "New contact created in Go High Level" 
        : `Contact updated - Order ${orderCount}`,
    })
  } catch (error) {
    console.error("GHL sync error:", error)
    return NextResponse.json(
      { error: "Failed to sync with Go High Level" },
      { status: 500 }
    )
  }
}

// Demo mode handler
function handleDemoMode(customerInfo: any, orderData: any) {
  const phoneKey = customerInfo.phone.replace(/\D/g, "")
  
  let contact = demoContacts.get(phoneKey)
  let orderCount = 1

  if (contact) {
    // Update existing contact
    orderCount = contact.orderCount + 1
    contact.orderCount = orderCount
    contact.firstName = customerInfo.firstName
    contact.lastName = customerInfo.lastName
    contact.email = customerInfo.email
    contact.address1 = customerInfo.address?.street
    contact.city = customerInfo.address?.city
    contact.state = customerInfo.address?.state
    contact.postalCode = customerInfo.address?.zip
    
    // Add tags based on order count
    if (orderCount === 2 && !contact.tags?.includes("Repeat Customer")) {
      contact.tags = [...(contact.tags || []), "Repeat Customer"]
    }
    if (orderCount === 5 && !contact.tags?.includes("Loyal Customer")) {
      contact.tags = [...(contact.tags || []), "Loyal Customer"]
    }
    if (orderCount === 10 && !contact.tags?.includes("VIP Customer")) {
      contact.tags = [...(contact.tags || []), "VIP Customer"]
    }

    contact.notes.push(formatOrderNote(orderData, orderCount))
    demoContacts.set(phoneKey, contact)
  } else {
    // Create new contact
    contact = {
      id: `demo_${Date.now()}`,
      firstName: customerInfo.firstName,
      lastName: customerInfo.lastName,
      email: customerInfo.email,
      phone: customerInfo.phone,
      address1: customerInfo.address?.street,
      city: customerInfo.address?.city,
      state: customerInfo.address?.state,
      postalCode: customerInfo.address?.zip,
      tags: ["MenuTrail Customer", "New Customer"],
      orderCount: 1,
      notes: [formatOrderNote(orderData, 1)],
    }
    demoContacts.set(phoneKey, contact)
  }

  return NextResponse.json({
    success: true,
    contactId: contact.id,
    orderNumber: orderCount,
    demoMode: true,
    message: orderCount === 1 
      ? "Demo: New contact created" 
      : `Demo: Contact updated - Order ${orderCount}`,
  })
}

// Format order as note
function formatOrderNote(orderData: any, orderCount: number): string {
  const itemsList = orderData.items
    ?.map((item: any) => `  • ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`)
    .join("\n") || "  (No items)"

  return `📦 Order #${orderData.orderNumber || orderData.orderId || "N/A"}
Type: ${(orderData.orderType || "PICKUP").replace("_", " ")}
Date: ${new Date(orderData.createdAt || Date.now()).toLocaleString()}

Items Ordered:
${itemsList}

Subtotal: $${(orderData.subtotal || 0).toFixed(2)}
Tax: $${(orderData.tax || 0).toFixed(2)}
Total: $${(orderData.total || 0).toFixed(2)}

🔢 Order ${orderCount} out of ${orderCount} total orders`
}

// GET - Get contact by phone or list demo contacts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const phone = searchParams.get("phone")
  const listDemo = searchParams.get("demo") === "true"

  if (listDemo) {
    const contacts = Array.from(demoContacts.values())
    return NextResponse.json({ contacts, demoMode: true })
  }

  if (!phone) {
    return NextResponse.json(
      { error: "Phone number required" },
      { status: 400 }
    )
  }

  const phoneKey = phone.replace(/\D/g, "")
  const contact = demoContacts.get(phoneKey)

  if (!contact) {
    return NextResponse.json({ found: false })
  }

  return NextResponse.json({
    found: true,
    contact: {
      ...contact,
      notes: undefined, // Don't expose notes in lookup
    },
    orderCount: contact.orderCount,
    demoMode: true,
  })
}
