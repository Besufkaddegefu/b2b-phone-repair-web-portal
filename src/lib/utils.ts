import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy')
}

export function formatDateTime(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy h:mm a')
}

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

export function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    original_pulled: 'Original (Pulled)',
    oem_new: 'OEM New',
    aftermarket: 'Aftermarket',
    for_parts_only: 'For Parts Only',
  }
  return labels[condition] || condition
}

export function getConditionColor(condition: string): string {
  const colors: Record<string, string> = {
    original_pulled: 'bg-blue-100 text-blue-800',
    oem_new: 'bg-green-100 text-green-800',
    aftermarket: 'bg-yellow-100 text-yellow-800',
    for_parts_only: 'bg-red-100 text-red-800',
  }
  return colors[condition] || 'bg-gray-100 text-gray-800'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    past_due: 'bg-yellow-100 text-yellow-800',
    canceled: 'bg-red-100 text-red-800',
    pending_approval: 'bg-blue-100 text-blue-800',
    pending: 'bg-gray-100 text-gray-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800',
    moderator: 'bg-blue-100 text-blue-800',
    technician: 'bg-gray-100 text-gray-800',
  }
  return colors[role] || 'bg-gray-100 text-gray-800'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function generateCSV(data: unknown[], headers: string[]): string {
  const rows = [headers.join(',')]
  for (const item of data) {
    const row = headers.map((h) => {
      const value = (item as Record<string, unknown>)[h]
      if (value === null || value === undefined) return ''
      const str = String(value)
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
    })
    rows.push(row.join(','))
  }
  return rows.join('\n')
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}