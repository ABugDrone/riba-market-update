export interface StoreReview {
  id: string;
  storeName: string;
  userId: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

export const mockStoreReviews: StoreReview[] = [
  {
    id: "sr1",
    storeName: "TechHub NG",
    userId: "demo-buyer-001",
    author: "Chidi O.",
    avatar: "https://i.pravatar.cc/40?img=1",
    rating: 5,
    date: "2025-01-15",
    comment: "Excellent store! Amazing selection of electronics and gadgets. The staff is very helpful and responsive. Highly recommended!",
    helpful: 24,
  },
  {
    id: "sr2",
    storeName: "TechHub NG",
    userId: "demo-001",
    author: "Amina B.",
    avatar: "https://i.pravatar.cc/40?img=5",
    rating: 4,
    date: "2025-01-12",
    comment: "Great variety of products and competitive prices. Delivery was fast and packaging was secure.",
    helpful: 15,
  },
  {
    id: "sr3",
    storeName: "TechHub NG",
    userId: "user-003",
    author: "Emeka N.",
    avatar: "https://i.pravatar.cc/40?img=3",
    rating: 5,
    date: "2025-01-10",
    comment: "Best electronics store I've found on Riba Market. Customer service is top-notch!",
    helpful: 18,
  },
  {
    id: "sr4",
    storeName: "TechHub NG",
    userId: "user-004",
    author: "Fatima Y.",
    avatar: "https://i.pravatar.cc/40?img=9",
    rating: 4,
    date: "2025-01-05",
    comment: "Good products and reasonable prices. Would appreciate faster delivery next time.",
    helpful: 8,
  },
];
