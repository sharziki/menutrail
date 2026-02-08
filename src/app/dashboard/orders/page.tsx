"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Bell,
  ChefHat,
  Truck,
  Store,
  Phone,
  MapPin,
  Volume2,
  VolumeX,
  RefreshCw,
  Search,
  Package,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type OrderStatus = "new" | "preparing" | "ready" | "out_for_delivery" | "completed" | "cancelled"
type OrderType = "dine_in" | "pickup" | "delivery"

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  modifiers?: string[]
  notes?: string
}

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  type: OrderType
  table?: string
  items: OrderItem[]
  subtotal: number
  tax: number
  tip: number
  total: number
  customer: {
    name: string
    phone: string
    email?: string
  }
  deliveryAddress?: {
    street: string
    apt?: string
    city: string
    state: string
    zip: string
    instructions?: string
  }
  doordashTrackingUrl?: string
  createdAt: Date
  prepTime?: number // minutes
  estimatedReady?: Date
}

// Demo orders
const DEMO_ORDERS: Order[] = [
  {
    id: "1",
    orderNumber: "MT-001",
    status: "new",
    type: "delivery",
    items: [
      { id: "1", name: "Truffle Mushroom Burger", quantity: 2, price: 18.99, modifiers: ["No onions", "Extra cheese"] },
      { id: "2", name: "Sweet Potato Fries", quantity: 2, price: 6.99 },
      { id: "3", name: "Craft Lemonade", quantity: 2, price: 4.99 },
    ],
    subtotal: 61.94,
    tax: 4.96,
    tip: 10.00,
    total: 76.90,
    customer: { name: "John Smith", phone: "(555) 123-4567", email: "john@example.com" },
    deliveryAddress: { street: "123 Main St", apt: "4B", city: "Brooklyn", state: "NY", zip: "11201", instructions: "Ring doorbell twice" },
    doordashTrackingUrl: "https://track.doordash.com/demo1",
    createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
  },
  {
    id: "2",
    orderNumber: "MT-002",
    status: "preparing",
    type: "dine_in",
    table: "12",
    items: [
      { id: "4", name: "Grilled Salmon", quantity: 1, price: 28.99 },
      { id: "5", name: "Caesar Salad", quantity: 1, price: 12.99 },
      { id: "6", name: "Glass of Chardonnay", quantity: 2, price: 14.99 },
    ],
    subtotal: 71.96,
    tax: 5.76,
    tip: 15.00,
    total: 92.72,
    customer: { name: "Sarah Johnson", phone: "(555) 987-6543" },
    createdAt: new Date(Date.now() - 8 * 60 * 1000),
    prepTime: 15,
    estimatedReady: new Date(Date.now() + 7 * 60 * 1000),
  },
  {
    id: "3",
    orderNumber: "MT-003",
    status: "ready",
    type: "pickup",
    items: [
      { id: "7", name: "Margherita Pizza", quantity: 1, price: 16.99, notes: "Extra crispy" },
      { id: "8", name: "Garlic Knots", quantity: 1, price: 7.99 },
    ],
    subtotal: 24.98,
    tax: 2.00,
    tip: 5.00,
    total: 31.98,
    customer: { name: "Mike Chen", phone: "(555) 456-7890" },
    createdAt: new Date(Date.now() - 20 * 60 * 1000),
  },
  {
    id: "4",
    orderNumber: "MT-004",
    status: "out_for_delivery",
    type: "delivery",
    items: [
      { id: "9", name: "Pad Thai", quantity: 2, price: 15.99 },
      { id: "10", name: "Spring Rolls", quantity: 1, price: 8.99 },
    ],
    subtotal: 40.97,
    tax: 3.28,
    tip: 8.00,
    total: 52.25,
    customer: { name: "Emily Davis", phone: "(555) 321-0987" },
    deliveryAddress: { street: "456 Oak Ave", city: "Manhattan", state: "NY", zip: "10001" },
    doordashTrackingUrl: "https://track.doordash.com/demo2",
    createdAt: new Date(Date.now() - 35 * 60 * 1000),
  },
]

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  new: { label: "New", color: "text-blue-700", bgColor: "bg-blue-100", icon: Bell },
  preparing: { label: "Preparing", color: "text-orange-700", bgColor: "bg-orange-100", icon: ChefHat },
  ready: { label: "Ready", color: "text-green-700", bgColor: "bg-green-100", icon: CheckCircle2 },
  out_for_delivery: { label: "Out for Delivery", color: "text-purple-700", bgColor: "bg-purple-100", icon: Truck },
  completed: { label: "Completed", color: "text-gray-700", bgColor: "bg-gray-100", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-100", icon: XCircle },
}

