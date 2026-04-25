import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { monitorApi } from '../api/monitor.api'

export function useErrorLogs(params = {}) {
  return useQuery({
    queryKey: ['admin', 'errors', params],
    queryFn:  async () => {
      const { data } = await monitorApi.errorLogs(params)
      return data
    },
  })
}

export function useErrorStats() {
  return useQuery({
    queryKey:        ['admin', 'errors', 'stats'],
    queryFn:         async () => {
      const { data } = await monitorApi.errorStats()
      return data.data
    },
    refetchInterval: 60_000,
  })
}

export function useResolveError() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) =>
      monitorApi.resolveError(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'errors'] })
    },
  })
}

export function useDeleteError() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: monitorApi.deleteError,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'errors'] }),
  })
}

export function useBulkResolve() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: monitorApi.bulkResolve,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'errors'] }),
  })
}

export function useHealthReport() {
  return useQuery({
    queryKey:        ['admin', 'monitor', 'health'],
    queryFn:         async () => {
      const { data } = await monitorApi.currentMetrics()
      return data.data
    },
    refetchInterval: 15_000,
  })
}

export function useMetricHistory(hours = 24) {
  return useQuery({
    queryKey: ['admin', 'monitor', 'history', hours],
    queryFn:  async () => {
      const { data } = await monitorApi.metricHistory(hours)
      return data.data
    },
    refetchInterval: 60_000,
  })
}