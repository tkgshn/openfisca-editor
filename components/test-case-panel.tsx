"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TestCaseModal } from "@/components/test-case-modal"
import { PlusCircle } from "lucide-react"
import type { Institution, TestCase } from "@/lib/types"

interface TestCasePanelProps {
  institution: Institution
  onUpdate: (institution: Institution) => void
}

export function TestCasePanel({ institution, onUpdate }: TestCasePanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTestCaseIndex, setEditingTestCaseIndex] = useState<number | null>(null)

  const handleAddTestCase = () => {
    setEditingTestCaseIndex(null)
    setIsModalOpen(true)
  }

  const handleEditTestCase = (index: number) => {
    setEditingTestCaseIndex(index)
    setIsModalOpen(true)
  }

  const handleSaveTestCase = (testCase: TestCase) => {
    const updatedInstitution = { ...institution }

    if (editingTestCaseIndex !== null) {
      // Edit existing test case
      updatedInstitution.testCases[editingTestCaseIndex] = testCase
    } else {
      // Add new test case
      if (!updatedInstitution.testCases) {
        updatedInstitution.testCases = []
      }
      updatedInstitution.testCases.push(testCase)
    }

    // Update the YAML representation
    updatedInstitution.testYamlRaw = generateYaml(updatedInstitution)

    onUpdate(updatedInstitution)
    setIsModalOpen(false)
  }

  const handleDeleteTestCase = () => {
    if (editingTestCaseIndex === null) return

    const updatedInstitution = { ...institution }
    updatedInstitution.testCases.splice(editingTestCaseIndex, 1)

    // Update the YAML representation
    updatedInstitution.testYamlRaw = generateYaml(updatedInstitution)

    onUpdate(updatedInstitution)
    setIsModalOpen(false)
  }

  const generateTestCaseString = (testCase: TestCase) => {
    const formatCat = (ages: number[], icon: string) => ages.map((age) => `${icon}${age}歳`).join(", ")

    const parts = []
    if (testCase.parent && testCase.parent.length > 0) {
      parts.push(formatCat(testCase.parent, "👩‍🦱"))
    }
    if (testCase.grandparent && testCase.grandparent.length > 0) {
      parts.push(formatCat(testCase.grandparent, "👨‍🦳"))
    }
    if (testCase.child && testCase.child.length > 0) {
      parts.push(formatCat(testCase.child, "👶"))
    }

    return parts.join(", ")
  }

  // Generate YAML from test cases
  const generateYaml = (inst: Institution) => {
    let yaml = `# ${inst.name}のテスト\n`
    if (inst.url) yaml += `# 参照URL: ${inst.url}\n`
    if (inst.summary) yaml += `# 概要: ${inst.summary}\n`
    yaml += `\n`
    ;(inst.testCases || []).forEach((tc, idx) => {
      yaml += `- name: ケース${idx + 1}\n`
      yaml += `  period: 2023-01-01\n`
      yaml += `  input:\n`
      yaml += `    世帯:\n`

      if (tc.parent && tc.parent.length > 0) {
        yaml += `      親一覧:\n`
        tc.parent.forEach((parent) => {
          yaml += `        - ${parent}\n`
        })
      }

      if (tc.grandparent && tc.grandparent.length > 0) {
        yaml += `      祖父母一覧:\n`
        tc.grandparent.forEach((grandparent) => {
          yaml += `        - ${grandparent}\n`
        })
      }

      if (tc.child && tc.child.length > 0) {
        yaml += `      子一覧:\n`
        tc.child.forEach((child) => {
          yaml += `        - ${child}\n`
        })
      }

      yaml += `  output:\n`
      yaml += `    世帯:\n`
      yaml += `      ${inst.name}: ${tc.amount}\n\n`
    })

    return yaml
  }

  return (
    <>
      <Card className="shadow-sm hover:shadow transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>テストケース</CardTitle>
          <Button onClick={handleAddTestCase} variant="outline" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            テストケース追加
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            「この制度を利用できる人・できない人」を自由に追加してください。
          </p>

          <div className="flex flex-wrap gap-2">
            {institution.testCases &&
              institution.testCases.map((testCase, index) => (
                <div
                  key={index}
                  className="bg-muted/70 px-3 py-2 rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => handleEditTestCase(index)}
                >
                  <span className="text-sm flex items-center gap-1">
                    <Badge variant={testCase.amount > 0 ? "default" : "destructive"} className="px-1.5 py-0">
                      {testCase.amount > 0 ? `${Number(testCase.amount).toLocaleString()}円` : "対象外"}
                    </Badge>
                    {generateTestCaseString(testCase)}
                  </span>
                </div>
              ))}

            {(!institution.testCases || institution.testCases.length === 0) && (
              <p className="text-sm text-muted-foreground py-4">テストケースがありません。</p>
            )}
          </div>
        </CardContent>
      </Card>

      <TestCaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTestCase}
        onDelete={handleDeleteTestCase}
        testCase={
          editingTestCaseIndex !== null && institution.testCases
            ? institution.testCases[editingTestCaseIndex]
            : undefined
        }
        isEditing={editingTestCaseIndex !== null}
      />
    </>
  )
}

