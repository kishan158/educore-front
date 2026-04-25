import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { KeyboardEvent, ClipboardEvent } from 'react'
interface OtpInputProps {
  length?:   number
  onComplete: (code: string) => void
  isError?:  boolean
  isLoading?: boolean
  onReset?:  () => void
}

export default function OtpInput({
  length    = 6,
  onComplete,
  isError   = false,
  isLoading = false,
  onReset,
}: OtpInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''))
  const inputs              = useRef<(HTMLInputElement | null)[]>([])

  // Error hone par shake + reset
  useEffect(() => {
    if (isError) {
      setTimeout(() => {
        setValues(Array(length).fill(''))
        inputs.current[0]?.focus()
        onReset?.()
      }, 600)
    }
  }, [isError])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Sirf digits

    const newValues  = [...values]
    newValues[index] = value.slice(-1) // Sirf last char
    setValues(newValues)

    // Auto-focus next
    if (value && index < length - 1) {
      inputs.current[index + 1]?.focus()
    }

    // Auto-submit on last digit
    if (index === length - 1 && value) {
      const code = [...newValues.slice(0, -1), value].join('')
      if (code.length === length) {
        onComplete(code)
      }
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  // Paste handle
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return

    const newValues = Array(length).fill('')
    pasted.split('').forEach((char, i) => {
      newValues[i] = char
    })
    setValues(newValues)

    const focusIndex = Math.min(pasted.length, length - 1)
    inputs.current[focusIndex]?.focus()

    if (pasted.length === length) {
      onComplete(pasted)
    }
  }

  return (
    <motion.div
      className="flex gap-3 justify-center"
      animate={isError ? { x: [0, -8, 8, -8, 8, 0] } : {}}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      {values.map((val, i) => (
        <motion.input
          key={i}
          ref={(el) => { inputs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          disabled={isLoading}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className={`
            w-12 h-14 text-center text-xl font-bold rounded-xl border-2
            focus:outline-none transition-all duration-200 select-none
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            ${isError
              ? 'border-red-400 bg-red-50 text-red-600'
              : val
                ? 'border-accent bg-accent/5 text-accent'
                : 'border-gray-200 bg-white text-gray-800 focus:border-accent focus:bg-accent/5'
            }
          `}
        />
      ))}
    </motion.div>
  )
}