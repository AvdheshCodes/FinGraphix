"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Database } from "lucide-react"
import { UploadDropzone } from "@/components/upload-dropzone"
import { Button } from "@/components/ui/button"
import { getDatasetFromLocalStorage, clearDatasetFromLocalStorage } from "@/lib/local-storage"
import { saveDatasetToLocalStorage } from "@/lib/local-storage"
import { TITANIC_INFO } from "@/lib/sample-datasets/titanic"

export default function UploadPage() {
  const router = useRouter()
  const [savedDatasetId, setSavedDatasetId] = useState<string | null>(null)
  const [isLoadingSample, setIsLoadingSample] = useState(false)

  // Check for saved dataset on mount
  useEffect(() => {
    const saved = getDatasetFromLocalStorage()
    if (saved?.datasetId) {
      setSavedDatasetId(saved.datasetId)
    }
  }, [])

  const handleContinue = () => {
    if (savedDatasetId) {
      router.push(`/explore?datasetId=${savedDatasetId}`)
    }
  }

  const handleClearSaved = () => {
    clearDatasetFromLocalStorage()
    setSavedDatasetId(null)
  }

  const handleLoadSample = async () => {
    setIsLoadingSample(true)
    try {
      const res = await fetch("/api/dataset/sample", { method: "POST" })
      if (!res.ok) throw new Error("Failed to load sample")
      const data = await res.json()
      
      // Save to localStorage for persistence
      if (data.storedDataset) {
        saveDatasetToLocalStorage(data.storedDataset)
      }
      
      router.push(`/explore?datasetId=${data.datasetId}`)
    } catch (error) {
      console.error("Failed to load sample dataset:", error)
    } finally {
      setIsLoadingSample(false)
    }
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle gradient background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="container relative mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              AI-Powered Analytics
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              AI Data Scientist
            </h1>
            <p className="text-muted-foreground text-lg">
              Upload a CSV file to get instant insights and guided exploration
            </p>
          </div>

          {/* Continue with saved dataset */}
          {savedDatasetId && (
            <div className="rounded-[6px] border border-primary/30 bg-primary/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/20 p-2">
                    <Database className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Previous dataset available</p>
                    <p className="text-xs text-muted-foreground">Continue where you left off</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleClearSaved}>
                    Clear
                  </Button>
                  <Button size="sm" onClick={handleContinue} className="bg-primary hover:bg-primary/90">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <UploadDropzone />

          {/* Sample dataset option */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">Or try with a sample dataset</p>
            <Button
              variant="outline"
              onClick={handleLoadSample}
              disabled={isLoadingSample}
              className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 bg-transparent"
            >
              {isLoadingSample ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
                  Loading...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4 text-primary" />
                  Load {TITANIC_INFO.name} ({TITANIC_INFO.rows} rows)
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-medium text-center text-muted-foreground uppercase tracking-wider">What you can do</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="rounded-[6px] border border-border/50 bg-card/50 p-5 backdrop-blur-sm hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="font-medium">Auto Overview</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Get instant charts for distributions and relationships
                </p>
              </div>
              <div className="rounded-[6px] border border-border/50 bg-card/50 p-5 backdrop-blur-sm hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <p className="font-medium">Click to Explore</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Enhance, filter, or generalize any chart
                </p>
              </div>
              <div className="rounded-[6px] border border-border/50 bg-card/50 p-5 backdrop-blur-sm hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="font-medium">AI Insights</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Get AI-powered analysis and suggestions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
