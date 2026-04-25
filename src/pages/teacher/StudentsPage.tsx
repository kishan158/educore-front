import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMyStudents } from '../../hooks/useEnrollment'
import type { Enrollment } from '../../types/enrollment.types'

export default function StudentsPage() {
  const [courseFilter, setCourseFilter] = useState<number | undefined>()
  const { data, isLoading } = useMyStudents({
    course_id: courseFilter,
  })

  const enrollments = data?.data ?? []

  return (
    <div className="p-6 max-w-5xl mx-auto">

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-primary">My Students</h1>
        <p className="text-gray-500 text-sm mt-1">{data?.meta?.total ?? 0} enrolled students</p>
      </motion.div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">Student</div>
          <div className="col-span-3">Course</div>
          <div className="col-span-2">Progress</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Joined</div>
        </div>

        {isLoading && (
          <div className="p-6 space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
          initial="hidden"
          animate="show"
        >
          {enrollments.map((enrollment) => (
            <motion.div
              key={enrollment.id}
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              className="grid grid-cols-12 gap-2 px-5 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition items-center"
            >
              {/* Student */}
              <div className="col-span-4 flex items-center gap-3">
                <img
                  src={enrollment.user?.avatar_url ?? `https://ui-avatars.com/api/?name=${enrollment.user?.name}&size=32`}
                  alt={enrollment.user?.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{enrollment.user?.name}</p>
                  <p className="text-xs text-gray-400">{enrollment.user?.email}</p>
                </div>
              </div>

              {/* Course */}
              <div className="col-span-3 text-sm text-gray-600 truncate">
                {enrollment.course?.title ?? '—'}
              </div>

              {/* Progress */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${enrollment.progress_percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {Math.round(enrollment.progress_percent)}%
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${
                  enrollment.is_completed
                    ? 'bg-green-100 text-green-700'
                    : enrollment.progress_percent > 0
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    enrollment.is_completed
                      ? 'bg-green-500'
                      : enrollment.progress_percent > 0
                        ? 'bg-blue-500'
                        : 'bg-gray-400'
                  }`} />
                  {enrollment.is_completed
                    ? 'Completed'
                    : enrollment.progress_percent > 0
                      ? 'In Progress'
                      : 'Not Started'}
                </span>
              </div>

              {/* Date */}
              <div className="col-span-1 text-xs text-gray-400">
                {enrollment.enrolled_at
                  ? new Date(enrollment.enrolled_at).toLocaleDateString('en-IN', {
                      day:   '2-digit',
                      month: 'short',
                    })
                  : '—'}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {!isLoading && enrollments.length === 0 && (
          <div className="py-16 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-gray-400">No students enrolled yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}