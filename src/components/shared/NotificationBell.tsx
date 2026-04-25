
import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { useNavigate }                 from 'react-router-dom'
import { motion, AnimatePresence }     from 'framer-motion'
import {
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
  useMyNotifications,
  useRealtimeNotifications,
} from '../../hooks/useNotifications'
import { useNotificationStore } from '../../stores/notificationStore'
import type { NotificationItem } from '../../types/payout.types'

const ICON_MAP: Record<string, React.ReactElement> = {
  'check-circle': (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'alert-circle': (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  award: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
    </svg>
  ),
  video: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  'file-text': (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  bell: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
}

const TYPE_COLORS: Record<string, string> = {
  order_completed:     'bg-green-100 text-green-600',
  assignment_submitted:'bg-blue-100 text-blue-600',
  assignment_graded:   'bg-teal-100 text-teal-600',
  certificate_issued:  'bg-amber-100 text-amber-600',
  live_class_starting: 'bg-red-100 text-red-600',
  course_approved:     'bg-green-100 text-green-600',
  course_rejected:     'bg-red-100 text-red-600',
  payout_requested:    'bg-purple-100 text-purple-600',
  payout_approved:     'bg-green-100 text-green-600',
  payout_paid:         'bg-green-100 text-green-600',
  payout_rejected:     'bg-red-100 text-red-600',
  default:             'bg-gray-100 text-gray-500',
}

function NotificationItem({ notification, onRead }: {
  notification: NotificationItem
  onRead:       (id: number, url: string | null) => void
}) {
  const colorClass = TYPE_COLORS[notification.type] ?? TYPE_COLORS.default
  const icon       = ICON_MAP[notification.icon ?? 'bell'] ?? ICON_MAP.bell

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${
        !notification.is_read ? 'bg-blue-50/40' : ''
      }`}
      onClick={() => onRead(notification.id, notification.action_url)}
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-snug">{notification.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">{notification.created_at}</p>
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-1" />
      )}
    </motion.div>
  )
}

export default function NotificationBell() {
  const navigate         = useNavigate()
  const [open, setOpen]  = useState(false)
  const dropdownRef      = useRef<HTMLDivElement>(null)

  const { data: countData }    = useUnreadCount()
  const { data }               = useMyNotifications({ per_page: 15 })
  const markReadMutation       = useMarkRead()
  const markAllReadMutation    = useMarkAllRead()
  const { soundEnabled, toggleSound } = useNotificationStore()

  // Initialize realtime
  useRealtimeNotifications()

  const unreadCount   = countData ?? 0
  const notifications: NotificationItem[] = (data as any)?.data ?? []

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleRead = (id: number, url: string | null) => {
    markReadMutation.mutate(id)
    if (url) {
      navigate(url)
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Bell button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-xl transition"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-accent text-white text-xs font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {/* Sound toggle */}
                <button
                  onClick={toggleSound}
                  title={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition rounded-lg"
                >
                  {soundEnabled ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3m3 3l3-3M6.343 6.343a8 8 0 000 11.314" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  )}
                </button>

                {/* Mark all read */}
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    className="text-xs text-accent font-medium hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <svg className="w-10 h-10 mx-auto text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-sm text-gray-400">No notifications yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notification={notif}
                      onRead={handleRead}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-4 py-3">
              <button
                onClick={() => {
                  navigate('/notifications')
                  setOpen(false)
                }}
                className="w-full text-xs text-accent font-medium hover:underline text-center"
              >
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}