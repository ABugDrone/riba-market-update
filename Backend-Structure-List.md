# Riba Market - Backend API Structure

This document outlines all the CRUD API routes and backend structure needed for the Riba Market fullstack implementation.

## 🗄️ Database Schema Overview

### Core Tables
- **profiles** - User profiles linked to Supabase Auth
- **seller_stores** - Multiple stores per seller profile  
- **products** - Product catalog with inventory management
- **categories** - Product/service categories
- **addresses** - User delivery addresses
- **carts** - Shopping cart items
- **orders** - Order management
- **order_items** - Items within each order
- **transactions** - Payment transaction records
- **reviews** - Product and store reviews
- **notifications** - User notifications
- **analytics_events** - Event tracking for analytics
- **seller_followers** - Seller following relationships
- **wishlists** - User wishlist items

---

## 🔐 Authentication & Authorization

### Auth Routes
```
POST   /api/auth/signup              - Register new user
POST   /api/auth/login               - User login
POST   /api/auth/logout              - User logout  
POST   /api/auth/refresh             - Refresh JWT token
POST   /api/auth/forgot-password     - Request password reset
POST   /api/auth/reset-password      - Reset password with token
POST   /api/auth/verify-email        - Verify email address
POST   /api/auth/resend-verification - Resend verification email
```

### Session Management
```
GET    /api/auth/session             - Get current session
DELETE /api/auth/session             - Destroy session
POST   /api/auth/switch-mode         - Switch between buyer/seller mode
```

---

## 👤 User Profile Management

### Profile Routes
```
GET    /api/profile                  - Get current user profile
PUT    /api/profile                  - Update user profile
DELETE /api/profile                  - Delete user account
POST   /api/profile/avatar           - Upload profile avatar
DELETE /api/profile/avatar           - Remove profile avatar
```

### Address Management
```
GET    /api/profile/addresses        - Get user addresses
POST   /api/profile/addresses        - Create new address
PUT    /api/profile/addresses/:id    - Update address
DELETE /api/profile/addresses/:id    - Delete address
POST   /api/profile/addresses/:id/default - Set as default address
```

### User Preferences
```
GET    /api/profile/preferences      - Get user preferences
PUT    /api/profile/preferences      - Update preferences
GET    /api/profile/notifications    - Get notification settings
PUT    /api/profile/notifications    - Update notification settings
```

---

## 🏪 Store Management

### Store CRUD
```
GET    /api/stores                   - List user's stores
POST   /api/stores                   - Create new store
GET    /api/stores/:id               - Get store details
PUT    /api/stores/:id               - Update store
DELETE /api/stores/:id               - Delete store
POST   /api/stores/:id/logo          - Upload store logo
DELETE /api/stores/:id/logo          - Remove store logo
```

### Store Status & Verification
```
POST   /api/stores/:id/verify        - Submit for verification
PUT    /api/stores/:id/status        - Update store status (admin)
GET    /api/stores/:id/verification  - Get verification status
POST   /api/stores/:id/resubmit      - Resubmit for verification
```

### Public Store Access
```
GET    /api/public/stores/:slug      - Get public store profile
GET    /api/public/stores/:slug/products - Get store products (public)
GET    /api/public/stores/:slug/reviews  - Get store reviews
GET    /api/public/stores/search     - Search public stores
```

---

## 📦 Product Management

### Product CRUD
```
GET    /api/products                 - List products (with filters)
POST   /api/products                 - Create new product
GET    /api/products/:id             - Get product details
PUT    /api/products/:id             - Update product
DELETE /api/products/:id             - Delete product
```

### Product Images & Media
```
POST   /api/products/:id/images      - Upload product images
DELETE /api/products/:id/images/:imageId - Delete product image
PUT    /api/products/:id/images/order - Reorder product images
POST   /api/products/:id/video       - Upload product video
DELETE /api/products/:id/video       - Delete product video
```

### Product Status Management
```
PUT    /api/products/:id/status      - Update product status
POST   /api/products/:id/sold        - Mark product as sold
POST   /api/products/:id/restock     - Restock product
PUT    /api/products/:id/inventory   - Update inventory count
```

### Product Search & Discovery
```
GET    /api/products/search          - Search products
GET    /api/products/featured        - Get featured products
GET    /api/products/trending        - Get trending products
GET    /api/products/recommendations - Get personalized recommendations
GET    /api/products/similar/:id     - Get similar products
```

### Product Categories
```
GET    /api/categories               - List all categories
POST   /api/categories               - Create category (admin)
PUT    /api/categories/:id           - Update category (admin)
DELETE /api/categories/:id           - Delete category (admin)
GET    /api/categories/:id/products  - Get products in category
```

---

## 🛒 Shopping Cart Management

### Cart Operations
```
GET    /api/cart                     - Get user's cart
POST   /api/cart/items               - Add item to cart
PUT    /api/cart/items/:id           - Update cart item quantity
DELETE /api/cart/items/:id           - Remove item from cart
DELETE /api/cart                     - Clear entire cart
POST   /api/cart/save-for-later/:id  - Save item for later
POST   /api/cart/move-to-cart/:id    - Move saved item to cart
```

