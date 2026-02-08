"use client"

import { XCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function OrderCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-gray-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Order Cancelled
        </h1>
        <p className="text-gray-600 mb-8">
          Your order was not completed. No payment has been processed.
        </p>

        <div className="space-y-3">
          <Link href="/checkout">
            <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Having trouble? <a href="#" className="text-orange-600 hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  )
}
