import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useOrderPreview,
  useCreateOrder,
  useValidateCoupon,
} from '../../hooks/useOrders'
import type { OrderPreview } from '../../types/order.types'

const CURRENCIES = [
  { code: 'USD', symbol: '$',  label: 'USD' },
  { code: 'INR', symbol: '₹', label: 'INR' },
  { code: 'EUR', symbol: '€', label: 'EUR' },
  { code: 'GBP', symbol: '£', label: 'GBP' },
]

export default function CheckoutPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const courseIds: number[] = (location.state as any)?.courseIds ?? []

  const [currency,    setCurrency]    = useState('USD')
  const [couponCode,  setCouponCode]  = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [country,     setCountry]     = useState('')
  const [preview,     setPreview]     = useState<OrderPreview | null>(null)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState(false)

  const previewMutation       = useOrderPreview()
  const createOrderMutation   = useCreateOrder()
  const validateCouponMutation = useValidateCoupon()

  // Auto-preview on mount + when key params change
  useEffect(() => {
    if (courseIds.length === 0) return
    loadPreview()
  }, [currency, couponCode, country])

  const loadPreview = async () => {
    try {
      const res = await previewMutation.mutateAsync({
        course_ids:   courseIds,
        currency,
        coupon_code:  couponCode,
        country,
      })
      setPreview(res.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load preview.')
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponInput.trim() || !preview) return
    try {
      const res = await validateCouponMutation.mutateAsync({
        code:       couponInput.trim(),
        subtotal:   preview.subtotal,
        course_ids: courseIds,
      })
      setCouponCode(couponInput.trim())
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.errors?.coupon?.[0] ?? 'Invalid coupon.')
    }
  }

  const handleOrder = async (method: string) => {
    setError('')
    try {
      await createOrderMutation.mutateAsync({
        course_ids:     courseIds,
        payment_method: method,
        currency,
        coupon_code:    couponCode,
        country,
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Order failed.')
    }
  }

  if (courseIds.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No courses selected for checkout.</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold"
          >
            Browse Courses
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-green-200 rounded-3xl p-10 text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5"
          >
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Enrollment Successful!</h2>
          <p className="text-gray-500 text-sm mb-6">
            You are now enrolled. Start learning right away!
          </p>
          <button
            onClick={() => navigate('/student/courses')}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition"
          >
            Go to My Courses
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-primary">Checkout</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left — Order form */}
          <div className="lg:col-span-3 space-y-4">

            {/* Currency */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Currency</h3>
              <div className="flex gap-2 flex-wrap">
                {CURRENCIES.map((cur) => (
                  <button
                    key={cur.code}
                    onClick={() => setCurrency(cur.code)}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl border-2 transition ${
                      currency === cur.code
                        ? 'border-accent bg-accent/5 text-accent'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {cur.symbol} {cur.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Country for tax */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Country (for tax calculation)</h3>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
              >
                <option value="">Select country</option>
                <option value="US">United States</option>
                <option value="IN">India</option>
                <option value="GB">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="AE">UAE</option>
              </select>
            </div>

            {/* Coupon */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Coupon Code</h3>
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="WELCOME20"
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 font-mono uppercase"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={validateCouponMutation.isPending || !couponInput}
                  className="px-4 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent/90 transition disabled:opacity-60"
                >
                  {validateCouponMutation.isPending ? '...' : 'Apply'}
                </button>
              </div>

              <AnimatePresence>
                {couponCode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 flex items-center gap-2 text-green-700 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Coupon <strong>{couponCode}</strong> applied!
                    <button
                      onClick={() => { setCouponCode(''); setCouponInput('') }}
                      className="ml-auto text-xs text-gray-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Payment method */}
            {preview && !preview.is_free && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-4">Payment Method</h3>
                <div className="space-y-3">
                  {[
                    { id: 'stripe',   label: 'Credit / Debit Card', sub: 'Visa, Mastercard, Amex', icon: '💳' },
                    { id: 'razorpay', label: 'Razorpay',            sub: 'UPI, Netbanking, Cards', icon: '🇮🇳' },
                    { id: 'paypal',   label: 'PayPal',              sub: 'PayPal balance or card',  icon: '🅿' },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => handleOrder(pm.id)}
                      disabled={createOrderMutation.isPending}
                      className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-accent hover:bg-accent/5 text-left transition disabled:opacity-60"
                    >
                      <span className="text-2xl" style={{ fontSize: '24px' }}>{pm.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{pm.label}</p>
                        <p className="text-xs text-gray-400">{pm.sub}</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Right — Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-6">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Order Summary</h3>

              {previewMutation.isPending ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : preview ? (
                <>
                  {/* Items */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                    {preview.items.map((item) => (
                      <div key={item.course_id} className="flex items-start justify-between gap-2">
                        <p className="text-xs text-gray-600 flex-1 leading-relaxed">
                          {item.course_title}
                        </p>
                        <p className="text-xs font-semibold text-gray-900 flex-shrink-0">
                          ${item.final_price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${preview.subtotal.toFixed(2)}</span>
                    </div>

                    {preview.discount_amount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Discount ({couponCode})</span>
                        <span>-${preview.discount_amount.toFixed(2)}</span>
                      </div>
                    )}

                    {preview.tax_amount > 0 && (
                      <div className="flex justify-between text-gray-500">
                        <span>{preview.tax_name} ({preview.tax_rate}%)</span>
                        <span>${preview.tax_amount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center py-3 border-t border-gray-100">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-primary">
                      {currency} {preview.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Free order CTA */}
                  {preview.is_free && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOrder('free')}
                      disabled={createOrderMutation.isPending}
                      className="w-full mt-4 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-60"
                    >
                      {createOrderMutation.isPending ? 'Enrolling...' : 'Enroll for Free'}
                    </motion.button>
                  )}

                  {/* Security notice */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secure checkout · 30-day refund policy
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-gray-400 text-sm">
                  Loading order details...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}