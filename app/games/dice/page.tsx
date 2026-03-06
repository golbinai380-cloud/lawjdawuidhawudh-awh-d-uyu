"use client"

import { useState, useCallback } from "react"
import GameLayout from "@/components/game-layout"

export default function DicePage() {
  const [balance, setBalance] = useState(1000)
  const [betAmount, setBetAmount] = useState(10)
  const [targetNumber, setTargetNumber] = useState(50)
  const [isOver, setIsOver] = useState(true)
  const [rolling, setRolling] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [won, setWon] = useState<boolean | null>(null)
  const [winAmount, setWinAmount] = useState(0)
  const [history, setHistory] = useState<{ result: number; won: boolean; amount: number }[]>([])
  const [animatingNumber, setAnimatingNumber] = useState<number | null>(null)
  const [dicePosition, setDicePosition] = useState<"hidden" | "falling" | "landed">("hidden")
  const [diceRotation, setDiceRotation] = useState(0)

  const multiplier = isOver
    ? (99 / (100 - targetNumber)).toFixed(4)
    : (99 / targetNumber).toFixed(4)

  const winChance = isOver ? 100 - targetNumber : targetNumber

  // Adjusted odds - make high multipliers nearly impossible
  const calculateActualResult = useCallback((targetNum: number, isOverMode: boolean) => {
    const mult = isOverMode ? 99 / (100 - targetNum) : 99 / targetNum
    
    // For high multipliers (>5x), drastically reduce win chance
    if (mult > 10) {
      // Nearly impossible to win at 10x+
      const hardRoll = Math.random()
      if (hardRoll > 0.02) { // 98% chance to lose
        // Force a losing result
        if (isOverMode) {
          return parseFloat((Math.random() * targetNum).toFixed(2))
        } else {
          return parseFloat((targetNum + Math.random() * (100 - targetNum)).toFixed(2))
        }
      }
    } else if (mult > 5) {
      // Very hard to win at 5x-10x
      const hardRoll = Math.random()
      if (hardRoll > 0.08) { // 92% chance to lose
        if (isOverMode) {
          return parseFloat((Math.random() * targetNum).toFixed(2))
        } else {
          return parseFloat((targetNum + Math.random() * (100 - targetNum)).toFixed(2))
        }
      }
    } else if (mult > 3) {
      // Hard to win at 3x-5x
      const hardRoll = Math.random()
      if (hardRoll > 0.20) { // 80% chance to lose
        if (isOverMode) {
          return parseFloat((Math.random() * targetNum).toFixed(2))
        } else {
          return parseFloat((targetNum + Math.random() * (100 - targetNum)).toFixed(2))
        }
      }
    }
    
    // Normal random result
    return parseFloat((Math.random() * 100).toFixed(2))
  }, [])

  const roll = useCallback(() => {
    if (rolling || betAmount <= 0 || betAmount > balance) return
    setRolling(true)
    setResult(null)
    setWon(null)
    setDicePosition("hidden")
    setDiceRotation(0)

    // Start dice falling animation
    setTimeout(() => {
      setDicePosition("falling")
      setDiceRotation(720 + Math.random() * 360)
    }, 100)

    // Animate number cycling
    let count = 0
    const maxCount = 20
    const interval = setInterval(() => {
      setAnimatingNumber(parseFloat((Math.random() * 100).toFixed(2)))
      count++
      if (count >= maxCount) {
        clearInterval(interval)

        const rolled = calculateActualResult(targetNumber, isOver)
        const isWin = isOver ? rolled > targetNumber : rolled < targetNumber
        const payout = isWin ? betAmount * parseFloat(multiplier) : 0

        setAnimatingNumber(null)
        setResult(rolled)
        setWon(isWin)
        setWinAmount(payout)
        setDicePosition("landed")

        if (isWin) {
          setBalance((b) => parseFloat((b + payout - betAmount).toFixed(2)))
        } else {
          setBalance((b) => parseFloat((b - betAmount).toFixed(2)))
        }

        setHistory((h) => [{ result: rolled, won: isWin, amount: isWin ? payout : -betAmount }, ...h.slice(0, 19)])
        setRolling(false)
      }
    }, 50)
  }, [rolling, betAmount, balance, targetNumber, isOver, multiplier, calculateActualResult])

  const displayNumber = rolling && animatingNumber !== null ? animatingNumber : result

  // Dice SVG component
  const DiceCube = ({ value, rotation }: { value: number; rotation: number }) => {
    const dotValue = Math.max(1, Math.min(6, Math.round(value / 16.67)))
    
    const getDots = (num: number) => {
      const positions: { [key: number]: [number, number][] } = {
        1: [[20, 20]],
        2: [[10, 10], [30, 30]],
        3: [[10, 10], [20, 20], [30, 30]],
        4: [[10, 10], [10, 30], [30, 10], [30, 30]],
        5: [[10, 10], [10, 30], [20, 20], [30, 10], [30, 30]],
        6: [[10, 10], [10, 20], [10, 30], [30, 10], [30, 20], [30, 30]],
      }
      return positions[num] || positions[1]
    }

    return (
      <svg 
        width="80" 
        height="80" 
        viewBox="0 0 40 40" 
        className="drop-shadow-xl"
        style={{ 
          transform: `rotate(${rotation}deg)`,
          transition: rolling ? 'transform 1s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
        }}
      >
        {/* Dice body */}
        <rect x="2" y="2" width="36" height="36" rx="6" fill="#fff" stroke="#e0e0e0" strokeWidth="1" />
        {/* 3D effect */}
        <rect x="2" y="2" width="36" height="36" rx="6" fill="url(#diceGradient)" />
        <defs>
          <linearGradient id="diceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#f0f0f0" />
          </linearGradient>
        </defs>
        {/* Dots */}
        {getDots(dotValue).map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5" fill="#1a1a2e" />
        ))}
      </svg>
    )
  }

  return (
    <GameLayout title="Dice" balance={balance}>
      <div className="flex flex-col gap-4">
        {/* Result Display */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #2ee06e 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

          {/* Dice animation area */}
          <div className="flex flex-col items-center gap-4 relative z-10">
            {/* Falling dice */}
            <div 
              className="relative h-28 w-28 flex items-center justify-center"
              style={{
                perspective: '200px',
              }}
            >
              <div
                className="transition-all duration-1000 ease-out"
                style={{
                  transform: dicePosition === "hidden" 
                    ? "translateY(-100px) scale(0.5)" 
                    : dicePosition === "falling"
                    ? "translateY(0) scale(1)"
                    : "translateY(0) scale(1)",
                  opacity: dicePosition === "hidden" ? 0 : 1,
                }}
              >
                {displayNumber !== null && (
                  <DiceCube value={displayNumber} rotation={diceRotation} />
                )}
              </div>
            </div>

            {/* Result number */}
            <div
              className={`relative w-28 h-16 rounded-xl flex items-center justify-center transition-all duration-150 ${
                rolling
                  ? "bg-secondary text-muted-foreground"
                  : won === true
                    ? "bg-[#2ee06e]/15 text-[#2ee06e] border-2 border-[#2ee06e]/40 win-shine"
                    : won === false
                      ? "bg-[#ff4757]/15 text-[#ff4757] border-2 border-[#ff4757]/40"
                      : "bg-secondary text-foreground"
              }`}
            >
              <span className="text-3xl sm:text-4xl font-black tabular-nums">
                {displayNumber !== null ? displayNumber.toFixed(2) : "?"}
              </span>
            </div>

            {won !== null && !rolling && (
              <div className={`text-center ${won ? "text-[#2ee06e]" : "text-[#ff4757]"}`}>
                <p className="text-xl font-black">
                  {won ? `+${winAmount.toFixed(2)} ₽` : `-${betAmount.toFixed(2)} ₽`}
                </p>
              </div>
            )}
          </div>

          {/* Slider visualization */}
          <div className="mt-4 px-2 relative z-10">
            <div className="relative h-4 rounded-full overflow-hidden bg-[#0f1923] border border-[#2a3f4e]">
              <div
                className="absolute top-0 h-full rounded-l-full transition-all duration-200"
                style={{
                  width: `${targetNumber}%`,
                  backgroundColor: isOver ? "rgba(255, 71, 87, 0.5)" : "rgba(46, 224, 110, 0.5)",
                }}
              />
              <div
                className="absolute top-0 h-full rounded-r-full transition-all duration-200"
                style={{
                  left: `${targetNumber}%`,
                  width: `${100 - targetNumber}%`,
                  backgroundColor: isOver ? "rgba(46, 224, 110, 0.5)" : "rgba(255, 71, 87, 0.5)",
                }}
              />
              {/* Target line */}
              <div
                className="absolute top-0 w-0.5 h-full bg-white z-10"
                style={{ left: `${targetNumber}%` }}
              />
              {/* Result marker */}
              {result !== null && !rolling && (
                <div
                  className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full z-20 border-2 border-white transition-all ${
                    won ? "bg-[#2ee06e]" : "bg-[#ff4757]"
                  }`}
                  style={{ left: `calc(${result}% - 6px)` }}
                />
              )}
            </div>
            <input
              type="range"
              min={2}
              max={98}
              value={targetNumber}
              onChange={(e) => setTargetNumber(parseInt(e.target.value))}
              className="w-full mt-3"
              disabled={rolling}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0</span>
              <span className="text-foreground font-bold text-sm">{targetNumber}</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Bet Amount */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{"Ставка"}</label>
              <div className="flex items-center bg-secondary rounded-lg overflow-hidden">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="flex-1 bg-transparent text-sm font-medium text-foreground px-3 py-2.5 outline-none min-w-0"
                  disabled={rolling}
                />
                <button
                  onClick={() => setBetAmount((b) => parseFloat((b / 2).toFixed(2)))}
                  className="px-2.5 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-[#2a3f4e] transition-colors"
                  disabled={rolling}
                >
                  /2
                </button>
                <button
                  onClick={() => setBetAmount((b) => Math.min(parseFloat((b * 2).toFixed(2)), balance))}
                  className="px-2.5 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-[#2a3f4e] transition-colors"
                  disabled={rolling}
                >
                  x2
                </button>
              </div>
            </div>

            {/* Direction */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{"Режим"}</label>
              <div className="flex bg-secondary rounded-lg overflow-hidden h-[42px]">
                <button
                  onClick={() => setIsOver(true)}
                  className={`flex-1 text-sm font-semibold transition-all ${
                    isOver ? "bg-[#2ee06e] text-[#0f1923] shadow-lg" : "text-muted-foreground hover:text-foreground"
                  }`}
                  disabled={rolling}
                >
                  {"Больше"}
                </button>
                <button
                  onClick={() => setIsOver(false)}
                  className={`flex-1 text-sm font-semibold transition-all ${
                    !isOver ? "bg-[#ff4757] text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                  }`}
                  disabled={rolling}
                >
                  {"Меньше"}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="bg-secondary rounded-lg px-3 py-2.5 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{"Множитель"}</p>
              <p className="text-sm font-bold text-foreground">{parseFloat(multiplier).toFixed(2)}x</p>
            </div>
            <div className="bg-secondary rounded-lg px-3 py-2.5 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{"Шанс"}</p>
              <p className="text-sm font-bold text-foreground">{winChance.toFixed(1)}%</p>
            </div>
            <div className="bg-secondary rounded-lg px-3 py-2.5 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{"Выигрыш"}</p>
              <p className="text-sm font-bold text-[#2ee06e]">
                {(betAmount * parseFloat(multiplier)).toFixed(2)} ₽
              </p>
            </div>
          </div>

          {/* Roll Button */}
          <button
            onClick={roll}
            disabled={rolling || betAmount <= 0 || betAmount > balance}
            className="w-full mt-4 bg-[#2ee06e] hover:bg-[#25c45c] disabled:bg-secondary disabled:text-muted-foreground text-[#0f1923] font-bold text-lg py-3.5 rounded-xl transition-all glow-green"
          >
            {rolling ? "Бросок..." : "Бросить"}
          </button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">{"История"}</h3>
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    h.won
                      ? "bg-[#2ee06e]/20 text-[#2ee06e] border border-[#2ee06e]/20"
                      : "bg-[#ff4757]/20 text-[#ff4757] border border-[#ff4757]/20"
                  }`}
                >
                  {h.result.toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  )
}
