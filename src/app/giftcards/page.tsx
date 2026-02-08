"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Gift,
  CreditCard,
  Send,
  Check,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const GIFT_CARD_AMOUNTS = [25, 50, 75, 100, 150, 200]

type Tab = "buy" | "check"

export default function GiftCardsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("buy")
  const [selectedAmount, setSelectedAmount] = useState(50)
  // const [customAmount, setCustomAmount] = useState(""); void customAmount; void setCustomAmount // TODO: implement custom amounts // For future custom amount feature
  const [isGift, setIsGift] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkLoading, setCheckLoading] = useState(false)
  const [balanceResult, setBalanceResult] = useState<{
    valid: boolean
    balance?: number
    error?: string
    expiresAt?: string
  } | null>(null)
  const [purchaseResult, setPurchaseResult] = useState<{
    success: boolean
    code?: string
    amount?: number
  } | null>(null)

  const [formData, setFormData] = useState({
    purchaserEmail: "",
    purchaserName: "",
    recipientEmail: "",
    recipientName: "",
    message: "",
    checkCode: "",
  })

  const handlePurchase = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/giftcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedAmount,
          purchaserEmail: formData.purchaserEmail,
          purchaserName: formData.purchaserName,
          recipientEmail: isGift ? formData.recipientEmail : undefined,
          recipientName: isGift ? formData.recipientName : undefined,
          message: isGift ? formData.message : undefined,
        }),
      })
      const data = await res.json()

      if (data.url) {
        // Redirect to Stripe
        window.location.href = data.url
      } else if (data.success) {
        // Demo mode - show success
        setPurchaseResult({
          success: true,
          code: data.giftCard.code,
          amount: data.giftCard.amount,
        })
      }
    } catch (error) {
      console.error("Purchase error:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkBalance = async () => {
    if (!formData.checkCode) return
    setCheckLoading(true)
    setBalanceResult(null)

    try {
      const res = await fetch(`/api/giftcards?code=${encodeURIComponent(formData.checkCode)}`)
      const data = await res.json()
      setBalanceResult(data)
    } catch (_err) {
      void _err
      setBalanceResult({ valid: false, error: "Failed to check balance" })
    } finally {
      setCheckLoading(false)
    }
  }

  if (purchaseResult?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="max-w-lg mx-auto px-4 py-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Gift Card Created!</h1>
            <p className="text-gray-600 mb-6">
              Your ${purchaseResult.amount} gift card is ready
            </p>

            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white mb-6">
              <p className="text-sm opacity-80 mb-1">Gift Card Code</p>
              <p className="text-2xl font-mono font-bold tracking-widest">
                {purchaseResult.code}
              </p>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              This code has been sent to {formData.purchaserEmail}
            </p>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setPurchaseResult(null)
                  setFormData({
                    ...formData,
                    recipientEmail: "",
                    recipientName: "",
                    message: "",
                  })
                }}
              >
                Buy Another
              </Button>
              <Link href="/demo" className="flex-1">
                <Button className="w-full">Order Food</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/demo">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white">
              <Gift className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold">Gift Cards</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-gray-100 rounded-xl p-1 flex gap-1 mb-8">
          <button
            onClick={() => setActiveTab("buy")}
            className={cn(
              "flex-1 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2",
              activeTab === "buy"
                ? "bg-white shadow text-orange-600"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <CreditCard className="w-4 h-4" />
            Buy Gift Card
          </button>
          <button
            onClick={() => setActiveTab("check")}
            className={cn(
              "flex-1 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2",
              activeTab === "check"
                ? "bg-white shadow text-orange-600"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Gift className="w-4 h-4" />
            Check Balance
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "buy" ? (
            <motion.div
              key="buy"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Amount Selection */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="font-semibold mb-4">Select Amount</h2>
                <div className="grid grid-cols-3 gap-3">
                  {GIFT_CARD_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedAmount(amount)}
                      className={cn(
                        "py-4 rounded-xl font-bold text-lg transition border-2",
                        selectedAmount === amount
                          ? "border-orange-500 bg-orange-50 text-orange-600"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gift Option */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <button
                  onClick={() => setIsGift(!isGift)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isGift ? "bg-pink-100" : "bg-gray-100"
                    )}>
                      <Send className={cn("w-5 h-5", isGift ? "text-pink-600" : "text-gray-400")} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Send as a Gift</p>
                      <p className="text-sm text-gray-500">Send to someone special</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    isGift ? "border-orange-500 bg-orange-500" : "border-gray-300"
                  )}>
                    {isGift && <Check className="w-4 h-4 text-white" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isGift && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 space-y-4 border-t border-gray-100 mt-6">
                        <div>
                          <Label>Recipient&apos;s Name</Label>
                          <Input
                            placeholder="Their name"
                            value={formData.recipientName}
                            onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Recipient&apos;s Email</Label>
                          <Input
                            type="email"
                            placeholder="their@email.com"
                            value={formData.recipientEmail}
                            onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Personal Message (Optional)</Label>
                          <Textarea
                            placeholder="Add a personal note..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Your Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="font-semibold mb-4">Your Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Your Name</Label>
                    <Input
                      placeholder="Your name"
                      value={formData.purchaserName}
                      onChange={(e) => setFormData({ ...formData, purchaserName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Your Email</Label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.purchaserEmail}
                      onChange={(e) => setFormData({ ...formData, purchaserEmail: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="opacity-80">Gift Card Value</span>
                  <span className="text-2xl font-bold">${selectedAmount}</span>
                </div>
                <Button
                  onClick={handlePurchase}
                  disabled={loading || !formData.purchaserEmail || !formData.purchaserName}
                  className="w-full bg-white text-orange-600 hover:bg-gray-100 h-12"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Purchase Gift Card
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="check"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Check Balance Form */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="font-semibold mb-4">Check Your Balance</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Gift Card Code</Label>
                    <Input
                      placeholder="XXXX-XXXX-XXXX"
                      value={formData.checkCode}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase()
                        setFormData({ ...formData, checkCode: value })
                        setBalanceResult(null)
                      }}
                      className="font-mono text-lg tracking-widest"
                    />
                  </div>
                  <Button
                    onClick={checkBalance}
                    disabled={checkLoading || !formData.checkCode}
                    className="w-full"
                  >
                    {checkLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      "Check Balance"
                    )}
                  </Button>
                </div>
              </div>

              {/* Balance Result */}
              <AnimatePresence>
                {balanceResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                      "rounded-xl p-6",
                      balanceResult.valid
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    )}
                  >
                    {balanceResult.valid ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Gift className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-green-600 mb-2">Available Balance</p>
                        <p className="text-4xl font-bold text-green-700">
                          ${balanceResult.balance?.toFixed(2)}
                        </p>
                        {balanceResult.expiresAt && (
                          <p className="text-sm text-green-600 mt-2">
                            Expires: {new Date(balanceResult.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-red-600 font-medium">
                          {balanceResult.error}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Demo Hint */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-700">
                  <strong>Demo Mode:</strong> Try codes like{" "}
                  <code className="bg-amber-100 px-1 rounded">DEMO-GIFT-CARD</code> or{" "}
                  <code className="bg-amber-100 px-1 rounded">TEST-1234-5678</code>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
