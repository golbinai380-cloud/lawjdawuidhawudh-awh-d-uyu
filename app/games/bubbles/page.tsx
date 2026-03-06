"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import GameLayout from "@/components/game-layout"

interface Bubble {
  id: number
  x: number
  y: number
  size: number
  multiplier: number
  color: string
  popped: boolean
  speed: number
}

const COLORS = [
  { bg: "#2ee06e", mult: [1.1, 1.5] },
  { bg: "#00b4d8", mult: [1.5, 2.5] },
  { bg: "#ffd93d", mult: [2.5, 5] },
  { bg: "#ff6b6b", mult: [5, 10] },
  { bg: "#6c5ce7", mult: [10, 50] },
]

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a)
}

export default function BubblesPage() {
  const [balance, setBalance] = useState(1000)
  const [betAmount, setBetAmount] = useState(10)
  const [gameActive, setGameActive] = useState(false)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [poppedCount, setPoppedCount] = useState(0)
  const [totalWin, setTotalWin] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [history, setHistory] = useState<{ won: boolean; amount: number; popped: number }[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)
  const bubbleIdRef = useRef(0)

  const generateBubbles = useCallback(() => {
    const newBubbles: Bubble[] = []
    const count = 15 + Math.floor(Math.random() * 10)

    for (let i = 0; i < count; i++) {
      const colorIdx = Math.random() < 0.4 ? 0 : Math.random() < 0.3 ? 1 : Math.random() < 0.2 ? 2 : Math.random() < 0.07 ? 3 : 4
      const colorInfo = COLORS[colorIdx]
      const mult = parseFloat(randomBetween(colorInfo.mult[0], colorInfo.mult[1]).toFixed(2))
      const size = 30 + Math.random() * 40

      newBubbles.push({
        id: ++bubbleIdRef.current,
        x: Math.random() * 85 + 5,
        y: 100 + Math.random() * 30,
        size,
        multiplier: mult,
        color: colorInfo.bg,
        popped: false,
        speed: 0.2 + Math.random() * 0.5,
      })
    }
    return newBubbles
  }, [])

  const startGame = useCallback(() => {
    if (betAmount <= 0 || betAmount > balance) return

    const newBubbles = generateBubbles()
    setBubbles(newBubbles)
    setGameActive(true)
    setGameOver(false)
    setPoppedCount(0)
    setTotalWin(0)
    setBalance((b) => parseFloat((b - betAmount).toFixed(2)))
  }, [betAmount, balance, generateBubbles])

  // Animate bubbles floating up
  useEffect(() => {
    if (!gameActive) return

    let running = true
    const animate = () => {
      if (!running) return
      setBubbles((prev) => {
        const updated = prev.map((b) => {
          if (b.popped) return b
          const newY = b.y - b.speed
          if (newY < -10) return { ...b, y: -10, popped: true }
          return { ...b, y: newY }
        })
        // Check if all escaped
        const alive = updated.filter((b) => !b.popped && b.y > -5)
        if (alive.length === 0 && updated.some((b) => b.y <= -5)) {
          // Game over when all bubbles fly away
        }
        return updated
      })
      animFrameRef.current = requestAnimationFrame(animate)
    }
    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      running = false
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [gameActive])

  // Check game over
  useEffect(() => {
    if (!gameActive) return
    const aliveBubbles = bubbles.filter((b) => !b.popped && b.y > -5)
    if (aliveBubbles.length === 0 && bubbles.length > 0) {
      setGameActive(false)
      setGameOver(true)
      if (totalWin > 0) {
        setBalance((b) => parseFloat((b + totalWin).toFixed(2)))
      }
      setHistory((h) => [
        { won: totalWin > betAmount, amount: totalWin > 0 ? totalWin - betAmount : -betAmount, popped: poppedCount },
        ...h.slice(0, 19),
      ])
    }
  }, [bubbles, gameActive, totalWin, betAmount, poppedCount])

  const popBubble = useCallback(
    (id: number) => {
      if (!gameActive) return
      setBubbles((prev) =>
        prev.map((b) => {
          if (b.id === id && !b.popped) {
            const win = parseFloat((betAmount * b.multiplier).toFixed(2))
            setTotalWin((t) => parseFloat((t + win).toFixed(2)))
            setPoppedCount((c) => c + 1)
            return { ...b, popped: true }
          }
          return b
        })
      )
    },
    [gameActive, betAmount]
  )

  const cashOut = useCallback(() => {
    if (!gameActive || totalWin <= 0) return
    setBalance((b) => parseFloat((b + totalWin).toFixed(2)))
    setGameActive(false)
    setGameOver(true)
    setHistory((h) => [
      { won: totalWin > betAmount, amount: totalWin - betAmount, popped: poppedCount },
      ...h.slice(0, 19),
    ])
  }, [gameActive, totalWin, betAmount, poppedCount])

  return (
    <GameLayout title="Bubbles" balance={balance}>
      <div className="flex flex-col gap-4">
        {/* Game Area */}
        <div
          ref={containerRef}
          className="bg-gradient-to-b from-[#1a2c38] to-[#0f1923] rounded-2xl border border-border/50 relative overflow-hidden"
          style={{ height: 420 }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/3"
                style={{
                  width: 2 + Math.random() * 4,
                  height: 2 + Math.random() * 4,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>

          {/* Bubbles */}
          {bubbles.map((bubble) =>
            bubble.popped ? null : (
              <button
                key={bubble.id}
                onClick={() => popBubble(bubble.id)}
                className="absolute rounded-full cursor-pointer transition-transform hover:scale-110 active:scale-90"
                style={{
                  width: bubble.size,
                  height: bubble.size,
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`,
                  background: `radial-gradient(circle at 30% 30%, ${bubble.color}dd, ${bubble.color}88, ${bubble.color}44)`,
                  boxShadow: `0 0 ${bubble.size / 3}px ${bubble.color}60, inset 0 -${bubble.size / 6}px ${bubble.size / 4}px ${bubble.color}30`,
                  border: `1px solid ${bubble.color}40`,
                }}
                aria-label={`Bubble x${bubble.multiplier}`}
              >
                {/* Highlight */}
                <div
                  className="absolute rounded-full bg-white/40"
                  style={{
                    width: bubble.size * 0.3,
                    height: bubble.size * 0.2,
                    top: "15%",
                    left: "20%",
                    borderRadius: "50%",
                    transform: "rotate(-30deg)",
                  }}
                />
                <span
                  className="absolute inset-0 flex items-center justify-center text-white font-bold drop-shadow-lg"
                  style={{ fontSize: Math.max(10, bubble.size / 4) }}
                >
                  {bubble.multiplier}x
                </span>
              </button>
            )
          )}

          {/* Game info overlay */}
          {gameActive && (
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <span className="text-xs text-muted-foreground">Лопнуто: </span>
                <span className="text-sm font-bold text-foreground">{poppedCount}</span>
              </div>
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <span className="text-xs text-muted-foreground">Выигрыш: </span>
                <span className="text-sm font-bold text-[#2ee06e]">{totalWin.toFixed(2)} ₽</span>
              </div>
            </div>
          )}

          {/* Game over overlay */}
          {gameOver && !gameActive && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <p className={`text-3xl font-black ${totalWin > betAmount ? "text-[#2ee06e]" : "text-[#ff4757]"}`}>
                  {totalWin > betAmount ? `+${(totalWin - betAmount).toFixed(2)} ₽` : `-${betAmount.toFixed(2)} ₽`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Лопнуто пузырей: {poppedCount}
                </p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!gameActive && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Нажмите &quot;Играть&quot; для начала</p>
            </div>
          )}
        </div>

        {/* Multiplier Legend */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {COLORS.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.bg }} />
              <span className="text-xs text-muted-foreground">
                x{c.mult[0]}-x{c.mult[1]}
              </span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Ставка</label>
            <div className="flex items-center bg-secondary rounded-lg overflow-hidden">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                className="flex-1 bg-transparent text-sm font-medium text-foreground px-3 py-2.5 outline-none min-w-0"
                disabled={gameActive}
              />
              <button
                onClick={() => setBetAmount((b) => Math.max(1, parseFloat((b / 2).toFixed(2))))}
                className="px-2 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                disabled={gameActive}
              >
                /2
              </button>
              <button
                onClick={() => setBetAmount((b) => Math.min(parseFloat((b * 2).toFixed(2)), balance))}
                className="px-2 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                disabled={gameActive}
              >
                x2
              </button>
            </div>
          </div>

          {!gameActive ? (
            <button
              onClick={startGame}
              disabled={betAmount <= 0 || betAmount > balance}
              className="w-full mt-4 bg-[#2ee06e] hover:bg-[#25c45c] disabled:bg-secondary disabled:text-muted-foreground text-[#0f1923] font-bold text-base py-3 rounded-xl transition-all glow-green"
            >
              Играть
            </button>
          ) : (
            <button
              onClick={cashOut}
              disabled={totalWin <= 0}
              className="w-full mt-4 bg-[#ffd93d] hover:bg-[#f5cc1b] disabled:bg-secondary disabled:text-muted-foreground text-[#0f1923] font-bold text-base py-3 rounded-xl transition-all"
            >
              Забрать {totalWin.toFixed(2)} ₽
            </button>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-card rounded-xl border border-border/50 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">История</h3>
            <div className="flex flex-col gap-2">
              {history.slice(0, 10).map((h, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                    h.won ? "bg-[#2ee06e]/10 text-[#2ee06e]" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  <span>{h.popped} пузырей</span>
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
