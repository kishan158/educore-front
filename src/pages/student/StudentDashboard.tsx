import { motion }               from 'framer-motion'
import { Link }                 from 'react-router-dom'
import { useAuthStore }         from '../../stores/authStore'
import { useMyEnrollments }     from '../../hooks/useEnrollment'
import { useMyCertificates }    from '../../hooks/useCertificates'
import { useUpcomingClasses }   from '../../hooks/useLiveClasses'

// ─── Progress ring ────────────────────────────────────────────────
function ProgressRing({ value, size = 48, stroke = 4 }: { value: number; size?: number; stroke?: number }) {
  const r    = (size / 2) - stroke
  const circ = 2 * Math.PI * r
  const off  = circ - (value / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90 flex-shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#2563EB" strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ}
        style={{ strokeDashoffset: off, transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  )
}

export default function StudentDashboard() {
  const { user }                = useAuthStore()
  const { data: enrollData }    = useMyEnrollments()
  const { data: certs = [] }    = useMyCertificates()
  const { data: liveClasses = []} = useUpcomingClasses()

  const enrollments   = (enrollData as any)?.data ?? []
  const completed     = enrollments.filter((e: any) => e.is_completed).length
  const inProgress    = enrollments.filter((e: any) => !e.is_completed && e.progress_percent > 0).length
  const totalCourses  = enrollments.length
  const avgProgress   = totalCourses > 0
    ? Math.round(enrollments.reduce((s: number, e: any) => s + e.progress_percent, 0) / totalCourses)
    : 0

  const resumeCourse = enrollments.find((e: any) => !e.is_completed && e.progress_percent > 0)
    ?? enrollments[0]

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const quickLinks = [
    { label: 'Browse Courses',   to: '/courses',               icon: '🔍', desc: 'Find new courses'     },
    { label: 'Live Classes',     to: '/student/live-classes',  icon: '🎥', desc: 'Join live sessions'   },
    { label: 'My Certificates',  to: '/student/certificates',  icon: '🏆', desc: 'View achievements'    },
    { label: 'Assignments',      to: '/student/submissions',   icon: '📝', desc: 'Submit & track work'  },
  ]

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">

      {/* ─── Welcome banner ──────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #2563EB 100%)' }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/[0.03] rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-blue-400/10 rounded-full translate-y-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">{getGreeting()} 👋</p>
            <h1 className="text-2xl font-bold text-white">{user?.name?.split(' ')[0] ?? 'Learner'}</h1>
            <p className="text-white/50 text-sm mt-1">
              {totalCourses === 0
                ? "Start your learning journey today!"
                : `You're making great progress — keep it up!`}
            </p>
          </div>

          {/* Overall progress */}
          {totalCourses > 0 && (
            <div className="flex items-center gap-5">
              <div className="relative">
                <ProgressRing value={avgProgress} size={72} stroke={5} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{avgProgress}%</span>
                </div>
              </div>
              <div>
                <p className="text-white/60 text-xs">Overall Progress</p>
                <p className="text-white font-bold text-lg">{completed}/{totalCourses}</p>
                <p className="text-white/40 text-xs">courses completed</p>
              </div>
            </div>
          )}

          {/* Browse CTA */}
          <Link to="/courses"
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#1E3A5F] text-sm font-bold rounded-xl hover:bg-blue-50 transition-all self-start md:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Courses
          </Link>
        </div>
      </motion.div>

      {/* ─── Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Enrolled',     value: totalCourses, icon: '📚', color: '#2563EB', bg: '#EFF6FF' },
          { label: 'In Progress',  value: inProgress,   icon: '⚡', color: '#F59E0B', bg: '#FFFBEB' },
          { label: 'Completed',    value: completed,    icon: '✅', color: '#10B981', bg: '#ECFDF5' },
          { label: 'Certificates', value: certs.length, icon: '🏆', color: '#8B5CF6', bg: '#F5F3FF' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                style={{ background: s.bg }}>
                {s.icon}
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ─── Resume + Live + Certs ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Resume course */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm lg:col-span-2"
        >
          <h3 className="text-sm font-bold text-gray-900 mb-4">
            {resumeCourse ? 'Continue Learning' : 'My Courses'}
          </h3>

          {resumeCourse ? (
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100">
                {resumeCourse.course?.thumbnail_url
                  ? <img src={resumeCourse.course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{resumeCourse.course?.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{resumeCourse.course?.teacher?.name}</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Progress</span>
                    <span className="text-xs font-bold text-[#2563EB]">{Math.round(resumeCourse.progress_percent)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2563EB] rounded-full transition-all duration-1000"
                      style={{ width: `${resumeCourse.progress_percent}%` }} />
                  </div>
                </div>
                <Link to={`/student/learn/${resumeCourse.course?.slug}`}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-xs font-bold rounded-xl hover:bg-[#162d4a] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Resume Course
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-4xl mb-3">🚀</div>
              <p className="text-gray-500 text-sm font-medium mb-4">Ready to start learning?</p>
              <Link to="/courses"
                className="px-5 py-2.5 bg-[#1E3A5F] text-white text-sm font-bold rounded-xl hover:bg-[#162d4a] transition-colors"
              >
                Explore Courses
              </Link>
            </div>
          )}

          {/* Other enrolled courses */}
          {enrollments.length > 1 && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-semibold mb-3">All Courses</p>
              <div className="space-y-2">
                {enrollments.slice(0, 3).map((e: any) => (
                  <div key={e.id} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {e.course?.thumbnail_url
                        ? <img src={e.course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xs">📖</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">{e.course?.title}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2563EB] rounded-full"
                          style={{ width: `${e.progress_percent}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">
                        {Math.round(e.progress_percent)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {enrollments.length > 3 && (
                <Link to="/student/courses" className="text-xs text-[#2563EB] font-semibold hover:underline mt-2 block">
                  View all {enrollments.length} courses →
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Upcoming live class */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
          >
            <h3 className="text-sm font-bold text-gray-900 mb-3">Upcoming Class</h3>
            {liveClasses.length > 0 ? (
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{liveClasses[0].title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{liveClasses[0].course?.title}</p>
                    <p className="text-xs text-red-500 font-semibold mt-1">{liveClasses[0].starts_at_human}</p>
                  </div>
                </div>
                <Link to="/student/live-classes"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors"
                >
                  View All Classes
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-2xl mb-2">📅</div>
                <p className="text-xs text-gray-400">No upcoming classes</p>
              </div>
            )}
          </motion.div>

          {/* Recent cert */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Certificates</h3>
              <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">
                {certs.length}
              </span>
            </div>
            {certs.length > 0 ? (
              <div className="space-y-2">
                {certs.slice(0, 2).map((cert: any) => (
                  <div key={cert.id}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-xl"
                  >
                    <span className="text-xl">🏆</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{cert.course?.title}</p>
                      <p className="text-[10px] text-amber-600 mt-0.5">{cert.issued_at_human}</p>
                    </div>
                  </div>
                ))}
                {certs.length > 2 && (
                  <Link to="/student/certificates" className="text-xs text-[#2563EB] font-semibold hover:underline block">
                    View all {certs.length} →
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-2xl mb-2">🎯</div>
                <p className="text-xs text-gray-400">Complete a course to earn certificates</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ─── Quick Links ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
      >
        <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Navigation</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.label} to={link.to}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-[#2563EB]/30 hover:bg-blue-50/50 transition-all group text-center"
            >
              <span className="text-2xl">{link.icon}</span>
              <div>
                <p className="text-xs font-bold text-gray-700 group-hover:text-[#1E3A5F] transition-colors">
                  {link.label}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}