import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Lazy init to avoid build-time errors when env vars not set
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

// Sync order to Go High Level CRM
async function syncToGHL(
  contactInfo: { firstName: string; lastName: string; email: string; phone: string },
  deliveryAddress: { street: string; city: string; state: string; zip: string } | null,
  items: { name: string; price: number; quantity: number }[],
  orderType: string,
  subtotal: number,
  tax: number,
  total: number
) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/ghl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerInfo: {
          firstName: contactInfo.firstName,
          lastName: contactInfo.lastName,
          email: contactInfo.email,
          phone: contactInfo.phone,
          address: deliveryAddress ? {
            street: deliveryAddress.street,
            city: deliveryAddress.city,
            state: deliveryAddress.state,
            zip: deliveryAddress.zip,
          } : undefined,
        },
        orderData: {
          orderId: `order-${Date.now()}`,
          orderNumber: `MT-${Date.now().toString(36).toUpperCase()}`,
          items: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal,
          tax,
          total,
          orderType: orderType.toUpperCase(),
          createdAt: new Date(),
        },
      }),
    })
  } catch (error) {
    console.error("GHL sync error (non-blocking):", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, orderType, deliveryAddress, contactInfo, tip, restaurantId, giftCardCode, giftCardAmount } = body

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => 
        sum + item.price * item.quantity,
      0
    )
    const tax = subtotal * 0.08 // 8% tax
    const deliveryFee = orderType === "delivery" ? 4.99 : 0
    const tipAmount = tip || 0
    const giftCardDiscount = giftCardAmount || 0
    // Total calculated for reference
    const _total = Math.max(0, subtotal + tax + deliveryFee + tipAmount - giftCardDiscount)
    void _total // Stripe calculates from line items

    // Sync to GHL (non-blocking)
    if (contactInfo) {
      syncToGHL(
        contactInfo,
        orderType === "delivery" ? deliveryAddress : null,
        items,
        orderType,
        subtotal,
        tax,
        _total
      )
    }

    // Create Stripe checkout session
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        ...items.map((item: { name: string; price: number; quantity: number; image?: string }) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
              images: item.image ? [item.image] : [],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        // Tax
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Tax" },
            unit_amount: Math.round(tax * 100),
          },
          quantity: 1,
        },
        // Delivery fee if applicable
        ...(orderType === "delivery"
          ? [
              {
                price_data: {
                  currency: "usd",
                  product_data: { name: "Delivery Fee" },
                  unit_amount: Math.round(deliveryFee * 100),
                },
                quantity: 1,
              },
            ]
          : []),
        // Tip if applicable
        ...(tipAmount > 0
          ? [
              {
                price_data: {
                  currency: "usd",
                  product_data: { name: "Tip" },
                  unit_amount: Math.round(tipAmount * 100),
                },
                quantity: 1,
              },
            ]
          : []),
        // Gift card discount if applicable
        ...(giftCardDiscount > 0
          ? [
              {
                price_data: {
                  currency: "usd",
                  product_data: { name: "Gift Card Discount" },
                  unit_amount: -Math.round(giftCardDiscount * 100),
                },
                quantity: 1,
              },
            ]
          : []),
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/cancel`,
      metadata: {
        restaurantId,
        orderType,
        deliveryAddress: deliveryAddress ? JSON.stringify(deliveryAddress) : "",
        giftCardCode: giftCardCode || "",
        giftCardAmount: giftCardDiscount.toString(),
        contactInfo: contactInfo ? JSON.stringify(contactInfo) : "",
      },
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
