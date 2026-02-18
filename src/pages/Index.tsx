import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedProducts } from "@/components/landing/FeaturedProducts";
import { CategoriesGrid } from "@/components/landing/CategoriesGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TrustIndicators } from "@/components/landing/TrustIndicators";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main>
        <HeroSection />
        <FeaturedProducts />
        <CategoriesGrid />
        <HowItWorks />
        <TrustIndicators />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
