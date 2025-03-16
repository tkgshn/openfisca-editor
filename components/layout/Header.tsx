import type React from "react"
import Link from "next/link"
import { useTest } from "@/contexts/test-context"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

interface HeaderProps {
  title: string
}

/**
 * Header component for the application
 * @param {HeaderProps} props - Component props
 * @param {string} props.title - The title to display in the header
 * @returns {JSX.Element} Header component
 */
const Header: React.FC<HeaderProps> = ({ title }) => {
  const { isRunning: isLoading, results } = useTest()

  // テスト状態を生成
  const testStatus = {
    total: results?.length || 0,
    passed: results?.filter((test: any) => test.passed)?.length || 0,
    isSuccess: results?.length > 0 && results?.every((test: any) => test.passed)
  }

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            {title}
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/docs" className="text-sm hover:underline">
              ドキュメント
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>テスト実行中...</span>
            </div>
          ) : testStatus.total > 0 ? (
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                testStatus.isSuccess
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              {testStatus.isSuccess ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span>
                {testStatus.passed}/{testStatus.total} テスト
                {testStatus.isSuccess ? "成功" : "失敗"}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default Header
