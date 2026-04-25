import { useEffect, useRef } from 'react'
import type { WatermarkData } from '../../types/enrollment.types'

interface Props {
  watermark: WatermarkData
}

export default function VideoWatermark({ watermark }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()

      // Rotate canvas for diagonal watermark
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(-Math.PI / 6)
      ctx.translate(-canvas.width / 2, -canvas.height / 2)

      ctx.font        = '13px Arial, sans-serif'
      ctx.fillStyle   = 'rgba(255, 255, 255, 0.12)'
      ctx.textBaseline = 'middle'

      const line1 = `${watermark.name} · ${watermark.email}`
      const line2 = `ID:${watermark.user_id} · ${watermark.timestamp}`
      const gap   = 90
      const rowGap = 30

      for (let x = -300; x < canvas.width + 300; x += 340) {
        for (let y = -100; y < canvas.height + 100; y += gap) {
          ctx.fillText(line1, x, y)
          ctx.fillText(line2, x, y + rowGap)
        }
      }

      ctx.restore()
    }

    draw()

    const ro = new ResizeObserver(draw)
    ro.observe(canvas)

    return () => ro.disconnect()
  }, [watermark])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      style={{ zIndex: 10 }}
      aria-hidden="true"
    />
  )
}