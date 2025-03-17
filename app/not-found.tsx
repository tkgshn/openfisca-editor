export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
            <h1 className="text-4xl font-bold mb-4">404 - ページが見つかりません</h1>
            <p className="mb-6 text-lg text-muted-foreground">
                お探しのページは存在しないか、移動された可能性があります。
            </p>
            <a
                href="/"
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
                トップページに戻る
            </a>
        </div>
    )
}
