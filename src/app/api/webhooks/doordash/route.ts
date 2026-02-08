import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// DoorDash Drive Webhook Handler
// Docs: https://developer.doordash.com/en-US/docs/drive/reference/webhooks

interface DoorDashWebhookEvent {
  event_id: string
  event_type: string
  event_time: string
  delivery_id: string
  external_delivery_id: string
  data: {
    delivery_status?: string
    dasher_id?: number
    dasher_name?: string
    dasher_phone_number?: string
    dasher_vehicle_make?: string
    dasher_vehicle_model?: string
    dasher_vehicle_year?: number
    dasher_location_lat?: number
    dasher_location_lng?: number
    pickup_time_actual?: string
    dropoff_time_actual?: string
    dropoff_time_estimated?: string
    cancellation_reason?: string
    support_reference?: string
  }
}

// Verify DoorDash webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(payload)
  const expectedSignature = hmac.digest("hex")
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

// Map DoorDash status to our internal status
function mapDeliveryStatus(doordashStatus: string): string {
  const statusMap: Record<string, string> = {
    "created": "confirmed",
    "confirmed": "dasher_confirmed",
    "enroute_to_pickup": "dasher_enroute_to_pickup",
    "arrived_at_pickup": "dasher_at_pickup",
    "picked_up": "dasher_picked_up",
    "enroute_to_dropoff": "dasher_enroute_to_dropoff",
    "arrived_at_dropoff": "dasher_at_dropoff",
    "delivered": "delivered",
    "cancelled": "cancelled",
  }
  return statusMap[doordashStatus] || doordashStatus
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get("x-doordash-signature")
    
    // Verify signature in production
    if (process.env.DOORDASH_WEBHOOK_SECRET && signature) {
      const isValid = verifySignature(
        payload,
        signature,
        process.env.DOORDASH_WEBHOOK_SECRET
      )
      if (!isValid) {
        console.error("Invalid DoorDash webhook signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const event: DoorDashWebhookEvent = JSON.parse(payload)
    console.log("DoorDash webhook received:", event.event_type, event.delivery_id)

    // Extract order ID from external_delivery_id (format: menutrail-{orderId}-{timestamp})
    const [, orderId] = event.external_delivery_id.split("-")

    switch (event.event_type) {
      case "DELIVERY_STATUS_UPDATED": {
        const status = mapDeliveryStatus(event.data.delivery_status || "")
        
        // TODO: Update order in database
        // await prisma.order.update({
        //   where: { id: orderId },
        //   data: {
        //     deliveryStatus: status,
        //     estimatedDelivery: event.data.dropoff_time_estimated 
        //       ? new Date(event.data.dropoff_time_estimated) 
        //       : undefined,
        //   },
        // })

        // TODO: Push real-time update to customer
        // await pusher.trigger(`order-${orderId}`, 'status-update', {
        //   status,
        //   estimatedDelivery: event.data.dropoff_time_estimated,
        // })

        console.log(`Order ${orderId} status updated to: ${status}`)
        break
      }

      case "DASHER_ASSIGNED": {
        // TODO: Store dasher info
        // await prisma.order.update({
        //   where: { id: orderId },
        //   data: {
        //     dasherName: event.data.dasher_name,
        //     dasherPhone: event.data.dasher_phone_number,
        //     dasherVehicle: `${event.data.dasher_vehicle_make} ${event.data.dasher_vehicle_model}`,
        //   },
        // })

        console.log(`Dasher ${event.data.dasher_name} assigned to order ${orderId}`)
        break
      }

      case "DASHER_LOCATION_UPDATED": {
        // TODO: Push location update to customer
        // await pusher.trigger(`order-${orderId}`, 'location-update', {
        //   lat: event.data.dasher_location_lat,
        //   lng: event.data.dasher_location_lng,
        // })

        console.log(`Dasher location updated for order ${orderId}:`, 
          event.data.dasher_location_lat, 
          event.data.dasher_location_lng
        )
        break
      }

      case "DELIVERY_PICKED_UP": {
        // TODO: Notify customer
        // await sendPushNotification(order.customerId, {
        //   title: "Your order is on the way!",
        //   body: `${event.data.dasher_name} picked up your order and is headed your way.`,
        // })

        console.log(`Order ${orderId} picked up`)
        break
      }

      case "DELIVERY_DELIVERED": {
        // TODO: Update order status and send receipt
        // await prisma.order.update({
        //   where: { id: orderId },
        //   data: { 
        //     status: 'completed',
        //     deliveredAt: new Date(),
        //   },
        // })
        // await sendReceiptEmail(order.customerEmail, order)

        console.log(`Order ${orderId} delivered`)
        break
      }

      case "DELIVERY_CANCELLED": {
        // TODO: Handle cancellation, refund if needed
        // await prisma.order.update({
        //   where: { id: orderId },
        //   data: { 
        //     status: 'cancelled',
        //     cancellationReason: event.data.cancellation_reason,
        //   },
        // })
        // await notifyCustomerOfCancellation(order, event.data.cancellation_reason)

        console.log(`Order ${orderId} cancelled:`, event.data.cancellation_reason)
        break
      }

      default:
        console.log("Unhandled DoorDash event type:", event.event_type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("DoorDash webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

// DoorDash also sends GET requests to verify webhook URL
export async function GET() {
  return NextResponse.json({ status: "ok" })
}
