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
    <main className="min-h-screen relative overflow-hidden animate-in fade-in duration-500" style={{ background: "#020617" }}>
      {/* Deep black-blue layered gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 40%, #0a1628 0%, #050d1a 45%, #020617 100%)",
        }}
      />
      {/* Secondary subtle blue accent glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 40% 35% at 30% 60%, rgba(15,23,42,0.6) 0%, transparent 100%)",
        }}
      />
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
      {/* Slow ambient glow - deep blue pulse */}
      <div className="absolute inset-0 pointer-events-none animate-ambient-glow">
        <div
          className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(10,22,40,0.5) 0%, rgba(5,13,26,0.2) 50%, transparent 75%)",
          }}
        />
      </div>

      <div className="container relative mx-auto flex min-h-screen flex-col items-center justify-center px-4 pt-28 pb-16">
        <div className="w-full max-w-xl space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm mb-2" style={{ background: "rgba(79,156,255,0.12)", color: "#4f9cff" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#4f9cff" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#4f9cff" }} />
              </span>
              Financial Forensics
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance" style={{ color: "#f0f0f0" }}>
              Financial Forensic Engine
            </h1>
            <p className="text-lg text-pretty" style={{ color: "rgba(255,255,255,0.55)" }}>
              Upload financial data for instant forensic insights and guided exploration
            </p>
          </div>

          <UploadDropzone />

          {/* Generate Analysis */}
          <div className="text-center">
            <Button
              onClick={handleLoadSample}
              disabled={isLoadingSample}
              className="px-8 py-5 text-base font-medium text-white hover:brightness-110"
              style={{ background: "#22c55e" }}
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
