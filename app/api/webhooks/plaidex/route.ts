import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, type WebhookPayload } from '@/lib/plaidex'
import { notifyAdmins, sendDepositConfirmation } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('X-Signature') || ''
    const payload = await request.text()
    
    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }
    
    const data: WebhookPayload = JSON.parse(payload)
    
    console.log('[Plaidex Webhook]', data.notificationType, data.invoice.id)
    
    switch (data.notificationType) {
      case 'invoice_created':
        // Invoice was created
        console.log('Invoice created:', data.invoice.id)
        break
        
      case 'trader_assigned':
        // Trader assigned, payment requisites available
        console.log('Trader assigned for invoice:', data.invoice.id)
        break
        
      case 'payment_confirmed':
        // Payment confirmed - credit user balance
        await handlePaymentConfirmed(data)
        break
        
      case 'invoice_cancelled':
        // Invoice was cancelled
        console.log('Invoice cancelled:', data.invoice.id)
        break
        
      case 'invoice_expired':
        // Invoice expired
        console.log('Invoice expired:', data.invoice.id)
        break
        
      case 'dispute_created':
        // Dispute created - notify admins
        await notifyAdmins(
          `Создан диспут!\n\nInvoice: ${data.invoice.id}\nAmount: ${data.invoice.amount} ${data.invoice.currency}`
        )
        break
        
      default:
        console.log('Unknown webhook type:', data.notificationType)
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentConfirmed(data: WebhookPayload) {
  const { invoice, payment } = data
  
  // Extract user ID from internal_id (format: dep-{userId}-{timestamp})
  const userIdMatch = invoice.internal_id.match(/dep-(\d+)-/)
  if (!userIdMatch) {
    console.error('Could not extract user ID from internal_id:', invoice.internal_id)
    return
  }
  
  const userId = parseInt(userIdMatch[1])
  const amount = parseFloat(invoice.amount)
  
  // Here you would update the user's balance in your database
  // For now, we'll just log and notify
  console.log(`[Payment Confirmed] User: ${userId}, Amount: ${amount} ${invoice.currency}`)
  
  // TODO: Update user balance in database
  // await updateUserBalance(userId, amount)
  
  // Send confirmation to user
  const method = payment?.payment_method 
    ? `${payment.payment_method.bank} (${payment.payment_method.type})`
    : 'СБП'
  
  await sendDepositConfirmation(userId, amount, method)
  
  // Notify admins
  await notifyAdmins(
    `Пополнение подтверждено!\n\nUser ID: ${userId}\nAmount: ${amount} ${invoice.currency}\nMethod: ${method}\nInvoice: ${invoice.id}`
  )
}
