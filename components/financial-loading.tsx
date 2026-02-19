"use client"

import { useEffect, useRef, useState, useCallback } from "react"

/*
  Forensic Data Convergence Animation
  
  Particles originate from screen edges, flow along curved paths toward
  a central analytical core. The core pulses with converging ring waves.
  Thin graph edges connect nearby particles as they cluster inward.
*/

interface Particle {
  x: number
  y: number
  originX: number
  originY: number
  targetX: number
  targetY: number
  progress: number
  speed: number
  size: number
  opacity: number
  hue: number // 0 = primary blue, 1 = secondary cyan, 2 = accent green
  curveOffsetX: number
  curveOffsetY: number
}

const COLORS = {
  primary: [79, 156, 255],    // #4f9cff
  secondary: [125, 211, 252], // #7dd3fc
  accent: [34, 197, 94],      // #22c55e
}

const COLOR_KEYS: (keyof typeof COLORS)[] = ["primary", "secondary", "accent"]

function getColor(hue: number, alpha: number): string {
  const key = COLOR_KEYS[hue % 3]
  const [r, g, b] = COLORS[key]
  return `rgba(${r},${g},${b},${alpha})`
}

function createParticle(w: number, h: number): Particle {
  const cx = w / 2
  const cy = h / 2
  // Spawn from random edge
  const edge = Math.floor(Math.random() * 4)
  let ox: number, oy: number
  switch (edge) {
    case 0: ox = Math.random() * w; oy = -20; break        // top
    case 1: ox = w + 20; oy = Math.random() * h; break      // right
    case 2: ox = Math.random() * w; oy = h + 20; break      // bottom
    default: ox = -20; oy = Math.random() * h; break         // left
  }
  return {
    x: ox,
    y: oy,
    originX: ox,
    originY: oy,
    targetX: cx + (Math.random() - 0.5) * 60,
    targetY: cy + (Math.random() - 0.5) * 60,
    progress: 0,
    speed: 0.002 + Math.random() * 0.004,
    size: 1.5 + Math.random() * 2.5,
    opacity: 0,
    hue: Math.floor(Math.random() * 3),
    curveOffsetX: (Math.random() - 0.5) * 200,
    curveOffsetY: (Math.random() - 0.5) * 200,
  }
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// Quadratic bezier point
function bezier(a: number, cp: number, b: number, t: number): number {
  const mt = 1 - t
  return mt * mt * a + 2 * mt * t * cp + t * t * b
}

const PARTICLE_COUNT = 60
const EDGE_DISTANCE = 80

function ConvergenceCanvas({ fading }: { fading: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)
  const pulseRef = useRef(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const cx = w / 2
    const cy = h / 2

    // Dark gradient mesh background
    ctx.clearRect(0, 0, w, h)

    // Radial glow at center
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.5)
    grad.addColorStop(0, "rgba(79,156,255,0.06)")
    grad.addColorStop(0.5, "rgba(79,156,255,0.02)")
    grad.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    const particles = particlesRef.current

    // Update pulse
    pulseRef.current += 0.02

    // Update particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      p.progress += p.speed

      if (p.progress >= 1) {
        // Reset particle from a new edge
        const np = createParticle(w, h)
        particles[i] = np
        continue
      }

      const eased = easeInOutCubic(p.progress)
      const cpx = lerp(p.originX, p.targetX, 0.5) + p.curveOffsetX
      const cpy = lerp(p.originY, p.targetY, 0.5) + p.curveOffsetY

      p.x = bezier(p.originX, cpx, p.targetX, eased)
      p.y = bezier(p.originY, cpy, p.targetY, eased)

      // Fade in during first 20%, full in middle, fade in last 10%
      if (p.progress < 0.2) {
        p.opacity = p.progress / 0.2
      } else if (p.progress > 0.9) {
        p.opacity = (1 - p.progress) / 0.1
      } else {
        p.opacity = 1
      }
    }

    // Draw thin graph edges between nearby particles
    ctx.lineWidth = 0.5
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < EDGE_DISTANCE) {
          const alpha = (1 - dist / EDGE_DISTANCE) * 0.15 * Math.min(particles[i].opacity, particles[j].opacity)
          ctx.strokeStyle = `rgba(79,156,255,${alpha})`
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }
    }

    // Draw particles with glow
    for (const p of particles) {
      if (p.opacity <= 0) continue
      const color = getColor(p.hue, p.opacity * 0.8)
      const glowColor = getColor(p.hue, p.opacity * 0.15)

      // Blur trail / glow
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
      ctx.fillStyle = glowColor
      ctx.fill()

      // Core particle
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    }

    // Central pulse rings
    const ringCount = 3
    for (let i = 0; i < ringCount; i++) {
      const phase = (pulseRef.current + i * 0.8) % (Math.PI * 2)
      const radius = 20 + Math.sin(phase) * 15 + i * 12
      const alpha = (0.12 - i * 0.03) * (0.5 + Math.sin(phase) * 0.5)
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(79,156,255,${alpha})`
      ctx.lineWidth = 1.5 - i * 0.3
      ctx.stroke()
    }

    // Central core dot
    const coreAlpha = 0.4 + Math.sin(pulseRef.current * 1.5) * 0.2
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8)
    coreGrad.addColorStop(0, `rgba(79,156,255,${coreAlpha})`)
    coreGrad.addColorStop(1, "rgba(79,156,255,0)")
    ctx.beginPath()
    ctx.arc(cx, cy, 8, 0, Math.PI * 2)
    ctx.fillStyle = coreGrad
    ctx.fill()

    animFrameRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      const ctx = canvas.getContext("2d")
      if (ctx) ctx.scale(dpr, dpr)
    }
    resize()

    // Init particles
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(window.innerWidth, window.innerHeight)
    )
    // Stagger initial progress so they don't all start at edges
    particlesRef.current.forEach((p, i) => {
      p.progress = (i / PARTICLE_COUNT) * 0.8
    })

    animFrameRef.current = requestAnimationFrame(draw)
    window.addEventListener("resize", resize)
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{
        opacity: fading ? 0 : 1,
        transition: "opacity 3s ease-in-out",
      }}
      aria-hidden="true"
    />
  )
}

export function FinancialLoading() {
  const [visible, setVisible] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Staggered entry
    const showTimer = setTimeout(() => setVisible(true), 600)
    const textTimer = setTimeout(() => setTextVisible(true), 1200)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(textTimer)
    }
  }, [])

  // Expose fading trigger via a callback the parent can use
  const triggerFadeOut = useCallback(() => {
    setFading(true)
  }, [])

  // Attach to window so the processing page can trigger it
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__triggerProcessingFadeOut = triggerFadeOut
    return () => {
      delete (window as unknown as Record<string, unknown>).__triggerProcessingFadeOut
    }
  }, [triggerFadeOut])

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0a0e1a 0%, #0f1729 40%, #0b1120 100%)",
        opacity: fading ? 0 : visible ? 1 : 0,
        transform: visible && !fading ? "scale(1)" : "scale(1.02)",
        transition: fading
          ? "opacity 3s ease-in-out, transform 3s ease-in-out"
          : "opacity 3.5s cubic-bezier(0.4,0.0,0.2,1), transform 3.5s cubic-bezier(0.4,0.0,0.2,1)",
      }}
    >
      {/* Ultra-subtle grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          mixBlendMode: "overlay" as const,
        }}
      />

      <ConvergenceCanvas fading={fading} />

      {/* Text content */}
      <div
        className="relative z-10 flex flex-col items-center gap-4"
        style={{
          opacity: textVisible && !fading ? 1 : 0,
          transform: textVisible && !fading ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 1.5s ease, transform 1.5s ease",
        }}
      >
        <p
          className="text-sm font-medium tracking-wide"
          style={{
            color: "rgba(255,255,255,0.6)",
            animation: "opacityWave 3s ease-in-out infinite",
          }}
        >
          Performing forensic-grade financial analysis...
        </p>

        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: "rgba(79,156,255,0.7)",
                animation: `convergeDot 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
