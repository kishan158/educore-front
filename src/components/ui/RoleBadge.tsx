import { motion } from 'framer-motion'
import { ROLE_OPTIONS } from '../../types/role.types'
import type { RoleName } from '../../types/role.types'

interface Props {
  role: RoleName
  size?: 'sm' | 'md'
}

export default function RoleBadge({ role, size = 'md' }: Props) {
  const option = ROLE_OPTIONS.find((r) => r.name === role)
  if (!option) return null

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center gap-1.5 font-semibold rounded-full
        ${option.bgColor} ${option.color}
        ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}
      `}
    >
      <span className={`rounded-full ${
        role === 'admin'   ? 'bg-amber-400' :
        role === 'teacher' ? 'bg-teal-400'  : 'bg-blue-400'
      } ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
      {option.label}
    </motion.span>
  )
}