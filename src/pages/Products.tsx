import { useState, useMemo } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { ProductCard } from "@/components/landing/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import { formatNaira } from "@/data/mock";
import { usePublishedProducts } from "@/hooks/useProducts";
import type { Product } from "@/lib/supabase.types";

const categoriesList = ["All", "Food", "Fashion", "Electronics", "Services"];
const storeTypes = ["restaurant", "product", "service"] as const;

function toProductCardShape(p: Product) {
  return {
    id: p.id,
    name: p.name,
    price: p.price ?? 0,
    originalPrice: p.original_price ?? undefined,
    image: p.images[0] ?? "",
    storeName: p.store?.store_name ?? "",
    storeVerified: p.store?.verification_status === "verified",
    storeType: (p.store?.store_type === "food-drinks" ? "restaurant" : p.store?.store_type ?? "product") as "restaurant" | "product" | "service",
    rating: p.rating ?? 0,
    reviewCount: p.review_count ?? 0,
    category: p.category,
    inStock: p.status === "active",
  };
}

function FilterSidebar({ selectedCategories, setSelectedCategories, priceRange, setPriceRange, verifiedOnly, setVerifiedOnly, selectedStoreTypes, setSelectedStoreTypes }: {
  selectedCategories: string[]; setSelectedCategories: (v: string[]) => void;
  priceRange: number[]; setPriceRange: (v: number[]) => void;
  verifiedOnly: boolean; setVerifiedOnly: (v: boolean) => void;
  selectedStoreTypes: string[]; setSelectedStoreTypes: (v: string[]) => void;
}) {
  const toggleCategory = (cat: string) => {
    if (cat === "All") return setSelectedCategories(["All"]);
    const without = selectedCategories.filter((c) => c !== "All" && c !== cat);
    const has = selectedCategories.includes(cat);
    const next = has ? without : [...without, cat];
    setSelectedCategories(next.length === 0 ? ["All"] : next);
  };
  const toggleStore = (type: string) => {
    const has = selectedStoreTypes.includes(type);
    setSelectedStoreTypes(has ? selectedStoreTypes.filter((t) => t !== type) : [...selectedStoreTypes, type]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3 text-sm">Categories</h3>
        <div className="space-y-2">
          {categoriesList.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={selectedCategories.includes(cat)} onCheckedChange={() => toggleCategory(cat)} />
              <span className="text-sm">{cat}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3 text-sm">Price Range</h3>
        <Slider min={0} max={300000} step={1000} value={priceRange} onValueChange={setPriceRange} className="mb-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatNaira(priceRange[0])}</span>
          <span>{formatNaira(priceRange[1])}</span>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3 text-sm">Store Type</h3>
        <div className="flex flex-wrap gap-2">
          {storeTypes.map((type) => (
            <button key={type} onClick={() => toggleStore(type)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedStoreTypes.includes(type)
                  ? type === "restaurant" ? "category-restaurant border-orange-300"
                    : type === "product" ? "category-product border-blue-300"
                    : "category-service border-purple-300"
                  : "border-border"
              }`}
            >
              {type === "restaurant" ? "Restaurant" : type === "product" ? "Product" : "Service"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={verifiedOnly} onCheckedChange={(c) => setVerifiedOnly(!!c)} />
          <span className="text-sm font-medium">Verified vendors only</span>
        </label>
      </div>
    </div>
  );
}

export default function Products() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"]);
  const [priceRange, setPriceRange] = useState([0, 300000]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedStoreTypes, setSelectedStoreTypes] = useState<string[]>([]);

  const { data: products = [], isLoading } = usePublishedProducts({ search: search || undefined });

  const filtered = useMemo(() => {
    let items = products.map(toProductCardShape);
    if (!selectedCategories.includes("All"))
      items = items.filter((p) => selectedCategories.includes(p.category));
    items = items.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (verifiedOnly) items = items.filter((p) => p.storeVerified);
    if (selectedStoreTypes.length > 0) items = items.filter((p) => selectedStoreTypes.includes(p.storeType));
    if (sortBy === "price-low") items.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") items.sort((a, b) => b.price - a.price);
    if (sortBy === "rating") items.sort((a, b) => b.rating - a.rating);
    return items;
  }, [products, selectedCategories, priceRange, verifiedOnly, selectedStoreTypes, sortBy]);

  const filterProps = { selectedCategories, setSelectedCategories, priceRange, setPriceRange, verifiedOnly, setVerifiedOnly, selectedStoreTypes, setSelectedStoreTypes };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-sm text-muted-foreground">{isLoading ? "Loading…" : `${filtered.length} results`}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low</SelectItem>
                <SelectItem value="price-high">Price: High</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden sm:flex border rounded-md">
              <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-9 w-9" onClick={() => setViewMode("grid")}><LayoutGrid className="h-4 w-4" /></Button>
              <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-9 w-9" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 lg:hidden"><SlidersHorizontal className="h-4 w-4" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                <FilterSidebar {...filterProps} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-60 shrink-0"><FilterSidebar {...filterProps} /></aside>
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg font-medium mb-2">No products found</p>
                <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
                <Button variant="outline" onClick={() => { setSelectedCategories(["All"]); setSearch(""); setPriceRange([0, 300000]); setVerifiedOnly(false); setSelectedStoreTypes([]); }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-4"}>
                {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
