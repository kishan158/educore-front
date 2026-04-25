import { motion, AnimatePresence } from 'framer-motion'
import { useMyCertificates } from '../../hooks/useCertificates'
import type { Certificate } from '../../types/certificate.types'

function CertificateCard({ cert }: { cert: Certificate }) {
  const handleDownload = () => {
    if (cert.pdf_url) window.open(cert.pdf_url, '_blank')
  }

  const handleVerify = () => {
    window.open(cert.verification_url, '_blank')
  }

  const handleLinkedIn = () => {
    const url = encodeURIComponent(cert.verification_url)
    const title = encodeURIComponent(`${cert.course?.title} Certificate`)
    window.open(
      `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${title}&certUrl=${url}`,
      '_blank'
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
    >
      {/* Certificate preview banner */}
      <div className="relative h-36 bg-gradient-to-br from-primary via-accent to-blue-400 flex items-center justify-center overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-3 left-3 w-16 h-16 border-2 border-white/20 rounded-full" />
        <div className="absolute bottom-3 right-3 w-10 h-10 border-2 border-white/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/10 rounded-full" />

        {/* Seal icon */}
        <div className="text-center z-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-white/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p className="text-white font-bold text-sm">Certificate of Completion</p>
        </div>

        {/* Course thumbnail overlay */}
        {cert.course?.thumbnail_url && (
          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition">
            <img
              src={cert.course.thumbnail_url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
          {cert.course?.title}
        </h3>
        <p className="text-xs text-gray-400 mb-1">
          Instructor: {cert.course?.teacher.name}
        </p>
        <p className="text-xs text-gray-400 mb-4">
          Issued {cert.issued_at_human} · #{cert.certificate_number}
        </p>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            disabled={!cert.pdf_url}
            className="flex flex-col items-center gap-1 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl transition disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-xs font-medium">PDF</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleVerify}
            className="flex flex-col items-center gap-1 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs font-medium">Verify</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLinkedIn}
            className="flex flex-col items-center gap-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span className="text-xs font-medium">Share</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default function CertificatesPage() {
  const { data: certificates = [], isLoading } = useMyCertificates()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-primary">My Certificates</h1>
        <p className="text-gray-500 text-sm mt-1">
          {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : certificates.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden"
          animate="show"
        >
          {certificates.map((cert) => (
            <CertificateCard key={cert.id} cert={cert} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-gray-500 font-semibold mb-2">No Certificates Yet</h3>
          <p className="text-gray-400 text-sm">
            Complete a course to earn your first certificate.
          </p>
        </motion.div>
      )}
    </div>
  )
}