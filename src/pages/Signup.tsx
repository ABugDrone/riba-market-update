import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type UserType = "buyer" | "seller" | "both";

const userTypes: { value: UserType; label: string; description: string; icon: React.ReactNode }[] = [
  { value: "buyer", label: "Buyer", description: "Shop from vendors", icon: <User className="h-5 w-5" /> },
  { value: "seller", label: "Seller", description: "Sell your products", icon: <Briefcase className="h-5 w-5" /> },
  { value: "both", label: "Both", description: "Buy & sell", icon: <span className="text-lg">🔄</span> },
];

function getStrength(password: string): number {
  let s = 0;
  if (password.length >= 8) s++;
  if (/[A-Z]/.test(password)) s++;
  if (/[0-9]/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  return s;
}

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<UserType>("buyer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const strength = getStrength(password);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await register({
      email,
      password,
      name,
      phone,
      userType,
      businessName: userType !== "buyer" ? businessName : undefined,
      followedSellers: [],
      purchasedProductIds: [],
      isPro: false,
    });
    setLoading(false);
    if (result.success) {
      toast({ title: "Account created!", description: "Let's set up your profile." });
      navigate("/profile-setup", { state: { userType } });
    } else {
      toast({ title: "Registration failed", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-profit">
              <span className="text-lg font-bold text-white">R</span>
            </div>
            <span className="text-xl font-bold">Riba Market</span>
          </Link>

          <Card className="border-0 shadow-none">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>Join Riba Market and start your journey</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* User Type */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {userTypes.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setUserType(t.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors text-sm ${
                      userType === t.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    {t.icon}
                    <span className="font-medium">{t.label}</span>
                    <span className="text-[10px] text-muted-foreground">{t.description}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="name" placeholder="John Doe" className="pl-10" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" type="tel" placeholder="+234 800 000 0000" className="pl-10" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                </div>

                {(userType === "seller" || userType === "both") && (
                  <div className="space-y-2">
                    <Label htmlFor="business">Business Name</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="business" placeholder="Your business name" className="pl-10" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                    </div>
                    <p className="text-xs text-muted-foreground">Leave blank to auto-generate from your name</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            strength >= level
                              ? level <= 1 ? "bg-destructive" : level <= 2 ? "bg-sale" : "bg-primary"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox id="terms" className="mt-0.5" />
                  <Label htmlFor="terms" className="text-sm font-normal leading-snug">
                    I agree to the{" "}
                    <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                  </Label>
                </div>
                <Button type="submit" className="w-full btn-profit" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">or</span>
                <Separator className="flex-1" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">Google</Button>
                <Button variant="outline" className="w-full">Facebook</Button>
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Promo */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 p-12">
        <div className="max-w-md text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Start Your Profit Journey</h2>
          <p className="text-primary-100 text-lg mb-8">
            Whether you're buying or selling, Riba Market has everything you need.
          </p>
          <ul className="text-left space-y-3 text-primary-100">
            <li className="flex items-center gap-3">✅ Free to create an account</li>
            <li className="flex items-center gap-3">✅ Sell across Nigeria</li>
            <li className="flex items-center gap-3">✅ Secure payments with Flutterwave</li>
            <li className="flex items-center gap-3">✅ 24/7 customer support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
