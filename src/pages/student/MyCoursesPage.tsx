import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMyEnrollments } from '../../hooks/useEnrollment'
import type { Enrollment } from '../../types/enrollment.types'

function ProgressRing({ percent }: { percent: number }) {
  const r         = 20
  const circ      = 2 * Math.PI * r
  const offset    = circ - (percent / 100) * circ

  return (
    <svg width="52" height="52" className="-rotate-90">
      <circle
        cx="26" cy="26" r={r}
        strokeWidth="4"
        stroke="currentColor"
        className="text-gray-100"
        fill="none"
      />
      <motion.circle
        cx="26" cy="26" r={r}
        strokeWidth="4"
        stroke="currentColor"
        className="text-accent"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  )
}

function CourseCard({ enrollment }: { enrollment: Enrollment }) {
  const navigate = useNavigate()
  const course   = enrollment.course!

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:border-accent/30 hover:shadow-md transition-all duration-200"
      onClick={() => navigate(`/student/learn/${course.slug}`)}
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}

        {/* Completed badge */}
        {enrollment.is_completed && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Completed
            </span>
          </div>
        )}

        {/* Category pill */}
        {course.category && (
          <div className="absolute bottom-3 left-3">
            <span
              className="px-2 py-0.5 text-xs font-semibold rounded-full text-white"
              style={{ backgroundColor: course.category.color }}
            >
              {course.category.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
          {course.title}
        </h3>

        <p className="text-xs text-gray-400 mb-4">
          {course.teacher?.name ?? 'Instructor'} · {course.total_lessons} lessons
        </p>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <ProgressRing percent={enrollment.progress_percent} />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
              {Math.round(enrollment.progress_percent)}%
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs font-semibold text-gray-700">
                {enrollment.progress_percent >= 100 ? 'Complete' : 'In Progress'}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${enrollment.progress_percent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {enrollment.last_accessed_at && (
          <p className="text-xs text-gray-400 mt-3">
            Last accessed {enrollment.last_accessed_at}
          </p>
        )}

        {/* CTA */}
        <button
          className="w-full mt-3 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 transition"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/student/learn/${course.slug}`)
          }}
        >
          {enrollment.progress_percent === 0
            ? 'Start Learning'
            : enrollment.is_completed
              ? 'Review Course'
              : 'Continue Learning'
          }
        </button>
      </div>
    </motion.div>
  )
}

export default function MyCoursesPage() {
  const [filter, setFilter]   = useState<'all' | 'in_progress' | 'completed'>('all')
  const [search, setSearch]   = useState('')

  const { data, isLoading } = useMyEnrollments({
    search:       search || undefined,
    is_completed: filter === 'all' ? undefined : filter === 'completed',
  })

  const enrollments = data?.data ?? []
  const meta        = data?.meta

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-primary">My Courses</h1>
        <p className="text-gray-500 text-sm mt-1">
          {meta?.total ?? 0} enrolled courses
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your courses..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
          />
        </div>

        {/* Filter pills */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {[
            { key: 'all',         label: 'All' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'completed',   label: 'Completed' },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key as any)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                filter === opt.key
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {enrollments.map((enrollment) => (
              <CourseCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty */}
      {!isLoading && enrollments.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <svg className="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-gray-500 font-medium mb-2">No courses yet</h3>
          <p className="text-gray-400 text-sm mb-6">
            {filter === 'all'
              ? "You haven't enrolled in any courses yet."
              : `No ${filter.replace('_', ' ')} courses found.`}
          </p>
          <button
            onClick={() => window.location.href = '/courses'}
            className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition"
          >
            Browse Courses
          </button>
        </motion.div>
      )}
    </div>
  )
}