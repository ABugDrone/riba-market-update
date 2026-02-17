import { type Product } from "./mock";

// Extended mock products for catalog page
export const allProducts: Product[] = [
  { id: "1", name: "Jollof Rice Party Pack", price: 15000, originalPrice: 18000, image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=300&fit=crop", storeName: "Mama's Kitchen", storeVerified: true, storeType: "restaurant", rating: 4.8, reviewCount: 234, category: "Food", badge: "sale", discountPercent: 17, inStock: true },
  { id: "2", name: "Premium Ankara Fabric (6 yards)", price: 8500, image: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=300&fit=crop", storeName: "Aso Oke Palace", storeVerified: true, storeType: "product", rating: 4.6, reviewCount: 89, category: "Fashion", badge: "new", inStock: true },
  { id: "3", name: "Professional Photography Session", price: 45000, image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=400&h=300&fit=crop", storeName: "SnapPro Studios", storeVerified: false, storeType: "service", rating: 4.9, reviewCount: 56, category: "Services", inStock: true },
  { id: "4", name: "Samsung Galaxy A54 5G", price: 235000, originalPrice: 280000, image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop", storeName: "TechHub NG", storeVerified: true, storeType: "product", rating: 4.7, reviewCount: 312, category: "Electronics", badge: "sale", discountPercent: 16, inStock: true },
  { id: "5", name: "Suya Special (10 sticks)", price: 5000, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop", storeName: "Abuja Grills", storeVerified: true, storeType: "restaurant", rating: 4.5, reviewCount: 178, category: "Food", inStock: true },
  { id: "6", name: "Home Cleaning Service", price: 20000, image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop", storeName: "CleanSpace NG", storeVerified: true, storeType: "service", rating: 4.4, reviewCount: 67, category: "Services", badge: "new", inStock: true },
  { id: "7", name: "Nike Air Max 90 (Original)", price: 85000, originalPrice: 95000, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop", storeName: "SneakerVault", storeVerified: true, storeType: "product", rating: 4.8, reviewCount: 201, category: "Fashion", badge: "sale", discountPercent: 11, inStock: true },
  { id: "8", name: "Peppered Chicken & Fried Rice", price: 4500, image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop", storeName: "The Food Court", storeVerified: false, storeType: "restaurant", rating: 4.3, reviewCount: 145, category: "Food", inStock: true },
  { id: "9", name: "Laptop Repair Service", price: 15000, image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop", storeName: "FixIt NG", storeVerified: true, storeType: "service", rating: 4.6, reviewCount: 89, category: "Services", inStock: true },
  { id: "10", name: "iPhone 15 Pro Max Case", price: 5500, originalPrice: 7000, image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=300&fit=crop", storeName: "TechHub NG", storeVerified: true, storeType: "product", rating: 4.2, reviewCount: 45, category: "Electronics", badge: "sale", discountPercent: 21, inStock: true },
  { id: "11", name: "Agbada Set (3 Piece)", price: 65000, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=300&fit=crop", storeName: "Aso Oke Palace", storeVerified: true, storeType: "product", rating: 4.9, reviewCount: 34, category: "Fashion", badge: "new", inStock: true },
  { id: "12", name: "Shawarma Special Combo", price: 3500, image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop", storeName: "Abuja Grills", storeVerified: true, storeType: "restaurant", rating: 4.7, reviewCount: 210, category: "Food", inStock: true },
];

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: { name: string; quantity: number; price: number; image: string }[];
  total: number;
  paymentMethod: string;
  deliveryAddress: string;
  storeName: string;
}

export const mockOrders: Order[] = [
  {
    id: "o1", orderNumber: "RBM-2024-001", date: "2024-12-15",
    status: "delivered",
    items: [
      { name: "Samsung Galaxy A54 5G", quantity: 1, price: 235000, image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=80&h=80&fit=crop" },
    ],
    total: 237500, paymentMethod: "Card", deliveryAddress: "12 Allen Ave, Ikeja, Lagos", storeName: "TechHub NG",
  },
  {
    id: "o2", orderNumber: "RBM-2024-002", date: "2024-12-20",
    status: "shipped",
    items: [
      { name: "Nike Air Max 90", quantity: 1, price: 85000, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop" },
      { name: "iPhone 15 Pro Max Case", quantity: 2, price: 5500, image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=80&h=80&fit=crop" },
    ],
    total: 98500, paymentMethod: "Bank Transfer", deliveryAddress: "45 Admiralty Way, Lekki, Lagos", storeName: "SneakerVault",
  },
  {
    id: "o3", orderNumber: "RBM-2024-003", date: "2025-01-05",
    status: "processing",
    items: [
      { name: "Jollof Rice Party Pack", quantity: 3, price: 15000, image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=80&h=80&fit=crop" },
    ],
    total: 47500, paymentMethod: "Cash on Delivery", deliveryAddress: "8 Wuse Zone 5, Abuja", storeName: "Mama's Kitchen",
  },
  {
    id: "o4", orderNumber: "RBM-2024-004", date: "2025-01-10",
    status: "pending",
    items: [
      { name: "Home Cleaning Service", quantity: 1, price: 20000, image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=80&h=80&fit=crop" },
    ],
    total: 20000, paymentMethod: "Card", deliveryAddress: "3 Garki Area 11, Abuja", storeName: "CleanSpace NG",
  },
];

export interface SellerProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  inventory: number;
  status: "active" | "draft" | "out_of_stock";
  image: string;
  sales: number;
}

export const sellerProducts: SellerProduct[] = [
  { id: "sp1", name: "Samsung Galaxy A54 5G", category: "Electronics", price: 235000, inventory: 45, status: "active", image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=80&h=80&fit=crop", sales: 312 },
  { id: "sp2", name: "iPhone 15 Pro Max Case", category: "Electronics", price: 5500, inventory: 200, status: "active", image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=80&h=80&fit=crop", sales: 45 },
  { id: "sp3", name: "USB-C Fast Charger", category: "Electronics", price: 8000, inventory: 0, status: "out_of_stock", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=80&h=80&fit=crop", sales: 128 },
  { id: "sp4", name: "Bluetooth Speaker", category: "Electronics", price: 18000, inventory: 12, status: "active", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=80&h=80&fit=crop", sales: 67 },
  { id: "sp5", name: "Wireless Earbuds", category: "Electronics", price: 25000, inventory: 5, status: "draft", image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=80&h=80&fit=crop", sales: 0 },
];

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  id: string;
  label: string;
  fullAddress: string;
  city: string;
  state: string;
  phone: string;
  isDefault: boolean;
}

export const mockAddresses: Address[] = [
  { id: "a1", label: "Home", fullAddress: "12 Allen Avenue", city: "Ikeja", state: "Lagos", phone: "+234 801 234 5678", isDefault: true },
  { id: "a2", label: "Office", fullAddress: "45 Admiralty Way", city: "Lekki", state: "Lagos", phone: "+234 802 345 6789", isDefault: false },
];

export interface Review {
  id: string;
  productId: string; // Product being reviewed
  userId: string; // User who left the review
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  location?: string; // State/Local Govt Area
  helpful: number;
  sellerReply?: {
    id: string;
    sellerId: string;
    sellerName: string;
    message: string;
    date: string;
  };
}

export const mockReviews: Review[] = [
  { id: "r1", productId: "1", userId: "demo-buyer-001", author: "Chidi O.", avatar: "https://i.pravatar.cc/40?img=1", rating: 5, date: "2025-01-10", comment: "Excellent product! Fast delivery and great quality. Would definitely recommend to anyone looking for value.", location: "Lagos", helpful: 12, sellerReply: { id: "sr1", sellerId: "demo-seller-001", sellerName: "TechHub NG", message: "Thank you for the amazing review! We appreciate your business and hope to serve you again soon. Check out our new arrivals next week!", date: "2025-01-11" } },
  { id: "r2", productId: "1", userId: "demo-001", author: "Amina B.", avatar: "https://i.pravatar.cc/40?img=5", rating: 4, date: "2025-01-08", comment: "Good product overall. Packaging could be better but the item itself is wonderful.", location: "Abuja", helpful: 8 },
  { id: "r3", productId: "4", userId: "demo-buyer-001", author: "Emeka N.", avatar: "https://i.pravatar.cc/40?img=3", rating: 5, date: "2025-01-05", comment: "Amazing value for money. The vendor was very responsive and helpful.", location: "Lagos", helpful: 15, sellerReply: { id: "sr2", sellerId: "demo-seller-001", sellerName: "TechHub NG", message: "Emeka, we're thrilled to hear this! Don't miss our upcoming 20% off promo on all electronics next Monday.", date: "2025-01-06" } },
  { id: "r4", productId: "4", userId: "demo-001", author: "Fatima Y.", avatar: "https://i.pravatar.cc/40?img=9", rating: 3, date: "2025-01-02", comment: "Decent product but took a bit longer than expected to arrive.", location: "Port Harcourt", helpful: 4 },
];
