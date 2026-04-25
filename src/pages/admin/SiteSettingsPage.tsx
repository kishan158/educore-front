import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminSettings, useUpdateSettings } from '../../hooks/useAnalytics'
import { analyticsApi } from '../../api/analytics.api'

const GROUPS = [
  { key: 'general',      label: 'General',      icon: '🏠' },
  { key: 'appearance',   label: 'Appearance',   icon: '🎨' },
  { key: 'payment',      label: 'Payment',      icon: '💳' },
  { key: 'registration', label: 'Registration', icon: '👤' },
  { key: 'live_class',   label: 'Live Class',   icon: '📹' },
  { key: 'security',     label: 'Security',     icon: '🔒' },
  { key: 'seo',          label: 'SEO',          icon: '🔍' },
]

export default function SiteSettingsPage() {
  const { data: settings, isLoading } = useAdminSettings()
  const updateMutation                = useUpdateSettings()

  const [activeGroup, setActiveGroup] = useState('general')
  const [localValues, setLocalValues] = useState<Record<string, any>>({})
  const [saved, setSaved]             = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)

  // Flatten settings to localValues
  useEffect(() => {
    if (!settings) return
    const flat: Record<string, any> = {}
    Object.values(settings).forEach((group: any) => {
      Object.entries(group).forEach(([key, meta]: [string, any]) => {
        flat[key] = meta.value
      })
    })
    setLocalValues(flat)
  }, [settings])

  const handleSave = async () => {
    await updateMutation.mutateAsync(localValues)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleFileUpload = async (key: string, file: File) => {
    setUploadingKey(key)
    try {
      const { data } = await analyticsApi.uploadSettingFile(key, file)
      setLocalValues((prev) => ({ ...prev, [key]: data.data.url }))
    } finally {
      setUploadingKey(null)
    }
  }

  const groupSettings = settings?.[activeGroup] ?? {}

  return (
    <div className="p-6 max-w-5xl mx-auto">

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-primary">Site Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure your LMS platform</p>
      </motion.div>

      <div className="flex gap-6">

        {/* Sidebar */}
        <div className="w-44 flex-shrink-0">
          <div className="space-y-1">
            {GROUPS.map((group) => (
              <button
                key={group.key}
                onClick={() => setActiveGroup(group.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition ${
                  activeGroup === group.key
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span style={{ fontSize: '16px' }}>{group.icon}</span>
                {group.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings panel */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">

            <AnimatePresence mode="wait">
              <motion.div
                key={activeGroup}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                {isLoading ? (
                  <div className="space-y-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : Object.entries(groupSettings).map(([key, meta]: [string, any]) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      {meta.label}
                    </label>

                    {/* Boolean toggle */}
                    {meta.type === 'boolean' && (
                      <button
                        onClick={() => setLocalValues((p) => ({ ...p, [key]: !p[key] }))}
                        className={`relative w-12 h-6 rounded-full transition ${
                          localValues[key] ? 'bg-accent' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          localValues[key] ? 'translate-x-6' : ''
                        }`} />
                      </button>
                    )}

                    {/* Color picker */}
                    {meta.type === 'color' && (
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={localValues[key] ?? '#000000'}
                          onChange={(e) => setLocalValues((p) => ({ ...p, [key]: e.target.value }))}
                          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                        />
                        <input
                          value={localValues[key] ?? ''}
                          onChange={(e) => setLocalValues((p) => ({ ...p, [key]: e.target.value }))}
                          placeholder="#000000"
                          className="w-36 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 font-mono"
                        />
                      </div>
                    )}

                    {/* File upload */}
                    {meta.type === 'file' && (
                      <div className="flex items-center gap-3">
                        {localValues[key] && (
                          <img
                            src={localValues[key]}
                            alt={key}
                            className="w-12 h-12 object-contain border border-gray-200 rounded-xl"
                          />
                        )}
                        <label className="cursor-pointer">
                          <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition">
                            {uploadingKey === key ? 'Uploading...' : 'Upload'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleFileUpload(key, file)
                            }}
                          />
                        </label>
                      </div>
                    )}

                    {/* Select for specific keys */}
                    {meta.type === 'string' && [
                      'student_registration', 'teacher_registration', 'live_class_provider', 'theme_mode'
                    ].includes(key) && (
                      <select
                        value={localValues[key] ?? ''}
                        onChange={(e) => setLocalValues((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full max-w-xs px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
                      >
                        {key === 'theme_mode' && (
                          <>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                          </>
                        )}
                        {(key === 'student_registration' || key === 'teacher_registration') && (
                          <>
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                            <option value="invite_only">Invite Only</option>
                          </>
                        )}
                        {key === 'live_class_provider' && (
                          <>
                            <option value="jitsi">Jitsi (Free)</option>
                            <option value="zoom">Zoom</option>
                          </>
                        )}
                      </select>
                    )}

                    {/* Textarea for custom_css */}
                    {key === 'custom_css' && (
                      <textarea
                        value={localValues[key] ?? ''}
                        onChange={(e) => setLocalValues((p) => ({ ...p, [key]: e.target.value }))}
                        rows={6}
                        placeholder="/* Custom CSS */"
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 font-mono resize-none"
                      />
                    )}

                    {/* Default string/integer input */}
                    {meta.type !== 'boolean' &&
                     meta.type !== 'color'   &&
                     meta.type !== 'file'    &&
                     key !== 'custom_css'    &&
                     !['student_registration', 'teacher_registration', 'live_class_provider', 'theme_mode'].includes(key) && (
                      <input
                        value={localValues[key] ?? ''}
                        onChange={(e) => setLocalValues((p) => ({
                          ...p,
                          [key]: meta.type === 'integer' ? Number(e.target.value) : e.target.value
                        }))}
                        type={meta.type === 'integer' ? 'number' : 'text'}
                        className="w-full max-w-md px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
                      />
                    )}

                    {meta.description && (
                      <p className="text-xs text-gray-400 mt-1">{meta.description}</p>
                    )}
                  </div>
                ))}

                {Object.keys(groupSettings).length === 0 && !isLoading && (
                  <p className="text-gray-400 text-sm">No settings in this group.</p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Save button */}
            <div className="mt-8 pt-5 border-t border-gray-100 flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-60"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
              </motion.button>

              <AnimatePresence>
                {saved && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-green-600 text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved!
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}