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
  // APIキーは環境変数から取得
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || null

  return <AIContext.Provider value={{ apiKey }}>{children}</AIContext.Provider>
}

