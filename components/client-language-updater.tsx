"use client"

import { useEffect } from "react"
import { useI18n } from "@/lib/i18n"

export function ClientLanguageUpdater() {
  const { locale } = useI18n()
  
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])
  
  return null
}
