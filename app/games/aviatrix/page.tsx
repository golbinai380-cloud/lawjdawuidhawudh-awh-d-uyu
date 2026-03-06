"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import GameLayout from "@/components/game-layout"

export default function AviatrixPage() {
  const [balance, setBalance] = useState(1000)
  const [betAmount, setBetAmount] = useState(10)
  const [gameState, setGameState] = useState<"waiting" | "flying" | "crashed">("waiting")
  const [multiplier, setMultiplier] = useState(1.0)
  const [crashPoint, setCrashPoint] = useState(0)
  const [hasCashedOut, setHasCashedOut] = useState(false)
  const [cashOutMultiplier, setCashOutMultiplier] = useState(0)
  const [history, setHistory] = useState<{ crashPoint: number; cashedOut: boolean; cashOutAt: number; amount: number }[]>([])
  const [planeX, setPlaneX] = useState(0)
  const [planeY, setPlaneY] = useState(0)
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([])
  const animRef = useRef<number>(0)
  const startTimeRef = useRef(0)

  // Generate crash point with house edge
  const generateCrashPoint = useCallback(() => {
    const e = 2 ** 32
    const h = Math.floor(Math.random() * e)
    if (h % 33 === 0) return 1.0 // instant crash ~3%
    return Math.max(1.0, parseFloat((100 / (100 - (h % 100)) + Math.random() * 3).toFixed(2)))
  }, [])

  const startGame = useCallback(() => {
    if (betAmount <= 0 || betAmount > balance) return
    const cp = generateCrashPoint()
    setCrashPoint(cp)
    setMultiplier(1.0)
    setHasCashedOut(false)
    setCashOutMultiplier(0)
    setGameState("flying")
    setPlaneX(0)
    setPlaneY(0)
    setTrail([])
    setBalance((b) => parseFloat((b - betAmount).toFixed(2)))
    startTimeRef.current = Date.now()
  }, [betAmount, balance, generateCrashPoint])

  // Flight animation
  useEffect(() => {
    if (gameState !== "flying") return

    let running = true
    const animate = () => {
      if (!running) return
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const newMult = parseFloat((1 + elapsed * 0.3 + (elapsed * elapsed) * 0.05).toFixed(2))

      if (newMult >= crashPoint) {
        // Crash!
        setMultiplier(crashPoint)
        setGameState("crashed")

        if (!hasCashedOut) {
          setHistory((h) => [
            { crashPoint, cashedOut: false, cashOutAt: 0, amount: -betAmount },
            ...h.slice(0, 19),
          ])
        }
        return
      }

      setMultiplier(newMult)

      // Update plane position (curve going up-right)
      const progress = Math.min(elapsed / 10, 1)
      const px = progress * 85
      const py = Math.min(progress * 70 + Math.sin(progress * Math.PI) * 15, 80)
      setPlaneX(px)
      setPlaneY(py)
      setTrail((prev) => [...prev.slice(-100), { x: px, y: py }])

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => {
      running = false
      cancelAnimationFrame(animRef.current)
    }
  }, [gameState, crashPoint, hasCashedOut, betAmount])

  const cashOut = useCallback(() => {
    if (gameState !== "flying" || hasCashedOut) return
    const payout = parseFloat((betAmount * multiplier).toFixed(2))
    setBalance((b) => parseFloat((b + payout).toFixed(2)))
    setHasCashedOut(true)
    setCashOutMultiplier(multiplier)
    setHistory((h) => [
      { crashPoint, cashedOut: true, cashOutAt: multiplier, amount: payout - betAmount },
      ...h.slice(0, 19),
    ])
  }, [gameState, hasCashedOut, betAmount, multiplier, crashPoint])

  const getMultiplierColor = () => {
    if (gameState === "crashed") return "#ff4757"
    if (hasCashedOut) return "#ffd93d"
    if (multiplier < 2) return "#2ee06e"
    if (multiplier < 5) return "#ffd93d"
    return "#ff6b6b"
  }

  return (
    <GameLayout title="Aviatrix" balance={balance}>
      <div className="flex flex-col gap-4">
        {/* Flight Area */}
        <div className="bg-gradient-to-b from-[#0a0f1a] via-[#0f1923] to-[#1a2c38] rounded-2xl border border-border/50 relative overflow-hidden" style={{ height: 350 }}>
          {/* Stars background */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 2 + 1,
                  height: Math.random() * 2 + 1,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.1,
                  animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>

          {/* SVG Trail + Plane */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            {[20, 40, 60, 80].map((y) => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#2a3f4e" strokeWidth="0.15" strokeDasharray="1,1" />
            ))}
            {[20, 40, 60, 80].map((x) => (
              <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="#2a3f4e" strokeWidth="0.15" strokeDasharray="1,1" />
            ))}

            {/* Trail path */}
            {trail.length > 1 && (
              <>
                <defs>
                  <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2ee06e" stopOpacity="0.1" />
                    <stop offset="100%" stopColor={getMultiplierColor()} stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                <polyline
                  points={trail.map((p) => `${p.x},${100 - p.y}`).join(" ")}
                  fill="none"
                  stroke="url(#trailGrad)"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                />
                {/* Fill under curve */}
                <polygon
                  points={`${trail[0].x},100 ${trail.map((p) => `${p.x},${100 - p.y}`).join(" ")} ${trail[trail.length - 1].x},100`}
                  fill={getMultiplierColor()}
                  opacity="0.08"
                />
              </>
            )}
          </svg>

          {/* Plane */}
          {gameState !== "waiting" && (
            <div
              className="absolute transition-all duration-100 ease-linear z-10"
              style={{
                left: `${planeX}%`,
                bottom: `${planeY}%`,
                transform: `translate(-50%, 50%) rotate(-15deg)`,
                opacity: gameState === "crashed" ? 0.3 : 1,
              }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="drop-shadow-lg">
                <path d="M35 18L8 8L12 18L8 28L35 18Z" fill="#00b4d8" stroke="#0097b2" strokeWidth="1" />
                <path d="M12 18L4 16V20L12 18Z" fill="#0097b2" />
                <circle cx="14" cy="18" r="2" fill="#0f1923" />
                <path d="M20 12L24 8L26 10L22 14" fill="#00b4d8" opacity="0.7" />
                <path d="M20 24L24 28L26 26L22 22" fill="#00b4d8" opacity="0.7" />
              </svg>
              {/* Engine glow */}
              {gameState === "flying" && !hasCashedOut && (
                <div
                  className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-3 rounded-full"
                  style={{
                    background: `radial-gradient(ellipse, #ffd93d, #ff6b6b00)`,
                    opacity: 0.8,
                    animation: "pulse 0.3s ease-in-out infinite",
                  }}
                />
              )}
            </div>
          )}

          {/* Multiplier Display */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
            {gameState === "waiting" && (
              <div>
                <p className="text-muted-foreground text-sm mb-2">Ожидание ставки...</p>
                <p className="text-2xl font-black text-foreground">1.00x</p>
              </div>
            )}
            {gameState === "flying" && (
              <div>
                <p
                  className="text-5xl sm:text-6xl font-black tabular-nums"
                  style={{ color: getMultiplierColor() }}
                >
                  {multiplier.toFixed(2)}x
                </p>
                {hasCashedOut && (
                  <p className="text-lg font-bold text-[#ffd93d] mt-2">
                    Забрано на {cashOutMultiplier.toFixed(2)}x
                  </p>
                )}
              </div>
            )}
            {gameState === "crashed" && (
              <div>
                <p className="text-5xl sm:text-6xl font-black text-[#ff4757]">
                  {crashPoint.toFixed(2)}x
                </p>
                <p className="text-lg font-bold text-[#ff4757] mt-2">Улетел!</p>
                {hasCashedOut && (
                  <p className="text-sm font-bold text-[#2ee06e] mt-1">
                    Вы забрали на {cashOutMultiplier.toFixed(2)}x (+{(betAmount * cashOutMultiplier - betAmount).toFixed(2)} ₽)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent crashes strip */}
        {history.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 px-1">
            {history.slice(0, 20).map((h, i) => (
              <div
                key={i}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${
                  h.crashPoint < 2
                    ? "bg-[#ff4757]/20 text-[#ff4757]"
                    : h.crashPoint < 5
                      ? "bg-[#ffd93d]/20 text-[#ffd93d]"
                      : "bg-[#2ee06e]/20 text-[#2ee06e]"
                }`}
              >
                {h.crashPoint.toFixed(2)}x
              </div>
            ))}
          </div>
        )}

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
                disabled={gameState === "flying"}
              />
              <button
                onClick={() => setBetAmount((b) => Math.max(1, parseFloat((b / 2).toFixed(2))))}
                className="px-2 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                disabled={gameState === "flying"}
              >
                /2
              </button>
              <button
                onClick={() => setBetAmount((b) => Math.min(parseFloat((b * 2).toFixed(2)), balance))}
                className="px-2 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                disabled={gameState === "flying"}
              >
                x2
              </button>
            </div>
          </div>

          {gameState === "flying" && !hasCashedOut ? (
            <button
              onClick={cashOut}
              className="w-full mt-4 bg-[#ffd93d] hover:bg-[#f5cc1b] text-[#0f1923] font-bold text-base py-3 rounded-xl transition-all animate-pulse"
            >
              Забрать {(betAmount * multiplier).toFixed(2)} ₽ ({multiplier.toFixed(2)}x)
            </button>
          ) : (
            <button
              onClick={startGame}
              disabled={(gameState === "flying") || betAmount <= 0 || betAmount > balance}
              className="w-full mt-4 bg-[#2ee06e] hover:bg-[#25c45c] disabled:bg-secondary disabled:text-muted-foreground text-[#0f1923] font-bold text-base py-3 rounded-xl transition-all glow-green"
            >
              {gameState === "flying" ? "В полёте..." : "Ставка"}
            </button>
          )}
        </div>

        {/* History table */}
        {history.length > 0 && (
          <div className="bg-card rounded-xl border border-border/50 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">История</h3>
            <div className="flex flex-col gap-2">
              {history.slice(0, 10).map((h, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                    h.cashedOut ? "bg-[#2ee06e]/10 text-[#2ee06e]" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{h.crashPoint.toFixed(2)}x</span>
                    {h.cashedOut && <span className="text-xs opacity-70">({h.cashOutAt.toFixed(2)}x)</span>}
                  </div>
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
