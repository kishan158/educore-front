import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm }                 from 'react-hook-form'
import {
  useEarningSummary,
  useMyEarnings,
  usePendingEarnings,
  useRequestPayout,
  useMyPayouts,
} from '../../hooks/usePayouts'
import type { Payout, PayoutStatus } from '../../types/payout.types'

const PAYOUT_STATUS_STYLES: Record<PayoutStatus, string> = {
  pending:    'bg-amber-100 text-amber-700',
  approved:   'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-600',
  paid:       'bg-green-100 text-green-700',
  rejected:   'bg-red-100 text-red-600',
}

function SummaryCard({ label, amount, color }: {
  label:  string
  amount: number
  color:  string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl p-5"
    >
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className={`text-2xl font-bold ${color}`}>
        ${amount.toFixed(2)}
      </p>
    </motion.div>
  )
}

export default function EarningsPage() {
  const [showPayoutForm, setShowPayoutForm] = useState(false)
  const [method, setMethod]               = useState('bank_transfer')
  const [activeTab, setActiveTab]         = useState<'earnings' | 'payouts'>('earnings')

  const { data: summary }  = useEarningSummary()
  const { data: pending }  = usePendingEarnings()
  const { data: earnings } = useMyEarnings()
  const { data: payouts }  = useMyPayouts()
  const requestMutation    = useRequestPayout()

  const { register, handleSubmit, formState: { errors } } = useForm()

  const earningsList: any[] = (earnings as any)?.data ?? []
  const payoutsList: Payout[] = (payouts as any)?.data ?? []
  const pendingAmount         = pending?.total_pending ?? 0

  const onSubmitPayout = async (data: any) => {
    await requestMutation.mutateAsync({
      method,
      account_details: data.account_details,
      notes: data.notes,
    })
    setShowPayoutForm(false)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Earnings & Payouts</h1>
        <p className="text-gray-500 text-sm mt-1">Track your revenue and request payouts</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Total Earned"    amount={summary?.total_earned    ?? 0} color="text-primary" />
        <SummaryCard label="Pending Payout"  amount={summary?.total_pending   ?? 0} color="text-amber-600" />
        <SummaryCard label="In Processing"   amount={summary?.total_in_payout ?? 0} color="text-blue-600" />
        <SummaryCard label="Total Paid Out"  amount={summary?.total_paid      ?? 0} color="text-green-600" />
      </div>

      {/* Request Payout CTA */}
      {pendingAmount >= 10 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-primary to-accent p-5 rounded-2xl mb-6 flex items-center justify-between"
        >
          <div>
            <p className="text-white font-bold text-lg">${pendingAmount.toFixed(2)} available</p>
            <p className="text-white/70 text-sm">Ready to withdraw your earnings</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowPayoutForm(true)}
            className="px-5 py-2.5 bg-white text-primary text-sm font-bold rounded-xl hover:bg-white/90 transition"
          >
            Request Payout
          </motion.button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {[
          { key: 'earnings', label: 'Earnings' },
          { key: 'payouts',  label: 'Payout History' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === tab.key
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Earnings Tab */}
      {activeTab === 'earnings' && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">Course</div>
            <div className="col-span-2">Order</div>
            <div className="col-span-2 text-right">Gross</div>
            <div className="col-span-2 text-right">Commission</div>
            <div className="col-span-1 text-right">Net</div>
            <div className="col-span-1 text-center">Status</div>
          </div>

          {earningsList.map((earning) => (
            <div
              key={earning.id}
              className="grid grid-cols-12 gap-2 px-5 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition items-center"
            >
              <div className="col-span-4 text-sm font-medium text-gray-800 truncate">
                {earning.course?.title ?? '—'}
              </div>
              <div className="col-span-2 text-xs text-gray-400 font-mono">
                {earning.order?.order_number ?? '—'}
              </div>
              <div className="col-span-2 text-sm text-right text-gray-700">
                ${parseFloat(earning.gross_amount).toFixed(2)}
              </div>
              <div className="col-span-2 text-sm text-right text-gray-500">
                {earning.commission_rate}%
              </div>
              <div className="col-span-1 text-sm font-bold text-right text-primary">
                ${parseFloat(earning.net_amount).toFixed(2)}
              </div>
              <div className="col-span-1 flex justify-center">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  earning.status === 'paid'     ? 'bg-green-100 text-green-700' :
                  earning.status === 'in_payout'? 'bg-blue-100 text-blue-700'  :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {earning.status}
                </span>
              </div>
            </div>
          ))}

          {earningsList.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">
              No earnings yet. Start selling courses!
            </div>
          )}
        </div>
      )}

      {/* Payouts Tab */}
      {activeTab === 'payouts' && (
        <div className="space-y-3">
          {payoutsList.map((payout) => (
            <div key={payout.id} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-primary">
                      {payout.payout_number}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${PAYOUT_STATUS_STYLES[payout.status]}`}>
                      {payout.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {payout.method.replace('_', ' ')} ·{' '}
                    Requested {new Date(payout.requested_at).toLocaleDateString()}
                    {payout.paid_at && ` · Paid ${new Date(payout.paid_at).toLocaleDateString()}`}
                  </p>
                  {payout.rejection_reason && (
                    <p className="text-xs text-red-500 mt-1">
                      Rejected: {payout.rejection_reason}
                    </p>
                  )}
                  {payout.reference && (
                    <p className="text-xs text-green-600 mt-1 font-mono">
                      Ref: {payout.reference}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">
                    ${parseFloat(payout.amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">{payout.currency}</p>
                </div>
              </div>
            </div>
          ))}

          {payoutsList.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">
              No payout history yet.
            </div>
          )}
        </div>
      )}

      {/* Request Payout Modal */}
      <AnimatePresence>
        {showPayoutForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setShowPayoutForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-lg font-bold text-primary mb-1">Request Payout</h3>
              <p className="text-gray-500 text-sm mb-5">
                Available balance: <strong className="text-primary">${pendingAmount.toFixed(2)}</strong>
              </p>

              <form onSubmit={handleSubmit(onSubmitPayout)} className="space-y-4">

                {/* Method */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Payout Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'bank_transfer', label: 'Bank Transfer' },
                      { id: 'paypal',        label: 'PayPal' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        className={`py-2.5 text-sm font-medium border-2 rounded-xl transition ${
                          method === m.id
                            ? 'border-accent bg-accent/5 text-accent'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bank Transfer fields */}
                {method === 'bank_transfer' && (
                  <>
                    {[
                      { name: 'account_details.account_name',   label: 'Account Holder Name', placeholder: 'Your full name' },
                      { name: 'account_details.account_number', label: 'Account Number',       placeholder: 'XXXX XXXX XXXX' },
                      { name: 'account_details.bank_name',      label: 'Bank Name',            placeholder: 'Your bank name' },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                          {field.label}
                        </label>
                        <input
                          {...register(field.name, { required: true })}
                          placeholder={field.placeholder}
                          className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
                        />
                      </div>
                    ))}
                  </>
                )}

                {/* PayPal */}
                {method === 'paypal' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      PayPal Email
                    </label>
                    <input
                      {...register('account_details.paypal_email', { required: true })}
                      type="email"
                      placeholder="your@paypal.com"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Notes (Optional)
                  </label>
                  <input
                    {...register('notes')}
                    placeholder="Any additional notes..."
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPayoutForm(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestMutation.isPending}
                    className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-60"
                  >
                    {requestMutation.isPending ? 'Submitting...' : `Request $${pendingAmount.toFixed(2)}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}