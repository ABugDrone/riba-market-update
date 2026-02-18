import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Tabs not used directly
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard } from "@/components/landing/ProductCard";
import { ReceiptPreviewModal, ReceiptPreviewData } from "@/components/ReceiptPreviewModal";
import { formatNaira } from "@/data/mock";
import { mockOrders, mockAddresses, allProducts } from "@/data/mockExtended";
import {
  ShoppingBag, Heart, MapPin, Settings, Home, Menu,
  Package, TrendingUp, Star, Download,
  Plus, Edit, Trash2, Bell, Lock, User,
} from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "status-pending",
  processing: "category-product",
  shipped: "category-service",
  delivered: "status-active",
  cancelled: "bg-destructive/10 text-destructive",
};

const navItems = [
  { label: "Overview", icon: Home, tab: "overview" },
  { label: "Orders", icon: ShoppingBag, tab: "orders" },
  { label: "Wishlist", icon: Heart, tab: "wishlist" },
  { label: "Addresses", icon: MapPin, tab: "addresses" },
  { label: "Settings", icon: Settings, tab: "settings" },
];

function SideNav({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) {
  return (
    <div className="flex flex-col h-full">
      <Link to="/" className="flex items-center gap-2 p-4 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-profit">
          <span className="text-sm font-bold text-white">R</span>
        </div>
        <span className="font-bold">My Account</span>
      </Link>
      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === item.tab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <Home className="h-4 w-4" /> Back to Marketplace
        </Link>
      </div>
    </div>
  );
}

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptPreviewData | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const wishlistProducts = allProducts.slice(0, 4);

  const handleOpenReceipt = (order: typeof mockOrders[0]) => {
    // Convert mockOrder to ReceiptPreviewData format
    const receiptData: ReceiptPreviewData = {
      orderId: order.id,
      timestamp: order.date,
      items: order.items.map(item => ({
        productId: item.id || `item-${Math.random()}`,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        storeName: order.storeName,
      })),
      address: {
        label: "Delivery Address",
        fullAddress: "123 Main Street",
        city: "Lagos",
        state: "Lagos",
        phone: "+234 801 234 5678",
      },
      paymentMethod: "cod",
      subtotal: order.total * 0.85,
      delivery: order.total * 0.15,
      total: order.total,
      buyer: {
        name: "Buyer Name",
        email: "buyer@example.com",
        phone: "+234 801 234 5678",
        userType: "buyer",
      },
    };
    setSelectedReceipt(receiptData);
    setShowReceiptModal(true);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex w-60 border-r bg-card flex-col shrink-0">
        <SideNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden"><Menu className="h-5 w-5" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 p-0">
                <SideNav activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setMobileOpen(false); }} />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">U</div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white">
                <h2 className="text-xl font-bold mb-1">Welcome back, User! 👋</h2>
                <p className="text-primary-100 text-sm">Here's what's happening with your orders.</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Orders", value: "12", icon: ShoppingBag },
                  { label: "Total Spent", value: "₦403K", icon: TrendingUp },
                  { label: "Saved Items", value: "4", icon: Heart },
                  { label: "Active Orders", value: "2", icon: Package },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-4">
                      <stat.icon className="h-5 w-5 text-primary mb-2" />
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Recent Orders</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("orders")}>View all</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                        <img src={order.items[0].image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{order.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">{order.items.map((i) => i.name).join(", ")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatNaira(order.total)}</p>
                          <Badge variant="secondary" className={`text-xs ${statusColors[order.status]}`}>{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-4">
              {mockOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-sm">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">{order.date} · {order.storeName}</p>
                      </div>
                      <Badge variant="secondary" className={`${statusColors[order.status]}`}>{order.status}</Badge>
                    </div>
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 py-2">
                        <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-medium">{formatNaira(item.price)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <span className="text-sm font-bold">Total: {formatNaira(order.total)}</span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenReceipt(order)}
                        >
                          <Download className="h-3 w-3 mr-1" /> Receipt
                        </Button>
                        {order.status === "delivered" && <Button size="sm" className="btn-profit"><Star className="h-3 w-3 mr-1" /> Review</Button>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "wishlist" && (
            <div>
              {wishlistProducts.length === 0 ? (
                <div className="text-center py-20">
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No saved items</p>
                  <Link to="/products"><Button className="btn-profit">Browse Products</Button></Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {wishlistProducts.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="space-y-4 max-w-lg">
              {mockAddresses.map((addr) => (
                <Card key={addr.id}>
                  <CardContent className="p-4 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{addr.label}</span>
                        {addr.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{addr.fullAddress}, {addr.city}, {addr.state}</p>
                      <p className="text-xs text-muted-foreground mt-1">{addr.phone}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="w-full"><Plus className="h-4 w-4 mr-2" /> Add New Address</Button>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6 max-w-lg">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Profile</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Full Name</Label><Input defaultValue="John Doe" /></div>
                  <div className="space-y-2"><Label>Email</Label><Input defaultValue="john@example.com" type="email" /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input defaultValue="+234 801 234 5678" /></div>
                  <Button className="btn-profit">Save Changes</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Password</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Current Password</Label><Input type="password" /></div>
                  <div className="space-y-2"><Label>New Password</Label><Input type="password" /></div>
                  <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" /></div>
                  <Button variant="outline">Update Password</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {["Order updates", "Promotions", "Price drop alerts"].map((pref) => (
                    <label key={pref} className="flex items-center justify-between">
                      <span className="text-sm">{pref}</span>
                      <input type="checkbox" defaultChecked className="accent-primary" />
                    </label>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
      
      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal 
        open={showReceiptModal} 
        onOpenChange={setShowReceiptModal}
        receiptData={selectedReceipt}
      />
    </div>
  );
}
