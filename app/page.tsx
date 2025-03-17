"use client"

import dynamic from 'next/dynamic'

// クライアントサイドでのみレンダリングするためにdynamicインポートを使用
const OpenFiscaEditor = dynamic(() => import('@/components/openfisca-editor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse text-center">
        <p className="text-lg font-medium">OpenFisca Editorを読み込み中...</p>
      </div>
    </div>
  ),
})

export default function Home() {
  return <OpenFiscaEditor />
}
