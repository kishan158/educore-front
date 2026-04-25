import { useState }            from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useErrorLogs, useErrorStats,
  useResolveError, useDeleteError, useBulkResolve,
} from '../../hooks/useMonitor'
import type { ErrorLevel, ErrorLogItem } from '../../types/monitor.types'

const LEVEL_STYLES: Record<ErrorLevel, { bg: string; text: string; dot: string }> = {
  debug:    { bg: 'bg-gray-100',   text: 'text-gray-600',  dot: 'bg-gray-400'   },
  info:     { bg: 'bg-blue-100',   text: 'text-blue-700',  dot: 'bg-blue-500'   },
  warning:  { bg: 'bg-amber-100',  text: 'text-amber-700', dot: 'bg-amber-500'  },
  error:    { bg: 'bg-red-100',    text: 'text-red-600',   dot: 'bg-red-500'    },
  critical: { bg: 'bg-red-200',    text: 'text-red-800',   dot: 'bg-red-700'    },
}

function ErrorDetailModal({ error, onClose, onResolve }: {
  error:     ErrorLogItem
  onClose:   () => void
  onResolve: (id: number, note: string) => void
}) {
  const [note, setNote] = useState('')
  const style = LEVEL_STYLES[error.level]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-gray-100">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase ${style.bg} ${style.text}`}>
            {error.level}
          </span>
          <p className="flex-1 text-sm font-semibold text-gray-900 leading-snug">{error.message}</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'URL',         value: error.url     ?? '—' },
              { label: 'Method',      value: error.method  ?? '—' },
              { label: 'IP',          value: error.ip_address ?? '—' },
              { label: 'User',        value: error.user?.name ?? 'Anonymous' },
              { label: 'File',        value: error.file ? `${error.file}:${error.line}` : '—' },
              { label: 'Environment', value: error.environment },
              { label: 'When',        value: error.created_at },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                <p className="text-xs font-mono font-medium text-gray-700 truncate">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Stack trace */}
          {error.stack_trace && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Stack Trace</p>
              <pre className="bg-gray-900 text-gray-200 text-xs p-4 rounded-xl overflow-x-auto leading-relaxed font-mono">
                {error.stack_trace.slice(0, 3000)}
                {error.stack_trace.length > 3000 && '\n... (truncated)'}
              </pre>
            </div>
          )}

          {/* Context */}
          {error.context && Object.keys(error.context).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Context</p>
              <pre className="bg-gray-50 text-gray-700 text-xs p-4 rounded-xl overflow-x-auto font-mono">
                {JSON.stringify(error.context, null, 2)}
              </pre>
            </div>
          )}

          {/* Resolution note */}
          {error.resolution_note && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-green-700 mb-1">Resolution Note</p>
              <p className="text-sm text-green-800">{error.resolution_note}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!error.is_resolved && (
          <div className="p-5 border-t border-gray-100 space-y-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Resolution note (optional)..."
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
            />
            <button
              onClick={() => { onResolve(error.id, note); onClose() }}
              className="w-full py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition"
            >
              Mark as Resolved
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function ErrorLogsPage() {
  const [filters, setFilters]     = useState<{ level?: string; is_resolved?: boolean; search?: string }>({})
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [detailLog, setDetailLog] = useState<ErrorLogItem | null>(null)

  const { data, isLoading } = useErrorLogs(filters)
  const { data: stats }     = useErrorStats()
  const resolveMutation     = useResolveError()
  const deleteMutation      = useDeleteError()
  const bulkMutation        = useBulkResolve()

  const logs: ErrorLogItem[] = (data as any)?.data ?? []

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    setSelectedIds(selectedIds.length === logs.length ? [] : logs.map(l => l.id))
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-primary">Error Logs</h1>
          <p className="text-gray-500 text-sm mt-1">
            {stats?.total_unresolved ?? 0} unresolved errors
          </p>
        </div>

        {selectedIds.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => { bulkMutation.mutate(selectedIds); setSelectedIds([]) }}
            disabled={bulkMutation.isPending}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition"
          >
            Resolve {selectedIds.length} selected
          </motion.button>
        )}
      </motion.div>

      {/* Error Level Summary */}
      {stats && (
        <div className="flex gap-3 flex-wrap">
          {Object.entries(LEVEL_STYLES).map(([level, style]) => {
            const count = stats.by_level[level] ?? 0
            return (
              <button
                key={level}
                onClick={() => setFilters(f => ({
                  ...f,
                  level: f.level === level ? undefined : level
                }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition text-sm font-medium ${
                  filters.level === level
                    ? `${style.bg} ${style.text} border-current`
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                {level.charAt(0).toUpperCase() + level.slice(1)}
                <span className="font-bold">{count}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            placeholder="Search errors, URLs, files..."
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value || undefined }))}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
          />
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {[
            { val: undefined, label: 'All' },
            { val: false,     label: 'Unresolved' },
            { val: true,      label: 'Resolved' },
          ].map((opt) => (
            <button
              key={String(opt.val)}
              onClick={() => setFilters(f => ({ ...f, is_resolved: opt.val }))}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                filters.is_resolved === opt.val
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider items-center">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedIds.length === logs.length && logs.length > 0}
              onChange={toggleAll}
              className="rounded"
            />
          </div>
          <div className="col-span-1">Level</div>
          <div className="col-span-5">Message</div>
          <div className="col-span-2">URL</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {isLoading && (
          <div className="p-6 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        )}

        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.03 } } }}
          initial="hidden"
          animate="show"
        >
          {logs.map((log) => {
            const style = LEVEL_STYLES[log.level]
            return (
              <motion.div
                key={log.id}
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                className={`grid grid-cols-12 gap-2 px-5 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition items-center ${
                  log.is_resolved ? 'opacity-50' : ''
                }`}
              >
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(log.id)}
                    onChange={() => toggleSelect(log.id)}
                    className="rounded"
                    disabled={log.is_resolved}
                  />
                </div>

                <div className="col-span-1">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold rounded-full ${style.bg} ${style.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    {log.level}
                  </span>
                </div>

                <div className="col-span-5 cursor-pointer" onClick={() => setDetailLog(log)}>
                  <p className="text-sm text-gray-900 truncate font-medium hover:text-accent transition">
                    {log.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {log.created_human}
                    {log.file && ` · ${log.file.split('/').pop()}:${log.line}`}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-xs text-gray-500 truncate font-mono">{log.url ?? '—'}</p>
                </div>

                <div className="col-span-1">
                  <span className={`text-xs font-medium ${log.is_resolved ? 'text-green-600' : 'text-gray-400'}`}>
                    {log.is_resolved ? '✓ Resolved' : 'Open'}
                  </span>
                </div>

                <div className="col-span-2 flex items-center justify-end gap-1.5">
                  {!log.is_resolved && (
                    <button
                      onClick={() => resolveMutation.mutate({ id: log.id, note: '' })}
                      disabled={resolveMutation.isPending}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Resolve"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => setDetailLog(log)}
                    className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition"
                    title="View details"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(log.id)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {!isLoading && logs.length === 0 && (
          <div className="py-16 text-center">
            <svg className="w-12 h-12 mx-auto text-green-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-400">
              {filters.is_resolved === false ? 'No unresolved errors!' : 'No error logs found.'}
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailLog && (
          <ErrorDetailModal
            error={detailLog}
            onClose={() => setDetailLog(null)}
            onResolve={(id, note) => resolveMutation.mutate({ id, note })}
          />
        )}
      </AnimatePresence>
    </div>
  )
}