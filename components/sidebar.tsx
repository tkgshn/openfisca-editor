"use client"

import { useState } from "react"
import { Search, Plus, FileCode, Settings, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { SettingsDialog } from "@/components/settings-dialog"
import type { Institution } from "@/lib/types"
import { createInstitution } from "@/lib/api"
import { useI18n } from "@/lib/i18n"

interface SidebarProps {
  institutions: Institution[]
  selectedIndex: number | null
  onSelect: (index: number) => void
  onAddInstitution: (institution: Institution) => void
  selectedInstitutions: string[]
  onSelectInstitutions: (ids: string[]) => void
  isMultiSelectMode: boolean
  onToggleMultiSelectMode: () => void
}

export function Sidebar({
  institutions,
  selectedIndex,
  onSelect,
  onAddInstitution,
  selectedInstitutions,
  onSelectInstitutions,
  isMultiSelectMode,
  onToggleMultiSelectMode,
}: SidebarProps) {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const filteredInstitutions = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddInstitution = async () => {
    const name = prompt(t.institution.newInstitution + ":")
    if (!name) return

    if (/^\d/.test(name)) {
      alert("制度名は数字で始めることはできません。")
      return
    }

    try {
      const newInstitution = await createInstitution(name)
      onAddInstitution(newInstitution)
    } catch (error) {
      console.error("Failed to create institution:", error)
      alert("制度の作成に失敗しました。")
    }
  }

  const handleToggleSelect = (id: string) => {
    if (selectedInstitutions.includes(id)) {
      onSelectInstitutions(selectedInstitutions.filter((i) => i !== id))
    } else {
      onSelectInstitutions([...selectedInstitutions, id])
    }
  }

  return (
    <div className="w-full md:w-64 lg:w-80 border-r bg-card shadow-sm flex flex-col h-screen">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-xl flex items-center gap-2 mb-4">
          <FileCode className="h-5 w-5 text-foreground" />
          <span>{t.sidebar.title}</span>
        </h3>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.sidebar.searchPlaceholder}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button size="icon" onClick={handleAddInstitution} className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={isMultiSelectMode ? "default" : "outline"}
            onClick={onToggleMultiSelectMode}
            className="shrink-0"
            title={t.common.edit}
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-3 py-2 flex justify-between items-center">
        <h4 className="text-sm font-medium text-muted-foreground px-1">{t.sidebar.institutionList}</h4>
        {isMultiSelectMode && selectedInstitutions.length > 0 && (
          <Badge variant="outline">
            {selectedInstitutions.length}
            {t.sidebar.itemsSelected}
          </Badge>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 pb-3 space-y-1">
          {filteredInstitutions.map((institution, index) => (
            <div
              key={institution.id}
              className={`sidebar-item group ${selectedIndex === index && !isMultiSelectMode ? "sidebar-item-active" : "sidebar-item-inactive"} flex justify-between items-center`}
              onClick={() => (isMultiSelectMode ? handleToggleSelect(institution.id) : onSelect(index))}
            >
              <div className="flex items-center gap-2 flex-1 truncate">
                {isMultiSelectMode && (
                  <Checkbox
                    checked={selectedInstitutions.includes(institution.id)}
                    onCheckedChange={() => handleToggleSelect(institution.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <span className="truncate">{institution.name}</span>
                {institution.source === "sample" && (
                  <Badge variant="outline" className="text-xs">
                    {t.sidebar.sample}
                  </Badge>
                )}
              </div>
            </div>
          ))}

          {filteredInstitutions.length === 0 && (
            <div className="px-3 py-6 text-center text-muted-foreground text-sm">{t.sidebar.noInstitutionsFound}</div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => setIsSettingsOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />
          {t.common.settings}
        </Button>
      </div>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  )
}

