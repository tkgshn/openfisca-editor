"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

interface MobileAdminLayoutProps {
  children: React.ReactNode
  title: string
  showBackButton?: boolean
  onBack?: () => void
}

/**
 * Mobile-friendly admin layout component
 * Provides responsive layout for mobile devices
 */
export function MobileAdminLayout({
  children,
  title,
  showBackButton = false,
  onBack,
}: MobileAdminLayoutProps) {
  const isMobile = useIsMobile()
  const { t } = useI18n()

  if (!isMobile) {
    return (
      <div className="flex flex-row h-screen bg-background">
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground p-4 flex items-center shadow-md">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-primary-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>
      </header>

      {/* Mobile Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
