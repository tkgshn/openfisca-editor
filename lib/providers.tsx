'use client'

import { ReactNode, useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'

interface ProvidersProps {
    children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
    // i18nの初期化を確認
    useEffect(() => {
        if (!i18n.isInitialized) {
            i18n.init()
        }
    }, [])

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <I18nextProvider i18n={i18n}>
                {children}
            </I18nextProvider>
        </ThemeProvider>
    )
}
