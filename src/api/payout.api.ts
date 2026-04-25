import api from '../lib/axios'
import type { ApiSuccess }                    from '../types/auth.types'
import type { Earning, EarningsSummary, Payout } from '../types/payout.types'

export const payoutApi = {
  // Teacher
  earningSummary: () =>
    api.get<ApiSuccess<EarningsSummary>>('/teacher/earnings/summary'),

  myEarnings: (params = {}) =>
    api.get<{ success: boolean; data: Earning[]; meta: any }>(
      '/teacher/earnings', { params }
    ),

  pendingEarnings: () =>
    api.get<ApiSuccess<{ earnings: Earning[]; total_pending: number }>>(
      '/teacher/earnings/pending'
    ),

  requestPayout: (data: {
    method:           string
    account_details:  Record<string, string>
    notes?:           string
  }) =>
    api.post<ApiSuccess<Payout>>('/teacher/payouts/request', data),

  myPayouts: (params = {}) =>
    api.get<{ success: boolean; data: Payout[]; meta: any }>(
      '/teacher/payouts', { params }
    ),

  // Admin
  adminPayouts: (params = {}) =>
    api.get<{ success: boolean; data: Payout[]; meta: any }>(
      '/admin/payouts', { params }
    ),

  approvePayout: (id: number) =>
    api.post<ApiSuccess<Payout>>(`/admin/payouts/${id}/approve`),

  markPaid: (id: number, reference: string) =>
    api.post<ApiSuccess<Payout>>(`/admin/payouts/${id}/mark-paid`, { reference }),

  rejectPayout: (id: number, reason: string) =>
    api.post<ApiSuccess<Payout>>(`/admin/payouts/${id}/reject`, { reason }),

  payoutStats: () =>
    api.get('/admin/payouts/stats'),
}