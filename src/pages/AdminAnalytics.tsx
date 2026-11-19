import { useState, useEffect } from 'react'
import {
  Users,
  CreditCard,
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuthSync, useAdmin } from '@/hooks'
import { api } from '@/lib/api'
import { AdminLayout } from '@/components/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent, Select } from '@/components/ui'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import type { AdminStats } from '@/types'

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function AdminAnalytics() {
  useAuthSync()
  const { adminStats, fetchStats } = useAdmin()
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [analytics, setAnalytics] = useState<{
    revenue: Array<{ date: string; amount: number }>
    users: Array<{ date: string; count: number }>
    listings: Array<{ date: string; count: number }>
    subscriptions: Array<{ status: string; count: number }>
    topCategories: Array<{ category: string; count: number }>
    topBrands: Array<{ brand: string; count: number }>
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const data = await api.getAnalytics({ period })
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    fetchStats()
  }, [period, fetchStats])

  const formatChartDate = (date: string, period: string) => {
    const d = new Date(date)
    switch (period) {
      case 'day':
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      case 'week':
      case 'month':
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
      case 'year':
        return d.toLocaleDateString([], { month: 'short', year: '2-digit' })
      default:
        return d.toLocaleDateString()
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 mt-1">Marketplace insights and trends</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} padding="md">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-8 bg-gray-200 rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    )
  }

  const revenueData = analytics?.revenue ?? []
  const usersData = analytics?.users ?? []
  const listingsData = analytics?.listings ?? []
  const subscriptionsData = analytics?.subscriptions ?? []

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 mt-1">Marketplace insights and trends</p>
          </div>
          <Select
            options={[
              { value: 'day', label: 'Last 24 Hours' },
              { value: 'week', label: 'Last 7 Days' },
              { value: 'month', label: 'Last 30 Days' },
              { value: 'year', label: 'Last 12 Months' },
            ]}
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'day' | 'week' | 'month' | 'year')}
            className="w-48"
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatPrice(adminStats?.revenue_this_month || 0)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{adminStats?.total_users || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{adminStats?.active_subscriptions || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Listings</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{adminStats?.total_listings || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => formatChartDate(date, period)}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={false}
                      />
                      <YAxis
                        tickFormatter={(value) => formatPrice(value)}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={false}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatPrice(value), 'Revenue']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* New Users */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>New Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {usersData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usersData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => formatChartDate(date, period)}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={false}
                      />
                      <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} />
                      <Tooltip formatter={(value: number) => [value, 'Users']} />
                      <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* New Listings */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>New Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {listingsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={listingsData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => formatChartDate(date, period)}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={false}
                      />
                      <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} />
                      <Tooltip formatter={(value: number) => [value, 'Listings']} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {subscriptionsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subscriptionsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="status"
                        label={({ status, percent }) => `${status.replace('_', ' ')} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {subscriptionsData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value, 'Subscriptions']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Categories & Brands */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.topCategories.slice(0, 5).map((cat, index) => (
                  <div key={cat.category} className="flex items-center gap-4">
                    <span className="w-8 text-center text-sm font-medium text-gray-500">{index + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{cat.category}</p>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full"
                          style={{ width: `${(cat.count / (analytics.topCategories[0]?.count || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 w-16 text-right">{cat.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card padding="md">
            <CardHeader>
              <CardTitle>Top Brands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.topBrands.slice(0, 5).map((brand, index) => (
                  <div key={brand.brand} className="flex items-center gap-4">
                    <span className="w-8 text-center text-sm font-medium text-gray-500">{index + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{brand.brand}</p>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 rounded-full"
                          style={{ width: `${(brand.count / (analytics.topBrands[0]?.count || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 w-16 text-right">{brand.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}