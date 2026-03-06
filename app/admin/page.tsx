"use client"

import { useState } from "react"
import Header from "@/components/header"
import AdminStats from "@/components/admin/admin-stats"
import AdminUsers from "@/components/admin/admin-users"
import AdminLogs from "@/components/admin/admin-logs"
import AdminBanners from "@/components/admin/admin-banners"
import AdminPromos from "@/components/admin/admin-promos"
import { BarChart3, Users, ScrollText, Image, Ticket, Settings } from "lucide-react"

const tabs = [
  { id: "stats", label: "Статистика", icon: BarChart3 },
  { id: "users", label: "Пользователи", icon: Users },
  { id: "logs", label: "Логи", icon: ScrollText },
  { id: "banners", label: "Баннеры", icon: Image },
  { id: "promos", label: "Промокоды", icon: Ticket },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("stats")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 flex flex-col gap-4">
        {/* Admin Header */}
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2aabee]/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-[#2aabee]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Админ панель</h1>
                <p className="text-xs text-muted-foreground">Telegram Mini App Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-lg bg-[#2aabee]/20 text-[#2aabee] text-xs font-semibold">
                ADMIN
              </div>
              <div className="px-3 py-1 rounded-lg bg-destructive/20 text-destructive text-xs font-semibold">
                DEMO
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Telegram style */}
        <div className="flex items-center gap-1 bg-card rounded-xl border border-border/50 p-1.5 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#2aabee] text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "stats" && <AdminStats />}
        {activeTab === "users" && <AdminUsers />}
        {activeTab === "logs" && <AdminLogs />}
        {activeTab === "banners" && <AdminBanners />}
        {activeTab === "promos" && <AdminPromos />}

        {/* Admin Info */}
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Конфигурация</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-secondary rounded-lg p-3">
              <p className="text-muted-foreground mb-1">Telegram Bot Token</p>
              <p className="font-mono text-foreground">
                {process.env.NEXT_PUBLIC_BOT_CONFIGURED === "true" 
                  ? "***configured***" 
                  : "Not configured"}
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <p className="text-muted-foreground mb-1">Plaidex Merchant ID</p>
              <p className="font-mono text-foreground">
                {process.env.NEXT_PUBLIC_PLAIDEX_CONFIGURED === "true" 
                  ? "***configured***" 
                  : "Not configured"}
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <p className="text-muted-foreground mb-1">TON Wallet</p>
              <p className="font-mono text-foreground">
                {process.env.NEXT_PUBLIC_TON_CONFIGURED === "true" 
                  ? "***configured***" 
                  : "Not configured"}
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <p className="text-muted-foreground mb-1">Admin IDs</p>
              <p className="font-mono text-foreground">
                {process.env.NEXT_PUBLIC_ADMINS_CONFIGURED === "true" 
                  ? "***configured***" 
                  : "Not configured"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
