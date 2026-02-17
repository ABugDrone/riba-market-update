import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ThemeToggle";
import { formatNaira } from "@/data/mock";
import { mockOrders, sellerProducts } from "@/data/mockExtended";
import {
  BarChart3, Package, ShoppingCart, Users, DollarSign,
  Plus, Search, Home, Settings, Menu,
  Edit, Trash2, BookOpen, ChevronDown, ChevronRight, LayoutList, FolderTree,
  ArrowUpDown, X,
} from "lucide-react";
import SellerProfileSettings from "@/components/seller/SellerProfileSettings";
import StoreManager from "@/components/seller/StoreManager";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLocalCache } from "@/hooks/useLocalCache";
import { type SellerCatalogue, CATALOGUE_CATEGORY_LABELS } from "@/data/storeTypes";
import { type CatalogueItem } from "@/components/seller/CatalogueManager";
import { ImageUploadManager, type UploadedImage } from "@/components/seller/ImageUploadManager";
import { VideoEmbedField, type VideoEmbed } from "@/components/seller/VideoEmbedField";
import { useToast } from "@/hooks/use-toast";

const revenueData = [
  { month: "Jul", revenue: 120000 },
  { month: "Aug", revenue: 180000 },
  { month: "Sep", revenue: 250000 },
  { month: "Oct", revenue: 320000 },
  { month: "Nov", revenue: 280000 },
  { month: "Dec", revenue: 450000 },
  { month: "Jan", revenue: 380000 },
];

const stats = [
  { label: "Total Sales", value: "₦2.4M", icon: DollarSign, change: "+12%" },
  { label: "Active Products", value: "24", icon: Package, change: "+3" },
  { label: "Pending Orders", value: "8", icon: ShoppingCart, change: "-2" },
  { label: "Customers", value: "156", icon: Users, change: "+18" },
];

const statusColors: Record<string, string> = {
  pending: "status-pending",
  processing: "category-product",
  shipped: "category-service",
  delivered: "status-active",
  cancelled: "bg-destructive/10 text-destructive",
};

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tab: string;
  children?: { label: string; icon: React.ComponentType<{ className?: string }>; tab: string }[];
}

const navItems: NavItem[] = [
  { label: "Overview", icon: BarChart3, tab: "overview" },
  { label: "Orders", icon: ShoppingCart, tab: "orders" },
  {
    label: "Products", icon: Package, tab: "products",
    children: [
      { label: "Add Product", icon: Plus, tab: "products-add" },
      { label: "Manage All", icon: LayoutList, tab: "products-manage" },
      { label: "Categories", icon: FolderTree, tab: "products-categories" },
    ],
  },
  { label: "Catalogue", icon: BookOpen, tab: "catalogue" },
  { label: "Settings", icon: Settings, tab: "settings" },
];

