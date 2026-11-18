# B2B Phone Repair Web Portal

Admin Dashboard & Technician Portal for the B2B Phone Repair Parts Marketplace.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Clerk** for authentication
- **Zustand** for state management
- **Axios** for API calls
- **React Router** for navigation
- **Recharts** for analytics charts
- **React Dropzone** + **XLSX** for bulk upload
- **Radix UI** primitives for accessible components

## Project Structure

```
web-portal/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui.tsx              # Reusable UI components (Button, Input, Select, Badge, Card)
│   │   ├── AdminLayout.tsx     # Admin sidebar + header layout
│   │   └── ListingCard.tsx     # Listing card (shared with mini-app)
│   ├── pages/
│   │   ├── AdminDashboard.tsx  # Admin overview with stats
│   │   ├── AdminUsers.tsx      # User management with role editing
│   │   ├── AdminPayments.tsx   # Payment approval/rejection
│   │   ├── AdminBulkUpload.tsx # CSV/Excel bulk upload
│   │   ├── AdminAnalytics.tsx  # Charts: revenue, users, listings, subscriptions
│   │   ├── AdminSettings.tsx   # Admin profile & preferences
│   │   └── TechnicianPortal.tsx # Technician listings management
│   ├── hooks/
│   │   └── index.ts            # useAuthSync, useListings, useCategories, useAdmin
│   ├── lib/
│   │   ├── api.ts              # Axios client with Clerk JWT
│   │   └── utils.ts            # Formatters, CSV generation
│   ├── store/
│   │   └── index.ts            # Zustand store with persistence
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── App.tsx                 # Router with Clerk auth
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Features

### Admin Dashboard
- **Overview**: Key metrics (users, subscriptions, listings, revenue)
- **User Management**: Search, filter, pagination, role editing (technician/admin/moderator)
- **Payment Management**: View all transactions, approve/reject manual receipts, filter by status/method
- **Bulk Upload**: Drag & drop CSV/Excel, validation, preview, download templates
- **Analytics**: Revenue trend, new users, new listings, subscription status pie chart, top categories/brands
- **Settings**: Profile, notifications, security (2FA), appearance

### Technician Portal
- **My Listings**: Grid/list view, search, filter, infinite scroll
- **Create/Edit Listings**: Modal form with validation
- **Delete Listings**: Confirmation dialog
- **Responsive**: Works on desktop and mobile

## Development

```bash
cd web-portal
npm install
cp .env.example .env  # Add Clerk publishable key and API URL
npm run dev
```

The app will be available at `http://localhost:3001`.

## Clerk Setup

1. Create a Clerk application at https://clerk.com
2. Configure:
   - Authentication: Email/Phone + Password
   - User profile: Full name, phone number
   - Organizations: Disabled (use custom roles)
3. Add `VITE_CLERK_PUBLISHABLE_KEY` to `.env`
4. Configure backend JWT verification with Clerk JWKS URL

## Backend Integration

The portal expects these API endpoints:

```
GET    /api/v1/categories
GET    /api/v1/listings?page=&page_size=&category_id=&brand=&model_name=&is_available=
POST   /api/v1/listings
PATCH  /api/v1/listings/:id
DELETE /api/v1/listings/:id
GET    /api/v1/users/me
PATCH  /api/v1/users/me

# Admin endpoints (require admin role)
GET    /api/v1/admin/stats
GET    /api/v1/admin/users?page=&page_size=&search=&role=
PATCH  /api/v1/admin/users/:id/role
GET    /api/v1/admin/transactions?page=&page_size=&status=
POST   /api/v1/admin/transactions/:id/approve
POST   /api/v1/admin/transactions/:id/reject
POST   /api/v1/admin/listings/bulk-upload
GET    /api/v1/admin/analytics?period=
```

## Building for Production

```bash
npm run build
```

Output in `dist/` - deploy to Vercel, Netlify, Cloudflare Pages, etc.

## Deployment Notes

- Set `VITE_API_BASE_URL` to your production API URL
- Set `VITE_CLERK_PUBLISHABLE_KEY` to production Clerk key
- Configure Clerk allowed origins for your domain
- Ensure CORS is configured on backend for your domain