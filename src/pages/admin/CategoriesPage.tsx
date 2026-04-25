import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useCategories'
import type { Category, CategoryFormData } from '../../types/category.types'

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block w-3 h-3 rounded-full flex-shrink-0"
      style={{ backgroundColor: color }}
    />
  )
}

function CategoryRow({
  category,
  depth = 0,
  onEdit,
  onDelete,
}: {
  category:  Category
  depth?:    number
  onEdit:    (c: Category) => void
  onDelete:  (c: Category) => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className={`flex items-center gap-3 px-5 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${
          depth > 0 ? 'bg-gray-50/50' : ''
        }`}
        style={{ paddingLeft: `${20 + depth * 28}px` }}
      >
        {/* Toggle children */}
        {category.has_children ? (
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
          >
            <motion.svg
              animate={{ rotate: open ? 90 : 0 }}
              className="w-4 h-4"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </motion.svg>
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        <ColorDot color={category.color} />

        <span className={`flex-1 text-sm font-medium ${
          depth === 0 ? 'text-gray-900' : 'text-gray-600'
        }`}>
          {category.name}
        </span>

        <span className="text-xs text-gray-400 font-mono">{category.slug}</span>

        <span className="text-xs text-gray-400 w-20 text-center">
          {category.courses_count} courses
        </span>

        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          category.is_active
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {category.is_active ? 'Active' : 'Hidden'}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {open && category.children?.map((child) => (
          <CategoryRow
            key={child.id}
            category={child}
            depth={depth + 1}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </>
  )
}

// ─── Category Form Modal ──────────────────────────────────────────

function CategoryModal({
  category,
  categories,
  onClose,
}: {
  category?:   Category | null
  categories:  Category[]
  onClose:     () => void
}) {
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const isEdit         = !!category

  const [form, setForm] = useState<CategoryFormData>({
    name:      category?.name      ?? '',
    slug:      category?.slug      ?? '',
    parent_id: category?.parent?.id ?? null,
    color:     category?.color     ?? '#2563EB',
    icon:      category?.icon      ?? '',
    is_active: category?.is_active ?? true,
    order:     category?.order     ?? 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isEdit && category) {
      await updateMutation.mutateAsync({ id: category.id, data: form })
    } else {
      await createMutation.mutateAsync(form)
    }
    onClose()
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  // Only root categories as parent options
  const parentOptions = categories.filter((c) => !c.parent && c.id !== category?.id)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <h3 className="text-lg font-bold text-primary mb-5">
          {isEdit ? 'Edit Category' : 'New Category'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Category name"
              required
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {/* Parent */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Parent Category
            </label>
            <select
              value={form.parent_id ?? ''}
              onChange={(e) => setForm((f) => ({
                ...f,
                parent_id: e.target.value ? Number(e.target.value) : null,
              }))}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
            >
              <option value="">None (Root Category)</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Color + Icon row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  placeholder="#2563EB"
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Icon
              </label>
              <input
                value={form.icon ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="code, server, book..."
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          {/* Order + Active row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Sort Order
              </label>
              <input
                type="number"
                min={0}
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Status
              </label>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                className={`w-full py-2.5 text-sm font-medium rounded-xl border-2 transition ${
                  form.is_active
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                }`}
              >
                {form.is_active ? 'Active' : 'Hidden'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-60"
            >
              {isPending
                ? isEdit ? 'Saving...' : 'Creating...'
                : isEdit ? 'Save Changes' : 'Create Category'
              }
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useAdminCategories()
  const deleteMutation = useDeleteCategory()

  const [editTarget,   setEditTarget]   = useState<Category | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const showModal    = editTarget !== undefined
  const isNewModal   = editTarget === null

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-primary">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">
            {categories.length} root categories
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setEditTarget(null)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Category
        </motion.button>
      </motion.div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-5 pl-8">Name</div>
          <div className="col-span-2">Slug</div>
          <div className="col-span-2 text-center">Courses</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Loading shimmer */}
        {isLoading && (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Tree rows */}
        {!isLoading && categories.map((cat) => (
          <CategoryRow
            key={cat.id}
            category={cat}
            onEdit={(c) => setEditTarget(c)}
            onDelete={setDeleteTarget}
          />
        ))}

        {/* Empty */}
        {!isLoading && categories.length === 0 && (
          <div className="py-16 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className="text-sm text-gray-400">No categories yet.</p>
            <button
              onClick={() => setEditTarget(null)}
              className="mt-3 text-sm text-accent hover:underline"
            >
              Create your first category
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <CategoryModal
            category={isNewModal ? null : editTarget}
            categories={categories}
            onClose={() => setEditTarget(undefined)}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Category?</h3>
              <p className="text-gray-500 text-sm mb-6">
                <strong>"{deleteTarget.name}"</strong> will be permanently deleted.
                {deleteTarget.has_children && ' Its subcategories will become root categories.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await deleteMutation.mutateAsync(deleteTarget.id)
                    setDeleteTarget(null)
                  }}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-60"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}