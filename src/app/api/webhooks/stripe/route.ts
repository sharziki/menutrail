import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"

// Lazy init to avoid build-time errors
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      
      // Extract order details from metadata
      const { restaurantId, orderType, deliveryAddress } = session.metadata || {}
      
      console.log("Order completed:", {
        sessionId: session.id,
        customerEmail: session.customer_details?.email,
        amount: session.amount_total,
        restaurantId,
        orderType,
      })

      // TODO: Create order in database
      // const order = await prisma.order.create({
      //   data: {
      //     stripeSessionId: session.id,
      //     restaurantId,
      //     customerEmail: session.customer_details?.email,
      //     customerName: session.customer_details?.name,
      //     customerPhone: session.customer_details?.phone,
      //     orderType,
      //     deliveryAddress: deliveryAddress ? JSON.parse(deliveryAddress) : null,
      //     total: session.amount_total ? session.amount_total / 100 : 0,
      //     status: 'confirmed',
      //   },
      // })

      // If delivery, create DoorDash delivery
      if (orderType === "delivery" && deliveryAddress) {
        try {
          const parsedAddress = JSON.parse(deliveryAddress)
          // TODO: Call DoorDash API to create delivery
          // await fetch('/api/delivery/doordash', { ... })
          console.log("Creating DoorDash delivery for:", parsedAddress)
        } catch (error) {
          console.error("Failed to create DoorDash delivery:", error)
        }
      }

      // TODO: Send confirmation email
      // await sendOrderConfirmationEmail(session.customer_details?.email, order)

      // TODO: Notify restaurant (WebSocket, Push, SMS)
      // await notifyRestaurant(restaurantId, order)

      break
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session
      console.log("Checkout session expired:", session.id)
      // TODO: Clean up any pending order records
      break
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log("Payment failed:", paymentIntent.id)
      // TODO: Notify customer of failed payment
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
