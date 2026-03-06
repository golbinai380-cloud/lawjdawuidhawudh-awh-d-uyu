import crypto from 'crypto'
import { config } from './config'

// Types for Plaidex API
export interface PlaidexInvoice {
  id: string
  internalId?: string
  userId?: string
  type: 'in' | 'out'
  status: 'new' | 'payment_pending' | 'paid' | 'cancelled' | 'expired' | 'dispute'
  paymentMethod?: string
  paymentOption?: string
  merchantBank?: string
  merchantPaymentType?: string
  sum: {
    amount: string
    currency: string
    subunit: number
  }
  storeId?: number
  storeName?: string
  createdAt: string
  expireAt: string
  invoiceUrl?: string
  deals?: PlaidexDeal[]
}

export interface PlaidexDeal {
  id: string
  type: string
  status: string
  paymentMethod: string
  paymentOption: string
  requisites?: {
    requisites: string
    holder: string
  }
  payment?: {
    takerSum: {
      amount: string
      currency: string
      subunit: number
    }
    date: string
  }
  isActive: boolean
}

export interface CreateInvoiceParams {
  type: 'in' | 'out'
  amount: string
  currency?: string
  internalId?: string
  userId?: string
  paymentMethod?: string
  paymentOption?: 'TO_CARD' | 'SBP' | 'SBPM' | 'NSPK'
  startDeal?: boolean
  notificationUrl?: string
  notificationToken?: string
  // For OUT invoices
  recipientName?: string
  recipientRequisites?: string
  recipientBank?: string
}

export interface WebhookPayload {
  notificationType: string
  timestamp: string
  invoice: {
    id: string
    internal_id: string
    status: string
    amount: string
    currency: string
    created_at: string
    expires_at: string
  }
  deals?: Array<{
    id: string
    status: string
    paymentMethod: string
    paymentOption: string
    requisites?: {
      requisites: string
      holder: string
    }
  }>
  payment?: {
    trader_id: number
    payment_method: {
      bank: string
      type: string
    }
    attachment_url?: string
  }
  metadata?: {
    confirmed_by: number
  }
}

// Calculate HMAC-SHA1 signature for Plaidex API
function calculateSignature(method: string, url: string, body: string): string {
  const stringToSign = method + url + body
  const signature = crypto
    .createHmac('sha1', config.plaidex.secretKey)
    .update(stringToSign)
    .digest('base64')
  return signature
}

// Create invoice (deposit or withdrawal)
export async function createInvoice(params: CreateInvoiceParams): Promise<PlaidexInvoice> {
  const url = `${config.plaidex.baseUrl}/invoices-v2`
  
  const data: CreateInvoiceParams = {
    ...params,
    currency: params.currency || 'RUB',
    notificationUrl: params.notificationUrl || config.plaidex.notificationUrl,
  }
  
  const body = JSON.stringify(data)
  const signature = calculateSignature('POST', url, body)
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Identity': config.plaidex.merchantId,
      'X-Signature': signature,
    },
    body,
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Plaidex API error: ${response.status} - ${error}`)
  }
  
  return response.json()
}

// Get invoice by ID
export async function getInvoice(invoiceId: string): Promise<PlaidexInvoice> {
  const url = `${config.plaidex.baseUrl}/invoices/${invoiceId}`
  const body = ''
  const signature = calculateSignature('GET', url, body)
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Identity': config.plaidex.merchantId,
      'X-Signature': signature,
    },
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Plaidex API error: ${response.status} - ${error}`)
  }
  
  return response.json()
}

// Cancel invoice
export async function cancelInvoice(invoiceId: string): Promise<void> {
  const url = `${config.plaidex.baseUrl}/invoices/${invoiceId}/cancel`
  const body = ''
  const signature = calculateSignature('POST', url, body)
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Identity': config.plaidex.merchantId,
      'X-Signature': signature,
    },
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Plaidex API error: ${response.status} - ${error}`)
  }
}

// Verify webhook signature
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const calculated = crypto
    .createHmac('sha1', config.plaidex.secretKey)
    .update(payload)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(signature))
}

// Create deposit invoice (simplified)
export async function createDepositInvoice(
  amount: number,
  userId: string,
  paymentOption: 'SBP' | 'TO_CARD' = 'SBP',
  paymentMethod?: string
): Promise<PlaidexInvoice> {
  const internalId = `dep-${userId}-${Date.now()}`
  
  return createInvoice({
    type: 'in',
    amount: amount.toFixed(2),
    currency: 'RUB',
    internalId,
    userId,
    paymentOption,
    paymentMethod,
    startDeal: true,
  })
}

// Create withdrawal invoice
export async function createWithdrawalInvoice(
  amount: number,
  userId: string,
  recipientName: string,
  recipientCard: string,
  recipientPhone: string,
  recipientBank: string = 'TBANK'
): Promise<PlaidexInvoice> {
  const internalId = `out-${userId}-${Date.now()}`
  
  return createInvoice({
    type: 'out',
    amount: amount.toFixed(2),
    currency: 'RUB',
    internalId,
    userId,
    paymentMethod: recipientBank,
    paymentOption: 'TO_CARD',
    recipientName,
    recipientRequisites: `card:${recipientCard}; phone:${recipientPhone}`,
    recipientBank,
  })
}
