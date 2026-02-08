"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Check, Gift, Mail, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function GiftCardSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [loading, setLoading] = useState(true)
  const [giftCard, setGiftCard] = useState<{
    code: string
    amount: number
    recipientName?: string
    recipientEmail?: string
  } | null>(null)

  useEffect(() => {
    // In production, verify the session with Stripe and get gift card details
    // For demo, show a sample success
    const timer = setTimeout(() => {
      setGiftCard({
        code: "GIFT-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" +
              Math.random().toString(36).substring(2, 6).toUpperCase() + "-" +
              Math.random().toString(36).substring(2, 6).toUpperCase(),
        amount: 50,
        recipientName: "Friend",
      })
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Creating your gift card...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <main className="max-w-lg mx-auto px-4 py-16">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Check className="w-10 h-10 text-green-600" />
            </motion.div>
            <h1 className="text-2xl font-bold">Gift Card Purchased!</h1>
            <p className="opacity-90 mt-1">Your gift is ready to share</p>
          </div>

          {/* Gift Card Display */}
          <div className="p-8">
            <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Digital Gift Card</span>
                </div>
                
                <div className="text-4xl font-bold mb-6">
                  ${giftCard?.amount}
                </div>
                
                <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                  <p className="text-xs opacity-80 mb-1">Gift Card Code</p>
                  <p className="font-mono text-lg tracking-widest">
                    {giftCard?.code}
                  </p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="mt-8 space-y-4">
              {giftCard?.recipientName && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sent to</p>
                    <p className="font-medium">{giftCard.recipientName}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Confirmation sent to</p>
                  <p className="font-medium">your email</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <Link href="/demo">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 h-12">
                  Order Food Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/giftcards">
                <Button variant="outline" className="w-full">
                  Buy Another Gift Card
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default function GiftCardSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    }>
      <GiftCardSuccessContent />
    </Suspense>
  )
}
