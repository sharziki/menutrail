"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Check, 
  ChefHat, 
  Truck, 
  Home,
  Phone,
  MapPin,
  Clock,
  Package,
  Navigation,
  Star,
  MessageCircle,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type DeliveryStatus = 
  | "confirmed" 
  | "preparing" 
  | "ready_for_pickup"
  | "dasher_confirmed"
  | "dasher_enroute_to_pickup"
  | "dasher_at_pickup"
  | "dasher_picked_up"
  | "dasher_enroute_to_dropoff"
  | "dasher_at_dropoff"
  | "delivered"
  | "cancelled"

interface DasherInfo {
  name: string
  phone: string
  photoUrl?: string
  rating: number
  vehicleType: string
  vehicleMake?: string
  vehicleModel?: string
  licensePlate?: string
}

interface TrackingInfo {
  orderId: string
  orderNumber: string
  status: DeliveryStatus
  estimatedDelivery: Date
  placedAt: Date
  items: Array<{ name: string; quantity: number }>
  restaurant: {
    name: string
    address: string
    phone: string
  }
  deliveryAddress: {
    street: string
    apt?: string
    city: string
    state: string
    zip: string
  }
  dasher?: DasherInfo
  dasherLocation?: {
    lat: number
    lng: number
    heading: number
    lastUpdated: Date
  }
  timeline: Array<{
    status: string
    timestamp: Date
    description: string
  }>
}

// Demo tracking data
const DEMO_TRACKING: TrackingInfo = {
  orderId: "MT-001",
  orderNumber: "MT-001",
  status: "dasher_enroute_to_dropoff",
  estimatedDelivery: new Date(Date.now() + 12 * 60000),
  placedAt: new Date(Date.now() - 35 * 60000),
  items: [
    { name: "Truffle Mushroom Burger", quantity: 2 },
    { name: "Sweet Potato Fries", quantity: 2 },
    { name: "Craft Lemonade", quantity: 2 },
  ],
  restaurant: {
    name: "The Burger Joint",
    address: "456 Restaurant Ave, Brooklyn, NY 11201",
    phone: "(555) 987-6543",
  },
  deliveryAddress: {
    street: "123 Main St",
    apt: "4B",
    city: "Brooklyn",
    state: "NY",
    zip: "11201",
  },
  dasher: {
    name: "Marcus",
    phone: "(555) 123-9999",
    rating: 4.9,
    vehicleType: "car",
    vehicleMake: "Toyota",
    vehicleModel: "Camry",
    licensePlate: "ABC 1234",
  },
  dasherLocation: {
    lat: 40.6892,
    lng: -73.9857,
    heading: 45,
    lastUpdated: new Date(Date.now() - 30000),
  },
  timeline: [
    { status: "confirmed", timestamp: new Date(Date.now() - 35 * 60000), description: "Order confirmed" },
    { status: "preparing", timestamp: new Date(Date.now() - 32 * 60000), description: "Restaurant started preparing" },
    { status: "dasher_confirmed", timestamp: new Date(Date.now() - 20 * 60000), description: "Marcus accepted delivery" },
    { status: "dasher_at_pickup", timestamp: new Date(Date.now() - 10 * 60000), description: "Dasher arrived at restaurant" },
    { status: "dasher_picked_up", timestamp: new Date(Date.now() - 8 * 60000), description: "Order picked up" },
    { status: "dasher_enroute_to_dropoff", timestamp: new Date(Date.now() - 7 * 60000), description: "On the way to you" },
  ],
}

const STATUS_STEPS = [
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "picked_up", label: "Picked Up", icon: Package },
  { key: "on_the_way", label: "On the Way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
]

// Map delivery status to step index
const getStepIndex = (status: DeliveryStatus): number => {
  if (status === "confirmed") return 0
  if (status === "preparing") return 1
  if (["ready_for_pickup", "dasher_confirmed", "dasher_enroute_to_pickup", "dasher_at_pickup"].includes(status)) return 2
  if (["dasher_picked_up", "dasher_enroute_to_dropoff", "dasher_at_dropoff"].includes(status)) return 3
  if (status === "delivered") return 4
  return 0
}

