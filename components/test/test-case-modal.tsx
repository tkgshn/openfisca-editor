"use client"
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
  // 実装は既存のコードを移行する
  return null // モーダルが閉じているときは何も表示しない
}

