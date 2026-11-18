import { useState, useEffect } from 'react'
import { Search, MoreVertical, CreditCard, User, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Eye, Download } from 'lucide-react'
import { useAuthSync } from '@/hooks'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, Select } from '@/components/ui'
import { formatPrice, formatDate, formatRelativeTime, getStatusColor, cn } from '@/lib/utils'
import type { Transaction } from '@/types'

export function AdminPayments() {
  useAuthSync()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  const fetchTransactions = async (page = 1) => {
    setIsLoading(true)
    try {
      const response = await api.getTransactions({
        page,
        page_size: 20,
        status: statusFilter || undefined,
      })
      setTransactions(response.items)
      setPagination({
        page: response.page,
        pageSize: response.page_size,
        total: response.total,
        totalPages: response.total_pages,
      })
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions(1)
  }, [statusFilter, methodFilter])

  const handleApprove = async (id: string) => {
    try {
      await api.approveTransaction(id)
      setTransactions(transactions.map(t => t.id === id ? { ...t, status: 'completed' as const } : t))
    } catch (error) {
      console.error('Failed to approve transaction:', error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await api.rejectTransaction(id)
      setTransactions(transactions.map(t => t.id === id ? { ...t, status: 'failed' as const } : t))
    } catch (error) {
      console.error('Failed to reject transaction:', error)
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'chapa': return <CreditCard className="w-4 h-4" />
      case 'telebirr': return <CreditCard className="w-4 h-4" />
      case 'cbe_birr': return <CreditCard className="w-4 h-4" />
      case 'manual_receipt': return <AlertCircle className="w-4 h-4" />
      default: return <DollarSign className="w-4 h-4" />
    }
  }

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      chapa: 'Chapa',
      telebirr: 'Telebirr',
      cbe_birr: 'CBE Birr',
      manual_receipt: 'Manual Receipt',
    }
    return labels[method] || method
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-500 mt-1">Review and approve payment transactions</p>
          </div>
          <Button variant="outline" onClick={() => fetchTransactions(1)}>
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card padding="md">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by reference or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select
              options={[
                { value: '', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' },
                { value: 'failed', label: 'Failed' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="Filter by status"
              className="w-40"
            />
            <Select
              options={[
                { value: '', label: 'All Methods' },
                { value: 'chapa', label: 'Chapa' },
                { value: 'telebirr', label: 'Telebirr' },
                { value: 'cbe_birr', label: 'CBE Birr' },
                { value: 'manual_receipt', label: 'Manual Receipt' },
              ]}
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              placeholder="Filter by method"
              className="w-48"
            />
          </div>
        </Card>

        {/* Transactions Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-32" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-32" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24" /></td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <code className="text-sm font-mono text-gray-900">{tx.transaction_reference}</code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{tx.user?.full_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{formatPrice(tx.amount)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="info">{tx.payment_type.replace('_', ' ')}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getMethodIcon(tx.payment_method)}
                          <span className="text-sm text-gray-700">{getMethodLabel(tx.payment_method)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={cn('badge', getStatusColor(tx.status))} variant="default">
                          {tx.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {tx.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {tx.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatRelativeTime(tx.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {tx.receipt_image_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setSelectedTransaction(tx); setShowReceipt(true); }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {tx.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:bg-green-50"
                                onClick={() => handleApprove(tx.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleReject(tx.id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => fetchTransactions(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => fetchTransactions(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Receipt Modal */}
        {showReceipt && selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowReceipt(false)}>
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment Receipt</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowReceipt(false)}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Reference</p>
                    <p className="font-mono text-gray-900">{selectedTransaction.transaction_reference}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Amount</p>
                    <p className="font-medium text-gray-900">{formatPrice(selectedTransaction.amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Type</p>
                    <p className="text-gray-900">{selectedTransaction.payment_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Method</p>
                    <p className="text-gray-900">{getMethodLabel(selectedTransaction.payment_method)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">User</p>
                    <p className="text-gray-900">{selectedTransaction.user?.full_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="text-gray-900">{formatDate(selectedTransaction.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <Badge className={getStatusColor(selectedTransaction.status)}>{selectedTransaction.status}</Badge>
                  </div>
                  <div>
                    <p className="text-gray-500">Verified By</p>
                    <p className="text-gray-900">{selectedTransaction.verified_by ? 'Admin' : 'Not verified'}</p>
                  </div>
                </div>
                {selectedTransaction.receipt_image_url && (
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Receipt Image</p>
                    <img
                      src={selectedTransaction.receipt_image_url}
                      alt="Payment receipt"
                      className="max-w-full h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}