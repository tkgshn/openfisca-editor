"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Link2, FileText, Users } from "lucide-react"
import type { Institution } from "@/lib/types"
import { updateInstitution, deleteInstitution, exportToOpenFisca, publishInstitution, revertToVersion } from "@/lib/api"
import { PublishPopover } from "@/components/institution/publish-popover"
import { ShareConfirmationModal } from "@/components/institution/share-confirmation-modal"
import { InstitutionHeader } from "@/components/institution/institution-header"
import { useTest } from "@/contexts/test-context"

// Import JSZip at the top of the file
import JSZip from "jszip"

interface InstitutionDetailsProps {
  institution: Institution
  onUpdate: (institution: Institution) => void
  onDelete: (id: string) => void
}

/**
 * 制度の詳細情報を表示・編集するコンポーネント
 *
 * @param institution - 対象の制度
 * @param onUpdate - 制度が更新されたときに呼び出されるコールバック
 * @param onDelete - 制度が削除されたときに呼び出されるコールバック
 */
export function InstitutionDetails({ institution, onUpdate, onDelete }: InstitutionDetailsProps) {
  const [formData, setFormData] = useState({
    name: institution.name || "",
    url: institution.url || "",
    summary: institution.summary || "",
    usage: institution.usage || "",
    conditions: institution.conditions || "",
    department: institution.department || "",
    postingUrl: institution.postingUrl || "",
    applicationUrl: institution.applicationUrl || "",
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPublishPopoverOpen, setIsPublishPopoverOpen] = useState(false)
  const publishButtonRef = useRef<HTMLButtonElement>(null)
  const [publishButtonRect, setPublishButtonRect] = useState<DOMRect | null>(null)
  const [isShareConfirmationOpen, setIsShareConfirmationOpen] = useState(false)
  const [selectedVisibility, setSelectedVisibility] = useState("private")
  const [currentTestResults, setCurrentTestResults] = useState<any>(null)

  const { runTestForInstitution, testResults } = useTest()
  const institutionTestResult = testResults[institution.id]

  // Reset form data when institution changes
  useEffect(() => {
    setFormData({
      name: institution.name || "",
      url: institution.url || "",
      summary: institution.summary || "",
      usage: institution.usage || "",
      conditions: institution.conditions || "",
      department: institution.department || "",
      postingUrl: institution.postingUrl || "",
      applicationUrl: institution.applicationUrl || "",
    })
    setCurrentTestResults(null)
  }, [institution])

  useEffect(() => {
    // 制度が選択されたら自動的にテストを実行
    const runTests = async () => {
      // 既にテスト結果がある場合は実行しない
      if (!institutionTestResult) {
        const results = await runTestForInstitution(institution)

        // テスト結果を制度に保存
        if (results) {
          const updatedInstitution = {
            ...institution,
            lastTestResults: {
              success: results.returncode === 0,
              timestamp: results.timestamp,
              duration: results.duration || 0,
              details: {
                passed: results.passed,
                failed: results.failed,
                total: results.total,
                errors: results.stderr ? [results.stderr] : undefined,
              },
            },
          }
          onUpdate(updatedInstitution)
        }
      }
    }

    runTests()
  }, [institution]) // 制度IDが変わったときだけ実行

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSave = async () => {
    try {
      // Extract header from existing code
      // ※TypeScriptのターゲットがES2018未満の場合、/s フラグはサポートされていない
      const headerRegex = /^"""[\s\S]*?"""/
      let restOfCode = ""
      if (headerRegex.test(institution.formulaCode)) {
        restOfCode = institution.formulaCode.replace(headerRegex, "")
      } else {
        restOfCode = institution.formulaCode
      }

      // Create new header
      const newHeader = `"""
${formData.name} の実装

概要: ${formData.summary}
利用条件: ${formData.conditions}
所管部署: ${formData.department}
掲載URL: ${formData.postingUrl}
申請先URL: ${formData.applicationUrl}
"""

`

      const updatedInstitution = {
        ...institution,
        name: formData.name,
        url: formData.url,
        summary: formData.summary,
        usage: formData.usage,
        conditions: formData.conditions,
        department: formData.department,
        postingUrl: formData.postingUrl,
        applicationUrl: formData.applicationUrl,
        formulaCode: newHeader + restOfCode,
      }

      await updateInstitution(updatedInstitution)
      onUpdate(updatedInstitution)
      alert("制度が保存されました。")
    } catch (error) {
      console.error("Failed to save institution:", error)
      alert("制度の保存に失敗しました。")
    }
  }

  const handleDeleteInstitution = async () => {
    try {
      await deleteInstitution(institution.id)
      onDelete(institution.id)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Failed to delete institution:", error)
      alert("制度の削除に失敗しました。")
    }
  }

  const handleExportInstitution = async () => {
    try {
      const files = await exportToOpenFisca(institution)

      // Create JSZip instance
      const zip = new JSZip()

      // Add files to zip
      zip.file(`${institution.name}.py`, files.variable)
      zip.file(`${institution.name}_test.yaml`, files.test)

      if (files.parameters.length > 0) {
        files.parameters.forEach((paramContent, index) => {
          const paramName = institution.parameters?.[index]?.name || `parameter_${index + 1}`
          zip.file(`${paramName}.yaml`, paramContent)
        })
      }

      // Generate zip file
      const content = await zip.generateAsync({ type: "blob" })

      // Create download link
      const url = window.URL.createObjectURL(content)
      const link = document.createElement("a")
      link.href = url
      link.download = `${institution.name}_openfisca.zip`
      document.body.appendChild(link)
      link.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)

      alert("ファイルのエクスポートが完了しました。")
    } catch (error) {
      console.error("Failed to export institution:", error)
      alert("ファイルのエクスポートに失敗しました。")
    }
  }

  const handlePublishInstitution = async (inst: Institution, visibility: string) => {
    try {
      await publishInstitution(inst, visibility)
      // 公開状態を更新
      const updatedInstitution = {
        ...institution,
        visibility: visibility,
        publishedAt: new Date().toISOString(),
      }
      onUpdate(updatedInstitution)
      setSelectedVisibility(visibility)
      setIsPublishPopoverOpen(false)
      setIsShareConfirmationOpen(true)
      return Promise.resolve()
    } catch (error) {
      console.error("Failed to publish institution:", error)
      return Promise.reject(error)
    }
  }

  const handlePublishButtonClick = () => {
    if (publishButtonRef.current) {
      setPublishButtonRect(publishButtonRef.current.getBoundingClientRect())
    }
    setIsPublishPopoverOpen(true)
  }

  return (
    <div className="space-y-4 pt-24">
      <InstitutionHeader
        institution={institution}
        onRevertVersion={async (versionId) => {
          const updatedInstitution = await revertToVersion(institution, versionId)
          onUpdate(updatedInstitution)
        }}
        onDelete={async (id) => {
          await onDelete(id);
        }}
        onExport={handleExportInstitution}
        onShare={handlePublishButtonClick}
        onCopyUrl={() => {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          const url = `${baseUrl}/institutions/${institution.id}`
          navigator.clipboard
            .writeText(url)
            .then(() => alert("URLをコピーしました"))
            .catch(() => alert("URLのコピーに失敗しました"))
        }}
        testResults={currentTestResults}
      />

      <Card className="shadow-sm hover:shadow transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle>制度情報</CardTitle>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            保存
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="basic" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>基本情報</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>詳細情報</span>
              </TabsTrigger>
              <TabsTrigger value="links" className="flex items-center gap-1">
                <Link2 className="h-4 w-4" />
                <span>リンク</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 animate-slide-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">制度名</Label>
                  <Input id="name" value={formData.name} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">所管部署</Label>
                  <Input id="department" value={formData.department} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">概要</Label>
                <Textarea id="summary" rows={3} value={formData.summary} onChange={handleChange} />
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 animate-slide-in">
              <div className="space-y-2">
                <Label htmlFor="usage">利用方法</Label>
                <Textarea id="usage" rows={3} value={formData.usage} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditions">利用条件</Label>
                <Textarea id="conditions" rows={3} value={formData.conditions} onChange={handleChange} />
              </div>
            </TabsContent>

            <TabsContent value="links" className="space-y-4 animate-slide-in">
              <div className="space-y-2">
                <Label htmlFor="url">参照URL</Label>
                <Input id="url" value={formData.url} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postingUrl">掲載URL</Label>
                <Input id="postingUrl" value={formData.postingUrl} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationUrl">申請先URL</Label>
                <Input id="applicationUrl" value={formData.applicationUrl} onChange={handleChange} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <PublishPopover
        isOpen={isPublishPopoverOpen}
        onClose={() => setIsPublishPopoverOpen(false)}
        institution={institution}
        onPublish={handlePublishInstitution}
        anchorRect={publishButtonRect}
      />
      <ShareConfirmationModal
        isOpen={isShareConfirmationOpen}
        onClose={() => setIsShareConfirmationOpen(false)}
        institution={institution}
        visibility={selectedVisibility}
      />
    </div>
  )
}
