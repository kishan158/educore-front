import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useDevices,
  useTrustDevice,
  useRemoveDevice,
  useRemoveAllDevices,
} from '../../hooks/useDevices'
import type { Device } from '../../types/device.types'

function DeviceIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase()
  const isWindows = p.includes('windows')
  const isMac     = p.includes('mac') || p.includes('ios')
  const isAndroid = p.includes('android')
  const isLinux   = p.includes('linux')

  return (
    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {isAndroid || isMac ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        )}
      </svg>
    </div>
  )
}

export default function DevicesPage() {
  const { data, isLoading }   = useDevices()
  const trustMutation         = useTrustDevice()
  const removeMutation        = useRemoveDevice()
  const removeAllMutation     = useRemoveAllDevices()
  const [confirmId, setConfirmId]     = useState<number | null>(null)
  const [confirmAll, setConfirmAll]   = useState(false)

  const devices = data?.data  ?? []
  const limit   = data?.limit ?? 2
  const count   = data?.count ?? 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* ─── Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">Trusted Devices</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage devices that have access to your account.
            </p>
          </div>

          {/* Limit badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
            count >= limit
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-50 text-blue-700'
          }`}>
            <span>{count}</span>
            <span className="text-xs font-normal">/ {limit} devices</span>
          </div>
        </div>

        {/* Limit warning */}
        {count >= limit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl"
          >
            <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-amber-700 text-xs">
              Device limit reached. Remove an existing device to add a new one.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* ─── Device Cards ────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        >
          <AnimatePresence>
            {devices.map((device: Device) => (
              <motion.div
                key={device.id}
                layout
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show:   { opacity: 1, y: 0 },
                }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:border-gray-300 transition"
              >
                {/* Icon */}
                <DeviceIcon platform={device.platform} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {device.device_name}
                    </p>
                    {device.is_trusted && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Trusted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {device.ip_address} · Last active {device.last_active_at}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {! device.is_trusted && (
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => trustMutation.mutate(device.id)}
                      disabled={trustMutation.isPending}
                      className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition"
                    >
                      Trust
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setConfirmId(device.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ─── Empty State ──────────────────────────────────────── */}
      {!isLoading && devices.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400 text-sm">No devices registered yet.</p>
        </motion.div>
      )}

      {/* ─── Remove All ───────────────────────────────────────── */}
      {devices.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 pt-6 border-t border-gray-100"
        >
          <button
            onClick={() => setConfirmAll(true)}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition"
          >
            Remove all devices
          </button>
        </motion.div>
      )}

      {/* ─── Remove Single Modal ─────────────────────────────── */}
      <AnimatePresence>
        {confirmId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Remove Device?</h3>
              <p className="text-gray-500 text-sm mb-6">
                This device will no longer have access to your account. You can log in again to re-register it.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmId(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await removeMutation.mutateAsync(confirmId)
                    setConfirmId(null)
                  }}
                  disabled={removeMutation.isPending}
                  className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-60"
                >
                  {removeMutation.isPending ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Remove All Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {confirmAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setConfirmAll(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Remove All Devices?</h3>
              <p className="text-gray-500 text-sm mb-6">
                All {count} device(s) will be removed. You'll need to log in again on each device.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAll(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await removeAllMutation.mutateAsync()
                    setConfirmAll(false)
                  }}
                  disabled={removeAllMutation.isPending}
                  className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-60"
                >
                  {removeAllMutation.isPending ? 'Removing...' : 'Remove All'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}