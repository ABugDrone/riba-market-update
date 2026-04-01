import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { usePublishedProducts } from "@/hooks/useProducts";
import type { Product } from "@/lib/supabase.types";

function toCardShape(p: Product) {
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

export function FeaturedProducts() {
  const { data: products = [], isLoading } = usePublishedProducts({ limit: 8 });

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Featured Products</h2>
            <p className="text-muted-foreground mt-1">Handpicked deals from verified vendors</p>
          </div>
          <Link to="/products">
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => <ProductCard key={p.id} product={toCardShape(p)} />)}
          </div>
        )}
      </div>
    </section>
  );
}
