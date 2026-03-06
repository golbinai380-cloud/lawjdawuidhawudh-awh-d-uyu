"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ArrowLeft, Copy, Check, Loader2, ExternalLink, RefreshCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

type PaymentMethod = "sbp" | "ton"

interface TonDepositData {
  comment: string
  amountTon: string
  amountRub: number
  walletAddress: string
  tonkeeperLink: string
  expiresAt: number
}

interface SbpDepositData {
  invoiceId: string
  invoiceUrl: string
  amount: string
  status: string
  expiresAt: string
}

export default function DepositPage() {
  const [amount, setAmount] = useState(500)
  const [method, setMethod] = useState<PaymentMethod>("sbp")
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoBonus, setPromoBonus] = useState(0)
  
  // Payment state
  const [isCreating, setIsCreating] = useState(false)
  const [tonDeposit, setTonDeposit] = useState<TonDepositData | null>(null)
  const [sbpDeposit, setSbpDeposit] = useState<SbpDepositData | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{ success: boolean; message: string } | null>(null)

  // Demo user ID (in real app, get from Telegram WebApp)
  const userId = "12847"

  const presets = [100, 250, 500, 1000, 2500, 5000]

  const applyPromo = () => {
    if (promoCode.toUpperCase() === "BONUS50") {
      setPromoBonus(50)
      setPromoApplied(true)
    } else if (promoCode.toUpperCase() === "START100") {
      setPromoBonus(100)
      setPromoApplied(true)
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const createDeposit = async () => {
    setIsCreating(true)
    setVerificationResult(null)
    
    try {
      const response = await fetch('/api/deposit/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          method,
          userId,
          paymentOption: method === 'sbp' ? 'SBP' : undefined,
        }),
      })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create deposit')
      }
      
      if (method === 'ton') {
        setTonDeposit(data.data)
        setSbpDeposit(null)
      } else {
        setSbpDeposit(data.data)
        setTonDeposit(null)
      }
    } catch (error) {
      console.error('Error creating deposit:', error)
      setVerificationResult({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка создания платежа',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const verifyTonDeposit = async () => {
    if (!tonDeposit) return
    
    setIsVerifying(true)
    setVerificationResult(null)
    
    try {
      const response = await fetch('/api/deposit/verify-ton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: tonDeposit.comment,
          expectedAmountTon: parseFloat(tonDeposit.amountTon),
        }),
      })
      
      const data = await response.json()
      
      if (data.verified) {
        setVerificationResult({
          success: true,
          message: `Платеж подтвержден! +${data.amountRub.toFixed(2)} ₽`,
        })
        // Reset deposit state after successful verification
        setTimeout(() => {
          setTonDeposit(null)
          setVerificationResult(null)
        }, 3000)
      } else {
        setVerificationResult({
          success: false,
          message: data.message || 'Платеж не найден',
        })
      }
    } catch (error) {
      console.error('Error verifying deposit:', error)
      setVerificationResult({
        success: false,
        message: 'Ошибка проверки платежа',
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const resetDeposit = () => {
    setTonDeposit(null)
    setSbpDeposit(null)
    setVerificationResult(null)
  }

  // Poll for SBP invoice status
  useEffect(() => {
    if (!sbpDeposit || sbpDeposit.status === 'paid') return
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/deposit/status?invoiceId=${sbpDeposit.invoiceId}`)
        const data = await response.json()
        
        if (data.invoice?.status === 'paid') {
          setVerificationResult({
            success: true,
            message: `Платеж подтвержден! +${data.invoice.amount} ₽`,
          })
          setSbpDeposit(prev => prev ? { ...prev, status: 'paid' } : null)
          clearInterval(interval)
        }
      } catch (error) {
        console.error('Error checking invoice status:', error)
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [sbpDeposit])

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

        {/* Show payment details if deposit is created */}
        {(tonDeposit || sbpDeposit) ? (
          <div className="flex flex-col gap-4">
            {/* TON Payment Details */}
            {tonDeposit && (
              <div className="bg-card rounded-xl border border-[#00b4d8]/30 p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0098ea]/20 flex items-center justify-center overflow-hidden">
                      <Image 
                        src="/images/tonkeeper-logo.png" 
                        alt="TON" 
                        width={48} 
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Оплата через TON</p>
                      <p className="text-xs text-muted-foreground">Tonkeeper / TON Wallet</p>
                    </div>
                  </div>
                  <button
                    onClick={resetDeposit}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Отмена
                  </button>
                </div>

                {/* Amount */}
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Сумма к оплате</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-black text-[#00b4d8]">{tonDeposit.amountTon} TON</p>
                    <p className="text-sm text-muted-foreground">~{tonDeposit.amountRub} ₽</p>
                  </div>
                </div>

                {/* Wallet Address */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground">Адрес кошелька</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-lg px-3 py-2.5 text-xs text-foreground/80 font-mono truncate">
                      {tonDeposit.walletAddress}
                    </div>
                    <button
                      onClick={() => copyToClipboard(tonDeposit.walletAddress, 'wallet')}
                      className="flex items-center justify-center w-10 h-10 bg-secondary hover:bg-border rounded-lg transition-colors"
                    >
                      {copied === 'wallet' ? (
                        <Check className="w-4 h-4 text-[#2ee06e]" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Comment */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground">Комментарий (ОБЯЗАТЕЛЬНО!)</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#2ee06e]/10 border border-[#2ee06e]/30 rounded-lg px-3 py-2.5 text-sm text-[#2ee06e] font-mono font-bold">
                      {tonDeposit.comment}
                    </div>
                    <button
                      onClick={() => copyToClipboard(tonDeposit.comment, 'comment')}
                      className="flex items-center justify-center w-10 h-10 bg-[#2ee06e]/20 hover:bg-[#2ee06e]/30 rounded-lg transition-colors"
                    >
                      {copied === 'comment' ? (
                        <Check className="w-4 h-4 text-[#2ee06e]" />
                      ) : (
                        <Copy className="w-4 h-4 text-[#2ee06e]" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-destructive">
                    Без комментария платеж не будет зачислен!
                  </p>
                </div>

                {/* Open Tonkeeper */}
                <a
                  href={tonDeposit.tonkeeperLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#0098ea] hover:bg-[#0088d0] text-white font-bold text-sm py-3 rounded-xl transition-colors"
                >
                  <span>Открыть Tonkeeper</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                {/* Verify Payment */}
                <button
                  onClick={verifyTonDeposit}
                  disabled={isVerifying}
                  className="flex items-center justify-center gap-2 w-full bg-secondary hover:bg-border text-foreground font-semibold text-sm py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Проверяем...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Я оплатил, проверить</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* SBP Payment Details */}
            {sbpDeposit && (
              <div className="bg-card rounded-xl border border-[#2ee06e]/30 p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white p-1">
                      <Image 
                        src="/images/sbp-logo.png" 
                        alt="СБП" 
                        width={44} 
                        height={44}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Оплата через СБП</p>
                      <p className="text-xs text-muted-foreground">Система быстрых платежей</p>
                    </div>
                  </div>
                  <button
                    onClick={resetDeposit}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Отмена
                  </button>
                </div>

                {/* Amount */}
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Сумма к оплате</p>
                  <p className="text-2xl font-black text-[#2ee06e]">{sbpDeposit.amount} ₽</p>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
                  <span className="text-xs text-muted-foreground">Статус</span>
                  <span className={`text-xs font-semibold ${
                    sbpDeposit.status === 'paid' ? 'text-[#2ee06e]' :
                    sbpDeposit.status === 'payment_pending' ? 'text-[#ffd93d]' :
                    'text-muted-foreground'
                  }`}>
                    {sbpDeposit.status === 'paid' ? 'Оплачено' :
                     sbpDeposit.status === 'payment_pending' ? 'Ожидает оплаты' :
                     sbpDeposit.status === 'new' ? 'Создан' : sbpDeposit.status}
                  </span>
                </div>

                {/* Open Payment Page */}
                {sbpDeposit.invoiceUrl && sbpDeposit.status !== 'paid' && (
                  <a
                    href={sbpDeposit.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#2ee06e] hover:bg-[#25c45c] text-[#0f1923] font-bold text-sm py-3 rounded-xl transition-colors"
                  >
                    <span>Перейти к оплате</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                {sbpDeposit.status !== 'paid' && (
                  <p className="text-[10px] text-center text-muted-foreground">
                    Статус обновляется автоматически каждые 5 секунд
                  </p>
                )}
              </div>
            )}

            {/* Verification Result */}
            {verificationResult && (
              <div className={`rounded-xl p-4 ${
                verificationResult.success 
                  ? 'bg-[#2ee06e]/20 border border-[#2ee06e]/30' 
                  : 'bg-destructive/20 border border-destructive/30'
              }`}>
                <p className={`text-sm font-semibold text-center ${
                  verificationResult.success ? 'text-[#2ee06e]' : 'text-destructive'
                }`}>
                  {verificationResult.message}
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
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
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white p-1 flex items-center justify-center">
                    <Image 
                      src="/images/sbp-logo.png" 
                      alt="СБП" 
                      width={40} 
                      height={40}
                      className="object-contain"
                    />
                  </div>
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
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center">
                    <Image 
                      src="/images/tonkeeper-logo.png" 
                      alt="TON" 
                      width={48} 
                      height={48}
                      className="object-cover"
                    />
                  </div>
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
                <span className="px-3 text-sm text-muted-foreground font-medium">&#8381;</span>
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
                    {p} &#8381;
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
                  Промо-код применен! Бонус: +{promoBonus} &#8381;
                </p>
              )}
            </div>

            {/* Total */}
            <div className="bg-card rounded-xl border border-[#2ee06e]/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">К оплате:</span>
                <span className="text-lg font-bold text-foreground">{amount} &#8381;</span>
              </div>
              {promoBonus > 0 && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-muted-foreground">Бонус:</span>
                  <span className="text-sm font-bold text-[#2ee06e]">+{promoBonus} &#8381;</span>
                </div>
              )}
              <div className="flex items-center justify-between mt-1 pt-2 border-t border-border">
                <span className="text-sm font-medium text-foreground">На баланс:</span>
                <span className="text-lg font-black text-[#2ee06e]">{amount + promoBonus} &#8381;</span>
              </div>
            </div>

            {/* Pay Button */}
            <button 
              onClick={createDeposit}
              disabled={isCreating || amount < 100}
              className="w-full bg-[#2ee06e] hover:bg-[#25c45c] text-[#0f1923] font-bold text-base py-3.5 rounded-xl transition-all glow-green disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Создаем платеж...</span>
                </>
              ) : (
                <span>{method === "sbp" ? "Оплатить через СБП" : "Оплатить через Tonkeeper"}</span>
              )}
            </button>
            
            <p className="text-[10px] text-center text-muted-foreground">
              Минимальная сумма пополнения: 100 &#8381;
            </p>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
