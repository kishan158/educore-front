import { useState }    from 'react'
import { motion }       from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  useRealtimeStats, useRevenueChart, useEnrollmentChart,
  useTopCourses, useRevenueByCategory, useTeacherPerformance,
} from '../../hooks/useAnalytics'

// ─── Stat Card ────────────────────────────────────────────────────
function StatCard({ label, value, sub, gradient, icon, delay = 0 }: {
  label: string; value: string | number; sub?: string
  gradient: string; icon: React.ReactNode; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl p-5"
      style={{ background: gradient, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
    >
      {/* Decorative circle */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -right-2 w-16 h-16 rounded-full bg-white/10" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">{label}</p>
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-white/60 mt-1">{sub}</p>}
      </div>
    </motion.div>
  )
}

// ─── Period selector ──────────────────────────────────────────────
function PeriodSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
      {[7, 30, 90].map((d) => (
        <button key={d} onClick={() => onChange(d)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
            value === d ? 'bg-white text-[#1E3A5F] shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {d}d
        </button>
      ))}
    </div>
  )
}

// ─── Tooltip ─────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0F172A] text-white border border-white/10 rounded-xl px-4 py-3 text-xs shadow-xl">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>
          {p.name}: {p.name === 'Revenue' ? `$${Number(p.value).toFixed(2)}` : p.value}
        </p>
      ))}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [days, setDays]            = useState(30)
  const { data: stats, isLoading } = useRealtimeStats()
  const { data: revenueData = [] } = useRevenueChart(days)
  const { data: enrollData  = [] } = useEnrollmentChart(days)
  const { data: topCourses  = [] } = useTopCourses()
  const { data: catRevenue  = [] } = useRevenueByCategory()
  const { data: teachers    = [] } = useTeacherPerformance()

  const PIE_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  const cards = [
    {
      label:    'Total Students',
      value:    stats?.total_students?.toLocaleString() ?? '0',
      sub:      `↑ ${stats?.today_new_students ?? 0} joined today`,
      gradient: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      label:    'Total Revenue',
      value:    `$${stats?.total_revenue?.toFixed(2) ?? '0.00'}`,
      sub:      `$${stats?.today_revenue?.toFixed(2) ?? '0'} today`,
      gradient: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label:    'Published Courses',
      value:    stats?.total_courses?.toLocaleString() ?? '0',
      sub:      `${stats?.total_enrollments?.toLocaleString() ?? 0} total enrollments`,
      gradient: 'linear-gradient(135deg, #5B21B6 0%, #8B5CF6 100%)',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    },
    {
      label:    'Certificates Issued',
      value:    stats?.total_certificates?.toLocaleString() ?? '0',
      sub:      `${stats?.live_classes_active ?? 0} classes live now`,
      gradient: 'linear-gradient(135deg, #92400E 0%, #F59E0B 100%)',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" /></svg>,
    },
  ]

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* ─── Header ──────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Analytics Overview</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back — here's what's happening on your platform</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-700">Live · Auto-refreshes</span>
        </div>
      </motion.div>

      {/* ─── Stat Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            ))
          : cards.map((card, i) => (
              <StatCard key={i} {...card} delay={i * 0.08} />
            ))
        }
      </div>

      {/* ─── Payout Alert ────────────────────────────────────── */}
      {(stats?.pending_payouts ?? 0) > 0 && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 px-5 py-3.5 bg-amber-50 border border-amber-200 rounded-2xl"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm text-amber-800 font-medium">
            <strong>{stats?.pending_payouts}</strong> payout request{(stats?.pending_payouts ?? 0) > 1 ? 's' : ''} awaiting your review.
          </p>
          <a href="/admin/payouts"
            className="ml-auto flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors"
          >
            Review now
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      )}

      {/* ─── Charts ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Revenue */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Revenue</h3>
              <p className="text-xs text-gray-400 mt-0.5">Gross sales over time</p>
            </div>
            <PeriodSelector value={days} onChange={setDays} />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#CBD5E1' }}
                tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                interval={Math.max(1, Math.floor(revenueData.length / 5))} axisLine={false} tickLine={false}
              />
              <YAxis tick={{ fontSize: 10, fill: '#CBD5E1' }} tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={2.5}
                dot={false} activeDot={{ r: 5, fill: '#2563EB', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Enrollments */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Enrollments</h3>
              <p className="text-xs text-gray-400 mt-0.5">New students over time</p>
            </div>
            <PeriodSelector value={days} onChange={setDays} />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={enrollData} barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#CBD5E1' }}
                tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                interval={Math.max(1, Math.floor(enrollData.length / 5))} axisLine={false} tickLine={false}
              />
              <YAxis tick={{ fontSize: 10, fill: '#CBD5E1' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Enrollments" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ─── Bottom Row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Revenue by Category */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
        >
          <h3 className="text-sm font-bold text-gray-900 mb-1">By Category</h3>
          <p className="text-xs text-gray-400 mb-4">Revenue distribution</p>

          {catRevenue.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={catRevenue} dataKey="revenue" nameKey="category"
                    cx="50%" cy="50%" outerRadius={65} innerRadius={38} paddingAngle={4}
                  >
                    {catRevenue.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `$${Number(v).toFixed(0)}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {catRevenue.slice(0, 4).map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-gray-600 truncate max-w-[100px]">{cat.category}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800">${Number(cat.revenue).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-gray-300">
              <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-xs">No data yet</p>
            </div>
          )}
        </motion.div>

        {/* Top Courses */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm lg:col-span-2"
        >
          <h3 className="text-sm font-bold text-gray-900 mb-1">Top Courses</h3>
          <p className="text-xs text-gray-400 mb-4">By student enrollment</p>

          <div className="space-y-3">
            {topCourses.slice(0, 5).map((course, i) => (
              <div key={course.id} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-gray-300 text-center flex-shrink-0">{i + 1}</span>
                <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100">
                  {course.thumbnail_url
                    ? <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-blue-400 text-xs font-bold">
                        {course.title.charAt(0)}
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{course.title}</p>
                  <p className="text-xs text-gray-400">{course.teacher}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold text-[#1E3A5F]">${Number(course.revenue).toFixed(0)}</p>
                  <p className="text-xs text-gray-400">{course.enrollments} students</p>
                </div>
                <div className="flex-shrink-0 w-16">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2563EB] rounded-full"
                      style={{ width: `${Math.min(100, (course.enrollments / (topCourses[0]?.enrollments || 1)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {topCourses.length === 0 && (
              <div className="py-10 text-center text-gray-300 text-sm">No courses yet</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ─── Teacher Performance ─────────────────────────────── */}
      {teachers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
        >
          <h3 className="text-sm font-bold text-gray-900 mb-1">Instructor Performance</h3>
          <p className="text-xs text-gray-400 mb-4">Ranked by total earnings</p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Instructor', 'Courses', 'Students', 'Revenue'].map((h) => (
                    <th key={h} className={`pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider ${
                      h === 'Instructor' ? 'text-left' : h === 'Revenue' ? 'text-right' : 'text-center'
                    }`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teachers.map((t, i) => (
                  <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={t.avatar_url} alt={t.name}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100" />
                          {i === 0 && (
                            <span className="absolute -top-1 -right-1 text-[10px]">👑</span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{t.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center text-sm text-gray-600">{t.courses}</td>
                    <td className="py-3 text-center text-sm text-gray-600">{t.students.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <span className="text-sm font-bold text-[#1E3A5F]">${t.revenue.toFixed(2)}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}