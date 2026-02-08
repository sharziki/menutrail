import { NextRequest, NextResponse } from "next/server"

// In-memory store reference (shared with main route in production via Prisma)
// For demo purposes, we'll accept certain codes

interface RedemptionRecord {
  giftCardCode: string
  amount: number
  orderId: string
  redeemedAt: Date
  balanceAfter: number
}

const redemptions: RedemptionRecord[] = []

// POST - Redeem gift card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, amount, orderId, restaurantId = "demo" } = body

    if (!code || !amount || !orderId) {
      return NextResponse.json(
        { error: "Missing required fields: code, amount, orderId" },
        { status: 400 }
      )
    }

    // Normalize code
    const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "")
    const formattedCode = normalizedCode.length >= 12
      ? `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4, 8)}-${normalizedCode.slice(8, 12)}`
      : code.toUpperCase()

    // Demo mode: Accept test codes
    const testCodes: Record<string, number> = {
      "DEMO-GIFT-CARD": 50.00,
      "TEST-1234-5678": 100.00,
    }

    if (testCodes[formattedCode] !== undefined) {
      const balance = testCodes[formattedCode]
      
      if (amount > balance) {
        return NextResponse.json({
          success: false,
          error: `Insufficient balance. Available: $${balance.toFixed(2)}`,
        })
      }

      const remainingBalance = balance - amount
      
      redemptions.push({
        giftCardCode: formattedCode,
        amount,
        orderId,
        redeemedAt: new Date(),
        balanceAfter: remainingBalance,
      })

      return NextResponse.json({
        success: true,
        amountApplied: amount,
        remainingBalance,
        demoMode: true,
      })
    }

    // In production, this would query Prisma
    // For now, return not found for unknown codes
    return NextResponse.json({
      success: false,
      error: "Gift card not found",
    })
  } catch (error) {
    console.error("Gift card redemption error:", error)
    return NextResponse.json(
      { error: "Failed to redeem gift card" },
      { status: 500 }
    )
  }
}
