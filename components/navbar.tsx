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

const HIDDEN_PATHS = ["/explore", "/processing"]

export function Navbar() {
  const pathname = usePathname()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number } | null>(null)
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([])

  const shouldHide = HIDDEN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + "?")
  )

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
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-400 ease-in-out",
        shouldHide ? "opacity-0 -translate-y-full pointer-events-none" : "opacity-100 translate-y-0"
      )}
    >
      <div className="mx-auto max-w-5xl px-4 pt-4">
        <div
          className={cn(
            "flex items-center justify-between rounded-2xl px-5 py-3",
          )}
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
          }}
        >
          {/* Logo + Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-[38px] w-[38px] max-h-[42px] overflow-hidden rounded-lg">
              <Image
                src="/fingraphix-logo.jpg"
                alt="FinGraphix logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span
              className="text-lg font-semibold tracking-tight transition-colors text-foreground"
            >
              FinGraphix
            </span>
          </Link>

          {/* Navigation Links with Animated Pill Slider */}
          <div
            className="relative flex items-center gap-1"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Animated pill slider background */}
            {sliderStyle && (
              <div
                className="absolute top-0 h-full transition-all ease-in-out"
                style={{
                  left: sliderStyle.left,
                  width: sliderStyle.width,
                  background: "rgba(255,255,255,0.15)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                  borderRadius: "999px",
                  transitionDuration: "300ms",
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
                    "relative z-10 px-4 py-1.5 text-sm font-medium transition-colors duration-200",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  style={{
                    borderRadius: "999px",
                  }}
                  data-active={isActive ? "" : undefined}
                  onFocus={() => setHoveredIndex(i)}
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
