import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, MapPin, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile, uploadAvatar } from "@/lib/profileService";

export default function SellerProfileSettings() {
  const { state, updateProfile: updateAuthProfile } = useAuth();
  const user = state.currentUser;
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [form, setForm] = useState({
    name: user?.name ?? "",
    businessName: user?.businessName ?? "",
    bio: user?.bio ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
    city: user?.city ?? "",
    state: user?.state ?? "",
    avatar: user?.avatar ?? "",
  });

  // Sync if user changes
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        businessName: user.businessName ?? "",
        bio: user.bio ?? "",
        phone: user.phone ?? "",
        address: user.address ?? "",
        city: user.city ?? "",
        state: user.state ?? "",
        avatar: user.avatar ?? "",
      });
    }
  }, [user?.id]);

  if (!user) return null;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Logo must be under 2MB", variant: "destructive" });
      return;
    }
    setUploadingLogo(true);
    const { url, error } = await uploadAvatar(user.id, file);
    setUploadingLogo(false);
    if (error) {
      // Fallback: use local data URL for preview
      const reader = new FileReader();
      reader.onloadend = () => setForm((f) => ({ ...f, avatar: reader.result as string }));
      reader.readAsDataURL(file);
      toast({ title: "Storage unavailable", description: "Logo saved locally for now.", variant: "destructive" });
    } else if (url) {
      setForm((f) => ({ ...f, avatar: url }));
      toast({ title: "Logo uploaded" });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile(user.id, {
      full_name: form.name,
      business_name: form.businessName || null,
      bio: form.bio || null,
      phone: form.phone || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      avatar_url: form.avatar || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error, variant: "destructive" });
    } else {
      // Keep local state in sync
      await updateAuthProfile({
        name: form.name,
        businessName: form.businessName,
        bio: form.bio,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        avatar: form.avatar,
      });
      toast({ title: "Profile saved", description: "Your changes have been saved." });
    }
  };

  const field = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile / Business Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div
              className="h-20 w-20 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingLogo ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : form.avatar ? (
                <img src={form.avatar} alt="Logo" className="h-full w-full object-cover rounded-xl" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingLogo}>
                <Upload className="h-4 w-4 mr-1" /> Upload Logo
              </Button>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoUpload} />
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.name} onChange={(e) => field("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input value={form.businessName} onChange={(e) => field("businessName", e.target.value)} placeholder="Your business name" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bio / Description</Label>
            <Textarea value={form.bio} onChange={(e) => field("bio", e.target.value)} rows={3} placeholder="Tell customers about your business..." />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => field("phone", e.target.value)} placeholder="+234 800 000 0000" />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => field("city", e.target.value)} placeholder="Lagos" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => field("state", e.target.value)} placeholder="Lagos State" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Address</Label>
              <Input value={form.address} onChange={(e) => field("address", e.target.value)} placeholder="Street address" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            {user.isPro && <Badge className="badge-verified">✓ Verified Vendor</Badge>}
          </div>
        </CardContent>
      </Card>

      <Button className="btn-profit" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
        Save Changes
      </Button>
    </div>
  );
}
