import { useEffect, useCallback } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { useStore } from '@/store'
import { api } from '@/lib/api'

export function useAuthSync() {
  const { user: clerkUser, isLoaded, isSignedIn, getToken } = useAuth()
  const { setUser, logout, isAuthenticated } = useStore()

  const syncUser = useCallback(async () => {
    if (!isLoaded) return

    if (isSignedIn && clerkUser) {
      try {
        const token = await getToken()
        api.setAuthToken(token)

        const profile = await api.getProfile()
        setUser(profile)
      } catch (error) {
        console.error('Failed to sync user:', error)
        setUser(null)
      }
    } else {
      api.setAuthToken(null)
      if (isAuthenticated) {
        logout()
      }
    }
  }, [isLoaded, isSignedIn, clerkUser, getToken, setUser, logout, isAuthenticated])

  useEffect(() => {
    syncUser()
  }, [syncUser])

  return { isLoaded, isSignedIn }
}

export function useListings() {
  const {
    listings,
    searchParams,
    pagination,
    isLoading,
    hasMore,
    setListings,
    appendListings,
    setSearchParams,
    resetSearchParams,
    setLoading,
    setHasMore,
  } = useStore()

  const fetchListings = useCallback(async (append = false) => {
    setLoading(true)
    try {
      const params = { ...searchParams, page: append ? pagination.page + 1 : 1 }
      const response = await api.getListings(params)
      if (append) {
        appendListings(response.items)
      } else {
        setListings(response.items, {
          page: response.page,
          pageSize: response.page_size,
          total: response.total,
          totalPages: response.total_pages,
        })
      }
      setHasMore(response.page < response.total_pages)
    } catch (error) {
      console.error('Failed to fetch listings:', error)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [searchParams, pagination.page, setListings, appendListings, setLoading, setHasMore])

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchListings(true)
    }
  }, [isLoading, hasMore, fetchListings])

  const search = useCallback((params: Partial<typeof searchParams>) => {
    setSearchParams(params)
  }, [setSearchParams])

  const clearSearch = useCallback(() => {
    resetSearchParams()
  }, [resetSearchParams])

  useEffect(() => {
    fetchListings(false)
  }, [searchParams])

  return {
    listings,
    isLoading,
    hasMore,
    searchParams,
    pagination,
    fetchListings,
    loadMore,
    search,
    clearSearch,
  }
}

export function useCategories() {
  const { categories, setCategories } = useStore()

  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }, [setCategories])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return { categories, fetchCategories }
}

export function useAdmin() {
  const { adminStats, setAdminStats } = useStore()

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getAdminStats()
      setAdminStats(data)
      return data
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
      return null
    }
  }, [setAdminStats])

  return { adminStats, fetchStats }
}