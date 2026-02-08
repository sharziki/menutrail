"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Check, Clock, MapPin, ChefHat, Truck, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import confetti from "canvas-confetti"

interface OrderDetails {
  orderId: string
  status: string
  orderType: "pickup" | "delivery"
  estimatedTime: string
  items: Array<{ name: string; quantity: number; price: number }>
  total: number
  trackingUrl?: string
}

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f97316", "#ef4444", "#22c55e"],
    })

    // In production, fetch order details from API using sessionId
    // For demo, show mock data
    setTimeout(() => {
      setOrder({
        orderId: `MT-${Date.now().toString(36).toUpperCase()}`,
        status: "confirmed",
        orderType: "delivery",
        estimatedTime: "35-45 min",
        items: [
          { name: "Truffle Mushroom Burger", quantity: 1, price: 18.99 },
          { name: "Sweet Potato Fries", quantity: 2, price: 6.99 },
          { name: "Craft Lemonade", quantity: 1, price: 4.99 },
        ],
        total: 42.95,
        trackingUrl: "https://track.doordash.com/demo",
      })
      setLoading(false)
    }, 1000)
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Processing your order...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Your order has been received and is being prepared.</p>
        </motion.div>

        {/* Order Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Order Number */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white text-center">
            <p className="text-sm opacity-80">Order Number</p>
            <p className="text-2xl font-mono font-bold">{order?.orderId}</p>
          </div>

          {/* Timeline */}
          <div className="p-6">
            <div className="space-y-6">
              <TimelineStep
                icon={Check}
                title="Order Confirmed"
                description="Your order has been received"
                status="completed"
              />
              <TimelineStep
                icon={ChefHat}
                title="Preparing"
                description="The kitchen is working on your order"
                status="current"
              />
              <TimelineStep
                icon={order?.orderType === "delivery" ? Truck : MapPin}
                title={order?.orderType === "delivery" ? "On the Way" : "Ready for Pickup"}
                description={
                  order?.orderType === "delivery"
                    ? "Your order will be delivered soon"
                    : "Head to the restaurant to pick up your order"
                }
                status="pending"
              />
            </div>

            {/* Estimated Time */}
            <div className="mt-8 p-4 bg-orange-50 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-700">Estimated Time</p>
                <p className="text-xl font-bold text-orange-900">{order?.estimatedTime}</p>
              </div>
            </div>

            {/* Track Order */}
            {order?.orderType === "delivery" && order?.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 p-4 bg-red-50 rounded-xl text-red-700 hover:bg-red-100 transition"
              >
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  DD
                </div>
                <span className="font-medium">Track with DoorDash</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-100 p-6">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {order?.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-600">
                    {item.quantity}× {item.name}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>${order?.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 space-y-3"
        >
          <Link href="/demo" className="block">
            <Button variant="outline" className="w-full">
              Order Again
            </Button>
          </Link>
          <p className="text-center text-sm text-gray-500">
            Need help? <a href="#" className="text-orange-600 hover:underline">Contact Support</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}

function TimelineStep({
  icon: Icon,
  title,
  description,
  status,
}: {
  icon: React.ElementType
  title: string
  description: string
  status: "completed" | "current" | "pending"
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            status === "completed"
              ? "bg-green-500 text-white"
              : status === "current"
              ? "bg-orange-500 text-white"
              : "bg-gray-200 text-gray-400"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div
          className={`w-0.5 h-full mt-2 ${
            status === "completed" ? "bg-green-500" : "bg-gray-200"
          }`}
        />
      </div>
      <div className="pb-6">
        <h4
          className={`font-medium ${
            status === "pending" ? "text-gray-400" : "text-gray-900"
          }`}
        >
          {title}
        </h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  )
}
