import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useVerifyCertificate } from '../../hooks/useCertificates'

export default function CertificateVerifyPage() {
  const { hash }            = useParams<{ hash: string }>()
  const { data, isLoading, isError } = useVerifyCertificate(hash ?? '')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {isLoading && (
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-2 border-gray-200 border-t-accent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-500 text-sm">Verifying certificate...</p>
          </div>
        )}

        {isError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-red-200 rounded-3xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-700 mb-2">Invalid Certificate</h2>
            <p className="text-gray-500 text-sm">
              This certificate could not be verified. It may be invalid or expired.
            </p>
          </motion.div>
        )}

        {data && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-green-200 rounded-3xl overflow-hidden shadow-xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-primary to-accent p-8 text-center relative">
              <div className="absolute top-4 right-4">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/40">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-1">
                Certificate of Completion
              </p>
              <h1 className="text-white text-2xl font-bold">EduCore LMS</h1>
            </div>

            {/* Details */}
            <div className="p-8 space-y-5">
              {[
                { label: 'Student',     value: data.user?.name },
                { label: 'Course',      value: data.course?.title },
                { label: 'Issued On',   value: data.issued_at_human },
                { label: 'Certificate', value: `#${data.certificate_number}` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 text-right max-w-xs">
                    {item.value}
                  </span>
                </div>
              ))}

              <div className="pt-2 text-center">
                <p className="text-xs text-gray-400">
                  This certificate was issued by EduCore LMS and is authentic.
                </p>
              </div>

              {data.pdf_url && (
                <a
                  href={data.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-primary text-white text-sm font-semibold rounded-xl text-center hover:bg-primary/90 transition"
                >
                  Download Certificate PDF
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}