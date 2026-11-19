import { useState } from 'react'
import { User, Bell, Shield, Palette, Save, Loader2 } from 'lucide-react'
import { useAuthSync } from '@/hooks'
import { AdminLayout } from '@/components/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@/components/ui'
import { cn } from '@/lib/utils'

export function AdminSettings() {
  useAuthSync()
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'appearance'>('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your admin account settings</p>
        </div>

        <Card padding="none">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6" aria-label="Settings tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={cn(
                      'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                      isActive
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" placeholder="John Doe" />
                  <Input label="Email" type="email" placeholder="john@example.com" />
                </div>
                <Input label="Phone Number" placeholder="+251 9XX XXX XXX" />
                <Input label="Shop Name" placeholder="Bole Phone Repair" />
                <Input label="Shop Location" placeholder="Bole, Addis Ababa" />
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { id: 'new_users', label: 'New user registrations', description: 'Get notified when new technicians join' },
                    { id: 'pending_payments', label: 'Pending payments', description: 'Alert when payments need approval' },
                    { id: 'new_listings', label: 'New listings', description: 'Notification for new parts posted' },
                    { id: 'system_updates', label: 'System updates', description: 'Important platform announcements' },
                    { id: 'weekly_reports', label: 'Weekly reports', description: 'Weekly marketplace summary' },
                  ].map((item) => (
                    <label key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        defaultChecked
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline" size="sm">Enable 2FA</Button>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Change Password</p>
                        <p className="text-sm text-gray-500">Update your password regularly</p>
                      </div>
                      <Button variant="outline" size="sm">Change Password</Button>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Active Sessions</p>
                        <p className="text-sm text-gray-500">Manage devices logged into your account</p>
                      </div>
                      <Button variant="outline" size="sm">View Sessions</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <div className="flex gap-4">
                      {['light', 'dark', 'system'].map((theme) => (
                        <label key={theme} className="flex items-center gap-2 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input type="radio" name="theme" value={theme} className="text-primary-600" defaultChecked={theme === 'system'} />
                          <span className="capitalize">{theme}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar Density</label>
                    <Select
                      options={[
                        { value: 'comfortable', label: 'Comfortable' },
                        { value: 'compact', label: 'Compact' },
                      ]}
                      value="comfortable"
                      placeholder="Select density"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}