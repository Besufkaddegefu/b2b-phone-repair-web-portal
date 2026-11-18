import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react'
import { useAuthSync } from '@/hooks'
import { AdminLayout } from '@/components/AdminLayout'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { AdminUsers } from '@/pages/AdminUsers'
import { AdminPayments } from '@/pages/AdminPayments'
import { AdminBulkUpload } from '@/pages/AdminBulkUpload'
import { AdminAnalytics } from '@/pages/AdminAnalytics'
import { TechnicianPortal } from '@/pages/TechnicianPortal'
import { AdminSettings } from '@/pages/AdminSettings'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { isAdmin } = useAuthSync()

  if (!isAdmin) {
    return <Navigate to="/portal" replace />
  }

  return <AdminLayout>{children}</AdminLayout>
}

function TechnicianRoute({ children }: { children: React.ReactNode }) {
  return (
    <SignedIn>
      {children}
    </SignedIn>
  )
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  return <SignedOut>{children}</SignedOut>
}

function AppRoutes() {
  useAuthSync()

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/sign-in" element={<PublicRoute><RedirectToSignIn /></PublicRoute>} />
      <Route path="/sign-up" element={<PublicRoute><RedirectToSignIn /></PublicRoute>} />

      {/* Admin routes */}
      <Route element={<AdminRoute><Outlet /></AdminRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/bulk-upload" element={<AdminBulkUpload />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      {/* Technician portal routes */}
      <Route element={<TechnicianRoute><Outlet /></TechnicianRoute>}>
        <Route path="/portal" element={<TechnicianPortal />} />
        <Route path="/portal/create" element={<TechnicianPortal />} />
        <Route path="/portal/search" element={<TechnicianPortal />} />
        <Route path="/portal/settings" element={<TechnicianPortal />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/portal" replace />} />
      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <AppRoutes />
    </ClerkProvider>
  )
}