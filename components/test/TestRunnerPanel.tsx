import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useTest } from "@/contexts/test-context"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface TestRunnerPanelProps {
  institutionId: string
}

/**
 * Panel for displaying test results
 * @param {TestRunnerPanelProps} props - Component props
 * @param {string} props.institutionId - ID of the institution
 * @returns {JSX.Element} Test runner panel component
 */
const TestRunnerPanel: React.FC<TestRunnerPanelProps> = ({ institutionId }) => {
  const { results: testResults, isRunning: isLoading, error } = useTest()
  const testStatus = {
    total: testResults?.length || 0,
    passed: testResults?.filter((test: any) => test.passed)?.length || 0,
    isSuccess: testResults?.length > 0 && testResults?.every((test: any) => test.passed)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">テスト結果</h3>
        {isLoading && <div className="text-sm text-gray-500">テスト実行中...</div>}
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <p className="text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {testResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">結果:</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">{testStatus.passed} 成功</span>
            {testStatus.passed < testStatus.total && (
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-sm">
                {testStatus.total - testStatus.passed} 失敗
              </span>
            )}
          </div>

          {testResults.map((result: any, index: number) => (
            <Card
              key={index}
              className={`${result.passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  {result.passed ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-medium">{result.name}</h4>
                    {result.error && <p className="text-red-600 mt-2">{result.error}</p>}
                    {!result.passed && !result.error && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">期待値:</p>
                        <pre className="bg-white p-2 rounded mt-1 text-sm overflow-x-auto">
                          {JSON.stringify(result.expected, null, 2)}
                        </pre>
                        <p className="text-sm text-gray-600 mt-2">実際の値:</p>
                        <pre className="bg-white p-2 rounded mt-1 text-sm overflow-x-auto">
                          {JSON.stringify(result.output, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default TestRunnerPanel
