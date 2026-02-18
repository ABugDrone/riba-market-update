import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Send } from "lucide-react";

export interface AnonymousStoreReviewData {
  id: string;
  storeName: string;
  author: string;
  email: string;
  whatsapp: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  isAnonymous: true;
  helpful: number;
}

interface AnonymousStoreReviewFormProps {
  storeName: string;
  onReviewSubmit?: (review: AnonymousStoreReviewData) => void;
  onClose?: () => void;
}

export function AnonymousStoreReviewForm({ storeName, onReviewSubmit, onClose }: AnonymousStoreReviewFormProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!fullName.trim()) {
      toast({ title: "Error", description: "Please provide your full name", variant: "destructive" });
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast({ title: "Error", description: "Please provide a valid email address", variant: "destructive" });
      return;
    }

    if (!whatsapp.trim()) {
      toast({ title: "Error", description: "Please provide your WhatsApp number", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a random colored avatar for anonymous review
      const colors = ["FF6B6B", "4ECDC4", "45B7D1", "FFA07A", "98D8C8", "F7DC6F", "BB8FCE", "85C1E2"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newReview: AnonymousStoreReviewData = {
        id: `sr-anon-${Date.now()}`,
        storeName,
        author: fullName,
        email,
        whatsapp,
        avatar: `https://ui-avatars.com/api/?name=Anonymous&background=${randomColor}&color=fff`,
        rating,
        date: new Date().toISOString().split("T")[0],
        comment: comment.trim(),
        isAnonymous: true,
        helpful: 0,
      };

      // Get existing reviews from localStorage
      const existingReviews = localStorage.getItem(`riba_store_reviews_${storeName}`);
      const reviews = existingReviews ? JSON.parse(existingReviews) : [];

      // Add new review
      reviews.unshift(newReview);

      // Save to localStorage
      localStorage.setItem(`riba_store_reviews_${storeName}`, JSON.stringify(reviews));

      if (onReviewSubmit) {
        onReviewSubmit(newReview);
      }

      toast({ title: "Success", description: "Your anonymous review has been posted!" });
      setRating(0);
      setComment("");
      setFullName("");
      setEmail("");
      setWhatsapp("");
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit review", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 border-2 border-primary/20 max-h-[90vh] md:max-h-auto overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>Share Your Anonymous Review</span>
        <Badge className="bg-amber-100 text-amber-800 border-0">Anonymous Review</Badge>
      </h3>

      <p className="text-sm text-muted-foreground mb-6 p-4 rounded-lg bg-muted/50">
        💡 Leave your review anonymously. Your review will help other customers, but your personal details will remain private.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Your Information */}
        <div className="space-y-4 p-4 rounded-lg bg-muted/30 border">
          <h4 className="font-semibold text-sm">Your Information (Private - Not Displayed)</h4>
          
          <div>
            <Label htmlFor="fullName" className="font-semibold mb-2 block">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-9"
            />
          </div>

          <div>
            <Label htmlFor="email" className="font-semibold mb-2 block">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9"
            />
          </div>

          <div>
            <Label htmlFor="whatsapp" className="font-semibold mb-2 block">
              WhatsApp Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="whatsapp"
              placeholder="+234 812 345 6789"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <Label className="font-semibold">Rating <span className="text-destructive">*</span></Label>
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
          {rating > 0 && (
            <p className="text-xs text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <Label htmlFor="comment" className="font-semibold">
            Your Review <span className="text-destructive">*</span>
          </Label>
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
          type="submit"
          disabled={isSubmitting || rating === 0 || comment.trim().length < 10 || !fullName.trim() || !email.includes("@") || !whatsapp.trim()}
          className="w-full gap-2"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "Posting..." : "Post Anonymous Review"}
        </Button>
      </form>
    </Card>
  );
}
