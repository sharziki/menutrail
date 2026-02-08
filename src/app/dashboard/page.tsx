"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  ArrowRight,
  Settings,
  Menu,
  LayoutGrid,
  Utensils,
  Bell,
  BarChart3,
  ExternalLink,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Types for dashboard data
interface DashboardStats {
  todayRevenue: number
  todayOrders: number
  avgOrderValue: number
  newCustomers: number
  revenueChange: number
  ordersChange: number
}

interface TopItem {
  name: string
  orders: number
  revenue: number
}

interface TopCustomer {
  name: string
  orders: number
  spent: number
  lastOrder: string
}

interface RecentOrder {
  id: string
  customer: string
  total: number
  status: string
  type: string
}

// Demo fallback data
const DEMO_STATS: DashboardStats = {
  todayRevenue: 1247.50,
  todayOrders: 34,
  avgOrderValue: 36.69,
  newCustomers: 8,
  revenueChange: 12.5,
  ordersChange: 8.2,
}

const DEMO_TOP_ITEMS: TopItem[] = [
  { name: "Truffle Mushroom Burger", orders: 45, revenue: 854.55 },
  { name: "Sweet Potato Fries", orders: 38, revenue: 265.62 },
  { name: "Craft Lemonade", orders: 32, revenue: 159.68 },
  { name: "Grilled Salmon", orders: 28, revenue: 811.72 },
  { name: "Caesar Salad", orders: 24, revenue: 311.76 },
]

const DEMO_TOP_CUSTOMERS: TopCustomer[] = [
  { name: "John Smith", orders: 12, spent: 456.78, lastOrder: "2 days ago" },
  { name: "Sarah Johnson", orders: 8, spent: 312.50, lastOrder: "1 week ago" },
  { name: "Mike Chen", orders: 6, spent: 198.25, lastOrder: "Yesterday" },
  { name: "Emily Davis", orders: 5, spent: 167.90, lastOrder: "3 days ago" },
]

