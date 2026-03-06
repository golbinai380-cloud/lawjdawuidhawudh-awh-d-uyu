import { config } from './config'

// Telegram User type
export interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

// Telegram WebApp init data
export interface TelegramWebAppInitData {
  query_id?: string
  user?: TelegramUser
  auth_date: number
  hash: string
  start_param?: string
}

// Parse and validate Telegram WebApp init data
export function parseTelegramInitData(initDataString: string): TelegramWebAppInitData | null {
  try {
    const params = new URLSearchParams(initDataString)
    const data: Record<string, string> = {}
    
    params.forEach((value, key) => {
      data[key] = value
    })
    
    const user = data.user ? JSON.parse(data.user) : undefined
    
    return {
      query_id: data.query_id,
      user,
      auth_date: parseInt(data.auth_date),
      hash: data.hash,
      start_param: data.start_param,
    }
  } catch {
    return null
  }
}

// Validate Telegram WebApp init data hash
export async function validateTelegramInitData(initDataString: string): Promise<boolean> {
  if (!config.telegram.botToken) return false
  
  try {
    const params = new URLSearchParams(initDataString)
    const hash = params.get('hash')
    if (!hash) return false
    
    params.delete('hash')
    
    // Sort parameters
    const sortedParams = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')
    
    // Create secret key
    const encoder = new TextEncoder()
    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode('WebAppData'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const secretHash = await crypto.subtle.sign(
      'HMAC',
      secretKey,
      encoder.encode(config.telegram.botToken)
    )
    
    // Create data hash
    const dataKey = await crypto.subtle.importKey(
      'raw',
      secretHash,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const dataHash = await crypto.subtle.sign(
      'HMAC',
      dataKey,
      encoder.encode(sortedParams)
    )
    
    const calculatedHash = Array.from(new Uint8Array(dataHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    return calculatedHash === hash
  } catch {
    return false
  }
}

// Send message via Telegram Bot API
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  options?: {
    parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2'
    reply_markup?: object
    disable_notification?: boolean
  }
): Promise<boolean> {
  if (!config.telegram.botToken) return false
  
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: options?.parse_mode || 'HTML',
          reply_markup: options?.reply_markup,
          disable_notification: options?.disable_notification,
        }),
      }
    )
    
    return response.ok
  } catch {
    return false
  }
}

// Notify admins
export async function notifyAdmins(message: string): Promise<void> {
  for (const adminId of config.telegram.adminIds) {
    await sendTelegramMessage(adminId, message)
  }
}

// Send deposit confirmation to user
export async function sendDepositConfirmation(
  userId: number,
  amount: number,
  method: string
): Promise<boolean> {
  const text = `<b>Пополнение баланса</b>

Сумма: <b>${amount.toFixed(2)} ₽</b>
Метод: ${method}
Статус: <b>Успешно</b>

Баланс успешно пополнен! Приятной игры!`

  return sendTelegramMessage(userId, text)
}

// Send withdrawal confirmation to user
export async function sendWithdrawalConfirmation(
  userId: number,
  amount: number,
  method: string
): Promise<boolean> {
  const text = `<b>Вывод средств</b>

Сумма: <b>${amount.toFixed(2)} ₽</b>
Метод: ${method}
Статус: <b>Обрабатывается</b>

Ваша заявка на вывод принята. Средства поступят в течение 24 часов.`

  return sendTelegramMessage(userId, text)
}

// Get user profile photo URL
export async function getUserProfilePhoto(userId: number): Promise<string | null> {
  if (!config.telegram.botToken) return null
  
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${config.telegram.botToken}/getUserProfilePhotos?user_id=${userId}&limit=1`
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    if (!data.ok || !data.result?.photos?.length) return null
    
    const fileId = data.result.photos[0][0].file_id
    
    const fileResponse = await fetch(
      `https://api.telegram.org/bot${config.telegram.botToken}/getFile?file_id=${fileId}`
    )
    
    if (!fileResponse.ok) return null
    
    const fileData = await fileResponse.json()
    if (!fileData.ok) return null
    
    return `https://api.telegram.org/file/bot${config.telegram.botToken}/${fileData.result.file_path}`
  } catch {
    return null
  }
}

// User database type
export interface DatabaseUser {
  id: number // Telegram user ID
  username: string | null
  firstName: string
  lastName: string | null
  balance: number
  totalDeposit: number
  totalWithdraw: number
  totalWins: number
  totalLosses: number
  referralCode: string
  referredBy: number | null
  createdAt: string
  lastIp: string | null
  isBanned: boolean
  isVip: boolean
}

// Generate referral code from user ID
export function generateReferralCode(userId: number): string {
  return `PLAID-${userId}`
}

// Parse referral code to get user ID
export function parseReferralCode(code: string): number | null {
  const match = code.match(/PLAID-(\d+)/i)
  return match ? parseInt(match[1]) : null
}
