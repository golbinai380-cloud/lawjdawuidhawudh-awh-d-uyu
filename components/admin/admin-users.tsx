"use client"

import { useState } from "react"
import { Search, ChevronDown, ChevronUp } from "lucide-react"

const users = [
  { id: 1, username: "Player_4821", email: "p4821@mail.ru", ip: "192.168.1.42", balance: 5420.50, totalDeposit: 15000, totalWins: 12500, totalLosses: 8200, status: "active", registered: "2026-01-05" },
  { id: 2, username: "Player_9103", email: "p9103@gmail.com", ip: "10.0.0.15", balance: 1230.00, totalDeposit: 8000, totalWins: 6800, totalLosses: 5500, status: "active", registered: "2026-01-12" },
  { id: 3, username: "Player_1447", email: "p1447@yandex.ru", ip: "172.16.0.88", balance: 0.00, totalDeposit: 3000, totalWins: 2100, totalLosses: 3000, status: "banned", registered: "2026-01-18" },
  { id: 4, username: "Player_6629", email: "p6629@mail.ru", ip: "192.168.2.101", balance: 8900.75, totalDeposit: 25000, totalWins: 22000, totalLosses: 15000, status: "active", registered: "2026-01-22" },
  { id: 5, username: "Player_3345", email: "p3345@gmail.com", ip: "10.0.1.55", balance: 340.20, totalDeposit: 5000, totalWins: 3200, totalLosses: 4800, status: "active", registered: "2026-02-01" },
  { id: 6, username: "Player_7788", email: "p7788@yandex.ru", ip: "172.16.1.200", balance: 15200.00, totalDeposit: 50000, totalWins: 45000, totalLosses: 30000, status: "vip", registered: "2026-01-02" },
  { id: 7, username: "Player_2210", email: "p2210@mail.ru", ip: "192.168.3.77", balance: 670.00, totalDeposit: 7500, totalWins: 5600, totalLosses: 6200, status: "active", registered: "2026-02-10" },
  { id: 8, username: "Player_5544", email: "p5544@gmail.com", ip: "10.0.2.33", balance: 2100.80, totalDeposit: 12000, totalWins: 9800, totalLosses: 7500, status: "active", registered: "2026-02-15" },
]

export default function AdminUsers() {
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<string>("id")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const filtered = users
    .filter(
      (u) =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.ip.includes(search)
    )
    .sort((a, b) => {
      const aVal = a[sortField as keyof typeof a]
      const bVal = b[sortField as keyof typeof b]
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
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
            placeholder="Поиск по имени, email, IP..."
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
                  { key: "id", label: "ID" },
                  { key: "username", label: "Игрок" },
                  { key: "email", label: "Email" },
                  { key: "ip", label: "IP" },
                  { key: "balance", label: "Баланс" },
                  { key: "totalDeposit", label: "Депозиты" },
                  { key: "status", label: "Статус" },
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
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-t border-border/50 hover:bg-secondary/30">
                  <td className="px-3 py-2.5 text-muted-foreground">#{user.id}</td>
                  <td className="px-3 py-2.5 font-medium text-foreground">{user.username}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{user.email}</td>
                  <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{user.ip}</td>
                  <td className="px-3 py-2.5 font-semibold text-[#2ee06e]">{user.balance.toFixed(2)} ₽</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{user.totalDeposit} ₽</td>
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
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
