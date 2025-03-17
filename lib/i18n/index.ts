import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { useState, useEffect, createContext, useContext, ReactNode } from "react";

// 言語リソースのインポート
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import ja from "./locales/ja.json";

// 型定義
export type Locale = "en" | "fr" | "ja";

// i18nの初期化
i18n
    // 言語自動検出プラグイン
    .use(LanguageDetector)
    // react-i18nextの初期化
    .use(initReactI18next)
    // 初期化
    .init({
        resources: {
            en,
            fr,
            ja
        },
        fallbackLng: "en", // フォールバック言語
        debug: process.env.NODE_ENV === "development",
        defaultNS: "common", // デフォルトの名前空間

        interpolation: {
            escapeValue: false, // Reactが既にXSS対策をしているため不要
        },

        // 言語検出の設定
        detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"],
        },
    });

// 言語切り替えヘルパー関数
export const changeLanguage = (language: string) => {
    return i18n.changeLanguage(language);
};

// サポートされている言語の一覧
export const supportedLanguages = [
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
    { code: "ja", name: "日本語" }
];

// JSX部分は.tsxファイルにエクスポート
export { I18nProvider, useI18n } from "./provider";

export default i18n;
