"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Institution } from "@/lib/types"
import { useI18n } from "@/lib/i18n"

interface MobileInstitutionCardProps {
  institution: Institution
  onSelect: () => void
}

/**
 * Mobile-optimized institution card component
 * Provides a compact card view for institutions in a list
 */
export function MobileInstitutionCard({ institution, onSelect }: MobileInstitutionCardProps) {
  const { t } = useI18n()

  return (
    <Card className="h-full flex flex-col mb-4">
      <CardContent className="flex-grow p-4">
        <h3 className="text-lg font-semibold mb-2">{institution.name}</h3>
        
        {institution.summary && (
          <p className="text-sm text-muted-foreground mb-3">{institution.summary}</p>
        )}
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="font-medium">{t.institution.variables}:</span>{" "}
            {institution.stats?.variables || 0}
          </div>
          <div>
            <span className="font-medium">{t.institution.parameters}:</span>{" "}
            {institution.stats?.parameters || 0}
          </div>
          <div>
            <span className="font-medium">{t.institution.tests}:</span>{" "}
            {institution.stats?.tests || 0}
          </div>
          <div>
            <span className="font-medium">{t.institution.department}:</span>{" "}
            {institution.department || "-"}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button className="w-full" onClick={onSelect}>
          {t.institution.viewDetails}
        </Button>
      </CardFooter>
    </Card>
  )
}
