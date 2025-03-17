
"use client"

import { useState, useEffect } from "react"
import { useI18n, type Locale } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { locale, t, changeLocale } = useI18n()
  const [mounted, setMounted] = useState(false)

  // クライアントサイドでのみ実行されるようにする
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
          <Globe className="h-4 w-4" />
          <span className="sr-only">言語切替</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLocale("ja")} className={locale === "ja" ? "bg-muted" : ""}>
          {t.settings.japanese}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLocale("en")} className={locale === "en" ? "bg-muted" : ""}>
          {t.settings.english}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLocale("fr")} className={locale === "fr" ? "bg-muted" : ""}>
          {t.settings.french}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
