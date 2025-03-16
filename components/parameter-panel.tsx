"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ParameterModal } from "@/components/parameter-modal"
import { PlusCircle, Settings } from "lucide-react"
import type { Institution, Parameter } from "@/lib/types"
import { createParameter, updateParameter, deleteParameter } from "@/lib/api"

interface ParameterPanelProps {
  institution: Institution
  onUpdate: (institution: Institution) => void
}

export function ParameterPanel({ institution, onUpdate }: ParameterPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingParameterIndex, setEditingParameterIndex] = useState<number | null>(null)

  const handleAddParameter = () => {
    setEditingParameterIndex(null)
    setIsModalOpen(true)
  }

  const handleEditParameter = (index: number) => {
    setEditingParameterIndex(index)
    setIsModalOpen(true)
  }

  const handleSaveParameter = async (parameter: Parameter) => {
    try {
      const updatedInstitution = { ...institution }

      if (editingParameterIndex !== null) {
        // Edit existing parameter
        await updateParameter(updatedInstitution, editingParameterIndex, parameter)
      } else {
        // Add new parameter
        await createParameter(updatedInstitution, parameter)
      }

      onUpdate(updatedInstitution)
      setIsModalOpen(false)
    } catch (error) {
      console.error("Failed to save parameter:", error)
      alert("パラメータの保存に失敗しました。")
    }
  }

  const handleDeleteParameter = async () => {
    if (editingParameterIndex === null) return

    try {
      const updatedInstitution = { ...institution }
      await deleteParameter(updatedInstitution, editingParameterIndex)
      onUpdate(updatedInstitution)
      setIsModalOpen(false)
    } catch (error) {
      console.error("Failed to delete parameter:", error)
      alert("パラメータの削除に失敗しました。")
    }
  }

  const formatValue = (value: number, unit?: string) => {
    if (unit === "currency-JPY") {
      return `${value.toLocaleString()}円`
    }
    return value.toString()
  }

  return (
    <>
      <Card className="shadow-sm hover:shadow transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>パラメータ</CardTitle>
          <Button onClick={handleAddParameter} variant="outline" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            パラメータ追加
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">制度の計算に使用される値（給付額など）を設定します。</p>

          <div className="space-y-4">
            {institution.parameters && institution.parameters.length > 0 ? (
              institution.parameters.map((parameter, index) => (
                <div
                  key={index}
                  className="bg-muted/70 p-3 rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => handleEditParameter(index)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{parameter.name}</h3>
                    <Badge variant="outline">{parameter.unit || "単位なし"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{parameter.description}</p>
                  <div className="space-y-1">
                    {parameter.values.map((value, vIndex) => (
                      <div key={vIndex} className="flex justify-between text-sm">
                        <span>{value.date}:</span>
                        <span className="font-medium">{formatValue(value.value, parameter.unit)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>パラメータがありません。「パラメータ追加」ボタンをクリックして追加してください。</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ParameterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveParameter}
        onDelete={handleDeleteParameter}
        parameter={
          editingParameterIndex !== null && institution.parameters
            ? institution.parameters[editingParameterIndex]
            : undefined
        }
        isEditing={editingParameterIndex !== null}
      />
    </>
  )
}

