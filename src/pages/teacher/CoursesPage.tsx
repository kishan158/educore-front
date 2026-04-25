import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useTeacherCourses,
  useDeleteCourse,
  useSubmitForReview,
  usePublishCourse,
} from '../../hooks/useCourses'
import { StatusBadge, LevelBadge } from '../../components/ui/StatusBadge'
import type { Course, CourseFilters } from '../../types/course.types'

export default function TeacherCoursesPage() {
  const navigate  = useNavigate()
  const [filters, setFilters] = useState<CourseFilters>({})
  const [delTarget, setDelTarget] = useState<Course | null>(null)

  const { data, isLoading }  = useTeacherCourses(filters)
  const deleteMutation       = useDeleteCourse()
  const submitMutation       = useSubmitForReview()
  const publishMutation      = usePublishCourse()

  const courses = data?.data ?? []
  const meta    = data?.meta

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-primary">My Courses</h1>
          <p className="text-gray-500 text-sm mt-1">
            {meta?.total ?? 0} total courses
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/teacher/courses/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Course
          </Link>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
        <input
          placeholder="Search courses..."
          className="flex-1 min-w-[180px] px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
        />
        <select
          className="px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
          onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value as any) || undefined }))}
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Course Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        >
          <AnimatePresence>
            {courses.map((course) => (
              <motion.div
                key={course.id}
                layout
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show:   { opacity: 1, y: 0 },
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-sm transition group"
              >
                {/* Thumbnail */}
                <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={course.status} />
                  </div>

                  {/* Featured badge */}
                  {course.is_featured && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                        Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <LevelBadge level={course.level} />
                    <span className="text-xs text-gray-400">{course.total_lessons} lessons</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400">{course.duration_formatted}</span>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                      </svg>
                      {course.enrollments_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {course.rating_avg} ({course.rating_count})
                    </span>
                    <span className="ml-auto font-semibold text-primary text-sm">
                      {course.is_free ? 'Free' : `$${course.effective_price}`}
                    </span>
                  </div>

                  {/* Rejection reason */}
                  {course.status === 'rejected' && course.rejection_reason && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                      Rejected: {course.rejection_reason}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/teacher/courses/${course.id}/edit`)}
                      className="flex-1 py-2 text-xs font-medium border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition"
                    >
                      Edit
                    </button>

                    {course.status === 'draft' || course.status === 'rejected' ? (
                      <button
                        onClick={() => submitMutation.mutate(course.id)}
                        disabled={submitMutation.isPending}
                        className="flex-1 py-2 text-xs font-semibold bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition disabled:opacity-60"
                      >
                        Submit
                      </button>
                    ) : course.status === 'approved' ? (
                      <button
                        onClick={() => publishMutation.mutate(course.id)}
                        disabled={publishMutation.isPending}
                        className="flex-1 py-2 text-xs font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-60"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/teacher/courses/${course.id}/curriculum`)}
                        className="flex-1 py-2 text-xs font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 transition"
                      >
                        Curriculum
                      </button>
                    )}

                    <button
                      onClick={() => setDelTarget(course)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 rounded-xl transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty */}
      {!isLoading && courses.length === 0 && (
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
          <p className="text-gray-400 text-sm mb-6">Create your first course and start teaching.</p>
          <Link
            to="/teacher/courses/create"
            className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition"
          >
            Create Course
          </Link>
        </motion.div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {delTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setDelTarget(null)}
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
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Course?</h3>
              <p className="text-gray-500 text-sm mb-6">
                <strong>"{delTarget.title}"</strong> and all its chapters, lessons will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDelTarget(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await deleteMutation.mutateAsync(delTarget.id)
                    setDelTarget(null)
                  }}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-60"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}