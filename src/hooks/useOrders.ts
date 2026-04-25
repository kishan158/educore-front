import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderApi } from '../api/order.api'

export function useMyOrders(params = {}) {
  return useQuery({
    queryKey: ['student', 'orders', params],
    queryFn:  async () => {
      const { data } = await orderApi.myOrders(params)
      return data
    },
  })
}

export function useOrderPreview() {
  return useMutation({
    mutationFn: orderApi.preview,
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: orderApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student', 'orders'] })
      qc.invalidateQueries({ queryKey: ['student', 'enrollments'] })
    },
  })
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: orderApi.validateCoupon,
  })
}

export function useAdminOrders(params = {}) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn:  async () => {
      const { data } = await orderApi.adminOrders(params)
      return data
    },
  })
}

export function useAdminCoupons(params = {}) {
  return useQuery({
    queryKey: ['admin', 'coupons', params],
    queryFn:  async () => {
      const { data } = await orderApi.adminCoupons(params)
      return data
    },
  })
}

export function useCreateCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: orderApi.createCoupon,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  })
}

export function useUpdateCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      orderApi.updateCoupon(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  })
}

export function useDeleteCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: orderApi.deleteCoupon,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  })
}

export function useToggleCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: orderApi.toggleCoupon,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  })
}