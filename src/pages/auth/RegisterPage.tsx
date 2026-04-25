import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRegister } from '../../hooks/useAuth'
import type { AxiosError } from 'axios'
import type { SubmitHandler } from 'react-hook-form'

const schema = z.object({
  name:                  z.string().min(2, 'Name must be at least 2 characters'),
  email:                 z.string().email('Please enter a valid email address'),
  password:              z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string(),
  role:                  z.enum(['student', 'teacher']).default('student'),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Passwords do not match',
  path:    ['password_confirmation'],
})

type FormData = z.infer<typeof schema>

const ROLES = [
  {
    value: 'student',
    label: 'Student',
    desc:  'Learn from expert instructors',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
  },
  {
    value: 'teacher',
    label: 'Instructor',
    desc:  'Share knowledge & earn',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
] as const

export default function RegisterPage() {
  const registerMutation              = useRegister()
  const [serverError, setServerError] = useState('')
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { role: 'student' },
  })

  const selectedRole = watch('role')

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setServerError('')
    try {
      await registerMutation.mutateAsync(data)
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string; errors?: Record<string, string[]> }>
      const errs     = axiosErr.response?.data?.errors
      if (errs) {
        const first = Object.values(errs)[0]?.[0]
        setServerError(first ?? 'Registration failed.')
      } else {
        setServerError(axiosErr.response?.data?.message ?? 'Registration failed.')
      }
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ─── Left branding panel ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#0F172A] flex-col justify-between p-12">
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#2563EB]/20 blur-[120px]" />
          <div className="absolute bottom-[10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-[#1E3A5F]/60 blur-[100px]" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl">EduCore</span>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-5">
            Start your<br />
            learning<br />
            <span className="text-[#60A5FA]">journey today.</span>
          </h2>
          <p className="text-white/50 text-base leading-relaxed mb-10">
            Join thousands of learners and instructors building the future of education.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {[
              { icon: '🎓', text: 'Access 500+ expert-led courses' },
              { icon: '🏆', text: 'Earn verified certificates' },
              { icon: '🎥', text: 'Join interactive live classes' },
              { icon: '💬', text: 'Learn at your own pace' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                  {f.icon}
                </div>
                <span className="text-white/60 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['Alice', 'Bob', 'Carol', 'Dave'].map((n) => (
                <img key={n}
                  src={`https://ui-avatars.com/api/?name=${n}&size=28&background=2563EB&color=fff`}
                  className="w-7 h-7 rounded-full border-2 border-[#0F172A]" alt="" />
              ))}
            </div>
            <p className="text-white/50 text-xs">
              <span className="text-white font-semibold">2,400+</span> people joined this month
            </p>
          </div>
        </div>
      </div>

      {/* ─── Right form panel ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#0F172A] px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-[#1E3A5F] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-[#1E3A5F] dark:text-white text-lg">EduCore</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Create your account</h1>
            <p className="text-[#64748B] dark:text-slate-400 text-sm mt-1">Start learning for free today</p>
          </div>

          {serverError && (
            <div className="mb-5 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-700 dark:text-red-400 text-sm">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-slate-300 mb-2">
                I want to join as
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setValue('role', r.value)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                      selectedRole === r.value
                        ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-[#1E3A5F]/30 dark:border-[#60A5FA]'
                        : 'border-[#E2E8F0] dark:border-slate-700 hover:border-[#CBD5E1] dark:hover:border-slate-600'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                      selectedRole === r.value
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#F1F5F9] dark:bg-slate-700 text-[#64748B] dark:text-slate-400'
                    }`}>
                      {r.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${
                        selectedRole === r.value
                          ? 'text-[#2563EB] dark:text-[#60A5FA]'
                          : 'text-[#374151] dark:text-slate-300'
                      }`}>{r.label}</p>
                      <p className="text-xs text-[#94A3B8] dark:text-slate-500 leading-tight">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-slate-300 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="John Doe"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm bg-white dark:bg-slate-800/50 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all
                    ${errors.name
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                      : 'border-[#E2E8F0] dark:border-slate-700 hover:border-[#CBD5E1]'
                    }`}
                />
              </div>
              {errors.name && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm bg-white dark:bg-slate-800/50 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all
                    ${errors.email
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                      : 'border-[#E2E8F0] dark:border-slate-700 hover:border-[#CBD5E1]'
                    }`}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className={`w-full pl-10 pr-11 py-3 border rounded-xl text-sm bg-white dark:bg-slate-800/50 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all
                    ${errors.password
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                      : 'border-[#E2E8F0] dark:border-slate-700 hover:border-[#CBD5E1]'
                    }`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPass
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                    }
                  </svg>
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-slate-300 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  {...register('password_confirmation')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  className={`w-full pl-10 pr-11 py-3 border rounded-xl text-sm bg-white dark:bg-slate-800/50 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all
                    ${errors.password_confirmation
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                      : 'border-[#E2E8F0] dark:border-slate-700 hover:border-[#CBD5E1]'
                    }`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showConfirm
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                    }
                  </svg>
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            {/* Terms */}
            <p className="text-xs text-[#94A3B8] dark:text-slate-500">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-[#2563EB] dark:text-[#60A5FA] hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-[#2563EB] dark:text-[#60A5FA] hover:underline">Privacy Policy</a>.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || registerMutation.isPending}
              className="w-full py-3 bg-[#1E3A5F] hover:bg-[#162d4a] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl
                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 shadow-lg shadow-[#1E3A5F]/20 dark:shadow-[#2563EB]/20"
            >
              {registerMutation.isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#64748B] dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-[#2563EB] dark:text-[#60A5FA] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}