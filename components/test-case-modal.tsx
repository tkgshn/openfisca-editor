"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Trash2, X } from "lucide-react"
import type { TestCase } from "@/lib/types"

interface TestCaseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (testCase: TestCase) => void
  onDelete: () => void
  testCase?: TestCase
  isEditing: boolean
}

export function TestCaseModal({ isOpen, onClose, onSave, onDelete, testCase, isEditing }: TestCaseModalProps) {
  const [currentTestCase, setCurrentTestCase] = useState<TestCase>({
    parent: [],
    grandparent: [],
    child: [],
    amount: 0,
  })

  const [selectedCounts, setSelectedCounts] = useState({
    parent: 0,
    grandparent: 0,
    child: 0,
  })

  const [isEligible, setIsEligible] = useState<boolean | null>(null)

  useEffect(() => {
    if (testCase) {
      setCurrentTestCase({ ...testCase })
      setSelectedCounts({
        parent: testCase.parent?.length || 0,
        grandparent: testCase.grandparent?.length || 0,
        child: testCase.child?.length || 0,
      })
      setIsEligible(testCase.amount > 0)
    } else {
      setCurrentTestCase({
        parent: [],
        grandparent: [],
        child: [],
        amount: 0,
      })
      setSelectedCounts({
        parent: 0,
        grandparent: 0,
        child: 0,
      })
      setIsEligible(null)
    }
  }, [testCase, isOpen])

  const handleSelectOption = (category: "parent" | "grandparent" | "child", count: number) => {
    setSelectedCounts((prev) => ({ ...prev, [category]: count }))

    const newArray = Array(count).fill(0)
    if (currentTestCase[category] && currentTestCase[category].length > 0) {
      // Preserve existing values if available
      for (let i = 0; i < Math.min(count, currentTestCase[category].length); i++) {
        newArray[i] = currentTestCase[category][i]
      }
    }

    setCurrentTestCase((prev) => ({ ...prev, [category]: newArray }))
  }

  const handleAgeChange = (category: "parent" | "grandparent" | "child", index: number, value: string) => {
    const age = Number.parseInt(value) || 0
    const newArray = [...currentTestCase[category]]
    newArray[index] = age
    setCurrentTestCase((prev) => ({ ...prev, [category]: newArray }))
  }

  const handleEligibilityChange = (value: string) => {
    const eligible = value === "eligible"
    setIsEligible(eligible)
    if (!eligible) {
      setCurrentTestCase((prev) => ({ ...prev, amount: 0 }))
    }
  }

  const handleAmountChange = (value: string) => {
    const amount = Number.parseInt(value) || 0
    setCurrentTestCase((prev) => ({ ...prev, amount }))
  }

  const generateHouseholdInfo = () => {
    const parts = []

    if (currentTestCase.parent && currentTestCase.parent.length > 0) {
      parts.push(...currentTestCase.parent.map((age) => `👩‍🦱${age}歳`))
    }

    if (currentTestCase.grandparent && currentTestCase.grandparent.length > 0) {
      parts.push(...currentTestCase.grandparent.map((age) => `👨‍🦳${age}歳`))
    }

    if (currentTestCase.child && currentTestCase.child.length > 0) {
      parts.push(...currentTestCase.child.map((age) => `👶${age}歳`))
    }

    return parts.join(", ")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{isEditing ? "テストケースを編集" : "テストケースを作成"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <p className="text-muted-foreground">仮想の世帯を作成し、年齢や給付額などを入力してください。</p>

          {/* Parents Section */}
          <div className="space-y-2">
            <h3 className="font-medium">親：</h3>
            <div className="flex gap-2">
              {[0, 1, 2].map((count) => (
                <Button
                  key={`parent-${count}`}
                  type="button"
                  variant={selectedCounts.parent === count ? "default" : "outline"}
                  onClick={() => handleSelectOption("parent", count)}
                >
                  {count === 0 ? "なし" : count === 1 ? "👩‍🦱 1" : "👩‍🦱👩‍🦱 2+"}
                </Button>
              ))}
            </div>
            {selectedCounts.parent > 0 && (
              <div className="bg-muted/50 p-3 rounded-md space-y-2">
                {Array.from({ length: selectedCounts.parent }).map((_, index) => (
                  <div key={`parent-age-${index}`} className="flex items-center gap-2">
                    <Label htmlFor={`parent-age-${index}`} className="w-24">
                      親 {index + 1} の年齢:
                    </Label>
                    <Input
                      id={`parent-age-${index}`}
                      type="number"
                      className="w-20"
                      value={currentTestCase.parent[index] || ""}
                      onChange={(e) => handleAgeChange("parent", index, e.target.value)}
                    />
                    <span>歳</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grandparents Section */}
          <div className="space-y-2">
            <h3 className="font-medium">祖父母：</h3>
            <div className="flex gap-2">
              {[0, 1, 2].map((count) => (
                <Button
                  key={`grandparent-${count}`}
                  type="button"
                  variant={selectedCounts.grandparent === count ? "default" : "outline"}
                  onClick={() => handleSelectOption("grandparent", count)}
                >
                  {count === 0 ? "なし" : count === 1 ? "👨‍🦳 1" : "👨‍🦳👨‍🦳 2+"}
                </Button>
              ))}
            </div>
            {selectedCounts.grandparent > 0 && (
              <div className="bg-muted/50 p-3 rounded-md space-y-2">
                {Array.from({ length: selectedCounts.grandparent }).map((_, index) => (
                  <div key={`grandparent-age-${index}`} className="flex items-center gap-2">
                    <Label htmlFor={`grandparent-age-${index}`} className="w-24">
                      祖父母 {index + 1} の年齢:
                    </Label>
                    <Input
                      id={`grandparent-age-${index}`}
                      type="number"
                      className="w-20"
                      value={currentTestCase.grandparent[index] || ""}
                      onChange={(e) => handleAgeChange("grandparent", index, e.target.value)}
                    />
                    <span>歳</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Children Section */}
          <div className="space-y-2">
            <h3 className="font-medium">子供：</h3>
            <div className="flex gap-2">
              {[0, 1, 2].map((count) => (
                <Button
                  key={`child-${count}`}
                  type="button"
                  variant={selectedCounts.child === count ? "default" : "outline"}
                  onClick={() => handleSelectOption("child", count)}
                >
                  {count === 0 ? "なし" : count === 1 ? "👶 1" : "👶👶 2+"}
                </Button>
              ))}
            </div>
            {selectedCounts.child > 0 && (
              <div className="bg-muted/50 p-3 rounded-md space-y-2">
                {Array.from({ length: selectedCounts.child }).map((_, index) => (
                  <div key={`child-age-${index}`} className="flex items-center gap-2">
                    <Label htmlFor={`child-age-${index}`} className="w-24">
                      子供 {index + 1} の年齢:
                    </Label>
                    <Input
                      id={`child-age-${index}`}
                      type="number"
                      className="w-20"
                      value={currentTestCase.child[index] || ""}
                      onChange={(e) => handleAgeChange("child", index, e.target.value)}
                    />
                    <span>歳</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Eligibility Section */}
          <div className="space-y-2">
            <h3 className="font-medium">世帯における給付金額：</h3>
            <RadioGroup
              value={isEligible === null ? undefined : isEligible ? "eligible" : "notEligible"}
              onValueChange={handleEligibilityChange}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="eligible" id="eligible" />
                <Label htmlFor="eligible">受け取れる</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="notEligible" id="notEligible" />
                <Label htmlFor="notEligible">受け取れない</Label>
              </div>
            </RadioGroup>

            {isEligible && (
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="金額を入力"
                    value={currentTestCase.amount || ""}
                    onChange={(e) => handleAmountChange(e.target.value)}
                  />
                  <span>円</span>
                </div>
              </div>
            )}

            <div className="mt-4 bg-accent p-3 rounded-md">
              <p>
                この制度は、
                <span className={isEligible === false ? "text-destructive font-medium" : ""}>
                  [{generateHouseholdInfo()}]
                </span>
                <span className={isEligible === false ? "text-destructive font-medium" : ""}>
                  {isEligible === false
                    ? "の場合は対象ではありません。"
                    : isEligible === true && currentTestCase.amount > 0
                      ? `に対して、${currentTestCase.amount.toLocaleString()}円を支給するものです。`
                      : ""}
                </span>
              </p>
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
              <Button onClick={() => onSave(currentTestCase)}>保存</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

