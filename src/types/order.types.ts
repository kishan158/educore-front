export type PaymentMethod  = 'stripe' | 'razorpay' | 'paypal' | 'manual' | 'free'
export type PaymentStatus  = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
export type OrderStatus    = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
export type DiscountType   = 'percent' | 'fixed'

export interface OrderItem {
  id:            number
  course_id:     number
  course_title:  string
  price:         string
  final_price:   string
  thumbnail_url: string | null
}

export interface Order {
  id:               number
  order_number:     string
  subtotal:         string
  discount_amount:  string
  tax_amount:       string
  tax_rate:         string
  total:            string
  total_formatted:  string
  currency:         string
  payment_method:   PaymentMethod
  payment_status:   PaymentStatus
  status:           OrderStatus
  is_paid:          boolean
  paid_at:          string | null
  created_at:       string
  items?:           OrderItem[]
  coupon?:          {
    code:           string
    discount_type:  DiscountType
    discount_value: number
  } | null
}

export interface OrderPreview {
  items:            Array<{
    course_id:      number
    course_title:   string
    price:          number
    final_price:    number
  }>
  subtotal:         number
  discount_amount:  number
  tax_name:         string
  tax_rate:         number
  tax_amount:       number
  total:            number
  currency:         string
  is_free:          boolean
  coupon:           { id: number; code: string } | null
}

export interface Coupon {
  id:                   number
  code:                 string
  description:          string | null
  discount_type:        DiscountType
  discount_value:       string
  max_discount_amount:  string | null
  min_order_amount:     string
  max_uses:             number
  max_uses_per_user:    number
  used_count:           number
  orders_count:         number
  starts_at:            string | null
  expires_at:           string | null
  is_active:            boolean
  is_valid:             boolean
  created_at:           string
}

export interface CouponValidation {
  coupon:           Coupon
  discount_amount:  number
}

export interface Currency {
  id:            number
  code:          string
  name:          string
  symbol:        string
  exchange_rate: string
  is_default:    boolean
  is_active:     boolean
}