import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAssignment, useMySubmission, useSubmitAssignment } from '../../hooks/useQuiz'
import type { SubmissionStatus } from '../../types/quiz.types'

const STATUS_CONFIG: Record<SubmissionStatus, { color: string; bg: string; label: string }> = {
  submitted:         { color: 'text-blue-700',   bg: 'bg-blue-100',   label: 'Submitted' },
  under_review:      { color: 'text-amber-700',  bg: 'bg-amber-100',  label: 'Under Review' },
  passed:            { color: 'text-green-700',  bg: 'bg-green-100',  label: 'Passed' },
  failed:            { color: 'text-red-600',    bg: 'bg-red-100',    label: 'Failed' },
  resubmit_required: { color: 'text-orange-700', bg: 'bg-orange-100', label: 'Resubmit Required' },
}

export default function AssignmentPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const navigate         = useNavigate()
  const id               = Number(assignmentId)

  const { data: assignment, isLoading } = useAssignment(id)
  const { data: submission }            = useMySubmission(id)
  const submitMutation                  = useSubmitAssignment()

  const [notes, setNotes]     = useState('')
  const [files, setFiles]     = useState<File[]>([])
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef          = useRef<HTMLInputElement>(null)

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    const arr   = Array.from(newFiles)
    const limit = assignment?.max_files ?? 5
    setFiles((prev) => [...prev, ...arr].slice(0, limit))
  }

  const handleSubmit = async () => {
    if (!assignment) return
    setError('')

    if (files.length === 0 && !notes.trim()) {
      setError('Please add files or notes before submitting.')
      return
    }

    const fd = new FormData()
    if (notes.trim()) fd.append('notes', notes)
    files.forEach((f) => fd.append('files[]', f))

    try {
      await submitMutation.mutateAsync({ id, formData: fd })
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Submission failed. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-gray-200 border-t-accent rounded-full"
        />
      </div>
    )
  }

  if (!assignment) {
    return <div className="p-8 text-center text-gray-400">Assignment not found.</div>
  }

  const canResubmit = submission?.status === 'resubmit_required' || submission?.status === 'failed'
  const hasGraded   = submission && ['passed', 'failed', 'resubmit_required'].includes(submission.status)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Assignment Detail */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-6 mb-5"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-primary">{assignment.title}</h1>
              {assignment.due_date && (
                <p className={`text-sm mt-1 ${assignment.is_overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                  Due: {new Date(assignment.due_date).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                  {assignment.is_overdue && ' (Overdue)'}
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold text-primary">{assignment.max_marks}</p>
              <p className="text-xs text-gray-400">marks</p>
            </div>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-4">{assignment.description}</p>

          {assignment.instructions && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">Instructions</p>
              <p className="text-sm text-blue-800 leading-relaxed">{assignment.instructions}</p>
            </div>
          )}

          {/* File types info */}
          {assignment.allowed_file_types.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {assignment.allowed_file_types.map((type) => (
                <span key={type} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-mono rounded">
                  .{type}
                </span>
              ))}
              <span className="text-xs text-gray-400 self-center">
                · Max {assignment.max_file_size_mb}MB per file · {assignment.max_files} files max
              </span>
            </div>
          )}
        </motion.div>

        {/* Existing submission result */}
        <AnimatePresence>
          {submission && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-white border border-gray-200 rounded-2xl p-6 mb-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">Your Submission</h2>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${STATUS_CONFIG[submission.status]?.bg} ${STATUS_CONFIG[submission.status]?.color}`}>
                  {STATUS_CONFIG[submission.status]?.label}
                </span>
              </div>

              {/* Score */}
              {hasGraded && submission.marks_obtained !== null && (
                <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{submission.marks_obtained}</p>
                    <p className="text-xs text-gray-400">out of {assignment.max_marks}</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          submission.status === 'passed' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${((submission.marks_obtained ?? 0) / assignment.max_marks) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {Math.round(((submission.marks_obtained ?? 0) / assignment.max_marks) * 100)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {submission.feedback && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Teacher Feedback</p>
                  <p className="text-sm text-blue-800 leading-relaxed">{submission.feedback}</p>
                </div>
              )}

              {/* Files submitted */}
              {submission.file_urls.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Submitted Files</p>
                  <div className="space-y-1.5">
                    {submission.file_urls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-accent hover:underline"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        File {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit / Resubmit form */}
        {(! submission || canResubmit) && ! assignment.is_overdue && ! success && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-2xl p-6"
          >
            <h2 className="text-base font-bold text-gray-900 mb-5">
              {canResubmit ? 'Resubmit Assignment' : 'Submit Assignment'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add any notes or comments for your teacher..."
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
              />
            </div>

            {/* File Upload */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Files
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  handleFiles(e.dataTransfer.files)
                }}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-accent transition"
              >
                <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-400">Click or drag files here</p>
                <p className="text-xs text-gray-300 mt-1">
                  {assignment.allowed_file_types.join(', ')} · Max {assignment.max_file_size_mb}MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept={assignment.allowed_file_types.map(t => `.${t}`).join(',')}
                onChange={(e) => handleFiles(e.target.files)}
              />

              {/* File list */}
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-2"
                  >
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl">
                        <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="flex-1 text-sm text-gray-700 truncate">{file.name}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <button
                          onClick={() => setFiles(files.filter((_, j) => j !== i))}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-60"
            >
              {submitMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Submitting...
                </span>
              ) : canResubmit ? 'Resubmit Assignment' : 'Submit Assignment'}
            </motion.button>
          </motion.div>
        )}

        {/* Success state */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-green-200 rounded-2xl p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h2 className="text-xl font-bold text-green-700 mb-2">Submitted Successfully!</h2>
              <p className="text-gray-500 text-sm mb-6">
                Your assignment has been submitted. Your teacher will review it shortly.
              </p>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition"
              >
                Back to Course
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overdue notice */}
        {assignment.is_overdue && !submission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
          >
            <svg className="w-10 h-10 mx-auto text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-bold text-red-700 mb-1">Submission Deadline Passed</h3>
            <p className="text-red-500 text-sm">The deadline for this assignment has passed.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}