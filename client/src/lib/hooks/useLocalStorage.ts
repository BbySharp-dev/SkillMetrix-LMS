import { useState, useCallback } from "react"

/**
 * useLocalStorage — hook generic để đọc/ghi vào localStorage với type-safety.
 * 
 * @example
 * const [token, setToken, clearToken] = useLocalStorage('token', null as string | null)
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.warn(`Lỗi khi đọc key "${key}" từ localStorage:`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue((prevValue) => {
        const valueToStore = value instanceof Function ? value(prevValue) : value
        
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
        
        return valueToStore
      })
    } catch (error) {
      console.warn(`Lỗi khi lưu key "${key}" vào localStorage:`, error)
    }
  }, [key])

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Lỗi khi xóa key "${key}" khỏi localStorage:`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}