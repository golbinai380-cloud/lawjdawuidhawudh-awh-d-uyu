"use client"

import { useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ArrowLeft, Banknote, Wallet } from "lucide-react"
import Link from "next/link"

export default function DepositPage() {
  const [amount, setAmount] = useState(500)
  const [method, setMethod] = useState<"sbp" | "ton">("sbp")
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoBonus, setPromoBonus] = useState(0)

  const presets = [100, 250, 500, 1000, 2500, 5000]

  const applyPromo = () => {
    // Demo promo
    if (promoCode.toUpperCase() === "BONUS50") {
      setPromoBonus(50)
      setPromoApplied(true)
    } else if (promoCode.toUpperCase() === "START100") {
      setPromoBonus(100)
      setPromoApplied(true)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 flex flex-col gap-4">
        {/* Back */}
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Link>

        <h1 className="text-xl font-bold text-foreground">Пополнение баланса</h1>

        {/* Payment Method */}
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <p className="text-sm font-medium text-foreground mb-3">Способ оплаты</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMethod("sbp")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                method === "sbp"
                  ? "border-[#2ee06e] bg-[#2ee06e]/10"
                  : "border-border hover:border-border/80 bg-secondary"
              }`}
            >
              <Banknote className="w-8 h-8 text-[#2ee06e]" />
              <span className="text-sm font-semibold text-foreground">СБП</span>
              <span className="text-[10px] text-muted-foreground">Быстрые платежи</span>
            </button>
            <button
              onClick={() => setMethod("ton")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                method === "ton"
                  ? "border-[#00b4d8] bg-[#00b4d8]/10"
                  : "border-border hover:border-border/80 bg-secondary"
              }`}
            >
              <Wallet className="w-8 h-8 text-[#00b4d8]" />
              <span className="text-sm font-semibold text-foreground">TON</span>
              <span className="text-[10px] text-muted-foreground">Tonkeeper</span>
            </button>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <p className="text-sm font-medium text-foreground mb-3">Сумма</p>
          <div className="flex items-center bg-secondary rounded-lg overflow-hidden mb-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="flex-1 bg-transparent text-lg font-bold text-foreground px-4 py-3 outline-none min-w-0"
            />
            <span className="px-3 text-sm text-muted-foreground font-medium">₽</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(p)}
                className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                  amount === p
                    ? "bg-[#2ee06e] text-[#0f1923]"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {p} ₽
              </button>
            ))}
          </div>
        </div>

        {/* Promo Code */}
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <p className="text-sm font-medium text-foreground mb-3">Промо-код</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value)
                setPromoApplied(false)
                setPromoBonus(0)
              }}
              placeholder="Введите промо-код"
              className="flex-1 bg-secondary text-sm text-foreground px-3 py-2.5 rounded-lg outline-none placeholder:text-muted-foreground/50"
            />
            <button
              onClick={applyPromo}
              className="bg-secondary border border-border hover:bg-border text-foreground font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
              Применить
            </button>
          </div>
          {promoApplied && (
            <p className="text-xs text-[#2ee06e] mt-2">
              Промо-код применен! Бонус: +{promoBonus} ₽
            </p>
          )}
        </div>

        {/* Total */}
        <div className="bg-card rounded-xl border border-[#2ee06e]/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">К оплате:</span>
            <span className="text-lg font-bold text-foreground">{amount} ₽</span>
          </div>
          {promoBonus > 0 && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-muted-foreground">Бонус:</span>
              <span className="text-sm font-bold text-[#2ee06e]">+{promoBonus} ₽</span>
            </div>
          )}
          <div className="flex items-center justify-between mt-1 pt-2 border-t border-border">
            <span className="text-sm font-medium text-foreground">На баланс:</span>
            <span className="text-lg font-black text-[#2ee06e]">{amount + promoBonus} ₽</span>
          </div>
        </div>

        {/* Pay Button */}
        <button className="w-full bg-[#2ee06e] hover:bg-[#25c45c] text-[#0f1923] font-bold text-base py-3.5 rounded-xl transition-all glow-green">
          {method === "sbp" ? "Оплатить через СБП" : "Оплатить через Tonkeeper"}
        </button>
      </main>
      <Footer />
    </div>
  )
}
