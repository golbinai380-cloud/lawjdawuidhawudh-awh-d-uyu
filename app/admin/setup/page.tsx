"use client"

import { useState } from "react"
import Header from "@/components/header"
import { ArrowLeft, Save, Eye, EyeOff, Info } from "lucide-react"
import Link from "next/link"

export default function SetupPage() {
  const [showSecrets, setShowSecrets] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [config, setConfig] = useState({
    telegramBotToken: "",
    telegramAdminIds: "",
    telegramBotUsername: "",
    plaidexMerchantId: "",
    plaidexSecretKey: "",
    tonWalletAddress: "",
    tonapiKey: "",
    tonRubRate: "350",
  })

  const handleChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    // In a real app, this would save to a secure backend
    console.log("Config to save:", config)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const envVars = `# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=${config.telegramBotToken || "your_bot_token"}
TELEGRAM_BOT_USERNAME=${config.telegramBotUsername || "your_bot_username"}
TELEGRAM_ADMIN_IDS=${config.telegramAdminIds || "123456789,987654321"}

# Plaidex Payment API
PLAIDEX_MERCHANT_ID=${config.plaidexMerchantId || "your_merchant_id"}
PLAIDEX_SECRET_KEY=${config.plaidexSecretKey || "your_secret_key"}
PLAIDEX_NOTIFICATION_URL=https://your-domain.com/api/webhooks/plaidex

# TON / Tonkeeper
TON_WALLET_ADDRESS=${config.tonWalletAddress || "UQD...your_wallet_address"}
TONAPI_KEY=${config.tonapiKey || "your_tonapi_key"}
TON_RUB_RATE=${config.tonRubRate || "350"}

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_BOT_CONFIGURED=true
NEXT_PUBLIC_PLAIDEX_CONFIGURED=true
NEXT_PUBLIC_TON_CONFIGURED=true
NEXT_PUBLIC_ADMINS_CONFIGURED=true`

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 flex flex-col gap-4">
        {/* Back */}
        <Link href="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Назад в админ панель
        </Link>

        <h1 className="text-xl font-bold text-foreground">Настройка конфигурации</h1>

        {/* Info */}
        <div className="bg-[#2aabee]/10 border border-[#2aabee]/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#2aabee] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground">
              <p className="font-semibold mb-1">Как настроить:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Заполните все поля ниже</li>
                <li>Скопируйте сгенерированные переменные окружения</li>
                <li>Добавьте их в настройках Vercel или в файл .env.local</li>
                <li>Перезапустите приложение</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Telegram Section */}
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#2aabee]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Telegram Bot
          </h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Bot Token</label>
              <div className="flex items-center gap-2">
                <input
                  type={showSecrets ? "text" : "password"}
                  value={config.telegramBotToken}
                  onChange={(e) => handleChange("telegramBotToken", e.target.value)}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  className="flex-1 bg-secondary text-sm text-foreground px-3 py-2.5 rounded-lg outline-none placeholder:text-muted-foreground/50 font-mono"
                />
                <button
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="p-2.5 bg-secondary rounded-lg hover:bg-border transition-colors"
                >
                  {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Получите у @BotFather в Telegram</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Bot Username</label>
              <input
                type="text"
                value={config.telegramBotUsername}
                onChange={(e) => handleChange("telegramBotUsername", e.target.value)}
                placeholder="plaid_casino_bot"
                className="w-full bg-secondary text-sm text-foreground px-3 py-2.5 rounded-lg outline-none placeholder:text-muted-foreground/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Admin Telegram IDs</label>
              <input
                type="text"
                value={config.telegramAdminIds}
                onChange={(e) => handleChange("telegramAdminIds", e.target.value)}
                placeholder="123456789,987654321"
                className="w-full bg-secondary text-sm text-foreground px-3 py-2.5 rounded-lg outline-none placeholder:text-muted-foreground/50 font-mono"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Через запятую, без пробелов</p>
            </div>
          </div>
        </div>

        {/* Plaidex Section */}
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#2ee06e] flex items-center justify-center text-[8px] font-bold text-[#0f1923]">P</span>
            Plaidex Payment API
          </h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Merchant ID</label>
              <input
                type="text"
                value={config.plaidexMerchantId}
                onChange={(e) => handleChange("plaidexMerchantId", e.target.value)}
                placeholder="your_merchant_id"
                className="w-full bg-secondary text-sm text-foreground px-3 py-2.5 rounded-lg outline-none placeholder:text-muted-foreground/50 font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Secret Key</label>
              <input
                type={showSecrets ? "text" : "password"}
                value={config.plaidexSecretKey}
                onChange={(e) => handleChange("plaidexSecretKey", e.target.value)}
                placeholder="your_secret_key"
                className="w-full bg-secondary text-sm text-foreground px-3 py-2.5 rounded-lg outline-none placeholder:text-muted-foreground/50 font-mono"
              />
            </div>
          </div>
        </div>

        {/* TON Section */}
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-4 h-4 text-[#0098ea]">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 19.5h20L12 2zm0 4l6.5 11.5h-13L12 6z"/>
              </svg>
            </span>
            TON / Tonkeeper
          </h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Wallet Address</label>
              <input
                type="text"
                value={config.tonWalletAddress}
                onChange={(e) => handleChange("tonWalletAddress", e.target.value)}
                placeholder="UQD...your_wallet_address"
                className="w-full bg-secondary text-sm text-foreground px-3 py-2.5 rounded-lg outline-none placeholder:text-muted-foreground/50 font-mono"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Адрес вашего TON кошелька для приема платежей</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">TONAPI Key (опционально)</label>
              <input
                type={showSecrets ? "text" : "password"}
                value={config.tonapiKey}
                onChange={(e) => handleChange("tonapiKey", e.target.value)}
                placeholder="your_tonapi_key"
                className="w-full bg-secondary text-sm text-foreground px-3 py-2.5 rounded-lg outline-none placeholder:text-muted-foreground/50 font-mono"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Для увеличения лимитов API. Получите на tonapi.io</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Курс TON/RUB</label>
              <input
                type="number"
                value={config.tonRubRate}
                onChange={(e) => handleChange("tonRubRate", e.target.value)}
                placeholder="350"
                className="w-full bg-secondary text-sm text-foreground px-3 py-2.5 rounded-lg outline-none placeholder:text-muted-foreground/50"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Сколько рублей за 1 TON</p>
            </div>
          </div>
        </div>

        {/* Generated ENV */}
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">Переменные окружения</h2>
          <div className="bg-[#0d1620] rounded-lg p-3 overflow-x-auto">
            <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">{envVars}</pre>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(envVars)
              setSaved(true)
              setTimeout(() => setSaved(false), 2000)
            }}
            className="mt-3 w-full bg-secondary hover:bg-border text-foreground font-semibold text-sm py-2.5 rounded-lg transition-colors"
          >
            {saved ? "Скопировано!" : "Копировать"}
          </button>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-[#2ee06e] hover:bg-[#25c45c] text-[#0f1923] font-bold text-base py-3.5 rounded-xl transition-all glow-green flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saved ? "Сохранено!" : "Сохранить конфигурацию"}
        </button>
      </main>
    </div>
  )
}
