"use client"

import { useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Sidebar } from "@/components/shared/sidebar"
import { InstitutionDetails } from "@/components/institution/institution-details"
import { TestCasePanel } from "@/components/test/test-case-panel"
import { CodeEditorPanel } from "@/components/editor/code-editor-panel"
import { MermaidPanel } from "@/components/visualization/mermaid-panel"
import { ParameterPanel } from "@/components/institution/parameter-panel"
import SimulationPanel from "@/components/simulation/SimulationPanel"
import type { Institution } from "@/lib/types"
import { fetchInstitutions, deleteInstitution, exportToOpenFisca } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, Download, Trash2, X } from "lucide-react"
import { TestProvider } from "@/contexts/test-context"

export default function OpenFiscaEditor() {
  // 既存のコードは省略...
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [selectedInstitutionIndex, setSelectedInstitutionIndex] = useState<number | null>(null)
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    loadInstitutions()
  }, [])

  const loadInstitutions = async () => {
    setLoading(true)
    const institutions = await fetchInstitutions()
    setInstitutions(institutions)

    // 児童手当（sample-1）を初期選択
    const childcareIndex = institutions.findIndex(inst => inst.id === 'sample-1')
    if (childcareIndex !== -1) {
      setSelectedInstitutionIndex(childcareIndex)
      setSelectedInstitution(institutions[childcareIndex])
    }

    setLoading(false)
  }

  const handleInstitutionSelect = (index: number) => {
    setSelectedInstitutionIndex(index)
    setSelectedInstitution(institutions[index])
  }

  const handleAddInstitution = async (institution: Institution) => {
    setInstitutions([...institutions, institution])
    setSelectedInstitution(institution)
    setSelectedInstitutionIndex(institutions.length)
  }

  const handleInstitutionUpdate = async (updatedInstitution: Institution) => {
    const updatedInstitutions = institutions.map((institution) =>
      institution.id === updatedInstitution.id ? updatedInstitution : institution,
    )
    setInstitutions(updatedInstitutions)
    setSelectedInstitution(updatedInstitution)
  }

  const handleDeleteInstitution = async (id: string) => {
    await deleteInstitution(id)
    setInstitutions(institutions.filter((institution) => institution.id !== id))
    setSelectedInstitution(null)
    setSelectedInstitutionIndex(null)
  }

  const handleBulkExport = async () => {
    const selected = institutions.filter((institution) => selectedInstitutions.includes(institution.id))
    // 複数の制度があれば、それぞれをエクスポート
    for (const institution of selected) {
      await exportToOpenFisca(institution)
    }
  }

  const handleBulkDelete = async () => {
    const userInstitutionsToDelete = institutions.filter(
      (institution) => selectedInstitutions.includes(institution.id) && institution.source === "user",
    )
    await Promise.all(userInstitutionsToDelete.map((institution) => deleteInstitution(institution.id)))

    const deletedIds = userInstitutionsToDelete.map((institution) => institution.id)

    setInstitutions(institutions.filter((institution) => !deletedIds.includes(institution.id)))
    setSelectedInstitutions([])
    setIsDeleteDialogOpen(false)
  }

  const handleSelectInstitutions = (ids: string[]) => {
    setSelectedInstitutions(ids)
  }

  const handleToggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode)
    if (isMultiSelectMode) {
      setSelectedInstitutions([])
    }
  }

  const selectedUserInstitutionsCount = institutions.filter(
    (institution) => selectedInstitutions.includes(institution.id) && institution.source === "user",
  ).length

  return (
    <TestProvider>
      <div className="flex flex-col md:flex-row h-screen bg-background">
        <Sidebar
          institutions={institutions}
          selectedIndex={selectedInstitutionIndex}
          onSelect={handleInstitutionSelect}
          onAddInstitution={handleAddInstitution}
          selectedInstitutions={selectedInstitutions}
          onSelectInstitutions={handleSelectInstitutions}
          isMultiSelectMode={isMultiSelectMode}
          onToggleMultiSelectMode={handleToggleMultiSelectMode}
        />

        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-4 animate-fade-in">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-lg">制度データを読み込み中...</p>
              </div>
            </div>
          ) : isMultiSelectMode && selectedInstitutions.length > 0 ? (
            <div className="space-y-6 animate-fade-in">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex justify-between items-center">
                    <span>{selectedInstitutions.length}件の制度を選択中</span>
                    <Button variant="ghost" size="sm" onClick={handleToggleMultiSelectMode} className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedInstitutions.map((id) => {
                      const institution = institutions.find((inst) => inst.id === id)
                      return institution ? (
                        <div key={id} className="bg-muted/50 px-3 py-1.5 rounded-md text-sm flex items-center gap-1">
                          {institution.name}
                          {institution.source === "sample" && (
                            <span className="text-xs text-muted-foreground">(サンプル)</span>
                          )}
                        </div>
                      ) : null
                    })}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={handleBulkExport}
                      className="flex items-center gap-2"
                      disabled={selectedInstitutions.length === 0}
                    >
                      <Download className="h-4 w-4" />
                      選択した制度をエクスポート
                    </Button>

                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                          disabled={selectedUserInstitutionsCount === 0}
                        >
                          <Trash2 className="h-4 w-4" />
                          選択した制度を削除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{selectedUserInstitutionsCount}件の制度を削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription>
                            この操作は元に戻せません。選択した制度とそのすべてのデータが完全に削除されます。
                            {selectedInstitutions.length > selectedUserInstitutionsCount && (
                              <p className="mt-2 text-amber-500">
                                注意: サンプル制度は削除できないため、
                                {selectedInstitutions.length - selectedUserInstitutionsCount}件の制度は削除されません。
                              </p>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleBulkDelete}
                          >
                            削除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : selectedInstitution ? (
            <div className="space-y-6 animate-fade-in">
              <InstitutionDetails
                institution={selectedInstitution}
                onUpdate={handleInstitutionUpdate}
                onDelete={handleDeleteInstitution}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TestCasePanel institution={selectedInstitution} onUpdate={handleInstitutionUpdate} />
                <MermaidPanel institution={selectedInstitution} />
              </div>

              <div className="space-y-6">
                <CodeEditorPanel institution={selectedInstitution} onUpdate={handleInstitutionUpdate} />
                <SimulationPanel institution={selectedInstitution} />
                {/* <ParameterPanel institution={selectedInstitution} onUpdate={handleInstitutionUpdate} /> */}
                {/* TestRunnerPanelを削除 */}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 animate-fade-in">
                <p className="text-lg">制度を選択するか、新しい制度を作成してください</p>
                <Button
                  onClick={() =>
                    handleAddInstitution({
                      id: uuidv4(),
                      source: "user",
                      name: "新しい制度",
                      formulaCode: `"""
新しい制度 の実装

概要:
利用条件:
所管部署:
掲載URL:
申請先URL:
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯

class 新しい制度(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = ""
    reference = ""
    conditions = ""
    department = ""
    application_url = ""

    def formula(対象世帯, 対象期間, parameters):
        return 0`,
                      testCases: [],
                      parameters: [],
                      versions: [],
                      currentVersion: "",
                    })
                  }
                >
                  新しい制度を作成
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </TestProvider>
  )
}
