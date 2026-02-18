import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatNaira } from "@/data/mock";
import { 
  CreditCard, Banknote, Truck, MapPin, ChevronRight, Plus, 
  Edit2, CheckCircle, Phone, MapPinIcon, Building, AlertCircle 
} from "lucide-react";

interface QuickCheckoutItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  storeName: string;
}

interface QuickCheckoutData {
  items: QuickCheckoutItem[];
  isQuickCheckout: boolean;
}

const mockAddresses = [
  {
    id: "1",
    label: "Home",
    fullAddress: "123 Lekki Street",
    city: "Lagos",
    state: "Lagos",
    phone: "+234 800 000 0000",
    isDefault: true,
  },
  {
    id: "2",
    label: "Office",
    fullAddress: "456 Victoria Island Road",
    city: "Lagos",
    state: "Lagos",
    phone: "+234 800 111 1111",
    isDefault: false,
  },
];

export default function Payment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state: authState, addPurchasedProduct } = useAuth();
  const [quickCheckoutData, setQuickCheckoutData] = useState<QuickCheckoutData | null>(null);
  const [selectedAddress, setSelectedAddress] = useState(mockAddresses[0].id);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | "cod">("cod");
  const [editingAddress, setEditingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    fullAddress: "",
    city: "",
    state: "",
    phone: "",
  });

  useEffect(() => {
    // Load quick checkout data
    const data = localStorage.getItem("quickCheckoutData");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setQuickCheckoutData(parsed);
      } catch {
        navigate("/products");
      }
    } else {
      navigate("/products");
    }
  }, [navigate]);

  if (!quickCheckoutData) return null;

  const subtotal = quickCheckoutData.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = 2500;
  const total = subtotal + delivery;
  const selectedAddressData = mockAddresses.find((a) => a.id === selectedAddress);

  const handleProceedToCheckout = () => {
    if (!selectedAddressData) {
      toast({ title: "Error", description: "Please select a delivery address", variant: "destructive" });
      return;
    }

    // Mark all purchased products in user profile
    if (quickCheckoutData) {
      quickCheckoutData.items.forEach((item) => {
        addPurchasedProduct(item.productId);
      });
    }

    // Store payment details
    const paymentDetails = {
      items: quickCheckoutData?.items || [],
      address: selectedAddressData,
      paymentMethod,
      subtotal,
      delivery,
      total,
      buyer: authState.currentUser,
      timestamp: new Date().toISOString(),
      orderId: `RBM-${Date.now()}`,
    };

    localStorage.setItem("paymentDetails", JSON.stringify(paymentDetails));
    navigate("/receipt");
  };

  const handleAddAddress = () => {
    if (!newAddress.label || !newAddress.fullAddress || !newAddress.city || !newAddress.phone) {
      toast({ title: "Error", description: "Please fill in all address fields", variant: "destructive" });
      return;
    }
    // In a real app, this would save to backend
    toast({ title: "Address added", description: "New address has been saved" });
    setEditingAddress(false);
    setNewAddress({ label: "", fullAddress: "", city: "", state: "", phone: "" });
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
              <CardHeader>
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
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

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-5 w-5 text-primary" /> Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedAddress === addr.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{addr.label}</span>
                      {addr.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{addr.fullAddress}, {addr.city}, {addr.state}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {addr.phone}
                    </p>
                  </button>
                ))}

                {/* Add New Address */}
                {editingAddress ? (
                  <div className="border-2 border-primary/30 rounded-lg p-4 space-y-3 bg-primary/5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <Label className="text-xs">Address Label</Label>
                        <Input
                          placeholder="e.g., Home, Office"
                          value={newAddress.label}
                          onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Full Address</Label>
                        <Input
                          placeholder="e.g., 123 Main Street"
                          value={newAddress.fullAddress}
                          onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">City</Label>
                        <Input
                          placeholder="City"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">State</Label>
                        <Input
                          placeholder="State"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Phone Number</Label>
                        <Input
                          placeholder="+234 800 000 0000"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddAddress}
                        className="flex-1 btn-profit h-9 text-sm"
                      >
                        Save Address
                      </Button>
                      <Button
                        onClick={() => setEditingAddress(false)}
                        variant="outline"
                        className="h-9"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setEditingAddress(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add New Address
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
                  { 
                    value: "cod" as const, 
                    label: "Pay on Delivery", 
                    desc: "Pay cash when you receive your order (Recommended)",
                    icon: Truck,
                    badge: "Recommended"
                  },
                  { 
                    value: "card" as const, 
                    label: "Pay with Card", 
                    desc: "Visa, Mastercard, Verve via Flutterwave",
                    icon: CreditCard 
                  },
                  { 
                    value: "bank" as const, 
                    label: "Bank Transfer", 
                    desc: "Transfer from your bank account",
                    icon: Banknote 
                  },
                ]).map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`w-full text-left p-4 rounded-lg border-2 flex items-center gap-4 transition-colors ${
                      paymentMethod === method.value 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <method.icon className="h-6 w-6 text-primary shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{method.label}</p>
                          {method.badge && (
                            <Badge className="bg-primary/20 text-primary text-xs border-0">
                              {method.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{method.desc}</p>
                      </div>
                    </div>
                    {paymentMethod === method.value && (
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    )}
                  </button>
                ))}

                {paymentMethod === "cod" && (
                  <div className="flex gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30 text-sm">
                    <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-primary mb-1">Pay on Delivery</p>
                      <p className="text-xs text-muted-foreground">
                        You'll pay the full amount (₦{formatNaira(total)}) to the delivery agent when your order arrives.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 h-fit">
              <CardHeader>
                <CardTitle className="text-base">Order Total</CardTitle>
              </CardHeader>
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
                  onClick={handleProceedToCheckout}
                  className="w-full btn-profit h-12 text-base font-semibold"
                >
                  {paymentMethod === "cod" ? "Place Order" : "Proceed to Payment"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>

                <div className="flex gap-2 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>🔒 Secure & Safe</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
