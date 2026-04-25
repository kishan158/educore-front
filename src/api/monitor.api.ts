import api from '../lib/axios'
import type { ApiSuccess }               from '../types/auth.types'
import type { ErrorLogItem, ErrorStats, HealthReport, MetricHistory } from '../types/monitor.types'

export const monitorApi = {
  // Error Logs
  errorLogs: (params = {}) =>
    api.get<{ success: boolean; data: ErrorLogItem[]; meta: any }>(
      '/admin/errors', { params }
    ),

  errorStats: () =>
    api.get<ApiSuccess<ErrorStats>>('/admin/errors/stats'),

  getError: (id: number) =>
    api.get<ApiSuccess<ErrorLogItem>>(`/admin/errors/${id}`),

  resolveError: (id: number, note = '') =>
    api.post<ApiSuccess<ErrorLogItem>>(`/admin/errors/${id}/resolve`, { note }),

  deleteError: (id: number) =>
    api.delete(`/admin/errors/${id}`),

  bulkResolve: (ids: number[]) =>
    api.post<ApiSuccess<null>>('/admin/errors/bulk-resolve', { ids }),

  // Server Monitor
  currentMetrics: () =>
    api.get<ApiSuccess<HealthReport>>('/admin/monitor/health'),

  metricHistory: (hours = 24) =>
    api.get<ApiSuccess<MetricHistory[]>>('/admin/monitor/history', { params: { hours } }),

  queueHealth: () =>
    api.get<ApiSuccess<any>>('/admin/monitor/queue'),
}