import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForgotPassword } from '../../hooks/useAuth'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const mutation              = useForgotPassword()
  const [sent, setSent]       = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email }: FormData) => {
    setServerError('')
    try {
      await mutation.mutateAsync(email)
      setSentEmail(email)
      setSent(true)
    } catch (err: any) {
      setServerError(err.response?.data?.message ?? 'Something went wrong. Please try again.')
    }
  }

  /* ─── Success state ───────────────────────────────────────────── */
  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A] px-4">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-[#1E3A5F] dark:bg-[#2563EB] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-[#1E3A5F] dark:text-white text-xl">EduCore</span>
          </div>

          <div className="bg-white dark:bg-slate-800/50 border border-[#E2E8F0] dark:border-slate-700 rounded-2xl p-8 text-center shadow-sm">

            {/* Animated email icon */}
            <div className="w-16 h-16 bg-[#EFF6FF] dark:bg-[#1E3A5F]/50 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce"
              style={{ animationDuration: '2s' }}>
              <svg className="w-8 h-8 text-[#2563EB] dark:text-[#60A5FA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">
              Check your inbox
            </h2>
            <p className="text-[#64748B] dark:text-slate-400 text-sm leading-relaxed mb-1">
              We've sent a password reset link to
            </p>
            <p className="text-[#1E3A5F] dark:text-[#60A5FA] font-semibold text-sm mb-6">
              {sentEmail}
            </p>

            <div className="bg-[#F8FAFC] dark:bg-slate-700/50 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Didn't receive the email? Check your spam folder, or{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-[#2563EB] dark:text-[#60A5FA] font-medium hover:underline"
                >
                  try a different email address
                </button>.
              </p>
            </div>

            <Link
              to="/auth/login"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#1E3A5F] dark:bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /* ─── Default state ───────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A] px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-[#1E3A5F] dark:bg-[#2563EB] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-bold text-[#1E3A5F] dark:text-white text-xl">EduCore</span>
        </div>

        <div className="bg-white dark:bg-slate-800/50 border border-[#E2E8F0] dark:border-slate-700 rounded-2xl p-8 shadow-sm">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#FEF3C7] dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#D97706] dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#0F172A] dark:text-white">Forgot your password?</h1>
            <p className="text-[#64748B] dark:text-slate-400 text-sm mt-1 leading-relaxed">
              No worries. Enter your email and we'll send you a reset link.
            </p>
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
                      : 'border-[#E2E8F0] dark:border-slate-700 hover:border-[#CBD5E1]'
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

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-3 bg-[#1E3A5F] hover:bg-[#162d4a] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl
                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 shadow-lg shadow-[#1E3A5F]/20 dark:shadow-[#2563EB]/20"
            >
              {mutation.isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending reset link...
                </>
              ) : (
                <>
                  Send Reset Link
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#F1F5F9] dark:border-slate-700">
            <Link
              to="/auth/login"
              className="flex items-center justify-center gap-2 text-sm text-[#64748B] dark:text-slate-400 hover:text-[#1E3A5F] dark:hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}