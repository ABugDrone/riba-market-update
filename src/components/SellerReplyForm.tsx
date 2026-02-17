import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Send } from "lucide-react";

export interface SellerReply {
  id: string;
  sellerId: string;
  sellerName: string;
  message: string;
  date: string;
}

interface SellerReplyFormProps {
  reviewId: string;
  onReplySubmit?: (reply: SellerReply) => void;
  hasReply?: boolean;
}

export function SellerReplyForm({ reviewId, onReplySubmit, hasReply = false }: SellerReplyFormProps) {
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only show for sellers
  if (!authState.isAuthenticated || (authState.currentUser?.userType !== "seller" && authState.currentUser?.userType !== "both")) {
    return null;
  }

  if (hasReply) {
    return null; // Don't show form if already replied
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim().length < 5) {
      toast({ title: "Error", description: "Reply must be at least 5 characters long", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const newReply = {
        id: `sr-${Date.now()}`,
        sellerId: authState.currentUser?.id || "",
        sellerName: authState.currentUser?.businessName || authState.currentUser?.name || "Seller",
        message,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).split("/").reverse().join("-"),
      };

      if (onReplySubmit) {
        onReplySubmit(newReply);
      }

      toast({ title: "Success", description: "Your reply has been posted!" });
      setMessage("");
      setShowForm(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit reply", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowForm(true)}
        className="mt-3 border-primary text-primary hover:bg-primary/10"
      >
        Reply to Review
      </Button>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
      <div className="flex items-start gap-2 bg-primary/10 p-2 rounded text-xs">
        <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-primary">
          Share appreciation, address concerns, or highlight upcoming promos. Keep it professional and helpful.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="Thank the customer, address any concerns, or share promo details..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="resize-none text-sm"
          maxLength={300}
        />
        <p className="text-xs text-muted-foreground">{message.length}/300 characters</p>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isSubmitting || message.trim().length < 5}
            className="btn-profit gap-2 text-sm h-9"
          >
            <Send className="h-3 w-3" />
            Post Reply
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm(false)}
            className="text-sm h-9"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
