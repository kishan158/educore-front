import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { payoutApi } from '../api/payout.api'

export function useEarningSummary() {
  return useQuery({
    queryKey: ['teacher', 'earnings', 'summary'],
    queryFn:  async () => {
      const { data } = await payoutApi.earningSummary()
      return data.data
    },
  })
}

export function useMyEarnings(params = {}) {
  return useQuery({
    queryKey: ['teacher', 'earnings', params],
    queryFn:  async () => {
      const { data } = await payoutApi.myEarnings(params)
      return data
    },
  })
}

export function usePendingEarnings() {
  return useQuery({
    queryKey: ['teacher', 'earnings', 'pending'],
    queryFn:  async () => {
      const { data } = await payoutApi.pendingEarnings()
      return data.data
    },
  })
}

export function useRequestPayout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: payoutApi.requestPayout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher', 'earnings'] })
      qc.invalidateQueries({ queryKey: ['teacher', 'payouts'] })
    },
  })
}

export function useMyPayouts() {
  return useQuery({
    queryKey: ['teacher', 'payouts'],
    queryFn:  async () => {
      const { data } = await payoutApi.myPayouts()
      return data
    },
  })
}

export function useAdminPayouts(params = {}) {
  return useQuery({
    queryKey: ['admin', 'payouts', params],
    queryFn:  async () => {
      const { data } = await payoutApi.adminPayouts(params)
      return data
    },
  })
}

export function useApprovePayout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: payoutApi.approvePayout,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'payouts'] }),
  })
}

export function useMarkPaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reference }: { id: number; reference: string }) =>
      payoutApi.markPaid(id, reference),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'payouts'] }),
  })
}

export function useRejectPayout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      payoutApi.rejectPayout(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'payouts'] }),
  })
}