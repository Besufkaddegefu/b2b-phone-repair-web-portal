import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  Upload,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { Button } from './ui'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Listings', href: '/admin/listings', icon: Package },
  { name: 'Bulk Upload', href: '/admin/bulk-upload', icon: Upload },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
]

export function AdminSidebar() {
  const { sidebarOpen, setSidebarOpen } = useStore()
  const location = useLocation()
  const { user } = useAuth()

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Admin navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">B2B Admin</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto" role="navigation" aria-label="Main navigation">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-primary-600' : 'text-gray-400')} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName || 'Admin'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
            <Link
              to="/admin/settings"
              className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="w-5 h-5 inline-block mr-2" />
              Settings
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}

export function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">Admin Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.fullName || 'Admin'}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            <LogOut className="w-4 h-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}