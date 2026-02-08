// Gift Card System
import { prisma } from "./prisma"

// Gift card code format: XXXX-XXXX-XXXX (12 chars)
function generateGiftCardCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Exclude confusing chars
  let code = ""
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-"
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Gift card amounts
export const GIFT_CARD_AMOUNTS = [25, 50, 75, 100, 150, 200]

export interface GiftCard {
  id: string
  code: string
  initialAmount: number
  currentBalance: number
  purchaserEmail: string
  recipientEmail?: string
  recipientName?: string
  message?: string
  restaurantId: string
  purchasedAt: Date
  expiresAt?: Date
  isActive: boolean
}

export interface GiftCardPurchase {
  amount: number
  purchaserEmail: string
  purchaserName: string
  recipientEmail?: string
  recipientName?: string
  message?: string
  restaurantId: string
}

export interface GiftCardRedemption {
  giftCardCode: string
  amount: number
  orderId: string
}

// Create a new gift card
export async function createGiftCard(
  purchase: GiftCardPurchase
): Promise<GiftCard> {
  const code = generateGiftCardCode()
  
  // Default expiration: 1 year from now
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  const giftCard = await prisma.giftCard.create({
    data: {
      code,
      initialAmount: purchase.amount,
      currentBalance: purchase.amount,
      purchaserEmail: purchase.purchaserEmail,
      purchaserName: purchase.purchaserName,
      recipientEmail: purchase.recipientEmail,
      recipientName: purchase.recipientName,
      message: purchase.message,
      restaurantId: purchase.restaurantId,
      expiresAt,
      isActive: true,
    },
  })

  return giftCard as GiftCard
}

// Get gift card by code
export async function getGiftCardByCode(
  code: string,
  restaurantId: string
): Promise<GiftCard | null> {
  const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "")
  const formattedCode = `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4, 8)}-${normalizedCode.slice(8, 12)}`

  const giftCard = await prisma.giftCard.findFirst({
    where: {
      code: formattedCode,
      restaurantId,
    },
  })

  return giftCard as GiftCard | null
}

// Validate gift card for use
export async function validateGiftCard(
  code: string,
  restaurantId: string
): Promise<{ valid: boolean; balance?: number; error?: string }> {
  const giftCard = await getGiftCardByCode(code, restaurantId)

  if (!giftCard) {
    return { valid: false, error: "Gift card not found" }
  }

  if (!giftCard.isActive) {
    return { valid: false, error: "Gift card is no longer active" }
  }

  if (giftCard.expiresAt && new Date() > giftCard.expiresAt) {
    return { valid: false, error: "Gift card has expired" }
  }

  if (giftCard.currentBalance <= 0) {
    return { valid: false, error: "Gift card has no remaining balance" }
  }

  return { valid: true, balance: giftCard.currentBalance }
}

// Redeem gift card (use balance)
export async function redeemGiftCard(
  redemption: GiftCardRedemption,
  restaurantId: string
): Promise<{ success: boolean; remainingBalance?: number; error?: string }> {
  const giftCard = await getGiftCardByCode(redemption.giftCardCode, restaurantId)

  if (!giftCard) {
    return { success: false, error: "Gift card not found" }
  }

  const validation = await validateGiftCard(redemption.giftCardCode, restaurantId)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  if (redemption.amount > giftCard.currentBalance) {
    return { 
      success: false, 
      error: `Insufficient balance. Available: $${giftCard.currentBalance.toFixed(2)}` 
    }
  }

  const newBalance = giftCard.currentBalance - redemption.amount

  // Update gift card balance
  await prisma.giftCard.update({
    where: { id: giftCard.id },
    data: {
      currentBalance: newBalance,
      isActive: newBalance > 0, // Deactivate if fully used
    },
  })

  // Record the transaction
  await prisma.giftCardTransaction.create({
    data: {
      giftCardId: giftCard.id,
      amount: -redemption.amount,
      orderId: redemption.orderId,
      balanceAfter: newBalance,
      type: "REDEMPTION",
    },
  })

  return { success: true, remainingBalance: newBalance }
}

// Check balance
export async function checkBalance(
  code: string,
  restaurantId: string
): Promise<{ balance: number; expiresAt?: Date } | null> {
  const giftCard = await getGiftCardByCode(code, restaurantId)

  if (!giftCard || !giftCard.isActive) {
    return null
  }

  return {
    balance: giftCard.currentBalance,
    expiresAt: giftCard.expiresAt || undefined,
  }
}

// Get gift card history
export async function getGiftCardTransactions(
  code: string,
  restaurantId: string
) {
  const giftCard = await getGiftCardByCode(code, restaurantId)

  if (!giftCard) {
    return null
  }

  const transactions = await prisma.giftCardTransaction.findMany({
    where: { giftCardId: giftCard.id },
    orderBy: { createdAt: "desc" },
  })

  return {
    giftCard,
    transactions,
  }
}

// Add balance to existing gift card (for reloads/refunds)
export async function addBalance(
  code: string,
  amount: number,
  restaurantId: string,
  reason: string = "RELOAD"
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const giftCard = await getGiftCardByCode(code, restaurantId)

  if (!giftCard) {
    return { success: false, error: "Gift card not found" }
  }

  const newBalance = giftCard.currentBalance + amount

  await prisma.giftCard.update({
    where: { id: giftCard.id },
    data: {
      currentBalance: newBalance,
      isActive: true,
    },
  })

  await prisma.giftCardTransaction.create({
    data: {
      giftCardId: giftCard.id,
      amount: amount,
      balanceAfter: newBalance,
      type: reason,
    },
  })

  return { success: true, newBalance }
}
