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
import { useI18n } from "@/lib/i18n"

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
  const { t } = useI18n()
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
      const headerRegex = /^"""[\s\S]*?"""/
      let restOfCode = ""
      if (headerRegex.test(institution.formulaCode)) {
        restOfCode = institution.formulaCode.replace(headerRegex, "")
      } else {
        restOfCode = institution.formulaCode
      }

      // Create new header
      const newHeader = `"""
${formData.name} ${t.institution.implementation || 'の実装'}

${t.institution.summary}: ${formData.summary}
${t.institution.conditions}: ${formData.conditions}
${t.institution.department}: ${formData.department}
${t.institution.postingUrl}: ${formData.postingUrl}
${t.institution.applicationUrl}: ${formData.applicationUrl}
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
      alert(t.institution.saveSuccess)
    } catch (error) {
      console.error("Failed to save institution:", error)
      alert(t.institution.saveError)
    }
  }

  const handleDeleteInstitution = async () => {
    try {
      await deleteInstitution(institution.id)
      onDelete(institution.id)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Failed to delete institution:", error)
      alert(t.institution.deleteError)
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

      alert(t.institution.exportSuccess)
    } catch (error) {
      console.error("Failed to export institution:", error)
      alert(t.institution.exportError)
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
            .then(() => alert(t.institution.copyUrlSuccess))
            .catch(() => alert(t.institution.copyUrlError))
        }}
        testResults={currentTestResults}
      />

      <Card className="shadow-sm hover:shadow transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle>{t.institution.information}</CardTitle>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {t.common.save}
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="basic" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{t.tabs.basicInfo}</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{t.tabs.detailInfo}</span>
              </TabsTrigger>
              <TabsTrigger value="links" className="flex items-center gap-1">
                <Link2 className="h-4 w-4" />
                <span>{t.tabs.links}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 animate-slide-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.institution.institutionName}</Label>
                  <Input id="name" value={formData.name} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">{t.institution.department}</Label>
                  <Input id="department" value={formData.department} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">{t.institution.summary}</Label>
                <Textarea id="summary" rows={3} value={formData.summary} onChange={handleChange} />
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 animate-slide-in">
              <div className="space-y-2">
                <Label htmlFor="usage">{t.institution.usageMethod}</Label>
                <Textarea id="usage" rows={3} value={formData.usage} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditions">{t.institution.conditions}</Label>
                <Textarea id="conditions" rows={3} value={formData.conditions} onChange={handleChange} />
              </div>
            </TabsContent>

            <TabsContent value="links" className="space-y-4 animate-slide-in">
              <div className="space-y-2">
                <Label htmlFor="url">{t.institution.referenceUrl}</Label>
                <Input id="url" value={formData.url} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postingUrl">{t.institution.postingUrl}</Label>
                <Input id="postingUrl" value={formData.postingUrl} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationUrl">{t.institution.applicationUrl}</Label>
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
