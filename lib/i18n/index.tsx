"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ja } from "./locales/ja"
import { en } from "./locales/en"
import { fr } from "./locales/fr"

export type Locale = "ja" | "en" | "fr"
export type Translations = typeof ja

const locales: Record<Locale, Translations> = {
  ja,
  en,
  fr,
}

interface I18nContextType {
  locale: Locale
  t: Translations
  changeLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const LOCAL_STORAGE_KEY = "openfisca-editor-locale"

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ja")
  const [translations, setTranslations] = useState<Translations>(ja)

  useEffect(() => {
    // ブラウザのローカルストレージから言語設定を読み込む
    const savedLocale =
      typeof window !== "undefined" ? (localStorage.getItem(LOCAL_STORAGE_KEY) as Locale | null) : null

    if (savedLocale && locales[savedLocale]) {
      setLocale(savedLocale)
      setTranslations(locales[savedLocale])
    }
  }, [])

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    setTranslations(locales[newLocale])

    // ブラウザのローカルストレージに言語設定を保存
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, newLocale)
    }
  }

  return <I18nContext.Provider value={{ locale, t: translations, changeLocale }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
