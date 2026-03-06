import type { Metadata, Viewport } from 'next'
import { Rubik, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { TelegramProvider } from '@/components/telegram-provider'
import Script from 'next/script'
import './globals.css'

const rubik = Rubik({
  subsets: ["latin", "cyrillic"],
  variable: "--font-rubik",
})
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'PLAID - Сервис мгновенных игр',
  description: 'PLAID - официальный сервис мгновенных игр. Dice, Mines, Wheel, Aviatrix, BlackJack, Roulette и другие игры.',
}

export const viewport: Viewport = {
  themeColor: '#0f1923',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <head>
        <Script 
          src="https://telegram.org/js/telegram-web-app.js" 
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${rubik.variable} font-sans antialiased`}>
        <TelegramProvider>
          {children}
        </TelegramProvider>
        <Analytics />
      </body>
    </html>
  )
}
