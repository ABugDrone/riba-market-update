import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { ProductCard } from "@/components/landing/ProductCard";
import { ReviewForm, ReviewData } from "@/components/ReviewForm";
import { AnonymousReviewData } from "@/components/AnonymousReviewForm";
import { SellerReplyForm, SellerReply } from "@/components/SellerReplyForm";
import { formatNaira } from "@/data/mock";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star, ShoppingCart, Heart, Share2, BadgeCheck, Minus, Plus,
  Truck, Shield, RotateCcw, ThumbsUp, ChevronRight, Video,
  Play, Sparkles, TrendingUp, Users, Award, Clock, Package, Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useProduct, usePublishedProducts } from "@/hooks/useProducts";
import { useProductReviews, useCreateReview, useAddSellerReply } from "@/hooks/useReviews";
import { useAddToCart } from "@/hooks/useCart";
import { useAddToWishlist } from "@/hooks/useWishlist";
import type { Review } from "@/lib/supabase.types";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: authState, addPurchasedProduct } = useAuth();
  const { toast } = useToast();

  const { data: product, isLoading } = useProduct(id);
  const { data: allReviews = [] } = useProductReviews(id);
  const { data: relatedRaw = [] } = usePublishedProducts({
    category: product?.category,
    limit: 4,
  });
  const createReview = useCreateReview();
  const addSellerReply = useAddSellerReply();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();

  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const related = relatedRaw
    .filter((p) => p.id !== id)
    .slice(0, 4)
    .map((p) => ({
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
    }));

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  // Auto-slide images
  useEffect(() => {
    const images = product?.images ?? [];
    if (images.length <= 1 || showVideo) return;
    const interval = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [product?.images, showVideo]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <Header />
        <main className="container py-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <Header />
        <main className="container py-20 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Product not found</h1>
          <Link to="/products"><Button className="btn-profit">Browse Products</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  const displayImages = product.images.length > 0 ? product.images : [""];
  const displayName = product.name;
  const displayPrice = product.price ?? 0;
  const displayDescription = product.description ??
    `Experience the best of quality with ${displayName} from ${product.store?.store_name ?? "this store"}.`;
  const videoEmbed = product.video_embed;
  const hasVideo = !!videoEmbed;
  const storeName = product.store?.store_name ?? "";
  const storeVerified = product.store?.verification_status === "verified";

  const handleBuyNow = () => {
    localStorage.setItem("quickCheckoutData", JSON.stringify({
      items: [{
        productId: product.id,
        name: displayName,
        price: displayPrice,
        quantity: qty,
        image: displayImages[0],
        storeName,
      }],
      isQuickCheckout: true,
    }));
    navigate("/payment");
  };

  const handleAddToCart = async () => {
    if (!authState.currentUser?.id) {
      toast({ title: "Please sign in to add to cart", variant: "destructive" });
      return;
    }
    await addToCart.mutateAsync({ profileId: authState.currentUser.id, productId: product.id, quantity: qty });
    toast({ title: `Added ${qty} item${qty > 1 ? "s" : ""} to cart` });
  };

  const handleWishlist = async () => {
    if (!authState.currentUser?.id) {
      toast({ title: "Please sign in to save items", variant: "destructive" });
      return;
    }
    await addToWishlist.mutateAsync({ profileId: authState.currentUser.id, productId: product.id });
    toast({ title: "Saved to wishlist" });
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: displayName, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard" });
    }
  };

  const canReview = authState.isAuthenticated &&
    authState.currentUser?.userType === "buyer" &&
    authState.currentUser?.purchasedProductIds.includes(product.id);

  const handleReviewSubmit = async (newReview: ReviewData | AnonymousReviewData) => {
    const { error } = await createReview.mutateAsync({
      product_id: product.id,
      buyer_id: authState.currentUser?.id ?? "",
      author_name: newReview.author,
      author_avatar: newReview.avatar ?? null,
      rating: newReview.rating,
      comment: newReview.comment,
      is_anonymous: "isAnonymous" in newReview ? newReview.isAnonymous : false,
    });
    if (error) toast({ title: "Failed to submit review", description: error, variant: "destructive" });
    else toast({ title: "Review submitted!" });
  };

  const handleSellerReply = async (reviewId: string, reply: SellerReply) => {
    await addSellerReply.mutateAsync({
      reviewId,
      reply: {
        seller_id: authState.currentUser?.id ?? "",
        seller_name: authState.currentUser?.name ?? "",
        message: reply.message,
        created_at: new Date().toISOString(),
      },
    });
  };

  const isSeller = authState.currentUser?.userType === "seller" || authState.currentUser?.userType === "both";

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-primary">Products</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{displayName}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-border shadow-lg group">
              {hasVideo && videoEmbed && showVideo ? (
                <div className="absolute inset-0 bg-black">
                  <iframe src={videoEmbed.embedUrl} className="absolute inset-0 w-full h-full" frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Product demo" />
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-1.5 rounded-full">
                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-xs text-white font-semibold">LIVE DEMO</span>
                  </div>
                </div>
              ) : (
                <>
                  <img src={displayImages[selectedImage]} alt={displayName}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {displayImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/50 backdrop-blur px-3 py-2 rounded-full">
                      {displayImages.map((_, i) => (
                        <button key={i} onClick={() => setSelectedImage(i)}
                          className={`h-1.5 rounded-full transition-all ${selectedImage === i ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
                          aria-label={`Slide ${i + 1}`} />
                      ))}
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="rounded-full" onClick={handleWishlist}>
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="rounded-full" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {!showVideo && displayImages.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-lg border-2 overflow-hidden transition-all hover:scale-105 ${selectedImage === i ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
              {hasVideo && videoEmbed && (
                <button onClick={() => setShowVideo(true)}
                  className={`aspect-square rounded-lg border-2 overflow-hidden relative ${showVideo ? "border-primary" : "border-border"}`}>
                  <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                    <Play className="h-6 w-6 text-primary fill-primary" />
                  </div>
                  <Badge className="absolute top-1 right-1 text-[9px] px-1">VIDEO</Badge>
                </button>
              )}
              {showVideo && (
                <button onClick={() => setShowVideo(false)}
                  className="aspect-square rounded-lg border-2 border-border bg-muted flex items-center justify-center">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Badge className="category-product text-xs px-3 py-1">📦 Product</Badge>
              {product.status === "active" && <Badge className="status-active text-xs px-3 py-1">✅ In Stock</Badge>}
            </div>

            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">{displayName}</h1>
              <div className="flex items-center gap-1.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`h-5 w-5 ${s <= Math.round(product.rating ?? 0) ? "fill-primary text-primary" : "text-muted"}`} />
                ))}
                <span className="font-bold ml-2">{(product.rating ?? 0).toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({product.review_count ?? 0} reviews)</span>
              </div>
            </div>

            <Link to={`/store/${storeName}`}
              className="inline-flex items-center gap-2 text-sm p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
              <div className="h-8 w-8 rounded-full bg-gradient-profit flex items-center justify-center text-white font-bold">
                {storeName[0] ?? "S"}
              </div>
              <div className="flex-1">
                <p className="font-medium group-hover:text-primary">{storeName}</p>
                {storeVerified && (
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified Seller
                  </div>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </Link>

            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-primary">{formatNaira(displayPrice)}</span>
                {product.original_price && (
                  <span className="text-xl text-muted-foreground line-through">{formatNaira(product.original_price)}</span>
                )}
              </div>
              {product.original_price && (
                <Badge className="bg-gradient-to-r from-sale-dark to-sale text-white border-0">
                  💰 Save {formatNaira(product.original_price - displayPrice)}
                </Badge>
              )}
            </Card>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: TrendingUp, value: product.sales_count ?? 0, label: "Sold" },
                { icon: Users, value: product.review_count ?? 0, label: "Reviews" },
                { icon: Award, value: (product.rating ?? 0).toFixed(1), label: "Rating" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                    <Icon className="h-4 w-4" />
                    <span className="text-2xl font-bold">{value}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-primary/20 rounded-xl bg-muted/20">
                  <Button variant="ghost" size="icon" className="h-12 w-12" onClick={() => setQty(Math.max(1, qty - 1))}>
                    <Minus className="h-5 w-5 text-primary" />
                  </Button>
                  <span className="w-16 text-center text-lg font-bold">{qty}</span>
                  <Button variant="ghost" size="icon" className="h-12 w-12" onClick={() => setQty(qty + 1)}>
                    <Plus className="h-5 w-5 text-primary" />
                  </Button>
                </div>
                {product.inventory_count > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 inline mr-1" />
                    <span className="font-medium">Only {product.inventory_count} left!</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={handleBuyNow} className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary-600">
                <Zap className="h-6 w-6 mr-2" /> Buy Now — {formatNaira(displayPrice * qty)}
              </Button>
              <Button onClick={handleAddToCart} className="w-full btn-profit h-14 text-lg font-semibold">
                <ShoppingCart className="h-6 w-6 mr-2" /> Add to Cart — {formatNaira(displayPrice * qty)}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-12" onClick={handleWishlist}>
                  <Heart className="h-5 w-5 mr-2" /> Save
                </Button>
                <Button variant="outline" className="h-12" onClick={handleShare}>
                  <Share2 className="h-5 w-5 mr-2" /> Share
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t">
              {[
                { icon: Truck, label: "Fast Delivery", detail: "2-5 days" },
                { icon: Shield, label: "Secure Payment", detail: "100% Safe" },
                { icon: RotateCcw, label: "Easy Returns", detail: "7 days" },
              ].map(({ icon: Icon, label, detail }) => (
                <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 text-center">
                  <div className="p-2 bg-primary/10 rounded-full"><Icon className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-xs font-bold">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="w-full justify-start bg-muted/50 p-1">
            <TabsTrigger value="description" className="data-[state=active]:bg-gradient-profit data-[state=active]:text-white">Description</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-gradient-profit data-[state=active]:text-white">
              Reviews ({product.review_count ?? allReviews.length})
            </TabsTrigger>
            <TabsTrigger value="shipping" className="data-[state=active]:bg-gradient-profit data-[state=active]:text-white">Shipping</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Product Description
              </h3>
              <p className="text-muted-foreground leading-relaxed">{displayDescription}</p>
              {Object.keys(product.specifications ?? {}).length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold text-sm">Specifications</h4>
                  {Object.entries(product.specifications ?? {}).map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-sm">
                      <span className="text-muted-foreground w-32 shrink-0">{k}</span>
                      <span>{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              {(canReview || !authState.isAuthenticated) && (
                <ReviewForm productId={product.id} onSubmit={handleReviewSubmit} />
              )}
              {allReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No reviews yet. Be the first!</p>
              ) : allReviews.map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {review.author_avatar
                      ? <img src={review.author_avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                      : <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {(review.author_name ?? "A")[0].toUpperCase()}
                        </div>
                    }
                    <div className="flex-1">
                      <p className="text-sm font-medium">{review.author_name ?? "Anonymous"}</p>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={`h-3 w-3 ${s <= review.rating ? "fill-primary text-primary" : "text-muted"}`} />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                  {review.seller_reply && (
                    <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs font-semibold text-primary mb-1">Seller reply · {review.seller_reply.seller_name}</p>
                      <p className="text-xs text-muted-foreground">{review.seller_reply.message}</p>
                    </div>
                  )}
                  {isSeller && !review.seller_reply && (
                    <SellerReplyForm reviewId={review.id} onReply={handleSellerReply} />
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="mt-6">
            <Card className="p-6 space-y-4">
              {[
                { icon: Truck, title: "Delivery", desc: "Standard delivery 2-5 business days. Express available at checkout." },
                { icon: RotateCcw, title: "Returns", desc: "7-day return policy. Item must be unused and in original packaging." },
                { icon: Shield, title: "Buyer Protection", desc: "Your payment is protected until you confirm receipt of your order." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg h-fit"><Icon className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
