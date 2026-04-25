import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery } from '@tanstack/react-query'
import { twoFactorApi } from '../../api/twoFactor.api'
import OtpInput from '../../components/ui/OtpInput'
import type { TwoFactorSetup } from '../../types/twoFactor.types'
import type { AxiosError } from 'axios'

const steps = ['Setup Shuru Karo', 'QR Code Scan Karo', 'Verify Karo']

export default function TwoFactorSetupPage() {
  const [step,      setStep]      = useState(0)
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null)
  const [isError,   setIsError]   = useState(false)
  const [errorMsg,  setErrorMsg]  = useState('')
  const [isDone,    setIsDone]    = useState(false)
  const [copied,    setCopied]    = useState(false)

  // Status check
  const { data: status } = useQuery({
    queryKey: ['2fa', 'status'],
    queryFn:  async () => {
      const { data } = await twoFactorApi.status()
      return data.data
    },
  })

  // Setup mutation
  const setupMutation = useMutation({
    mutationFn: () => twoFactorApi.setup(),
    onSuccess: ({ data }) => {
      setSetupData(data.data)
      setStep(1)
    },
  })

  // Enable mutation
  const enableMutation = useMutation({
    mutationFn: (code: string) => twoFactorApi.enable(code),
    onSuccess: () => {
      setIsDone(true)
      setStep(3)
    },
    onError: (err: AxiosError<{ message: string }>) => {
      setIsError(true)
      setErrorMsg(err.response?.data?.message ?? 'Code galat hai.')
    },
  })

  const copySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Two-Factor Authentication</h1>
          <p className="text-gray-500 text-sm mt-1">
            Apne account ko extra secure banao
          </p>
        </div>

        {/* Step indicator */}
        {!isDone && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <motion.div
                  animate={{
                    backgroundColor: i < step ? '#059669' : i === step ? '#2563EB' : '#E5E7EB',
                    scale: i === step ? 1.1 : 1,
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                >
                  {i < step ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </motion.div>
                {i < steps.length - 1 && (
                  <motion.div
                    animate={{ backgroundColor: i < step ? '#059669' : '#E5E7EB' }}
                    className="w-12 h-0.5 rounded"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <AnimatePresence mode="wait">

            {/* ─── Step 0: Intro ─────────────────────────────────── */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                {status?.two_factor_enabled ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-green-700 mb-2">2FA Already Active Hai!</h2>
                    <p className="text-gray-500 text-sm">Aapka account already secure hai.</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-primary">2FA Enable Karo</h2>
                      <p className="text-gray-500 text-sm mt-2">
                        Google Authenticator ya Authy install karo apne phone mein
                      </p>
                    </div>

                    {/* Benefits */}
                    {[
                      'Password leak hone par bhi account safe rahega',
                      'Har login par phone se verify karna hoga',
                      'Industry standard TOTP protocol use hota hai',
                    ].map((benefit, i) => (
                      <div key={i} className="flex items-start gap-3 mb-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-gray-600 text-sm">{benefit}</p>
                      </div>
                    ))}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setupMutation.mutate()}
                      disabled={setupMutation.isPending}
                      className="w-full mt-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-60"
                    >
                      {setupMutation.isPending ? 'Setup ho raha hai...' : 'Setup Shuru Karo'}
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}

            {/* ─── Step 1: QR Code ───────────────────────────────── */}
            {step === 1 && setupData && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <h2 className="text-xl font-bold text-primary text-center mb-2">
                  QR Code Scan Karo
                </h2>
                <p className="text-gray-500 text-sm text-center mb-6">
                  Authenticator app kholo aur camera se ye QR scan karo
                </p>

                {/* QR Code */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="flex justify-center mb-6"
                >
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
                    <img
                      src={setupData.qr_code_svg}
                      alt="2FA QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                </motion.div>

                {/* Manual key */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                  <p className="text-xs text-gray-500 mb-2 text-center">
                    QR scan nahi ho raha? Manual key use karo:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-center text-sm font-mono bg-white border border-gray-200 rounded-lg py-2 px-3 tracking-widest text-primary">
                      {setupData.secret}
                    </code>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={copySecret}
                      className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition"
                    >
                      {copied ? (
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </motion.button>
                  </div>
                  {copied && (
                    <p className="text-xs text-green-600 text-center mt-1">Copied!</p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition"
                >
                  Scan Ho Gaya — Aage Jao
                </motion.button>
              </motion.div>
            )}

            {/* ─── Step 2: Verify ────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <h2 className="text-xl font-bold text-primary text-center mb-2">
                  Code Verify Karo
                </h2>
                <p className="text-gray-500 text-sm text-center mb-8">
                  Authenticator app mein jo 6-digit code dikh raha hai wo daalo
                </p>

                <OtpInput
                  length={6}
                  onComplete={(code) => {
                    setErrorMsg('')
                    enableMutation.mutate(code)
                  }}
                  isError={isError}
                  isLoading={enableMutation.isPending}
                  onReset={() => setIsError(false)}
                />

                <AnimatePresence>
                  {errorMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-sm text-center mt-4"
                    >
                      {errorMsg}
                    </motion.p>
                  )}
                </AnimatePresence>

                {enableMutation.isPending && (
                  <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mt-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-gray-200 border-t-accent rounded-full"
                    />
                    Verify ho raha hai...
                  </div>
                )}

                <button
                  onClick={() => setStep(1)}
                  className="w-full mt-6 text-sm text-gray-400 hover:text-gray-600 transition"
                >
                  Wapas QR code par jao
                </button>
              </motion.div>
            )}

            {/* ─── Step 3: Success ───────────────────────────────── */}
            {step === 3 && isDone && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <motion.path
                      strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    />
                  </svg>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-primary mb-2"
                >
                  2FA Enable Ho Gaya!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-500 text-sm mb-8"
                >
                  Aapka account ab fully secure hai. Har login par code zaroori hoga.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-6"
                >
                  <p className="text-amber-800 text-xs font-semibold mb-1">
                    Zaroori baat yaad rakho:
                  </p>
                  <p className="text-amber-700 text-xs">
                    Agar phone kho jaye to account recover karna mushkil hoga.
                    Apne authenticator backup codes save karo.
                  </p>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.history.back()}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition"
                >
                  Dashboard Par Wapas Jao
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}