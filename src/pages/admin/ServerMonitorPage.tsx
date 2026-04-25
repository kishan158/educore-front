import { useState }             from 'react'
import { motion }               from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useHealthReport, useMetricHistory } from '../../hooks/useMonitor'
import type { ServerStatus } from '../../types/monitor.types'

// ─── Gauge ring ───────────────────────────────────────────────────
function GaugeRing({
  value, label, color, size = 80,
}: {
  value:  number
  label:  string
  color:  string
  size?:  number
}) {
  const r    = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const off  = circ - (value / 100) * circ

  const statusColor =
    value > 90 ? '#EF4444' :
    value > 70 ? '#F59E0B' :
    color

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#F1F5F9" strokeWidth="6"
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={statusColor} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: off }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{value.toFixed(0)}%</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-gray-500">{label}</p>
    </div>
  )
}

// ─── Status pill ──────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    healthy:   'bg-green-100 text-green-700',
    warning:   'bg-amber-100 text-amber-700',
    critical:  'bg-red-100 text-red-600',
    connected: 'bg-green-100 text-green-700',
    error:     'bg-red-100 text-red-600',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${
      styles[status] ?? 'bg-gray-100 text-gray-600'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'healthy' || status === 'connected' ? 'bg-green-500 animate-pulse' :
        status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
      }`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// ─── Info row ─────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-semibold text-gray-800 font-mono">{value}</span>
    </div>
  )
}

export default function ServerMonitorPage() {
  const [historyHours, setHistoryHours] = useState(24)
  const { data: health, isLoading }     = useHealthReport()
  const { data: history = [] }          = useMetricHistory(historyHours)

  const server = health?.server
  const status = health?.status ?? 'healthy'

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-primary">Server Monitor</h1>
          <p className="text-gray-500 text-sm mt-1">
            Refreshes every 15s · Last: {health?.collected_at ?? '—'}
          </p>
        </div>
        <StatusPill status={status} />
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* CPU / Memory / Disk Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: 'CPU Usage',
                value: server?.cpu_usage ?? 0,
                sub:   `Load: ${server?.load_average ?? 0}`,
                color: '#3B82F6',
              },
              {
                label: 'Memory',
                value: server?.memory_usage ?? 0,
                sub:   `${server?.memory_used_mb ?? 0}MB / ${server?.memory_total_mb ?? 0}MB`,
                color: '#8B5CF6',
              },
              {
                label: 'Disk',
                value: server?.disk_usage ?? 0,
                sub:   `${server?.disk_used_gb ?? 0}GB / ${server?.disk_total_gb ?? 0}GB`,
                color: '#10B981',
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center"
              >
                <GaugeRing value={item.value} label={item.label} color={item.color} size={100} />
                <p className="text-xs text-gray-400 mt-3">{item.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Queue + PHP Workers */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Queue Pending',  value: server?.queue_jobs_pending ?? 0, color: 'text-amber-600' },
              { label: 'Queue Failed',   value: server?.queue_jobs_failed  ?? 0, color: 'text-red-600' },
              { label: 'PHP Workers',    value: server?.php_workers        ?? 0, color: 'text-blue-600' },
              { label: 'PHP Version',    value: health?.php.version        ?? '—', color: 'text-purple-600' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="bg-white border border-gray-200 rounded-2xl p-4"
              >
                <p className="text-xs text-gray-400 mb-1.5">{item.label}</p>
                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Services Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label:  'Database',
                status: health?.database.status ?? 'unknown',
                info:   `${health?.database.driver} · ${health?.database.latency_ms ?? '—'}ms`,
              },
              {
                label:  'Cache',
                status: health?.cache.status ?? 'unknown',
                info:   health?.cache.driver ?? '—',
              },
              {
                label:  'Queue',
                status: (health?.queue.failed ?? 0) === 0 ? 'healthy' : 'warning',
                info:   `${health?.queue.driver} · ${health?.queue.failed} failed`,
              },
            ].map((svc, i) => (
              <motion.div
                key={svc.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.07 }}
                className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">{svc.label}</p>
                  <p className="text-xs text-gray-400">{svc.info}</p>
                </div>
                <StatusPill status={svc.status} />
              </motion.div>
            ))}
          </div>

          {/* Laravel / PHP Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-white border border-gray-200 rounded-2xl p-5"
            >
              <h3 className="text-sm font-bold text-gray-900 mb-3">Laravel</h3>
              <InfoRow label="Version"     value={health?.laravel.version     ?? '—'} />
              <InfoRow label="Environment" value={health?.laravel.environment ?? '—'} />
              <InfoRow label="Debug Mode"  value={health?.laravel.debug ? 'Enabled ⚠' : 'Disabled ✓'} />
              <InfoRow label="Uptime"      value={health?.laravel.uptime      ?? '—'} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white border border-gray-200 rounded-2xl p-5"
            >
              <h3 className="text-sm font-bold text-gray-900 mb-3">PHP Extensions</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {(health?.php.extensions ?? []).map((ext) => (
                  <span key={ext} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-mono font-medium rounded-lg">
                    {ext}
                  </span>
                ))}
                {(health?.php.extensions ?? []).length === 0 && (
                  <span className="text-sm text-gray-400">No extensions listed</span>
                )}
              </div>
              <div className="mt-4">
                <InfoRow label="Memory Limit"    value={health?.php.memory_limit    ?? '—'} />
                <InfoRow label="Max Exec Time" value={`${health?.php.max_execution ?? '—'}s`} />
              </div>
            </motion.div>
          </div>

          {/* History Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="bg-white border border-gray-200 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-gray-900">Usage History</h3>
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                {[6, 24, 48].map((h) => (
                  <button
                    key={h}
                    onClick={() => setHistoryHours(h)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                      historyHours === h ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} unit="%" />
                <Tooltip formatter={(v: any) => `${v}%`} />
                <Legend />
                <Area type="monotone" dataKey="cpu"    name="CPU"    stroke="#3B82F6" fill="url(#cpuGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="memory" name="Memory" stroke="#8B5CF6" fill="url(#memGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </>
      )}
    </div>
  )
}