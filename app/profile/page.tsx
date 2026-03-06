"use client"

import { useState } from "react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { User, Copy, TrendingUp, TrendingDown, DollarSign, History, Check } from "lucide-react"

export default function ProfilePage() {
  const [copied, setCopied] = useState(false)

  const user = {
    id: 12847,
    username: "Player_Demo",
    balance: 1000.0,
    totalDeposit: 5000.0,
    totalWithdraw: 3200.0,
    totalWins: 8450.0,
    totalLosses: 4250.0,
    referralCode: "PLAID-12847",
    registeredAt: "2026-01-15",
  }

  const recentActivity = [
    { type: "win", game: "Dice", amount: 250.0, time: "2 мин назад" },
    { type: "loss", game: "Mines", amount: -100.0, time: "5 мин назад" },
    { type: "deposit", game: "СБП", amount: 500.0, time: "1 час назад" },
    { type: "win", game: "Wheel", amount: 150.0, time: "2 часа назад" },
    { type: "loss", game: "Dice", amount: -75.0, time: "3 часа назад" },
    { type: "withdraw", game: "TON", amount: -200.0, time: "5 часов назад" },
  ]

  const copyCode = () => {
    navigator.clipboard.writeText(user.referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-4 flex flex-col gap-4">
        {/* Profile Header */}
        <div className="bg-card rounded-xl border border-border/50 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#2ee06e]/20 flex items-center justify-center">
              <User className="w-8 h-8 text-[#2ee06e]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{user.username}</h1>
              <p className="text-sm text-muted-foreground">ID: {user.id}</p>
              <p className="text-xs text-muted-foreground">
                Зарегистрирован: {user.registeredAt}
              </p>
            </div>
          </div>

          {/* Balance */}
          <div className="mt-4 bg-secondary rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Баланс</p>
              <p className="text-2xl font-black text-[#2ee06e]">{user.balance.toFixed(2)} ₽</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/deposit"
                className="bg-[#2ee06e] hover:bg-[#25c45c] text-[#0f1923] font-bold text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Пополнить
              </Link>
              <button className="bg-secondary border border-border hover:bg-border text-foreground font-bold text-sm px-4 py-2 rounded-lg transition-colors">
                Вывести
              </button>
            </div>
          </div>

          {/* Referral code */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 bg-secondary rounded-lg px-3 py-2 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">Реферальный код</p>
                <p className="text-sm font-semibold text-foreground">{user.referralCode}</p>
              </div>
              <button
                onClick={copyCode}
                className="p-1.5 rounded-md hover:bg-border transition-colors"
                aria-label="Copy code"
              >
                {copied ? <Check className="w-4 h-4 text-[#2ee06e]" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-card rounded-xl border border-border/50 p-4 flex flex-col items-center">
            <TrendingUp className="w-5 h-5 text-[#2ee06e] mb-1" />
            <p className="text-xs text-muted-foreground">Выигрыши</p>
            <p className="text-lg font-bold text-[#2ee06e]">{user.totalWins.toFixed(0)} ₽</p>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-4 flex flex-col items-center">
            <TrendingDown className="w-5 h-5 text-destructive mb-1" />
            <p className="text-xs text-muted-foreground">Проигрыши</p>
            <p className="text-lg font-bold text-destructive">{user.totalLosses.toFixed(0)} ₽</p>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-4 flex flex-col items-center">
            <DollarSign className="w-5 h-5 text-[#00b4d8] mb-1" />
            <p className="text-xs text-muted-foreground">Депозиты</p>
            <p className="text-lg font-bold text-[#00b4d8]">{user.totalDeposit.toFixed(0)} ₽</p>
          </div>
          <div className="bg-card rounded-xl border border-border/50 p-4 flex flex-col items-center">
            <DollarSign className="w-5 h-5 text-[#ffd93d] mb-1" />
            <p className="text-xs text-muted-foreground">Выводы</p>
            <p className="text-lg font-bold text-[#ffd93d]">{user.totalWithdraw.toFixed(0)} ₽</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Последняя активность</h2>
          </div>
          <div className="flex flex-col gap-2">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.type === "win" || item.type === "deposit" ? "bg-[#2ee06e]" : "bg-destructive"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.game}</p>
                    <p className="text-[10px] text-muted-foreground">{item.time}</p>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold ${
                    item.amount > 0 ? "text-[#2ee06e]" : "text-destructive"
                  }`}
                >
                  {item.amount > 0 ? "+" : ""}{item.amount.toFixed(2)} ₽
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
