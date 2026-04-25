import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useChapters,
  useCreateChapter,
  useDeleteChapter,
} from '../../hooks/useCourses'
import { courseApi } from '../../api/course.api'
import type { Chapter, Lesson } from '../../types/course.types'

function LessonTypeIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    video: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    text: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    pdf: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  }
  return <span className="text-gray-400">{icons[type] ?? icons.video}</span>
}

function AddLessonRow({ chapterId, courseId, onAdded }: {
  chapterId: number
  courseId:  number
  onAdded:   () => void
}) {
  const [show, setShow]   = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType]   = useState('video')
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleAdd = async () => {
    if (!title.trim()) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title', title)
      fd.append('type', type)
      if (type === 'video' && videoUrl) fd.append('video_url', videoUrl)
      await courseApi.createLesson(chapterId, fd)
      setTitle('')
      setVideoUrl('')
      setShow(false)
      onAdded()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 pb-3">
      {!show ? (
        <button
          onClick={() => setShow(true)}
          className="flex items-center gap-2 text-xs text-accent hover:text-accent/80 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Lesson
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2"
        >
          <div className="flex gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lesson title"
              autoFocus
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
            >
              <option value="video">Video</option>
              <option value="text">Text</option>
              <option value="pdf">PDF</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>

          {type === 'video' && (
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Video URL (YouTube, Vimeo, S3...)"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setShow(false); setTitle('') }}
              className="flex-1 py-1.5 text-xs border border-gray-200 text-gray-500 rounded-lg hover:bg-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!title.trim() || loading}
              className="flex-1 py-1.5 text-xs bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition disabled:opacity-60"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function CurriculumPage() {
  const { id }     = useParams<{ id: string }>()
  const courseId   = Number(id)
  const { data: chapters = [], refetch } = useChapters(courseId)
  const createChapterMutation = useCreateChapter()
  const deleteChapterMutation = useDeleteChapter()

  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [addingChapter, setAddingChapter]     = useState(false)
  const [openChapters, setOpenChapters]       = useState<Set<number>>(new Set())

  const toggleChapter = (id: number) => {
    setOpenChapters((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) return
    await createChapterMutation.mutateAsync({
      courseId,
      data: { title: newChapterTitle },
    })
    setNewChapterTitle('')
    setAddingChapter(false)
    refetch()
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-primary">Curriculum Builder</h1>
        <p className="text-gray-500 text-sm mt-1">
          {chapters.length} chapters · {chapters.reduce((s, c) => s + (c.lessons?.length ?? 0), 0)} lessons
        </p>
      </motion.div>

      {/* Chapters */}
      <div className="space-y-3">
        <AnimatePresence>
          {chapters.map((chapter, ci) => (
            <motion.div
              key={chapter.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
            >
              {/* Chapter Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => toggleChapter(chapter.id)}
              >
                <span className="w-6 h-6 bg-primary/10 text-primary text-xs font-bold rounded-lg flex items-center justify-center flex-shrink-0">
                  {ci + 1}
                </span>
                <span className="flex-1 text-sm font-semibold text-gray-900">
                  {chapter.title}
                </span>
                <span className="text-xs text-gray-400">
                  {chapter.lessons_count} lessons
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteChapterMutation.mutate({ courseId, chapterId: chapter.id })
                  }}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <motion.svg
                  animate={{ rotate: openChapters.has(chapter.id) ? 90 : 0 }}
                  className="w-4 h-4 text-gray-400 flex-shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </motion.svg>
              </div>

              {/* Lessons */}
              <AnimatePresence>
                {openChapters.has(chapter.id) && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-100">
                      {chapter.lessons?.map((lesson, li) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 hover:bg-gray-50/50 transition"
                        >
                          <span className="text-xs text-gray-300 w-4 text-right">{li + 1}</span>
                          <LessonTypeIcon type={lesson.type as string} />
                          <span className="flex-1 text-sm text-gray-700">{lesson.title}</span>
                          {lesson.duration > 0 && (
                            <span className="text-xs text-gray-400">{lesson.duration_formatted}</span>
                          )}
                          {lesson.is_preview && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                              Preview
                            </span>
                          )}
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${lesson.is_published ? 'bg-green-400' : 'bg-gray-300'}`} />
                        </div>
                      ))}

                      <AddLessonRow
                        chapterId={chapter.id}
                        courseId={courseId}
                        onAdded={refetch}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Chapter */}
      <div className="mt-4">
        {addingChapter ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white border border-gray-200 rounded-2xl p-4 flex gap-3"
          >
            <input
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              placeholder="Chapter title"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
              className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <button
              onClick={() => { setAddingChapter(false); setNewChapterTitle('') }}
              className="px-3 py-2 border border-gray-200 text-gray-500 text-sm rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddChapter}
              disabled={!newChapterTitle.trim() || createChapterMutation.isPending}
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-60"
            >
              Add
            </button>
          </motion.div>
        ) : (
          <button
            onClick={() => setAddingChapter(true)}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 text-gray-500 text-sm font-medium rounded-2xl hover:border-accent hover:text-accent transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Chapter
          </button>
        )}
      </div>
    </div>
  )
}