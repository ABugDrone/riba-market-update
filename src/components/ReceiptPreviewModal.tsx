import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatNaira } from "@/data/mock";
import { Download, Printer, MapPin, CreditCard, User, Store, CheckCircle, Clock, Phone, Mail } from "lucide-react";

interface ReceiptItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  storeName: string;
}

interface ReceiptAddress {
  label: string;
  fullAddress: string;
  city: string;
  state: string;
  phone: string;
}

interface ReceiptBuyer {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  userType?: string;
  address?: string;
  city?: string;
  state?: string;
  bio?: string;
}

export interface ReceiptPreviewData {
  items: ReceiptItem[];
  address: ReceiptAddress;
  paymentMethod: "card" | "bank" | "cod";
  subtotal: number;
  delivery: number;
  total: number;
  buyer: ReceiptBuyer;
  timestamp: string;
  orderId: string;
}

interface ReceiptPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptData: ReceiptPreviewData | null;
}

export function ReceiptPreviewModal({ open, onOpenChange, receiptData }: ReceiptPreviewModalProps) {
  const { toast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!receiptData) return null;

  const paymentMethodLabel = {
    cod: "Cash on Delivery",
    card: "Card Payment",
    bank: "Bank Transfer",
  }[receiptData.paymentMethod];

  const paymentMethodIcon = {
    cod: "🚚",
    card: "💳",
    bank: "🏦",
  }[receiptData.paymentMethod];

  const orderDate = new Date(receiptData.timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrintToPDF = () => {
    if (!receiptRef.current) return;

    const printContent = receiptRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;

    toast({ title: "Success", description: "Receipt downloaded as PDF" });
  };

  const handleDownloadReceipt = () => {
    handlePrintToPDF();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>Receipt Preview</DialogTitle>
        </DialogHeader>

        <div ref={receiptRef} className="space-y-4">
          {/* Success Banner */}
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2">Order Confirmed!</h2>
              <p className="text-muted-foreground mb-3 text-sm">Order ID: <span className="font-mono font-bold text-primary">{receiptData.orderId}</span></p>
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Order Details</span>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {orderDate}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Items Ordered</h3>
                {receiptData.items.map((item) => (
                  <div key={item.productId} className="flex gap-3 pb-3 border-b last:border-0">
                    <img src={item.image} alt={item.name} className="h-10 w-10 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.storeName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{item.quantity}x</p>
                      <p className="font-semibold text-sm">{formatNaira(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatNaira(receiptData.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">{formatNaira(receiptData.delivery)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total Amount</span>
                  <span className="text-primary">{formatNaira(receiptData.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                  <p className="font-semibold">{receiptData.address.label}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Address</p>
                  <p>{receiptData.address.fullAddress}, {receiptData.address.city}, {receiptData.address.state}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span>{receiptData.address.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-muted/50 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{paymentMethodIcon}</span>
                    <div>
                      <p className="text-xs text-muted-foreground">Payment Method</p>
                      <p className="font-semibold">{paymentMethodLabel}</p>
                    </div>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-0 text-xs">
                    {receiptData.paymentMethod === "cod" ? "Pending" : "Processing"}
                  </Badge>
                </div>

                {receiptData.paymentMethod === "cod" && (
                  <div className="flex gap-2 p-2 rounded text-xs bg-primary/5 border border-primary/30">
                    <span>ℹ️</span>
                    <p>
                      You will pay <span className="font-bold text-primary">{formatNaira(receiptData.total)}</span> upon delivery.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                  <p className="font-semibold">{receiptData.buyer?.name || "N/A"}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                  <p className="font-semibold break-words text-xs">{receiptData.buyer?.email || "N/A"}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
                  <p className="font-semibold">{receiptData.buyer?.phone || "N/A"}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Account Type</p>
                  <Badge variant="secondary" className="text-xs w-fit capitalize">{receiptData.buyer?.userType || "N/A"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sellers Info */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                Sellers in This Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from(new Set(receiptData.items.map(item => item.storeName))).map((storeName) => (
                <div key={storeName} className="p-3 rounded-lg bg-background border border-primary/20 text-sm">
                  <p className="font-semibold">{storeName}</p>
                  <p className="text-xs text-muted-foreground">Order ID: {receiptData.orderId}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleDownloadReceipt}
            className="flex-1 btn-profit gap-2 text-sm"
          >
            <Download className="h-4 w-4" />
            Download (PDF)
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="flex-1 gap-2 text-sm"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="text-sm"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
