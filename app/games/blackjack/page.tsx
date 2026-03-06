"use client"

import { useState, useCallback } from "react"
import GameLayout from "@/components/game-layout"

type CardSuit = "hearts" | "diamonds" | "clubs" | "spades"
type CardValue = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A"

interface Card {
  suit: CardSuit
  value: CardValue
  hidden?: boolean
}

const SUITS: CardSuit[] = ["hearts", "diamonds", "clubs", "spades"]
const VALUES: CardValue[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

const suitSymbols: Record<CardSuit, string> = {
  hearts: "\u2665",
  diamonds: "\u2666",
  clubs: "\u2663",
  spades: "\u2660",
}

const suitColors: Record<CardSuit, string> = {
  hearts: "#dc2626",
  diamonds: "#dc2626",
  clubs: "#1e293b",
  spades: "#1e293b",
}

function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value })
    }
  }
  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function getCardValue(card: Card): number[] {
  if (["J", "Q", "K"].includes(card.value)) return [10]
  if (card.value === "A") return [1, 11]
  return [parseInt(card.value)]
}

function getHandValue(cards: Card[]): number {
  const visibleCards = cards.filter((c) => !c.hidden)
  let total = 0
  let aces = 0

  for (const card of visibleCards) {
    const vals = getCardValue(card)
    if (vals.length === 2) {
      total += 11
      aces++
    } else {
      total += vals[0]
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }
  return total
}

// Realistic card component
function CardComponent({ card, animDelay = 0 }: { card: Card; animDelay?: number }) {
  if (card.hidden) {
    return (
      <div
        className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg relative overflow-hidden shadow-lg"
        style={{
          animationDelay: `${animDelay}ms`,
          background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #172554 100%)",
        }}
      >
        {/* Card back pattern */}
        <div className="absolute inset-1 rounded border border-blue-400/30">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 4px,
                rgba(255,255,255,0.03) 4px,
                rgba(255,255,255,0.03) 8px
              )`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-300 text-lg font-bold">P</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const color = suitColors[card.suit]
  const symbol = suitSymbols[card.suit]
  const isRed = card.suit === "hearts" || card.suit === "diamonds"

  // Get face card design
  const getFaceCardDesign = () => {
    if (!["J", "Q", "K"].includes(card.value)) return null
    
    const faceColors = {
      J: { primary: "#fbbf24", secondary: "#d97706" },
      Q: { primary: "#f472b6", secondary: "#db2777" },
      K: { primary: "#fbbf24", secondary: "#d97706" },
    }
    const colors = faceColors[card.value as "J" | "Q" | "K"]
    
    return (
      <div className="absolute inset-3 flex items-center justify-center">
        <div 
          className="w-10 h-14 sm:w-12 sm:h-16 rounded-sm flex items-center justify-center"
          style={{ 
            background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)'
          }}
        >
          <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{card.value}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg bg-white relative overflow-hidden shadow-xl border border-gray-200"
      style={{ animationDelay: `${animDelay}ms` }}
    >
      {/* Card texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100" />
      
      {/* Top left corner */}
      <div className="absolute top-1 left-1.5 flex flex-col items-center z-10">
        <span className="text-xs sm:text-sm font-bold leading-none" style={{ color }}>{card.value}</span>
        <span className="text-xs sm:text-sm leading-none" style={{ color }}>{symbol}</span>
      </div>
      
      {/* Center symbol or face design */}
      {["J", "Q", "K"].includes(card.value) ? (
        getFaceCardDesign()
      ) : card.value === "A" ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl sm:text-5xl" style={{ color }}>{symbol}</span>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl sm:text-3xl" style={{ color }}>{symbol}</span>
        </div>
      )}
      
      {/* Bottom right corner (rotated) */}
      <div className="absolute bottom-1 right-1.5 flex flex-col items-center rotate-180 z-10">
        <span className="text-xs sm:text-sm font-bold leading-none" style={{ color }}>{card.value}</span>
        <span className="text-xs sm:text-sm leading-none" style={{ color }}>{symbol}</span>
      </div>
      
      {/* Subtle border inner effect */}
      <div className="absolute inset-0.5 rounded-md border border-gray-200/50 pointer-events-none" />
    </div>
  )
}

export default function BlackJackPage() {
  const [balance, setBalance] = useState(1000)
  const [betAmount, setBetAmount] = useState(10)
  const [deck, setDeck] = useState<Card[]>([])
  const [playerHand, setPlayerHand] = useState<Card[]>([])
  const [dealerHand, setDealerHand] = useState<Card[]>([])
  const [gameState, setGameState] = useState<"betting" | "playing" | "dealerTurn" | "finished">("betting")
  const [message, setMessage] = useState("")
  const [winAmount, setWinAmount] = useState(0)
  const [history, setHistory] = useState<{ won: boolean; amount: number; playerScore: number; dealerScore: number }[]>([])

  const drawCard = useCallback(
    (currentDeck: Card[]): [Card, Card[]] => {
      const newDeck = [...currentDeck]
      const card = newDeck.pop()!
      return [card, newDeck]
    },
    []
  )

  const deal = useCallback(() => {
    if (betAmount <= 0 || betAmount > balance) return

    const newDeck = createDeck()
    const [p1, d1] = [newDeck.pop()!, newDeck.pop()!]
    const [p2, d2] = [newDeck.pop()!, newDeck.pop()!]
    d2.hidden = true

    const pHand = [p1, p2]
    const dHand = [d1, d2]

    setDeck(newDeck)
    setPlayerHand(pHand)
    setDealerHand(dHand)
    setBalance((b) => parseFloat((b - betAmount).toFixed(2)))
    setGameState("playing")
    setMessage("")
    setWinAmount(0)

    // Check for blackjack
    if (getHandValue(pHand) === 21) {
      d2.hidden = false
      const dealerVal = getHandValue(dHand)
      if (dealerVal === 21) {
        setMessage("Ничья! Оба блэкджека")
        setBalance((b) => parseFloat((b + betAmount).toFixed(2)))
        setHistory((h) => [{ won: false, amount: 0, playerScore: 21, dealerScore: 21 }, ...h.slice(0, 19)])
      } else {
        const payout = betAmount * 2.5
        setWinAmount(payout)
        setMessage("Блэкджек! Вы выиграли!")
        setBalance((b) => parseFloat((b + payout).toFixed(2)))
        setHistory((h) => [{ won: true, amount: payout, playerScore: 21, dealerScore: dealerVal }, ...h.slice(0, 19)])
      }
      setGameState("finished")
    }
  }, [betAmount, balance])

  const hit = useCallback(() => {
    if (gameState !== "playing") return
    const [card, newDeck] = drawCard(deck)
    const newHand = [...playerHand, card]
    setPlayerHand(newHand)
    setDeck(newDeck)

    const val = getHandValue(newHand)
    if (val > 21) {
      // Bust - reveal dealer card
      const revealedDealer = dealerHand.map((c) => ({ ...c, hidden: false }))
      setDealerHand(revealedDealer)
      setMessage("Перебор! Вы проиграли")
      setGameState("finished")
      setHistory((h) => [{ won: false, amount: -betAmount, playerScore: val, dealerScore: getHandValue(revealedDealer) }, ...h.slice(0, 19)])
    } else if (val === 21) {
      stand(newHand, newDeck)
    }
  }, [gameState, deck, playerHand, dealerHand, betAmount])

  const stand = useCallback(
    (currentPlayerHand?: Card[], currentDeck?: Card[]) => {
      const pHand = currentPlayerHand || playerHand
      const dDeck = currentDeck || deck

      // Reveal dealer's hidden card
      let dHand = dealerHand.map((c) => ({ ...c, hidden: false }))
      let dDeckCopy = [...dDeck]

      // Dealer draws until 17+
      while (getHandValue(dHand) < 17) {
        const card = dDeckCopy.pop()!
        dHand = [...dHand, card]
      }

      setDealerHand(dHand)
      setDeck(dDeckCopy)

      const playerVal = getHandValue(pHand)
      const dealerVal = getHandValue(dHand)

      let msg = ""
      let payout = 0

      if (dealerVal > 21) {
        msg = "Дилер перебрал! Вы выиграли!"
        payout = betAmount * 2
      } else if (playerVal > dealerVal) {
        msg = "Вы выиграли!"
        payout = betAmount * 2
      } else if (playerVal === dealerVal) {
        msg = "Ничья!"
        payout = betAmount
      } else {
        msg = "Дилер выиграл!"
        payout = 0
      }

      setMessage(msg)
      setWinAmount(payout)
      if (payout > 0) {
        setBalance((b) => parseFloat((b + payout).toFixed(2)))
      }
      setGameState("finished")
      setHistory((h) => [
        { won: payout > betAmount, amount: payout > 0 ? payout - betAmount : -betAmount, playerScore: playerVal, dealerScore: dealerVal },
        ...h.slice(0, 19),
      ])
    },
    [playerHand, deck, dealerHand, betAmount]
  )

  const doubleDown = useCallback(() => {
    if (gameState !== "playing" || betAmount > balance) return
    setBalance((b) => parseFloat((b - betAmount).toFixed(2)))
    setBetAmount((b) => b * 2)

    const [card, newDeck] = drawCard(deck)
    const newHand = [...playerHand, card]
    setPlayerHand(newHand)
    setDeck(newDeck)

    const val = getHandValue(newHand)
    if (val > 21) {
      const revealedDealer = dealerHand.map((c) => ({ ...c, hidden: false }))
      setDealerHand(revealedDealer)
      setMessage("Перебор! Вы проиграли")
      setGameState("finished")
      setHistory((h) => [{ won: false, amount: -betAmount * 2, playerScore: val, dealerScore: getHandValue(revealedDealer) }, ...h.slice(0, 19)])
    } else {
      stand(newHand, newDeck)
    }
  }, [gameState, betAmount, balance, deck, playerHand, dealerHand, stand, drawCard])

  return (
    <GameLayout title="BlackJack" balance={balance}>
      <div className="flex flex-col gap-3">
        {/* Game Table - Casino Style */}
        <div 
          className="rounded-2xl border-4 border-[#8b5a2b] p-3 sm:p-5 min-h-[380px] flex flex-col justify-between relative overflow-hidden"
          style={{
            background: "radial-gradient(ellipse at center, #0d6e3f 0%, #0a5c34 40%, #084d2a 70%, #063d22 100%)",
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {/* Table border decoration */}
          <div className="absolute inset-2 rounded-xl border-2 border-[#ffd93d]/20 pointer-events-none" />
          
          {/* Green felt texture overlay */}
          <div 
            className="absolute inset-0 opacity-30 pointer-events-none" 
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
            }} 
          />
          
          {/* BLACKJACK text on table */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <span className="text-2xl sm:text-4xl font-black text-[#ffd93d]/10 tracking-[0.3em]">BLACKJACK</span>
          </div>

          {/* Dealer Section */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">{"Дилер"}</span>
              {dealerHand.length > 0 && (
                <span className="bg-black/40 px-2 py-0.5 rounded text-xs font-bold text-white">
                  {getHandValue(dealerHand)}
                </span>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {dealerHand.map((card, i) => (
                <CardComponent key={i} card={card} animDelay={i * 150} />
              ))}
              {dealerHand.length === 0 && (
                <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center">
                  <span className="text-white/30 text-xs">{"Карты"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className="relative z-10 text-center py-3">
              <div className={`inline-block px-5 py-2.5 rounded-xl font-bold text-base ${
                winAmount > betAmount
                  ? "bg-[#2ee06e]/20 text-[#2ee06e] border border-[#2ee06e]/40"
                  : winAmount > 0
                    ? "bg-[#ffd93d]/20 text-[#ffd93d] border border-[#ffd93d]/40"
                    : "bg-[#ff4757]/20 text-[#ff4757] border border-[#ff4757]/40"
              }`}>
                {message}
                {winAmount > 0 && (
                  <div className="text-sm mt-0.5">+{(winAmount - betAmount).toFixed(2)} ₽</div>
                )}
              </div>
            </div>
          )}

          {/* Player Section */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">{"Вы"}</span>
              {playerHand.length > 0 && (
                <span className="bg-black/40 px-2 py-0.5 rounded text-xs font-bold text-[#2ee06e]">
                  {getHandValue(playerHand)}
                </span>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {playerHand.map((card, i) => (
                <CardComponent key={i} card={card} animDelay={i * 150} />
              ))}
              {playerHand.length === 0 && (
                <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center">
                  <span className="text-white/30 text-xs">{"Карты"}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card rounded-xl border border-border/50 p-3 sm:p-4">
          {gameState === "betting" || gameState === "finished" ? (
            <>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{"Ставка"}</label>
                <div className="flex items-center bg-secondary rounded-lg overflow-hidden">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="flex-1 bg-transparent text-sm font-medium text-foreground px-3 py-2.5 outline-none min-w-0"
                  />
                  <button
                    onClick={() => setBetAmount((b) => Math.max(1, parseFloat((b / 2).toFixed(2))))}
                    className="px-2 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    /2
                  </button>
                  <button
                    onClick={() => setBetAmount((b) => Math.min(parseFloat((b * 2).toFixed(2)), balance))}
                    className="px-2 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    x2
                  </button>
                </div>
              </div>
              <button
                onClick={deal}
                disabled={betAmount <= 0 || betAmount > balance}
                className="w-full mt-3 bg-[#2ee06e] hover:bg-[#25c45c] disabled:bg-secondary disabled:text-muted-foreground text-[#0f1923] font-bold text-base py-3 rounded-xl transition-all glow-green"
              >
                {"Раздать"}
              </button>
            </>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={hit}
                className="bg-[#2ee06e] hover:bg-[#25c45c] text-[#0f1923] font-bold text-sm py-3 rounded-xl transition-all"
              >
                {"Ещё"}
              </button>
              <button
                onClick={() => stand()}
                className="bg-[#ff4757] hover:bg-[#ee3a4a] text-white font-bold text-sm py-3 rounded-xl transition-all"
              >
                {"Стоп"}
              </button>
              <button
                onClick={doubleDown}
                disabled={betAmount > balance}
                className="bg-[#ffd93d] hover:bg-[#f5cc1b] disabled:bg-secondary disabled:text-muted-foreground text-[#0f1923] font-bold text-sm py-3 rounded-xl transition-all"
              >
                {"x2"}
              </button>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-card rounded-xl border border-border/50 p-3 sm:p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">{"История"}</h3>
            <div className="flex flex-col gap-1.5">
              {history.slice(0, 8).map((h, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${
                    h.won ? "bg-[#2ee06e]/10 text-[#2ee06e]" : h.amount === 0 ? "bg-[#ffd93d]/10 text-[#ffd93d]" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  <span>{"Вы:"} {h.playerScore} | {"Дилер:"} {h.dealerScore}</span>
                  <span className="font-bold">
                    {h.amount > 0 ? "+" : ""}{h.amount.toFixed(2)} ₽
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  )
}
