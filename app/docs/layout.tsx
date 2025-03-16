"use client"

import { ArrowLeft, Book, Compass, FileText, Settings, Layers, Code } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DocsLayoutProps {
  children: React.ReactNode
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  const pathname = usePathname()

  const navigation = [
    { name: "ユーザーガイド", href: "/docs/user-guide", icon: Book },
    { name: "OpenFisca概念", href: "/docs/openfisca-concepts", icon: Compass },
    { name: "ファイル作成ガイド", href: "/docs/openfisca-file-guide", icon: FileText },
    { name: "インストールガイド", href: "/docs/installation", icon: Settings },
    { name: "アーキテクチャ", href: "/docs/architecture", icon: Layers },
    { name: "APIリファレンス", href: "/docs/api-reference", icon: Code },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container flex h-14 items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/docs" className="font-bold">
            OpenFisca Editor ドキュメント
          </Link>
        </div>
      </header>

      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr] xl:grid-cols-[300px_1fr]">
        <aside className="hidden md:block">
          <div className="sticky top-20 py-6">
            <nav className="flex flex-col space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted",
                      isActive ? "bg-muted" : "transparent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        <main className="py-6">{children}</main>
      </div>
    </div>
  )
}
