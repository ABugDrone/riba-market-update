import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AddStoreReview } from "./AddStoreReview";
import { useStoreReviews, useCreateReview } from "@/hooks/useReviews";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Props {
  storeName: string;
  storeId?: string;
  rating: number;
  reviewCount: number;
}

export default function StoreProfileReviews({ storeName, storeId, rating, reviewCount }: Props) {
  const { state } = useAuth();
  const { toast } = useToast();
  const { data: reviews = [], isLoading } = useStoreReviews(storeId);
  const createReview = useCreateReview();

  const displayRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : rating;
  const displayCount = reviews.length || reviewCount;

  const handleReviewAdded = async (newReview: {
    author: string;
    avatar?: string;
    rating: number;
    comment: string;
    isAnonymous?: boolean;
  }) => {
    if (!storeId) {
      toast({ title: "Cannot submit review", description: "Store not found", variant: "destructive" });
      return;
    }
    const { error } = await createReview.mutateAsync({
      store_id: storeId,
      buyer_id: state.currentUser?.id ?? "",
      author_name: newReview.author,
      author_avatar: newReview.avatar ?? null,
      rating: newReview.rating,
      comment: newReview.comment,
      is_anonymous: newReview.isAnonymous ?? false,
    });
    if (error) {
      toast({ title: "Failed to submit review", description: error, variant: "destructive" });
    } else {
      toast({ title: "Review submitted!" });
    }
  };

  // Rating distribution
  const dist = [5,4,3,2,1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { star, pct };
  });

  return (
    <>
      <AddStoreReview storeName={storeName} onReviewAdded={handleReviewAdded} />

      <div className="mb-6 p-4 rounded-lg bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">{displayRating.toFixed(1)}</p>
            <div className="flex gap-0.5 my-1">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(displayRating) ? "fill-primary text-primary" : "text-muted"}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{displayCount} reviews</p>
          </div>
          <div className="flex-1 space-y-1">
            {dist.map(({ star, pct }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs w-3">{star}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-8">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                {review.author_avatar ? (
                  <img src={review.author_avatar} alt={review.author_name ?? ""} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                    {(review.author_name ?? "A")[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{review.author_name ?? "Anonymous"}</p>
                    {review.is_anonymous && <Badge variant="outline" className="text-xs">Anonymous</Badge>}
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`h-3 w-3 ${s <= review.rating ? "fill-primary text-primary" : "text-muted"}`} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
              {review.helpful != null && review.helpful > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">Helpful: {review.helpful}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
