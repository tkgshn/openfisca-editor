"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, X, Plus, Calendar, Info } from "lucide-react"
import type { Parameter, ParameterValue } from "@/lib/types"

interface ParameterModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (parameter: Parameter) => void
  onDelete: () => void
  parameter?: Parameter
  isEditing: boolean
}

export function ParameterModal({ isOpen, onClose, onSave, onDelete, parameter, isEditing }: ParameterModalProps) {
  const [currentParameter, setCurrentParameter] = useState<Parameter>({
    name: "",
    description: "",
    reference: "",
    unit: "currency-JPY",
    values: [
      {
        date: "2023-01-01",
        value: 0,
        label: "",
        description: "",
      },
    ],
  })

  useEffect(() => {
    if (parameter) {
      setCurrentParameter({ ...parameter })
    } else {
      setCurrentParameter({
        name: "",
        description: "",
        reference: "",
        unit: "currency-JPY",
        values: [
          {
            date: "2023-01-01",
            value: 0,
            label: "",
            description: "",
          },
        ],
      })
    }
  }, [parameter, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setCurrentParameter((prev) => ({ ...prev, [id]: value }))
  }

  const handleUnitChange = (value: string) => {
    setCurrentParameter((prev) => ({ ...prev, unit: value }))
  }

  const handleValueChange = (index: number, field: keyof ParameterValue, value: string | number) => {
    setCurrentParameter((prev) => {
      const newValues = [...prev.values]
      newValues[index] = { ...newValues[index], [field]: value }
      return { ...prev, values: newValues }
    })
  }

  const handleAddValue = () => {
    setCurrentParameter((prev) => {
      const lastValue = prev.values[prev.values.length - 1]
      const newDate = new Date(lastValue.date)
      newDate.setFullYear(newDate.getFullYear() + 1)

      return {
        ...prev,
        values: [
          ...prev.values,
          {
            date: newDate.toISOString().split("T")[0],
            value: lastValue.value,
            label: "",
            description: "",
          },
        ],
      }
    })
  }

  const handleRemoveValue = (index: number) => {
    if (currentParameter.values.length <= 1) return

    setCurrentParameter((prev) => {
      const newValues = [...prev.values]
      newValues.splice(index, 1)
      return { ...prev, values: newValues }
    })
  }

  const handleSubmit = () => {
    onSave(currentParameter)
  }

  const isValid = () => {
    return (
      currentParameter.name.trim() !== "" &&
      currentParameter.description.trim() !== "" &&
      currentParameter.values.length > 0 &&
      currentParameter.values.every((v) => v.date && v.value !== undefined)
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{isEditing ? "パラメータを編集" : "パラメータを作成"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">パラメータ名</Label>
            <Input id="name" value={currentParameter.name} onChange={handleChange} placeholder="例: 児童手当_3歳未満" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={currentParameter.description}
              onChange={handleChange}
              placeholder="例: 3歳未満の児童に対する手当額"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reference">参照URL</Label>
              <Input
                id="reference"
                value={currentParameter.reference}
                onChange={handleChange}
                placeholder="例: https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">単位</Label>
              <Select value={currentParameter.unit} onValueChange={handleUnitChange}>
                <SelectTrigger id="unit">
                  <SelectValue placeholder="単位を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="currency-JPY">円 (JPY)</SelectItem>
                  <SelectItem value="year">年</SelectItem>
                  <SelectItem value="month">月</SelectItem>
                  <SelectItem value="day">日</SelectItem>
                  <SelectItem value="percent">パーセント (%)</SelectItem>
                  <SelectItem value="none">単位なし</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>値</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddValue}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                値を追加
              </Button>
            </div>

            {currentParameter.values.map((value, index) => (
              <div key={index} className="bg-muted/50 p-3 rounded-md space-y-3">
                <div className="flex justify-between">
                  <h4 className="text-sm font-medium">値 {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveValue(index)}
                    disabled={currentParameter.values.length <= 1}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`date-${index}`} className="text-xs">
                      日付
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`date-${index}`}
                        type="date"
                        value={value.date}
                        onChange={(e) => handleValueChange(index, "date", e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={`value-${index}`} className="text-xs">
                      値
                    </Label>
                    <Input
                      id={`value-${index}`}
                      type="number"
                      value={value.value}
                      onChange={(e) => handleValueChange(index, "value", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`label-${index}`} className="text-xs">
                    ラベル
                  </Label>
                  <Input
                    id={`label-${index}`}
                    value={value.label}
                    onChange={(e) => handleValueChange(index, "label", e.target.value)}
                    placeholder="例: 3歳未満の児童手当額"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`value-description-${index}`} className="text-xs">
                    値の説明
                  </Label>
                  <Input
                    id={`value-description-${index}`}
                    value={value.description}
                    onChange={(e) => handleValueChange(index, "description", e.target.value)}
                    placeholder="例: 3歳未満の児童1人につき支給される月額"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-muted/30 p-3 rounded-md">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p>パラメータはOpenFiscaのコードから参照される値を定義します。</p>
                <p className="mt-1">
                  例: <code>parameters(対象期間).チュートリアル.{currentParameter.name}</code>
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <div>
              {isEditing && (
                <Button variant="destructive" onClick={onDelete} className="flex items-center gap-1">
                  <Trash2 className="h-4 w-4" />
                  削除
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                キャンセル
              </Button>
              <Button onClick={handleSubmit} disabled={!isValid()}>
                保存
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

