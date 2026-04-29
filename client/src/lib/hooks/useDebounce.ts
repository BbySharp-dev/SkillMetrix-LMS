import { useState, useEffect } from "react"

/**
 * useDebounce — trì hoãn cập nhật giá trị cho đến khi người dùng ngừng tương tác.
 * Dùng cho search input, filter input tránh gọi API liên tục.
 *
 * @param value - giá trị cần debounce
 * @param delay - thời gian chờ ms (mặc định 300ms)
 *
 * @example
 * const debouncedSearch = useDebounce(search, 500)
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
