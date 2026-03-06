import { NextRequest, NextResponse } from 'next/server'
import { createDepositInvoice } from '@/lib/plaidex'
import { generateDepositComment, rubToTon, generateTonkeeperLink } from '@/lib/tonapi'
import { config } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, method, userId, paymentOption } = body

    // Validate amount
    if (!amount || amount < config.limits.minDepositRub || amount > config.limits.maxDepositRub) {
      return NextResponse.json(
        { error: `Сумма должна быть от ${config.limits.minDepositRub} до ${config.limits.maxDepositRub} ₽` },
        { status: 400 }
      )
    }

    // Validate user ID
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Handle TON payment
    if (method === 'ton') {
      const comment = generateDepositComment(userId)
      const amountTon = rubToTon(amount)
      const tonkeeperLink = generateTonkeeperLink(amountTon, comment)
      
      return NextResponse.json({
        success: true,
        method: 'ton',
        data: {
          comment,
          amountTon: amountTon.toFixed(4),
          amountRub: amount,
          walletAddress: config.ton.walletAddress,
          tonkeeperLink,
          expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
        }
      })
    }

    // Handle SBP payment via Plaidex
    if (method === 'sbp') {
      const invoice = await createDepositInvoice(
        amount,
        userId,
        paymentOption || 'SBP'
      )

      return NextResponse.json({
        success: true,
        method: 'sbp',
        data: {
          invoiceId: invoice.id,
          invoiceUrl: invoice.invoiceUrl,
          amount: invoice.sum.amount,
          currency: invoice.sum.currency,
          status: invoice.status,
          expiresAt: invoice.expireAt,
          deals: invoice.deals,
        }
      })
    }

    // Handle card payment via Plaidex
    if (method === 'card') {
      const invoice = await createDepositInvoice(
        amount,
        userId,
        'TO_CARD',
        paymentOption // bank code like 'sberbank', 'tinkoff'
      )

      return NextResponse.json({
        success: true,
        method: 'card',
        data: {
          invoiceId: invoice.id,
          invoiceUrl: invoice.invoiceUrl,
          amount: invoice.sum.amount,
          currency: invoice.sum.currency,
          status: invoice.status,
          expiresAt: invoice.expireAt,
          deals: invoice.deals,
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid payment method' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Deposit creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create deposit' },
      { status: 500 }
    )
  }
}
