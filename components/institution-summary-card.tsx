"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Users, Calendar, Building2 } from "lucide-react"
import type { Institution } from "@/lib/types"

interface InstitutionSummaryCardProps {
  institution: Institution
}

export function InstitutionSummaryCard({ institution }: InstitutionSummaryCardProps) {
  // 最終更新日を取得
  const lastUpdated =
    institution.versions && institution.versions.length > 0
      ? new Date(institution.versions[0].timestamp).toLocaleDateString("ja-JP")
      : "未更新"

  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          制度概要
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>所管部署</span>
            </div>
            <p className="text-base">{institution.department || "未設定"}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>最終更新日</span>
            </div>
            <p className="text-base">{lastUpdated}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>概要</span>
          </div>
          <p className="text-base bg-muted/30 p-3 rounded-md">{institution.summary || "概要が設定されていません。"}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>利用条件</span>
          </div>
          <p className="text-base bg-muted/30 p-3 rounded-md">
            {institution.conditions || "利用条件が設定されていません。"}
          </p>
        </div>

        {institution.testCases && institution.testCases.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>テストケース数</span>
            </div>
            <Badge variant="outline" className="text-sm">
              {institution.testCases.length}件
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

