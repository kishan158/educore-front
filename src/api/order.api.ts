import api from '../lib/axios'
import type { ApiSuccess }   from '../types/auth.types'
import type {
  Order, OrderPreview, CouponValidation, Coupon
} from '../types/order.types'

// Fix import path
import type { Order as OrderType, OrderPreview as Preview } from '../types/order.types'

export const orderApi = {
  // Student
  preview: (data: {
    course_ids:   number[]
    coupon_code?: string
    currency?:    string
    country?:     string
    state?:       string
  }) =>
    api.post<ApiSuccess<Preview>>('/student/orders/preview', data),

  create: (data: {
    course_ids:      number[]
    payment_method:  string
    coupon_code?:    string
    currency?:       string
    country?:        string
    state?:          string
    billing_info?:   object
  }) =>
    api.post<ApiSuccess<OrderType>>('/student/orders', data),

  myOrders: (params = {}) =>
    api.get<{ success: boolean; data: OrderType[]; meta: any }>(
      '/student/orders', { params }
    ),

  getOrder: (id: number) =>
    api.get<ApiSuccess<OrderType>>(`/student/orders/${id}`),

  validateCoupon: (data: {
    code:        string
    subtotal:    number
    course_ids?: number[]
  }) =>
    api.post<ApiSuccess<CouponValidation>>('/student/coupons/validate', data),

  // Payment
  createStripeIntent: (orderId: number) =>
    api.post('/payments/stripe/intent', { order_id: orderId }),

  verifyRazorpay: (data: object) =>
    api.post('/payments/razorpay/verify', data),

  // Admin
  adminOrders: (params = {}) =>
    api.get<{ success: boolean; data: OrderType[]; meta: any }>(
      '/admin/orders', { params }
    ),

  orderStats: (params = {}) =>
    api.get('/admin/orders/stats', { params }),

  adminCoupons: (params = {}) =>
    api.get<{ success: boolean; data: Coupon[]; meta: any }>(
      '/admin/coupons', { params }
    ),

  createCoupon: (data: Partial<Coupon>) =>
    api.post<ApiSuccess<Coupon>>('/admin/coupons', data),

  updateCoupon: (id: number, data: Partial<Coupon>) =>
    api.put<ApiSuccess<Coupon>>(`/admin/coupons/${id}`, data),

  deleteCoupon: (id: number) =>
    api.delete(`/admin/coupons/${id}`),

  toggleCoupon: (id: number) =>
    api.post<ApiSuccess<Coupon>>(`/admin/coupons/${id}/toggle`),
}