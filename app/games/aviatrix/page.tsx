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
  const [showResult, setShowResult] = useState(false)
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
    setPlaneX(5)
    setPlaneY(10)
    setShowResult(false)
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
        // Show result after crash
        setTimeout(() => setShowResult(true), 500)
        return
      }

      setMultiplier(newMult)

      // Update plane position (curve going up-right)
      const progress = Math.min(elapsed / 10, 1)
      const px = 5 + progress * 80
      const py = 10 + Math.min(progress * 65 + Math.sin(progress * Math.PI) * 10, 75)
      setPlaneX(px)
      setPlaneY(py)

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
    <GameLayout title="Lucky Jet" balance={balance}>
      <div className="flex flex-col gap-4">
        {/* Flight Area */}
        <div className="bg-gradient-to-b from-[#1a0a2e] via-[#0f1923] to-[#0a1520] rounded-2xl border border-border/50 relative overflow-hidden" style={{ height: 320 }}>
          {/* Stars background */}
          <div className="absolute inset-0">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 2 + 1,
                  height: Math.random() * 2 + 1,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.4 + 0.1,
                  animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>

          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
            {[20, 40, 60, 80].map((y) => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#4a5568" strokeWidth="0.1" strokeDasharray="2,2" />
            ))}
            {[20, 40, 60, 80].map((x) => (
              <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="#4a5568" strokeWidth="0.1" strokeDasharray="2,2" />
            ))}
          </svg>

          {/* Lucky Jet Character */}
          {gameState !== "waiting" && (
            <div
              className="absolute transition-all duration-100 ease-linear z-10"
              style={{
                left: `${planeX}%`,
                bottom: `${planeY}%`,
                transform: `translate(-50%, 50%)`,
                opacity: gameState === "crashed" && !hasCashedOut ? 0.4 : 1,
              }}
            >
              {/* Jetpack Man */}
              <svg width="50" height="60" viewBox="0 0 50 60" fill="none" className="drop-shadow-lg">
                {/* Body */}
                <ellipse cx="25" cy="35" rx="10" ry="12" fill="#ffd93d" />
                {/* Head */}
                <circle cx="25" cy="18" r="10" fill="#ffcccb" />
                {/* Helmet */}
                <path d="M15 18 Q15 8 25 8 Q35 8 35 18" fill="#333" />
                <path d="M17 15 Q17 10 25 10 Q33 10 33 15" fill="#00b4d8" opacity="0.6" />
                {/* Goggles */}
                <ellipse cx="21" cy="18" rx="4" ry="3" fill="#0f1923" />
                <ellipse cx="29" cy="18" rx="4" ry="3" fill="#0f1923" />
                <ellipse cx="21" cy="17.5" rx="2" ry="1.5" fill="#00b4d8" opacity="0.3" />
                <ellipse cx="29" cy="17.5" rx="2" ry="1.5" fill="#00b4d8" opacity="0.3" />
                {/* Jetpack */}
                <rect x="12" y="28" width="6" height="16" rx="2" fill="#666" />
                <rect x="32" y="28" width="6" height="16" rx="2" fill="#666" />
                {/* Arms */}
                <path d="M15 32 L8 38" stroke="#ffcccb" strokeWidth="3" strokeLinecap="round" />
                <path d="M35 32 L42 38" stroke="#ffcccb" strokeWidth="3" strokeLinecap="round" />
                {/* Legs */}
                <path d="M20 47 L18 55" stroke="#333" strokeWidth="4" strokeLinecap="round" />
                <path d="M30 47 L32 55" stroke="#333" strokeWidth="4" strokeLinecap="round" />
                {/* Flames - only when flying and not cashed out */}
                {gameState === "flying" && !hasCashedOut && (
                  <>
                    <ellipse cx="15" cy="48" rx="3" ry="8" fill="#ff6b35" opacity="0.9">
                      <animate attributeName="ry" values="8;10;8" dur="0.15s" repeatCount="indefinite" />
                    </ellipse>
                    <ellipse cx="15" cy="48" rx="2" ry="6" fill="#ffd93d">
                      <animate attributeName="ry" values="6;8;6" dur="0.15s" repeatCount="indefinite" />
                    </ellipse>
                    <ellipse cx="35" cy="48" rx="3" ry="8" fill="#ff6b35" opacity="0.9">
                      <animate attributeName="ry" values="8;10;8" dur="0.15s" repeatCount="indefinite" />
                    </ellipse>
                    <ellipse cx="35" cy="48" rx="2" ry="6" fill="#ffd93d">
                      <animate attributeName="ry" values="6;8;6" dur="0.15s" repeatCount="indefinite" />
                    </ellipse>
                  </>
                )}
                {/* Money bag */}
                <ellipse cx="25" cy="40" rx="5" ry="4" fill="#2ee06e" />
                <text x="25" y="42" textAnchor="middle" fontSize="5" fill="#0f1923" fontWeight="bold">$</text>
              </svg>
            </div>
          )}

          {/* Multiplier Display - Only show during flight, result shown after crash */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
            {gameState === "waiting" && (
              <div>
                <p className="text-muted-foreground text-sm mb-2">{"Ожидание ставки..."}</p>
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
                    {"Забрано на "}{cashOutMultiplier.toFixed(2)}x
                  </p>
                )}
              </div>
            )}
            {gameState === "crashed" && showResult && (
              <div>
                <p className="text-5xl sm:text-6xl font-black text-[#ff4757]">
                  {crashPoint.toFixed(2)}x
                </p>
                <p className="text-lg font-bold text-[#ff4757] mt-2">{"Улетел!"}</p>
                {hasCashedOut && (
                  <p className="text-sm font-bold text-[#2ee06e] mt-1">
                    {"Вы забрали на "}{cashOutMultiplier.toFixed(2)}x (+{(betAmount * cashOutMultiplier - betAmount).toFixed(2)} ₽)
                  </p>
                )}
              </div>
            )}
            {gameState === "crashed" && !showResult && (
              <div>
                <p className="text-4xl font-black text-[#ff4757] animate-pulse">...</p>
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
            <label className="text-xs text-muted-foreground mb-1 block">{"Ставка"}</label>
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
              {"Забрать"} {(betAmount * multiplier).toFixed(2)} ₽ ({multiplier.toFixed(2)}x)
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
      </div>
    </GameLayout>
  )
}
