import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Gift card purchase endpoint
// For now, using in-memory storage since we're in demo mode
// In production, this would use Prisma

interface GiftCard {
  id: string
  code: string
  initialAmount: number
  currentBalance: number
  purchaserEmail: string
  purchaserName: string
  recipientEmail?: string
  recipientName?: string
  message?: string
  restaurantId: string
  purchasedAt: Date
  expiresAt: Date
  isActive: boolean
}

// In-memory store for demo (would be Prisma in production)
const giftCards = new Map<string, GiftCard>()

// Gift card code generation
function generateGiftCardCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-"
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

// POST - Purchase a gift card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      amount, 
      purchaserEmail, 
      purchaserName,
      recipientEmail, 
      recipientName, 
      message,
      restaurantId = "demo"
    } = body

    // Validate amount
    const validAmounts = [25, 50, 75, 100, 150, 200]
    if (!validAmounts.includes(amount)) {
      return NextResponse.json(
        { error: "Invalid gift card amount" },
        { status: 400 }
      )
    }

    // For demo mode, create gift card directly
    if (!process.env.STRIPE_SECRET_KEY) {
      const code = generateGiftCardCode()
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)

      const giftCard: GiftCard = {
        id: `gc_${Date.now()}`,
        code,
        initialAmount: amount,
        currentBalance: amount,
        purchaserEmail,
        purchaserName,
        recipientEmail,
        recipientName,
        message,
        restaurantId,
        purchasedAt: new Date(),
        expiresAt,
        isActive: true,
      }

      giftCards.set(code, giftCard)

      return NextResponse.json({
        success: true,
        giftCard: {
          code: giftCard.code,
          amount: giftCard.initialAmount,
          recipientName: giftCard.recipientName,
          message: giftCard.message,
          expiresAt: giftCard.expiresAt,
        },
        demoMode: true,
      })
    }

    // Create Stripe checkout session for gift card purchase
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Gift Card - $${amount}`,
              description: recipientName 
                ? `Gift for ${recipientName}` 
                : "Digital Gift Card",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/giftcards/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/giftcards?cancelled=true`,
      metadata: {
        type: "gift_card",
        amount: amount.toString(),
        purchaserEmail,
        purchaserName,
        recipientEmail: recipientEmail || "",
        recipientName: recipientName || "",
        message: message || "",
        restaurantId,
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("Gift card purchase error:", error)
    return NextResponse.json(
      { error: "Failed to process gift card purchase" },
      { status: 500 }
    )
  }
}

// GET - Check balance or validate gift card
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const restaurantId = searchParams.get("restaurantId") || "demo"

  if (!code) {
    return NextResponse.json(
      { error: "Gift card code required" },
      { status: 400 }
    )
  }

  // Normalize code
  const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "")
  const formattedCode = normalizedCode.length >= 12
    ? `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4, 8)}-${normalizedCode.slice(8, 12)}`
    : code.toUpperCase()

  // Use restaurantId for filtering in production
  void restaurantId

  // Check in-memory store (demo mode)
  const giftCard = giftCards.get(formattedCode)

  if (!giftCard) {
    // In demo mode, create a fake "found" card for testing with specific codes
    if (formattedCode === "DEMO-GIFT-CARD" || formattedCode === "TEST-1234-5678") {
      return NextResponse.json({
        valid: true,
        balance: 50.00,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        demoMode: true,
      })
    }

    return NextResponse.json({
      valid: false,
      error: "Gift card not found",
    })
  }

  // Check if active and not expired
  if (!giftCard.isActive) {
    return NextResponse.json({
      valid: false,
      error: "Gift card is no longer active",
    })
  }

  if (new Date() > giftCard.expiresAt) {
    return NextResponse.json({
      valid: false,
      error: "Gift card has expired",
    })
  }

  if (giftCard.currentBalance <= 0) {
    return NextResponse.json({
      valid: false,
      error: "Gift card has no remaining balance",
    })
  }

  return NextResponse.json({
    valid: true,
    balance: giftCard.currentBalance,
    expiresAt: giftCard.expiresAt,
  })
}
