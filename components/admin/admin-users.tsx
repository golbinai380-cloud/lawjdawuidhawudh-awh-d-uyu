"use client"

import { useState } from "react"
import { Search, ChevronDown, ChevronUp, ExternalLink, Ban, Gift, Crown } from "lucide-react"

// User data with real Telegram-style fields
const users = [
  { 
    telegramId: 1847293651, 
    username: "@alexplay_777", 
    firstName: "Александр", 
    ip: "95.24.156.89", 
    balance: 5420.50, 
    totalDeposit: 15000, 
    totalWins: 12500, 
    totalLosses: 8200, 
    status: "active", 
    registered: "2026-01-05",
    lastActive: "2 мин назад"
  },
  { 
    telegramId: 928374651, 
    username: "@lucky_winner_ru", 
    firstName: "Михаил", 
    ip: "185.6.82.44", 
    balance: 1230.00, 
    totalDeposit: 8000, 
    totalWins: 6800, 
    totalLosses: 5500, 
    status: "active", 
    registered: "2026-01-12",
    lastActive: "15 мин назад"
  },
  { 
    telegramId: 473829156, 
    username: null, 
    firstName: "Дмитрий", 
    ip: "46.138.12.205", 
    balance: 0.00, 
    totalDeposit: 3000, 
    totalWins: 2100, 
    totalLosses: 3000, 
    status: "banned", 
    registered: "2026-01-18",
    lastActive: "3 дня назад"
  },
  { 
    telegramId: 7384920163, 
    username: "@spinmaster_pro", 
    firstName: "Владимир", 
    ip: "178.253.88.12", 
    balance: 8900.75, 
    totalDeposit: 25000, 
    totalWins: 22000, 
    totalLosses: 15000, 
    status: "active", 
    registered: "2026-01-22",
    lastActive: "1 час назад"
  },
  { 
    telegramId: 5938274610, 
    username: "@dice_king_2024", 
    firstName: "Артем", 
    ip: "92.100.45.178", 
    balance: 340.20, 
    totalDeposit: 5000, 
    totalWins: 3200, 
    totalLosses: 4800, 
    status: "active", 
    registered: "2026-02-01",
    lastActive: "30 мин назад"
  },
  { 
    telegramId: 1029384756, 
    username: "@vip_gambler", 
    firstName: "Сергей", 
    ip: "77.88.21.134", 
    balance: 15200.00, 
    totalDeposit: 50000, 
    totalWins: 45000, 
    totalLosses: 30000, 
    status: "vip", 
    registered: "2026-01-02",
    lastActive: "Сейчас"
  },
  { 
    telegramId: 8192736450, 
    username: null, 
    firstName: "Николай", 
    ip: "213.87.144.55", 
    balance: 670.00, 
    totalDeposit: 7500, 
    totalWins: 5600, 
    totalLosses: 6200, 
    status: "active", 
    registered: "2026-02-10",
    lastActive: "5 часов назад"
  },
  { 
    telegramId: 6029384751, 
    username: "@wheel_fan", 
    firstName: "Игорь", 
    ip: "79.139.67.201", 
    balance: 2100.80, 
    totalDeposit: 12000, 
    totalWins: 9800, 
    totalLosses: 7500, 
    status: "active", 
    registered: "2026-02-15",
    lastActive: "45 мин назад"
  },
]

