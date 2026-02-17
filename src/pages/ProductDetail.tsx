import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { ProductCard } from "@/components/landing/ProductCard";
import { ReviewForm } from "@/components/ReviewForm";
import { SellerReplyForm } from "@/components/SellerReplyForm";
import { allProducts } from "@/data/mockExtended";
import { mockReviews } from "@/data/mockExtended";
import { formatNaira } from "@/data/mock";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, ShoppingCart, Heart, Share2, BadgeCheck, Minus, Plus, 
  Truck, Shield, RotateCcw, ThumbsUp, ChevronRight, Video, 
  Play, Sparkles, TrendingUp, Users, Award, Clock, Package, Zap, MessageSquare
} from "lucide-react";
import { useState, useEffect } from "react";
import { type CatalogueItem } from "@/components/seller/CatalogueManager";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const product = allProducts.find((p) => p.id === id) || allProducts[0];
  const related = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [catalogueProduct, setCatalogueProduct] = useState<CatalogueItem | null>(null);
  const [reviews, setReviews] = useState(productReviews);

  // Load product data from localStorage if it's a catalogue product
  useEffect(() => {
    if (id?.startsWith("product-")) {
      // Try to find the product in all catalogues
      const catalogueKeys = Object.keys(localStorage).filter(key => key.startsWith("riba_catalogue_"));
      for (const key of catalogueKeys) {
        try {
          const items: CatalogueItem[] = JSON.parse(localStorage.getItem(key) || "[]");
          const found = items.find(item => item.id === id);
          if (found) {
            setCatalogueProduct(found);
            // Auto-play video if it exists
            if (found.video) {
              setShowVideo(true);
            }
            break;
          }
        } catch (e) {
          console.error("Error loading catalogue:", e);
        }
      }
    }
  }, [id]);

  const displayImages = catalogueProduct?.images || [product.image, product.image, product.image];
  const displayName = catalogueProduct?.name || product.name;
  const displayPrice = catalogueProduct?.price || product.price;
  const displayDescription = catalogueProduct?.description || 
    `Experience the best of quality with ${displayName} from ${product.storeName}. This product has been carefully selected and verified to ensure you get the best value for your money.`;
  const hasVideo = !!catalogueProduct?.video;

  const handleBuyNow = () => {
    // Store product details for direct checkout
    const quickCheckoutData = {
      items: [{
        productId: product.id,
        name: displayName,
        price: displayPrice,
        quantity: qty,
        image: displayImages[0],
        storeName: product.storeName,
      }],
      isQuickCheckout: true,
    };
    localStorage.setItem("quickCheckoutData", JSON.stringify(quickCheckoutData));
    navigate("/payment");
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    alert(`Added ${qty} item(s) to cart`);
  };

  const handleShareProduct = () => {
    const urlToShare = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Check out ${displayName} on Riba Market`,
        text: displayDescription,
        url: urlToShare,
      }).catch((err) => console.log("Error sharing:", err));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(urlToShare);
      toast({ title: "Success", description: "Product link copied to clipboard! You can now share it." });
    }
  };

  const canReview = authState.isAuthenticated && 
    authState.currentUser?.userType === "buyer" && 
    authState.currentUser?.purchasedProductIds.includes(product.id);

  const productReviews = mockReviews.filter(r => r.productId === product.id);

  const handleReviewSubmit = (newReview: any) => {
    setReviews([newReview, ...reviews]);
  };

  const handleSellerReply = (reviewId: string, reply: any) => {
    setReviews(
      reviews.map((r) =>
        r.id === reviewId ? { ...r, sellerReply: reply } : r
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{displayName}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Images/Video Section */}
          <div className="space-y-4">
            {/* Main Display - Video or Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-border shadow-lg hover:shadow-xl transition-shadow duration-300 group">
              {hasVideo && catalogueProduct?.video && showVideo ? (
                // Auto-playing video
                <div className="absolute inset-0 w-full h-full bg-black">
                  <iframe
                    src={catalogueProduct.video.embedUrl}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Product demo video"
                  />
                </div>
              ) : (
                // Image display
                <>
                  <img 
                    src={displayImages[selectedImage]} 
                    alt={displayName} 
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  {product.badge === "sale" && product.discountPercent && (
                    <div className="absolute top-4 right-4 bg-gradient-to-br from-sale-dark to-sale text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse-green">
                      SAVE {product.discountPercent}%
                    </div>
                  )}
                  {product.badge === "new" && (
                    <Badge className="absolute top-4 left-4 bg-gradient-profit text-white px-3 py-1.5 text-sm shadow-lg">
                      <Sparkles className="h-3.5 w-3.5 mr-1" /> NEW ARRIVAL
                    </Badge>
                  )}
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="rounded-full shadow-lg">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="rounded-full shadow-lg" onClick={handleShareProduct}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-4 gap-2">
              {/* Show thumbnails only when video is not playing, or add image thumbnails */}
              {!showVideo && displayImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-lg border-2 overflow-hidden transition-all duration-300 hover:scale-105 ${
                    selectedImage === i 
                      ? "border-primary shadow-lg ring-2 ring-primary/20" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
              {/* Video thumbnail button */}
              {hasVideo && catalogueProduct?.video && (
                <button
                  onClick={() => setShowVideo(true)}
                  className={`aspect-square rounded-lg border-2 overflow-hidden transition-all duration-300 hover:scale-105 relative group ${
                    showVideo
                      ? "border-primary shadow-lg ring-2 ring-primary/20" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {catalogueProduct.video.thumbnail ? (
                    <img src={catalogueProduct.video.thumbnail} alt="Video" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Play className="h-4 w-4 text-white fill-white" />
                  </div>
                </button>
              )}
              {/* Back to images button when video is playing */}
              {showVideo && (
                <button
                  onClick={() => setShowVideo(false)}
                  className="aspect-square rounded-lg border-2 border-border overflow-hidden transition-all duration-300 hover:scale-105 hover:border-primary/50 bg-muted flex items-center justify-center group"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Package className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Images</span>
                  </div>
                </button>
              )}
            </div>

            {/* Video Info Badge - Shows when video exists */}
            {hasVideo && catalogueProduct?.video && (
              <Card className="overflow-hidden border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">Product Demo Video</h3>
                    <p className="text-xs text-muted-foreground">Click on video thumbnail to watch</p>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 shrink-0">
                    {catalogueProduct.video.platform}
                  </Badge>
                </div>
              </Card>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div className="flex items-center gap-2">
              <Badge className={`text-xs font-medium px-3 py-1 ${
                product.storeType === "restaurant" ? "category-restaurant" :
                product.storeType === "product" ? "category-product" : "category-service"
              }`}>
                {product.storeType === "restaurant" ? "🍽️ Restaurant" : product.storeType === "product" ? "📦 Product" : "⚡ Service"}
              </Badge>
              {product.inStock && (
                <Badge className="status-active text-xs px-3 py-1">
                  ✅ In Stock
                </Badge>
              )}
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {displayName}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={`h-5 w-5 ${s <= Math.round(product.rating) ? "fill-primary text-primary" : "text-muted"}`} 
                    />
                  ))}
                  <span className="text-base font-bold ml-2">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Store Info */}
            <Link 
              to={`/store/${product.storeName}`} 
              className="inline-flex items-center gap-2 text-sm p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-profit flex items-center justify-center text-white font-bold">
                {product.storeName[0]}
              </div>
              <div className="flex-1">
                <p className="font-medium group-hover:text-primary transition-colors">{product.storeName}</p>
                {product.storeVerified && (
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified Seller
                  </div>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            {/* Price Section */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-primary">{formatNaira(displayPrice)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">{formatNaira(product.originalPrice)}</span>
                )}
              </div>
              {product.originalPrice && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-sale-dark to-sale text-white border-0">
                    💰 Save {formatNaira(product.originalPrice - displayPrice)}
                  </Badge>
                  <span className="text-sm text-primary font-semibold">
                    ({product.discountPercent}% OFF)
                  </span>
                </div>
              )}
            </Card>

            {/* Social Proof */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-1 text-primary mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-2xl font-bold">{product.sales || 127}</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Sold</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-1 text-primary mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-2xl font-bold">{product.reviewCount}</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Reviews</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-1 text-primary mb-1">
                  <Award className="h-4 w-4" />
                  <span className="text-2xl font-bold">{product.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Rating</p>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-primary/20 rounded-xl bg-muted/20">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-12 w-12 hover:bg-primary/10" 
                    onClick={() => setQty(Math.max(1, qty - 1))}
                  >
                    <Minus className="h-5 w-5 text-primary" />
                  </Button>
                  <span className="w-16 text-center text-lg font-bold">{qty}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-12 w-12 hover:bg-primary/10" 
                    onClick={() => setQty(qty + 1)}
                  >
                    <Plus className="h-5 w-5 text-primary" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  <span className="font-medium">Only {Math.floor(Math.random() * 10) + 3} left!</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleBuyNow}
                className="w-full bg-gradient-to-r from-primary to-primary-600 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all group"
              >
                <Zap className="h-6 w-6 mr-2" /> 
                Buy Now - {formatNaira(displayPrice * qty)}
              </Button>
              <Button 
                onClick={handleAddToCart}
                className="w-full btn-profit h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all group"
              >
                <ShoppingCart className="h-6 w-6 mr-2 group-hover:animate-bounce" /> 
                Add to Cart - {formatNaira(displayPrice * qty)}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-12 border-2 border-primary/20 hover:bg-primary/10 hover:border-primary">
                  <Heart className="h-5 w-5 mr-2" /> 
                  Save for Later
                </Button>
                <Button variant="outline" className="h-12 border-2 border-border hover:bg-muted" onClick={handleShareProduct}>
                  <Share2 className="h-5 w-5 mr-2" /> 
                  Share
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t">
              {[
                { icon: Truck, label: "Fast Delivery", detail: "2-5 days" },
                { icon: Shield, label: "Secure Payment", detail: "100% Safe" },
                { icon: RotateCcw, label: "Easy Returns", detail: "7 days" },
              ].map(({ icon: Icon, label, detail }) => (
                <div 
                  key={label} 
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 text-center hover:shadow-md transition-all hover:scale-105"
                >
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Urgency Banner */}
            <Card className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">🔥 Limited Stock Alert!</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.floor(Math.random() * 50) + 10} people are viewing this right now
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="w-full justify-start bg-muted/50 p-1">
            <TabsTrigger value="description" className="data-[state=active]:bg-gradient-profit data-[state=active]:text-white">
              Description
            </TabsTrigger>
            <TabsTrigger value="specs" className="data-[state=active]:bg-gradient-profit data-[state=active]:text-white">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-gradient-profit data-[state=active]:text-white">
              Reviews ({product.reviewCount})
            </TabsTrigger>
            <TabsTrigger value="shipping" className="data-[state=active]:bg-gradient-profit data-[state=active]:text-white">
              Shipping & Returns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Product Description
              </h3>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-muted-foreground leading-relaxed text-base">
                  {displayDescription}
                </p>
                {!catalogueProduct && (
                  <p className="text-muted-foreground leading-relaxed text-base mt-4">
                    With {product.reviewCount} verified reviews and a {product.rating}-star rating, you can trust that you're making a great purchase. 
                    Our vendors are committed to delivering excellence, and this item is no exception.
                  </p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="specs" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Product Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ["Category", product.category], 
                  ["Store", product.storeName], 
                  ["Rating", `${product.rating}/5 ⭐`], 
                  ["Total Reviews", String(product.reviewCount)],
                  ["Availability", product.inStock ? "✅ In Stock" : "❌ Out of Stock"],
                  ["Condition", "Brand New"],
                  ["Warranty", "6 Months"],
                  ["Delivery", "2-5 Business Days"]
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border">
                    <span className="text-sm text-muted-foreground font-medium">{k}</span>
                    <span className="text-sm font-bold">{v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {/* Review Form */}
              <ReviewForm productId={product.id} onReviewSubmit={handleReviewSubmit} />

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                  </Card>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id} className="p-5 hover:shadow-lg transition-shadow">
                      {/* Review Header */}
                      <div className="flex items-start gap-4 mb-3">
                        <img src={review.avatar} alt={review.author} className="h-12 w-12 rounded-full border-2 border-primary/20" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold">{review.author}</p>
                            {review.location && (
                              <span className="text-xs text-muted-foreground">from {review.location}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-0.5">
                              {[1,2,3,4,5].map((s) => (
                                <Star key={s} className={`h-4 w-4 ${s <= review.rating ? "fill-primary text-primary" : "text-muted"}`} />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">• {review.date}</span>
                            <Badge variant="secondary" className="text-[10px]">Verified Purchase</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Review Comment */}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{review.comment}</p>
                      <Button variant="ghost" size="sm" className="text-xs hover:bg-primary/10">
                        <ThumbsUp className="h-3 w-3 mr-1.5" /> Helpful ({review.helpful})
                      </Button>

                      {/* Seller Reply - Display */}
                      {review.sellerReply && (
                        <div className="mt-4 pt-4 border-t border-border space-y-3">
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-primary text-primary-foreground text-[10px]">Seller</Badge>
                                <p className="font-semibold text-sm">{review.sellerReply.sellerName}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{review.sellerReply.date}</p>
                              <p className="text-sm mt-2">{review.sellerReply.message}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Seller Reply Form - For Sellers Only */}
                      {!review.sellerReply && (
                        <SellerReplyForm
                          reviewId={review.id}
                          onReplySubmit={(reply) => handleSellerReply(review.id, reply)}
                        />
                      )}
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="mt-6">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" /> Delivery Information
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Standard delivery takes 2-5 business days within Lagos and 5-10 business days outside Lagos. 
                    Express delivery available for an additional fee.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <RotateCcw className="h-5 w-5 text-primary" /> Returns Policy
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Items can be returned within 7 days of delivery. Items must be unused and in original packaging. 
                    Return shipping costs are covered by the seller.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" /> Refunds
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Refunds are processed within 3-5 business days after the returned item is received and inspected. 
                    Money will be credited back to your original payment method.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                You May Also Like
              </h2>
              <Link to="/products" className="text-sm text-primary hover:underline font-medium">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
