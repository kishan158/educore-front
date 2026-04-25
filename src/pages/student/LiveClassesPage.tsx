import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUpcomingClasses } from '../../hooks/useLiveClasses'
import { liveClassApi } from '../../api/liveclass.api'
import type { LiveClass, JoinUrlResponse } from '../../types/liveclass.types'

const PROVIDER_COLORS: Record<string, string> = {
  zoom:        'bg-blue-100 text-blue-700',
  jitsi:       'bg-teal-100 text-teal-700',
  google_meet: 'bg-green-100 text-green-700',
  custom:      'bg-gray-100 text-gray-600',
}

const STATUS_CONFIG = {
  scheduled: { label: 'Scheduled',  color: 'bg-blue-100 text-blue-700' },
  live:      { label: 'Live Now',   color: 'bg-red-100 text-red-600 animate-pulse' },
  ended:     { label: 'Ended',      color: 'bg-gray-100 text-gray-500' },
  cancelled: { label: 'Cancelled',  color: 'bg-red-50 text-red-400' },
}

function JitsiModal({
  joinData,
  onClose,
}: {
  joinData: JoinUrlResponse
  onClose:  () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
        <span className="text-white font-semibold text-sm">Live Class</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition px-3 py-1.5 bg-gray-800 rounded-lg text-sm"
        >
          Leave Class
        </button>
      </div>

      {/* Jitsi iframe */}
      <iframe
        src={`${joinData.url}${joinData.jwt ? `#jwt=${joinData.jwt}` : ''}`}
        className="flex-1 w-full border-0"
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        title="Live Class"
      />
    </motion.div>
  )
}

function LiveClassCard({ liveClass }: { liveClass: LiveClass }) {
  const [joining, setJoining]   = useState(false)
  const [joinData, setJoinData] = useState<JoinUrlResponse | null>(null)
  const statusConf = STATUS_CONFIG[liveClass.status]

  const handleJoin = async () => {
    setJoining(true)
    try {
      const { data } = await liveClassApi.studentJoinUrl(liveClass.id)
      const result   = data.data

      if (result.provider === 'jitsi') {
        // Record join
        await liveClassApi.recordJoin(liveClass.id).catch(() => {})
        setJoinData(result)
      } else {
        // Zoom / Meet — open in new tab
        window.open(result.url, '_blank')
      }
    } finally {
      setJoining(false)
    }
  }

  const canJoin = liveClass.status === 'live' ||
    (liveClass.status === 'scheduled' && liveClass.is_starting_soon)

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white border rounded-2xl p-5 transition-all ${
          liveClass.status === 'live'
            ? 'border-red-200 shadow-sm shadow-red-100'
            : 'border-gray-200'
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Date block */}
          <div className={`flex-shrink-0 w-14 text-center rounded-xl py-2 ${
            liveClass.status === 'live' ? 'bg-red-500' : 'bg-primary/10'
          }`}>
            <p className={`text-lg font-bold ${
              liveClass.status === 'live' ? 'text-white' : 'text-primary'
            }`}>
              {new Date(liveClass.starts_at).getDate()}
            </p>
            <p className={`text-xs font-medium ${
              liveClass.status === 'live' ? 'text-red-100' : 'text-gray-400'
            }`}>
              {new Date(liveClass.starts_at).toLocaleDateString('en-US', { month: 'short' })}
            </p>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-gray-900 text-sm">{liveClass.title}</h3>
              <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${statusConf.color}`}>
                {statusConf.label}
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-1">
              {liveClass.course?.title}
            </p>

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(liveClass.starts_at).toLocaleTimeString('en-US', {
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
              <span>{liveClass.duration_formatted}</span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${
                PROVIDER_COLORS[liveClass.provider] ?? 'bg-gray-100 text-gray-600'
              }`}>
                {liveClass.provider.charAt(0).toUpperCase() + liveClass.provider.slice(1)}
              </span>
            </div>

            {liveClass.teacher && (
              <div className="flex items-center gap-2 mt-2">
                <img
                  src={liveClass.teacher.avatar_url}
                  alt={liveClass.teacher.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-xs text-gray-400">{liveClass.teacher.name}</span>
              </div>
            )}
          </div>

          {/* Join button */}
          <div className="flex-shrink-0">
            {canJoin ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleJoin}
                disabled={joining}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition ${
                  liveClass.status === 'live'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                } disabled:opacity-60`}
              >
                {joining ? '...' : liveClass.status === 'live' ? 'Join Now' : 'Join Soon'}
              </motion.button>
            ) : liveClass.recording_url ? ( <a
    href={liveClass.recording_url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-accent bg-accent/10 rounded-xl hover:bg-accent/20 transition"
  >
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
    Recording
  </a>
            ) : liveClass.status === 'scheduled' ? (
              <span className="text-xs text-gray-400 text-center">
                {liveClass.starts_at_human}
              </span>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* Jitsi in-page modal */}
      <AnimatePresence>
        {joinData && (
          <JitsiModal
            joinData={joinData}
            onClose={async () => {
              await liveClassApi.recordLeave(liveClass.id).catch(() => {})
              setJoinData(null)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default function LiveClassesPage() {
  const { data: classes = [], isLoading } = useUpcomingClasses()

  const live      = classes.filter(c => c.status === 'live')
  const upcoming  = classes.filter(c => c.status === 'scheduled')

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-primary">Live Classes</h1>
        <p className="text-gray-500 text-sm mt-1">
          Classes from your enrolled courses
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">

          {/* Live now */}
          {live.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <h2 className="text-sm font-bold text-red-600 uppercase tracking-wide">
                  Live Right Now
                </h2>
              </div>
              <div className="space-y-3">
                {live.map(c => <LiveClassCard key={c.id} liveClass={c} />)}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                Upcoming
              </h2>
              <div className="space-y-3">
                {upcoming.map(c => <LiveClassCard key={c.id} liveClass={c} />)}
              </div>
            </div>
          )}

          {classes.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <svg className="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="text-gray-500 font-semibold mb-2">No Upcoming Classes</h3>
              <p className="text-gray-400 text-sm">
                Live classes from your enrolled courses will appear here.
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}