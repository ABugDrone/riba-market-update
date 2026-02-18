import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalCache } from "@/hooks/useLocalCache";
import { type SellerCatalogue, CATALOGUE_CATEGORY_LABELS, CATALOGUE_CATEGORY_COLORS } from "@/data/storeTypes";
import { type SellerProfile } from "@/components/seller/SellerProfileSettings";
import { type CatalogueItem } from "@/components/seller/CatalogueManager";
import { formatNaira } from "@/data/mock";
import { useState, useMemo, useEffect } from "react";
import {
  Package, Search, ShoppingCart, BadgeCheck, Share2,
  ArrowLeft, SlidersHorizontal, Grid3X3, LayoutList,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CataloguePublic() {
  const { catalogueId } = useParams();
  const { data: catalogues } = useLocalCache<SellerCatalogue[]>("riba_seller_catalogues", []);
  const { data: sellerProfile } = useLocalCache<SellerProfile>("riba_seller_profile", {
    businessName: "Riba Seller",
    description: "",
    email: "",
    phone: "",
    logoUrl: null,
    googleMapsLink: "",
    isPro: false,
    hideSoldCount: false,
  });

  // Scroll to top on catalogue change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [catalogueId]);

  const catalogue = catalogues.find((c) => c.id === catalogueId);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Load items from localStorage
  const items = useMemo(() => {
    if (!catalogueId) return [];
    try {
      const raw = localStorage.getItem(`riba_catalogue_${catalogueId}`);
      if (raw) {
        const parsed: CatalogueItem[] = JSON.parse(raw);
        // Only show published items to the public
        return parsed.filter((i) => i.status === "published");
      }
    } catch { /* ignore */ }
    return [];
  }, [catalogueId]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [items, search, sortBy]);

  // Not found
  if (!catalogue) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Catalogue Not Found</h1>
          <p className="text-muted-foreground mb-6">This catalogue may have been removed or the link is incorrect.</p>
          <Link to="/">
            <Button><ArrowLeft className="h-4 w-4 mr-1" /> Back to Home</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Hidden catalogue
  if (catalogue.isPublic === false) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Catalogue Unavailable</h1>
          <p className="text-muted-foreground mb-6">This catalogue is not currently available for viewing.</p>
          <Link to="/">
            <Button><ArrowLeft className="h-4 w-4 mr-1" /> Back to Home</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const bannerColor = catalogue.bannerColor || "bg-gradient-profit";

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: catalogue.name, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main>
        {/* Banner */}
        <div className={`${bannerColor} text-white`}>
          <div className="container py-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 text-white/70 text-sm">
                  <Link to={`/store/${encodeURIComponent(sellerProfile.businessName)}`} className="hover:text-white transition-colors">
                    {sellerProfile.businessName}
                  </Link>
                  {sellerProfile.isPro && <BadgeCheck className="h-4 w-4 text-white" />}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">{catalogue.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    {CATALOGUE_CATEGORY_LABELS[catalogue.category]}
                  </Badge>
                  <span className="text-sm text-white/80">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {catalogue.description && (
                  <p className="mt-2 text-sm text-white/80 max-w-lg">{catalogue.description}</p>
                )}
              </div>
              <Button variant="secondary" size="sm" className="gap-1.5 shrink-0" onClick={handleShare}>
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        {catalogue.welcomeMessage && (
          <div className="border-b bg-card">
            <div className="container py-4">
              <p className="text-sm text-muted-foreground italic">"{catalogue.welcomeMessage}"</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="container py-6">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search this catalogue..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[170px]">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <SelectValue />
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
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-r-none"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-l-none"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Items */}
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                {items.length === 0 ? (
                  <>
                    <h3 className="text-lg font-semibold mb-1">No items yet</h3>
                    <p className="text-sm text-muted-foreground">This catalogue doesn't have any published items yet. Check back soon!</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-1">No results</h3>
                    <p className="text-sm text-muted-foreground">No items match "{search}". Try a different search.</p>
                    <Button variant="link" className="mt-2" onClick={() => setSearch("")}>Clear search</Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="group overflow-hidden hover:shadow-md transition-shadow">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-muted flex items-center justify-center">
                      <Package className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <CardContent className="p-3">
                    <h3 className="text-sm font-semibold truncate">{item.name}</h3>
                    {item.category && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                    )}
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-primary font-bold text-sm">{formatNaira(item.price)}</span>
                      <Button size="sm" className="h-7 text-xs gap-1 btn-profit">
                        <ShoppingCart className="h-3 w-3" /> Buy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <Card key={item.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold">{item.name}</h3>
                        {item.category && <p className="text-xs text-muted-foreground">{item.category}</p>}
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end justify-between shrink-0">
                        <span className="text-primary font-bold">{formatNaira(item.price)}</span>
                        <Button size="sm" className="h-8 text-xs gap-1 btn-profit">
                          <ShoppingCart className="h-3.5 w-3.5" /> Buy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
