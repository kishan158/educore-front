import { STATUS_OPTIONS, LEVEL_OPTIONS } from '../../types/course.types'
import type { CourseStatus, CourseLevel } from '../../types/course.types'

export function StatusBadge({ status }: { status: CourseStatus }) {
  const opt = STATUS_OPTIONS.find((s) => s.value === status)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${opt?.color ?? 'bg-gray-100 text-gray-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'published' ? 'bg-green-500' :
        status === 'pending'   ? 'bg-amber-500' :
        status === 'rejected'  ? 'bg-red-500'   :
        status === 'approved'  ? 'bg-blue-500'  : 'bg-gray-400'
      }`} />
      {opt?.label ?? status}
    </span>
  )
}

export function LevelBadge({ level }: { level: CourseLevel }) {
  const opt = LEVEL_OPTIONS.find((l) => l.value === level)
  return (
    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${opt?.color ?? 'bg-gray-100 text-gray-600'}`}>
      {opt?.label ?? level}
    </span>
  )
}