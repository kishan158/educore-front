import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminCourses, useApproveCourse, useRejectCourse } from '../../hooks/useCourses'
import { StatusBadge, LevelBadge } from '../../components/ui/StatusBadge'
import type { Course, CourseFilters } from '../../types/course.types'

export default function AdminCoursesPage() {
  const [filters, setFilters]   = useState<CourseFilters>({})
  const [rejectModal, setRejectModal] = useState<Course | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading } = useAdminCourses(filters)
  const approveMutation     = useApproveCourse()
  const rejectMutation      = useRejectCourse()

  const courses = data?.data ?? []

  return (
    <div className="p-6 max-w-7xl mx-auto">

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-primary">All Courses</h1>
        <p className="text-gray-500 text-sm mt-1">{data?.meta.total ?? 0} total courses</p>
      </motion.div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
        <input
          placeholder="Search courses..."
          className="flex-1 min-w-[180px] px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
        />
        <select
          className="px-4 py-2 text-sm border border-gray-200 rounded-xl bg-white"
          onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value as any) || undefined }))}
        >
          <option value="">All Status</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">Course</div>
          <div className="col-span-2">Teacher</div>
          <div className="col-span-1">Level</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-center">Price</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {isLoading && (
          <div className="p-8 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        )}

        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
          initial="hidden"
          animate="show"
        >
          {courses.map((course) => (
            <motion.div
              key={course.id}
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              className="grid grid-cols-12 gap-2 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition items-center"
            >
              {/* Course */}
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{course.title}</p>
                  <p className="text-xs text-gray-400">{course.total_lessons} lessons</p>
                </div>
              </div>

              {/* Teacher */}
              <div className="col-span-2 text-sm text-gray-600 truncate">
                {course.teacher?.name ?? '—'}
              </div>

              {/* Level */}
              <div className="col-span-1">
                <LevelBadge level={course.level} />
              </div>

              {/* Status */}
              <div className="col-span-2">
                <StatusBadge status={course.status} />
              </div>

              {/* Price */}
              <div className="col-span-1 text-center text-sm font-semibold text-primary">
                {course.is_free ? 'Free' : `$${course.effective_price}`}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-1.5">
                {course.status === 'pending' && (
                  <>
                    <button
                      onClick={() => approveMutation.mutate(course.id)}
                      disabled={approveMutation.isPending}
                      className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectModal(course)}
                      className="px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {!isLoading && courses.length === 0 && (
          <div className="py-16 text-center text-gray-400 text-sm">No courses found.</div>
        )}
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setRejectModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-lg font-bold text-primary mb-1">Reject Course</h3>
              <p className="text-gray-500 text-sm mb-4">
                Provide a reason so the teacher can improve and resubmit.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="e.g. Course content is incomplete. Please add more lessons to chapters 2 and 3..."
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setRejectModal(null); setRejectReason('') }}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!rejectReason.trim()) return
                    await rejectMutation.mutateAsync({
                      id:     rejectModal.id,
                      reason: rejectReason,
                    })
                    setRejectModal(null)
                    setRejectReason('')
                  }}
                  disabled={!rejectReason.trim() || rejectMutation.isPending}
                  className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-60"
                >
                  {rejectMutation.isPending ? 'Rejecting...' : 'Reject Course'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}