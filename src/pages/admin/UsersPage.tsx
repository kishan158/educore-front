import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUsers, useAssignRole, useToggleActive, useDeleteUser } from '../../hooks/useAdminUsers'
import RoleBadge from '../../components/ui/RoleBadge'
import type { RoleName, UserFilters } from '../../types/role.types'
import type { User } from '../../types/auth.types'

const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.04 } },
}

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0 },
}

export default function UsersPage() {
  const [filters, setFilters] = useState<UserFilters>({})
  const [search,  setSearch]  = useState('')
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null)
  const [assignModal,   setAssignModal]   = useState<User | null>(null)

  const { data, isLoading }  = useUsers(filters)
  const assignRoleMutation   = useAssignRole()
  const toggleActiveMutation = useToggleActive()
  const deleteMutation       = useDeleteUser()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters((f) => ({ ...f, search }))
  }

  const handleRoleFilter = (role: RoleName | '') => {
    setFilters((f) => ({ ...f, role: role || undefined }))
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* ─── Header ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-primary">User Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          {data?.meta.total ?? 0} users registered
        </p>
      </motion.div>

      {/* ─── Filters ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center"
      >
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Naam ya email search karo..."
            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition"
          >
            Search
          </button>
        </form>

        {/* Role filter pills */}
        <div className="flex gap-2">
          {[
            { label: 'Sab', value: '' as '' },
            { label: 'Admin',   value: 'admin'   as RoleName },
            { label: 'Teacher', value: 'teacher' as RoleName },
            { label: 'Student', value: 'student' as RoleName },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleRoleFilter(opt.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                (filters.role ?? '') === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ─── Table ───────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">User</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Joined</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="p-8 text-center text-gray-400 text-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 border-2 border-gray-200 border-t-accent rounded-full mx-auto mb-2"
            />
            Users load ho rahe hain...
          </div>
        )}

        {/* Rows */}
        <AnimatePresence>
          {!isLoading && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {data?.data.map((user) => (
                <motion.div
                  key={user.id}
                  variants={rowVariants}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition items-center"
                >
                  {/* User info */}
                  <div className="col-span-4 flex items-center gap-3">
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="col-span-2">
                    <RoleBadge role={user.role as RoleName} size="sm" />
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                      user.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        user.is_active ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-xs text-gray-400">
                    {new Date(user.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-2">

                    {/* Assign Role */}
                    <button
                      onClick={() => setAssignModal(user)}
                      className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition"
                      title="Role assign karo"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </button>

                    {/* Toggle Active */}
                    <button
                      onClick={() => toggleActiveMutation.mutate(user.id)}
                      className={`p-1.5 rounded-lg transition ${
                        user.is_active
                          ? 'text-green-500 hover:text-red-500 hover:bg-red-50'
                          : 'text-red-500 hover:text-green-500 hover:bg-green-50'
                      }`}
                      title={user.is_active ? 'Deactivate karo' : 'Activate karo'}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d={user.is_active
                            ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
                            : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                          }
                        />
                      </svg>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setConfirmDelete(user)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete karo"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!isLoading && data?.data.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm">Koi user nahi mila</p>
          </div>
        )}

        {/* Pagination */}
        {data && data.meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Page {data.meta.current_page} of {data.meta.last_page} —{' '}
              {data.meta.total} total users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                disabled={(filters.page ?? 1) <= 1}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
              >
                Pehle
              </button>
              <button
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                disabled={(filters.page ?? 1) >= data.meta.last_page}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
              >
                Agle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Assign Role Modal ───────────────────────────────── */}
      <AnimatePresence>
        {assignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setAssignModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-primary mb-1">Role Change Karo</h3>
              <p className="text-gray-500 text-sm mb-6">
                <strong>{assignModal.name}</strong> ka role change karo
              </p>

              <div className="space-y-3 mb-6">
                {(['admin', 'teacher', 'student'] as RoleName[]).map((role) => (
                  <button
                    key={role}
                    onClick={async () => {
                      await assignRoleMutation.mutateAsync({
                        id:   assignModal.id,
                        role,
                      })
                      setAssignModal(null)
                    }}
                    className={`w-full flex items-center gap-3 p-3 border-2 rounded-xl transition ${
                      assignModal.role === role
                        ? 'border-accent bg-accent/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <RoleBadge role={role} size="sm" />
                    <span className="text-sm text-gray-600 capitalize">{role}</span>
                    {assignModal.role === role && (
                      <svg className="w-4 h-4 text-accent ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setAssignModal(null)}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirm Modal ────────────────────────────── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              <h3 className="text-lg font-bold text-primary mb-1">User Delete Karo?</h3>
              <p className="text-gray-500 text-sm mb-6">
                <strong>{confirmDelete.name}</strong> permanently delete ho jayega.
                Ye action undo nahi hoga.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await deleteMutation.mutateAsync(confirmDelete.id)
                    setConfirmDelete(null)
                  }}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-60"
                >
                  {deleteMutation.isPending ? 'Delete ho raha...' : 'Haan, Delete Karo'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}