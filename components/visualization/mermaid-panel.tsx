"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, GitBranch, Code, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Institution } from "@/lib/types"
import { generateMermaidDiagram } from "@/lib/api"
import { generateMermaidFromConditions } from "@/lib/ai-utils"
import { useI18n } from "@/lib/i18n"

interface MermaidPanelProps {
  institution: Institution
}

export function MermaidPanel({ institution }: MermaidPanelProps) {
  const { t } = useI18n()
  const [mermaidCode, setMermaidCode] = useState<string | null>(null)
  const [conditionsMermaidCode, setConditionsMermaidCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [conditionsLoading, setConditionsLoading] = useState(false)
  const mermaidRef = useRef<HTMLDivElement>(null)
  const conditionsMermaidRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (institution.mermaidCode) {
      setMermaidCode(institution.mermaidCode)
      renderMermaid(institution.mermaidCode, mermaidRef)
    } else {
      setMermaidCode(null)
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = ""
      }
    }

    // Reset conditions mermaid when institution changes
    setConditionsMermaidCode(null)
    if (conditionsMermaidRef.current) {
      conditionsMermaidRef.current.innerHTML = ""
    }
  }, [institution])

  const handleGenerateMermaid = async () => {
    if (!institution.formulaCode) {
      alert(t.flowchart.emptyCode)
      return
    }

    setLoading(true)
    try {
      const code = await generateMermaidDiagram(institution.formulaCode)
      setMermaidCode(code)
      renderMermaid(code, mermaidRef)
    } catch (error) {
      console.error("Failed to generate Mermaid diagram:", error)
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = `<p class="text-destructive">${t.flowchart.generationFailed}</p>`
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateConditionsMermaid = async () => {
    if (!institution.conditions || institution.conditions.trim() === "") {
      alert(t.flowchart.emptyConditions)
      return
    }

    setConditionsLoading(true)
    try {
      const code = await generateMermaidFromConditions(institution.conditions)
      setConditionsMermaidCode(code)
      renderMermaid(code, conditionsMermaidRef)
    } catch (error) {
      console.error("Failed to generate conditions Mermaid diagram:", error)
      if (conditionsMermaidRef.current) {
        conditionsMermaidRef.current.innerHTML =
          `<p class="text-destructive">${t.flowchart.conditionsGenerationFailed}</p>`
      }
    } finally {
      setConditionsLoading(false)
    }
  }

  const renderMermaid = async (code: string, ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return

    try {
      // Only load mermaid when needed
      const mermaid = (await import("mermaid")).default

      // Initialize mermaid with a unique ID to avoid conflicts
      const uniqueId = `mermaid-${Date.now()}`
      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "loose",
        fontFamily: "sans-serif",
      })

      // 安全にDOMをクリア
      while (ref.current.firstChild) {
        ref.current.removeChild(ref.current.firstChild)
      }

      // Render the diagram
      const { svg } = await mermaid.render(uniqueId, code)
      ref.current.innerHTML = svg
    } catch (error) {
      console.error("Failed to render Mermaid diagram:", error)
      if (ref.current) {
        ref.current.innerHTML = `<p class="text-destructive">${t.flowchart.renderingFailed}</p>`
      }
    }
  }

  // タブ変更時に自動的にフローチャートを生成
  const handleTabChange = (value: string) => {
    if (value === "code") {
      handleGenerateMermaid()
    } else if (value === "conditions") {
      handleGenerateConditionsMermaid()
    }
  }

  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-foreground" />
          {t.flowchart.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="conditions" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="conditions" className="flex items-center gap-1 flex-1">
              <FileText className="h-4 w-4" />
              <span>{t.flowchart.generateFromConditions}</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-1 flex-1">
              <Code className="h-4 w-4" />
              <span>{t.flowchart.generateFromCode}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="animate-slide-in">
            <div ref={mermaidRef} className="border rounded-md p-4 h-80 overflow-auto bg-white">
              {!mermaidCode && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <GitBranch className="h-12 w-12 mb-2 opacity-20" />
                  <p>{t.flowchart.generatingFromCode}</p>
                </div>
              )}
              {loading && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p>{t.flowchart.generatingMermaid}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="conditions" className="animate-slide-in">
            <div ref={conditionsMermaidRef} className="border rounded-md p-4 h-80 overflow-auto bg-white">
              {!conditionsMermaidCode && !conditionsLoading && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <FileText className="h-12 w-12 mb-2 opacity-20" />
                  <p>{t.flowchart.generatingFromConditions}</p>
                  <p className="text-sm mt-2">
                    {t.flowchart.currentConditions}: {institution.conditions ? `"${institution.conditions}"` : t.flowchart.notSet}
                  </p>
                </div>
              )}
              {conditionsLoading && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p>{t.flowchart.generatingConditionsMermaid}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
