"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Settings,
  Truck,
  Users,
  Gift,
  TestTube,
  Check,
  X,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface IntegrationSettings {
  doordashSandboxMode: boolean
  ghlEnabled: boolean
  ghlApiKey?: string
  ghlLocationId?: string
  giftCardsEnabled: boolean
  giftCardExpirationDays: number
  deliveryEnabled: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<IntegrationSettings>({
    doordashSandboxMode: true,
    ghlEnabled: false,
    giftCardsEnabled: true,
    giftCardExpirationDays: 365,
    deliveryEnabled: true,
  })
  const [loading, setLoading] = useState(true)
  const [, setSaving] = useState(false)
  const [testingGHL, setTestingGHL] = useState(false)
  const [showGHLKey, setShowGHLKey] = useState(false)
  const [ghlTestResult, setGhlTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [ghlCredentials, setGhlCredentials] = useState({
    apiKey: "",
    locationId: "",
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings?restaurantId=demo")
      const data = await res.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (updates: Partial<IntegrationSettings>) => {
    setSaving(true)
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: "demo",
          settings: updates,
        }),
      })
      setSettings({ ...settings, ...updates })
    } catch (err) {
      console.error("Failed to save settings:", err)
    } finally {
      setSaving(false)
    }
  }

  const testGHLConnection = async () => {
    setTestingGHL(true)
    setGhlTestResult(null)
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          integration: "ghl",
          credentials: ghlCredentials,
        }),
      })
      const data = await res.json()
      setGhlTestResult({
        success: data.success,
        message: data.message || data.error,
      })
      if (data.success) {
        // Save credentials
        await saveSettings({
          ghlEnabled: true,
          ghlApiKey: ghlCredentials.apiKey,
          ghlLocationId: ghlCredentials.locationId,
        })
      }
    } catch {
      setGhlTestResult({
        success: false,
        message: "Connection failed",
      })
    } finally {
      setTestingGHL(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Settings</h1>
              <p className="text-sm text-gray-500">Manage integrations and features</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* DoorDash Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">DoorDash Drive</h2>
                <p className="text-sm text-gray-500">Delivery integration</p>
              </div>
            </div>
            <Badge className={settings.deliveryEnabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
              {settings.deliveryEnabled ? "Active" : "Disabled"}
            </Badge>
          </div>

          <div className="p-6 space-y-6">
            {/* Sandbox Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <TestTube className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium">Sandbox Mode</h3>
                  <p className="text-sm text-amber-700">
                    Test deliveries without real orders
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.doordashSandboxMode}
                onCheckedChange={(checked) => saveSettings({ doordashSandboxMode: checked })}
              />
            </div>

            {settings.doordashSandboxMode && (
              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                <h4 className="font-medium text-sm text-gray-700">Sandbox Features:</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Simulated delivery creation
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Auto-progressing delivery status
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Test tracking page
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Simulated dasher info
                  </li>
                </ul>
                <Link href="/dashboard/settings/delivery-test">
                  <Button variant="outline" className="w-full mt-4">
                    <Play className="w-4 h-4 mr-2" />
                    Test Delivery Flow
                  </Button>
                </Link>
              </div>
            )}

            {!settings.doordashSandboxMode && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Production Mode Active</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Real deliveries will be created through DoorDash
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Go High Level Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Go High Level CRM</h2>
                <p className="text-sm text-gray-500">Customer management integration</p>
              </div>
            </div>
            <Badge className={settings.ghlEnabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
              {settings.ghlEnabled ? "Connected" : "Not Connected"}
            </Badge>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label>API Key</Label>
                <div className="relative">
                  <Input
                    type={showGHLKey ? "text" : "password"}
                    placeholder="Enter your Go High Level API key"
                    value={ghlCredentials.apiKey}
                    onChange={(e) => setGhlCredentials({ ...ghlCredentials, apiKey: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowGHLKey(!showGHLKey)}
                  >
                    {showGHLKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label>Location ID</Label>
                <Input
                  placeholder="Enter your GHL Location ID"
                  value={ghlCredentials.locationId}
                  onChange={(e) => setGhlCredentials({ ...ghlCredentials, locationId: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={testGHLConnection}
                disabled={testingGHL || !ghlCredentials.apiKey || !ghlCredentials.locationId}
              >
                {testingGHL ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
              <a
                href="https://highlevel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                Get API Key
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {ghlTestResult && (
              <div
                className={cn(
                  "p-4 rounded-xl flex items-center gap-3",
                  ghlTestResult.success
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                )}
              >
                {ghlTestResult.success ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
                <span>{ghlTestResult.message}</span>
              </div>
            )}

            {settings.ghlEnabled && (
              <div className="p-4 bg-blue-50 rounded-xl space-y-3">
                <h4 className="font-medium text-blue-900">Features Enabled:</h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-500" />
                    Auto-create contacts on order
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-500" />
                    Order history notes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-500" />
                    &quot;Order X out of Y&quot; tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-500" />
                    Loyalty tags (Repeat, Loyal, VIP)
                  </li>
                </ul>
              </div>
            )}
          </div>
        </motion.div>

        {/* Gift Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Gift Cards</h2>
                <p className="text-sm text-gray-500">Digital gift card system</p>
              </div>
            </div>
            <Switch
              checked={settings.giftCardsEnabled}
              onCheckedChange={(checked) => saveSettings({ giftCardsEnabled: checked })}
            />
          </div>

          {settings.giftCardsEnabled && (
            <div className="p-6 space-y-4">
              <div>
                <Label>Expiration Period (Days)</Label>
                <Input
                  type="number"
                  value={settings.giftCardExpirationDays}
                  onChange={(e) =>
                    saveSettings({ giftCardExpirationDays: parseInt(e.target.value) || 365 })
                  }
                  min={30}
                  max={730}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Gift cards will expire after this many days from purchase
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Available Amounts:</h4>
                <div className="flex flex-wrap gap-2">
                  {[25, 50, 75, 100, 150, 200].map((amount) => (
                    <Badge key={amount} variant="outline">
                      ${amount}
                    </Badge>
                  ))}
                </div>
              </div>

              <Link href="/giftcards">
                <Button variant="outline" className="w-full">
                  <Gift className="w-4 h-4 mr-2" />
                  View Gift Card Portal
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
