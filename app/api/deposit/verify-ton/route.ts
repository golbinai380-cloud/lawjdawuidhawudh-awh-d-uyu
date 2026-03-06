import { NextRequest, NextResponse } from 'next/server'
import { verifyTonDeposit, tonToRub, parseDepositComment } from '@/lib/tonapi'
import { notifyAdmins, sendDepositConfirmation } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { comment, expectedAmountTon } = body
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment is required' },
        { status: 400 }
      )
    }
    
    // Verify the deposit
    const result = await verifyTonDeposit(comment, expectedAmountTon || 0)
    
    if (!result.verified) {
      return NextResponse.json({
        success: false,
        verified: false,
        message: result.actualAmount > 0 
          ? 'Сумма платежа меньше ожидаемой'
          : 'Платеж не найден. Пожалуйста, подождите несколько минут и попробуйте снова.',
        actualAmount: result.actualAmount,
      })
    }
    
    // Extract user ID from comment
    const userId = parseDepositComment(comment)
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Invalid comment format',
      }, { status: 400 })
    }
    
    // Calculate RUB amount
    const amountRub = tonToRub(result.actualAmount)
    
    // TODO: Update user balance in database
    // await updateUserBalance(parseInt(userId), amountRub)
    
    console.log(`[TON Payment Verified] User: ${userId}, Amount: ${result.actualAmount} TON (${amountRub.toFixed(2)} RUB)`)
    
    // Send confirmation to user
    await sendDepositConfirmation(
      parseInt(userId),
      amountRub,
      `TON (${result.actualAmount.toFixed(4)} TON)`
    )
    
    // Notify admins
    await notifyAdmins(
      `TON Пополнение!\n\nUser ID: ${userId}\nAmount: ${result.actualAmount.toFixed(4)} TON\nRUB: ${amountRub.toFixed(2)} ₽\nTx: ${result.transaction?.hash || 'N/A'}`
    )
    
    return NextResponse.json({
      success: true,
      verified: true,
      actualAmountTon: result.actualAmount,
      amountRub: amountRub,
      transactionHash: result.transaction?.hash,
    })
    
  } catch (error) {
    console.error('TON verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify TON deposit' },
      { status: 500 }
    )
  }
}
