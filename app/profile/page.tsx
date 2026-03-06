"use client"

import { useState } from "react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { User, Copy, TrendingUp, TrendingDown, DollarSign, Check } from "lucide-react"
import { useTelegram } from "@/components/telegram-provider"

export default function ProfilePage() {
  const [copied, setCopied] = useState(false)
  const { user: tgUser, isReady } = useTelegram()

  const user = {
    id: tgUser?.id || 12847,
    username: tgUser?.username ? `@${tgUser.username}` : (tgUser?.first_name || "Player_Demo"),
    firstName: tgUser?.first_name || "Demo",
    lastName: tgUser?.last_name || "",
    balance: 1000.0,
    totalDeposit: 5000.0,
    totalWithdraw: 3200.0,
    totalWins: 8450.0,
    totalLosses: 4250.0,
    referralCode: `PLAID-${tgUser?.id || 12847}`,
    registeredAt: "2026-01-15",
  }

  const copyCode = () => {
    navigator.clipboard.writeText(user.referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-3 py-3 flex flex-col gap-3">
        {/* Profile Header - Mobile Optimized */}
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center gap-3">
            {tgUser?.photo_url ? (
              <img 
                src={tgUser.photo_url} 
                alt={user.firstName}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#2ee06e]/30"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#2ee06e]/20 flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-[#2ee06e]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-foreground truncate">
                {user.firstName} {user.lastName}
              </h1>
              {tgUser?.username && (
                <p className="text-xs text-[#2aabee] truncate">{user.username}</p>
              )}
              <p className="text-[10px] text-muted-foreground font-mono">ID: {user.id}</p>
            </div>
          </div>

          {/* Balance - Mobile */}
          <div className="mt-3 bg-secondary rounded-xl p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{"Баланс"}</p>
                <p className="text-xl font-black text-[#2ee06e]">{user.balance.toFixed(2)} ₽</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/deposit"
                  className="bg-[#2ee06e] hover:bg-[#25c45c] text-[#0f1923] font-bold text-xs px-3 py-2 rounded-lg transition-colors"
                >
                  {"Пополнить"}
                </Link>
                <button className="bg-secondary border border-border hover:bg-border text-foreground font-bold text-xs px-3 py-2 rounded-lg transition-colors">
                  {"Вывести"}
                </button>
              </div>
            </div>
          </div>

          {/* Referral code - Compact */}
          <div className="mt-2 flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground">{"Реферальный код"}</p>
              <p className="text-xs font-semibold text-foreground truncate">{user.referralCode}</p>
            </div>
            <button
              onClick={copyCode}
              className="p-1.5 rounded-md hover:bg-border transition-colors flex-shrink-0"
              aria-label="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-[#2ee06e]" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
        </div>

        {/* Stats - 2x2 Grid for Mobile */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-card rounded-xl border border-border/50 p-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2ee06e] flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">{"Выигрыши"}</p>
              <p className="text-sm font-bold text-[#2ee06e] truncate">{user.totalWins.toFixed(0)} ₽</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-3 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-destructive flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">{"Проигрыши"}</p>
              <p className="text-sm font-bold text-destructive truncate">{user.totalLosses.toFixed(0)} ₽</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#00b4d8] flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">{"Депозиты"}</p>
              <p className="text-sm font-bold text-[#00b4d8] truncate">{user.totalDeposit.toFixed(0)} ₽</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#ffd93d] flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">{"Выводы"}</p>
              <p className="text-sm font-bold text-[#ffd93d] truncate">{user.totalWithdraw.toFixed(0)} ₽</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/referral"
            className="bg-card rounded-xl border border-border/50 p-3 text-center hover:bg-secondary transition-colors"
          >
            <p className="text-xs font-semibold text-foreground">{"Рефералы"}</p>
            <p className="text-[10px] text-muted-foreground">{"Пригласи друзей"}</p>
          </Link>
          <Link
            href="/"
            className="bg-card rounded-xl border border-border/50 p-3 text-center hover:bg-secondary transition-colors"
          >
            <p className="text-xs font-semibold text-foreground">{"Игры"}</p>
            <p className="text-[10px] text-muted-foreground">{"К играм"}</p>
          </Link>
        </div>

        {/* Telegram Info */}
        {isReady && tgUser && (
          <div className="bg-[#2aabee]/10 rounded-xl border border-[#2aabee]/30 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded bg-[#2aabee] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-3 h-3 text-white fill-current">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>
              <span className="text-xs font-semibold text-[#2aabee]">Telegram</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <p className="text-muted-foreground">ID</p>
                <p className="font-mono text-foreground">{tgUser.id}</p>
              </div>
              {tgUser.username && (
                <div>
                  <p className="text-muted-foreground">Username</p>
                  <p className="text-[#2aabee]">@{tgUser.username}</p>
                </div>
              )}
              {tgUser.language_code && (
                <div>
                  <p className="text-muted-foreground">{"Язык"}</p>
                  <p className="text-foreground uppercase">{tgUser.language_code}</p>
                </div>
              )}
              {tgUser.is_premium && (
                <div>
                  <p className="text-muted-foreground">Premium</p>
                  <p className="text-[#ffd93d]">{"Активен"}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
