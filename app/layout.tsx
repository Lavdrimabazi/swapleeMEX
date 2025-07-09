import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SoundProvider } from "@/components/sound-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Swaplee - Lightning Cryptocurrency Exchange",
  description: "The fastest way to swap cryptocurrencies without accounts, wallets, or intermediaries.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SoundProvider>
            {children}
            <Toaster />
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
