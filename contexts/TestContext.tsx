"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { TestResult } from "@/types/types"
import { runTest } from "@/lib/api"

interface TestContextType {
  testResults: TestResult[]
  isLoading: boolean
  error: string | null
  runTests: (institutionId: string) => Promise<void>
  testStatus: {
    total: number
    passed: number
    isSuccess: boolean
  }
}

const TestContext = createContext<TestContextType | undefined>(undefined)

export const useTestContext = () => {
  const context = useContext(TestContext)
  if (context === undefined) {
    throw new Error("useTestContext must be used within a TestProvider")
  }
  return context
}

export const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const testStatus = {
    total: testResults.length,
    passed: testResults.filter((test) => test.passed).length,
    isSuccess: testResults.length > 0 && testResults.every((test) => test.passed),
  }

  const runTests = async (institutionId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const results = await runTest(institutionId)
      setTestResults(results)
    } catch (err) {
      console.error("Error running tests:", err)
      setError(`Failed to run tests: ${err instanceof Error ? err.message : String(err)}`)
      setTestResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TestContext.Provider value={{ testResults, isLoading, error, runTests, testStatus }}>
      {children}
    </TestContext.Provider>
  )
}

