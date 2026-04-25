import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMyOrders } from '../../hooks/useOrders'
import type { Order, PaymentStatus } from '../../types/order.types'

const STATUS_STYLES: Record<PaymentStatus, string> = {
  pending:   'bg-amber-100 text-amber-700',
  paid:      'bg-green-100 text-green-700',
  failed:    'bg-red-100 text-red-600',
  refunded:  'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-50 text-red-400',
}

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
    >
      {/* Header row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-semibold text-gray-900 text-sm font-mono">
              {order.order_number}
            </p>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${STATUS_STYLES[order.payment_status]}`}>
              {order.payment_status}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
            {order.items?.length ? ` · ${order.items.length} course${order.items.length !== 1 ? 's' : ''}` : ''}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="font-bold text-primary text-base">{order.total_formatted}</p>
          <p className="text-xs text-gray-400">{order.currency}</p>
        </div>

        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          className="w-4 h-4 text-gray-400 flex-shrink-0"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">

              {/* Items */}
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.course_title}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    ${parseFloat(item.final_price).toFixed(2)}
                  </p>
                </div>
              ))}

              {/* Price breakdown */}
              <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${parseFloat(order.subtotal).toFixed(2)}</span>
                </div>
                {parseFloat(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount {order.coupon ? `(${order.coupon.code})` : ''}</span>
                    <span>-${parseFloat(order.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                {parseFloat(order.tax_amount) > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Tax ({order.tax_rate}%)</span>
                    <span>${parseFloat(order.tax_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
                  <span>Total</span>
                  <span>{order.total_formatted}</span>
                </div>
              </div>

              {/* Payment info */}
              <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                {order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)}
                {order.paid_at && ` · Paid on ${new Date(order.paid_at).toLocaleDateString()}`}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function OrderHistoryPage() {
  const { data, isLoading } = useMyOrders()
  const orders: Order[]     = (data as any)?.data ?? []

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-primary">Order History</h1>
        <p className="text-gray-500 text-sm mt-1">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <svg className="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="text-gray-500 font-semibold mb-2">No Orders Yet</h3>
          <p className="text-gray-400 text-sm">Your purchases will appear here.</p>
        </motion.div>
      )}
    </div>
  )
}