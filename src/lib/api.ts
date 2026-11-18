import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    })

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Clerk token will be added by the auth hook
        return config
      },
      (error) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Auth handled by Clerk
        }
        return Promise.reject(error)
      }
    )
  }

  setAuthToken(token: string | null) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete this.client.defaults.headers.common['Authorization']
    }
  }

  // Categories
  async getCategories() {
    const response = await this.client.get<Category[]>('/categories')
    return response.data
  }

  // Listings
  async getListings(params: PartListingSearchParams) {
    const response = await this.client.get<PaginatedResponse<PartListing>>('/listings', { params })
    return response.data
  }

  async getListing(id: string) {
    const response = await this.client.get<PartListing>(`/listings/${id}`)
    return response.data
  }

  async createListing(data: Partial<PartListing>) {
    const response = await this.client.post<PartListing>('/listings', data)
    return response.data
  }

  async updateListing(id: string, data: Partial<PartListing>) {
    const response = await this.client.patch<PartListing>(`/listings/${id}`, data)
    return response.data
  }

  async deleteListing(id: string) {
    await this.client.delete(`/listings/${id}`)
  }

  // User
  async getProfile() {
    const response = await this.client.get<User>('/users/me')
    return response.data
  }

  async updateProfile(data: Partial<User>) {
    const response = await this.client.patch<User>('/users/me', data)
    return response.data
  }

  // Admin endpoints
  async getAdminStats() {
    const response = await this.client.get<AdminStats>('/admin/stats')
    return response.data
  }

  async getUsers(params: { page?: number; page_size?: number; search?: string; role?: string }) {
    const response = await this.client.get<PaginatedResponse<UserWithSubscription>>('/admin/users', { params })
    return response.data
  }

  async getUser(id: string) {
    const response = await this.client.get<UserWithSubscription>(`/admin/users/${id}`)
    return response.data
  }

  async updateUserRole(id: string, role: UserRole) {
    const response = await this.client.patch<User>(`/admin/users/${id}/role`, { role })
    return response.data
  }

  async getTransactions(params: { page?: number; page_size?: number; status?: TransactionStatus }) {
    const response = await this.client.get<PaginatedResponse<Transaction>>('/admin/transactions', { params })
    return response.data
  }

  async approveTransaction(id: string) {
    const response = await this.client.post<Transaction>(`/admin/transactions/${id}/approve`)
    return response.data
  }

  async rejectTransaction(id: string) {
    const response = await this.client.post<Transaction>(`/admin/transactions/${id}/reject`)
    return response.data
  }

  async bulkUploadListings(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await this.client.post<BulkUploadResult>('/admin/listings/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }

  async getAnalytics(params: { period?: 'day' | 'week' | 'month' | 'year' }) {
    const response = await this.client.get('/admin/analytics', { params })
    return response.data
  }
}

export const api = new ApiClient()

// Re-export types
export type {
  User,
  Subscription,
  Transaction,
  Category,
  PartListing,
  PartListingSearchParams,
  PaginatedResponse,
  AdminStats,
  UserWithSubscription,
  BulkUploadResult,
}