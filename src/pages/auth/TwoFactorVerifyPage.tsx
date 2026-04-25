import { useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { twoFactorApi } from '../../api/twoFactor.api'
import { useAuthStore } from '../../stores/authStore'
import OtpInput from '../../components/ui/OtpInput'
import type { AxiosError } from 'axios'

export default function TwoFactorVerifyPage() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const setAuth   = useAuthStore((s) => s.setAuth)
  const userId    = (location.state as any)?.userId as number | undefined

  const [isError,   setIsError]   = useState(false)
  const [errorMsg,  setErrorMsg]  = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  if (!userId) return <Navigate to="/auth/login" replace />

  const mutation = useMutation({
    mutationFn: (code: string) =>
      twoFactorApi.loginVerify({ user_id: userId, code }),

    onSuccess: ({ data }) => {
      setIsSuccess(true)
      setTimeout(() => {
        setAuth(data.data.user, data.data.token)
        const redirect: Record<string, string> = {
          admin:   '/admin/dashboard',
          teacher: '/teacher/dashboard',
          student: '/student/dashboard',
        }
        navigate(redirect[data.data.user.role] ?? '/student/dashboard')
      }, 1200)
    },

    onError: (err: AxiosError<{ message: string }>) => {
      setIsError(true)
      setErrorMsg(err.response?.data?.message ?? 'Invalid code. Please try again.')
    },
  })

  const handleComplete = (code: string) => {
    setErrorMsg('')
    setIsError(false)
    mutation.mutate(code)
  }

  return (
    <div className="min-h-screen flex bg-[#0F172A]">

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-[#2563EB]/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#1E3A5F]/40 blur-[100px]" />
        <div className="absolute top-[60%] left-[5%] w-[200px] h-[200px] rounded-full bg-[#60A5FA]/10 blur-[60px]" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-lg shadow-[#2563EB]/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl">EduCore</span>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] rounded-3xl p-8 shadow-2xl">

            <AnimatePresence mode="wait">

              {/* ─── Success ──────────────────────────────────────── */}
              {isSuccess && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl shadow-green-500/30"
                  >
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <motion.path
                        strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </svg>
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2">Verified!</h2>
                  <p className="text-white/50 text-sm">Redirecting to your dashboard...</p>
                  <div className="flex items-center justify-center gap-1.5 mt-4">
                    {[0, 0.15, 0.3].map((d, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-white/30"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ─── Form ─────────────────────────────────────────── */}
              {!isSuccess && (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                  {/* Icon */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                      className="w-16 h-16 bg-[#2563EB]/20 border border-[#2563EB]/30 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    >
                      <svg className="w-8 h-8 text-[#60A5FA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </motion.div>
                    <h1 className="text-2xl font-bold text-white">Two-Factor Authentication</h1>
                    <p className="text-white/50 text-sm mt-2 leading-relaxed">
                      Enter the 6-digit code from your authenticator app
                    </p>
                  </div>

                  {/* OTP Input */}
                  <div className="mb-6">
                    <OtpInput
                      length={6}
                      onComplete={handleComplete}
                      isError={isError}
                      isLoading={mutation.isPending}
                      onReset={() => { setIsError(false); setErrorMsg('') }}
                    />
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {errorMsg && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-3 p-4 bg-red-500/15 border border-red-500/25 rounded-xl">
                          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <p className="text-red-300 text-sm">{errorMsg}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Loading indicator */}
                  {mutation.isPending && (
                    <div className="flex items-center justify-center gap-2 text-white/50 text-sm mb-4">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verifying...
                    </div>
                  )}

                  {/* Help box */}
                  <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded bg-[#2563EB]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-[#60A5FA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-white/40 text-xs">Open Google Authenticator or Authy on your device</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded bg-[#2563EB]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-[#60A5FA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-white/40 text-xs">The code refreshes every 30 seconds</p>
                    </div>
                  </div>

                  {/* Back button */}
                  <button
                    type="button"
                    onClick={() => navigate('/auth/login')}
                    className="w-full mt-5 flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors py-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Sign In
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}