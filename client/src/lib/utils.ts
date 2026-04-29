import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// ============================================================
// Core
// ============================================================
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================
// Formatters
// ============================================================
export function formatCurrency(
  amount: number,
  currency = "VND",
  locale = "vi-VN"
): string {
  if (currency === "VND") {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatDate(
  date: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  },
  locale = "vi-VN"
): string {
  if (!date) return "—"
  return new Intl.DateTimeFormat(locale, options).format(new Date(date))
}

export function formatRelativeTime(
  date: string | Date | null | undefined,
  locale = "vi-VN"
): string {
  if (!date) return "—"
  
  // Tính theo thời gian đích trừ thời gian hiện tại
  // Âm = Quá khứ ("... trước"), Dương = Tương lai ("trong ...")
  const diffInMs = new Date(date).getTime() - Date.now()
  const diffInSecs = Math.round(diffInMs / 1000)
  const absSecs = Math.abs(diffInSecs)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  if (absSecs < 60) return rtf.format(diffInSecs, "second")

  const diffInMins = Math.round(diffInSecs / 60)
  if (absSecs < 3600) return rtf.format(diffInMins, "minute")

  const diffInHours = Math.round(diffInMins / 60)
  if (absSecs < 86400) return rtf.format(diffInHours, "hour")

  const diffInDays = Math.round(diffInHours / 24)
  if (absSecs < 2592000) return rtf.format(diffInDays, "day") // 30 ngày

  const diffInMonths = Math.round(diffInDays / 30)
  if (absSecs < 31536000) return rtf.format(diffInMonths, "month") // 365 ngày

  return rtf.format(Math.round(diffInMonths / 12), "year")
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`
}

// ============================================================
// String helpers
// ============================================================
export function getAvatarInitials(name: string): string {
  if (!name || !name.trim()) return "?"
  
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.charAt(0) || ""
  
  if (parts.length === 1) return first.toUpperCase()
  
  const last = parts[parts.length - 1]?.charAt(0) || ""
  return (first + last).toUpperCase()
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen - 1) + "…"
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/đ/g, "d") // Xử lý triệt để chữ đ tiếng Việt
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// ============================================================
// Number helpers
// ============================================================
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`)
}

// ============================================================
// Array helpers
// ============================================================
export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string | number
): Record<string | number, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item)
    ;(acc[key] ??= []).push(item)
    return acc
  }, {} as Record<string | number, T[]>)
}

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

// ============================================================
// DOM helpers
// ============================================================
export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: "smooth" })
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}