### Cart Calculations
```
GET    /api/cart/totals              - Get cart totals
POST   /api/cart/apply-coupon        - Apply discount coupon
DELETE /api/cart/coupon              - Remove applied coupon
GET    /api/cart/shipping            - Calculate shipping costs
```

---

## 📋 Order Management

### Order CRUD
```
GET    /api/orders                   - List user orders
POST   /api/orders                   - Create new order
GET    /api/orders/:id               - Get order details
PUT    /api/orders/:id               - Update order (limited fields)
DELETE /api/orders/:id               - Cancel order
```

### Order Status Management
```
PUT    /api/orders/:id/status        - Update order status
POST   /api/orders/:id/ship          - Mark order as shipped
POST   /api/orders/:id/deliver       - Mark order as delivered
POST   /api/orders/:id/cancel        - Cancel order
POST   /api/orders/:id/refund        - Process refund
```

### Order Documents
```
GET    /api/orders/:id/receipt       - Generate PDF receipt
GET    /api/orders/:id/invoice       - Generate PDF invoice
GET    /api/orders/:id/tracking      - Get tracking information
POST   /api/orders/:id/tracking      - Update tracking info (seller)
```

### Seller Order Management
```
GET    /api/seller/orders            - List seller's orders
PUT    /api/seller/orders/:id/accept - Accept order
PUT    /api/seller/orders/:id/reject - Reject order
POST   /api/seller/orders/:id/message - Send message to buyer
```

---

## 💳 Payment Processing

### Payment Initialization
```
POST   /api/payments/initialize      - Initialize payment
POST   /api/payments/verify          - Verify payment
GET    /api/payments/:reference      - Get payment status
POST   /api/payments/webhook         - Flutterwave webhook
```

### Transaction Management
```
GET    /api/transactions             - List user transactions
GET    /api/transactions/:id         - Get transaction details
POST   /api/transactions/:id/refund  - Process refund
GET    /api/transactions/summary     - Get transaction summary
```

### Payment Methods
```
GET    /api/payment-methods          - List available payment methods
POST   /api/payment-methods/validate - Validate payment method
GET    /api/payment-methods/fees     - Calculate payment fees
```

---

## ⭐ Reviews & Ratings

### Review CRUD
```
GET    /api/reviews                  - List reviews (with filters)
POST   /api/reviews                  - Create review
GET    /api/reviews/:id              - Get review details
PUT    /api/reviews/:id              - Update review
DELETE /api/reviews/:id              - Delete review
```

### Product Reviews
```
GET    /api/products/:id/reviews     - Get product reviews
POST   /api/products/:id/reviews     - Add product review
GET    /api/products/:id/reviews/summary - Get review summary
```

### Store Reviews
```
GET    /api/stores/:id/reviews       - Get store reviews
POST   /api/stores/:id/reviews       - Add store review
GET    /api/stores/:id/reviews/summary - Get store review summary
```

### Review Management
```
POST   /api/reviews/:id/helpful      - Mark review as helpful
POST   /api/reviews/:id/report       - Report inappropriate review
PUT    /api/reviews/:id/moderate     - Moderate review (admin)
```

---

## 📊 Analytics & Reporting

### Seller Analytics
```
GET    /api/analytics/seller/dashboard    - Seller dashboard data
GET    /api/analytics/seller/sales        - Sales analytics
GET    /api/analytics/seller/products     - Product performance
GET    /api/analytics/seller/customers    - Customer analytics
GET    /api/analytics/seller/revenue      - Revenue analytics
GET    /api/analytics/seller/traffic      - Traffic analytics
```

### Buyer Analytics
```
GET    /api/analytics/buyer/dashboard     - Buyer dashboard data
GET    /api/analytics/buyer/orders        - Order history analytics
GET    /api/analytics/buyer/spending      - Spending analytics
GET    /api/analytics/buyer/preferences   - Preference analytics
```

### Platform Analytics (Admin)
```
GET    /api/analytics/platform/overview   - Platform overview
GET    /api/analytics/platform/users      - User analytics
GET    /api/analytics/platform/sales      - Sales analytics
GET    /api/analytics/platform/categories - Category performance
GET    /api/analytics/platform/growth     - Growth metrics
```

### Export & Reports
```
GET    /api/analytics/export/sales        - Export sales data
GET    /api/analytics/export/products     - Export product data
GET    /api/analytics/export/customers    - Export customer data
POST   /api/analytics/reports/generate    - Generate custom report
```

---

## 🔔 Notifications

### Notification Management
```
GET    /api/notifications             - Get user notifications
PUT    /api/notifications/:id/read    - Mark notification as read
PUT    /api/notifications/read-all    - Mark all as read
DELETE /api/notifications/:id         - Delete notification
DELETE /api/notifications             - Clear all notifications
```

