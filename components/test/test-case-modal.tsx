"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Trash2, Plus, Minus } from "lucide-react"
import type { TestCase } from "@/lib/types"

/**
 * テストケースを編集するモーダルコンポーネント
 */
export function TestCaseModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  testCase,
  isEditing,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (testCase: TestCase) => void
  onDelete: () => void
  testCase?: TestCase
  isEditing: boolean
}) {
  const [parent, setParent] = useState<number[]>([])
  const [grandparent, setGrandparent] = useState<number[]>([])
  const [child, setChild] = useState<number[]>([])
  const [amount, setAmount] = useState<number>(0)
  const [canReceive, setCanReceive] = useState<boolean>(true)

  // 編集時に既存のデータを読み込む
  useEffect(() => {
    if (testCase) {
      setParent(testCase.parent || [])
      setGrandparent(testCase.grandparent || [])
      setChild(testCase.child || [])
      setAmount(testCase.amount || 0)
      setCanReceive(testCase.amount > 0)
    } else {
      setParent([])
      setGrandparent([])
      setChild([])
      setAmount(0)
      setCanReceive(true)
    }
  }, [testCase])

  const handleSave = () => {
    onSave({
      parent,
      grandparent,
      child,
      amount: canReceive ? amount : 0,
    })
  }

  const handleAddAge = (category: "parent" | "grandparent" | "child") => {
    const setters = {
      parent: setParent,
      grandparent: setGrandparent,
      child: setChild,
    }
    setters[category]((prev) => [...prev, 0])
  }

  const handleRemoveAge = (category: "parent" | "grandparent" | "child", index: number) => {
    const setters = {
      parent: setParent,
      grandparent: setGrandparent,
      child: setChild,
    }
    setters[category]((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAgeChange = (category: "parent" | "grandparent" | "child", index: number, value: string) => {
    const setters = {
      parent: setParent,
      grandparent: setGrandparent,
      child: setChild,
    }
    setters[category]((prev) => {
      const newAges = [...prev]
      newAges[index] = parseInt(value) || 0
      return newAges
    })
  }

  const renderAgeInputs = (
    category: "parent" | "grandparent" | "child",
    ages: number[],
    label: string,
    icon: string
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2"
          onClick={() => handleAddAge(category)}
        >
          <Plus className="h-4 w-4" />
          追加
        </Button>
      </div>
      <div className="space-y-2">
        {ages.map((age, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <Input
              type="number"
              value={age}
              onChange={(e) => handleAgeChange(category, index, e.target.value)}
              className="w-24"
              min={0}
            />
            <span className="text-sm text-muted-foreground">歳</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-destructive"
              onClick={() => handleRemoveAge(category, index)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "テストケースを編集" : "テストケースを追加"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {renderAgeInputs("parent", parent, "親", "👩‍🦱")}
          {renderAgeInputs("grandparent", grandparent, "祖父母", "👨‍🦳")}
          {renderAgeInputs("child", child, "子供", "👶")}

          <div className="space-y-4">
            <Label>給付金の受給</Label>
            <RadioGroup value={canReceive ? "yes" : "no"} onValueChange={(v) => setCanReceive(v === "yes")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="r1" />
                <Label htmlFor="r1">受け取れる</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="r2" />
                <Label htmlFor="r2">受け取れない</Label>
              </div>
            </RadioGroup>

            {canReceive && (
              <div className="space-y-2">
                <Label>給付金額</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                    className="w-32"
                    min={0}
                  />
                  <span className="text-sm text-muted-foreground">円</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          {isEditing && (
            <Button variant="destructive" onClick={onDelete} className="gap-1">
              <Trash2 className="h-4 w-4" />
              削除
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

