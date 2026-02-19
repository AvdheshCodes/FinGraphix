"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FinancialLoading } from "@/components/financial-loading"

export default function ProcessingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const datasetId = searchParams.get("datasetId")

  useEffect(() => {
    if (!datasetId) {
      router.replace("/")
      return
    }

    // After 3.5s, trigger fade-out; after fade completes (3s), navigate
    const fadeTimer = setTimeout(() => {
      const trigger = (window as unknown as Record<string, unknown>).__triggerProcessingFadeOut
      if (typeof trigger === "function") {
        ;(trigger as () => void)()
      }
    }, 3500)

    const navTimer = setTimeout(() => {
      router.replace(`/explore?datasetId=${datasetId}`)
    }, 6500) // 3.5s display + 3s fade-out

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(navTimer)
    }
  }, [datasetId, router])

  return <FinancialLoading />
}
