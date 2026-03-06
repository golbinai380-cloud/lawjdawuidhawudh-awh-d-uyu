import { NextRequest, NextResponse } from 'next/server'
import { getInvoice } from '@/lib/plaidex'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('invoiceId')
    
    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      )
    }
    
    const invoice = await getInvoice(invoiceId)
    
    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        status: invoice.status,
        amount: invoice.sum.amount,
        currency: invoice.sum.currency,
        expiresAt: invoice.expireAt,
        deals: invoice.deals?.map(deal => ({
          id: deal.id,
          status: deal.status,
          paymentMethod: deal.paymentMethod,
          paymentOption: deal.paymentOption,
          requisites: deal.requisites,
        })),
      }
    })
    
  } catch (error) {
    console.error('Invoice status error:', error)
    return NextResponse.json(
      { error: 'Failed to get invoice status' },
      { status: 500 }
    )
  }
}