export default function AdminUsers() {
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<string>("telegramId")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const filtered = users
    .filter((u) => {
      const searchLower = search.toLowerCase()
      return (
        u.telegramId.toString().includes(search) ||
        (u.username && u.username.toLowerCase().includes(searchLower)) ||
        u.firstName.toLowerCase().includes(searchLower) ||
        u.ip.includes(search)
      )
    })
    .sort((a, b) => {
      const aVal = a[sortField as keyof typeof a]
      const bVal = b[sortField as keyof typeof b]
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal
      }
      return sortDir === "asc"
        ? String(aVal || "").localeCompare(String(bVal || ""))
        : String(bVal || "").localeCompare(String(aVal || ""))
    })

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const SortIcon = ({ field }: { field: string }) =>
    sortField === field ? (
      sortDir === "asc" ? (
        <ChevronUp className="w-3 h-3" />
      ) : (
        <ChevronDown className="w-3 h-3" />
      )
    ) : null

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center bg-card rounded-lg border border-border/50 px-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по ID, username, имени, IP..."
            className="flex-1 bg-transparent text-sm text-foreground px-2 py-2.5 outline-none placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50">
                {[
                  { key: "telegramId", label: "Telegram ID" },
                  { key: "username", label: "Username" },
                  { key: "firstName", label: "Имя" },
                  { key: "ip", label: "IP" },
                  { key: "balance", label: "Баланс" },
                  { key: "totalDeposit", label: "Депозиты" },
                  { key: "status", label: "Статус" },
                  { key: "lastActive", label: "Активность" },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      <SortIcon field={col.key} />
                    </span>
                  </th>
                ))}
                <th className="text-center px-3 py-2.5 text-xs font-medium text-muted-foreground">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.telegramId} className="border-t border-border/50 hover:bg-secondary/30">
                  <td className="px-3 py-2.5">
                    <a
                      href={`https://t.me/${user.username?.replace('@', '') || ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-[#2aabee] hover:underline flex items-center gap-1"
                    >
                      {user.telegramId}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-3 py-2.5">
                    {user.username ? (
                      <a
                        href={`https://t.me/${user.username.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2aabee] hover:underline"
                      >
                        {user.username}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-foreground">{user.firstName}</td>
                  <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{user.ip}</td>
                  <td className="px-3 py-2.5 font-semibold text-[#2ee06e]">{user.balance.toFixed(2)} &#8381;</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{user.totalDeposit} &#8381;</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        user.status === "active"
                          ? "bg-[#2ee06e]/20 text-[#2ee06e]"
                          : user.status === "vip"
                            ? "bg-[#ffd93d]/20 text-[#ffd93d]"
                            : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {user.status === "active" ? "ACTIVE" : user.status === "vip" ? "VIP" : "BANNED"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{user.lastActive}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        className="p-1.5 rounded-md hover:bg-[#ffd93d]/20 transition-colors"
                        title="Выдать бонус"
                      >
                        <Gift className="w-3.5 h-3.5 text-[#ffd93d]" />
                      </button>
                      <button
                        className="p-1.5 rounded-md hover:bg-[#ffd93d]/20 transition-colors"
                        title="Сделать VIP"
                      >
                        <Crown className="w-3.5 h-3.5 text-[#ffd93d]" />
                      </button>
                      <button
                        className={`p-1.5 rounded-md transition-colors ${
                          user.status === "banned"
                            ? "hover:bg-[#2ee06e]/20"
                            : "hover:bg-destructive/20"
                        }`}
                        title={user.status === "banned" ? "Разбанить" : "Забанить"}
                      >
                        <Ban className={`w-3.5 h-3.5 ${
                          user.status === "banned" ? "text-[#2ee06e]" : "text-destructive"
                        }`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-lg border border-border/50 p-3 text-center">
          <p className="text-xs text-muted-foreground">Всего</p>
          <p className="text-lg font-bold text-foreground">{users.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border/50 p-3 text-center">
          <p className="text-xs text-muted-foreground">Активных</p>
          <p className="text-lg font-bold text-[#2ee06e]">{users.filter(u => u.status === "active").length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border/50 p-3 text-center">
          <p className="text-xs text-muted-foreground">VIP</p>
          <p className="text-lg font-bold text-[#ffd93d]">{users.filter(u => u.status === "vip").length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border/50 p-3 text-center">
          <p className="text-xs text-muted-foreground">Забанено</p>
          <p className="text-lg font-bold text-destructive">{users.filter(u => u.status === "banned").length}</p>
        </div>
      </div>
    </div>
  )
}
