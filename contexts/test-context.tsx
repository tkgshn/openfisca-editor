"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { runTest } from "@/lib/api"

interface TestContextType {
  isRunning: boolean
  results: any | null
  error: string | null
  runTestForInstitution: (institution: any, yamlContent?: string) => Promise<any>
  clearResults: () => void
  testResults: Record<string, any>
}

const TestContext = createContext<TestContextType | undefined>(undefined)

export function TestProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  const runTestForInstitution = async (institution: any, yamlContent?: string) => {
    if (!institution || !institution.id) {
      console.error("Invalid institution object provided to runTestForInstitution")
      return null
    }

    const institutionId = institution.id
    const testContent = yamlContent || institution.testYamlRaw || ""

    setIsRunning(true)
    setError(null)

    try {
      const abortController = new AbortController()
      const testResults = await runTest(institutionId, testContent, abortController.signal).catch((error) => {
        console.error("Error in runTest:", error)
        // エラーが発生した場合でもモックデータを返す
        return {
          stdout: "",
          stderr: `Error: ${error.message || "Unknown error"}`,
          returncode: 1,
          timestamp: new Date().toISOString(),
          duration: 0,
          passed: 0,
          failed: 0,
          total: 0,
          isMock: true,
        }
      })

      setResults(testResults)

      // Store results by institution ID
      setTestResults((prev) => ({
        ...prev,
        [institutionId]: testResults,
      }))

      // エラーメッセージがある場合はエラー状態を設定
      if (testResults.stderr && testResults.stderr.trim() !== "") {
        setError(testResults.stderr)
      }

      return testResults
    } catch (error) {
      console.error("Test execution error:", error)
      const errorMessage = error instanceof Error ? error.message : "テスト実行中に不明なエラーが発生しました"
      setError(errorMessage)

      // エラーが発生した場合でもモックデータを返す
      const mockResults = {
        stdout: "",
        stderr: errorMessage,
        returncode: 1,
        timestamp: new Date().toISOString(),
        duration: 0,
        passed: 0,
        failed: 0,
        total: 0,
        isMock: true,
      }

      setResults(mockResults)

      // Store results by institution ID
      setTestResults((prev) => ({
        ...prev,
        [institutionId]: mockResults,
      }))

      return mockResults
    } finally {
      setIsRunning(false)
    }
  }

  const clearResults = () => {
    setResults(null)
    setError(null)
  }

  return (
    <TestContext.Provider
      value={{
        isRunning,
        results,
        error,
        runTestForInstitution,
        clearResults,
        testResults,
      }}
    >
      {children}
    </TestContext.Provider>
  )
}

export function useTest() {
  const context = useContext(TestContext)
  if (context === undefined) {
    throw new Error("useTest must be used within a TestProvider")
  }
  return context
}

