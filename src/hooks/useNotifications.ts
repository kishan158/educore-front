import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useCallback }        from 'react'
import { notificationApi }                       from '../api/notification.api'
import { useAuthStore }                          from '../stores/authStore'
import { useNotificationStore }                  from '../stores/notificationStore'

export function useMyNotifications(params = {}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn:  async () => {
      const { data } = await notificationApi.list(params)
      return data
    },
    refetchInterval: 30_000, // Fallback polling
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey:        ['notifications', 'unread-count'],
    queryFn:         async () => {
      const { data } = await notificationApi.unreadCount()
      return data.data.count
    },
    refetchInterval: 30_000,
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

// ─── Realtime WebSocket listener ──────────────────────────────────

export function useRealtimeNotifications() {
  const user          = useAuthStore((s) => s.user)
  const addNotification = useNotificationStore((s) => s.add)
  const incrementUnread = useNotificationStore((s) => s.incrementUnread)
  const audioRef      = useRef<HTMLAudioElement | null>(null)
  const qc            = useQueryClient()

  const playSound = useCallback((sound: string = 'default') => {
    const soundMap: Record<string, string> = {
      default: '/sounds/notification.mp3',
      urgent:  '/sounds/alert.mp3',
      success: '/sounds/success.mp3',
      warning: '/sounds/warning.mp3',
    }
    const src = soundMap[sound] ?? soundMap.default

    if (!audioRef.current) {
      audioRef.current = new Audio(src)
    } else {
      audioRef.current.src = src
    }
    audioRef.current.volume = 0.5
    audioRef.current.play().catch(() => {}) // Browser may block autoplay
  }, [])

  useEffect(() => {
    if (!user) return

    // Laravel Echo connection
    const Echo = (window as any).Echo
    if (!Echo) return

    const channel = Echo.private(`user.${user.id}`)

    channel.listen('.notification.new', (data: any) => {
      // Add to store
      addNotification(data)
      incrementUnread()

      // Play sound
      playSound(data.sound)

      // Invalidate queries
      qc.invalidateQueries({ queryKey: ['notifications'] })
    })

    return () => {
      Echo.leave(`user.${user.id}`)
    }
  }, [user?.id])
}