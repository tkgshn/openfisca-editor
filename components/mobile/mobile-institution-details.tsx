"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save, Link2, FileText, Users, ChevronDown, ChevronUp } from "lucide-react"
import type { Institution } from "@/lib/types"
import { useI18n } from "@/lib/i18n"

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

      await onUpdate(updatedInstitution)
      alert(t.institution.saveSuccess)
    } catch (error) {
      console.error("Failed to save institution:", error)
      alert(t.institution.saveError)
    }
  }

  return (
    <div className="space-y-4">
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
    </div>
  )
}
