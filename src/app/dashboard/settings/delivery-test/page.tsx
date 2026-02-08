"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Play,
  Loader2,
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  Package,
  User,
  Phone,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SandboxDelivery {
  deliveryId: string
  status: string
  trackingUrl: string
  estimatedPickupTime: string
  estimatedDeliveryTime: string
  fee: number
  dasherName?: string
  dasherPhone?: string
}

const STATUS_INFO: Record<string, { label: string; color: string; icon: typeof Package }> = {
  created: { label: "Order Created", color: "text-gray-500", icon: Package },
  confirmed: { label: "Confirmed", color: "text-blue-500", icon: CheckCircle2 },
  dasher_confirmed: { label: "Dasher Assigned", color: "text-purple-500", icon: User },
  dasher_at_store: { label: "Dasher at Restaurant", color: "text-orange-500", icon: MapPin },
  picked_up: { label: "Picked Up", color: "text-yellow-500", icon: Package },
  enroute_to_consumer: { label: "On the Way", color: "text-blue-600", icon: Truck },
  arrived_at_consumer: { label: "Arriving Now", color: "text-green-500", icon: MapPin },
  delivered: { label: "Delivered!", color: "text-green-600", icon: CheckCircle2 },
}

export default function DeliveryTestPage() {
  const [delivery, setDelivery] = useState<SandboxDelivery | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [testData, setTestData] = useState({
    customerName: "John Doe",
    customerPhone: "(555) 123-4567",
    street: "123 Test Street",
    city: "San Francisco",
    state: "CA",
    zip: "94102",
  })

  const createTestDelivery = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/delivery/doordash/sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: `test-${Date.now()}`,
          pickupAddress: {
            street: "456 Restaurant Ave",
            city: "San Francisco",
            state: "CA",
            zip: "94102",
            businessName: "Demo Restaurant",
            phoneNumber: "+1 (555) 000-0001",
          },
          dropoffAddress: {
            street: testData.street,
            city: testData.city,
            state: testData.state,
            zip: testData.zip,
            firstName: testData.customerName.split(" ")[0],
            lastName: testData.customerName.split(" ")[1] || "",
            phoneNumber: testData.customerPhone,
          },
          orderValue: 42.50,
          items: [
            { name: "Truffle Mushroom Burger", quantity: 1 },
            { name: "Sweet Potato Fries", quantity: 1 },
            { name: "Craft Lemonade", quantity: 2 },
          ],
        }),
      })
      const data = await res.json()
      if (data.success) {
        setDelivery({
          deliveryId: data.deliveryId,
          status: "created",
          trackingUrl: data.trackingUrl,
          estimatedPickupTime: data.estimatedPickupTime,
          estimatedDeliveryTime: data.estimatedDeliveryTime,
          fee: data.fee,
        })
      }
    } catch (error) {
      console.error("Failed to create test delivery:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshStatus = async () => {
    if (!delivery) return
    setRefreshing(true)
    try {
      const res = await fetch(`/api/delivery/doordash/sandbox?id=${delivery.deliveryId}`)
      const data = await res.json()
      setDelivery({
        ...delivery,
        status: data.status,
        dasherName: data.dasherName,
        dasherPhone: data.dasherPhone,
      })
    } catch (error) {
      console.error("Failed to refresh status:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const resetTest = () => {
    setDelivery(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Delivery Sandbox</h1>
            <p className="text-sm text-gray-500">Test DoorDash delivery flow</p>
          </div>
          <Badge className="ml-auto bg-amber-100 text-amber-700">
            Sandbox Mode
          </Badge>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!delivery ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Info Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h3 className="font-medium text-amber-800 mb-2">Sandbox Testing</h3>
                <p className="text-sm text-amber-700">
                  Create a test delivery to see how the DoorDash integration works.
                  The delivery status will automatically progress through all stages.
                </p>
              </div>

              {/* Test Customer Form */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <h2 className="font-semibold">Test Customer Info</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Customer Name</Label>
                    <Input
                      value={testData.customerName}
                      onChange={(e) => setTestData({ ...testData, customerName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={testData.customerPhone}
                      onChange={(e) => setTestData({ ...testData, customerPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Street Address</Label>
                  <Input
                    value={testData.street}
                    onChange={(e) => setTestData({ ...testData, street: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={testData.city}
                      onChange={(e) => setTestData({ ...testData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      value={testData.state}
                      onChange={(e) => setTestData({ ...testData, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>ZIP</Label>
                    <Input
                      value={testData.zip}
                      onChange={(e) => setTestData({ ...testData, zip: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Test Order Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold mb-4">Test Order Items</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>1× Truffle Mushroom Burger</span>
                    <span>$18.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1× Sweet Potato Fries</span>
                    <span>$6.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2× Craft Lemonade</span>
                    <span>$9.98</span>
                  </div>
                  <div className="border-t pt-2 mt-2 font-medium flex justify-between">
                    <span>Subtotal</span>
                    <span>$35.96</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={createTestDelivery}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Test Delivery...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Test Delivery
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Status Card */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-orange-500 to-red-600 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-white/20 text-white">Sandbox Delivery</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onClick={refreshStatus}
                      disabled={refreshing}
                    >
                      <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
                      Refresh
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const info = STATUS_INFO[delivery.status] || STATUS_INFO.created
                      const Icon = info.icon
                      return <Icon className="w-8 h-8" />
                    })()}
                    <div>
                      <h2 className="text-2xl font-bold">
                        {STATUS_INFO[delivery.status]?.label || delivery.status}
                      </h2>
                      <p className="text-white/80 text-sm">
                        ID: {delivery.deliveryId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="p-6">
                  <h3 className="font-medium mb-4">Delivery Progress</h3>
                  <div className="space-y-3">
                    {Object.entries(STATUS_INFO).map(([key, info], index) => {
                      const statusIndex = Object.keys(STATUS_INFO).indexOf(delivery.status)
                      const thisIndex = index
                      const isComplete = thisIndex <= statusIndex
                      const isCurrent = key === delivery.status
                      const Icon = info.icon

                      return (
                        <div
                          key={key}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg transition",
                            isCurrent && "bg-orange-50 border border-orange-200",
                            isComplete && !isCurrent && "opacity-50"
                          )}
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              isComplete ? "bg-green-100" : "bg-gray-100"
                            )}
                          >
                            {isComplete ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <Icon className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <span className={cn("font-medium", isCurrent && "text-orange-600")}>
                            {info.label}
                          </span>
                          {isCurrent && (
                            <Badge className="ml-auto bg-orange-100 text-orange-700">Current</Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Dasher Info */}
              {delivery.dasherName && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <h3 className="font-medium mb-4">Your Dasher</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {delivery.dasherName[0]}
                    </div>
                    <div>
                      <p className="font-medium">{delivery.dasherName}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {delivery.dasherPhone}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Timing */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-medium mb-4">Estimated Times</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pickup</p>
                      <p className="font-medium">
                        {new Date(delivery.estimatedPickupTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Delivery</p>
                      <p className="font-medium">
                        {new Date(delivery.estimatedDeliveryTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-bold text-lg">${delivery.fee.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={resetTest} className="flex-1">
                  Start New Test
                </Button>
                <Link href={delivery.trackingUrl} className="flex-1">
                  <Button className="w-full">View Tracking Page</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
