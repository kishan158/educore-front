import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useAdminCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  useToggleCoupon,
} from '../../hooks/useOrders'
import type { Coupon } from '../../types/order.types'

const schema = z.object({
  code:            z.string().min(3).max(50),
  description:     z.string().optional(),
  discount_type:   z.enum(['percent', 'fixed']),
  discount_value:  z.number().min(0.01),
  min_order_amount:z.number().min(0).optional(),
  max_uses:        z.number().min(0).optional(),
  expires_at:      z.string().optional(),
  is_active:       z.boolean().optional(),
})
type CouponFormValues = z.infer<typeof schema>

function CouponModal({
  coupon,
  onClose,
}: {
  coupon?: Coupon | null
  onClose: () => void
}) {
  const isEdit        = !!coupon
  const createMutation = useCreateCoupon()
  const updateMutation = useUpdateCoupon()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CouponFormValues>({
    resolver:     zodResolver(schema),
    defaultValues: {
      code:            coupon?.code            ?? '',
      description:     coupon?.description     ?? '',
      discount_type:   coupon?.discount_type   ?? 'percent',
      discount_value:  parseFloat(coupon?.discount_value ?? '0'),
      min_order_amount:parseFloat(coupon?.min_order_amount ?? '0'),
      max_uses:        coupon?.max_uses        ?? 0,
      expires_at:      coupon?.expires_at?.slice(0, 16) ?? '',
      is_active:       coupon?.is_active ?? true,
    },
  })

  const discountType = watch('discount_type')

  const onSubmit = async (data: CouponFormValues) => {
    const payload = {
      ...data,
      code:          data.code.toUpperCase(),
      expires_at:    data.expires_at || undefined,
    }

    if (isEdit && coupon) {
      await updateMutation.mutateAsync({ id: coupon.id, data: payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    onClose()
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <h3 className="text-lg font-bold text-primary mb-5">
          {isEdit ? 'Edit Coupon' : 'Create Coupon'}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Coupon Code
              </label>
              <input
                {...register('code')}
                placeholder="WELCOME20"
                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 font-mono uppercase ${errors.code ? 'border-red-400' : 'border-gray-200'}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Type
              </label>
              <select
                {...register('discount_type')}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {discountType === 'percent' ? '%' : '$'}
                </span>
                <input
                  {...register('discount_value', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min={0}
                  className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Min Order ($)
              </label>
              <input
                {...register('min_order_amount', { valueAsNumber: true })}
                type="number" step="0.01" min={0}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Max Uses (0=∞)
              </label>
              <input
                {...register('max_uses', { valueAsNumber: true })}
                type="number" min={0}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Expiry Date
              </label>
              <input
                {...register('expires_at')}
                type="datetime-local"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Description
              </label>
              <input
                {...register('description')}
                placeholder="20% off for new students"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-60"
            >
              {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function CouponsPage() {
  const { data, isLoading }  = useAdminCoupons()
  const toggleMutation       = useToggleCoupon()
  const deleteMutation       = useDeleteCoupon()

  const [editTarget,   setEditTarget]   = useState<Coupon | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)

  const coupons: Coupon[] = (data as any)?.data ?? []
  const showModal         = editTarget !== undefined

  return (
    <div className="p-6 max-w-5xl mx-auto">

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-primary">Coupons</h1>
          <p className="text-gray-500 text-sm mt-1">{coupons.length} total coupons</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setEditTarget(null)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Coupon
        </motion.button>
      </motion.div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-2">Code</div>
          <div className="col-span-2">Discount</div>
          <div className="col-span-2">Usage</div>
          <div className="col-span-2">Min Order</div>
          <div className="col-span-2">Expires</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {isLoading && (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        )}

        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
          initial="hidden"
          animate="show"
        >
          {coupons.map((coupon) => (
            <motion.div
              key={coupon.id}
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              className="grid grid-cols-12 gap-2 px-5 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition items-center"
            >
              <div className="col-span-2">
                <span className="font-mono text-sm font-bold text-primary">{coupon.code}</span>
              </div>

              <div className="col-span-2">
                <span className={`text-sm font-semibold ${
                  coupon.discount_type === 'percent' ? 'text-blue-700' : 'text-green-700'
                }`}>
                  {coupon.discount_type === 'percent'
                    ? `${coupon.discount_value}%`
                    : `$${parseFloat(coupon.discount_value).toFixed(2)}`
                  }
                </span>
              </div>

              <div className="col-span-2 text-sm text-gray-600">
                {coupon.used_count}
                {coupon.max_uses > 0 ? ` / ${coupon.max_uses}` : ' / ∞'}
              </div>

              <div className="col-span-2 text-sm text-gray-500">
                ${parseFloat(coupon.min_order_amount).toFixed(2)}
              </div>

              <div className="col-span-2 text-xs text-gray-400">
                {coupon.expires_at
                  ? new Date(coupon.expires_at).toLocaleDateString()
                  : 'No expiry'
                }
              </div>

              <div className="col-span-1">
                <button
                  onClick={() => toggleMutation.mutate(coupon.id)}
                  className={`w-8 h-4 rounded-full relative transition ${
                    coupon.is_active ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                    coupon.is_active ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="col-span-1 flex items-center justify-end gap-1">
                <button
                  onClick={() => setEditTarget(coupon)}
                  className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setDeleteTarget(coupon)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {!isLoading && coupons.length === 0 && (
          <div className="py-16 text-center text-gray-400 text-sm">No coupons created yet.</div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <CouponModal
            coupon={editTarget ?? undefined}
            onClose={() => setEditTarget(undefined)}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Coupon?</h3>
              <p className="text-gray-500 text-sm mb-6">
                Coupon <strong className="font-mono">{deleteTarget.code}</strong> will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await deleteMutation.mutateAsync(deleteTarget.id)
                    setDeleteTarget(null)
                  }}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-60"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}