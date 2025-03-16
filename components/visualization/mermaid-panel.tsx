"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, GitBranch, Code, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Institution } from "@/lib/types"
import { generateMermaidDiagram } from "@/lib/api"
import { generateMermaidFromConditions } from "@/lib/ai-utils"

interface MermaidPanelProps {
  institution: Institution
}

/**
 * Mermaidフローチャートを表示・生成するパネルコンポーネント
 *
 * @param institution - 対象の制度
 */
export function MermaidPanel({ institution }: MermaidPanelProps) {
  const [mermaidCode, setMermaidCode] = useState<string | null>(null)
  const [conditionsMermaidCode, setConditionsMermaidCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [conditionsLoading, setConditionsLoading] = useState(false)
  const mermaidRef = useRef<HTMLDivElement>(null)
  const conditionsMermaidRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<string>("conditions") // 利用条件タブをデフォルトに
  const isMountedRef = useRef(true)
  const mermaidInstanceRef = useRef<any>(null)
  const renderLockRef = useRef(false)

  // コンポーネントのマウント状態を追跡
  useEffect(() => {
    isMountedRef.current = true

    // Mermaidライブラリを一度だけ読み込む
    const loadMermaid = async () => {
      try {
        if (!mermaidInstanceRef.current) {
          const mermaid = (await import("mermaid")).default
          mermaid.initialize({
            startOnLoad: false,
            theme: "default",
            securityLevel: "loose",
            fontFamily: "sans-serif",
          })
          mermaidInstanceRef.current = mermaid
        }
      } catch (error) {
        console.error("Failed to load Mermaid:", error)
      }
    }

    loadMermaid()

    return () => {
      isMountedRef.current = false
      // コンポーネントのアンマウント時に参照をクリア
      if (mermaidRef.current) {
        try {
          mermaidRef.current.innerHTML = ""
        } catch (e) {
          console.error("Error clearing mermaid ref:", e)
        }
      }
      if (conditionsMermaidRef.current) {
        try {
          conditionsMermaidRef.current.innerHTML = ""
        } catch (e) {
          console.error("Error clearing conditions mermaid ref:", e)
        }
      }
    }
  }, [])

  // 制度が変わったときの処理
  useEffect(() => {
    // 既存のコードをリセット
    setMermaidCode(null)
    setConditionsMermaidCode(null)

    // 安全にDOMをクリア
    if (mermaidRef.current) {
      try {
        mermaidRef.current.innerHTML = ""
      } catch (e) {
        console.error("Error clearing mermaid ref:", e)
      }
    }
    if (conditionsMermaidRef.current) {
      try {
        conditionsMermaidRef.current.innerHTML = ""
      } catch (e) {
        console.error("Error clearing conditions mermaid ref:", e)
      }
    }

    // 制度のmermaidCodeがあれば表示
    if (institution.mermaidCode) {
      setMermaidCode(institution.mermaidCode)

      // 安全のため、setTimeout でレンダリングを遅延
      const timerId = setTimeout(() => {
        if (isMountedRef.current && mermaidRef.current) {
          try {
            renderMermaidSafely(institution.mermaidCode, mermaidRef)
          } catch (error) {
            console.error("Failed to render initial mermaid:", error)
          }
        }
      }, 300)

      return () => clearTimeout(timerId)
    }
  }, [institution.id, institution.mermaidCode]) // institution.id が変わったときだけ実行

  // 利用条件が変わったときの処理
  useEffect(() => {
    if (institution.conditions && institution.conditions.trim() !== "") {
      // 安全のため、setTimeout で生成を遅延
      const timerId = setTimeout(() => {
        if (isMountedRef.current && !conditionsLoading) {
          handleGenerateConditionsMermaid()
        }
      }, 500)

      return () => clearTimeout(timerId)
    }
  }, [institution.id, institution.conditions])

  /**
   * OpenFiscaコードからフローチャートを生成する
   */
  const handleGenerateMermaid = async () => {
    if (!institution.formulaCode) {
      alert("OpenFiscaコードが空です。")
      return
    }

    setLoading(true)
    try {
      const code = await generateMermaidDiagram(institution.formulaCode)

      // コンポーネントがまだマウントされているか確認
      if (!isMountedRef.current) return

      setMermaidCode(code)

      // 安全のため、setTimeout でレンダリングを遅延
      const timerId = setTimeout(() => {
        if (isMountedRef.current && mermaidRef.current) {
          renderMermaidSafely(code, mermaidRef)
        }
      }, 100)

      return () => clearTimeout(timerId)
    } catch (error) {
      console.error("Failed to generate Mermaid diagram:", error)
      if (isMountedRef.current && mermaidRef.current) {
        try {
          mermaidRef.current.innerHTML = '<p class="text-destructive">Mermaid記法の生成に失敗しました。</p>'
        } catch (e) {
          console.error("Error setting error message:", e)
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  /**
   * 利用条件からフローチャートを生成する
   */
  const handleGenerateConditionsMermaid = async () => {
    if (!institution.conditions || institution.conditions.trim() === "") {
      alert("利用条件が設定されていません。")
      return
    }

    // 既に生成中なら何もしない
    if (conditionsLoading) return

    setConditionsLoading(true)
    try {
      const code = await generateMermaidFromConditions(institution.conditions)

      // コンポーネントがまだマウントされているか確認
      if (!isMountedRef.current) return

      setConditionsMermaidCode(code)

      // 安全のため、setTimeout でレンダリングを遅延
      const timerId = setTimeout(() => {
        if (isMountedRef.current && conditionsMermaidRef.current) {
          renderMermaidSafely(code, conditionsMermaidRef)
        }
      }, 100)

      return () => clearTimeout(timerId)
    } catch (error) {
      console.error("Failed to generate conditions Mermaid diagram:", error)
      if (isMountedRef.current && conditionsMermaidRef.current) {
        try {
          conditionsMermaidRef.current.innerHTML =
            '<p class="text-destructive">利用条件からのMermaid記法の生成に失敗しました。</p>'
        } catch (e) {
          console.error("Error setting error message:", e)
        }
      }
    } finally {
      if (isMountedRef.current) {
        setConditionsLoading(false)
      }
    }
  }

  /**
   * 安全にMermaidを描画する関数
   */
  const renderMermaidSafely = async (code: string, ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current || !isMountedRef.current || !mermaidInstanceRef.current || renderLockRef.current) return

    // 描画処理をロック
    renderLockRef.current = true

    try {
      // 安全にDOMをクリア
      try {
        while (ref.current.firstChild) {
          ref.current.removeChild(ref.current.firstChild)
        }
      } catch (e) {
        console.error("Error clearing ref:", e)
        ref.current.innerHTML = ""
      }

      // 一時的なコンテナを作成
      const tempContainer = document.createElement("div")
      tempContainer.style.width = "100%"
      tempContainer.style.height = "100%"

      // 一意のIDを生成
      const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

      // SVGを生成
      const { svg } = await mermaidInstanceRef.current.render(uniqueId, code)

      // コンポーネントがまだマウントされているか確認
      if (!isMountedRef.current || !ref.current) return

      // 生成したSVGを一時コンテナに設定
      tempContainer.innerHTML = svg

      // 一時コンテナの内容をターゲット要素に設定
      try {
        ref.current.appendChild(tempContainer.firstChild!)
      } catch (e) {
        console.error("Error appending SVG:", e)
        ref.current.innerHTML = svg
      }
    } catch (error) {
      console.error("Failed to render Mermaid diagram:", error)
      if (ref.current && isMountedRef.current) {
        try {
          ref.current.innerHTML = '<p class="text-destructive">Mermaidダイアグラムのレンダリングに失敗しました。</p>'
        } catch (e) {
          console.error("Error setting error message:", e)
        }
      }
    } finally {
      // 描画処理のロックを解除
      renderLockRef.current = false
    }
  }

  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-200 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-foreground" />
          フローチャート
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="conditions" className="flex items-center gap-1 flex-1">
              <FileText className="h-4 w-4" />
              <span>利用条件から生成</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-1 flex-1">
              <Code className="h-4 w-4" />
              <span>コードから生成</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conditions" className="animate-slide-in">
            <div className="mb-3 flex justify-end">
              <Button
                onClick={handleGenerateConditionsMermaid}
                disabled={conditionsLoading || !institution.conditions}
                variant="outline"
                className="gap-2"
              >
                {conditionsLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  "利用条件からフロー生成"
                )}
              </Button>
            </div>

            <div ref={conditionsMermaidRef} className="border rounded-md p-4 h-80 overflow-auto bg-white">
              {!conditionsMermaidCode && !conditionsLoading && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <FileText className="h-12 w-12 mb-2 opacity-20" />
                  <p>
                    「利用条件からフロー生成」ボタンをクリックして、自然言語の利用条件からフローチャートを生成します。
                  </p>
                  <p className="text-sm mt-2">
                    現在の利用条件: {institution.conditions ? `「${institution.conditions}」` : "未設定"}
                  </p>
                </div>
              )}
              {conditionsLoading && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p>利用条件からフローチャートを生成中...</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="code" className="animate-slide-in">
            <div className="mb-3 flex justify-end">
              <Button onClick={handleGenerateMermaid} disabled={loading} variant="outline" className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  "コードからフロー生成"
                )}
              </Button>
            </div>

            <div ref={mermaidRef} className="border rounded-md p-4 h-80 overflow-auto bg-white">
              {!mermaidCode && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <GitBranch className="h-12 w-12 mb-2 opacity-20" />
                  <p>「コードからフロー生成」ボタンをクリックして、OpenFiscaコードからフローチャートを生成します。</p>
                </div>
              )}
              {loading && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p>Mermaidフローを生成中...</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

