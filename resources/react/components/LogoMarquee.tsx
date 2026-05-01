
import { useRef, useEffect } from 'react'
import type { ClientBrand } from '@/store/dataStore'

interface LogoMarqueeProps {
  brands: ClientBrand[]
  speed?: number   // pixels per second, default 40
  light?: boolean  // light background (default) vs dark
}

/**
 * Continuously scrolling logo strip.
 * – Items scroll left automatically.
 * – Hovering pauses the animation.
 * – Duplicates the list so it appears infinite.
 */
export default function LogoMarquee({ brands, speed = 40, light = true }: LogoMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const rafRef   = useRef<number>(0)
  const posRef   = useRef(0)
  const pausedRef= useRef(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track || brands.length === 0) return

    // wait for paint so offsetWidth is correct
    const raf = requestAnimationFrame(() => {
      const halfW = track.scrollWidth / 2   // one full copy width

      const animate = () => {
        if (!pausedRef.current) {
          posRef.current -= speed / 60      // ~60fps
          if (posRef.current <= -halfW) posRef.current = 0
          track.style.transform = `translateX(${posRef.current}px)`
        }
        rafRef.current = requestAnimationFrame(animate)
      }
      rafRef.current = requestAnimationFrame(animate)
    })

    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(rafRef.current)
    }
  }, [brands, speed])

  if (brands.length === 0) return null

  // Duplicate list to create seamless loop
  const items = [...brands, ...brands]
  const textColor   = light ? 'rgba(11,15,26,0.2)' : 'rgba(255,255,255,0.25)'
  const hoverFilter  = light ? 'grayscale(0) brightness(1)' : 'grayscale(0) brightness(1.3)'

  return (
    // dir="ltr" forces left-to-right scroll regardless of page RTL direction (Arabic mode)
    // Without this, RTL mode reverses overflow clipping and translateX direction,
    // making logos invisible / scrolling out of the visible area.
    <div
      dir="ltr"
      className="relative overflow-hidden select-none"
      onMouseEnter={() => { pausedRef.current = true  }}
      onMouseLeave={() => { pausedRef.current = false }}
      style={{ cursor: 'default', direction: 'ltr' }}
    >
      {/* Left/right fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10"
           style={{ background: `linear-gradient(to right, ${light ? 'white' : 'transparent'}, transparent)` }}/>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10"
           style={{ background: `linear-gradient(to left, ${light ? 'white' : 'transparent'}, transparent)` }}/>

      <div ref={trackRef} className="flex items-center gap-16 will-change-transform" style={{ width: 'max-content', padding: '0 28px', direction: 'ltr' }}>
        {items.map((brand, i) => (
          <div key={`${brand.id}-${i}`} className="flex-shrink-0 flex items-center justify-center" style={{ height: 72, minWidth: 120 }}>
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.name}
                title={brand.name}
                draggable={false}
                style={{
                  height: 64, width: 'auto', objectFit: 'contain', maxWidth: 180,
                  opacity: 0.85, filter: 'grayscale(0)',
                  transition: 'opacity .25s, filter .25s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLImageElement
                  el.style.opacity = '1'
                  el.style.filter  = hoverFilter
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLImageElement
                  el.style.opacity = '0.85'
                  el.style.filter  = 'grayscale(0)'
                }}
              />
            ) : (
              <span
                className="font-bold tracking-[0.12em] uppercase whitespace-nowrap transition-colors duration-200"
                style={{ fontSize: 13, color: textColor }}
                title={brand.name}
              >
                {brand.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
