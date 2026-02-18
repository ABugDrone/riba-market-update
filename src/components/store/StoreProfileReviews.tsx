import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { mockReviews } from "@/data/mockExtended";
import { mockStoreReviews, type StoreReview } from "@/data/storeReviewsData";
import { AddStoreReview } from "./AddStoreReview";
import { Badge } from "@/components/ui/badge";
import type { AnonymousStoreReviewData } from "./AnonymousStoreReviewForm";

type ReviewType = StoreReview | AnonymousStoreReviewData;

interface Props {
  storeName: string;
  rating: number;
  reviewCount: number;
}

export default function StoreProfileReviews({ storeName, rating, reviewCount: initialReviewCount }: Props) {
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [reviewCount, setReviewCount] = useState(initialReviewCount);

  useEffect(() => {
    // Load reviews from localStorage for this store
    const savedReviews = localStorage.getItem(`riba_store_reviews_${storeName}`);
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
      setReviewCount(JSON.parse(savedReviews).length + initialReviewCount);
    } else {
      // Use mock data on first load
      const mockData = mockStoreReviews.filter((r) => r.storeName === storeName);
      setReviews(mockData);
      setReviewCount(mockData.length + initialReviewCount);
    }
  }, [storeName, initialReviewCount]);

  const handleReviewAdded = (newReview: ReviewType) => {
    setReviews((prev) => [newReview, ...prev]);
    setReviewCount((prev) => prev + 1);
  };

  return (
    <>
      <AddStoreReview storeName={storeName} onReviewAdded={handleReviewAdded} />
      
      <div className="mb-6 p-4 rounded-lg bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">{rating}</p>
            <div className="flex gap-0.5 my-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(rating) ? "fill-primary text-primary" : "text-muted"}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{reviewCount} reviews</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const pct = star === 5 ? 65 : star === 4 ? 20 : star === 3 ? 10 : star === 2 ? 3 : 2;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs w-3">{star}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <img src={review.avatar} alt={review.author} className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{review.author}</p>
                  {"isAnonymous" in review && review.isAnonymous && (
                    <Badge variant="outline" className="text-xs">Anonymous</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-3 w-3 ${s <= review.rating ? "fill-primary text-primary" : "text-muted"}`} />
                  ))}
                  <span className="text-xs text-muted-foreground ml-2">{review.date}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{review.comment}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Helpful: {review.helpful}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
