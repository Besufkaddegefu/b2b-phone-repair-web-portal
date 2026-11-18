export type UserRole = 'technician' | 'admin' | 'moderator'

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'pending_approval'

export type PaymentType = 'registration' | 'monthly_subscription' | 'bundle_initial'

export type PaymentMethod = 'chapa' | 'telebirr' | 'cbe_birr' | 'manual_receipt'

export type TransactionStatus = 'pending' | 'completed' | 'failed'

export type PartCondition = 'original_pulled' | 'oem_new' | 'aftermarket' | 'for_parts_only'

export interface User {
  id: string
  telegram_id: number | null
  telegram_username: string | null
  clerk_user_id: string | null
  full_name: string
  phone_number: string
  shop_name: string | null
  shop_location: string | null
  role: UserRole
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  registration_fee_paid: boolean
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  monthly_rate: number
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  amount: number
  payment_type: PaymentType
  payment_method: PaymentMethod
  transaction_reference: string
  receipt_image_url: string | null
  status: TransactionStatus
  verified_by: string | null
  created_at: string
  user?: User
}

export interface Category {
  id: number
  name: string
}

export interface PartListing {
  id: string
  seller_id: string
  category_id: number
  brand: string
  model_name: string
  part_name: string
  condition: PartCondition
  price: number
  is_negotiable: boolean
  description: string | null
  telegram_file_ids: string[]
  image_urls: string[]
  is_available: boolean
  created_at: string
  seller?: User
  category?: Category
}

export interface PartListingSearchParams {
  category_id?: number
  brand?: string
  model_name?: string
  condition?: PartCondition
  min_price?: number
  max_price?: number
  is_available?: boolean
  page?: number
  page_size?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface ApiError {
  detail: string
}

// Admin types
export interface AdminStats {
  total_users: number
  active_subscriptions: number
  pending_payments: number
  total_listings: number
  revenue_this_month: number
  new_users_this_month: number
}

export interface UserWithSubscription extends User {
  subscription?: Subscription
}

export interface BulkUploadResult {
  success: number
  failed: number
  errors: Array<{ row: number; error: string }>
}