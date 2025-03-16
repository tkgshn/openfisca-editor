"use client"

import { X, Calendar, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Parameter } from "@/lib/types"

interface ParameterDetailModalProps {
  parameter: Parameter
  isOpen: boolean
  onClose: () => void
}

export function ParameterDetailModal({ parameter, isOpen, onClose }: ParameterDetailModalProps) {
  if (!isOpen) return null

  const formatValue = (value: number, unit?: string) => {
    if (unit === "currency-JPY") {
      return `${value.toLocaleString()}円`
    }
    return value.toString()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{parameter.name}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1">説明</h3>
            <p className="text-sm text-muted-foreground">{parameter.description}</p>
          </div>

          {parameter.reference && (
            <div>
              <h3 className="text-sm font-medium mb-1">参照URL</h3>
              <a
                href={parameter.reference}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline flex items-center gap-1"
              >
                {parameter.reference}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium mb-1">単位</h3>
            <Badge variant="outline">{parameter.unit || "単位なし"}</Badge>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-1">値の履歴</h3>
            <div className="space-y-2">
              {parameter.values.map((value, index) => (
                <div key={index} className="bg-muted/50 p-3 rounded-md">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{value.date}</span>
                    </div>
                    <span className="font-medium">{formatValue(value.value, parameter.unit)}</span>
                  </div>
                  {value.label && <p className="text-xs font-medium">{value.label}</p>}
                  {value.description && <p className="text-xs text-muted-foreground">{value.description}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/30 p-3 rounded-md text-xs text-muted-foreground">
            <p>OpenFiscaコードでの参照方法:</p>
            <code className="block mt-1 bg-muted p-2 rounded">
              parameters(対象期間).チュートリアル.{parameter.name}
            </code>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end">
          <Button onClick={onClose}>閉じる</Button>
        </div>
      </div>
    </div>
  )
}

