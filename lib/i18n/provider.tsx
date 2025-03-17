"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import i18n from "./index";

// 型定義
export type Locale = "en" | "fr" | "ja";

// I18nコンテキスト型
interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
}

// I18nコンテキストの作成
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// I18nプロバイダーコンポーネント
export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>("ja");

    useEffect(() => {
        // ブラウザのローカルストレージから言語設定を読み込む
        const savedLocale = typeof window !== "undefined"
            ? (localStorage.getItem("openfisca-editor-locale") as Locale | null)
            : null;

        if (savedLocale && ["en", "fr", "ja"].includes(savedLocale)) {
            setLocale(savedLocale as Locale);
            i18n.changeLanguage(savedLocale);
        }
    }, []);

    const handleSetLocale = (newLocale: Locale) => {
        setLocale(newLocale);
        i18n.changeLanguage(newLocale);

        // ブラウザのローカルストレージに言語設定を保存
        if (typeof window !== "undefined") {
            localStorage.setItem("openfisca-editor-locale", newLocale);
        }
    };

    return (
        <I18nContext.Provider value={{ locale, setLocale: handleSetLocale }}>
            {children}
        </I18nContext.Provider>
    );
}

// useI18nフック
export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error("useI18n must be used within an I18nProvider");
    }

    const { t } = useTranslation();

    return {
        locale: context.locale,
        setLocale: context.setLocale,
        t,
        i18n
    };
}
