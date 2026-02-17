import { useParams } from "react-router-dom";
import { useState } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { useLocalCache } from "@/hooks/useLocalCache";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { type SellerProfile } from "@/components/seller/SellerProfileSettings";
import { type SellerCatalogue, CATALOGUE_CATEGORY_LABELS, CATALOGUE_CATEGORY_COLORS } from "@/data/storeTypes";
import { BadgeCheck, Star, Share2, MapPin, Users, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StoreProfileAbout from "@/components/store/StoreProfileAbout";
import StoreProfileReviews from "@/components/store/StoreProfileReviews";
import StoreProfilePolicies from "@/components/store/StoreProfilePolicies";
import StoreProfileStoreTab from "@/components/store/StoreProfileStoreTab";

export default function StoreProfile() {
  const { storeName } = useParams();
  const { state: authState, followSeller, unfollowSeller } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(
    authState.currentUser?.followedSellers.includes(`seller-${storeName}`) || false
  );
  const { data: sellerProfile } = useLocalCache<SellerProfile>("riba_seller_profile", {
    businessName: "TechHub NG", description: "Your one-stop shop for quality electronics and gadgets in Nigeria.", email: "", phone: "+234 801 234 5678",
    logoUrl: null, googleMapsLink: "", isPro: false, hideSoldCount: false,
  });
  const { data: catalogues } = useLocalCache<SellerCatalogue[]>("riba_seller_catalogues", []);

  const totalSold = 552;
  const store = {
    name: storeName || sellerProfile.businessName,
    verified: true,
    rating: 4.7,
    reviewCount: 312,
    followers: 1240,
    description: sellerProfile.description,
    location: "Ikeja, Lagos",
    hours: "Mon-Sat: 9AM - 6PM",
    phone: sellerProfile.phone,
    logoUrl: sellerProfile.logoUrl,
    googleMapsLink: sellerProfile.googleMapsLink,
  };

  const handleFollowToggle = () => {
    if (!authState.isAuthenticated) {
      toast({ title: "Error", description: "Please log in to follow this seller", variant: "destructive" });
      return;
    }

    const sellerId = `seller-${storeName}`;
    if (isFollowing) {
      unfollowSeller(sellerId);
      setIsFollowing(false);
      toast({ title: "Success", description: `Unfollowed ${store.name}` });
    } else {
      followSeller(sellerId);
      setIsFollowing(true);
      toast({ title: "Success", description: `Now following ${store.name}` });
    }
  };

  const handleShareStore = () => {
    const urlToShare = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Check out ${store.name} on Riba Market`,
        text: store.description,
        url: urlToShare,
      }).catch((err) => console.log("Error sharing:", err));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(urlToShare);
      toast({ title: "Success", description: "Store link copied to clipboard! You can now share it." });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Store Header */}
        <div className="border-b bg-card">
          <div className="container py-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-20 w-20 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-gradient-profit flex items-center justify-center text-3xl font-bold text-white shrink-0">
                  {store.name[0]}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{store.name}</h1>
                  {store.verified && <BadgeCheck className="h-6 w-6 text-primary" />}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                  {catalogues.length > 0 && catalogues.map((c) => (
                    <Badge key={c.id} variant="secondary" className={`text-xs ${CATALOGUE_CATEGORY_COLORS[c.category]}`}>
                      {CATALOGUE_CATEGORY_LABELS[c.category]}
                    </Badge>
                  ))}
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    {store.rating} ({store.reviewCount} reviews)
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> {store.followers} followers
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {store.location}
                  </span>
                  {!sellerProfile.hideSoldCount && (
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="h-4 w-4" /> {totalSold} sold
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground max-w-xl">{store.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button 
                  onClick={handleFollowToggle}
                  className={isFollowing ? "btn-success" : "btn-profit"}
                  variant={isFollowing ? "default" : "default"}
                >
                  {isFollowing ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Following
                    </>
                  ) : (
                    "Follow"
                  )}
                </Button>
                <Button 
                  onClick={handleShareStore}
                  variant="outline" 
                  size="icon"
                  title="Share this store"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="container py-6">
          <Tabs defaultValue={catalogues.length > 0 ? catalogues[0].id : "all"}>
            <TabsList className="flex-wrap h-auto gap-1">
              {catalogues.length === 0 && <TabsTrigger value="all">All Products</TabsTrigger>}
              {catalogues.map((c) => (
                <TabsTrigger key={c.id} value={c.id}>
                  {c.name}
                </TabsTrigger>
              ))}
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
            </TabsList>

            {catalogues.length === 0 && (
              <TabsContent value="all">
                <StoreProfileStoreTab storeName={store.name} />
              </TabsContent>
            )}
            {catalogues.map((c) => (
              <TabsContent key={c.id} value={c.id}>
                <StoreProfileStoreTab storeName={store.name} storeId={c.id} storeType={c.category} />
              </TabsContent>
            ))}

            <TabsContent value="about" className="mt-6 max-w-2xl">
              <StoreProfileAbout store={store} />
            </TabsContent>
            <TabsContent value="reviews" className="mt-6 max-w-2xl">
              <StoreProfileReviews rating={store.rating} reviewCount={store.reviewCount} />
            </TabsContent>
            <TabsContent value="policies" className="mt-6 max-w-2xl">
              <StoreProfilePolicies />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
