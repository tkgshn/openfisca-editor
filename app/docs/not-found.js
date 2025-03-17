export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">ドキュメントは現在メンテナンス中です</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          申し訳ありませんが、ドキュメントは現在メンテナンス中です。後ほどお試しください。
        </p>
      </div>
    </div>
  )
}
