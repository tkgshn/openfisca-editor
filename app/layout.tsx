import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AIProvider } from "@/components/ai-provider"
import { I18nProvider } from "@/lib/i18n"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "OpenFisca Editor",
  description: "An editor for OpenFisca social policy rules",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <I18nProvider>
            <AIProvider>{children}</AIProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'
