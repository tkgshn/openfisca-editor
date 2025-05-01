"use client"

import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { ChevronLeft, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useI18n } from "@/lib/i18n"

interface MobileAdminLayoutProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  title: string
  showBackButton?: boolean
  onBack?: () => void
}

/**
 * Mobile-friendly admin layout component
 * Provides responsive layout with sidebar that converts to bottom sheet on mobile
 */
export function MobileAdminLayout({
  children,
  sidebar,
  title,
  showBackButton = false,
  onBack,
}: MobileAdminLayoutProps) {
  const isMobile = useIsMobile()
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false)
    }
  }, [isMobile])

  if (!isMobile) {
    return (
      <div className="flex flex-row h-screen bg-background">
        {sidebar}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-md">
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
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary-foreground">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] p-0">
            {sidebar}
          </SheetContent>
        </Sheet>
      </header>

      {/* Mobile Content */}
      <main className="flex-1 overflow-auto p-4">{children}</main>
    </div>
  )
}
