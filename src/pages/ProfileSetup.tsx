import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfileSetup() {
  const { state, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = state.currentUser;

  // Use userType from navigation state (passed from Signup) as the source of truth
  // since the profile row may not be fully created yet
  const registeredUserType = (location.state as any)?.userType ?? user?.userType ?? "buyer";

  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
  });

  if (!state.isAuthenticated || !user) {
    navigate("/login");
    return null;
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm((f) => ({ ...f, avatar: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const dest = registeredUserType === "seller" || registeredUserType === "both"
    ? "/seller/dashboard"
    : "/buyer/dashboard";

  const handleSave = async () => {
    await updateProfile(form);
    toast({ title: "Profile saved!", description: "Your profile has been updated." });
    navigate(dest);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-profit">
            <span className="text-lg font-bold text-white">R</span>
          </div>
          <span className="text-xl font-bold">Riba Market</span>
        </div>

        <Card className="border-0 shadow-none">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl">Set up your profile</CardTitle>
            <CardDescription>Complete your profile to get started on Riba Market</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-16 w-16 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors overflow-hidden border-2 border-dashed border-primary/30"
              >
                {form.avatar ? (
                  <img src={form.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <Upload className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Profile Photo</p>
                <p className="text-xs text-muted-foreground">Click to upload</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            <div className="space-y-2">
              <Label>Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your display name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+234 800 000 0000"
              />
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 btn-profit" onClick={handleSave}>
                Save & Continue
              </Button>
              <Button variant="outline" onClick={() => navigate(dest)}>
                Skip
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
