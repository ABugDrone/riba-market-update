// Mock Analytics Data for Seller Dashboard

export interface DailyAnalytics {
  date: string;
  sales: number;
  orders: number;
  revenue: number;
  costs: number;
  profit: number;
  gains: number;
  losses: number;
}

export interface WeeklyAnalytics {
  week: string;
  startDate: string;
  endDate: string;
  sales: number;
  orders: number;
  revenue: number;
  costs: number;
  profit: number;
  gains: number;
  losses: number;
  days: DailyAnalytics[];
}

export interface MonthlyAnalytics {
  month: string;
  year: number;
  sales: number;
  orders: number;
  revenue: number;
  costs: number;
  profit: number;
  gains: number;
  losses: number;
  weeks: WeeklyAnalytics[];
}

export interface ReviewAnalytics {
  month: string;
  positive: number;
  negative: number;
  neutral: number;
  totalReviews: number;
  averageRating: number;
}

// Daily data for December 2024
export const decemberDailyData: DailyAnalytics[] = [
  { date: "Dec 1", sales: 5, orders: 3, revenue: 85000, costs: 25000, profit: 60000, gains: 65000, losses: 5000 },
  { date: "Dec 2", sales: 8, orders: 5, revenue: 125000, costs: 35000, profit: 90000, gains: 95000, losses: 5000 },
  { date: "Dec 3", sales: 3, orders: 2, revenue: 45000, costs: 15000, profit: 30000, gains: 32000, losses: 2000 },
  { date: "Dec 4", sales: 12, orders: 7, revenue: 195000, costs: 55000, profit: 140000, gains: 145000, losses: 5000 },
  { date: "Dec 5", sales: 6, orders: 4, revenue: 95000, costs: 28000, profit: 67000, gains: 70000, losses: 3000 },
  { date: "Dec 6", sales: 10, orders: 6, revenue: 160000, costs: 45000, profit: 115000, gains: 120000, losses: 5000 },
  { date: "Dec 7", sales: 15, orders: 9, revenue: 245000, costs: 70000, profit: 175000, gains: 180000, losses: 5000 },
  { date: "Dec 8", sales: 7, orders: 4, revenue: 115000, costs: 32000, profit: 83000, gains: 85000, losses: 2000 },
  { date: "Dec 9", sales: 9, orders: 5, revenue: 145000, costs: 40000, profit: 105000, gains: 108000, losses: 3000 },
  { date: "Dec 10", sales: 11, orders: 6, revenue: 175000, costs: 50000, profit: 125000, gains: 128000, losses: 3000 },
  { date: "Dec 11", sales: 4, orders: 2, revenue: 65000, costs: 20000, profit: 45000, gains: 47000, losses: 2000 },
  { date: "Dec 12", sales: 14, orders: 8, revenue: 220000, costs: 62000, profit: 158000, gains: 162000, losses: 4000 },
  { date: "Dec 13", sales: 6, orders: 3, revenue: 95000, costs: 28000, profit: 67000, gains: 69000, losses: 2000 },
  { date: "Dec 14", sales: 13, orders: 7, revenue: 205000, costs: 58000, profit: 147000, gains: 150000, losses: 3000 },
  { date: "Dec 15", sales: 8, orders: 5, revenue: 125000, costs: 35000, profit: 90000, gains: 92000, losses: 2000 },
  { date: "Dec 16", sales: 16, orders: 10, revenue: 260000, costs: 73000, profit: 187000, gains: 191000, losses: 4000 },
  { date: "Dec 17", sales: 5, orders: 3, revenue: 80000, costs: 23000, profit: 57000, gains: 59000, losses: 2000 },
  { date: "Dec 18", sales: 11, orders: 6, revenue: 175000, costs: 50000, profit: 125000, gains: 128000, losses: 3000 },
  { date: "Dec 19", sales: 9, orders: 5, revenue: 145000, costs: 40000, profit: 105000, gains: 107000, losses: 2000 },
  { date: "Dec 20", sales: 17, orders: 10, revenue: 275000, costs: 77000, profit: 198000, gains: 202000, losses: 4000 },
  { date: "Dec 21", sales: 7, orders: 4, revenue: 110000, costs: 31000, profit: 79000, gains: 81000, losses: 2000 },
  { date: "Dec 22", sales: 12, orders: 7, revenue: 190000, costs: 54000, profit: 136000, gains: 139000, losses: 3000 },
  { date: "Dec 23", sales: 10, orders: 6, revenue: 160000, costs: 45000, profit: 115000, gains: 117000, losses: 2000 },
  { date: "Dec 24", sales: 18, orders: 11, revenue: 290000, costs: 81000, profit: 209000, gains: 213000, losses: 4000 },
  { date: "Dec 25", sales: 6, orders: 3, revenue: 95000, costs: 27000, profit: 68000, gains: 70000, losses: 2000 },
  { date: "Dec 26", sales: 14, orders: 8, revenue: 220000, costs: 62000, profit: 158000, gains: 161000, losses: 3000 },
  { date: "Dec 27", sales: 11, orders: 6, revenue: 175000, costs: 49000, profit: 126000, gains: 129000, losses: 3000 },
  { date: "Dec 28", sales: 19, orders: 11, revenue: 305000, costs: 85000, profit: 220000, gains: 224000, losses: 4000 },
  { date: "Dec 29", sales: 8, orders: 5, revenue: 130000, costs: 36000, profit: 94000, gains: 96000, losses: 2000 },
  { date: "Dec 30", sales: 15, orders: 9, revenue: 240000, costs: 68000, profit: 172000, gains: 175000, losses: 3000 },
  { date: "Dec 31", sales: 20, orders: 12, revenue: 320000, costs: 89000, profit: 231000, gains: 235000, losses: 4000 },
];

