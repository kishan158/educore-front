import { create } from 'zustand'
import type { NotificationItem } from '../types/payout.types'

interface NotificationState {
  notifications:  NotificationItem[]
  unreadCount:    number
  soundEnabled:   boolean

  add:             (notification: NotificationItem) => void
  incrementUnread: () => void
  setUnreadCount:  (count: number) => void
  toggleSound:     () => void
  clear:           () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount:   0,
  soundEnabled:  true,

  add: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
    })),

  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  setUnreadCount: (count) =>
    set({ unreadCount: count }),

  toggleSound: () =>
    set((state) => ({ soundEnabled: !state.soundEnabled })),

  clear: () =>
    set({ notifications: [], unreadCount: 0 }),
}))