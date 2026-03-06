// Bot and API Configuration
export const config = {
  // Telegram Bot Configuration
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    botUsername: process.env.TELEGRAM_BOT_USERNAME || 'plaid_casino_bot',
    adminIds: (process.env.TELEGRAM_ADMIN_IDS || '').split(',').filter(Boolean).map(id => parseInt(id.trim())),
    channelId: process.env.TELEGRAM_CHANNEL_ID || '',
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || '',
  },
  
  // Plaidex Payment API Configuration
  plaidex: {
    merchantId: process.env.PLAIDEX_MERCHANT_ID || '',
    secretKey: process.env.PLAIDEX_SECRET_KEY || '',
    baseUrl: process.env.PLAIDEX_BASE_URL || 'https://app.plaidex.space/api/v1/merchant-v2',
    notificationUrl: process.env.PLAIDEX_NOTIFICATION_URL || '',
  },
  
  // TON/Tonkeeper Configuration
  ton: {
    walletAddress: process.env.TON_WALLET_ADDRESS || '',
    apiKey: process.env.TONAPI_KEY || '',
    apiUrl: process.env.TONAPI_URL || 'https://tonapi.io',
    // Minimum deposit in TON
    minDeposit: parseFloat(process.env.TON_MIN_DEPOSIT || '1'),
    // TON to RUB rate (or use API for real rates)
    rubRate: parseFloat(process.env.TON_RUB_RATE || '350'),
  },
  
  // App Configuration
  app: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://plaid.app',
    name: 'PLAID',
    supportChat: process.env.TELEGRAM_SUPPORT_CHAT || 'https://t.me/plaid_support',
  },
  
  // Payment limits
  limits: {
    minDepositRub: 100,
    maxDepositRub: 500000,
    minWithdrawRub: 500,
    maxWithdrawRub: 100000,
  },
}

// Validate required config
export function validateConfig() {
  const errors: string[] = []
  
  if (!config.telegram.botToken) {
    errors.push('TELEGRAM_BOT_TOKEN is required')
  }
  
  if (!config.plaidex.merchantId) {
    errors.push('PLAIDEX_MERCHANT_ID is required')
  }
  
  if (!config.plaidex.secretKey) {
    errors.push('PLAIDEX_SECRET_KEY is required')
  }
  
  if (!config.ton.walletAddress) {
    errors.push('TON_WALLET_ADDRESS is required')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

// Check if user is admin
export function isAdmin(telegramId: number): boolean {
  return config.telegram.adminIds.includes(telegramId)
}
