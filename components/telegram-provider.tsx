"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

// Telegram WebApp types
interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    query_id?: string
    user?: TelegramUser
    auth_date?: number
    hash?: string
    start_param?: string
  }
  version: string
  platform: string
  colorScheme: "light" | "dark"
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  ready: () => void
  expand: () => void
  close: () => void
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    setText: (text: string) => void
    setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void
  }
  BackButton: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  HapticFeedback: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void
    notificationOccurred: (type: "error" | "success" | "warning") => void
    selectionChanged: () => void
  }
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
  showPopup: (params: { title?: string; message: string; buttons?: Array<{ id?: string; type?: string; text?: string }> }, callback?: (buttonId: string) => void) => void
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void
  openTelegramLink: (url: string) => void
  openInvoice: (url: string, callback?: (status: string) => void) => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

interface TelegramContextType {
  webApp: TelegramWebApp | null
  user: TelegramUser | null
  isReady: boolean
  isTelegramApp: boolean
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  isReady: false,
  isTelegramApp: false,
})

export function useTelegram() {
  return useContext(TelegramContext)
}

interface TelegramProviderProps {
  children: ReactNode
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isTelegramApp, setIsTelegramApp] = useState(false)

  useEffect(() => {
    // Check if we're in Telegram WebApp
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tgWebApp = window.Telegram.WebApp
      setWebApp(tgWebApp)
      setIsTelegramApp(true)

      // Get user data
      if (tgWebApp.initDataUnsafe.user) {
        setUser(tgWebApp.initDataUnsafe.user)
      }

      // Tell Telegram WebApp we're ready
      tgWebApp.ready()
      tgWebApp.expand()

      setIsReady(true)
    } else {
      // Not in Telegram, use demo data
      setUser({
        id: 12847,
        is_bot: false,
        first_name: "Demo",
        last_name: "User",
        username: "demo_user",
        language_code: "ru",
      })
      setIsReady(true)
    }
  }, [])

  return (
    <TelegramContext.Provider value={{ webApp, user, isReady, isTelegramApp }}>
      {children}
    </TelegramContext.Provider>
  )
}

// Utility hooks
export function useTelegramUser() {
  const { user } = useTelegram()
  return user
}

export function useTelegramHaptic() {
  const { webApp } = useTelegram()
  
  return {
    impact: (style: "light" | "medium" | "heavy" | "rigid" | "soft" = "medium") => {
      webApp?.HapticFeedback?.impactOccurred(style)
    },
    notification: (type: "error" | "success" | "warning") => {
      webApp?.HapticFeedback?.notificationOccurred(type)
    },
    selection: () => {
      webApp?.HapticFeedback?.selectionChanged()
    },
  }
}
