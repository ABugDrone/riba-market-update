import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard } from "@/components/landing/ProductCard";
import { ReceiptPreviewModal, ReceiptPreviewData } from "@/components/ReceiptPreviewModal";
import { formatNaira } from "@/data/mock";
import {
  ShoppingBag, Heart, MapPin, Settings, Home, Menu,
  Package, TrendingUp, Star, Download,
  Plus, Edit, Trash2, Bell, Lock, User, Loader2, Store,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile } from "@/lib/profileService";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useBuyerOrders } from "@/hooks/useOrders";
import { useAddresses, useCreateAddress, useDeleteAddress, useSetDefaultAddress } from "@/hooks/useAddresses";
import { useWishlist, useRemoveFromWishlist } from "@/hooks/useWishlist";
import { useStoresByIds } from "@/hooks/useStores";
import { useUnfollowStore } from "@/hooks/useStores";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import type { Order } from "@/lib/supabase.types";

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
  { label: "Following", icon: Store, tab: "following" },
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
        <span className="font-bold">Buyer Hub</span>
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
  const { state, updateProfile: updateAuthProfile } = useAuth();
  const user = state.currentUser;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptPreviewData | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", full_address: "", city: "", state: "", phone: "" });

  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
  });

  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  // Real data hooks
  const { data: orders = [], isLoading: ordersLoading } = useBuyerOrders(user?.id);
  const { data: addresses = [], isLoading: addressesLoading } = useAddresses(user?.id);
  const { data: wishlistItems = [], isLoading: wishlistLoading } = useWishlist(user?.id);
  const { data: followedStores = [], isLoading: followedLoading } = useStoresByIds(user?.followedSellers);
  const unfollowStore = useUnfollowStore();
  const createAddress = useCreateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefault = useSetDefaultAddress();
  const removeWishlist = useRemoveFromWishlist();

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const activeOrders = orders.filter((o) => ["pending", "processing", "shipped"].includes(o.status)).length;

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await updateProfile(user.id, {
      full_name: profileForm.name,
      phone: profileForm.phone || null,
    });
    setSavingProfile(false);
    if (error) {
      toast({ title: "Save failed", description: error, variant: "destructive" });
    } else {
      await updateAuthProfile({ name: profileForm.name, phone: profileForm.phone });
      toast({ title: "Profile updated" });
    }
  };

  const handleOpenReceipt = (order: Order) => {
    const receiptData: ReceiptPreviewData = {
      orderId: order.id,
      timestamp: order.created_at,
      items: (order.items ?? []).map((item) => ({
        productId: item.product_id ?? item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image ?? "",
        storeName: item.store_name ?? "",
      })),
      address: {
        label: order.delivery_address.label,
        fullAddress: order.delivery_address.full_address,
        city: order.delivery_address.city,
        state: order.delivery_address.state,
        phone: order.delivery_address.phone,
      },
      paymentMethod: order.payment_method,
      subtotal: order.subtotal,
      delivery: order.delivery_fee,
      total: order.total,
      buyer: {
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        userType: user?.userType ?? "buyer",
      },
    };
    setSelectedReceipt(receiptData);
    setShowReceiptModal(true);
  };

  const handleUpdatePassword = async () => {
    if (!passwordForm.newPass || !passwordForm.current) return;
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (passwordForm.newPass.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (passwordForm.newPass === passwordForm.current) {
      toast({ title: "New password must be different from current password", variant: "destructive" });
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPass });
      if (error) {
        if (error.message.toLowerCase().includes("same")) {
          toast({ title: "That's already your password", description: "Choose a different one", variant: "destructive" });
        } else {
          toast({ title: "Update failed", description: error.message, variant: "destructive" });
        }
      } else {
        toast({ title: "Password updated successfully!" });
        setPasswordForm({ current: "", newPass: "", confirm: "" });
      }
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAddAddress = async () => {    if (!user || !newAddress.label || !newAddress.full_address) return;
    await createAddress.mutateAsync({
      profile_id: user.id,
      ...newAddress,
      is_default: addresses.length === 0,
    });
    setNewAddress({ label: "", full_address: "", city: "", state: "", phone: "" });
    setShowAddAddress(false);
    toast({ title: "Address added" });
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
            <UserProfileDropdown size="sm" />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white">
                <h2 className="text-xl font-bold mb-1">Welcome back, {user?.name?.split(" ")[0] ?? "there"}! 👋</h2>
                <p className="text-primary-100 text-sm">Here's what's happening with your orders.</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Orders", value: ordersLoading ? "…" : String(orders.length), icon: ShoppingBag },
                  { label: "Total Spent", value: ordersLoading ? "…" : formatNaira(totalSpent), icon: TrendingUp },
                  { label: "Saved Items", value: wishlistLoading ? "…" : String(wishlistItems.length), icon: Heart },
                  { label: "Active Orders", value: ordersLoading ? "…" : String(activeOrders), icon: Package },
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
                  {ordersLoading ? (
                    <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
                  ) : orders.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No orders yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{order.order_number}</p>
                            <p className="text-xs text-muted-foreground">{(order.items ?? []).map(i => i.name).join(", ")}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatNaira(order.total)}</p>
                            <Badge variant="secondary" className={`text-xs ${statusColors[order.status]}`}>{order.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Orders ── */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {ordersLoading ? (
                [1,2,3].map(i => <Skeleton key={i} className="h-40 w-full" />)
              ) : orders.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No orders yet</p>
                  <Link to="/products"><Button className="btn-profit">Start Shopping</Button></Link>
                </div>
              ) : orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-sm">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="secondary" className={statusColors[order.status]}>{order.status}</Badge>
                    </div>
                    {(order.items ?? []).map((item, i) => (
                      <div key={i} className="flex items-center gap-3 py-2">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                          : <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>
                        }
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
                        <Button variant="outline" size="sm" onClick={() => handleOpenReceipt(order)}>
                          <Download className="h-3 w-3 mr-1" /> Receipt
                        </Button>
                        {order.status === "delivered" && (
                          <Button size="sm" className="btn-profit"><Star className="h-3 w-3 mr-1" /> Review</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ── Wishlist ── */}
          {activeTab === "wishlist" && (
            <div>
              {wishlistLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-64 w-full" />)}
                </div>
              ) : wishlistItems.length === 0 ? (
                <div className="text-center py-20">
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No saved items</p>
                  <Link to="/products"><Button className="btn-profit">Browse Products</Button></Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {wishlistItems.map((item) => item.product && (
                    <div key={item.id} className="relative">
                      <ProductCard product={{
                        id: item.product.id,
                        name: item.product.name,
                        price: item.product.price,
                        originalPrice: item.product.original_price ?? undefined,
                        image: item.product.images[0] ?? "",
                        storeName: item.product.store?.store_name ?? "",
                        storeVerified: item.product.store?.verification_status === "verified",
                        storeType: "product",
                        rating: item.product.rating,
                        reviewCount: item.product.review_count,
                        category: item.product.category,
                        inStock: item.product.status === "published",
                      }} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 text-destructive"
                        onClick={() => user && removeWishlist.mutate({ profileId: user.id, productId: item.product_id })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Following ── */}
          {activeTab === "following" && (
            <div className="space-y-4">
              {followedLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
              ) : followedStores.length === 0 ? (
                <div className="text-center py-20">
                  <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Not following any sellers yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Visit a store and hit Follow to see them here.</p>
                  <Link to="/products"><Button className="btn-profit">Browse Stores</Button></Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {followedStores.map((store) => (
                    <Card key={store.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {store.logo_url ? (
                            <img src={store.logo_url} alt={store.store_name} className="h-12 w-12 rounded-xl object-cover shrink-0" />
                          ) : (
                            <div className="h-12 w-12 rounded-xl bg-gradient-profit flex items-center justify-center text-xl font-bold text-white shrink-0">
                              {store.store_name[0]}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{store.store_name}</p>
                            {store.store_type && (
                              <p className="text-xs text-muted-foreground capitalize">{store.store_type}</p>
                            )}
                          </div>
                        </div>
                        {store.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{store.description}</p>
                        )}
                        <div className="flex gap-2">
                          <Link to={`/store/${encodeURIComponent(store.store_name)}`} className="flex-1">
                            <Button size="sm" className="btn-profit w-full">Visit Store</Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => user && unfollowStore.mutate({ storeId: store.id, followerId: user.id })}
                            disabled={unfollowStore.isPending}
                          >
                            Unfollow
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Addresses ── */}
          {activeTab === "addresses" && (
            <div className="space-y-4 max-w-lg">
              {addressesLoading ? (
                [1,2].map(i => <Skeleton key={i} className="h-24 w-full" />)
              ) : addresses.map((addr) => (
                <Card key={addr.id}>
                  <CardContent className="p-4 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{addr.label}</span>
                        {addr.is_default && <Badge variant="secondary" className="text-xs">Default</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{addr.full_address}, {addr.city}, {addr.state}</p>
                      <p className="text-xs text-muted-foreground mt-1">{addr.phone}</p>
                    </div>
                    <div className="flex gap-1">
                      {!addr.is_default && (
                        <Button
                          variant="ghost" size="sm" className="h-8 text-xs"
                          onClick={() => user && setDefault.mutate({ profileId: user.id, addressId: addr.id })}
                        >
                          Set default
                        </Button>
                      )}
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                        onClick={() => deleteAddress.mutate(addr.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {showAddAddress ? (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Label</Label>
                        <Input placeholder="Home / Office" value={newAddress.label} onChange={e => setNewAddress(p => ({ ...p, label: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Phone</Label>
                        <Input placeholder="+234 800 000 0000" value={newAddress.phone} onChange={e => setNewAddress(p => ({ ...p, phone: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Full Address</Label>
                      <Input placeholder="12 Allen Avenue" value={newAddress.full_address} onChange={e => setNewAddress(p => ({ ...p, full_address: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">City</Label>
                        <Input placeholder="Lagos" value={newAddress.city} onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">State</Label>
                        <Input placeholder="Lagos" value={newAddress.state} onChange={e => setNewAddress(p => ({ ...p, state: e.target.value }))} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="btn-profit flex-1" onClick={handleAddAddress} disabled={createAddress.isPending}>
                        {createAddress.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Save
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddAddress(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => setShowAddAddress(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add New Address
                </Button>
              )}
            </div>
          )}

          {/* ── Settings ── */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-lg">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Profile</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email ?? ""} type="email" disabled className="opacity-60" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+234 800 000 0000" />
                  </div>
                  <Button className="btn-profit" onClick={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Password</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={passwordForm.newPass}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, newPass: e.target.value }))}
                      placeholder="Min. 6 characters"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
                      placeholder="Repeat new password"
                    />
                    {passwordForm.confirm && passwordForm.newPass !== passwordForm.confirm && (
                      <p className="text-xs text-destructive">Passwords don't match</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleUpdatePassword}
                    disabled={savingPassword || !passwordForm.current || !passwordForm.newPass || passwordForm.newPass !== passwordForm.confirm}
                  >
                    {savingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {savingPassword ? "Updating…" : "Update Password"}
                  </Button>
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

      <ReceiptPreviewModal
        open={showReceiptModal}
        onOpenChange={setShowReceiptModal}
        receiptData={selectedReceipt}
      />
    </div>
  );
}
