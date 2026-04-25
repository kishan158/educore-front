import api from '../lib/axios'
import type { ApiSuccess } from '../types/auth.types'
import type {
  RealtimeStats, ChartDataPoint, TopCourse,
  CategoryRevenue, TeacherPerformance, TeacherAnalytics,
  SiteTheme, SiteSettings,
} from '../types/analytics.types'

export const analyticsApi = {
  // Admin
  realtime:          () =>
    api.get<ApiSuccess<RealtimeStats>>('/admin/analytics/realtime'),

  revenue:           (days = 30) =>
    api.get<ApiSuccess<ChartDataPoint[]>>('/admin/analytics/revenue', { params: { days } }),

  enrollments:       (days = 30) =>
    api.get<ApiSuccess<ChartDataPoint[]>>('/admin/analytics/enrollments', { params: { days } }),

  topCourses:        (limit = 10) =>
    api.get<ApiSuccess<TopCourse[]>>('/admin/analytics/top-courses', { params: { limit } }),

  revenueByCategory: () =>
    api.get<ApiSuccess<CategoryRevenue[]>>('/admin/analytics/revenue-by-category'),

  teacherPerformance:(limit = 10) =>
    api.get<ApiSuccess<TeacherPerformance[]>>('/admin/analytics/teacher-performance', { params: { limit } }),

  // Teacher
  myAnalytics:       (days = 30) =>
    api.get<ApiSuccess<TeacherAnalytics>>('/teacher/analytics', { params: { days } }),

  // Settings
  publicSettings:    () =>
    api.get<ApiSuccess<Record<string, any>>>('/settings/public'),

  theme:             () =>
    api.get<ApiSuccess<SiteTheme>>('/settings/theme'),

  adminSettings:     () =>
    api.get<ApiSuccess<SiteSettings>>('/admin/settings'),

  updateSettings:    (settings: Record<string, any>) =>
    api.post<ApiSuccess<null>>('/admin/settings', { settings }),

  uploadSettingFile: (key: string, file: File) => {
    const fd = new FormData()
    fd.append('key', key)
    fd.append('file', file)
    return api.post<ApiSuccess<{ url: string }>>('/admin/settings/file', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}