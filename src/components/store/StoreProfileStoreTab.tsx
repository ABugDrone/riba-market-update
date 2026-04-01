import { useState } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "@/components/landing/ProductCard";
import { useStoreProducts } from "@/hooks/useProducts";
import { type CatalogueCategory, CATALOGUE_CATEGORY_LABELS } from "@/data/storeTypes";
import { formatNaira } from "@/data/mock";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Package } from "lucide-react";
import type { Product } from "@/lib/supabase.types";

interface Props {
  storeName: string;
  storeId?: string;
  storeType?: CatalogueCategory;
}

function toCardShape(p: Product) {
  return {
    id: p.id,
    name: p.name,
    price: p.price ?? 0,
    originalPrice: p.original_price ?? undefined,
    image: p.images[0] ?? "",
    storeName: p.store?.store_name ?? "",
    storeVerified: p.store?.verification_status === "verified",
    storeType: "product" as const,
    rating: p.rating ?? 0,
    reviewCount: p.review_count ?? 0,
    category: p.category,
    inStock: p.status === "active",
  };
}

export default function StoreProfileStoreTab({ storeName, storeId, storeType }: Props) {
  const [search, setSearch] = useState("");
  const { data: products = [], isLoading } = useStoreProducts(storeId);

  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mt-6 space-y-6">
      {storeType && (
        <Badge variant="secondary" className="text-xs">
          {CATALOGUE_CATEGORY_LABELS[storeType]} Catalogue
        </Badge>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search in this store..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {search ? "No products match your search." : "No products listed yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <Link key={p.id} to={`/product/${p.id}`}>
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  {p.images[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-40 object-cover rounded-lg mb-3" />
                  ) : (
                    <div className="w-full h-40 bg-muted rounded-lg mb-3 flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <h3 className="font-medium text-sm line-clamp-1">{p.name}</h3>
                  {p.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                  <p className="text-primary font-semibold mt-2">{formatNaira(p.price ?? 0)}</p>
                  {p.category && <span className="text-xs text-muted-foreground">{p.category}</span>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
