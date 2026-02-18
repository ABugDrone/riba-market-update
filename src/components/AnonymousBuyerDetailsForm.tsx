import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle } from "lucide-react";

export interface AnonymousBuyerDetails {
  fullName: string;
  phone: string;
  deliveryAddress: string;
  paymentTermsAccepted: "yes" | "no" | "maybe";
}

interface AnonymousBuyerDetailsFormProps {
  onSubmit?: (details: AnonymousBuyerDetails) => void;
  onCancel?: () => void;
}

export function AnonymousBuyerDetailsForm({ onSubmit, onCancel }: AnonymousBuyerDetailsFormProps) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentTerms, setPaymentTerms] = useState<"yes" | "no" | "maybe" | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast({ title: "Error", description: "Please provide your full name", variant: "destructive" });
      return;
    }

    if (!phone.trim()) {
      toast({ title: "Error", description: "Please provide your phone number", variant: "destructive" });
      return;
    }

    if (!deliveryAddress.trim()) {
      toast({ title: "Error", description: "Please provide your delivery address", variant: "destructive" });
      return;
    }

    if (!paymentTerms) {
      toast({ title: "Error", description: "Please indicate your payment commitment", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        onSubmit({
          fullName,
          phone,
          deliveryAddress,
          paymentTermsAccepted: paymentTerms as "yes" | "no" | "maybe",
        });
      }
      toast({ title: "Success", description: "Your details have been saved" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save details", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 border-2 border-amber-300/50 bg-amber-50/50 dark:bg-amber-950/20 max-h-[90vh] md:max-h-auto overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-950 dark:text-amber-100 mb-1">
              Complete Your Delivery Information
            </h3>
            <p className="text-sm text-amber-900/70 dark:text-amber-100/70">
              Please provide the following details for your delivery. We'll use this information to ensure your order is delivered successfully.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <Label htmlFor="fullName" className="font-semibold mb-2 block">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-10"
          />
          <p className="text-xs text-muted-foreground mt-1">This will be used for delivery purposes</p>
        </div>

        {/* Phone Number */}
        <div>
          <Label htmlFor="phone" className="font-semibold mb-2 block">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            placeholder="+234 (e.g., +2348012345678)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-10"
          />
          <p className="text-xs text-muted-foreground mt-1">We'll use this to contact you about your delivery</p>
        </div>

        {/* Delivery Address */}
        <div>
          <Label htmlFor="deliveryAddress" className="font-semibold mb-2 block">
            Delivery Address <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="deliveryAddress"
            placeholder="Enter your complete delivery address (street address, city, state, postal code)"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">Be as detailed as possible to ensure accurate delivery</p>
        </div>

        {/* Payment Terms for Cash on Delivery */}
        <div className="p-4 rounded-lg bg-white dark:bg-slate-950 border border-border">
          <div className="space-y-3">
            <div>
              <Label className="font-semibold text-sm block mb-3">
                Payment Terms Agreement <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mb-4 p-3 rounded-lg bg-muted/50 border">
                ⚠️ <strong>Legal Notice:</strong> If you fail to pay for this product upon delivery, you will be responsible for paying the full delivery fee to the delivery agent. By selecting "Yes" or "Maybe", you confirm your commitment to pay upon delivery.
              </p>
            </div>

            <RadioGroup value={paymentTerms} onValueChange={(value) => setPaymentTerms(value as "yes" | "no" | "maybe")}>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="flex-1 cursor-pointer mb-0">
                  <span className="font-semibold text-sm">Yes</span>
                  <p className="text-xs text-muted-foreground">I confirm I will pay upon delivery</p>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                <RadioGroupItem value="maybe" id="maybe" />
                <Label htmlFor="maybe" className="flex-1 cursor-pointer mb-0">
                  <span className="font-semibold text-sm">Maybe</span>
                  <p className="text-xs text-muted-foreground">I'm not completely sure yet</p>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5 cursor-pointer transition-colors">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="flex-1 cursor-pointer mb-0">
                  <span className="font-semibold text-sm text-destructive">No</span>
                  <p className="text-xs text-muted-foreground">I cannot commit to payment</p>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Submission Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || !fullName.trim() || !phone.trim() || !deliveryAddress.trim() || !paymentTerms}
            className="flex-1 btn-profit"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
