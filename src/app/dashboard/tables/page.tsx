"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Users,
  Clock,
  Plus,
  Check,
  X,
  DollarSign,
  QrCode,
  Link2,
  Bell,
  UtensilsCrossed,
  Receipt,
  Timer,
  UserPlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type TableStatus = "available" | "occupied" | "reserved" | "cleaning"

interface Table {
  id: string
  number: string
  capacity: number
  status: TableStatus
  currentGuests?: number
  guestName?: string
  seatedAt?: Date
  orderTotal?: number
  hasActiveOrder?: boolean
  reservation?: {
    name: string
    time: Date
    guests: number
    phone?: string
    notes?: string
  }
}

interface FloorSection {
  id: string
  name: string
  tables: Table[]
}

// Demo floor layout
const DEMO_FLOOR: FloorSection[] = [
  {
    id: "main",
    name: "Main Dining",
    tables: [
      { id: "1", number: "1", capacity: 2, status: "occupied", currentGuests: 2, guestName: "Smith", seatedAt: new Date(Date.now() - 45 * 60000), orderTotal: 67.50, hasActiveOrder: true },
      { id: "2", number: "2", capacity: 2, status: "available" },
      { id: "3", number: "3", capacity: 4, status: "occupied", currentGuests: 3, guestName: "Johnson", seatedAt: new Date(Date.now() - 20 * 60000), orderTotal: 45.00, hasActiveOrder: true },
      { id: "4", number: "4", capacity: 4, status: "reserved", reservation: { name: "Davis", time: new Date(Date.now() + 30 * 60000), guests: 4, phone: "(555) 123-4567" } },
      { id: "5", number: "5", capacity: 6, status: "available" },
      { id: "6", number: "6", capacity: 6, status: "cleaning" },
      { id: "7", number: "7", capacity: 4, status: "occupied", currentGuests: 4, guestName: "Martinez", seatedAt: new Date(Date.now() - 90 * 60000), orderTotal: 156.25, hasActiveOrder: false },
      { id: "8", number: "8", capacity: 2, status: "available" },
    ],
  },
  {
    id: "patio",
    name: "Patio",
    tables: [
      { id: "p1", number: "P1", capacity: 4, status: "available" },
      { id: "p2", number: "P2", capacity: 4, status: "occupied", currentGuests: 2, guestName: "Wilson", seatedAt: new Date(Date.now() - 35 * 60000), orderTotal: 52.00, hasActiveOrder: true },
      { id: "p3", number: "P3", capacity: 6, status: "available" },
      { id: "p4", number: "P4", capacity: 8, status: "reserved", reservation: { name: "Birthday Party", time: new Date(Date.now() + 60 * 60000), guests: 8, notes: "Cake coming at 7pm" } },
    ],
  },
  {
    id: "bar",
    name: "Bar Area",
    tables: [
      { id: "b1", number: "B1", capacity: 2, status: "occupied", currentGuests: 2, guestName: "Bar Guest", seatedAt: new Date(Date.now() - 15 * 60000), orderTotal: 28.00, hasActiveOrder: true },
      { id: "b2", number: "B2", capacity: 2, status: "available" },
      { id: "b3", number: "B3", capacity: 2, status: "occupied", currentGuests: 1, guestName: "Solo", seatedAt: new Date(Date.now() - 55 * 60000), orderTotal: 42.50 },
    ],
  },
]

