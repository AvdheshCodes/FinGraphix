"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UploadDropzone } from "@/components/upload-dropzone"
import { Button } from "@/components/ui/button"
import { saveDatasetToLocalStorage } from "@/lib/local-storage"

export default function UploadPage() {
  const router = useRouter()
  const [isLoadingSample, setIsLoadingSample] = useState(false)

  const handleLoadSample = async () => {
    setIsLoadingSample(true)
    try {
      const res = await fetch("/api/dataset/sample", { method: "POST" })
      if (!res.ok) throw new Error("Failed to load sample")
      const data = await res.json()

      if (data.storedDataset) {
        saveDatasetToLocalStorage(data.storedDataset)
      }

      router.push(`/processing?datasetId=${data.datasetId}`)
    } catch (error) {
      console.error("Failed to load sample dataset:", error)
    } finally {
      setIsLoadingSample(false)
    }
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden animate-in fade-in duration-500">
      {/* Subtle gradient background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="container relative mx-auto flex min-h-screen flex-col items-center justify-center px-4 pt-28 pb-16">
        <div className="w-full max-w-xl space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Financial Forensics
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground text-balance">
              Financial Forensic Engine
            </h1>
            <p className="text-muted-foreground text-lg text-pretty">
              Upload financial data for instant forensic insights and guided exploration
            </p>
          </div>

          <UploadDropzone />

          {/* Generate Analysis */}
          <div className="text-center">
            <Button
              onClick={handleLoadSample}
              disabled={isLoadingSample}
              className="px-8 py-5 text-base font-medium"
            >
              {isLoadingSample ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Generating...
                </>
              ) : (
                "Generate Analysis"
              )}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
