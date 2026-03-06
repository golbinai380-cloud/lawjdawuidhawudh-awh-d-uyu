import { config } from './config'

// Types for TON API
export interface TonTransaction {
  hash: string
  lt: string
  account: {
    address: string
    is_scam: boolean
    is_wallet: boolean
  }
  success: boolean
  utime: number
  orig_status: string
  end_status: string
  in_msg?: {
    msg_type: string
    created_lt: string
    ihr_disabled: boolean
    bounce: boolean
    bounced: boolean
    value: number
    fwd_fee: number
    ihr_fee: number
    destination: {
      address: string
      is_scam: boolean
      is_wallet: boolean
    }
    source?: {
      address: string
      is_scam: boolean
      is_wallet: boolean
    }
    import_fee: number
    created_at: number
    op_code?: string
    raw_body?: string
    decoded_body?: {
      text?: string
    }
  }
  out_msgs: Array<{
    msg_type: string
    value: number
    destination: {
      address: string
    }
  }>
  total_fees: number
}

export interface TonTransactionsResponse {
  transactions: TonTransaction[]
}

export interface TonAccountInfo {
  address: string
  balance: number
  status: string
  name?: string
  is_scam: boolean
  is_wallet: boolean
  last_activity: number
}

// Generate unique comment for TON deposit
export function generateDepositComment(userId: string): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 6)
  return `PLAID-${userId}-${timestamp}-${random}`.toUpperCase()
}

// Parse deposit comment to extract user ID
export function parseDepositComment(comment: string): string | null {
  const match = comment.match(/PLAID-(\d+)-/i)
  return match ? match[1] : null
}

// Get account transactions
export async function getAccountTransactions(
  address: string,
  limit: number = 100,
  beforeLt?: string
): Promise<TonTransaction[]> {
  const params = new URLSearchParams({
    limit: limit.toString(),
  })
  
  if (beforeLt) {
    params.set('before_lt', beforeLt)
  }
  
  const url = `${config.ton.apiUrl}/v2/blockchain/accounts/${address}/transactions?${params}`
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (config.ton.apiKey) {
    headers['Authorization'] = `Bearer ${config.ton.apiKey}`
  }
  
  const response = await fetch(url, { headers })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`TON API error: ${response.status} - ${error}`)
  }
  
  const data: TonTransactionsResponse = await response.json()
  return data.transactions
}

// Get account info
export async function getAccountInfo(address: string): Promise<TonAccountInfo> {
  const url = `${config.ton.apiUrl}/v2/accounts/${address}`
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (config.ton.apiKey) {
    headers['Authorization'] = `Bearer ${config.ton.apiKey}`
  }
  
  const response = await fetch(url, { headers })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`TON API error: ${response.status} - ${error}`)
  }
  
  return response.json()
}

// Find deposit by comment
export async function findDepositByComment(comment: string): Promise<TonTransaction | null> {
  const transactions = await getAccountTransactions(config.ton.walletAddress, 100)
  
  for (const tx of transactions) {
    if (tx.in_msg?.decoded_body?.text === comment) {
      return tx
    }
  }
  
  return null
}

// Check pending deposits
export interface PendingDeposit {
  comment: string
  userId: string
  amountTon: number
  amountRub: number
  createdAt: number
  expiresAt: number
}

// Verify TON deposit and return amount
export async function verifyTonDeposit(
  comment: string,
  expectedAmountTon: number,
  tolerancePercent: number = 5
): Promise<{ verified: boolean; actualAmount: number; transaction?: TonTransaction }> {
  const transaction = await findDepositByComment(comment)
  
  if (!transaction) {
    return { verified: false, actualAmount: 0 }
  }
  
  // Check if this is an incoming transaction
  if (!transaction.in_msg || transaction.in_msg.value <= 0) {
    return { verified: false, actualAmount: 0 }
  }
  
  // Convert nanoTON to TON
  const actualAmount = transaction.in_msg.value / 1_000_000_000
  
  // Check amount with tolerance
  const minAmount = expectedAmountTon * (1 - tolerancePercent / 100)
  
  if (actualAmount >= minAmount) {
    return { verified: true, actualAmount, transaction }
  }
  
  return { verified: false, actualAmount, transaction }
}

// Convert TON to RUB
export function tonToRub(tonAmount: number): number {
  return tonAmount * config.ton.rubRate
}

// Convert RUB to TON
export function rubToTon(rubAmount: number): number {
  return rubAmount / config.ton.rubRate
}

// Generate Tonkeeper deep link for payment
export function generateTonkeeperLink(
  amountTon: number,
  comment: string
): string {
  const address = config.ton.walletAddress
  const amountNano = Math.floor(amountTon * 1_000_000_000)
  
  // Tonkeeper deep link format
  return `https://app.tonkeeper.com/transfer/${address}?amount=${amountNano}&text=${encodeURIComponent(comment)}`
}

// Generate TON payment link (universal)
export function generateTonPaymentLink(
  amountTon: number,
  comment: string
): string {
  const address = config.ton.walletAddress
  const amountNano = Math.floor(amountTon * 1_000_000_000)
  
  // ton:// link format
  return `ton://transfer/${address}?amount=${amountNano}&text=${encodeURIComponent(comment)}`
}
