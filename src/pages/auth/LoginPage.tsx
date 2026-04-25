import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLogin } from '../../hooks/useAuth'
import type { AxiosError } from 'axios'

const schema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const location       = useLocation()
  const successMessage = (location.state as any)?.message
  const loginMutation  = useLogin()
  const [serverError, setServerError] = useState('')
  const [showPass, setShowPass]       = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await loginMutation.mutateAsync(data)
    } catch (err) {
      const e = err as AxiosError<{ message: string }>
      setServerError(e.response?.data?.message ?? 'Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ─── Left panel — branding ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0F172A]">
        {/* Mesh gradient */}
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#2563EB]/30 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#1E3A5F]/50 blur-[100px]" />
          <div className="absolute top-[40%] right-[10%] w-[200px] h-[200px] rounded-full bg-[#60A5FA]/20 blur-[60px]" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">EduCore</span>
          </div>

          {/* Center content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/70 text-xs font-medium">10,000+ active learners</span>
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Learn without<br />
              <span className="text-[#60A5FA]">limits.</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              Access world-class courses, live classes, and earn certificates that matter.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              {[
                { val: '500+', label: 'Courses' },
                { val: '50K+', label: 'Students' },
                { val: '4.9★', label: 'Rating' },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-white text-xl font-bold">{s.val}</p>
                  <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-white/70 text-sm leading-relaxed italic">
              "EduCore transformed how I learn. The course quality is exceptional and the platform is incredibly intuitive."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <img src="https://ui-avatars.com/api/?name=Sarah+Chen&size=32&background=2563EB&color=fff"
                className="w-8 h-8 rounded-full" alt="" />
              <div>
                <p className="text-white text-xs font-semibold">Sarah Chen</p>
                <p className="text-white/40 text-xs">Full Stack Developer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right panel — form ────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#0F172A] px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-[#1E3A5F] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-[#1E3A5F] dark:text-white text-lg">EduCore</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Welcome back</h1>
            <p className="text-[#64748B] dark:text-slate-400 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          {successMessage && (
            <div className="mb-5 flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-700 dark:text-green-400 text-sm">{successMessage}</p>
            </div>
          )}

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
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm bg-white dark:bg-slate-800/50 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all
                    ${errors.email
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                      : 'border-[#E2E8F0] dark:border-slate-700 hover:border-[#CBD5E1] dark:hover:border-slate-600'
                    }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#374151] dark:text-slate-300">
                  Password
                </label>
                <Link to="/auth/forgot-password"
                  className="text-xs text-[#2563EB] hover:text-[#1D4ED8] dark:text-[#60A5FA] font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-11 py-3 border rounded-xl text-sm bg-white dark:bg-slate-800/50 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all
                    ${errors.password
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                      : 'border-[#E2E8F0] dark:border-slate-700 hover:border-[#CBD5E1] dark:hover:border-slate-600'
                    }`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors">
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || loginMutation.isPending}
              className="w-full py-3 bg-[#1E3A5F] hover:bg-[#162d4a] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl
                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 shadow-lg shadow-[#1E3A5F]/20 dark:shadow-[#2563EB]/20"
            >
              {loginMutation.isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#64748B] dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-[#2563EB] dark:text-[#60A5FA] font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}