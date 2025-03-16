"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, Globe, Lock, Users, HelpCircle, Settings2 } from "lucide-react"
import { useState } from "react"
import type { Institution } from "@/lib/types"

interface ShareConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  institution: Institution
  visibility: string
}

/**
 * 制度の共有確認モーダルコンポーネント
 */
export function ShareConfirmationModal({ isOpen, onClose, institution, visibility }: ShareConfirmationModalProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `https://openfisca-editor.example.com/share/${institution.id}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getVisibilityIcon = () => {
    switch (visibility) {
      case "public":
        return <Globe className="h-4 w-4" />
      case "restricted":
        return <Users className="h-4 w-4" />
      default:
        return <Lock className="h-4 w-4" />
    }
  }

  const getVisibilityText = () => {
    switch (visibility) {
      case "public":
        return "公開"
      case "restricted":
        return "限定公開"
      default:
        return "非公開"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">「{institution.name}」を共有</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">あなた（オーナー）</p>
                <p className="text-xs text-muted-foreground">編集可能</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">一般的なアクセス</span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border p-3">
              {getVisibilityIcon()}
              <div className="flex-1">
                <p className="text-sm font-medium">{getVisibilityText()}</p>
                <p className="text-xs text-muted-foreground">
                  {visibility === "public"
                    ? "誰でもアクセスできます。検索結果にも表示されます。"
                    : visibility === "restricted"
                      ? "リンクを知っている人だけがアクセスできます。"
                      : "あなただけがアクセスできます。"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => {}} className="shrink-0">
                <Settings2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>共有リンク</Label>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="font-mono text-sm" />
              <Button variant="secondary" className="shrink-0 gap-2" onClick={handleCopyLink}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    コピー済み
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    リンクをコピー
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>完了</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

