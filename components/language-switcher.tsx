"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Languages } from "lucide-react"
import { supportedLanguages } from '@/lib/i18n'
import { useI18n } from '@/lib/i18n'

/**
 * 言語切り替えコンポーネント
 * ドロップダウンメニューで言語を選択できる
 */
export function LanguageSwitcher() {
    const { locale, setLocale } = useI18n()

    // 言語切り替え処理
    const handleLanguageChange = (langCode: string) => {
        setLocale(langCode as any);
    }

    // 現在の言語名を取得
    const currentLanguageName = supportedLanguages.find(
        (lang) => lang.code === locale
    )?.name || 'English'

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    <span className="hidden md:inline">{currentLanguageName}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {supportedLanguages.map((language) => (
                    <DropdownMenuItem
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={locale === language.code ? "bg-muted" : ""}
                    >
                        <span className="mr-2">{language.code === 'ja' ? '🇯🇵' : language.code === 'en' ? '🇬🇧' : '🇫🇷'}</span>
                        {language.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