const TYPE_CONFIG: Record<OrderType, { label: string; icon: React.ElementType }> = {
  dine_in: { label: "Dine In", icon: Store },
  pickup: { label: "Pickup", icon: Package },
  delivery: { label: "Delivery", icon: Truck },
}

// Order status flow for backward navigation - Item 18
const STATUS_ORDER: OrderStatus[] = ["new", "preparing", "ready", "out_for_delivery", "completed"]

export default function OrdersDashboard() {
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filter, setFilter] = useState<OrderStatus | "all">("all")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [search, setSearch] = useState("")
  const [autoPrint, setAutoPrint] = useState(true) // Item 19 - Auto print
  
  // Audio refs for order sounds - Item 17
  const pickupSoundRef = useRef<HTMLAudioElement | null>(null)
  const deliverySoundRef = useRef<HTMLAudioElement | null>(null)
  const previousOrdersRef = useRef<string[]>([])
  
  // Initialize audio elements
  useEffect(() => {
    // Create pickup sound - 6 seconds (Item 17)
    pickupSoundRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleR0BFDaS4PdLKyIESx9Y6ehgQAkALzKc7uUjHx4mYSBd7eMvDAguWCc54ewjEhsxZiEu6+slDw0vXB4g6e0oCww1YBgU5u4pCAw5ZxEK4+8rBQw+bAsC4fAsAwxEcgb/3/AvAQxIeAH72/AyAAFMfvzy1/E1/wBRhPnv1PI3/v5WivbrzPQ6/P1bkPToz/Y9+/xglvHi0Pg/+fphm+/d0vo/+Ptloe3Yz/w++Ppppu3Ty/47+PxurfDNx/87+P50s/PKxQE7+AB5uPbHwgM7+AR+vPnFvwU8+Ah/wPvCvQc8+AuBwP3BvAg9+A2Bv/++ugk8+A+Bvf69uQo7+BCBu/y7uAs5+ROBuPq5tgw4+RWAtfi3tQ03+RiAtPaztg82+Rp/svS0tRE1+hx+sPS0tBEz+h5+rvOztBMy+iF+rPKyshQx+iN9q/GyshUv+iZ9qvCyshYu+id9qfCxsRcu+il8qO+xsRgt+ip8p++xsRks+ix8pu6wsRkr+i58pe6wsRoq+jB8pe6wsRso+jF7pO6wsRwn+jN7pO2vsBym+jR7o+2vsByF+jV6o+2vsByE+jd6ouyvsByC+jh6ouyvsByA+jp6oeyvsRx/+jt5oeyvsBx++jx5oeuvsBx8+j55oeuvsBx7+j95oOuvsBx6+kB5oOuvsBx5+kF5oOqusRx4+kJ5n+qusRx3+kN5n+qusRx2+kR4n+qusRx1+kV4n+musRx0+kZ4numusRxz+kd4numusRxy+kh4numusRxx+kl4nuiusRxw+kp3neiusRxv+kt3neiusRxu+kx3neitsRxt+k13neiusRxs")
    // Create delivery sound
    deliverySoundRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleR0BFDaS4PdLKyIESx9Y6ehgQAkALzKc7uUjHx4mYSBd7eMvDAguWCc54ewjEhsxZiEu6+slDw0vXB4g6e0oCww1YBgU5u4pCAw5ZxEK4+8rBQw+bAsC4fAsAwxEcgb/3/AvAQxIeAH72/AyAAFMfvzy1/E1/wBRhPnv1PI3/v5WivbrzPQ6/P1bkPToz/Y9+/xglvHi0Pg/+fphm+/d0vo/+Ptloe3Yz/w++Ppppu3Ty/47+PxurfDNx/87+P50s/PKxQE7+AB5uPbHwgM7+AR+vPnFvwU8+Ah/wPvCvQc8+AuBwP3BvAg9+A2Bv/++ugk8+A+Bvf69uQo7+BCBu/y7uAs5+ROBuPq5tgw4+RWAtfi3tQ03+RiAtPaztg82+Rp/svS0tRE1+hx+sPS0tBEz+h5+rvOztBMy+iF+rPKyshQx+iN9q/GyshUv+iZ9qvCyshYu+id9qfCxsRcu+il8qO+xsRgt+ip8p++xsRks+ix8pu6wsRkr+i58pe6wsRoq+jB8pe6wsRso+jF7pO6wsRwn+jN7pO2vsBym+jR7o+2vsByF+jV6o+2vsByE+jd6ouyvsByC+jh6ouyvsByA+jp6oeyvsRx/+jt5oeyvsBx++jx5oeuvsBx8+j55oeuvsBx7+j95oOuvsBx6+kB5oOuvsBx5+kF5oOqusRx4+kJ5n+qusRx3+kN5n+qusRx2+kR4n+qusRx1+kV4n+musRx0+kZ4numusRxz+kd4numusRxy+kh4numusRxx+kl4nuiusRxw+kp3neiusRxv+kt3neiusRxu+kx3neitsRxt+k13neiusRxs")
  }, [])
  
  // (Note: Order sound and auto-print effect is defined after printOrder)
  
  // Get previous status for backward navigation - Item 18
  const getPreviousStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus)
    if (currentIndex <= 0) return null
    return STATUS_ORDER[currentIndex - 1]
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (filter !== "all" && order.status !== filter) return false
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.customer.name.toLowerCase().includes(searchLower) ||
        order.customer.phone.includes(search)
      )
    }
    return true
  })

  // Active statuses for Kanban view (excludes completed/cancelled)
  type ActiveStatus = "new" | "preparing" | "ready" | "out_for_delivery"
  
  // Group orders by status for Kanban view
  const ordersByStatus: Record<ActiveStatus, Order[]> = {
    new: filteredOrders.filter(o => o.status === "new"),
    preparing: filteredOrders.filter(o => o.status === "preparing"),
    ready: filteredOrders.filter(o => o.status === "ready"),
    out_for_delivery: filteredOrders.filter(o => o.status === "out_for_delivery"),
  }

  // Update order status - Item 18: now supports going backwards
  const updateStatus = useCallback((orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
    }
  }, [selectedOrder])
  
  // Move order backwards - Item 18
  const moveOrderBack = useCallback((orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return
    const prevStatus = getPreviousStatus(order.status)
    if (prevStatus) {
      updateStatus(orderId, prevStatus)
    }
  }, [orders, updateStatus])

  // Print order
  const printOrder = useCallback((order: Order) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Order ${order.orderNumber}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 300px; }
            h1 { font-size: 24px; text-align: center; margin-bottom: 10px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { font-weight: bold; font-size: 18px; }
            .center { text-align: center; }
            .modifier { font-size: 12px; color: #666; margin-left: 10px; }
          </style>
        </head>
        <body>
          <h1>ORDER ${order.orderNumber}</h1>
          <p class="center">${new Date(order.createdAt).toLocaleString()}</p>
          <p class="center"><strong>${TYPE_CONFIG[order.type].label.toUpperCase()}</strong>${order.table ? ` - Table ${order.table}` : ''}</p>
          <div class="divider"></div>
          <p><strong>${order.customer.name}</strong></p>
          <p>${order.customer.phone}</p>
          ${order.deliveryAddress ? `<p>${order.deliveryAddress.street}${order.deliveryAddress.apt ? `, ${order.deliveryAddress.apt}` : ''}<br>${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zip}</p>` : ''}
          ${order.deliveryAddress?.instructions ? `<p><em>${order.deliveryAddress.instructions}</em></p>` : ''}
          <div class="divider"></div>
          ${order.items.map(item => `
            <div class="item">
              <span>${item.quantity}x ${item.name}</span>
              <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            ${item.modifiers?.map(m => `<div class="modifier">- ${m}</div>`).join('') || ''}
            ${item.notes ? `<div class="modifier">Note: ${item.notes}</div>` : ''}
          `).join('')}
          <div class="divider"></div>
          <div class="item"><span>Subtotal</span><span>$${order.subtotal.toFixed(2)}</span></div>
          <div class="item"><span>Tax</span><span>$${order.tax.toFixed(2)}</span></div>
          ${order.tip > 0 ? `<div class="item"><span>Tip</span><span>$${order.tip.toFixed(2)}</span></div>` : ''}
          <div class="item total"><span>TOTAL</span><span>$${order.total.toFixed(2)}</span></div>
          <div class="divider"></div>
          <p class="center">Thank you!</p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }, [])
  
  // Handle new orders - play sound and auto-print (Items 17 & 19)
  useEffect(() => {
    if (!soundEnabled && !autoPrint) return
    
    const currentOrderIds = orders.map(o => o.id)
    const newOrders = orders.filter(o => 
      o.status === "new" && !previousOrdersRef.current.includes(o.id)
    )
    
    newOrders.forEach(order => {
      // Play appropriate sound - pickup is 6 seconds (Item 17)
      if (soundEnabled) {
        if (order.type === "pickup" && pickupSoundRef.current) {
          pickupSoundRef.current.currentTime = 0
          pickupSoundRef.current.play().catch(() => {})
          // Pickup sound plays for 6 seconds
          setTimeout(() => {
            pickupSoundRef.current?.pause()
          }, 6000)
        } else if (deliverySoundRef.current) {
          deliverySoundRef.current.currentTime = 0
          deliverySoundRef.current.play().catch(() => {})
        }
      }
      
      // Auto-print new orders regardless of acceptance (Item 19)
      if (autoPrint) {
        printOrder(order)
      }
    })
    
    previousOrdersRef.current = currentOrderIds
  }, [orders, soundEnabled, autoPrint, printOrder])

  // Time since order
  const getTimeSince = (date: Date) => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m ago`
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="font-bold text-xl">MenuTrail</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600 font-medium">Orders Dashboard</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                className="pl-9 w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Sound on" : "Sound off"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button
              variant={autoPrint ? "default" : "outline"}
              size="icon"
              onClick={() => setAutoPrint(!autoPrint)}
              title={autoPrint ? "Auto-print on" : "Auto-print off"}
            >
              <Printer className={cn("w-4 h-4", autoPrint && "text-white")} />
            </Button>
            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Status Filters */}
        <div className="px-4 py-2 flex gap-2 border-t border-gray-100 bg-gray-50">
          <Button
            variant={filter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({orders.length})
          </Button>
          {(["new", "preparing", "ready", "out_for_delivery"] as const).map(status => (
            <Button
              key={status}
              variant={filter === status ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(status)}
              className={filter === status ? "" : STATUS_CONFIG[status].color}
            >
              {STATUS_CONFIG[status].label} ({ordersByStatus[status].length})
            </Button>
          ))}
        </div>
      </header>

      {/* Kanban Board */}
      <div className="p-4 flex gap-4 overflow-x-auto min-h-[calc(100vh-120px)]">
        {(["new", "preparing", "ready", "out_for_delivery"] as const).map(status => (
          <div key={status} className="flex-1 min-w-[300px] max-w-[400px]">
            <div className={cn(
              "rounded-t-xl p-3 flex items-center gap-2",
              STATUS_CONFIG[status].bgColor
            )}>
              {(() => {
                const Icon = STATUS_CONFIG[status].icon
                return <Icon className={cn("w-5 h-5", STATUS_CONFIG[status].color)} />
              })()}
              <span className={cn("font-semibold", STATUS_CONFIG[status].color)}>
                {STATUS_CONFIG[status].label}
              </span>
              <Badge variant="secondary" className="ml-auto">
                {ordersByStatus[status].length}
              </Badge>
            </div>
            
            <div className="bg-gray-50 rounded-b-xl p-2 space-y-2 min-h-[500px]">
              <AnimatePresence>
                {ordersByStatus[status].map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn(
                      "bg-white rounded-lg shadow-sm border-2 cursor-pointer hover:shadow-md transition",
                      status === "new" && "border-blue-300 animate-pulse",
                      status !== "new" && "border-transparent"
                    )}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="p-3">
                      {/* Order Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{order.orderNumber}</span>
                          {order.table && (
                            <Badge variant="outline">Table {order.table}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          {getTimeSince(order.createdAt)}
                        </div>
                      </div>
                      
                      {/* Order Type */}
                      <div className="flex items-center gap-2 mb-3">
                        {(() => {
                          const Icon = TYPE_CONFIG[order.type].icon
                          return <Icon className="w-4 h-4 text-gray-500" />
                        })()}
                        <span className="text-sm text-gray-600">{TYPE_CONFIG[order.type].label}</span>
                        {order.type === "delivery" && order.doordashTrackingUrl && (
                          <Badge className="bg-red-500 text-xs">DoorDash</Badge>
                        )}
                      </div>
                      
                      {/* Items Preview */}
                      <div className="text-sm text-gray-600 mb-3">
                        {order.items.slice(0, 2).map((item, i) => (
                          <div key={i} className="truncate">
                            {item.quantity}× {item.name}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <span className="text-gray-400">+{order.items.length - 2} more</span>
                        )}
                      </div>
                      
                      {/* Customer & Total */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium truncate max-w-[120px]">
                            {order.customer.name}
                          </span>
                        </div>
                        <span className="font-bold text-green-600">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {/* Quick Actions - Item 18: Added backward button */}
                    <div className="px-3 pb-3 flex gap-2">
                      {/* Backward button - Item 18 */}
                      {status !== "new" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-gray-500 hover:text-gray-700"
                          onClick={(e) => { e.stopPropagation(); moveOrderBack(order.id) }}
                          title="Move back to previous status"
                        >
                          ←
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => { e.stopPropagation(); printOrder(order) }}
                      >
                        <Printer className="w-3 h-3 mr-1" />
                        Print
                      </Button>
                      {status === "new" && (
                        <Button
                          size="sm"
                          className="flex-1 bg-orange-500 hover:bg-orange-600"
                          onClick={(e) => { e.stopPropagation(); updateStatus(order.id, "preparing") }}
                        >
                          Start
                        </Button>
                      )}
                      {status === "preparing" && (
                        <Button
                          size="sm"
                          className="flex-1 bg-green-500 hover:bg-green-600"
                          onClick={(e) => { e.stopPropagation(); updateStatus(order.id, "ready") }}
                        >
                          Ready
                        </Button>
                      )}
                      {status === "ready" && order.type === "delivery" && (
                        <Button
                          size="sm"
                          className="flex-1 bg-purple-500 hover:bg-purple-600"
                          onClick={(e) => { e.stopPropagation(); updateStatus(order.id, "out_for_delivery") }}
                        >
                          Send Out
                        </Button>
                      )}
                      {status === "ready" && order.type !== "delivery" && (
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={(e) => { e.stopPropagation(); updateStatus(order.id, "completed") }}
                        >
                          Complete
                        </Button>
                      )}
                      {status === "out_for_delivery" && (
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={(e) => { e.stopPropagation(); updateStatus(order.id, "completed") }}
                        >
                          Delivered
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {ordersByStatus[status].length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No orders</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Order Detail Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl overflow-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedOrder.orderNumber}</h2>
                    <p className="text-gray-500">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedOrder(null)}>✕</Button>
                </div>
                
                {/* Status */}
                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6",
                  STATUS_CONFIG[selectedOrder.status].bgColor
                )}>
                  {(() => {
                    const Icon = STATUS_CONFIG[selectedOrder.status].icon
                    return <Icon className={cn("w-5 h-5", STATUS_CONFIG[selectedOrder.status].color)} />
                  })()}
                  <span className={cn("font-medium", STATUS_CONFIG[selectedOrder.status].color)}>
                    {STATUS_CONFIG[selectedOrder.status].label}
                  </span>
                </div>
                
                {/* Order Type & Table */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  {(() => {
                    const Icon = TYPE_CONFIG[selectedOrder.type].icon
                    return <Icon className="w-6 h-6 text-gray-600" />
                  })()}
                  <div>
                    <p className="font-medium">{TYPE_CONFIG[selectedOrder.type].label}</p>
                    {selectedOrder.table && <p className="text-sm text-gray-500">Table {selectedOrder.table}</p>}
                  </div>
                </div>
                
                {/* Customer Info */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Customer</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{selectedOrder.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${selectedOrder.customer.phone}`} className="text-blue-600 hover:underline">
                        {selectedOrder.customer.phone}
                      </a>
                    </div>
                    {selectedOrder.deliveryAddress && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p>{selectedOrder.deliveryAddress.street}{selectedOrder.deliveryAddress.apt && `, ${selectedOrder.deliveryAddress.apt}`}</p>
                          <p>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.zip}</p>
                          {selectedOrder.deliveryAddress.instructions && (
                            <p className="text-sm text-gray-500 mt-1 italic">{selectedOrder.deliveryAddress.instructions}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* DoorDash Tracking */}
                {selectedOrder.doordashTrackingUrl && (
                  <a
                    href={selectedOrder.doordashTrackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-red-50 rounded-lg mb-6 hover:bg-red-100 transition"
                  >
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      DD
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-red-700">Track with DoorDash</p>
                      <p className="text-sm text-red-600">View driver location</p>
                    </div>
                    <Truck className="w-5 h-5 text-red-500" />
                  </a>
                )}
                
                {/* Items */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between">
                          <span className="font-medium">{item.quantity}× {item.name}</span>
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="mt-1 text-sm text-gray-500">
                            {item.modifiers.map((mod, i) => (
                              <span key={i}>• {mod} </span>
                            ))}
                          </div>
                        )}
                        {item.notes && (
                          <p className="mt-1 text-sm text-orange-600 italic">Note: {item.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Totals */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tax</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  {selectedOrder.tip > 0 && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Tip</span>
                      <span>${selectedOrder.tip.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-green-600">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => printOrder(selectedOrder)}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print Order
                  </Button>
                  {selectedOrder.status === "new" && (
                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      onClick={() => updateStatus(selectedOrder.id, "preparing")}
                    >
                      <ChefHat className="w-4 h-4 mr-2" />
                      Start Preparing
                    </Button>
                  )}
                  {selectedOrder.status === "preparing" && (
                    <Button 
                      className="w-full bg-green-500 hover:bg-green-600"
                      onClick={() => updateStatus(selectedOrder.id, "ready")}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark Ready
                    </Button>
                  )}
                  {selectedOrder.status !== "cancelled" && selectedOrder.status !== "completed" && (
                    <Button 
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700"
                      onClick={() => updateStatus(selectedOrder.id, "cancelled")}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
