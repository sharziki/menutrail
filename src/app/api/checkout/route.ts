import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Lazy init to avoid build-time errors when env vars not set
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, orderType, deliveryAddress, tip, restaurantId } = body

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => 
        sum + item.price * item.quantity,
      0
    )
    const tax = subtotal * 0.08 // 8% tax
    const deliveryFee = orderType === "delivery" ? 4.99 : 0
    const tipAmount = tip || 0
    // Total calculated for reference
    const _total = subtotal + tax + deliveryFee + tipAmount
    void _total // Stripe calculates from line items

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
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/cancel`,
      metadata: {
        restaurantId,
        orderType,
        deliveryAddress: deliveryAddress ? JSON.stringify(deliveryAddress) : "",
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
