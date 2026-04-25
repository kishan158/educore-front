import { useEffect, useRef, useCallback } from 'react'
import { enrollmentApi } from '../api/enrollment.api'
import type { CaptureType } from '../types/enrollment.types'

interface Options {
  lessonId?: number
  enabled?:  boolean
}

export function useScreenProtection({ lessonId, enabled = true }: Options = {}) {
  const devToolsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const videoRef      = useRef<HTMLVideoElement | null>(null)

  const report = useCallback((type: CaptureType, meta?: object) => {
    // Silent fire — don't await, don't block UI
    enrollmentApi.logCaptureAttempt(type, lessonId, meta).catch(() => {})
  }, [lessonId])

  useEffect(() => {
    if (! enabled) return

    // ─── 1. Right-click disable ───────────────────────────────────
    const noContext = (e: MouseEvent) => {
      e.preventDefault()
      report('right_click')
    }
    document.addEventListener('contextmenu', noContext)

    // ─── 2. Keyboard shortcuts (PrintScreen, etc.) ────────────────
    const noKeys = (e: KeyboardEvent) => {
      const blocked = [
        e.key === 'PrintScreen',
        e.ctrlKey && e.shiftKey && e.key === 'I', // DevTools
        e.ctrlKey && e.shiftKey && e.key === 'J', // DevTools
        e.ctrlKey && e.key === 'U',               // View source
        e.key === 'F12',                          // DevTools
      ]
      if (blocked.some(Boolean)) {
        e.preventDefault()
        report('keyboard_shortcut', { key: e.key })
      }
    }
    document.addEventListener('keydown', noKeys)

    // ─── 3. Tab visibility change ─────────────────────────────────
    const onVisibility = () => {
      if (document.hidden) {
        report('visibility_hidden')
        videoRef.current?.pause()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    // ─── 4. DevTools size detection ───────────────────────────────
    devToolsTimer.current = setInterval(() => {
      const widthGap  = window.outerWidth  - window.innerWidth  > 160
      const heightGap = window.outerHeight - window.innerHeight > 160
      if (widthGap || heightGap) {
        report('devtools_open')
        videoRef.current?.pause()
      }
    }, 2000)

    // ─── 5. Screen Capture API detection ─────────────────────────
    const originalGetDisplayMedia = navigator.mediaDevices?.getDisplayMedia?.bind(
      navigator.mediaDevices
    )
    if (navigator.mediaDevices && originalGetDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia = async (...args) => {
        report('screen_capture_api')
        videoRef.current?.pause()
        return originalGetDisplayMedia(...args)
      }
    }

    return () => {
      document.removeEventListener('contextmenu', noContext)
      document.removeEventListener('keydown', noKeys)
      document.removeEventListener('visibilitychange', onVisibility)
      if (devToolsTimer.current) clearInterval(devToolsTimer.current)
      // Restore getDisplayMedia
      if (navigator.mediaDevices && originalGetDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia
      }
    }
  }, [enabled, report])

  return { videoRef }
}