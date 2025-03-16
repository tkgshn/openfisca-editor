"use client"

import type { Institution } from "@/lib/types"

/**
 * パラメータを管理するパネルコンポーネント
 *
 * @param institution - 対象の制度
 * @param onUpdate - 制度が更新されたときに呼び出されるコールバック
 */
export function ParameterPanel({
  institution,
  onUpdate,
}: {
  institution: Institution
  onUpdate: (institution: Institution) => void
}) {
  // 実装は既存のコードを移行する
  return (
    <div>
      <h2>Parameter Panel (Placeholder)</h2>
      <p>This component will be implemented later</p>
    </div>
  )
}

