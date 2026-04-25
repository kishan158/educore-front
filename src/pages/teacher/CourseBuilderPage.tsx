import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateCourse, useUpdateCourse, useTeacherCourse } from '../../hooks/useCourses'
import { useCategoryTree } from '../../hooks/useCategories'
import { LEVEL_OPTIONS, LANGUAGE_OPTIONS } from '../../types/course.types'

const STEPS = ['Basic Info', 'Media', 'Pricing', 'Requirements'] as const

const schema = z.object({
  title: z.string().min(5),
  category_id: z.coerce.number().min(1), // Coerce use karein
  short_description: z.string().min(20),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  language: z.string().length(2),
  is_free: z.boolean(),
  price: z.coerce.number().min(0), // Coerce use karein
  preview_video: z.string().url().optional().or(z.literal('')),
})

type CourseFormValues = z.infer<typeof schema>

export default function CourseBuilderPage() {
  const { id }       = useParams<{ id?: string }>()
  const navigate     = useNavigate()
  const isEdit       = !!id
  const [step, setStep] = useState(0)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [requirements, setRequirements] = useState<string[]>([''])
  const [outcomes, setOutcomes]         = useState<string[]>([''])
  const [error, setError] = useState('')

  const { data: course }     = useTeacherCourse(Number(id))
  const { data: categories } = useCategoryTree()
  const createMutation       = useCreateCourse()
  const updateMutation       = useUpdateCourse()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      level: 'beginner',
      language: 'en',
      is_free: false,
      price: 0
    }
  })

  const isFree = watch('is_free')

 const buildFormData = (data: CourseFormValues): FormData => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        fd.append(k, String(v));
      }
    });

    requirements.filter(Boolean).forEach((r) => fd.append('requirements[]', r))
    outcomes.filter(Boolean).forEach((o)     => fd.append('outcomes[]', o))

    if (thumbnail) fd.append('thumbnail', thumbnail)

    return fd
  }

  const onSubmit = async (data: CourseFormValues) => {
    setError('')
    try {
      const fd = buildFormData(data)
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id: Number(id), data: fd as any })
      } else {
        await createMutation.mutateAsync(fd as any)
      }
      navigate('/teacher/courses')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong.')
    }
  }



useEffect(() => {
    if (course) {
      setValue('title', course.title);
      
      setValue('category_id', course.category_id || (course as any).category?.id);
      setValue('short_description', course.short_description);
      setValue('level', course.level as any);
      setValue('language', course.language);
      setValue('is_free', !!course.is_free);
      setValue('price', Number(course.price)); // Convert to Number
    }
  }, [course, setValue]);
  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Courses
          </button>
          <h1 className="text-2xl font-bold text-primary">
            {isEdit ? 'Edit Course' : 'Create New Course'}
          </h1>
        </div>

        {/* Step Pills */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                i === step
                  ? 'bg-primary text-white'
                  : i < step
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white border border-gray-200 text-gray-500'
              }`}
            >
              {i < step ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === step ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {i + 1}
                </span>
              )}
              {s}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <AnimatePresence mode="wait">

              {/* ─── Step 0: Basic Info ─────────────────────────── */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Course Title *
                    </label>
                    <input
                      {...register('title')}
                      placeholder="e.g. Complete Laravel 11 Masterclass"
                      className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Category *
                    </label>
                    <select
                      onChange={(e) => setValue('category_id', Number(e.target.value))}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
                    >
                      <option value="">Select category</option>
                      {categories?.map((cat) => (
                        <optgroup key={cat.id} label={cat.name}>
                          {cat.children?.map((child) => (
                            <option key={child.id} value={child.id}>
                              {child.name}
                            </option>
                          ))}
                          {!cat.children?.length && (
                            <option value={cat.id}>{cat.name}</option>
                          )}
                        </optgroup>
                      ))}
                    </select>
                    {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Short Description *
                    </label>
                    <textarea
                      {...register('short_description')}
                      rows={3}
                      placeholder="Brief overview of what students will learn..."
                      className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none ${errors.short_description ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.short_description && <p className="mt-1 text-xs text-red-500">{errors.short_description.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Level *
                      </label>
                      <select
                        {...register('level')}
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
                      >
                        {LEVEL_OPTIONS.map((l) => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Language *
                      </label>
                      <select
                        {...register('language')}
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
                      >
                        {LANGUAGE_OPTIONS.map((l) => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── Step 1: Media ─────────────────────────────── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="space-y-5"
                >
                  {/* Thumbnail */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Course Thumbnail
                    </label>
                    <div
                      className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-accent transition"
                      onClick={() => document.getElementById('thumb-input')?.click()}
                    >
                      {thumbnail ? (
                        <div>
                          <img
                            src={URL.createObjectURL(thumbnail)}
                            alt="Thumbnail preview"
                            className="w-full max-h-48 object-cover rounded-lg mb-2"
                          />
                          <p className="text-xs text-gray-400">{thumbnail.name}</p>
                        </div>
                      ) : (
                        <>
                          <svg className="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-gray-400">Click to upload thumbnail</p>
                          <p className="text-xs text-gray-300 mt-1">JPG, PNG, WebP · Max 3MB</p>
                        </>
                      )}
                    </div>
                    <input
                      id="thumb-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
                    />
                  </div>

                  {/* Preview Video */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Preview Video URL
                    </label>
                    <input
                      {...register('preview_video')}
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                    <p className="mt-1 text-xs text-gray-400">YouTube or Vimeo URL. Students can preview before enrolling.</p>
                  </div>
                </motion.div>
              )}

              {/* ─── Step 2: Pricing ───────────────────────────── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="space-y-5"
                >
                  {/* Free toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Free Course</p>
                      <p className="text-xs text-gray-500">Students enroll at no cost</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setValue('is_free', !isFree)}
                      className={`relative w-12 h-6 rounded-full transition ${isFree ? 'bg-green-500' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isFree ? 'translate-x-6' : ''}`} />
                    </button>
                  </div>

                  {!isFree && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                          Price (USD) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input
                            {...register('price', { valueAsNumber: true })}
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                          Discount Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ─── Step 3: Requirements / Outcomes ──────────── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="space-y-6"
                >
                  {/* Requirements */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                      Requirements
                    </label>
                    <div className="space-y-2">
                      {requirements.map((req, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            value={req}
                            onChange={(e) => {
                              const next = [...requirements]
                              next[i] = e.target.value
                              setRequirements(next)
                            }}
                            placeholder="e.g. Basic JavaScript knowledge"
                            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
                          />
                          <button
                            type="button"
                            onClick={() => setRequirements(requirements.filter((_, j) => j !== i))}
                            className="p-2 text-gray-400 hover:text-red-500 transition"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setRequirements([...requirements, ''])}
                        className="flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Requirement
                      </button>
                    </div>
                  </div>

                  {/* Outcomes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                      Learning Outcomes
                    </label>
                    <div className="space-y-2">
                      {outcomes.map((out, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            value={out}
                            onChange={(e) => {
                              const next = [...outcomes]
                              next[i] = e.target.value
                              setOutcomes(next)
                            }}
                            placeholder="e.g. Build REST APIs with Laravel"
                            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
                          />
                          <button
                            type="button"
                            onClick={() => setOutcomes(outcomes.filter((_, j) => j !== i))}
                            className="p-2 text-gray-400 hover:text-red-500 transition"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setOutcomes([...outcomes, ''])}
                        className="flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Outcome
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition disabled:opacity-40"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition"
              >
                Next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isEdit ? 'Save Changes' : 'Create Course'}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}