# Riba Market

**Where Profit Meets Marketplace**

A modern multi-vendor eCommerce platform supporting restaurants, products, and services with a focus on Nigerian markets.

## 🚀 Overview

Riba Market is a comprehensive marketplace platform that connects buyers with verified sellers across multiple categories including food & restaurants, physical products, and professional services. Built with modern web technologies and designed for scalability.

*"Riba" means "profit" in Hausa language, reflecting our commitment to helping vendors grow their businesses.*

## ✨ Features

### For Buyers
- **Multi-Category Shopping**: Browse restaurants, products, and services in one platform
- **Smart Filtering**: Filter by category, price, location, verification status, and ratings
- **Secure Payments**: Multiple payment options including Flutterwave integration and cash-on-delivery
- **Order Tracking**: Real-time order status updates and delivery tracking
- **Reviews & Ratings**: Rate and review products and sellers
- **Wishlist & Favorites**: Save items and follow preferred sellers
- **Mobile-First Design**: Responsive design with mobile bottom navigation

### For Sellers
- **Multi-Store Management**: Create and manage multiple stores under one account
- **Flexible Catalog**: Support for products, restaurant items, and services
- **Analytics Dashboard**: Track sales, revenue, customer reviews, and performance metrics
- **Inventory Management**: Automatic product lifecycle management
- **Order Management**: Process orders, communicate with customers, and track fulfillment
- **Verification System**: Get verified status to build customer trust

### Platform Features
- **Dark/Light Theme**: System-aware theme switching
- **Real-time Updates**: Live cart updates and notifications
- **PDF Generation**: Automated receipt and invoice generation
- **Search & Discovery**: Full-text search across all products and services
- **Trust Indicators**: Seller verification badges and customer reviews

## 🛠 Tech Stack

### Frontend (Current)
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer
- **Routing**: React Router v6
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React

### Planned Backend Stack
- **Runtime**: Node.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Payments**: Flutterwave
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd riba-market
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🧪 Testing

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm test:watch

# Lint code
npm run lint
```

## 📱 Demo Accounts

The application includes demo accounts for testing:

- **Demo User (Both Buyer & Seller)**
  - Email: `demo@ribamarket.com`
  - Password: `password123`

- **Demo Seller**
  - Email: `seller@ribamarket.com`
  - Password: `password123`

- **Demo Buyer**
  - Email: `buyer@ribamarket.com`
  - Password: `password123`

## 🎨 Design System

### Brand Colors
- **Primary**: Green (#22c55e) - representing growth and prosperity
- **Secondary**: Emerald (#10b981)
- **Accent**: Amber (#f59e0b) - for promotions and highlights

### Typography
- **Font Family**: System fonts (Inter/Geist recommended for production)
- **Spacing**: 4/8px grid system
- **Components**: Accessible, responsive with smooth theme transitions

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── landing/        # Landing page components
│   ├── seller/         # Seller-specific components
│   └── store/          # Store profile components
├── contexts/           # React contexts (Auth, Theme)
├── data/              # Mock data and type definitions
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── pages/             # Route components
│   ├── buyer/         # Buyer dashboard pages
│   └── seller/        # Seller dashboard pages
├── test/              # Test files and setup
└── utils/             # Helper utilities
```

## 🔐 Security Features

- **Input Validation**: Zod schemas for all form inputs
- **Authentication**: Secure session management
- **Authorization**: Role-based access control
- **Data Protection**: Sanitized user inputs and secure API calls

## 🚀 Deployment

The application is configured for deployment on Vercel with the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_WEBHOOK_SECRET=your_webhook_secret
```

## 🛣 Roadmap

### Phase 1: Backend Integration
- [ ] Supabase setup and database schema
- [ ] Authentication system implementation
- [ ] API routes development
- [ ] Payment gateway integration

### Phase 2: Enhanced Features
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Mobile app development
- [ ] Multi-language support

### Phase 3: Scale & Optimize
- [ ] Performance optimization
- [ ] Advanced search with Elasticsearch
- [ ] Microservices architecture
- [ ] AI-powered recommendations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ for the Nigerian marketplace ecosystem**