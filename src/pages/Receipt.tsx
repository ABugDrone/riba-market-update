import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatNaira } from "@/data/mock";
import { AnonymousBuyerDetailsForm, AnonymousBuyerDetails } from "@/components/AnonymousBuyerDetailsForm";
import {
  CheckCircle, Download, Printer, Home, Phone, Mail, MapPin, 
  Clock, CreditCard, User, Store, ChevronRight, ArrowLeft, Eye, EyeOff
} from "lucide-react";

interface PaymentDetailsData {
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    storeName: string;
  }>;
  address: {
    label: string;
    full_address: string;
    city: string;
    state: string;
    phone: string;
  };
  paymentMethod: "online" | "cash_on_delivery";
  subtotal: number;
  delivery: number;
  total: number;
  buyer: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    userType?: string;
  };
  timestamp: string;
  orderId: string;
  orderNumber?: string;
}

export default function Receipt() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state: authState, followSeller } = useAuth();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsData | null>(null);
  const [anonymousBuyerDetails, setAnonymousBuyerDetails] = useState<AnonymousBuyerDetails | null>(null);
  const [showAnonymousForm, setShowAnonymousForm] = useState(false);
  const [showTotalSpend, setShowTotalSpend] = useState(false);
  const [followedStores, setFollowedStores] = useState<Set<string>>(new Set());
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = localStorage.getItem("paymentDetails");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setPaymentDetails(parsed);
        
        // Check if buyer is anonymous (has N/A values)
        const isAnonymous = !parsed.buyer?.name || parsed.buyer.name === "N/A" || !authState.isAuthenticated;
        if (isAnonymous) {
          setShowAnonymousForm(true);
        }
        
       // Clear quickCheckout data
        localStorage.removeItem("quickCheckoutData");
      } catch {
        navigate("/products");
      }
    } else {
      navigate("/products");
    }
  }, [navigate, authState.isAuthenticated]);

  if (!paymentDetails) return null;

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
    // Browser print-to-PDF
    handlePrintToPDF();
  };

  const paymentMethodLabel = {
    cash_on_delivery: "Cash on Delivery",
    online: "Online Payment",
  }[paymentDetails.paymentMethod] ?? paymentDetails.paymentMethod;

  const paymentMethodIcon = {
    cash_on_delivery: "🚚",
    online: "💳",
  }[paymentDetails.paymentMethod] ?? "💳";

  const orderDate = new Date(paymentDetails.timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isSellerView = authState.currentUser?.userType === "seller" || authState.currentUser?.userType === "both";
  const isBuyerView = authState.currentUser?.userType === "buyer" || authState.currentUser?.userType === "both";

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container py-6 max-w-3xl">
        {/* Anonymous Buyer Details Form */}
        {showAnonymousForm && !anonymousBuyerDetails && (
          <div className="mb-8">
            <AnonymousBuyerDetailsForm
              onSubmit={(details) => {
                setAnonymousBuyerDetails(details);
                setShowAnonymousForm(false);
                // Save to localStorage with payment details for future reference
                if (paymentDetails) {
                  const updatedDetails = {
                    ...paymentDetails,
                    anonymousBuyerDetails: details,
                  };
                  localStorage.setItem("paymentDetails", JSON.stringify(updatedDetails));
                }
                toast({ title: "Success", description: "Your delivery information has been saved" });
              }}
            />
          </div>
        )}

        <div className="mb-6">
          <Button
            onClick={() => navigate("/products")}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
        </div>

        {/* Receipt Content - Printable */}
        <div ref={receiptRef} className="space-y-6">
          {/* Success Banner */}
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
              <p className="text-muted-foreground mb-4">Thank you for your purchase</p>
              <div className="flex items-center justify-center gap-2 text-sm font-mono">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-bold text-primary">{paymentDetails.orderId}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Order Details</span>
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {orderDate}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Items Ordered</h3>
                {paymentDetails.items.map((item) => (
                  <div key={item.productId} className="flex gap-4 pb-3 border-b last:border-0">
                    <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
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
                  <span>{showTotalSpend ? formatNaira(paymentDetails.subtotal) : "••••••"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>{showTotalSpend ? formatNaira(paymentDetails.delivery) : "••••••"}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total Amount</span>
                  <span className="text-primary">{showTotalSpend ? formatNaira(paymentDetails.total) : "••••••"}</span>
                </div>
                <button 
                  onClick={() => setShowTotalSpend(!showTotalSpend)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors"
                >
                  {showTotalSpend ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {showTotalSpend ? "Hide" : "Show"} Amount
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Delivery Location</p>
                  <p className="font-semibold text-sm">{paymentDetails.address.label}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Address</p>
                  <p className="text-sm">
                    {paymentDetails.address.full_address}, {paymentDetails.address.city}, {paymentDetails.address.state}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{paymentDetails.address.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{paymentMethodIcon}</span>
                    <div>
                      <p className="text-xs text-muted-foreground">Payment Method</p>
                      <p className="font-semibold text-sm">{paymentMethodLabel}</p>
                    </div>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-0">
                    {paymentDetails.paymentMethod === "cash_on_delivery" ? "Pending" : "Processing"}
                  </Badge>
                </div>

                {paymentDetails.paymentMethod === "cash_on_delivery" && (
                  <div className="flex gap-2 p-3 rounded-lg bg-primary/5 border border-primary/30 text-xs">
                    <span className="text-lg">ℹ️</span>
                    <p>
                      You will pay <span className="font-bold text-primary">{formatNaira(paymentDetails.total)}</span> to the delivery agent upon receiving your order.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {anonymousBuyerDetails ? (
                  <>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                      <p className="text-xs text-muted-foreground">Full Name</p>
                      <p className="font-semibold text-sm">{anonymousBuyerDetails.fullName}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                      <p className="text-xs text-muted-foreground">Phone Number</p>
                      <p className="font-semibold text-sm">{anonymousBuyerDetails.phone}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-1 sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Delivery Address</p>
                      <p className="text-sm">{anonymousBuyerDetails.deliveryAddress}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-1 sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Payment Terms Agreement</p>
                      <Badge variant={anonymousBuyerDetails.paymentTermsAccepted === "yes" ? "default" : anonymousBuyerDetails.paymentTermsAccepted === "no" ? "destructive" : "secondary"} className="w-fit capitalize">
                        {anonymousBuyerDetails.paymentTermsAccepted === "yes" && "✓ Confirmed"}
                        {anonymousBuyerDetails.paymentTermsAccepted === "no" && "✗ Not Confirmed"}
                        {anonymousBuyerDetails.paymentTermsAccepted === "maybe" && "? Maybe"}
                      </Badge>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 space-y-1 sm:col-span-2 border border-amber-200 dark:border-amber-800">
                      <p className="text-xs text-amber-900 dark:text-amber-100 mb-2">🔒 Your personal information is kept private</p>
                      <p className="text-xs text-amber-800 dark:text-amber-200">Your email and phone are only used for delivery coordination and are not displayed publicly.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                      <p className="text-xs text-muted-foreground">Full Name</p>
                      <p className="font-semibold text-sm">{paymentDetails.buyer?.name || "N/A"}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                      <p className="text-xs text-muted-foreground">Email Address</p>
                      <p className="font-semibold text-sm text-sm break-words">{paymentDetails.buyer?.email || "N/A"}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                      <p className="text-xs text-muted-foreground">Phone Number</p>
                      <p className="font-semibold text-sm">{paymentDetails.buyer?.phone || "N/A"}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                      <p className="text-xs text-muted-foreground">Account Type</p>
                      <Badge variant="secondary" className="w-fit capitalize">{paymentDetails.buyer?.userType || "N/A"}</Badge>
                    </div>
                    {paymentDetails.buyer?.address && (
                      <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                        <p className="text-xs text-muted-foreground">City</p>
                        <p className="font-semibold text-sm">{paymentDetails.buyer?.city || "N/A"}</p>
                      </div>
                    )}
                    {paymentDetails.buyer?.state && (
                      <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                        <p className="text-xs text-muted-foreground">State</p>
                        <p className="font-semibold text-sm">{paymentDetails.buyer?.state || "N/A"}</p>
                      </div>
                    )}
                    {paymentDetails.buyer?.bio && (
                      <div className="p-4 rounded-lg bg-muted/50 space-y-1 sm:col-span-2">
                        <p className="text-xs text-muted-foreground">Bio</p>
                        <p className="text-sm">{paymentDetails.buyer?.bio || "N/A"}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sellers Info */}
          {isSellerView && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  Seller Information (View Only)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentDetails.items.map((item) => (
                  <div key={item.productId} className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <p className="font-semibold text-sm">{item.storeName}</p>
                    <p className="text-sm text-muted-foreground">{item.name}</p>
                    <div className="flex justify-between text-sm">
                      <span>Quantity: {item.quantity}</span>
                      <span className="font-semibold">Revenue: {formatNaira(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Follow Sellers Section - For Buyers */}
          {isBuyerView && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  Sellers in This Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Follow these sellers to get updates on new products and exclusive deals!</p>
                {Array.from(new Set(paymentDetails.items.map(item => item.storeName))).map((storeName) => (
                  <div key={storeName} className="p-4 rounded-lg bg-background border border-primary/20 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{storeName}</p>
                      <p className="text-xs text-muted-foreground">From order #{paymentDetails.orderId}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant={followedStores.has(storeName) ? "default" : "outline"}
                      className={followedStores.has(storeName) ? "" : "btn-profit"}
                      onClick={() => {
                        if (!authState.isAuthenticated) {
                          toast({ title: "Error", description: "Please log in to follow stores", variant: "destructive" });
                          return;
                        }
                        
                        const storeId = `seller-${storeName}`;
                        if (followedStores.has(storeName)) {
                          setFollowedStores(prev => {
                            const updated = new Set(prev);
                            updated.delete(storeName);
                            return updated;
                          });
                        } else {
                          followSeller(storeId);
                          setFollowedStores(prev => new Set(prev).add(storeName));
                          toast({ title: "Success", description: `Now following ${storeName}` });
                        }
                      }}
                    >
                      {followedStores.has(storeName) ? "✓ Following" : "Follow Store"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons - Not Printable */}
        <div className={`mt-6 space-y-3 gap-3 flex flex-col sm:flex-row`}>
          <Button
            onClick={handleDownloadReceipt}
            className="flex-1 btn-profit gap-2"
          >
            <Download className="h-4 w-4" />
            Download Receipt (PDF)
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="flex-1 gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
          <Button
            onClick={() => navigate("/products")}
            variant="outline"
            className="flex-1 gap-2"
          >
            Continue Shopping
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Next Steps */}
        <Card className="mt-6 border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <p className="font-medium text-sm">
                  {paymentDetails.paymentMethod === "cash_on_delivery" ? "Wait for Delivery" : "Complete Payment"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {paymentDetails.paymentMethod === "cash_on_delivery" 
                    ? "Your order will be delivered within 2-5 business days." 
                    : "Follow the payment instructions to complete your transaction."}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <p className="font-medium text-sm">Track Your Order</p>
                <p className="text-xs text-muted-foreground">Check the status of your order in your buyer dashboard anytime.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <p className="font-medium text-sm">Confirm Receipt</p>
                <p className="text-xs text-muted-foreground">Mark as received after you get your items.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
