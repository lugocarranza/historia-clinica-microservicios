import { useState, useCallback, useEffect, useRef } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const show = useCallback((msg, error = false) => {
    clearTimer()
    setToast({ msg, error })
    timerRef.current = setTimeout(() => {
      setToast(null)
      timerRef.current = null
    }, 3000)
  }, [clearTimer])

  const success = useCallback((msg) => show(msg, false), [show])
  const error = useCallback((msg) => show(msg, true), [show])
  const hideToast = useCallback(() => {
    clearTimer()
    setToast(null)
  }, [clearTimer])

  useEffect(() => () => clearTimer(), [clearTimer])

  return { toast, success, error, hideToast }
}