const DEMO_RECENT_ORDERS: RecentOrder[] = [
  { id: "MT-001", customer: "John S.", total: 42.50, status: "preparing", type: "delivery" },
  { id: "MT-002", customer: "Sarah J.", total: 67.25, status: "ready", type: "pickup" },
  { id: "MT-003", customer: "Table 5", total: 89.00, status: "new", type: "dine_in" },
  { id: "MT-004", customer: "Mike C.", total: 31.75, status: "completed", type: "delivery" },
]

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stats, setStats] = useState<DashboardStats>(DEMO_STATS)
  const [topItems, setTopItems] = useState<TopItem[]>(DEMO_TOP_ITEMS)
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>(DEMO_TOP_CUSTOMERS)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>(DEMO_RECENT_ORDERS)
  const [, setIsLoading] = useState(true)

  // Fetch real data on mount
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsRes, itemsRes, customersRes, ordersRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/dashboard/top-items"),
          fetch("/api/dashboard/top-customers"),
          fetch("/api/dashboard/recent-orders"),
        ])

        const [statsData, itemsData, customersData, ordersData] = await Promise.all([
          statsRes.json(),
          itemsRes.json(),
          customersRes.json(),
          ordersRes.json(),
        ])

        // Only update if we got real data
        if (statsData.todayRevenue !== undefined) {
          setStats(statsData)
        }
        if (itemsData.items?.length > 0) {
          setTopItems(itemsData.items)
        }
        if (customersData.customers?.length > 0) {
          setTopCustomers(customersData.customers)
        }
        if (ordersData.orders?.length > 0) {
          setRecentOrders(ordersData.orders)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        // Keep demo data on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-4 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold">
              M
            </div>
            {sidebarOpen && <span className="font-bold text-xl">MenuTrail</span>}
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {[
            { icon: LayoutGrid, label: "Dashboard", href: "/dashboard", active: true },
            { icon: ShoppingBag, label: "Orders", href: "/dashboard/orders" },
            { icon: Utensils, label: "Menu", href: "/builder" },
            { icon: Users, label: "Tables", href: "/dashboard/tables" },
            { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
            { icon: Settings, label: "Settings", href: "/dashboard/settings" },
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <button className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition",
                item.active 
                  ? "bg-orange-50 text-orange-600" 
                  : "text-gray-600 hover:bg-gray-50"
              )}>
                <item.icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            </Link>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl text-white">
              <p className="font-medium mb-1">Upgrade to Pro</p>
              <p className="text-sm text-white/80 mb-3">Unlock analytics, multiple menus & more</p>
              <Button size="sm" className="w-full bg-white text-orange-600 hover:bg-gray-100">
                Upgrade Now
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back! Here&apos;s what&apos;s happening today.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              <Button asChild>
                <Link href="/menu/demo-restaurant" target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Menu
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <Badge className={stats.revenueChange >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {stats.revenueChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(stats.revenueChange)}%
                </Badge>
              </div>
              <p className="text-2xl font-bold">${stats.todayRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Today&apos;s Revenue</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <Badge className={stats.ordersChange >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {stats.ordersChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(stats.ordersChange)}%
                </Badge>
              </div>
              <p className="text-2xl font-bold">{stats.todayOrders}</p>
              <p className="text-sm text-gray-500">Today&apos;s Orders</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">${stats.avgOrderValue.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Avg Order Value</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.newCustomers}</p>
              <p className="text-sm text-gray-500">New Customers</p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold">Recent Orders</h2>
                <Link href="/dashboard/orders">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {recentOrders.map(order => (
                  <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-gray-500">{order.customer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={cn(
                        order.type === "delivery" && "border-purple-500 text-purple-600",
                        order.type === "pickup" && "border-blue-500 text-blue-600",
                        order.type === "dine_in" && "border-green-500 text-green-600",
                      )}>
                        {order.type.replace("_", " ")}
                      </Badge>
                      <Badge className={cn(
                        order.status === "new" && "bg-blue-100 text-blue-700",
                        order.status === "preparing" && "bg-orange-100 text-orange-700",
                        order.status === "ready" && "bg-green-100 text-green-700",
                        order.status === "completed" && "bg-gray-100 text-gray-700",
                      )}>
                        {order.status}
                      </Badge>
                      <span className="font-medium w-20 text-right">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Items */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold">Top Selling Items</h2>
              </div>
              <div className="p-4 space-y-4">
                {topItems.slice(0, 5).map((item, i) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium",
                      i === 0 && "bg-yellow-100 text-yellow-700",
                      i === 1 && "bg-gray-100 text-gray-700",
                      i === 2 && "bg-orange-100 text-orange-700",
                      i > 2 && "bg-gray-50 text-gray-500"
                    )}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.orders} orders</p>
                    </div>
                    <span className="text-green-600 font-medium">${item.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold">Top Customers</h2>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Customer</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Orders</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Total Spent</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Last Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topCustomers.map(customer => (
                    <tr key={customer.name} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-medium">
                            {customer.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span className="font-medium">{customer.name}</span>
                        </div>
                      </td>
                      <td className="p-4">{customer.orders}</td>
                      <td className="p-4 text-green-600 font-medium">${customer.spent.toFixed(2)}</td>
                      <td className="p-4 text-gray-500">{customer.lastOrder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/builder">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-start gap-2">
                <Plus className="w-5 h-5 text-orange-500" />
                <span className="font-medium">Add Menu Item</span>
              </Button>
            </Link>
            <Link href="/dashboard/orders">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-start gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-500" />
                <span className="font-medium">View Orders</span>
              </Button>
            </Link>
            <Link href="/dashboard/tables">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-start gap-2">
                <LayoutGrid className="w-5 h-5 text-green-500" />
                <span className="font-medium">Manage Tables</span>
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-start gap-2">
                <Settings className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Settings</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
