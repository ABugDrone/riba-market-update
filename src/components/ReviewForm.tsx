import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Send, AlertCircle } from "lucide-react";
import { AnonymousReviewForm, AnonymousReviewData } from "./AnonymousReviewForm";

export interface ReviewData {
  id: string;
  productId: string;
  userId: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  location?: string;
  helpful: number;
  isAnonymous?: false;
}

interface ReviewFormProps {
  productId: string;
  onReviewSubmit?: (review: ReviewData | AnonymousReviewData) => void;
}

export function ReviewForm({ productId, onReviewSubmit }: ReviewFormProps) {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If not logged in, show options for login or anonymous review
  if (!authState.isAuthenticated) {
    return (
      <Tabs defaultValue="anonymous" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="anonymous">Leave Anonymous Review</TabsTrigger>
          <TabsTrigger value="login">Login to Review</TabsTrigger>
        </TabsList>

        <TabsContent value="anonymous" className="mt-6 max-h-[85vh] md:max-h-auto overflow-y-auto">
          <AnonymousReviewForm productId={productId} onReviewSubmit={onReviewSubmit} />
        </TabsContent>

        <TabsContent value="login" className="mt-6">
          <Card className="p-6 border-2 border-primary/30 bg-primary/5">
            <div className="flex gap-4">
              <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Sign In for Verified Review</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create an account or sign in to leave a verified review with your profile. This helps other buyers know your review comes from a trusted account.
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => navigate("/login", { state: { from: "review", productId } })}
                    className="btn-profit"
                  >
                    Login or Sign Up
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/login")}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    );
  }

  // If seller, don't allow review
  if (authState.currentUser?.userType === "seller") {
    return (
      <Card className="p-6 border-2 border-destructive/30 bg-destructive/5">
        <div className="flex gap-4">
          <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-lg">Sellers Cannot Review</h3>
            <p className="text-sm text-muted-foreground">
              To maintain platform integrity, seller accounts cannot leave reviews on products. Switch to buyer mode to review products you've purchased.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // If buyer but not purchased
  if (authState.currentUser?.userType === "buyer" && !authState.currentUser?.purchasedProductIds.includes(productId)) {
    return (
      <Card className="p-6 border-2 border-amber-300/30 bg-amber-50 dark:bg-amber-950/20">
        <div className="flex gap-4">
          <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-lg">Purchase Required</h3>
            <p className="text-sm text-muted-foreground">
              Only customers who have purchased this product can leave a review. Your review helps other buyers make informed decisions.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({ title: "Error", description: "Please select a rating", variant: "destructive" });
      return;
    }

    if (comment.trim().length < 10) {
      toast({ title: "Error", description: "Review must be at least 10 characters long", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      const newReview = {
        id: `r-${Date.now()}`,
        productId,
        userId: authState.currentUser?.id || "",
        author: authState.currentUser?.name || "Anonymous",
        avatar: authState.currentUser?.avatar || `https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 70)}`,
        rating,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).split("/").reverse().join("-"),
        comment,
        location: authState.currentUser?.state ? `${authState.currentUser.city}, ${authState.currentUser.state}` : undefined,
        helpful: 0,
      };

      // Call callback if provided
      if (onReviewSubmit) {
        onReviewSubmit(newReview);
      }

      toast({ title: "Success", description: "Your review has been posted!" });
      setRating(0);
      setComment("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit review", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 border-2 border-primary/20">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>Share Your Review</span>
        <Badge className="bg-primary/20 text-primary border-0">Verified Purchase</Badge>
      </h3>

      {/* User Info Preview */}
      <div className="mb-6 p-4 rounded-lg bg-muted/50 flex items-center gap-3">
        <img 
          src={authState.currentUser?.avatar || `https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 70)}`}
          alt={authState.currentUser?.name}
          className="h-10 w-10 rounded-full"
        />
        <div className="flex-1">
          <p className="font-semibold text-sm">{authState.currentUser?.name}</p>
          {authState.currentUser?.state && (
            <p className="text-xs text-muted-foreground">{authState.currentUser.city}, {authState.currentUser.state}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <Label className="mb-3 block font-semibold">Rating</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
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
          <p className="text-xs text-muted-foreground mt-2">
            {rating === 0 && "Select a rating"}
            {rating === 1 && "Poor - Would not recommend"}
            {rating === 2 && "Fair - Some issues"}
            {rating === 3 && "Good - Meets expectations"}
            {rating === 4 && "Very Good - Exceeded expectations"}
            {rating === 5 && "Excellent - Highly recommended"}
          </p>
        </div>

        {/* Comment */}
        <div>
          <Label htmlFor="comment" className="font-semibold mb-2 block">
            Your Review <span className="text-xs text-muted-foreground">(minimum 10 characters)</span>
          </Label>
          <Textarea
            id="comment"
            placeholder="Share details about your experience with this product. What did you like? What could be improved?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            className="resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-2">{comment.length}/500 characters</p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
          className="w-full btn-profit gap-2"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "Posting..." : "Post Review"}
        </Button>
      </form>
    </Card>
  );
}
