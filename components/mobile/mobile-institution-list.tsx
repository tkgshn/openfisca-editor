"use client"

import { useState } from "react"
import { Search, Plus, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { Institution } from "@/lib/types"
import { useI18n } from "@/lib/i18n"

interface MobileInstitutionListProps {
  institutions: Institution[]
  selectedIndex: number | null
  onSelect: (index: number) => void
  onAddInstitution: (institution: Institution) => void
  selectedInstitutions: string[]
  onSelectInstitutions: (ids: string[]) => void
  isMultiSelectMode: boolean
  onToggleMultiSelectMode: () => void
}

/**
 * Mobile-optimized institution list component
 * Provides a compact list view for institutions with search and selection functionality
 */
export function MobileInstitutionList({
  institutions,
  selectedIndex,
  onSelect,
  onAddInstitution,
  selectedInstitutions,
  onSelectInstitutions,
  isMultiSelectMode,
  onToggleMultiSelectMode,
}: MobileInstitutionListProps) {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredInstitutions = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  /**
   * Toggle institution selection in multi-select mode
   */
  const handleToggleSelect = (id: string) => {
    if (selectedInstitutions.includes(id)) {
      onSelectInstitutions(selectedInstitutions.filter((i) => i !== id))
    } else {
      onSelectInstitutions([...selectedInstitutions, id])
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg mb-3">{t.sidebar.institutionList}</h3>
        
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.sidebar.searchPlaceholder}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button size="icon" onClick={() => onAddInstitution} className="shrink-0">
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
        
        {isMultiSelectMode && selectedInstitutions.length > 0 && (
          <Badge variant="outline" className="mb-2">
            {selectedInstitutions.length}
            {t.sidebar.itemsSelected}
          </Badge>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="divide-y">
          {filteredInstitutions.map((institution, index) => (
            <div
              key={institution.id}
              className={`p-3 flex items-center ${
                selectedIndex === index && !isMultiSelectMode
                  ? "bg-primary/10"
                  : "hover:bg-muted/50"
              }`}
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
                <div className="flex flex-col">
                  <span className="font-medium truncate">{institution.name}</span>
                  {institution.summary && (
                    <span className="text-xs text-muted-foreground truncate">{institution.summary}</span>
                  )}
                </div>
                {institution.source === "sample" && (
                  <Badge variant="outline" className="text-xs ml-auto">
                    {t.sidebar.sample}
                  </Badge>
                )}
              </div>
            </div>
          ))}

          {filteredInstitutions.length === 0 && (
            <div className="px-3 py-6 text-center text-muted-foreground text-sm">
              {t.sidebar.noInstitutionsFound}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