const STATUS_CONFIG: Record<TableStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
  available: { label: "Available", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-500" },
  occupied: { label: "Occupied", color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-500" },
  reserved: { label: "Reserved", color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-500" },
  cleaning: { label: "Cleaning", color: "text-yellow-700", bgColor: "bg-yellow-50", borderColor: "border-yellow-500" },
}

export default function TableManagement() {
  const [floor, setFloor] = useState<FloorSection[]>(DEMO_FLOOR)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  // TODO: Implement reservation modal
  const [_showReservationModal, setShowReservationModal] = useState(false)
  void _showReservationModal
  // TODO: Implement status filter
  const _filter = "all" as TableStatus | "all"
  void _filter

  // Get all tables
  const allTables = floor.flatMap(s => s.tables)
  
  // Stats
  const stats = {
    total: allTables.length,
    available: allTables.filter(t => t.status === "available").length,
    occupied: allTables.filter(t => t.status === "occupied").length,
    reserved: allTables.filter(t => t.status === "reserved").length,
    totalGuests: allTables.reduce((sum, t) => sum + (t.currentGuests || 0), 0),
    totalRevenue: allTables.reduce((sum, t) => sum + (t.orderTotal || 0), 0),
  }

  // Update table
  const updateTable = useCallback((tableId: string, updates: Partial<Table>) => {
    setFloor(prev => prev.map(section => ({
      ...section,
      tables: section.tables.map(table => 
        table.id === tableId ? { ...table, ...updates } : table
      ),
    })))
    if (selectedTable?.id === tableId) {
      setSelectedTable(prev => prev ? { ...prev, ...updates } : null)
    }
  }, [selectedTable])

  // Seat guests
  const seatGuests = (tableId: string, guestCount: number, guestName: string) => {
    updateTable(tableId, {
      status: "occupied",
      currentGuests: guestCount,
      guestName,
      seatedAt: new Date(),
      orderTotal: 0,
      hasActiveOrder: false,
    })
  }

  // Clear table
  const clearTable = (tableId: string) => {
    updateTable(tableId, {
      status: "cleaning",
      currentGuests: undefined,
      guestName: undefined,
      seatedAt: undefined,
      orderTotal: undefined,
      hasActiveOrder: undefined,
      reservation: undefined,
    })
  }

  // Mark cleaned
  const markCleaned = (tableId: string) => {
    updateTable(tableId, { status: "available" })
  }

  // Time at table
  const getTimeAtTable = (seatedAt: Date) => {
    const minutes = Math.floor((Date.now() - new Date(seatedAt).getTime()) / 60000)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }

  // Time until reservation
  const getTimeUntil = (time: Date) => {
    const minutes = Math.floor((new Date(time).getTime() - Date.now()) / 60000)
    if (minutes < 0) return "Now"
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
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
            <span className="text-gray-600 font-medium">Table Management</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowReservationModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Reservation
            </Button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="px-4 py-3 flex gap-6 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Available</p>
              <p className="font-bold">{stats.available}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Occupied</p>
              <p className="font-bold">{stats.occupied}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Reserved</p>
              <p className="font-bold">{stats.reserved}</p>
            </div>
          </div>
          <div className="border-l border-gray-200 pl-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Guests</p>
              <p className="font-bold">{stats.totalGuests}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Open Tabs</p>
              <p className="font-bold">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Floor Sections */}
      <div className="p-6 space-y-8">
        {floor.map(section => (
          <div key={section.id}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {section.name}
              <Badge variant="secondary">{section.tables.length} tables</Badge>
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {section.tables.map(table => (
                <motion.button
                  key={table.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTable(table)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all text-left",
                    STATUS_CONFIG[table.status].bgColor,
                    STATUS_CONFIG[table.status].borderColor,
                    "hover:shadow-lg"
                  )}
                >
                  {/* Table Number */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold">{table.number}</span>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{table.currentGuests || 0}/{table.capacity}</span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <Badge className={cn(
                    "mb-2",
                    table.status === "available" && "bg-green-500",
                    table.status === "occupied" && "bg-blue-500",
                    table.status === "reserved" && "bg-purple-500",
                    table.status === "cleaning" && "bg-yellow-500",
                  )}>
                    {STATUS_CONFIG[table.status].label}
                  </Badge>
                  
                  {/* Occupied Info */}
                  {table.status === "occupied" && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium truncate">{table.guestName}</p>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Timer className="w-3 h-3" />
                        <span>{getTimeAtTable(table.seatedAt!)}</span>
                        {table.orderTotal && table.orderTotal > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 font-medium">${table.orderTotal.toFixed(2)}</span>
                          </>
                        )}
                      </div>
                      {table.hasActiveOrder && (
                        <Badge variant="outline" className="mt-2 text-xs border-orange-500 text-orange-600">
                          <UtensilsCrossed className="w-3 h-3 mr-1" />
                          Active Order
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Reserved Info */}
                  {table.status === "reserved" && table.reservation && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium truncate">{table.reservation.name}</p>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>In {getTimeUntil(table.reservation.time)}</span>
                        <span>•</span>
                        <span>{table.reservation.guests} guests</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Cleaning Indicator */}
                  {table.status === "cleaning" && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-yellow-600">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                        <span className="text-sm">Being cleaned</span>
                      </div>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Table Detail Drawer */}
      <AnimatePresence>
        {selectedTable && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSelectedTable(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl overflow-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold">Table {selectedTable.number}</h2>
                    <p className="text-gray-500">Capacity: {selectedTable.capacity} guests</p>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedTable(null)}>✕</Button>
                </div>
                
                {/* Status */}
                <div className={cn(
                  "p-4 rounded-xl mb-6",
                  STATUS_CONFIG[selectedTable.status].bgColor
                )}>
                  <div className="flex items-center justify-between">
                    <Badge className={cn(
                      "text-lg px-4 py-2",
                      selectedTable.status === "available" && "bg-green-500",
                      selectedTable.status === "occupied" && "bg-blue-500",
                      selectedTable.status === "reserved" && "bg-purple-500",
                      selectedTable.status === "cleaning" && "bg-yellow-500",
                    )}>
                      {STATUS_CONFIG[selectedTable.status].label}
                    </Badge>
                    {selectedTable.currentGuests && (
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <span className="font-bold">{selectedTable.currentGuests} guests</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Occupied Details */}
                {selectedTable.status === "occupied" && (
                  <div className="space-y-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Guest Name</p>
                      <p className="text-xl font-semibold">{selectedTable.guestName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Time Seated</p>
                        <p className="text-xl font-semibold">{getTimeAtTable(selectedTable.seatedAt!)}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Current Tab</p>
                        <p className="text-xl font-semibold text-green-600">${(selectedTable.orderTotal || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Reserved Details */}
                {selectedTable.status === "reserved" && selectedTable.reservation && (
                  <div className="space-y-4 mb-6">
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <p className="text-sm text-purple-600 mb-1">Reservation</p>
                      <p className="text-xl font-semibold">{selectedTable.reservation.name}</p>
                      <p className="text-gray-600">{selectedTable.reservation.guests} guests</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Arrival Time</p>
                      <p className="text-xl font-semibold">
                        {new Date(selectedTable.reservation.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-gray-500">In {getTimeUntil(selectedTable.reservation.time)}</p>
                    </div>
                    {selectedTable.reservation.phone && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Phone</p>
                        <a href={`tel:${selectedTable.reservation.phone}`} className="text-blue-600 font-medium">
                          {selectedTable.reservation.phone}
                        </a>
                      </div>
                    )}
                    {selectedTable.reservation.notes && (
                      <div className="p-4 bg-yellow-50 rounded-xl">
                        <p className="text-sm text-yellow-600 mb-1">Notes</p>
                        <p>{selectedTable.reservation.notes}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* QR Code Link */}
                <div className="p-4 bg-gray-50 rounded-xl mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <QrCode className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="font-medium">Table QR Code</p>
                        <p className="text-sm text-gray-500">Guests can scan to order</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Link2 className="w-4 h-4 mr-1" />
                      Copy Link
                    </Button>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="space-y-3">
                  {selectedTable.status === "available" && (
                    <Button 
                      className="w-full bg-green-500 hover:bg-green-600"
                      onClick={() => {
                        const name = prompt("Guest name:")
                        const count = parseInt(prompt("Number of guests:") || "0")
                        if (name && count > 0) seatGuests(selectedTable.id, count, name)
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Seat Guests
                    </Button>
                  )}
                  
                  {selectedTable.status === "occupied" && (
                    <>
                      <Button className="w-full" variant="outline">
                        <UtensilsCrossed className="w-4 h-4 mr-2" />
                        View Order
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Receipt className="w-4 h-4 mr-2" />
                        Print Check
                      </Button>
                      <Button 
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        onClick={() => clearTable(selectedTable.id)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Close & Clear Table
                      </Button>
                    </>
                  )}
                  
                  {selectedTable.status === "reserved" && (
                    <>
                      <Button 
                        className="w-full bg-green-500 hover:bg-green-600"
                        onClick={() => {
                          if (selectedTable.reservation) {
                            seatGuests(selectedTable.id, selectedTable.reservation.guests, selectedTable.reservation.name)
                          }
                        }}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Seat Reservation
                      </Button>
                      <Button variant="outline" className="w-full text-red-600">
                        <X className="w-4 h-4 mr-2" />
                        Cancel Reservation
                      </Button>
                    </>
                  )}
                  
                  {selectedTable.status === "cleaning" && (
                    <Button 
                      className="w-full bg-green-500 hover:bg-green-600"
                      onClick={() => markCleaned(selectedTable.id)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark as Clean
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full">
                    <Bell className="w-4 h-4 mr-2" />
                    Alert Server
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
