import { Users, CreditCard, Package, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useAuthSync, useAdmin } from '@/hooks'
import { AdminLayout } from '@/components/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { formatPrice, formatRelativeTime, getStatusColor, getRoleColor } from '@/lib/utils'

export function AdminDashboard() {
  useAuthSync()
  const { adminStats, fetchStats } = useAdmin()

  const stats = [
    {
      name: 'Total Users',
      value: adminStats?.total_users || 0,
      icon: Users,
      color: 'bg-blue-500',
      trend: { value: adminStats?.new_users_this_month || 0, label: 'new this month' },
    },
    {
      name: 'Active Subscriptions',
      value: adminStats?.active_subscriptions || 0,
      icon: CreditCard,
      color: 'bg-green-500',
      trend: { value: adminStats?.new_users_this_month || 0, label: 'new this month' },
    },
    {
      name: 'Total Listings',
      value: adminStats?.total_listings || 0,
      icon: Package,
      color: 'bg-purple-500',
      trend: { value: 0, label: '' },
    },
    {
      name: 'Revenue This Month',
      value: formatPrice(adminStats?.revenue_this_month || 0),
      icon: TrendingUp,
      color: 'bg-yellow-500',
      trend: { value: 0, label: '' },
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your marketplace</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.name} padding="md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  {stat.trend.value > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>{stat.trend.value} {stat.trend.label}</span>
                    </div>
                  )}
                </div>
                <div className={cn('p-3 rounded-xl', stat.color)}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Payments */}
          <Card padding="md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Pending Payments
                <span className={cn('badge', getStatusColor('pending_approval'))}>
                  {adminStats?.pending_payments || 0}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">
                {adminStats?.pending_payments || 0} payments awaiting approval
              </p>
              <button className="mt-4 btn-primary btn-sm">
                Review Payments
              </button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left">
                  <Users className="w-5 h-5 text-primary-600 mb-2" />
                  <p className="font-medium text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-500 mt-1">View & edit accounts</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left">
                  <CreditCard className="w-5 h-5 text-primary-600 mb-2" />
                  <p className="font-medium text-gray-900">Review Payments</p>
                  <p className="text-sm text-gray-500 mt-1">Approve/reject receipts</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left">
                  <Package className="w-5 h-5 text-primary-600 mb-2" />
                  <p className="font-medium text-gray-900">Manage Listings</p>
                  <p className="text-sm text-gray-500 mt-1">Moderate parts</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left">
                  <TrendingUp className="w-5 h-5 text-primary-600 mb-2" />
                  <p className="font-medium text-gray-900">View Analytics</p>
                  <p className="text-sm text-gray-500 mt-1">Revenue & growth</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

import { cn } from '@/lib/utils'