export default function TrackOrderPage({ params }: { params: { orderId: string } }) {
  const [tracking, _setTracking] = useState<TrackingInfo>(DEMO_TRACKING)
  void _setTracking // TODO: Use for real-time updates
  const [refreshing, setRefreshing] = useState(false)
  const currentStep = getStepIndex(tracking.status)

  // Poll for updates
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      // In production, fetch from API
      // const res = await fetch(`/api/orders/${params.orderId}/tracking`)
      // const data = await res.json()
      // setTracking(data)
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(pollInterval)
  }, [params.orderId])

  // Manual refresh
  const refresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000))
    setRefreshing(false)
  }

  // Time formatting
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getTimeRemaining = () => {
    const minutes = Math.floor((new Date(tracking.estimatedDelivery).getTime() - Date.now()) / 60000)
    if (minutes <= 0) return "Any moment now"
    if (minutes === 1) return "1 minute"
    return `${minutes} minutes`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Order {tracking.orderNumber}</h1>
            <p className="text-sm text-gray-500">Placed at {formatTime(tracking.placedAt)}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={refresh} disabled={refreshing}>
            <RefreshCw className={cn("w-5 h-5", refreshing && "animate-spin")} />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* ETA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-orange-100 text-sm">Estimated Arrival</p>
              <p className="text-4xl font-bold">{formatTime(tracking.estimatedDelivery)}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Truck className="w-8 h-8" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-lg">{getTimeRemaining()}</span>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="relative">
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep
              const Icon = step.icon
              
              return (
                <div key={step.key} className="flex items-start gap-4 pb-8 last:pb-0">
                  {/* Step Circle & Line */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: isCurrent ? 1.1 : 1 }}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        isCompleted && "bg-green-500 text-white",
                        isCurrent && "bg-orange-500 text-white ring-4 ring-orange-100",
                        !isCompleted && !isCurrent && "bg-gray-100 text-gray-400"
                      )}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </motion.div>
                    {index < STATUS_STEPS.length - 1 && (
                      <div className={cn(
                        "w-0.5 h-12 mt-2",
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      )} />
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 pt-2">
                    <p className={cn(
                      "font-medium",
                      (isCompleted || isCurrent) ? "text-gray-900" : "text-gray-400"
                    )}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-orange-600"
                      >
                        In progress...
                      </motion.p>
                    )}
                    {isCompleted && tracking.timeline.find(t => t.status.includes(step.key)) && (
                      <p className="text-sm text-gray-500">
                        {formatTime(tracking.timeline.find(t => t.status.includes(step.key))!.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dasher Card */}
        {tracking.dasher && currentStep >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {tracking.dasher.name[0]}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{tracking.dasher.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{tracking.dasher.rating}</span>
                  <span>•</span>
                  <span>{tracking.dasher.vehicleMake} {tracking.dasher.vehicleModel}</span>
                </div>
                {tracking.dasher.licensePlate && (
                  <Badge variant="outline" className="mt-2">{tracking.dasher.licensePlate}</Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <a href={`tel:${tracking.dasher.phone}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </a>
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Text
              </Button>
            </div>
          </motion.div>
        )}

        {/* Map Placeholder */}
        {tracking.dasherLocation && currentStep >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-100 rounded-2xl h-48 flex items-center justify-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-50" />
            <div className="relative z-10 text-center">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white mx-auto mb-2 shadow-lg">
                <Navigation className="w-6 h-6" />
              </div>
              <p className="text-sm text-gray-600">Live tracking</p>
              <p className="text-xs text-gray-400">Updated {Math.floor((Date.now() - new Date(tracking.dasherLocation.lastUpdated).getTime()) / 1000)}s ago</p>
            </div>
            <div className="absolute bottom-4 right-4">
              <Button size="sm" className="bg-white text-gray-900 shadow-lg hover:bg-gray-50">
                <MapPin className="w-4 h-4 mr-1" />
                Open Maps
              </Button>
            </div>
          </motion.div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Order Summary</h3>
          <div className="space-y-3">
            {tracking.items.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-gray-600">{item.quantity}× {item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Delivery Address</h3>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p>{tracking.deliveryAddress.street}{tracking.deliveryAddress.apt && `, ${tracking.deliveryAddress.apt}`}</p>
              <p className="text-gray-500">{tracking.deliveryAddress.city}, {tracking.deliveryAddress.state} {tracking.deliveryAddress.zip}</p>
            </div>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Restaurant</h3>
          <div className="space-y-3">
            <p className="font-medium">{tracking.restaurant.name}</p>
            <div className="flex items-start gap-3 text-gray-600">
              <MapPin className="w-4 h-4 mt-1" />
              <span>{tracking.restaurant.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <a href={`tel:${tracking.restaurant.phone}`} className="text-blue-600">
                {tracking.restaurant.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm mb-2">Having an issue with your order?</p>
          <Button variant="outline">Get Help</Button>
        </div>
      </main>
    </div>
  )
}
