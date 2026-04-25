import { motion }                from 'framer-motion'
import { Link }                  from 'react-router-dom'
import { useAuthStore }          from '../../stores/authStore'
import { useTeacherAnalytics }   from '../../hooks/useAnalytics'
import { useMyPayouts, useEarningSummary } from '../../hooks/usePayouts'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

function QuickStat({ label, value, icon, color }: {
  label: string; value: string | number; icon: React.ReactNode; color: string
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

export default function TeacherDashboard() {
  const { user }             = useAuthStore()
  const { data: analytics }  = useTeacherAnalytics(30)
  const { data: summary }    = useEarningSummary()
  const { data: payouts }    = useMyPayouts()

  const chart       = analytics?.chart ?? []
  const recentPayouts = ((payouts as any)?.data ?? []).slice(0, 4)

  const quickActions = [
    { label: 'Create Course',    to: '/teacher/courses/create',   icon: '📚', color: '#2563EB' },
    { label: 'Schedule Class',   to: '/teacher/live-classes',     icon: '🎥', color: '#10B981' },
    { label: 'View Students',    to: '/teacher/students',         icon: '👥', color: '#8B5CF6' },
    { label: 'Request Payout',   to: '/teacher/earnings',         icon: '💰', color: '#F59E0B' },
  ]

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">

      {/* ─── Welcome banner ──────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #2563EB 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 right-20 w-32 h-32 bg-blue-500/20 rounded-full translate-y-1/2" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">Welcome back 👋</p>
            <h1 className="text-2xl font-bold text-white">{user?.name ?? 'Instructor'}</h1>
            <p className="text-white/50 text-sm mt-1">Here's how your courses are performing today</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-blue-200 text-xs">This Month</p>
              <p className="text-white text-2xl font-bold">${summary?.total_pending?.toFixed(2) ?? '0.00'}</p>
              <p className="text-blue-300 text-xs">Pending Payout</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <Link to="/teacher/earnings"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Request Payout
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ─── Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Students', value: analytics?.total_students?.toLocaleString() ?? '0',
            color: 'bg-blue-100 text-blue-600',
            icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
          },
          {
            label: 'Courses', value: analytics?.total_courses?.toLocaleString() ?? '0',
            color: 'bg-purple-100 text-purple-600',
            icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
          },
          {
            label: 'Total Earned', value: `$${summary?.total_earned?.toFixed(2) ?? '0.00'}`,
            color: 'bg-green-100 text-green-600',
            icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          },
          {
            label: 'Published', value: analytics?.published_courses ?? '0',
            color: 'bg-amber-100 text-amber-600',
            icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <QuickStat {...s} />
          </motion.div>
        ))}
      </div>

      {/* ─── Chart + Quick Actions ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Revenue chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Earnings — Last 30 Days</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Total:{' '}
                <span className="font-semibold text-green-600">
                  ${analytics?.period_revenue?.toFixed(2) ?? '0.00'}
                </span>
              </p>
            </div>
            <Link to="/teacher/analytics"
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              Full Report
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#CBD5E1' }}
                tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                interval={Math.max(1, Math.floor(chart.length / 5))} axisLine={false} tickLine={false}
              />
              <YAxis tick={{ fontSize: 10, fill: '#CBD5E1' }} tickFormatter={(v) => `$${v}`}
                axisLine={false} tickLine={false}
              />
              <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5}
                dot={false} activeDot={{ r: 4, fill: '#10B981', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
        >
          <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.to}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 text-center leading-tight transition-colors">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Recent payout */}
          {recentPayouts.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 mb-3">Recent Payouts</p>
              <div className="space-y-2">
                {recentPayouts.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-mono">{p.payout_number}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-800">${parseFloat(p.amount).toFixed(2)}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        p.status === 'paid'     ? 'bg-green-100 text-green-700' :
                        p.status === 'approved' ? 'bg-blue-100 text-blue-700'  :
                        'bg-amber-100 text-amber-700'
                      }`}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}