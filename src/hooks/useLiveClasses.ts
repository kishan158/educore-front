import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { liveClassApi } from '../api/liveclass.api'
import type { LiveClassFormData } from '../types/liveclass.types'

export function useUpcomingClasses() {
  return useQuery({
    queryKey:  ['student', 'live-classes', 'upcoming'],
    queryFn:   async () => {
      const { data } = await liveClassApi.upcoming()
      return data.data
    },
    refetchInterval: 60_000, // Refresh every minute
  })
}

export function useTeacherLiveClasses(params = {}) {
  return useQuery({
    queryKey: ['teacher', 'live-classes', params],
    queryFn:  async () => {
      const { data } = await liveClassApi.teacherList(params)
      return data
    },
  })
}

export function useScheduleLiveClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: number; data: LiveClassFormData }) =>
      liveClassApi.schedule(courseId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teacher', 'live-classes'] }),
  })
}

export function useStartClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => liveClassApi.startClass(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['teacher', 'live-classes'] }),
  })
}

export function useEndClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => liveClassApi.endClass(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['teacher', 'live-classes'] }),
  })
}

export function useCancelClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      liveClassApi.cancelClass(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teacher', 'live-classes'] }),
  })
}