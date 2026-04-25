import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useTeacherLiveClasses,
  useScheduleLiveClass,
  useStartClass,
  useEndClass,
  useCancelClass,
} from '../../hooks/useLiveClasses'
import { useTeacherCourses } from '../../hooks/useCourses'
import { liveClassApi } from '../../api/liveclass.api'
import type { LiveClass } from '../../types/liveclass.types'

const schema = z.object({
  course_id:   z.coerce.number().min(1, 'Select a course'),
  title:       z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  provider:    z.enum(['zoom', 'jitsi']),
  starts_at:   z.string().min(1, 'Start time required'),
  duration:    z.coerce.number().min(15).max(480),
})

type LiveClassFormValues = z.infer<typeof schema>



const STATUS_BADGE: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  live:      'bg-red-100 text-red-600',
  ended:     'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-50 text-red-400',
}

export default function LiveClassSchedulerPage() {
  const [showForm, setShowForm]     = useState(false)
  const [actionClass, setActionClass] = useState<LiveClass | null>(null)

  const { data: classesData, isLoading } = useTeacherLiveClasses()
  const { data: coursesData }            = useTeacherCourses()
  const scheduleMutation                 = useScheduleLiveClass()
  const startMutation                    = useStartClass()
  const endMutation                      = useEndClass()
  const cancelMutation                   = useCancelClass()

  const classes = (classesData as any)?.data ?? []
  const courses = (coursesData as any)?.data ?? []

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } =
useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
    resolver: zodResolver(schema),
  defaultValues: { provider: 'jitsi', duration: 60 },
})

 const onSubmit = async (data: LiveClassFormValues) => {
  try {
    await scheduleMutation.mutateAsync({
      courseId: data.course_id,
      data: { ...data, starts_at: new Date(data.starts_at).toISOString() },
    });
    setShowForm(false);
    reset(); // Reset form after success
  } catch (error) {
    console.error("Scheduling failed:", error);
  }
}

  const handleJoin = async (liveClass: LiveClass) => {
    const { data } = await liveClassApi.teacherJoinUrl(liveClass.id)
    if (data.data.provider === 'zoom') {
      window.open(data.data.url, '_blank')
    } else {
      window.open(data.data.url, '_blank')
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-primary">Live Classes</h1>
          <p className="text-gray-500 text-sm mt-1">{classes.length} scheduled</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Schedule Class
        </motion.button>
      </motion.div>

      {/* Classes list */}
      <div className="space-y-3">
        {isLoading && (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        )}

        <AnimatePresence>
          {classes.map((liveClass: LiveClass) => (
            <motion.div
              key={liveClass.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`bg-white border rounded-2xl p-5 ${
                liveClass.status === 'live' ? 'border-red-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Date */}
                <div className="flex-shrink-0 text-center w-14 bg-primary/10 rounded-xl py-2">
                  <p className="text-lg font-bold text-primary">
                    {new Date(liveClass.starts_at).getDate()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(liveClass.starts_at).toLocaleDateString('en-US', { month: 'short' })}
                  </p>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{liveClass.title}</h3>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${STATUS_BADGE[liveClass.status]}`}>
                      {liveClass.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{liveClass.course?.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(liveClass.starts_at).toLocaleTimeString('en-US', {
                      hour: '2-digit', minute: '2-digit'
                    })} · {liveClass.duration_formatted} · {liveClass.provider}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {liveClass.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => startMutation.mutate(liveClass.id)}
                        disabled={startMutation.isPending}
                        className="px-3 py-1.5 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-60"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => handleJoin(liveClass)}
                        className="px-3 py-1.5 text-xs font-medium bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => setActionClass(liveClass)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  )}

                  {liveClass.status === 'live' && (
                    <>
                      <button
                        onClick={() => handleJoin(liveClass)}
                        className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        Join Class
                      </button>
                      <button
                        onClick={() => endMutation.mutate(liveClass.id)}
                        disabled={endMutation.isPending}
                        className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition"
                      >
                        End
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!isLoading && classes.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">No live classes scheduled yet.</p>
          </div>
        )}
      </div>

      {/* Schedule Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-lg font-bold text-primary mb-5">Schedule Live Class</h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

             <div>
  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
    Course
  </label>
  <select
    {...register('course_id')} // Manual onChange ki zaroorat nahi hai
    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
  >
    <option value="">Select course</option>
    {courses.map((c: any) => (
      <option key={c.id} value={c.id}>{c.title}</option>
    ))}
  </select>
  {errors.course_id && <p className="mt-1 text-xs text-red-500">{errors.course_id.message}</p>}
</div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Title
                  </label>
                  <input
                    {...register('title')}
                    placeholder="e.g. Week 3 — React Hooks Deep Dive"
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Platform
                    </label>
                    <select
                      {...register('provider')}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
                    >
                      <option value="jitsi">Jitsi (Free)</option>
                      <option value="zoom">Zoom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Duration (min)
                    </label>
                    <input
                      {...register('duration', { valueAsNumber: true })}
                      type="number"
                      min={15}
                      max={480}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Start Time
                  </label>
                  <input
                    {...register('starts_at')}
                    type="datetime-local"
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 ${errors.starts_at ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.starts_at && <p className="mt-1 text-xs text-red-500">{errors.starts_at.message}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); reset() }}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={scheduleMutation.isPending}
                    className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-60"
                  >
                    {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel confirmation */}
      <AnimatePresence>
        {actionClass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setActionClass(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-1">Cancel Class?</h3>
              <p className="text-gray-500 text-sm mb-5">
                Enrolled students will be notified that <strong>{actionClass.title}</strong> has been cancelled.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setActionClass(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl"
                >
                  Keep
                </button>
                <button
                  onClick={async () => {
                    await cancelMutation.mutateAsync({ id: actionClass.id })
                    setActionClass(null)
                  }}
                  disabled={cancelMutation.isPending}
                  className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-60"
                >
                  {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Class'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}