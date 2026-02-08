"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft,
  MapPin,
  CreditCard,
  Truck,
  Store,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  modifiers?: string[]
}

// Demo cart data - in production this would come from state/context
const DEMO_CART: CartItem[] = [
  { id: "1", name: "Truffle Mushroom Burger", price: 18.99, quantity: 1, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200" },
  { id: "2", name: "Sweet Potato Fries", price: 6.99, quantity: 2 },
  { id: "3", name: "Craft Lemonade", price: 4.99, quantity: 1 },
]

const TIP_OPTIONS = [
  { label: "15%", multiplier: 0.15 },
  { label: "18%", multiplier: 0.18 },
  { label: "20%", multiplier: 0.20 },
  { label: "25%", multiplier: 0.25 },
  { label: "Custom", multiplier: 0 },
]

export default function CheckoutPage() {
  const [cart] = useState<CartItem[]>(DEMO_CART)
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("delivery")
  const [selectedTip, setSelectedTip] = useState(2) // 20% default
  const [customTip, setCustomTip] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    apt: "",
    city: "",
    state: "",
    zip: "",
    instructions: "",
  })
  const [contactInfo, setContactInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const taxRate = 0.08
  const tax = subtotal * taxRate
  const deliveryFee = orderType === "delivery" ? 4.99 : 0
  
  const tipAmount = selectedTip === 4 
    ? parseFloat(customTip) || 0 
    : subtotal * TIP_OPTIONS[selectedTip].multiplier
  
  const total = subtotal + tax + deliveryFee + tipAmount

  const handleCheckout = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          orderType,
          deliveryAddress: orderType === "delivery" ? deliveryAddress : null,
          tip: tipAmount,
          restaurantId: "demo-restaurant",
        }),
      })

      const { url, error } = await response.json()
      
      if (error) {
        console.error("Checkout error:", error)
        alert("Failed to create checkout. Please try again.")
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = () => {
    if (!contactInfo.firstName || !contactInfo.lastName || !contactInfo.email || !contactInfo.phone) {
      return false
    }
    if (orderType === "delivery") {
      return deliveryAddress.street && deliveryAddress.city && deliveryAddress.state && deliveryAddress.zip
    }
    return true
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/demo">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Type */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Order Type</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setOrderType("delivery")}
                  className={cn(
                    "p-4 rounded-xl border-2 transition flex flex-col items-center gap-2",
                    orderType === "delivery"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Truck className={cn(
                    "w-8 h-8",
                    orderType === "delivery" ? "text-orange-500" : "text-gray-400"
                  )} />
                  <span className="font-medium">Delivery</span>
                  <span className="text-sm text-gray-500">30-45 min</span>
                </button>
                <button
                  onClick={() => setOrderType("pickup")}
                  className={cn(
                    "p-4 rounded-xl border-2 transition flex flex-col items-center gap-2",
                    orderType === "pickup"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Store className={cn(
                    "w-8 h-8",
                    orderType === "pickup" ? "text-orange-500" : "text-gray-400"
                  )} />
                  <span className="font-medium">Pickup</span>
                  <span className="text-sm text-gray-500">15-20 min</span>
                </button>
              </div>
            </div>

            {/* Delivery Address */}
            <AnimatePresence mode="wait">
              {orderType === "delivery" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg font-semibold">Delivery Address</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Street Address</Label>
                      <Input
                        placeholder="123 Main Street"
                        value={deliveryAddress.street}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Apt, Suite, Floor (optional)</Label>
                      <Input
                        placeholder="Apt 4B"
                        value={deliveryAddress.apt}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, apt: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>City</Label>
                        <Input
                          placeholder="City"
                          value={deliveryAddress.city}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input
                          placeholder="State"
                          value={deliveryAddress.state}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>ZIP</Label>
                        <Input
                          placeholder="12345"
                          value={deliveryAddress.zip}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zip: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Delivery Instructions (optional)</Label>
                      <Textarea
                        placeholder="Leave at door, ring doorbell, etc."
                        value={deliveryAddress.instructions}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, instructions: e.target.value })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Contact Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      placeholder="John"
                      value={contactInfo.firstName}
                      onChange={(e) => setContactInfo({ ...contactInfo, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      placeholder="Doe"
                      value={contactInfo.lastName}
                      onChange={(e) => setContactInfo({ ...contactInfo, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Tip */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Add a Tip</h2>
              <div className="flex flex-wrap gap-2">
                {TIP_OPTIONS.map((tip, index) => (
                  <button
                    key={tip.label}
                    onClick={() => setSelectedTip(index)}
                    className={cn(
                      "px-4 py-2 rounded-full border-2 transition font-medium",
                      selectedTip === index
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {tip.label}
                    {tip.multiplier > 0 && (
                      <span className="text-sm ml-1">
                        (${(subtotal * tip.multiplier).toFixed(2)})
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {selectedTip === 4 && (
                <div className="mt-4">
                  <Label>Custom Tip Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-7"
                      placeholder="0.00"
                      value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600">{item.quantity}×</span>
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {orderType === "delivery" && (
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                {tipAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tip</span>
                    <span>${tipAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-600 h-12 text-lg"
                onClick={handleCheckout}
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay ${total.toFixed(2)}
                  </>
                )}
              </Button>

              {/* Payment Methods */}
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
                <span className="text-xs">Powered by</span>
                <svg className="h-6" viewBox="0 0 60 25" fill="currentColor">
                  <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.02 1.04-.06 1.48zm-3.67-3.14c0-1.24-.72-2.29-2.15-2.29-1.27 0-2.13.96-2.29 2.29h4.44z" />
                </svg>
              </div>

              {/* DoorDash Badge */}
              {orderType === "delivery" && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    DD
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-red-700">DoorDash Delivery</p>
                    <p className="text-red-600 text-xs">Track your order in real-time</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
