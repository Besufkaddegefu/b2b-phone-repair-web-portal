import { useState, useCallback } from 'react'
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download, Trash2 } from 'lucide-react'
import { useAuthSync } from '@/hooks'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from '@/components/ui'
import { cn, generateCSV, downloadFile, formatPrice, getConditionLabel } from '@/lib/utils'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import type { BulkUploadResult } from '@/types'

const SAMPLE_HEADERS = [
  'category',
  'brand',
  'model_name',
  'part_name',
  'condition',
  'price',
  'is_negotiable',
  'description',
  'image_urls',
]

const SAMPLE_DATA = [
  {
    category: 'Screens',
    brand: 'Samsung',
    model_name: 'Galaxy S22 Ultra',
    part_name: 'Original OLED Screen',
    condition: 'original_pulled',
    price: 15000,
    is_negotiable: true,
    description: 'Original pulled screen, no scratches',
    image_urls: '',
  },
  {
    category: 'Motherboards',
    brand: 'Apple',
    model_name: 'iPhone 13 Pro',
    part_name: 'Clean Motherboard',
    condition: 'original_pulled',
    price: 25000,
    is_negotiable: false,
    description: 'Tested working motherboard',
    image_urls: '',
  },
]

export function AdminBulkUpload() {
  useAuthSync()
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<BulkUploadResult | null>(null)
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)
        setPreviewData(json as Record<string, unknown>[])
        setErrors([])
        setResult(null)
      } catch (error) {
        setErrors(['Failed to parse file. Please ensure it\'s a valid CSV or Excel file.'])
        setPreviewData([])
      }
    }
    reader.readAsArrayBuffer(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  })

  const validateRow = (row: Record<string, unknown>, index: number): string[] => {
    const rowErrors: string[] = []
    const required = ['category', 'brand', 'model_name', 'part_name', 'condition', 'price']

    for (const field of required) {
      if (!row[field] || String(row[field]).trim() === '') {
        rowErrors.push(`Row ${index + 1}: Missing required field "${field}"`)
      }
    }

    if (row.price && isNaN(Number(row.price))) {
      rowErrors.push(`Row ${index + 1}: Price must be a number`)
    }

    const validConditions = ['original_pulled', 'oem_new', 'aftermarket', 'for_parts_only']
    if (row.condition && !validConditions.includes(String(row.condition).toLowerCase())) {
      rowErrors.push(`Row ${index + 1}: Invalid condition. Must be one of: ${validConditions.join(', ')}`)
    }

    return rowErrors
  }

  const handleUpload = async () => {
    if (previewData.length === 0) return

    // Validate all rows
    const allErrors: string[] = []
    previewData.forEach((row, index) => {
      allErrors.push(...validateRow(row, index))
    })

    if (allErrors.length > 0) {
      setErrors(allErrors)
      return
    }

    setIsUploading(true)
    setErrors([])

    try {
      // Convert to CSV for upload
      const csv = generateCSV(previewData, SAMPLE_HEADERS)
      const blob = new Blob([csv], { type: 'text/csv' })
      const file = new File([blob], 'bulk_upload.csv', { type: 'text/csv' })

      const result = await api.bulkUploadListings(file)
      setResult(result)
    } catch (error) {
      setErrors(['Upload failed. Please try again.'])
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = (format: 'csv' | 'xlsx') => {
    if (format === 'csv') {
      const csv = generateCSV(SAMPLE_DATA, SAMPLE_HEADERS)
      downloadFile(csv, 'bulk_upload_template.csv', 'text/csv')
    } else {
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(SAMPLE_DATA)
      XLSX.utils.book_append_sheet(wb, ws, 'Template')
      XLSX.writeFile(wb, 'bulk_upload_template.xlsx')
    }
  }

  const clearAll = () => {
    setPreviewData([])
    setResult(null)
    setErrors([])
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Upload Listings</h1>
          <p className="text-gray-500 mt-1">Upload multiple parts at once via CSV or Excel</p>
        </div>

        {/* Upload Zone */}
        <Card padding="md">
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
              isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-1">
              {isDragActive ? 'Drop the file here...' : 'Drag & drop CSV or Excel file'}
            </p>
            <p className="text-gray-500 mb-4">or click to browse</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={downloadTemplate.bind(null, 'csv')} disabled={isUploading}>
                <Download className="w-4 h-4 mr-2" />
                Download CSV Template
              </Button>
              <Button variant="outline" onClick={downloadTemplate.bind(null, 'xlsx')} disabled={isUploading}>
                <Download className="w-4 h-4 mr-2" />
                Download Excel Template
              </Button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Required Columns:</h4>
            <div className="flex flex-wrap gap-2 text-sm">
              {SAMPLE_HEADERS.map((header) => (
                <Badge key={header} variant="default" className="font-mono">{header}</Badge>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Conditions: original_pulled, oem_new, aftermarket, for_parts_only
            </p>
          </div>
        </Card>

        {/* Errors */}
        {errors.length > 0 && (
          <Card padding="md" className="border-red-200 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-900 mb-2">Validation Errors</h4>
                <ul className="space-y-1 text-sm text-red-700">
                  {errors.slice(0, 10).map((error, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {error}
                    </li>
                  ))}
                  {errors.length > 10 && (
                    <li className="text-gray-500">... and {errors.length - 10} more errors</li>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Preview */}
        {previewData.length > 0 && (
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Preview ({previewData.length} rows)</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearAll}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
                <Button onClick={handleUpload} disabled={isUploading || errors.length > 0}>
                  {isUploading ? 'Uploading...' : 'Upload Listings'}
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {SAMPLE_HEADERS.map((header) => (
                      <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {previewData.slice(0, 20).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-900">{String(row.category ?? '')}</td>
                      <td className="px-4 py-2 text-gray-900">{String(row.brand ?? '')}</td>
                      <td className="px-4 py-2 text-gray-900">{String(row.model_name ?? '')}</td>
                      <td className="px-4 py-2 text-gray-900">{String(row.part_name ?? '')}</td>
                      <td className="px-4 py-2">
                        {row.condition ? (
                          <Badge variant="default">{getConditionLabel(String(row.condition))}</Badge>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-2 text-gray-900">{row.price ? formatPrice(Number(row.price)) : ''}</td>
                      <td className="px-4 py-2 text-gray-900">{row.is_negotiable ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2 text-gray-900 max-w-xs truncate">{String(row.description ?? '')}</td>
                      <td className="px-4 py-2 text-gray-900 text-xs">{String(row.image_urls ?? '')}</td>
                    </tr>
                  ))}
                  {previewData.length > 20 && (
                    <tr>
                      <td colSpan={SAMPLE_HEADERS.length} className="px-4 py-4 text-center text-gray-500">
                        ... and {previewData.length - 20} more rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Result */}
        {result && (
          <Card padding="md" className={cn(result.failed > 0 ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50')}>
            <div className="flex items-center gap-3">
              {result.failed === 0 ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              )}
              <div>
                <h4 className="font-medium text-gray-900">Upload Complete</h4>
                <p className="text-sm text-gray-600">
                  {result.success} listings created successfully
                  {result.failed > 0 && <span className="ml-2 text-red-600">, {result.failed} failed</span>}
                </p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-900 mb-2">Errors:</h5>
                <ul className="space-y-1 text-sm text-red-700 max-h-40 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      Row {err.row}: {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}