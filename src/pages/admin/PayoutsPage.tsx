import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useAdminPayouts,
  useApprovePayout,
  useMarkPaid,
  useRejectPayout,
} from '../../hooks/usePayouts'
import type { Payout, PayoutStatus } from '../../types/payout.types'

const STATUS_STYLES: Record<PayoutStatus, string> = {
  pending:    'bg-amber-100 text-amber-700',
  approved:   'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-600',
  paid:       'bg-green-100 text-green-700',
  rejected:   'bg-red-100 text-red-600',
}

export default function PayoutsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [actionPayout, setActionPayout] = useState<{ payout: Payout; action: 'approve' | 'paid' | 'reject' } | null>(null)
  const [referenceInput, setReferenceInput] = useState('')
  const [rejectReason,   setRejectReason]   = useState('')

  const { data, isLoading } = useAdminPayouts(statusFilter ? { status: statusFilter } : {})
  const approveMutation     = useApprovePayout()
  const markPaidMutation    = useMarkPaid()
  const rejectMutation      = useRejectPayout()

  const payouts: Payout[] = (data as any)?.data ?? []

  const handleAction = async () => {
    if (!actionPayout) return
    const { payout, action } = actionPayout

    if (action === 'approve') {
      await approveMutation.mutateAsync(payout.id)
    } else if (action === 'paid') {
      await markPaidMutation.mutateAsync({ id: payout.id, reference: referenceInput })
    } else if (action === 'reject') {
      await rejectMutation.mutateAsync({ id: payout.id, reason: rejectReason })
    }

    setActionPayout(null)
    setReferenceInput('')
    setRejectReason('')
  }

  const isPending = approveMutation.isPending || markPaidMutation.isPending || rejectMutation.isPending

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-primary">Payout Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          {payouts.length} payout{payouts.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: '',           label: 'All' },
          { value: 'pending',    label: 'Pending' },
          { value: 'approved',   label: 'Approved' },
          { value: 'paid',       label: 'Paid' },
          { value: 'rejected',   label: 'Rejected' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl border-2 transition ${
              statusFilter === opt.value
                ? 'border-primary bg-primary text-white'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-3">Teacher</div>
          <div className="col-span-2">Payout #</div>
          <div className="col-span-1 text-right">Amount</div>
          <div className="col-span-2">Method</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {isLoading && (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        )}

        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
          initial="hidden"
          animate="show"
        >
          {payouts.map((payout) => (
            <motion.div
              key={payout.id}
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              className="grid grid-cols-12 gap-2 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition items-center"
            >
              <div className="col-span-3">
                <p className="text-sm font-semibold text-gray-900">{payout.teacher?.name}</p>
                <p className="text-xs text-gray-400">{payout.teacher?.email}</p>
              </div>

              <div className="col-span-2">
                <span className="font-mono text-xs text-primary">{payout.payout_number}</span>
              </div>

              <div className="col-span-1 text-right">
                <span className="font-bold text-primary text-sm">
                  ${parseFloat(payout.amount).toFixed(2)}
                </span>
              </div>

              <div className="col-span-2 text-sm text-gray-600 capitalize">
                {payout.method.replace('_', ' ')}
              </div>

              <div className="col-span-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${STATUS_STYLES[payout.status]}`}>
                  {payout.status}
                </span>
              </div>

              <div className="col-span-2 flex items-center justify-end gap-1.5">
                {payout.status === 'pending' && (
                  <>
                    <button
                      onClick={() => setActionPayout({ payout, action: 'approve' })}
                      className="px-3 py-1.5 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setActionPayout({ payout, action: 'reject' })}
                      className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    >
                      Reject
                    </button>
                  </>
                )}

                {payout.status === 'approved' && (
                  <button
                    onClick={() => setActionPayout({ payout, action: 'paid' })}
                    className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                  >
                    Mark Paid
                  </button>
                )}

                {payout.status === 'paid' && payout.reference && (
                  <span className="text-xs text-green-600 font-mono">
                    {payout.reference}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {!isLoading && payouts.length === 0 && (
          <div className="py-16 text-center text-gray-400 text-sm">
            No payouts found.
          </div>
        )}
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {actionPayout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setActionPayout(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              {actionPayout.action === 'approve' && (
                <>
                  <h3 className="text-lg font-bold text-primary mb-1">Approve Payout?</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Approve payout of <strong>${parseFloat(actionPayout.payout.amount).toFixed(2)}</strong> for{' '}
                    <strong>{actionPayout.payout.teacher?.name}</strong>?
                  </p>
                </>
              )}

              {actionPayout.action === 'paid' && (
                <>
                  <h3 className="text-lg font-bold text-primary mb-1">Mark as Paid</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Enter the bank/transaction reference number.
                  </p>
                  <input
                    value={referenceInput}
                    onChange={(e) => setReferenceInput(e.target.value)}
                    placeholder="e.g. TXN123456789"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 mb-4 font-mono"
                  />
                </>
              )}

              {actionPayout.action === 'reject' && (
                <>
                  <h3 className="text-lg font-bold text-primary mb-1">Reject Payout</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Provide a reason for rejection.
                  </p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="e.g. Incorrect bank details provided..."
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 mb-4 resize-none"
                  />
                </>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setActionPayout(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={
                    isPending ||
                    (actionPayout.action === 'paid'   && !referenceInput.trim()) ||
                    (actionPayout.action === 'reject' && !rejectReason.trim())
                  }
                  className={`flex-1 py-2.5 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 ${
                    actionPayout.action === 'reject'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {isPending ? 'Processing...' :
                    actionPayout.action === 'approve' ? 'Approve' :
                    actionPayout.action === 'paid'    ? 'Confirm Paid' :
                    'Reject'
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}