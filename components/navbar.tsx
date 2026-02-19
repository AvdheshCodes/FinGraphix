"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Overview", href: "/explore" },
  { label: "History", href: "/history" },
]

export function Navbar() {
  const pathname = usePathname()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number } | null>(null)
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([])

  const activeIndex = NAV_ITEMS.findIndex(
    (item) => item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  )
  const targetIndex = hoveredIndex ?? activeIndex

  useEffect(() => {
    const el = navRefs.current[targetIndex]
    if (el) {
      const { offsetLeft, offsetWidth } = el
      setSliderStyle({ left: offsetLeft, width: offsetWidth })
    } else {
      setSliderStyle(null)
    }
  }, [targetIndex])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-5xl px-4 pt-4">
        <div
          className={cn(
            "flex items-center justify-between rounded-2xl px-5 py-3",
            "bg-card/60 backdrop-blur-xl",
            "border border-border/40",
            "shadow-lg shadow-background/20"
          )}
        >
          {/* Logo + Title */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-9 overflow-hidden rounded-lg">
              <Image
                src="/fingraphix-logo.jpg"
                alt="FinGraphix logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              FinGraphix
            </span>
          </Link>

          {/* Navigation Links with Animated Slider */}
          <div
            className="relative flex items-center gap-1"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Animated slider background */}
            {sliderStyle && (
              <div
                className="absolute top-0 h-full rounded-lg bg-primary/15 transition-all duration-300 ease-in-out"
                style={{
                  left: sliderStyle.left,
                  width: sliderStyle.width,
                }}
              />
            )}

            {NAV_ITEMS.map((item, i) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  ref={(el) => { navRefs.current[i] = el }}
                  href={item.href}
                  onMouseEnter={() => setHoveredIndex(i)}
                  className={cn(
                    "relative z-10 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
