import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatNaira } from "@/data/mock";
import { useAddresses, useCreateAddress } from "@/hooks/useAddresses";
import { createOrder } from "@/lib/orderService";
import {
  CreditCard, Banknote, Truck, MapPin, ChevronRight, Plus,
  CheckCircle, Phone, AlertCircle, LogIn, Loader2,
} from "lucide-react";
import type { PaymentMethod } from "@/lib/supabase.types";

interface QuickCheckoutItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  storeName: string;
}

export default function Payment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state: authState, addPurchasedProduct } = useAuth();
  const user = authState.currentUser;

  const [quickCheckoutData, setQuickCheckoutData] = useState<{ items: QuickCheckoutItem[] } | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash_on_delivery");
  const [showAddForm, setShowAddForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", full_address: "", city: "", state: "", phone: "" });

  // Fetch saved addresses from Supabase
  const { data: addresses = [], isLoading: addressesLoading } = useAddresses(user?.id);
  const createAddressMutation = useCreateAddress();

  // Auto-select default address when addresses load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.is_default) ?? addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  // Load quick checkout data from localStorage
  useEffect(() => {
    const data = localStorage.getItem("quickCheckoutData");
    if (data) {
      try { setQuickCheckoutData(JSON.parse(data)); }
      catch { navigate("/products"); }
    } else {
      navigate("/products");
    }
  }, [navigate]);

  if (!quickCheckoutData) return null;

  const subtotal = quickCheckoutData.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = 2500;
  const total = subtotal + delivery;
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const handleSaveAddress = async () => {
    if (!user?.id || !newAddress.label || !newAddress.full_address || !newAddress.city || !newAddress.phone) {
      toast({ title: "Please fill in all address fields", variant: "destructive" });
      return;
    }
    const { address, error } = await createAddressMutation.mutateAsync({
      profile_id: user.id,
      ...newAddress,
      is_default: addresses.length === 0,
    });
    if (error) {
      toast({ title: "Failed to save address", description: error, variant: "destructive" });
      return;
    }
    if (address) setSelectedAddressId(address.id);
    setShowAddForm(false);
    setNewAddress({ label: "", full_address: "", city: "", state: "", phone: "" });
    toast({ title: "Address saved" });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast({ title: "Please select a delivery address", variant: "destructive" });
      return;
    }
    if (!user?.id) {
      toast({ title: "Please sign in to place an order", variant: "destructive" });
      return;
    }

    setPlacing(true);
    try {
      const { order, error } = await createOrder({
        profileId: user.id,
        deliveryAddressId: selectedAddress.id,
        items: quickCheckoutData.items.map((i) => ({
          productId: i.productId,
          unitPrice: i.price,
          quantity: i.quantity,
        })),
        subtotal,
        deliveryFee: delivery,
        paymentMethod,
      });

      if (error || !order) {
        toast({ title: "Order failed", description: error ?? "Unknown error", variant: "destructive" });
        return;
      }

      // Mark products as purchased
      quickCheckoutData.items.forEach((i) => addPurchasedProduct(i.productId));

      // Store receipt data
      localStorage.setItem("paymentDetails", JSON.stringify({
        orderId: order.id,
        orderNumber: order.order_number,
        items: quickCheckoutData.items,
        address: selectedAddress,
        paymentMethod,
        subtotal,
        delivery,
        total,
        buyer: { name: user.name, email: user.email, phone: user.phone, userType: user.userType },
        timestamp: new Date().toISOString(),
      }));

      localStorage.removeItem("quickCheckoutData");
      navigate("/receipt");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container py-6 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Order Summary */}
            <Card>
              <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {quickCheckoutData.items.map((item) => (
                  <div key={item.productId} className="flex gap-4 pb-4 border-b last:border-0">
                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.storeName}</p>
                      <p className="text-sm font-semibold text-primary mt-1">
                        {item.quantity} × {formatNaira(item.price)} = {formatNaira(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-5 w-5 text-primary" /> Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">

                {/* Not logged in */}
                {!user && (
                  <div className="flex flex-col items-center gap-3 py-6 text-center border-2 border-dashed border-border rounded-lg">
                    <LogIn className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Sign in to use your saved addresses</p>
                      <p className="text-xs text-muted-foreground mt-1">Or continue as a guest below</p>
                    </div>
                    <Link to="/login">
                      <Button className="btn-profit">Sign In</Button>
                    </Link>
                  </div>
                )}

                {/* Loading addresses */}
                {user && addressesLoading && (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                )}

                {/* Saved addresses */}
                {user && !addressesLoading && addresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedAddressId === addr.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{addr.label}</span>
                      {addr.is_default && <Badge variant="secondary" className="text-xs">Default</Badge>}
                      {selectedAddressId === addr.id && (
                        <CheckCircle className="h-4 w-4 text-primary ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{addr.full_address}, {addr.city}, {addr.state}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {addr.phone}
                    </p>
                  </button>
                ))}

                {/* No addresses yet */}
                {user && !addressesLoading && addresses.length === 0 && !showAddForm && (
                  <p className="text-sm text-muted-foreground text-center py-3">
                    No saved addresses. Add one below.
                  </p>
                )}

                {/* Add address form */}
                {showAddForm ? (
                  <div className="border-2 border-primary/30 rounded-lg p-4 space-y-3 bg-primary/5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Address Label</Label>
                        <Input placeholder="e.g., Home, Office" value={newAddress.label}
                          onChange={(e) => setNewAddress((p) => ({ ...p, label: e.target.value }))} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Full Address</Label>
                        <Input placeholder="e.g., 123 Main Street" value={newAddress.full_address}
                          onChange={(e) => setNewAddress((p) => ({ ...p, full_address: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">City</Label>
                        <Input placeholder="City" value={newAddress.city}
                          onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">State</Label>
                        <Input placeholder="State" value={newAddress.state}
                          onChange={(e) => setNewAddress((p) => ({ ...p, state: e.target.value }))} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Phone Number</Label>
                        <Input placeholder="+234 800 000 0000" value={newAddress.phone}
                          onChange={(e) => setNewAddress((p) => ({ ...p, phone: e.target.value }))} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveAddress}
                        className="flex-1 btn-profit h-9 text-sm"
                        disabled={createAddressMutation.isPending}
                      >
                        {createAddressMutation.isPending
                          ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Saving…</>
                          : "Save Address"
                        }
                      </Button>
                      <Button variant="outline" className="h-9" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {addresses.length > 0 ? "Add Another Address" : "Add New Address"}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-5 w-5 text-primary" /> Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {([
                  { value: "cash_on_delivery" as const, label: "Pay on Delivery", desc: "Pay cash when your order arrives", icon: Truck, badge: "Recommended" },
                  { value: "online" as const, label: "Pay with Card / Bank", desc: "Visa, Mastercard, Verve via Flutterwave", icon: CreditCard },
                ]).map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`w-full text-left p-4 rounded-lg border-2 flex items-center gap-4 transition-colors ${
                      paymentMethod === method.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <method.icon className="h-6 w-6 text-primary shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{method.label}</p>
                        {method.badge && (
                          <Badge className="bg-primary/20 text-primary text-xs border-0">{method.badge}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{method.desc}</p>
                    </div>
                    {paymentMethod === method.value && <CheckCircle className="h-5 w-5 text-primary shrink-0" />}
                  </button>
                ))}

                {paymentMethod === "cash_on_delivery" && (
                  <div className="flex gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30 text-sm">
                    <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      You'll pay <span className="font-semibold text-foreground">{formatNaira(total)}</span> to the delivery agent when your order arrives.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Total */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader><CardTitle className="text-base">Order Total</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatNaira(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium">{formatNaira(delivery)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-primary">{formatNaira(total)}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  className="w-full btn-profit h-12 text-base font-semibold"
                  disabled={placing || !selectedAddress || !user}
                >
                  {placing
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Placing Order…</>
                    : <>{paymentMethod === "cash_on_delivery" ? "Place Order" : "Proceed to Payment"} <ChevronRight className="h-4 w-4 ml-1" /></>
                  }
                </Button>

                {!user && (
                  <p className="text-xs text-center text-muted-foreground">
                    <Link to="/login" className="text-primary underline">Sign in</Link> to place your order
                  </p>
                )}

                <p className="text-xs text-center text-muted-foreground">🔒 Secure & Safe</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
