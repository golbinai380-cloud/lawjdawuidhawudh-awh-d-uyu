"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import GameLayout from "@/components/game-layout"

const ROWS = 10
const MULTIPLIERS_LOW = [5.6, 2.1, 1.1, 1.0, 0.5, 0.3, 0.5, 1.0, 1.1, 2.1, 5.6]
const MULTIPLIERS_MED = [13, 3, 1.3, 0.7, 0.4, 0.2, 0.4, 0.7, 1.3, 3, 13]
const MULTIPLIERS_HIGH = [29, 4, 1.5, 0.3, 0.2, 0.1, 0.2, 0.3, 1.5, 4, 29]

type RiskLevel = "low" | "medium" | "high"

const RISK_MULTIPLIERS: Record<RiskLevel, number[]> = {
  low: MULTIPLIERS_LOW,
  medium: MULTIPLIERS_MED,
  high: MULTIPLIERS_HIGH,
}

interface Ball {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  finalIndex: number
  done: boolean
  bouncing: boolean
}

export default function PlinkoPage() {
  const [balance, setBalance] = useState(1000)
  const [betAmount, setBetAmount] = useState(10)
  const [risk, setRisk] = useState<RiskLevel>("medium")
  const [balls, setBalls] = useState<Ball[]>([])
  const [dropping, setDropping] = useState(false)
  const [history, setHistory] = useState<{ multiplier: number; won: boolean; amount: number }[]>([])
  const [lastLandedIndex, setLastLandedIndex] = useState<number | null>(null)
  const animRef = useRef<number>(0)
  const ballIdRef = useRef(0)

  const multipliers = RISK_MULTIPLIERS[risk]
  const buckets = multipliers.length
  const pinSpacing = 28 // Smaller for mobile
  const startX = (buckets - 1) * pinSpacing / 2
  const svgWidth = (buckets + 1) * pinSpacing
  const svgHeight = (ROWS + 4) * pinSpacing

  const drop = useCallback(() => {
    if (betAmount <= 0 || betAmount > balance) return
    setDropping(true)
    setLastLandedIndex(null)

    // Generate path with physics simulation
    const path: number[] = []
    for (let i = 0; i < ROWS; i++) {
      // Add some randomness to direction
      const bias = Math.random()
      path.push(bias > 0.5 ? 1 : -1)
    }

    // Calculate final bucket with some randomness
    let finalX = startX
    for (let i = 0; i < ROWS; i++) {
      finalX += path[i] * pinSpacing / 2
      // Add small random offset
      finalX += (Math.random() - 0.5) * 2
    }
    const bucketIndex = Math.round(finalX / pinSpacing)
    const clampedIndex = Math.max(0, Math.min(buckets - 1, bucketIndex))

    const newBall: Ball = {
      id: ++ballIdRef.current,
      x: startX + (Math.random() - 0.5) * 4,
      y: 5,
      vx: 0,
      vy: 0,
      finalIndex: clampedIndex,
      done: false,
      bouncing: false,
    }

    setBalls((prev) => [...prev, newBall])
    setBalance((b) => parseFloat((b - betAmount).toFixed(2)))

    let step = 0
    let currentX = newBall.x
    let currentY = 5
    let velocityX = 0
    let velocityY = 0

    const animate = () => {
      if (step < ROWS) {
        // Physics-based movement
        const direction = path[step]
        const targetX = currentX + direction * pinSpacing / 2
        const targetY = (step + 1.5) * pinSpacing
        
        // Smooth interpolation with bounce effect
        currentX += (targetX - currentX) * 0.3 + velocityX * 0.2
        currentY += (targetY - currentY) * 0.25 + velocityY * 0.1
        
        // Add velocity dampening
        velocityX = (targetX - currentX) * 0.5
        velocityY = 2
        
        // Add slight wobble
        currentX += (Math.random() - 0.5) * 1.5
        
        step++

        setBalls((prev) =>
          prev.map((b) =>
            b.id === newBall.id ? { ...b, x: currentX, y: currentY, bouncing: true } : b
          )
        )
        animRef.current = requestAnimationFrame(() => setTimeout(animate, 80))
      } else {
        // Ball landing in pocket
        const finalBucketX = clampedIndex * pinSpacing
        const finalY = (ROWS + 1.5) * pinSpacing
        
        // Animate into pocket
        const landingAnimation = () => {
          const dx = finalBucketX - currentX
          const dy = finalY - currentY
          
          if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
            currentX += dx * 0.3
            currentY += dy * 0.3
            
            setBalls((prev) =>
              prev.map((b) =>
                b.id === newBall.id ? { ...b, x: currentX, y: currentY, bouncing: false } : b
              )
            )
            requestAnimationFrame(landingAnimation)
          } else {
            // Ball settled
            const mult = multipliers[clampedIndex]
            const payout = parseFloat((betAmount * mult).toFixed(2))
            const isWin = mult >= 1

            setBalls((prev) =>
              prev.map((b) =>
                b.id === newBall.id ? { ...b, x: finalBucketX, y: finalY, done: true } : b
              )
            )

            setLastLandedIndex(clampedIndex)

            if (payout > 0) {
              setBalance((b) => parseFloat((b + payout).toFixed(2)))
            }

            setHistory((h) => [
              { multiplier: mult, won: isWin, amount: isWin ? payout - betAmount : payout - betAmount },
              ...h.slice(0, 19),
            ])

            setTimeout(() => {
              setBalls((prev) => prev.filter((b) => b.id !== newBall.id))
            }, 800)

            setDropping(false)
          }
        }
        
        landingAnimation()
      }
    }

    animate()
  }, [betAmount, balance, startX, multipliers, buckets])

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  const getMultiplierColor = (mult: number) => {
    if (mult >= 10) return "#ff4757"
    if (mult >= 3) return "#ffd93d"
    if (mult >= 1) return "#2ee06e"
    if (mult >= 0.5) return "#00b4d8"
    return "#e17055"
  }

  return (
    <GameLayout title="Plinko" balance={balance}>
      <div className="flex flex-col gap-3">
        {/* Plinko Board - Mobile Optimized */}
        <div className="bg-gradient-to-b from-[#1a2c38] to-[#0f1923] rounded-2xl border border-border/50 p-2 sm:p-4 flex justify-center overflow-hidden relative">
          {/* Background glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#2ee06e]/5 rounded-full blur-3xl" />

          <svg
            viewBox={`-10 -5 ${svgWidth + 20} ${svgHeight + 35}`}
            className="w-full max-w-[340px] relative z-10"
          >
            {/* Pins */}
            {Array.from({ length: ROWS }).map((_, row) =>
              Array.from({ length: row + 3 }).map((_, col) => {
                const px = startX - (row + 2) * pinSpacing / 2 + col * pinSpacing
                const py = (row + 1) * pinSpacing
                return (
                  <g key={`${row}-${col}`}>
                    <circle cx={px} cy={py} r={3.5} fill="#4a6070" />
                    <circle cx={px} cy={py} r={2} fill="#7b8fa3" />
                    <circle cx={px - 0.3} cy={py - 0.3} r={0.8} fill="#a0b4c4" opacity="0.5" />
                  </g>
                )
              })
            )}

            {/* Pocket walls */}
            {Array.from({ length: buckets + 1 }).map((_, i) => {
              const wx = i * pinSpacing - pinSpacing / 2
              const wy = (ROWS + 0.8) * pinSpacing
              return (
                <rect
                  key={`wall-${i}`}
                  x={wx - 1.5}
                  y={wy}
                  width={3}
                  height={32}
                  rx={1.5}
                  fill="#2a3f4e"
                />
              )
            })}

            {/* Multiplier pockets */}
            {multipliers.map((mult, i) => {
              const bx = i * pinSpacing
              const by = (ROWS + 1) * pinSpacing
              const color = getMultiplierColor(mult)
              const isLanded = lastLandedIndex === i
              return (
                <g key={i}>
                  {/* Pocket background */}
                  <rect
                    x={bx - pinSpacing / 2 + 2}
                    y={by}
                    width={pinSpacing - 4}
                    height={28}
                    rx={4}
                    fill={isLanded ? color : `${color}99`}
                    stroke={isLanded ? "white" : "none"}
                    strokeWidth={isLanded ? 2 : 0}
                  />
                  {/* Pocket bottom curve for ball to settle */}
                  <ellipse
                    cx={bx}
                    cy={by + 20}
                    rx={(pinSpacing - 8) / 2}
                    ry={6}
                    fill={`${color}40`}
                  />
                  {/* Multiplier text */}
                  <text
                    x={bx}
                    y={by + 13}
                    textAnchor="middle"
                    fontSize={mult >= 10 ? 6 : 7}
                    fontWeight={700}
                    fill="#0f1923"
                  >
                    {mult}x
                  </text>
                </g>
              )
            })}

            {/* Balls */}
            {balls.map((ball) => (
              <g key={ball.id}>
                {/* Ball shadow */}
                <ellipse
                  cx={ball.x}
                  cy={ball.y + 6}
                  rx={4}
                  ry={1.5}
                  fill="black"
                  opacity="0.15"
                />
                {/* Ball */}
                <circle
                  cx={ball.x}
                  cy={ball.y}
                  r={6}
                  fill="#ffd93d"
                  stroke="#e17055"
                  strokeWidth={1.5}
                  style={{ 
                    transition: ball.bouncing ? "none" : "cx 0.15s ease-out, cy 0.15s ease-out",
                  }}
                />
                {/* Ball highlight */}
                <circle
                  cx={ball.x - 1.5}
                  cy={ball.y - 1.5}
                  r={2}
                  fill="white"
                  opacity="0.5"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Controls */}
        <div className="bg-card rounded-2xl border border-border/50 p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{"Ставка"}</label>
              <div className="flex items-center bg-secondary rounded-lg overflow-hidden">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="flex-1 bg-transparent text-sm font-medium text-foreground px-2 sm:px-3 py-2 outline-none min-w-0"
                  disabled={dropping}
                />
                <button
                  onClick={() => setBetAmount((b) => Math.max(1, parseFloat((b / 2).toFixed(2))))}
                  className="px-2 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-[#2a3f4e] transition-colors"
                >
                  /2
                </button>
                <button
                  onClick={() => setBetAmount((b) => Math.min(parseFloat((b * 2).toFixed(2)), balance))}
                  className="px-2 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-[#2a3f4e] transition-colors"
                >
                  x2
                </button>
              </div>
            </div>

            {/* Risk Level */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{"Риск"}</label>
              <div className="flex bg-secondary rounded-lg overflow-hidden h-[38px]">
                {(["low", "medium", "high"] as RiskLevel[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRisk(r)}
                    disabled={dropping}
                    className={`flex-1 text-[10px] sm:text-xs font-semibold transition-all ${
                      risk === r
                        ? r === "high"
                          ? "bg-[#ff4757] text-white shadow-md"
                          : r === "medium"
                            ? "bg-[#ffd93d] text-[#0f1923] shadow-md"
                            : "bg-[#2ee06e] text-[#0f1923] shadow-md"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r === "low" ? "Низкий" : r === "medium" ? "Средний" : "Высокий"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={drop}
            disabled={dropping || betAmount <= 0 || betAmount > balance}
            className="w-full mt-3 bg-[#2ee06e] hover:bg-[#25c45c] disabled:bg-secondary disabled:text-muted-foreground text-[#0f1923] font-bold text-base py-3 rounded-xl transition-all glow-green"
          >
            {dropping ? "Падает..." : "Бросить"}
          </button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-card rounded-2xl border border-border/50 p-3 sm:p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">{"История"}</h3>
            <div className="flex flex-wrap gap-1.5">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="px-2 py-1 rounded-lg text-xs font-bold border"
                  style={{
                    backgroundColor: `${getMultiplierColor(h.multiplier)}20`,
                    color: getMultiplierColor(h.multiplier),
                    borderColor: `${getMultiplierColor(h.multiplier)}30`,
                  }}
                >
                  {h.multiplier}x
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  )
}
