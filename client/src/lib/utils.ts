import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "VND", locale = "vi-VN"): string {
  const safeAmount = Number(amount) || 0;
  
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "VND" ? 0 : undefined,
  }).format(safeAmount)
}

export function formatDate(
  date: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" },
  locale = "vi-VN"
): string {
  if (!date) return "—"
  
  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) return "—"
  
  return new Intl.DateTimeFormat(locale, options).format(parsedDate)
}

export function formatRelativeTime(date: string | Date | null | undefined, locale = "vi-VN"): string {
  if (!date) return "—"
  
  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) return "—"
  
  const diffInSecs = Math.round((parsedDate.getTime() - Date.now()) / 1000)
  const absSecs = Math.abs(diffInSecs)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  if (absSecs < 60) return rtf.format(diffInSecs, "second")
  
  const diffInMins = Math.round(diffInSecs / 60)
  if (absSecs < 3600) return rtf.format(diffInMins, "minute")

  const diffInHours = Math.round(diffInMins / 60)
  if (absSecs < 86400) return rtf.format(diffInHours, "hour")

  const diffInDays = Math.round(diffInHours / 24)
  if (absSecs < 2592000) return rtf.format(diffInDays, "day")

  const diffInMonths = Math.round(diffInDays / 30)
  if (absSecs < 31536000) return rtf.format(diffInMonths, "month")

  return rtf.format(Math.round(diffInMonths / 12), "year")
}

export function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Number(seconds) || 0)
  const h = Math.floor(safeSeconds / 3600)
  const m = Math.floor((safeSeconds % 3600) / 60)
  const s = safeSeconds % 60

  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function formatPercentage(value: number, decimals = 0): string {
  return `${(Number(value) || 0).toFixed(decimals)}%`
}

export function getAvatarInitials(name?: string | null): string {
  if (!name?.trim()) return "?"
  
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.charAt(0) || ""
  const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) : ""
  
  return (first + last).toUpperCase()
}

export function truncate(str?: string | null, maxLen: number = 50): string {
  if (!str) return ""
  return str.length <= maxLen ? str : `${str.slice(0, maxLen - 1)}…`
}

export function slugify(str?: string | null): string {
  if (!str) return ""
  return str
    .toLowerCase()
    .replace(/đ/g, "d") 
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-z0-9]+/g, "-") 
    .replace(/^-+|-+$/g, "") 
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`)
}

export function groupBy<T>(array: T[], keyFn: (item: T) => string | number): Record<string | number, T[]> {
  if (!Array.isArray(array)) return {}
  
  return array.reduce((acc, item) => {
    const key = keyFn(item)
    ;(acc[key] ??= []).push(item)
    return acc
  }, {} as Record<string | number, T[]>)
}

export function unique<T>(array: T[]): T[] {
  if (!Array.isArray(array)) return []
  return Array.from(new Set(array))
}

export function scrollToTop(): void {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
}

export function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return Promise.reject(new Error("Trình duyệt không hỗ trợ Clipboard API"))
  }
  return navigator.clipboard.writeText(text)
}

export function getDashboardRoute(role?: string): string {
  switch (role) {
    case 'Admin': return '/admin';
    case 'Instructor': return '/instructor';
    default: return '/dashboard';
  }
}