"\"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Code } from "lucide-react"
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

interface CodeEditorPanelProps {
  institution: Institution
  onUpdate: (institution: Institution) => void
}

export function CodeEditorPanel({ institution, onUpdate }: CodeEditorPanelProps) {
  const [code, setCode] = useState(institution.formulaCode || "")
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    setCode(institution.formulaCode || "")
  }, [institution])

  const handleSaveCode = async () => {
    try {
      const updatedInstitution = {
        ...institution,
        formulaCode: code,
      }

      await updateInstitution(updatedInstitution)
      onUpdate(updatedInstitution)
      alert("OpenFiscaコードを保存しました。")
    } catch (error) {
      console.error("Failed to save code:", error)
      alert("コードの保存に失敗しました。")
    }
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
      </CardHeader>
      <CardContent className="space-y-4">
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
        <Button onClick={handleSaveCode} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          コードを保存
        </Button>
      </CardContent>
    </Card>
  )
}

