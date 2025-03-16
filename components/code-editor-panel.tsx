"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Code, RefreshCw, Check, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ParameterCarousel } from "./parameter-carousel"
import type { Institution } from "@/lib/types"
import { updateInstitution } from "@/lib/api"
import { useTheme } from "next-themes"
import CodeMirror from "@uiw/react-codemirror"
import { python } from "@codemirror/lang-python"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import { githubLight } from "@uiw/codemirror-theme-github"
import { lintGutter } from "@codemirror/lint"
import { indentUnit } from "@codemirror/language"
import { EditorView } from "@codemirror/view"

export function CodeEditorPanel({
  institution,
  onUpdate,
}: {
  institution: Institution
  onUpdate: (institution: Institution) => void
}) {
  const [code, setCode] = useState(institution.formulaCode || "")
  const [isLoading, setIsLoading] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message?: string
  } | null>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    setCode(institution.formulaCode || "")
  }, [institution])

  const handleSaveCode = async () => {
    try {
      setIsLoading(true)
      const updatedInstitution = {
        ...institution,
        formulaCode: code,
      }

      await updateInstitution(updatedInstitution)
      onUpdate(updatedInstitution)
      setValidationResult({
        isValid: true,
        message: "コードが保存されました",
      })
      setTimeout(() => {
        setValidationResult(null)
      }, 3000)
    } catch (error) {
      console.error("Failed to save code:", error)
      setValidationResult({
        isValid: false,
        message: "コードの保存に失敗しました",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidate = () => {
    // 簡易的なバリデーション（実際はサーバーサイドでの検証が必要）
    setIsLoading(true)
    setTimeout(() => {
      const isValid = !code.includes("syntax error")
      setValidationResult({
        isValid,
        message: isValid ? "コードは有効です" : "構文エラーがあります",
      })
      setIsLoading(false)
    }, 1000)
  }

  const editorExtensions = [
    python(),
    lintGutter(),
    indentUnit.of("    "), // 4スペースのインデント
    EditorView.lineWrapping,
    EditorView.theme({
      "&": {
        fontSize: "14px",
        fontFamily: "monospace",
      },
    }),
  ]

  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5 text-foreground" />
          OpenFiscaコードエディタ
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleValidate}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Code className="h-4 w-4" />}
            検証
          </Button>
          <Button size="sm" onClick={handleSaveCode} disabled={isLoading} className="flex items-center gap-1">
            <Save className="h-4 w-4 mr-1" />
            保存
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="editor">
          <TabsList className="mb-2">
            <TabsTrigger value="editor">エディタ</TabsTrigger>
            <TabsTrigger value="help">ヘルプ</TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="space-y-4">
            {validationResult && (
              <div
                className={`p-2 rounded text-sm flex items-center gap-2 ${
                  validationResult.isValid
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                }`}
              >
                {validationResult.isValid ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                {validationResult.message}
              </div>
            )}

            <div className="border rounded-md overflow-hidden h-96 bg-card">
              <CodeMirror
                value={code}
                onChange={setCode}
                height="384px"
                theme={isDark ? vscodeDark : githubLight}
                extensions={editorExtensions}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightSpecialChars: true,
                  history: true,
                  foldGutter: true,
                  drawSelection: true,
                  dropCursor: true,
                  allowMultipleSelections: true,
                  indentOnInput: true,
                  syntaxHighlighting: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  rectangularSelection: true,
                  crosshairCursor: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  closeBracketsKeymap: true,
                  searchKeymap: true,
                  foldKeymap: true,
                  completionKeymap: true,
                  lintKeymap: true,
                }}
              />
            </div>

            <div className="text-xs text-muted-foreground text-right">Ctrl+S または Cmd+S で保存</div>

            <Separator className="my-4" />

            {/* パラメータカルーセルを追加 */}
            {institution.parameters && institution.parameters.length > 0 && (
              <ParameterCarousel parameters={institution.parameters} className="mt-4" />
            )}
          </TabsContent>
          <TabsContent value="help">
            <div className="space-y-4 text-sm">
              <div className="flex gap-2">
                <div>
                  <h3 className="font-medium">OpenFiscaコードについて</h3>
                  <p className="text-muted-foreground mt-1">
                    OpenFiscaはPythonベースの税・社会保障シミュレーションフレームワークです。ここでは制度のロジックをPythonコードで記述します。
                  </p>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <h4 className="font-medium mb-2">基本的な構造</h4>
                <pre className="text-xs overflow-x-auto">
                  {`class 制度名(Variable):
    value_type = float  # 戻り値の型
    entity = Person     # 対象エンティティ
    definition_period = MONTH  # 計算期間
    label = "制度の説明"
    
    def formula(person, period, parameters):
        # 条件や計算ロジックを記述
        age = person('age', period)
        income = person('income', period)
        
        # パラメータの参照
        threshold = parameters(period).制度名.threshold
        
        # 条件判定と給付額の計算
        eligible = (age >= 20) & (income < threshold)
        amount = eligible * 10000
        
        return amount`}
                </pre>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <h4 className="font-medium mb-2">よく使う関数と演算子</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <code>person('変数名', period)</code> - 他の変数を参照
                  </li>
                  <li>
                    <code>parameters(period).カテゴリ.パラメータ名</code> - パラメータを参照
                  </li>
                  <li>
                    <code>&</code> - 論理AND（NumPyベクトル演算）
                  </li>
                  <li>
                    <code>|</code> - 論理OR（NumPyベクトル演算）
                  </li>
                  <li>
                    <code>where(条件, 真の場合の値, 偽の場合の値)</code> - 条件分岐
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

