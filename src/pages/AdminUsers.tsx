import { useState, useEffect } from 'react'
import { Search, MoreVertical, Shield, User, Mail, Phone, MapPin, CreditCard, Calendar } from 'lucide-react'
import { useAuthSync, useAdmin } from '@/hooks'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, Select } from '@/components/ui'
import { formatDate, formatRelativeTime, getStatusColor, getRoleColor, cn } from '@/lib/utils'
import type { UserWithSubscription, UserRole } from '@/types'

export function AdminUsers() {
  useAuthSync()
  const { adminStats, fetchStats } = useAdmin()
  const [users, setUsers] = useState<UserWithSubscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserWithSubscription | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [newRole, setNewRole] = useState<'technician' | 'admin' | 'moderator'>('technician')

  const fetchUsers = async (page = 1) => {
    setIsLoading(true)
    try {
      const response = await api.getUsers({
        page,
        page_size: 20,
        search: search || undefined,
        role: roleFilter || undefined,
      })
      setUsers(response.items)
      setPagination({
        page: response.page,
        pageSize: response.page_size,
        total: response.total,
        totalPages: response.total_pages,
      })
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(1)
    fetchStats()
  }, [search, roleFilter, statusFilter, fetchStats])

  const handleRoleChange = async () => {
    if (!selectedUser) return
    try {
      await api.updateUserRole(selectedUser.id, newRole)
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u))
      setShowRoleModal(false)
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const getSubscriptionStatus = (user: UserWithSubscription) => {
    if (!user.subscription) return 'No subscription'
    return user.subscription.status
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-500 mt-1">Manage technician and admin accounts</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchUsers(1)}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card padding="md">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select
              options={[
                { value: '', label: 'All Roles' },
                { value: 'technician', label: 'Technician' },
                { value: 'admin', label: 'Admin' },
                { value: 'moderator', label: 'Moderator' },
              ]}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
              placeholder="Filter by role"
              className="w-48"
            />
            <Select
              options={[
                { value: '', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'past_due', label: 'Past Due' },
                { value: 'canceled', label: 'Canceled' },
                { value: 'pending_approval', label: 'Pending' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="Filter by subscription"
              className="w-48"
            />
          </div>
        </Card>

        {/* Users Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-32" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-40" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-32" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24" /></td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name}</p>
                            <p className="text-sm text-gray-500">@{user.telegram_username || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-900">{user.phone_number}</p>
                          {user.clerk_user_id && (
                            <p className="text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              Clerk linked
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          {user.shop_name && <p className="font-medium text-gray-900">{user.shop_name}</p>}
                          {user.shop_location && (
                            <p className="text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {user.shop_location}
                            </p>
                          )}
                          {!user.shop_name && <p className="text-gray-400">No shop info</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role === 'admin' ? 'info' : user.role === 'moderator' ? 'success' : 'default'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {user.subscription ? (
                          <>
                            <Badge className={getStatusColor(user.subscription.status)} variant="default">
                              {user.subscription.status.replace('_', ' ')}
                            </Badge>
                            {user.subscription.current_period_end && (
                              <p className="text-xs text-gray-500 mt-1">
                                Ends: {formatDate(user.subscription.current_period_end)}
                              </p>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">No subscription</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatRelativeTime(user.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedUser(user); setShowRoleModal(true); setNewRole(user.role) }}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
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
                  onClick={() => fetchUsers(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => fetchUsers(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Role Change Modal */}
        {showRoleModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowRoleModal(false)}>
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Role for {selectedUser.full_name}</h3>
              <Select
                options={[
                  { value: 'technician', label: 'Technician' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'moderator', label: 'Moderator' },
                ]}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'technician' | 'admin' | 'moderator')}
                placeholder="Select role"
                className="mb-4"
              />
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" onClick={() => setShowRoleModal(false)}>Cancel</Button>
                <Button onClick={handleRoleChange}>Save Changes</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}