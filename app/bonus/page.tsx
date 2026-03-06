"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Gift, Clock, CheckCircle, Star } from "lucide-react"

export default function BonusPage() {
  const [dailyClaimed, setDailyClaimed] = useState(false)
  const [timeLeft, setTimeLeft] = useState("")

  // Daily timer
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setHours(24, 0, 0, 0)
      const diff = tomorrow.getTime() - now.getTime()
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const bonuses = [
    {
      title: "Ежедневный бонус",
      description: "Получайте бонус каждый день! Заходите ежедневно для увеличения награды.",
      icon: Clock,
      action: dailyClaimed ? "Получено" : "Получить",
      disabled: dailyClaimed,
      reward: "25 ₽",
      color: "#2ee06e",
    },
    {
      title: "Бонус за депозит",
      description: "Получите +10% к первому депозиту от 500 ₽.",
      icon: Gift,
      action: "Пополнить",
      disabled: false,
      reward: "+10%",
      color: "#00b4d8",
    },
    {
      title: "Бонус за Telegram",
      description: "Подпишитесь на наш Telegram канал и получите бонус.",
      icon: Star,
      action: "Подписаться",
      disabled: false,
      reward: "50 ₽",
      color: "#ffd93d",
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-4 flex flex-col gap-4">
        <h1 className="text-xl font-bold text-foreground">Бонусы</h1>

        {/* Daily Bonus Timer */}
        <div className="bg-gradient-to-r from-[#2ee06e]/20 to-[#00b4d8]/20 rounded-xl border border-[#2ee06e]/30 p-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">До следующего бонуса</p>
          <p className="text-3xl font-black text-foreground tracking-wider">{timeLeft}</p>
        </div>

        {/* Bonus Cards */}
        <div className="grid gap-3">
          {bonuses.map((bonus, i) => (
            <div key={i} className="bg-card rounded-xl border border-border/50 p-4 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${bonus.color}20` }}
              >
                <bonus.icon className="w-6 h-6" style={{ color: bonus.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{bonus.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{bonus.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-sm font-bold" style={{ color: bonus.color }}>
                  {bonus.reward}
                </span>
                <button
                  onClick={() => {
                    if (i === 0 && !dailyClaimed) setDailyClaimed(true)
                  }}
                  disabled={bonus.disabled}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    bonus.disabled
                      ? "bg-secondary text-muted-foreground"
                      : "bg-secondary hover:bg-border text-foreground"
                  }`}
                >
                  {bonus.disabled && i === 0 ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Получено
                    </span>
                  ) : (
                    bonus.action
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Promo Section */}
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Активировать промо-код</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Введите промо-код"
              className="flex-1 bg-secondary text-sm text-foreground px-3 py-2.5 rounded-lg outline-none placeholder:text-muted-foreground/50"
            />
            <button className="bg-[#2ee06e] hover:bg-[#25c45c] text-[#0f1923] font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors">
              Активировать
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
