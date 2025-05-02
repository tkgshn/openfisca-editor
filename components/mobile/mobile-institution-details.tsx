"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save, Link2, FileText, Users, Share2, Download, Copy, Globe } from "lucide-react"
import type { Institution } from "@/lib/types"
import { useI18n } from "@/lib/i18n"
import { updateInstitution, exportToOpenFisca, publishInstitution, revertToVersion } from "@/lib/api"
import { PublishPopover } from "@/components/institution/publish-popover"
import { ShareConfirmationModal } from "@/components/institution/share-confirmation-modal"
import { Badge } from "@/components/ui/badge"
import JSZip from "jszip"

interface MobileInstitutionDetailsProps {
  institution: Institution
  onUpdate: (institution: Institution) => void
  onDelete: (id: string) => void
}

/**
 * Mobile-optimized institution details component
 * Provides a compact view for institution details with collapsible sections
 */
export function MobileInstitutionDetails({
  institution,
  onUpdate,
  onDelete,
}: MobileInstitutionDetailsProps) {
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
  const [isPublishPopoverOpen, setIsPublishPopoverOpen] = useState(false)
  const [isShareConfirmationOpen, setIsShareConfirmationOpen] = useState(false)
  const [selectedVisibility, setSelectedVisibility] = useState("private")
  const publishButtonRef = useRef<HTMLButtonElement>(null)
  const [publishButtonRect, setPublishButtonRect] = useState<DOMRect | null>(null)

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
  }, [institution])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSave = async () => {
    try {
      const headerRegex = /^"""[\s\S]*?"""/
      let restOfCode = ""
      if (headerRegex.test(institution.formulaCode)) {
        restOfCode = institution.formulaCode.replace(headerRegex, "")
      } else {
        restOfCode = institution.formulaCode
      }

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

  const handleExportInstitution = async () => {
    try {
      const files = await exportToOpenFisca(institution)

      const zip = new JSZip()

      zip.file(`${institution.name}.py`, files.variable)
      zip.file(`${institution.name}_test.yaml`, files.test)

      if (files.parameters.length > 0) {
        files.parameters.forEach((paramContent, index) => {
          const paramName = institution.parameters?.[index]?.name || `parameter_${index + 1}`
          zip.file(`${paramName}.yaml`, paramContent)
        })
      }

      const content = await zip.generateAsync({ type: "blob" })

      const url = window.URL.createObjectURL(content)
      const link = document.createElement("a")
      link.href = url
      link.download = `${institution.name}_openfisca.zip`
      document.body.appendChild(link)
      link.click()

      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)

      alert(t.institution.exportSuccess)
    } catch (error) {
      console.error("Failed to export institution:", error)
      alert(t.institution.exportError)
    }
  }

  const handlePublishButtonClick = () => {
    if (publishButtonRef.current) {
      setPublishButtonRect(publishButtonRef.current.getBoundingClientRect())
    }
    setIsPublishPopoverOpen(true)
  }

  const handlePublishInstitution = async (inst: Institution, visibility: string) => {
    try {
      await publishInstitution(inst, visibility)
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

  const handleCopyUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const url = `${baseUrl}/institutions/${institution.id}`
    navigator.clipboard
      .writeText(url)
      .then(() => alert(t.institution.copyUrlSuccess))
      .catch(() => alert(t.institution.copyUrlError))
  }

  return (
    <div className="space-y-4">
      {/* Institution Header with Actions */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={institution.visibility === "public" ? "default" : "outline"} className="text-xs">
                  {institution.visibility === "public" ? t.common.public : t.common.private}
                </Badge>
                {institution.versions?.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {institution.versions.length} {t.common.commits}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={handlePublishButtonClick}
                ref={publishButtonRef}
              >
                <Globe className="h-3.5 w-3.5" />
                {t.common.publish}
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={handleExportInstitution}
              >
                <Download className="h-3.5 w-3.5" />
                {t.common.export}
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={handleCopyUrl}
              >
                <Copy className="h-3.5 w-3.5" />
                {t.common.copyUrl}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Institution Details */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">{t.institution.information}</CardTitle>
          <Button onClick={handleSave} size="sm" className="flex items-center gap-1">
            <Save className="h-4 w-4" />
            {t.common.save}
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="basic" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                {t.tabs.basicInfo}
              </TabsTrigger>
              <TabsTrigger value="details" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {t.tabs.detailInfo}
              </TabsTrigger>
              <TabsTrigger value="links" className="text-xs">
                <Link2 className="h-3 w-3 mr-1" />
                {t.tabs.links}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">{t.institution.institutionName}</Label>
                <Input id="name" value={formData.name} onChange={handleChange} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">{t.institution.department}</Label>
                <Input id="department" value={formData.department} onChange={handleChange} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="summary">{t.institution.summary}</Label>
                <Textarea id="summary" rows={3} value={formData.summary} onChange={handleChange} />
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="usage">{t.institution.usageMethod}</Label>
                <Textarea id="usage" rows={3} value={formData.usage} onChange={handleChange} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="conditions">{t.institution.conditions}</Label>
                <Textarea id="conditions" rows={3} value={formData.conditions} onChange={handleChange} />
              </div>
            </TabsContent>

            <TabsContent value="links" className="space-y-3">
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
