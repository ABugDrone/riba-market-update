// Mock Invoice Data for Seller Dashboard

export type InvoiceStatus = "pending" | "delivered" | "returned";

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: InvoiceStatus;
  deliveryAddress: string;
  notes?: string;
}

// Generate mock invoices
export const generateMockInvoices = (): Invoice[] => [
  {
    id: "inv-001",
    invoiceNumber: "INV-2024-001",
    customerName: "Chioma Okafor",
    customerEmail: "chioma.okafor@email.com",
    customerPhone: "+234 701 234 5678",
    date: "2024-12-01",
    dueDate: "2024-12-15",
    items: [
      { productId: "1", productName: "Jollof Rice Party Pack", quantity: 2, price: 15000, total: 30000 },
      { productId: "4", productName: "Samsung Galaxy A54 5G", quantity: 1, price: 235000, total: 235000 },
    ],
    subtotal: 265000,
    tax: 31800,
    shippingCost: 5000,
    total: 301800,
    status: "delivered",
    deliveryAddress: "12 Allen Ave, Ikeja, Lagos",
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-2024-002",
    customerName: "Adekunle Adeyemi",
    customerEmail: "adekunle.adeyemi@email.com",
    customerPhone: "+234 812 345 6789",
    date: "2024-12-05",
    dueDate: "2024-12-19",
    items: [
      { productId: "7", productName: "Nike Air Max 90 (Original)", quantity: 1, price: 85000, total: 85000 },
      { productId: "10", productName: "iPhone 15 Pro Max Case", quantity: 3, price: 5500, total: 16500 },
    ],
    subtotal: 101500,
    tax: 12180,
    shippingCost: 3000,
    total: 116680,
    status: "delivered",
    deliveryAddress: "45 Admiralty Way, Lekki, Lagos",
  },
  {
    id: "inv-003",
    invoiceNumber: "INV-2024-003",
    customerName: "Ngozi Chimere",
    customerEmail: "ngozi.chimere@email.com",
    customerPhone: "+234 910 987 6543",
    date: "2024-12-08",
    dueDate: "2024-12-22",
    items: [
      { productId: "2", productName: "Premium Ankara Fabric (6 yards)", quantity: 2, price: 8500, total: 17000 },
    ],
    subtotal: 17000,
    tax: 2040,
    shippingCost: 2000,
    total: 21040,
    status: "pending",
    deliveryAddress: "67 Victoria Island Drive, VI, Lagos",
  },
  {
    id: "inv-004",
    invoiceNumber: "INV-2024-004",
    customerName: "Oluwaseun Babajide",
    customerEmail: "oluwaseun.babajide@email.com",
    customerPhone: "+234 803 456 7890",
    date: "2024-12-10",
    dueDate: "2024-12-24",
    items: [
      { productId: "5", productName: "Suya Special (10 sticks)", quantity: 5, price: 5000, total: 25000 },
      { productId: "8", productName: "Peppered Chicken & Fried Rice", quantity: 3, price: 4500, total: 13500 },
    ],
    subtotal: 38500,
    tax: 4620,
    shippingCost: 2500,
    total: 45620,
    status: "delivered",
    deliveryAddress: "89 Opebi Road, Ikeja, Lagos",
  },
  {
    id: "inv-005",
    invoiceNumber: "INV-2024-005",
    customerName: "Folake Johnson",
    customerEmail: "folake.johnson@email.com",
    customerPhone: "+234 705 432 1098",
    date: "2024-12-12",
    dueDate: "2024-12-26",
    items: [
      { productId: "11", productName: "Agbada Set (3 Piece)", quantity: 1, price: 65000, total: 65000 },
    ],
    subtotal: 65000,
    tax: 7800,
    shippingCost: 4000,
    total: 76800,
    status: "returned",
    deliveryAddress: "101 Lekki Conservation Centre, Lagos",
  },
  {
    id: "inv-006",
    invoiceNumber: "INV-2024-006",
    customerName: "Tunde Owolabi",
    customerEmail: "tunde.owolabi@email.com",
    customerPhone: "+234 916 234 5678",
    date: "2024-12-15",
    dueDate: "2024-12-29",
    items: [
      { productId: "3", productName: "Professional Photography Session", quantity: 1, price: 45000, total: 45000 },
    ],
    subtotal: 45000,
    tax: 5400,
    shippingCost: 0,
    total: 50400,
    status: "pending",
    deliveryAddress: "Surulere, Lagos",
  },
  {
    id: "inv-007",
    invoiceNumber: "INV-2024-007",
    customerName: "Amara Okafor",
    customerEmail: "amara.okafor@email.com",
    customerPhone: "+234 808 765 4321",
    date: "2024-12-18",
    dueDate: "2025-01-01",
    items: [
      { productId: "6", productName: "Home Cleaning Service", quantity: 1, price: 20000, total: 20000 },
    ],
    subtotal: 20000,
    tax: 2400,
    shippingCost: 0,
    total: 22400,
    status: "delivered",
    deliveryAddress: "Yaba, Lagos",
  },
  {
    id: "inv-008",
    invoiceNumber: "INV-2024-008",
    customerName: "Chidi Nwosu",
    customerEmail: "chidi.nwosu@email.com",
    customerPhone: "+234 902 345 6789",
    date: "2024-12-20",
    dueDate: "2025-01-03",
    items: [
      { productId: "9", productName: "Laptop Repair Service", quantity: 1, price: 15000, total: 15000 },
      { productId: "1", productName: "Jollof Rice Party Pack", quantity: 1, price: 15000, total: 15000 },
    ],
    subtotal: 30000,
    tax: 3600,
    shippingCost: 2500,
    total: 36100,
    status: "pending",
    deliveryAddress: "Mushin, Lagos",
  },
  {
    id: "inv-009",
    invoiceNumber: "INV-2024-009",
    customerName: "Zainab Adamu",
    customerEmail: "zainab.adamu@email.com",
    customerPhone: "+234 807 654 3210",
    date: "2024-12-22",
    dueDate: "2025-01-05",
    items: [
      { productId: "12", productName: "Shawarma Special Combo", quantity: 4, price: 3500, total: 14000 },
    ],
    subtotal: 14000,
    tax: 1680,
    shippingCost: 1500,
    total: 17180,
    status: "delivered",
    deliveryAddress: "Apapa, Lagos",
  },
  {
    id: "inv-010",
    invoiceNumber: "INV-2024-010",
    customerName: "Victor Okonkwo",
    customerEmail: "victor.okonkwo@email.com",
    customerPhone: "+234 814 567 8901",
    date: "2024-12-25",
    dueDate: "2025-01-08",
    items: [
      { productId: "4", productName: "Samsung Galaxy A54 5G", quantity: 1, price: 235000, total: 235000 },
    ],
    subtotal: 235000,
    tax: 28200,
    shippingCost: 5000,
    total: 268200,
    status: "returned",
    deliveryAddress: "Ikoyi, Lagos",
  },
];

export const mockInvoices = generateMockInvoices();
