import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useScreenProtection } from '../../hooks/useScreenProtection'
import VideoWatermark from './VideoWatermark'
import { enrollmentApi } from '../../api/enrollment.api'
import { useMarkLessonComplete } from '../../hooks/useEnrollment'
import type { Lesson } from '../../types/course.types'
import type { WatermarkData } from '../../types/enrollment.types'

interface Props {
  lesson:     Lesson
  courseId:   number
  watermark:  WatermarkData
  onComplete?: (result: { progress_percent: number; course_completed: boolean }) => void
}

export default function ProtectedVideoPlayer({
  lesson,
  courseId,
  watermark,
  onComplete,
}: Props) {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying]   = useState(false)
  const [progress, setProgress] = useState(0)
  const watchTimeRef            = useRef(0)
  const watchIntervalRef        =   useRef<ReturnType<typeof setInterval> | null>(null)


  const { videoRef: protectionRef } = useScreenProtection({
    lessonId: lesson.id,
    enabled:  true,
  })

  const markCompleteMutation = useMarkLessonComplete()

  // Sync refs
  useEffect(() => {
    if (videoRef.current) {
      (protectionRef as any).current = videoRef.current

      // Disable PiP
      videoRef.current.disablePictureInPicture = true

      // Disable context menu on video
      videoRef.current.addEventListener('contextmenu', (e) => e.preventDefault())
    }
  }, [])

  // Track watch time — report every 30s
  useEffect(() => {
    watchIntervalRef.current = setInterval(() => {
      if (playing && watchTimeRef.current > 0) {
        enrollmentApi.updateWatchTime(lesson.id, watchTimeRef.current).catch(() => {})
        watchTimeRef.current = 0
      }
    }, 30_000)

    return () => {
      if (watchIntervalRef.current) clearInterval(watchIntervalRef.current)
    }
  }, [lesson.id, playing])

  const handleTimeUpdate = () => {
    const v = videoRef.current
    if (!v) return
    setProgress((v.currentTime / v.duration) * 100)
    watchTimeRef.current++
  }

  const handleEnded = async () => {
    setPlaying(false)
    // Auto mark complete when video ends
    const result = await markCompleteMutation.mutateAsync(lesson.id)
    onComplete?.(result.data.data)
  }

  return (
    <div className="relative w-full bg-black rounded-2xl overflow-hidden select-none">

      {/* Watermark overlay */}
      <VideoWatermark watermark={watermark} />

      {/* Video */}
      <video
        ref={videoRef}
        src={lesson.video_url ?? undefined}
        className="w-full aspect-video"
        controlsList="nodownload nofullscreen noremoteplayback"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        playsInline
      />

      {/* Custom controls overlay - no download button */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        {/* Progress bar */}
        <div className="w-full h-1 bg-white/20 rounded-full mb-3">
          <motion.div
            className="h-full bg-accent rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (videoRef.current) {
                playing ? videoRef.current.pause() : videoRef.current.play()
              }
            }}
            className="text-white hover:text-accent transition"
          >
            {playing ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <span className="text-white text-xs ml-auto font-mono">
            {lesson.duration_formatted}
          </span>
        </div>
      </div>

      {/* Completion overlay */}
      {markCompleteMutation.isSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/60 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold text-lg">Lesson Complete!</p>
            {markCompleteMutation.data?.data.data.course_completed && (
              <p className="text-green-400 text-sm mt-1">
                Course completed! Certificate is being generated.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}