"use client"

import { useState } from "react"
import Header from "@/components/header"
import AdminStats from "@/components/admin/admin-stats"
import AdminUsers from "@/components/admin/admin-users"
import AdminLogs from "@/components/admin/admin-logs"
import AdminBanners from "@/components/admin/admin-banners"
import AdminPromos from "@/components/admin/admin-promos"

const tabs = [
  { id: "stats", label: "Статистика" },
  { id: "users", label: "Пользователи" },
  { id: "logs", label: "Логи" },
  { id: "banners", label: "Баннеры" },
  { id: "promos", label: "Промокоды" },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("stats")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Админ панель</h1>
          <div className="px-3 py-1 rounded-lg bg-destructive/20 text-destructive text-xs font-semibold">
            DEMO
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-card rounded-xl border border-border/50 p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#2ee06e] text-[#0f1923]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "stats" && <AdminStats />}
        {activeTab === "users" && <AdminUsers />}
        {activeTab === "logs" && <AdminLogs />}
        {activeTab === "banners" && <AdminBanners />}
        {activeTab === "promos" && <AdminPromos />}
      </main>
    </div>
  )
}
