import api from '../lib/axios'
import type { ApiSuccess }      from '../types/auth.types'
import type { NotificationItem } from '../types/payout.types'

export const notificationApi = {
  list: (params = {}) =>
    api.get<{ success: boolean; data: NotificationItem[]; meta: any }>(
      '/notifications', { params }
    ),

  unreadCount: () =>
    api.get<ApiSuccess<{ count: number }>>('/notifications/unread-count'),

  markRead: (id: number) =>
    api.post<ApiSuccess<null>>(`/notifications/${id}/read`),

  markAllRead: () =>
    api.post<ApiSuccess<null>>('/notifications/read-all'),
}