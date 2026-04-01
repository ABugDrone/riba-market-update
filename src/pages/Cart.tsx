import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { formatNaira } from "@/data/mock";
import { useAuth } from "@/contexts/AuthContext";
import { useCartItems, useUpdateCartQuantity, useRemoveFromCart } from "@/hooks/useCart";
import { useState } from "react";

export default function Cart() {
  const { state } = useAuth();
  const user = state.currentUser;
  const { data: cartItems = [], isLoading } = useCartItems(user?.id);
  const updateQty = useUpdateCartQuantity();
  const removeItem = useRemoveFromCart();
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  const subtotal = cartItems.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0);
  const discount = discountApplied ? Math.round(subtotal * 0.1) : 0;
  const delivery = 2500;
  const total = subtotal - discount + delivery;

  // Group by store
  const grouped = cartItems.reduce((acc, item) => {
    const store = item.product?.store?.store_name ?? "Unknown Store";
    if (!acc[store]) acc[store] = [];
    acc[store].push(item);
    return acc;
  }, {} as Record<string, typeof cartItems>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Start shopping to add items to your cart</p>
          <Link to="/products"><Button className="btn-profit">Browse Products</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart ({cartItems.length} items)</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(grouped).map(([store, storeItems]) => (
              <div key={store} className="border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-semibold text-sm">{store}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {storeItems.length} item{storeItems.length > 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="space-y-4">
                  {storeItems.map((item) => {
                    const product = item.product;
                    if (!product) return null;
                    return (
                      <div key={item.id} className="flex gap-4">
                        <img
                          src={product.images[0] ?? ""}
                          alt={product.name}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${product.id}`} className="text-sm font-medium hover:text-primary line-clamp-1">
                            {product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                          <p className="text-sm font-bold text-primary mt-1">{formatNaira(product.price)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7"
                              onClick={() => updateQty.mutate({ cartItemId: item.id, quantity: item.quantity - 1 })}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7"
                              onClick={() => updateQty.mutate({ cartItemId: item.id, quantity: item.quantity + 1 })}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost" size="sm"
                            className="text-destructive hover:text-destructive h-7 px-2"
                            onClick={() => removeItem.mutate(item.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border rounded-xl p-6 h-fit sticky top-20">
            <h3 className="font-semibold mb-4">Order Summary</h3>

            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Discount code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="h-9"
              />
              <Button
                variant="outline" size="sm" className="h-9 shrink-0"
                onClick={() => { if (discountCode) setDiscountApplied(true); }}
              >
                <Tag className="h-3 w-3 mr-1" /> Apply
              </Button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              {discountApplied && (
                <div className="flex justify-between text-primary">
                  <span>Discount (10%)</span>
                  <span>-{formatNaira(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>{formatNaira(delivery)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-primary">{formatNaira(total)}</span>
              </div>
            </div>

            <Link to="/checkout">
              <Button className="w-full btn-profit mt-6">
                Proceed to Checkout <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="ghost" className="w-full mt-2 text-sm">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