function SideNav({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const isChildActive = (item: NavItem) =>
    item.children?.some((child) => activeTab === child.tab) ?? false;

  const toggleExpand = (tab: string) =>
    setExpandedMenus((prev) => ({ ...prev, [tab]: !prev[tab] }));

  return (
    <div className="flex flex-col h-full">
      <Link to="/" className="flex items-center gap-2 p-4 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-profit">
          <span className="text-sm font-bold text-white">R</span>
        </div>
        <span className="font-bold">Seller Hub</span>
      </Link>
      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedMenus[item.tab] || isChildActive(item);
          const isActive = activeTab === item.tab || isChildActive(item);

          return (
            <div key={item.tab}>
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggleExpand(item.tab);
                  } else {
                    setActiveTab(item.tab);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {hasChildren && (
                  isExpanded
                    ? <ChevronDown className="h-3.5 w-3.5" />
                    : <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
              {hasChildren && isExpanded && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l pl-3">
                  {item.children!.map((child) => (
                    <button
                      key={child.tab}
                      onClick={() => setActiveTab(child.tab)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeTab === child.tab
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <child.icon className="h-3.5 w-3.5" />
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <Home className="h-4 w-4" /> Back to Marketplace
        </Link>
      </div>
    </div>
  );
}

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedCatalogueId, setSelectedCatalogueId] = useState<string>("");
  const { toast } = useToast();

  // Product filter state
  const [productSearch, setProductSearch] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState<string>("all");
  const [productSortBy, setProductSortBy] = useState<string>("name-asc");
  const [manageSelectedCatalogue, setManageSelectedCatalogue] = useState<string>("");

  // Add product form state
  const [newProductCatalogue, setNewProductCatalogue] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductInventory, setNewProductInventory] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newProductImages, setNewProductImages] = useState<UploadedImage[]>([]);
  const [newProductVideo, setNewProductVideo] = useState<VideoEmbed | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Load catalogues
  const { data: catalogues } = useLocalCache<SellerCatalogue[]>("riba_seller_catalogues", []);

  // Resolve which catalogue to show — default to first one alphabetically
  const sortedCatalogues = useMemo(
    () => [...catalogues].sort((a, b) => a.name.localeCompare(b.name)),
    [catalogues]
  );
  const activeCatalogueId = manageSelectedCatalogue || sortedCatalogues[0]?.id || "";
  const activeCatalogue = sortedCatalogues.find((c) => c.id === activeCatalogueId);

  // Load products for the selected catalogue
  const catalogueProducts = useMemo(() => {
    if (!activeCatalogueId) return [];
    const key = `riba_catalogue_${activeCatalogueId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed: CatalogueItem[] = JSON.parse(raw);
        return parsed.map((ci) => ({
          id: ci.id,
          name: ci.name,
          category: ci.category || (activeCatalogue ? CATALOGUE_CATEGORY_LABELS[activeCatalogue.category] : ""),
          price: ci.price,
          description: ci.description,
          image: ci.image,
          status: ci.status as "draft" | "published",
          createdAt: ci.createdAt,
        }));
      }
    } catch { /* ignore */ }
    return [];
  }, [activeCatalogueId, activeCatalogue, catalogues]);

  // Unique categories within current catalogue
  const uniqueCategories = useMemo(() => {
    const cats = new Set(catalogueProducts.map((p) => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [catalogueProducts]);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let items = [...catalogueProducts];

    if (productSearch) {
      const q = productSearch.toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    if (productStatusFilter !== "all") {
      items = items.filter((p) => p.status === productStatusFilter);
    }

    switch (productSortBy) {
      case "name-asc":
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        items.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        items.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return items;
  }, [catalogueProducts, productSearch, productStatusFilter, productSortBy]);

  const hasActiveFilters = productSearch !== "" || productStatusFilter !== "all";

  const clearFilters = () => {
    setProductSearch("");
    setProductStatusFilter("all");
  };

  const resetAddProductForm = () => {
    setNewProductCatalogue("");
    setNewProductName("");
    setNewProductCategory("");
    setNewProductPrice("");
    setNewProductInventory("");
    setNewProductDescription("");
    setNewProductImages([]);
    setNewProductVideo(null);
  };

  const handleAddProduct = async () => {
    // Use the selected catalogue or default to the first one
    const selectedCatalogue = newProductCatalogue || sortedCatalogues[0]?.id;
    
    // Validation
    if (!selectedCatalogue) {
      toast({ title: "Error", description: "Please select a catalogue", variant: "destructive" });
      return;
    }
    if (!newProductName.trim()) {
      toast({ title: "Error", description: "Please enter product name", variant: "destructive" });
      return;
    }
    if (!newProductPrice || parseFloat(newProductPrice) <= 0) {
      toast({ title: "Error", description: "Please enter a valid price", variant: "destructive" });
      return;
    }
    if (newProductImages.length === 0) {
      toast({ title: "Error", description: "Please upload at least one product image", variant: "destructive" });
      return;
    }

    setIsSubmittingProduct(true);
    
    try {
      const mainImage = newProductImages.find((img) => img.isMain);
      const newProduct: CatalogueItem = {
        id: `product-${Date.now()}`,
        name: newProductName,
        category: newProductCategory,
        price: parseFloat(newProductPrice),
        description: newProductDescription,
        image: mainImage?.dataUrl || newProductImages[0].dataUrl,
        images: newProductImages.map((img) => img.dataUrl),
        video: newProductVideo || undefined,
        status: "draft",
        createdAt: new Date().toISOString(),
      };

      // Load existing products for this catalogue
      const key = `riba_catalogue_${selectedCatalogue}`;
      const existing = localStorage.getItem(key);
      const products: CatalogueItem[] = existing ? JSON.parse(existing) : [];
      products.push(newProduct);
      localStorage.setItem(key, JSON.stringify(products));

      toast({
        title: "Success!",
        description: `${newProductName} has been added to your catalogue.`,
      });

      resetAddProductForm();
      setActiveTab("products-manage");
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 border-r bg-card flex-col shrink-0">
        <SideNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 p-0">
                <SideNav activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setMobileOpen(false); }} />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold capitalize">{activeTab.replace(/-/g, " › ").replace("products › ", "Products › ")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">T</div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className="h-5 w-5 text-primary" />
                        <span className="text-xs text-primary font-medium">{stat.change}</span>
                      </div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => formatNaira(value)} />
                        <Line type="monotone" dataKey="revenue" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ fill: "hsl(142, 71%, 45%)" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Recent Orders</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("orders")}>View all</Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockOrders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <p className="text-sm font-medium">{order.orderNumber}</p>
                            <p className="text-xs text-muted-foreground">{order.date}</p>
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
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Top Products</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("products")}>View all</Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sellerProducts.slice(0, 3).map((p) => (
                        <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.sales} sales</p>
                          </div>
                          <span className="text-sm font-medium text-primary">{formatNaira(p.price)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">All Orders</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-8 h-9 w-48" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{formatNaira(order.total)}</TableCell>
                        <TableCell><Badge variant="secondary" className={`text-xs ${statusColors[order.status]}`}>{order.status}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{order.paymentMethod}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Products - Add Product */}
          {activeTab === "products-add" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add New Product</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-w-2xl">
                  {/* Catalogue selector */}
                  <div className="space-y-2">
                    <Label>Catalogue *</Label>
                    {sortedCatalogues.length > 0 ? (
                      <Select
                        value={newProductCatalogue || sortedCatalogues[0]?.id}
                        onValueChange={setNewProductCatalogue}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a catalogue" />
                        </SelectTrigger>
                        <SelectContent>
                          {sortedCatalogues.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                              <span className="ml-1 text-muted-foreground text-xs">
                                ({CATALOGUE_CATEGORY_LABELS[cat.category]})
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-sm text-muted-foreground border rounded-md p-3">
                        No catalogues yet.{" "}
                        <Button variant="link" className="p-0 h-auto text-sm" onClick={() => setActiveTab("catalogue")}>
                          Create one first
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Product Name *</Label>
                    <Input
                      placeholder="e.g. Samsung Galaxy A54"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                    />
                  </div>

                  {/* Category - auto-fetched from saved catalogue items */}
                  <div className="space-y-2">
                    <Label>Category</Label>
                    {(() => {
                      // Collect unique categories from all catalogue items
                      const savedCategories = new Set<string>();
                      sortedCatalogues.forEach((cat) => {
                        // Add the catalogue-level category label
                        savedCategories.add(CATALOGUE_CATEGORY_LABELS[cat.category]);
                        // Add item-level categories from stored products
                        try {
                          const raw = localStorage.getItem(`riba_catalogue_${cat.id}`);
                          if (raw) {
                            const items: CatalogueItem[] = JSON.parse(raw);
                            items.forEach((item) => { if (item.category) savedCategories.add(item.category); });
                          }
                        } catch { /* ignore */ }
                      });
                      const categoryList = Array.from(savedCategories).sort();
                      return categoryList.length > 0 ? (
                        <Select value={newProductCategory} onValueChange={setNewProductCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryList.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder="e.g. Electronics"
                          value={newProductCategory}
                          onChange={(e) => setNewProductCategory(e.target.value)}
                        />
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Price (₦) *</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Inventory</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newProductInventory}
                        onChange={(e) => setNewProductInventory(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                      placeholder="Describe your product features, specifications, etc."
                      rows={3}
                      value={newProductDescription}
                      onChange={(e) => setNewProductDescription(e.target.value)}
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      Product Images 
                      <span className="text-destructive">*</span>
                      <span className="text-xs text-muted-foreground font-normal">(Required - Up to 5 images)</span>
                    </Label>
                    <ImageUploadManager
                      images={newProductImages}
                      onChange={setNewProductImages}
                      maxImages={5}
                      maxSizeMB={5}
                    />
                  </div>

                  {/* Video URL */}
                  <div className="space-y-2">
                    <Label>Product Video (Optional)</Label>
                    <VideoEmbedField value={newProductVideo} onChange={setNewProductVideo} />
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      className="btn-profit flex-1"
                      disabled={sortedCatalogues.length === 0 || isSubmittingProduct}
                      onClick={handleAddProduct}
                    >
                      {isSubmittingProduct ? (
                        <>
                          <span className="inline-block animate-spin mr-2">⏳</span> 
                          Adding Product...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" /> Add Product
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={resetAddProductForm}
                      disabled={
                        !newProductName && 
                        !newProductPrice && 
                        !newProductDescription && 
                        newProductImages.length === 0 &&
                        isSubmittingProduct
                      }
                    >
                      Clear Form
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products - Manage All */}
          {(activeTab === "products" || activeTab === "products-manage") && (
            <div className="space-y-4">
              {/* No catalogues yet */}
              {sortedCatalogues.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium">No catalogues yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Create a catalogue first, then add products to it.</p>
                    <Button size="sm" className="btn-profit mt-4" onClick={() => setActiveTab("catalogue")}>
                      <Plus className="h-4 w-4 mr-1" /> Create Catalogue
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Catalogue Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {sortedCatalogues.map((cat) => (
                      <Button
                        key={cat.id}
                        variant={activeCatalogueId === cat.id ? "default" : "outline"}
                        size="sm"
                        className={`shrink-0 gap-1.5 ${activeCatalogueId === cat.id ? "btn-profit" : ""}`}
                        onClick={() => { setManageSelectedCatalogue(cat.id); clearFilters(); }}
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        {cat.name}
                        <Badge variant="secondary" className="text-[10px] ml-0.5 px-1.5 py-0">
                          {(() => {
                            try {
                              const raw = localStorage.getItem(`riba_catalogue_${cat.id}`);
                              return raw ? JSON.parse(raw).length : 0;
                            } catch { return 0; }
                          })()}
                        </Badge>
                      </Button>
                    ))}
                  </div>

                  {/* Active Catalogue Header */}
                  {activeCatalogue && (
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-semibold">{activeCatalogue.name}</h2>
                        <p className="text-xs text-muted-foreground">
                          {CATALOGUE_CATEGORY_LABELS[activeCatalogue.category]} catalogue
                          {activeCatalogue.description ? ` — ${activeCatalogue.description}` : ""}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Filters */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search in this catalogue..."
                            className="pl-8 h-9"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                          />
                        </div>

                        <Select value={productStatusFilter} onValueChange={setProductStatusFilter}>
                          <SelectTrigger className="w-[140px] h-9">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={productSortBy} onValueChange={setProductSortBy}>
                          <SelectTrigger className="w-[160px] h-9">
                            <div className="flex items-center gap-1.5">
                              <ArrowUpDown className="h-3.5 w-3.5" />
                              <SelectValue placeholder="Sort" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name-asc">Name A-Z</SelectItem>
                            <SelectItem value="name-desc">Name Z-A</SelectItem>
                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                            <SelectItem value="newest">Newest First</SelectItem>
                          </SelectContent>
                        </Select>

                        {hasActiveFilters && (
                          <Button variant="ghost" size="sm" className="h-9 text-xs gap-1" onClick={clearFilters}>
                            <X className="h-3.5 w-3.5" /> Clear
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                          {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
                          {hasActiveFilters ? " (filtered)" : ""}
                        </p>
                        <Button size="sm" className="btn-profit" onClick={() => setActiveTab("products-add")}>
                          <Plus className="h-4 w-4 mr-1" /> Add Product
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Product Table */}
                  {filteredProducts.length > 0 ? (
                    <Card>
                      <CardContent className="pt-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredProducts.map((p) => (
                              <TableRow key={p.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    {p.image ? (
                                      <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                                    ) : (
                                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-medium text-sm">{p.name}</span>
                                      {p.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{p.description}</p>}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{p.category}</TableCell>
                                <TableCell className="text-primary font-medium">{formatNaira(p.price)}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className={`text-xs ${
                                    p.status === "published" ? "status-active" : "status-pending"
                                  }`}>
                                    {p.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        {hasActiveFilters ? (
                          <>
                            <p className="text-sm text-muted-foreground">No products match your filters.</p>
                            <Button variant="link" size="sm" className="mt-2" onClick={clearFilters}>Clear all filters</Button>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-muted-foreground">This catalogue has no products yet.</p>
                            <Button size="sm" className="btn-profit mt-3" onClick={() => setActiveTab("products-add")}>
                              <Plus className="h-4 w-4 mr-1" /> Add Product
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}

          {/* Products - Categories */}
          {activeTab === "products-categories" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Product Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {["Electronics", "Fashion", "Food", "Services", "Home & Garden", "Health & Beauty"].map((cat) => {
                    const count = sellerProducts.filter((p) => p.category === cat).length;
                    return (
                      <Card key={cat} className="hover:border-primary/40 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{cat}</p>
                              <p className="text-xs text-muted-foreground">{count} product{count !== 1 ? "s" : ""}</p>
                            </div>
                            <FolderTree className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "catalogue" && (
            <StoreManager
              selectedCatalogueId={selectedCatalogueId}
              onSelectCatalogue={setSelectedCatalogueId}
            />
          )}

          {activeTab === "settings" && <SellerProfileSettings />}
        </main>
      </div>
    </div>
  );
}
