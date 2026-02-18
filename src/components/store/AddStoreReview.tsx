import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Send, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AnonymousStoreReviewForm, type AnonymousStoreReviewData } from "./AnonymousStoreReviewForm";
import type { StoreReview } from "@/data/storeReviewsData";

interface AddStoreReviewProps {
  storeName: string;
  onReviewAdded: (review: StoreReview | AnonymousStoreReviewData) => void;
}

export function AddStoreReview({ storeName, onReviewAdded }: AddStoreReviewProps) {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuthenticatedReviewSubmit = async () => {
    if (!authState.isAuthenticated) {
      toast({ title: "Error", description: "Please log in to leave a review", variant: "destructive" });
      return;
    }

    if (!comment.trim()) {
      toast({ title: "Error", description: "Please write a review comment", variant: "destructive" });
      return;
    }

    if (comment.trim().length < 10) {
      toast({ title: "Error", description: "Review must be at least 10 characters long", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const newReview: StoreReview = {
        id: `sr-${Date.now()}`,
        storeName,
        userId: authState.currentUser?.id || "anonymous",
        author: authState.currentUser?.name || "Anonymous",
        avatar: authState.currentUser?.avatar || `https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 50)}`,
        rating,
        date: new Date().toISOString().split("T")[0],
        comment: comment.trim(),
        helpful: 0,
      };

      // Get existing reviews from localStorage
      const existingReviews = localStorage.getItem(`riba_store_reviews_${storeName}`);
      const reviews = existingReviews ? JSON.parse(existingReviews) : [];

      // Add new review
      reviews.unshift(newReview);

      // Save to localStorage
      localStorage.setItem(`riba_store_reviews_${storeName}`, JSON.stringify(reviews));

      // Call callback
      onReviewAdded(newReview);

      // Reset form
      setRating(5);
      setComment("");
      setOpen(false);

      toast({ title: "Success", description: "Your review has been posted!", variant: "default" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not logged in, show options for login or anonymous review
  if (!authState.isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="gap-2 mb-6">
            <Star className="h-4 w-4" />
            Write a Review
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <Tabs defaultValue="anonymous" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="anonymous">Leave Anonymous Review</TabsTrigger>
              <TabsTrigger value="login">Login to Review</TabsTrigger>
            </TabsList>

            <TabsContent value="anonymous" className="mt-6 max-h-[80vh] overflow-y-auto">
              <AnonymousStoreReviewForm 
                storeName={storeName} 
                onReviewSubmit={(review) => {
                  onReviewAdded(review);
                  setOpen(false);
                }}
                onClose={() => setOpen(false)}
              />
            </TabsContent>

            <TabsContent value="login" className="mt-6">
              <Card className="p-6 border-2 border-primary/30 bg-primary/5">
                <div className="flex gap-4">
                  <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Sign In for Verified Review</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create an account or sign in to leave a verified review with your profile. This helps other customers know your review comes from a trusted account.
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => navigate("/login", { state: { from: "review" } })}
                        className="btn-profit"
                      >
                        Login or Sign Up
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  }

  // If logged in, show review form
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2 mb-6">
          <Star className="h-4 w-4" />
          Write a Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Leave a Review for {storeName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review *</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this store... (minimum 10 characters)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-24 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleAuthenticatedReviewSubmit}
            disabled={isSubmitting || !comment.trim() || comment.trim().length < 10}
            className="w-full gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Posting..." : "Post Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
