"use client"

import { type ReactNode, createContext, useContext } from "react"

interface AIContextType {
  apiKey: string | null
}

const AIContext = createContext<AIContextType>({
  apiKey: null,
})

export function useAI() {
  return useContext(AIContext)
}

export function AIProvider({ children }: { children: ReactNode }) {
  // サーバーサイドのAPIキーを優先的に使用し、フォールバックとしてクライアントサイドのAPIキーを使用
  const apiKey = process.env.OPENAI_API_KEY || null

  return <AIContext.Provider value={{ apiKey }}>{children}</AIContext.Provider>
}

