import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { analyticsApi } from '../api/analytics.api'

export function useRealtimeStats() {
  return useQuery({
    queryKey:        ['admin', 'analytics', 'realtime'],
    queryFn:         async () => { const { data } = await analyticsApi.realtime(); return data.data },
    refetchInterval: 30_000,
  })
}

export function useRevenueChart(days = 30) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'revenue', days],
    queryFn:  async () => { const { data } = await analyticsApi.revenue(days); return data.data },
  })
}

export function useEnrollmentChart(days = 30) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'enrollments', days],
    queryFn:  async () => { const { data } = await analyticsApi.enrollments(days); return data.data },
  })
}

export function useTopCourses() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'top-courses'],
    queryFn:  async () => { const { data } = await analyticsApi.topCourses(); return data.data },
  })
}

export function useRevenueByCategory() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'revenue-by-category'],
    queryFn:  async () => { const { data } = await analyticsApi.revenueByCategory(); return data.data },
  })
}

export function useTeacherPerformance() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'teachers'],
    queryFn:  async () => { const { data } = await analyticsApi.teacherPerformance(); return data.data },
  })
}

export function useTeacherAnalytics(days = 30) {
  return useQuery({
    queryKey: ['teacher', 'analytics', days],
    queryFn:  async () => { const { data } = await analyticsApi.myAnalytics(days); return data.data },
  })
}

// Settings
export function useSiteTheme() {
  return useQuery({
    queryKey: ['settings', 'theme'],
    queryFn:  async () => { const { data } = await analyticsApi.theme(); return data.data },
    staleTime: 10 * 60 * 1000,
  })
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn:  async () => { const { data } = await analyticsApi.adminSettings(); return data.data },
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: analyticsApi.updateSettings,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['settings'] })
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] })
    },
  })
}