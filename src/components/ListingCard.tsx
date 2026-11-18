import { MapPin, Tag, MessageCircle, ChevronRight, Edit, Trash2, Image, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PartListing } from '@/types'
import { cn, formatPrice, getConditionLabel, getConditionColor } from '@/lib/utils'

interface ListingCardProps {
  listing: PartListing
  compact?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function ListingCard({ listing, compact = false, onEdit, onDelete }: ListingCardProps) {
  const primaryImage = listing.image_urls[0]

  if (compact) {
    return (
      <Link
        to={`/listing/${listing.id}`}
        className="flex gap-4 p-4 bg-white rounded-lg border border-gray-100 hover:border-primary-200 transition-colors"
      >
        <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
          {primaryImage ? (
            <img src={primaryImage} alt={listing.part_name} className="w-full h-full object-cover" />
          ) : (
            <Image className="w-full h-full text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{listing.brand} {listing.model_name}</h3>
          <p className="text-sm text-gray-500 truncate">{listing.part_name}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={cn('px-2 py-0.5 text-xs rounded-full', getConditionColor(listing.condition))}>
              {getConditionLabel(listing.condition)}
            </span>
            {listing.is_negotiable && (
              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                Negotiable
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-primary-600">{formatPrice(listing.price)}</p>
          <MessageCircle className="w-5 h-5 text-primary-600 mx-auto mt-1" />
        </div>
      </Link>
    )
  }

  return (
    <article className="card group relative">
      <Link to={`/listing/${listing.id}`} className="block">
        <div className="aspect-square relative overflow-hidden bg-gray-100">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={listing.part_name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Image className="w-12 h-12" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className={cn('px-2 py-1 text-xs rounded-full', getConditionColor(listing.condition))}>
              {getConditionLabel(listing.condition)}
            </span>
          </div>
          {listing.image_urls.length > 1 && (
            <div className="absolute top-3 right-3">
              <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                +{listing.image_urls.length - 1}
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
            {listing.brand} {listing.model_name}
          </h3>
          <p className="text-sm text-gray-500 truncate mt-1">{listing.part_name}</p>

          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="truncate max-w-[140px]">{listing.seller?.shop_location || 'Location not specified'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-xl font-bold text-primary-600">{formatPrice(listing.price)}</p>
              <p className="text-xs text-gray-500">{listing.is_negotiable ? 'Negotiable' : 'Fixed Price'}</p>
            </div>
            <MessageCircle className="w-6 h-6 text-primary-600" />
          </div>
        </div>
      </Link>

      {(onEdit || onDelete) && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-1">
            {onEdit && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                aria-label="Edit listing"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                aria-label="Delete listing"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  )
}

export function ListingSkeleton() {
  return (
    <article className="card animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="flex gap-3">
          <div className="h-4 bg-gray-200 rounded flex-1" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </article>
  )
}