### Notification Preferences
```
GET    /api/notifications/preferences - Get notification preferences
PUT    /api/notifications/preferences - Update preferences
POST   /api/notifications/test        - Send test notification
```

### Push Notifications
```
POST   /api/notifications/subscribe   - Subscribe to push notifications
DELETE /api/notifications/unsubscribe - Unsubscribe from push
POST   /api/notifications/send        - Send notification (admin)
```

---

## 💝 Wishlist & Favorites

### Wishlist Management
```
GET    /api/wishlist                 - Get user wishlist
POST   /api/wishlist/items           - Add item to wishlist
DELETE /api/wishlist/items/:id       - Remove item from wishlist
DELETE /api/wishlist                 - Clear wishlist
POST   /api/wishlist/share           - Share wishlist
```

### Seller Following
```
GET    /api/following                - Get followed sellers
POST   /api/following/:sellerId      - Follow seller
DELETE /api/following/:sellerId      - Unfollow seller
GET    /api/followers                - Get seller's followers (seller only)
```

---

## 🔍 Search & Discovery

### Search API
```
GET    /api/search                   - Universal search
GET    /api/search/products          - Search products
GET    /api/search/stores            - Search stores
GET    /api/search/suggestions       - Get search suggestions
GET    /api/search/autocomplete      - Autocomplete search
```

### Filters & Sorting
```
GET    /api/filters/products         - Get available product filters
GET    /api/filters/stores           - Get available store filters
POST   /api/search/save              - Save search query
GET    /api/search/saved             - Get saved searches
```

---

## 🛡️ Admin & Moderation

### User Management
```
GET    /api/admin/users              - List all users
GET    /api/admin/users/:id          - Get user details
PUT    /api/admin/users/:id/status   - Update user status
DELETE /api/admin/users/:id          - Delete user account
POST   /api/admin/users/:id/message  - Send message to user
```

### Store Verification
```
GET    /api/admin/stores/pending     - Get pending verifications
PUT    /api/admin/stores/:id/verify  - Approve/reject store
GET    /api/admin/stores/:id/documents - Get verification documents
```

### Content Moderation
```
GET    /api/admin/reports            - Get reported content
PUT    /api/admin/reports/:id        - Handle report
GET    /api/admin/reviews/flagged    - Get flagged reviews
PUT    /api/admin/reviews/:id/moderate - Moderate review
```

### Platform Settings
```
GET    /api/admin/settings           - Get platform settings
PUT    /api/admin/settings           - Update platform settings
GET    /api/admin/categories         - Manage categories
POST   /api/admin/announcements      - Create announcements
```

---

## 🔄 Real-time Features

### WebSocket Events
```
/ws/orders                          - Order status updates
/ws/notifications                   - Real-time notifications
/ws/chat                           - Customer-seller messaging
/ws/inventory                      - Inventory updates
```

### Real-time Endpoints
```
GET    /api/realtime/orders/:id      - Subscribe to order updates
GET    /api/realtime/inventory/:id   - Subscribe to inventory updates
POST   /api/realtime/ping            - Health check
```

---

## 📱 Mobile API Extensions

### Mobile-Specific Routes
```
POST   /api/mobile/register-device   - Register mobile device
POST   /api/mobile/push-token        - Update push notification token
GET    /api/mobile/app-config        - Get mobile app configuration
POST   /api/mobile/crash-report      - Submit crash report
```

### Offline Support
```
GET    /api/mobile/sync              - Sync offline data
POST   /api/mobile/queue             - Queue offline actions
GET    /api/mobile/cache-manifest    - Get cache manifest
```

---

## 🔧 System & Utilities

### Health & Monitoring
```
GET    /api/health                   - System health check
GET    /api/status                   - Service status
GET    /api/metrics                  - System metrics
POST   /api/feedback                 - Submit user feedback
```

### File Management
```
POST   /api/upload                   - Upload file
DELETE /api/upload/:id               - Delete uploaded file
GET    /api/upload/:id/url           - Get file URL
POST   /api/upload/batch             - Batch upload files
```

### Utilities
```
GET    /api/utils/countries          - Get countries list
GET    /api/utils/states/:country    - Get states/provinces
GET    /api/utils/cities/:state      - Get cities
POST   /api/utils/validate-address   - Validate address
GET    /api/utils/exchange-rates     - Get currency exchange rates
```

---

## 🔐 Security & Rate Limiting

### Rate Limits (per hour)
- Authentication: 10 requests
- Search: 1000 requests  
- Cart operations: 500 requests
- Order creation: 50 requests
- File uploads: 100 requests
- General API: 2000 requests

### Security Headers
- CORS configuration
- CSRF protection
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

---

## 📋 API Response Format

### Standard Response Structure
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response Structure
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {}
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

### Pagination Structure
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

**Total API Endpoints: 200+**

This comprehensive API structure provides full CRUD operations for all entities, real-time features, analytics, admin functionality, and mobile support for the Riba Market platform.