"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { fetchInstitutionById } from "@/lib/api"
import { InstitutionDetails } from "@/components/institution/institution-details"
import type { Institution } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function InstitutionPage() {
  const params = useParams()
  const id = params.id as string
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadInstitution() {
      try {
        const data = await fetchInstitutionById(id)
        setInstitution(data)
      } catch (err) {
        console.error("Error loading institution:", err)
        setError("Failed to load institution details")
      } finally {
        setLoading(false)
      }
    }

    loadInstitution()
  }, [id])

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !institution) {
    return <div className="p-4 text-red-600">{error || "Institution not found"}</div>
  }

  // 表示専用なので、更新と削除の関数はダミーを渡す
  const handleUpdate = (_: Institution) => {
    console.log("更新機能は表示専用ページでは使用できません")
  }

  const handleDelete = (_: string) => {
    console.log("削除機能は表示専用ページでは使用できません")
  }

  return (
    <InstitutionDetails
      institution={institution}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  )
}
