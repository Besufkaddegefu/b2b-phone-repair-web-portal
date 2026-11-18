import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Filter, Plus, Grid, List, ChevronLeft, ChevronRight, Tag, MapPin, DollarSign, MessageCircle, RotateCcw, Trash2, Edit } from 'lucide-react'
import { useAuthSync, useListings, useCategories } from '@/hooks'
import { api } from '@/lib/api'
import { Card, Button, Input, Select, Badge } from '@/components/ui'
import { ListingCard } from './components/ListingCard'
import { formatPrice, getConditionLabel, getConditionColor, cn } from '@/lib/utils'
import type { PartListing } from '@/types'

export function TechnicianPortal() {
  useAuthSync()
  const {
    listings,
    isLoading,
    hasMore,
    searchParams,
    loadMore,
    search,
    clearSearch,
  } = useListings()
  const { categories } = useCategories()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingListing, setEditingListing] = useState<PartListing | null>(null)

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const data = {
      category_id: Number(formData.get('category_id')),
      brand: formData.get('brand') as string,
      model_name: formData.get('model_name') as string,
      part_name: formData.get('part_name') as string,
      condition: formData.get('condition') as string,
      price: Number(formData.get('price')),
      is_negotiable: formData.get('is_negotiable') === 'on',
      description: formData.get('description') as string,
    }
    // In a real app, call api.createListing(data)
    setShowCreateModal(false)
  }

  const handleEdit = (listing: PartListing) => {
    setEditingListing(listing)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      try {
        await api.deleteListing(id)
        // Refresh handled by store
      } catch (error) {
        console.error('Failed to delete listing:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/portal" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 text-xl">B2B Phone Repair</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/portal" className="text-sm font-medium text-gray-700 hover:text-primary-600">My Listings</Link>
                <Link to="/portal/create" className="text-sm font-medium text-gray-700 hover:text-primary-600">Post Part</Link>
                <Link to="/portal/search" className="text-sm font-medium text-gray-700 hover:text-primary-600">Find Parts</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-500 mt-1">Manage your parts inventory</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Post New Part
          </Button>
        </div>

        {/* Search & Filters */}
        <Card padding="md" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your listings..."
                value={searchParams.model_name || ''}
                onChange={(e) => search({ model_name: e.target.value || undefined })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Select
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map(c => ({ value: String(c.id), label: c.name })),
              ]}
              value={String(searchParams.category_id || '')}
              onChange={(e) => search({ category_id: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Filter by category"
              className="w-48"
            />
            <Select
              options={[
                { value: '', label: 'All Status' },
                { value: 'true', label: 'Available' },
                { value: 'false', label: 'Unavailable' },
              ]}
              value={String(searchParams.is_available ?? '')}
              onChange={(e) => search({ is_available: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined })}
              placeholder="Availability"
              className="w-40"
            />
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn('p-2 rounded transition-colors', viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500')}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn('p-2 rounded transition-colors', viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500')}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Card>

        {/* Listings */}
        <div className="space-y-6">
          {isLoading && listings.length === 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg" />
                  <div className="mt-3 h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No listings yet</h3>
              <p className="text-gray-500 mb-4">Start selling by posting your first part</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Part
              </Button>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    compact={viewMode === 'list'}
                    onEdit={() => handleEdit(listing)}
                    onDelete={() => handleDelete(listing.id)}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center py-4">
                  <Button variant="outline" onClick={loadMore} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingListing) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowCreateModal(false); setEditingListing(null); }}>
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingListing ? 'Edit Listing' : 'Post New Part'}
                </h3>
                <button onClick={() => { setShowCreateModal(false); setEditingListing(null); }} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateListing} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Category"
                    options={categories.map(c => ({ value: String(c.id), label: c.name }))}
                    placeholder="Select category"
                    required
                  />
                  <Select
                    label="Brand"
                    options={[
                      { value: 'Samsung', label: 'Samsung' },
                      { value: 'Apple', label: 'Apple' },
                      { value: 'Xiaomi', label: 'Xiaomi' },
                      { value: 'Tecno', label: 'Tecno' },
                      { value: 'Infinix', label: 'Infinix' },
                      { value: 'Huawei', label: 'Huawei' },
                    ]}
                    placeholder="Select brand"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Model Name" placeholder="e.g., Galaxy S22 Ultra" required />
                  <Input label="Part Name" placeholder="e.g., Original OLED Screen" required />
                </div>
                <Select
                  label="Condition"
                  options={[
                    { value: 'original_pulled', label: 'Original (Pulled)' },
                    { value: 'oem_new', label: 'OEM New' },
                    { value: 'aftermarket', label: 'Aftermarket' },
                    { value: 'for_parts_only', label: 'For Parts Only' },
                  ]}
                  placeholder="Select condition"
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Price (ETB)" type="number" placeholder="15000" required />
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="is_negotiable" defaultChecked className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">Negotiable</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Optional description..."
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <Button type="button" variant="secondary" onClick={() => { setShowCreateModal(false); setEditingListing(null); }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingListing ? 'Save Changes' : 'Post Listing'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
}

import { Package } from 'lucide-react'