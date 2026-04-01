import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNaira } from "@/data/mock";
import { MapPin, CreditCard, CheckCircle, ChevronRight, Plus, Truck, Banknote, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAddresses } from "@/hooks/useAddresses";
import { useCartItems, useClearCart } from "@/hooks/useCart";
import { useCreateOrder } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";
import type { PaymentMethod } from "@/lib/supabase.types";

const steps = ["Address", "Payment", "Review"];

export default function Checkout() {
  const navigate = useNavigate();
  const { state } = useAuth();
  const user = state.currentUser;
  const { toast } = useToast();

  const { data: addresses = [], isLoading: addressesLoading } = useAddresses(user?.id);
  const { data: cartItems = [], isLoading: cartLoading } = useCartItems(user?.id);
  const createOrder = useCreateOrder();
  const clearCart = useClearCart();

  const [step, setStep] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [placing, setPlacing] = useState(false);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? addresses[0];

  const subtotal = cartItems.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0);
  const delivery = 2500;
  const total = subtotal + delivery;

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress) return;
    setPlacing(true);

    const { order, error } = await createOrder.mutateAsync({
      buyerId: user.id,
      items: cartItems.map((ci) => ({
        productId: ci.product_id,
        name: ci.product?.name ?? "",
        price: ci.product?.price ?? 0,
        quantity: ci.quantity,
        image: ci.product?.images[0] ?? null,
        storeName: ci.product?.store?.store_name ?? "",
      })),
      subtotal,
      deliveryFee: delivery,
      paymentMethod,
      deliveryAddress: {
        label: selectedAddress.label,
        full_address: selectedAddress.full_address,
        city: selectedAddress.city,
        state: selectedAddress.state,
        phone: selectedAddress.phone,
      },
      buyerInfo: { name: user.name, email: user.email, phone: user.phone },
    });

    setPlacing(false);

    if (error) {
      toast({ title: "Order failed", description: error, variant: "destructive" });
      return;
    }

    // Clear cart after successful order
    if (user.id) await clearCart.mutateAsync(user.id);

    // Store receipt data and navigate
    localStorage.setItem("paymentDetails", JSON.stringify({
      orderId: order?.id,
      orderNumber: order?.order_number,
      items: cartItems.map((ci) => ({
        productId: ci.product_id,
        name: ci.product?.name ?? "",
        price: ci.product?.price ?? 0,
        quantity: ci.quantity,
        image: ci.product?.images[0] ?? "",
        storeName: ci.product?.store?.store_name ?? "",
      })),
      address: selectedAddress,
      paymentMethod,
      subtotal,
      delivery,
      total,
      buyer: { name: user.name, email: user.email, phone: user.phone, userType: user.userType },
    }));

    navigate("/receipt");
  };

  if (cartLoading || addressesLoading) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <Header />
        <main className="container py-6 max-w-4xl space-y-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-40 w-full" />)}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container py-6 max-w-4xl">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  i === step ? "bg-primary text-primary-foreground" :
                  i < step ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <CheckCircle className="h-4 w-4" /> : <span className="h-5 w-5 flex items-center justify-center rounded-full border text-xs">{i + 1}</span>}
                {s}
              </button>
              {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Delivery Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {addresses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No addresses saved. <Link to="/buyer/dashboard" className="text-primary underline">Add one in your dashboard.</Link>
                    </p>
                  ) : addresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                        (selectedAddressId || addresses[0]?.id) === addr.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{addr.label}</span>
                        {addr.is_default && <Badge variant="secondary" className="text-xs">Default</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{addr.full_address}, {addr.city}, {addr.state}</p>
                      <p className="text-xs text-muted-foreground mt-1">{addr.phone}</p>
                    </button>
                  ))}
                  <Link to="/buyer/dashboard">
                    <Button variant="outline" className="w-full"><Plus className="h-4 w-4 mr-2" /> Add New Address</Button>
                  </Link>
                  <Button
                    className="w-full btn-profit mt-4"
                    onClick={() => setStep(1)}
                    disabled={addresses.length === 0}
                  >
                    Continue to Payment <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {([
                    { value: "card" as const, label: "Pay with Card", desc: "Visa, Mastercard, Verve via Flutterwave", icon: CreditCard },
                    { value: "bank" as const, label: "Bank Transfer", desc: "Pay via bank transfer", icon: Banknote },
                    { value: "cod" as const, label: "Cash on Delivery", desc: "Pay when you receive your order", icon: Truck },
                  ]).map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value)}
                      className={`w-full text-left p-4 rounded-lg border-2 flex items-center gap-4 transition-colors ${
                        paymentMethod === method.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <method.icon className="h-6 w-6 text-primary shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{method.label}</p>
                        <p className="text-xs text-muted-foreground">{method.desc}</p>
                      </div>
                    </button>
                  ))}
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                    <Button className="flex-1 btn-profit" onClick={() => setStep(2)}>Review Order <ChevronRight className="h-4 w-4 ml-1" /></Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /> Order Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Delivery to</p>
                    <p className="text-sm font-medium">{selectedAddress?.full_address}, {selectedAddress?.city}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Payment</p>
                    <p className="text-sm font-medium">
                      {paymentMethod === "card" ? "Card (Flutterwave)" : paymentMethod === "bank" ? "Bank Transfer" : "Cash on Delivery"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-sm">
                        <span className="flex-1">{item.product?.name} × {item.quantity}</span>
                        <span className="font-medium">{formatNaira((item.product?.price ?? 0) * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button className="flex-1 btn-profit" onClick={handlePlaceOrder} disabled={placing}>
                      {placing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Place Order — {formatNaira(total)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary */}
          <div className="border rounded-xl p-6 h-fit sticky top-20">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatNaira(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{formatNaira(delivery)}</span></div>
              <Separator />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-primary">{formatNaira(total)}</span></div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