// Weekly data for December 2024
export const decemberWeeklyData: WeeklyAnalytics[] = [
  {
    week: "Week 1",
    startDate: "Dec 1",
    endDate: "Dec 7",
    sales: 59,
    orders: 36,
    revenue: 900000,
    costs: 273000,
    profit: 627000,
    gains: 647000,
    losses: 20000,
    days: decemberDailyData.slice(0, 7),
  },
  {
    week: "Week 2",
    startDate: "Dec 8",
    endDate: "Dec 14",
    sales: 64,
    orders: 38,
    revenue: 980000,
    costs: 297000,
    profit: 683000,
    gains: 703000,
    losses: 20000,
    days: decemberDailyData.slice(7, 14),
  },
  {
    week: "Week 3",
    startDate: "Dec 15",
    endDate: "Dec 21",
    sales: 73,
    orders: 44,
    revenue: 1120000,
    costs: 336000,
    profit: 784000,
    gains: 809000,
    losses: 25000,
    days: decemberDailyData.slice(14, 21),
  },
  {
    week: "Week 4",
    startDate: "Dec 22",
    endDate: "Dec 31",
    sales: 78,
    orders: 46,
    revenue: 1205000,
    costs: 363000,
    profit: 842000,
    gains: 869000,
    losses: 27000,
    days: decemberDailyData.slice(21, 31),
  },
];

// Monthly data
export const monthlyAnalyticsData: MonthlyAnalytics[] = [
  {
    month: "July",
    year: 2024,
    sales: 240,
    orders: 145,
    revenue: 3600000,
    costs: 1080000,
    profit: 2520000,
    gains: 2700000,
    losses: 180000,
    weeks: [],
  },
  {
    month: "August",
    year: 2024,
    sales: 360,
    orders: 216,
    revenue: 5400000,
    costs: 1620000,
    profit: 3780000,
    gains: 4050000,
    losses: 270000,
    weeks: [],
  },
  {
    month: "September",
    year: 2024,
    sales: 500,
    orders: 300,
    revenue: 7500000,
    costs: 2250000,
    profit: 5250000,
    gains: 5625000,
    losses: 375000,
    weeks: [],
  },
  {
    month: "October",
    year: 2024,
    sales: 640,
    orders: 384,
    revenue: 9600000,
    costs: 2880000,
    profit: 6720000,
    gains: 7200000,
    losses: 480000,
    weeks: [],
  },
  {
    month: "November",
    year: 2024,
    sales: 560,
    orders: 336,
    revenue: 8400000,
    costs: 2520000,
    profit: 5880000,
    gains: 6300000,
    losses: 420000,
    weeks: [],
  },
  {
    month: "December",
    year: 2024,
    sales: 274,
    orders: 164,
    revenue: 4205000,
    costs: 1269000,
    profit: 2936000,
    gains: 3028000,
    losses: 92000,
    weeks: decemberWeeklyData,
  },
  {
    month: "January",
    year: 2025,
    sales: 380,
    orders: 228,
    revenue: 5700000,
    costs: 1710000,
    profit: 3990000,
    gains: 4275000,
    losses: 285000,
    weeks: [],
  },
];

// Review Analytics
export const reviewAnalyticsData: ReviewAnalytics[] = [
  { month: "July", positive: 180, negative: 15, neutral: 45, totalReviews: 240, averageRating: 4.6 },
  { month: "August", positive: 270, negative: 22, neutral: 68, totalReviews: 360, averageRating: 4.7 },
  { month: "September", positive: 385, negative: 30, neutral: 85, totalReviews: 500, averageRating: 4.77 },
  { month: "October", positive: 512, negative: 38, neutral: 90, totalReviews: 640, averageRating: 4.8 },
  { month: "November", positive: 448, negative: 33, neutral: 79, totalReviews: 560, averageRating: 4.78 },
  { month: "December", positive: 205, negative: 16, neutral: 53, totalReviews: 274, averageRating: 4.75 },
  { month: "January", positive: 285, negative: 22, neutral: 73, totalReviews: 380, averageRating: 4.74 },
];

// Cost breakdown data
export const costBreakdownData = [
  { category: "Payment Processing", percentage: 25 },
  { category: "Logistics & Shipping", percentage: 30 },
  { category: "Platform Fees", percentage: 15 },
  { category: "Packaging", percentage: 15 },
  { category: "Operations", percentage: 15 },
];
