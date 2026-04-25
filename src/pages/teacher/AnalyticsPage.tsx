import { useState }         from 'react'
import { motion }           from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useTeacherAnalytics } from '../../hooks/useAnalytics'

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl p-5"
    >
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </motion.div>
  )
}

export default function TeacherAnalyticsPage() {
  const [days, setDays]      = useState(30)
  const { data, isLoading }  = useTeacherAnalytics(days)

  const chart = data?.chart ?? []

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-primary">My Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Performance overview</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students"    value={data?.total_students?.toLocaleString()    ?? '—'} color="text-blue-600" />
        <StatCard label="Total Courses"     value={data?.total_courses?.toLocaleString()     ?? '—'} color="text-purple-600" />
        <StatCard label="Published"         value={data?.published_courses?.toLocaleString() ?? '—'} color="text-teal-600" />
        <StatCard label="Total Earned"      value={`$${data?.total_revenue?.toFixed(2) ?? '0.00'}`} color="text-green-600" />
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-gray-900">Revenue & Enrollments</h3>
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  days === d ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94A3B8' }}
           
                tickFormatter={(v: string | number) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                interval={chart.length ? Math.floor(chart.length / 6) : 0}
              />
              <YAxis yAxisId="left"  tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={(v: number | string) => `$${v}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Revenue ($)"
                stroke="#2563EB"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="enrollments"
                name="Enrollments"
                stroke="#059669"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Period summary */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-5">
        <p className="text-sm font-semibold text-primary mb-1">Last {days} Days</p>
        <p className="text-3xl font-bold text-primary">
          ${data?.period_revenue?.toFixed(2) ?? '0.00'}
        </p>
        <p className="text-xs text-gray-500 mt-1">Total earnings in this period</p>
      </div>
    </div>
  )
}