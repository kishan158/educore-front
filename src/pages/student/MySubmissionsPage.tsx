import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useMySubmissions } from '../../hooks/useQuiz'
import type { Submission, SubmissionStatus } from '../../types/quiz.types'

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  submitted:         'bg-blue-100 text-blue-700',
  under_review:      'bg-amber-100 text-amber-700',
  passed:            'bg-green-100 text-green-700',
  failed:            'bg-red-100 text-red-600',
  resubmit_required: 'bg-orange-100 text-orange-700',
}

export default function MySubmissionsPage() {
  const navigate              = useNavigate()
  const { data, isLoading }   = useMySubmissions()
  const submissions: Submission[] = (data as any)?.data ?? []

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-primary">My Submissions</h1>
        <p className="text-gray-500 text-sm mt-1">{submissions.length} total submissions</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <motion.div
          className="space-y-3"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          initial="hidden"
          animate="show"
        >
          {submissions.map((sub) => (
            <motion.div
              key={sub.id}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 hover:border-gray-300 transition cursor-pointer"
              onClick={() => navigate(`/student/assignments/${sub.assignment?.id}`)}
            >
              {/* Icon */}
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {sub.assignment?.title ?? 'Assignment'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Submitted {new Date(sub.submitted_at).toLocaleDateString()}
                </p>
              </div>

              {/* Marks */}
              {sub.marks_obtained !== null && (
                <div className="text-center flex-shrink-0">
                  <p className="text-lg font-bold text-primary">{sub.marks_obtained}</p>
                  <p className="text-xs text-gray-400">/{sub.assignment?.max_marks}</p>
                </div>
              )}

              {/* Status */}
              <span className={`px-3 py-1.5 text-xs font-bold rounded-full flex-shrink-0 ${STATUS_STYLES[sub.status]}`}>
                {sub.status_label}
              </span>
            </motion.div>
          ))}

          {submissions.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm">No submissions yet.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}