import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus, BookOpen, Trash2, Package, Wrench, UtensilsCrossed, Shirt,
  X, Save, Edit, Copy, Eye, EyeOff, Palette, Settings2,
  Share2, Link2, Search, MoreVertical, Globe, BarChart3, Loader2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  getSellerStores, createStore, updateStore, deleteStore, uploadStoreLogo,
  type SellerStore, type StoreType,
} from "@/lib/storeService";
import { CATALOGUE_CATEGORIES, CATALOGUE_CATEGORY_LABELS, CATALOGUE_CATEGORY_COLORS } from "@/data/storeTypes";
import type { CatalogueCategory } from "@/data/storeTypes";
import CatalogueManager from "./CatalogueManager";

const categoryIcons: Record<CatalogueCategory, React.ReactNode> = {
  products: <Package className="h-5 w-5" />,
  services: <Wrench className="h-5 w-5" />,
  "food-drinks": <UtensilsCrossed className="h-5 w-5" />,
  fashion: <Shirt className="h-5 w-5" />,
};

const BANNER_COLORS = [
  { label: "Default", value: "" },
  { label: "Blue", value: "bg-blue-600" },
  { label: "Green", value: "bg-emerald-600" },
  { label: "Purple", value: "bg-purple-600" },
  { label: "Orange", value: "bg-orange-500" },
  { label: "Rose", value: "bg-rose-600" },
  { label: "Teal", value: "bg-teal-600" },
  { label: "Indigo", value: "bg-indigo-600" },
];

const emptyForm = {
  store_name: "",
  store_type: "" as StoreType | "",
  description: "",
  welcome_message: "",
  banner_color: "",
  is_public: true,
  google_maps_link: "",
};

interface StoreManagerProps {
  selectedCatalogueId?: string;
  onSelectCatalogue?: (id: string) => void;
}

export default function StoreManager({ selectedCatalogueId, onSelectCatalogue }: StoreManagerProps) {
  const { state } = useAuth();
  const user = state.currentUser;
  const { toast } = useToast();

  const [stores, setStores] = useState<SellerStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  // ── Load stores ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getSellerStores(user.id).then((data) => {
      setStores(data);
      setLoading(false);
    });
  }, [user?.id]);

  const filteredStores = useMemo(() => {
    if (!searchQuery) return stores;
    const q = searchQuery.toLowerCase();
    return stores.filter((s) =>
      s.store_name.toLowerCase().includes(q) ||
      s.store_type.toLowerCase().includes(q)
    );
  }, [stores, searchQuery]);

  const publicStores = stores.filter((s) => s.is_public).length;

  // ── Create ───────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.store_name || !form.store_type || !user) {
      toast({ title: "Missing fields", description: "Store name and type are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { store, error } = await createStore({
      profile_id: user.id,
      store_name: form.store_name,
      store_type: form.store_type as StoreType,
      description: form.description || null,
      welcome_message: form.welcome_message || null,
      banner_color: form.banner_color || null,
      google_maps_link: form.google_maps_link || null,
      is_public: form.is_public,
      is_active: true,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else if (store) {
      setStores((prev) => [store, ...prev]);
      setForm(emptyForm);
      setCreateOpen(false);
      toast({ title: "Store created", description: `"${store.store_name}" has been added.` });
      onSelectCatalogue?.(store.id);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const handleEdit = async () => {
    if (!form.store_name || !form.store_type || !editingId) return;
    setSaving(true);
    const { error } = await updateStore(editingId, {
      store_name: form.store_name,
      store_type: form.store_type as StoreType,
      description: form.description || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else {
      setStores((prev) => prev.map((s) => s.id === editingId ? { ...s, store_name: form.store_name, store_type: form.store_type as StoreType, description: form.description || null } : s));
      setEditOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast({ title: "Store updated" });
    }
  };

  // ── Customize ────────────────────────────────────────────────────────────────
  const handleCustomizeSave = async () => {
    if (!editingId) return;
    setSaving(true);
    const { error } = await updateStore(editingId, {
      welcome_message: form.welcome_message || null,
      banner_color: form.banner_color || null,
      is_public: form.is_public,
      google_maps_link: form.google_maps_link || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else {
      setStores((prev) => prev.map((s) => s.id === editingId ? { ...s, welcome_message: form.welcome_message || null, banner_color: form.banner_color || null, is_public: form.is_public, google_maps_link: form.google_maps_link || null } : s));
      setCustomizeOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast({ title: "Customization saved" });
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const { error } = await deleteStore(id);
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else {
      setStores((prev) => prev.filter((s) => s.id !== id));
      if (selectedCatalogueId === id) onSelectCatalogue?.("");
      setDeleteConfirmId(null);
      toast({ title: "Store deleted" });
    }
  };

  // ── Toggle visibility ────────────────────────────────────────────────────────
  const toggleVisibility = async (store: SellerStore) => {
    const newVal = !store.is_public;
    const { error } = await updateStore(store.id, { is_public: newVal });
    if (!error) {
      setStores((prev) => prev.map((s) => s.id === store.id ? { ...s, is_public: newVal } : s));
      toast({ title: newVal ? "Store is now public" : "Store is now hidden" });
    }
  };

  const openEdit = (s: SellerStore) => {
    setEditingId(s.id);
    setForm({ store_name: s.store_name, store_type: s.store_type, description: s.description ?? "", welcome_message: s.welcome_message ?? "", banner_color: s.banner_color ?? "", is_public: s.is_public, google_maps_link: s.google_maps_link ?? "" });
    setEditOpen(true);
  };

  const openCustomize = (s: SellerStore) => {
    setEditingId(s.id);
    setForm({ store_name: s.store_name, store_type: s.store_type, description: s.description ?? "", welcome_message: s.welcome_message ?? "", banner_color: s.banner_color ?? "", is_public: s.is_public, google_maps_link: s.google_maps_link ?? "" });
    setCustomizeOpen(true);
  };

  const getStoreLink = (id: string) => `${origin}/catalogue/${id}`;
  const copyLink = (id: string) => {
    navigator.clipboard.writeText(getStoreLink(id));
    toast({ title: "Link copied!" });
  };

  const currentShareStore = stores.find((s) => s.id === editingId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" className="btn-profit gap-1.5" onClick={() => { setForm(emptyForm); setCreateOpen(true); }}>
              <Plus className="h-4 w-4" /> New Store
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /><strong className="text-foreground">{stores.length}</strong> store{stores.length !== 1 ? "s" : ""}</span>
              <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" /><strong className="text-foreground">{publicStores}</strong> public</span>
            </div>
            <div className="ml-auto relative min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search stores..." className="pl-8 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {stores.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">No stores yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">Create your first store to start selling on Riba Market.</p>
            <Button className="btn-profit" onClick={() => { setForm(emptyForm); setCreateOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Create Your First Store
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {filteredStores.length === 0 && searchQuery && (
            <Card><CardContent className="py-8 text-center"><p className="text-sm text-muted-foreground">No stores match "{searchQuery}"</p></CardContent></Card>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStores.map((store) => {
              const isSelected = selectedCatalogueId === store.id;
              const cat = store.store_type as CatalogueCategory;
              return (
                <Card
                  key={store.id}
                  className={`group cursor-pointer transition-all ${isSelected ? "border-primary ring-2 ring-primary/20 shadow-md" : "hover:border-primary/40 hover:shadow-sm"}`}
                  onClick={() => onSelectCatalogue?.(store.id)}
                >
                  {store.banner_color && <div className={`h-2 rounded-t-lg ${store.banner_color}`} />}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0">{categoryIcons[cat] ?? <Package className="h-5 w-5" />}</div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{store.store_name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge variant="secondary" className={`text-[10px] ${CATALOGUE_CATEGORY_COLORS[cat] ?? ""}`}>
                              {CATALOGUE_CATEGORY_LABELS[cat] ?? store.store_type}
                            </Badge>
                            {store.is_public
                              ? <Badge variant="outline" className="text-[10px] gap-0.5 text-emerald-600"><Globe className="h-2.5 w-2.5" /> Public</Badge>
                              : <Badge variant="outline" className="text-[10px] gap-0.5 text-muted-foreground"><EyeOff className="h-2.5 w-2.5" /> Hidden</Badge>
                            }
                            {store.verification_status === "verified" && <Badge variant="outline" className="text-[10px] text-primary">✓ Verified</Badge>}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => openEdit(store)}><Edit className="h-4 w-4 mr-2" /> Edit Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openCustomize(store)}><Palette className="h-4 w-4 mr-2" /> Customize</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditingId(store.id); setShareOpen(true); }}><Share2 className="h-4 w-4 mr-2" /> Share Link</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleVisibility(store)}>
                            {store.is_public ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                            {store.is_public ? "Make Hidden" : "Make Public"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteConfirmId(store.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {store.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{store.description}</p>}
                    <div className="flex gap-1.5 mt-3 pt-3 border-t">
                      <Button variant="outline" size="sm" className="h-7 text-xs flex-1 gap-1" onClick={(e) => { e.stopPropagation(); onSelectCatalogue?.(store.id); }}>
                        <Package className="h-3 w-3" /> Items
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); copyLink(store.id); }}>
                        <Link2 className="h-3 w-3" /> Link
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); openCustomize(store); }}>
                        <Settings2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {selectedCatalogueId && (
            <div className="mt-6 pt-6 border-t">
              <CatalogueManager catalogueId={selectedCatalogueId} />
            </div>
          )}
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create a New Store</DialogTitle><DialogDescription>Set up a new store to sell on Riba Market.</DialogDescription></DialogHeader>
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="details">Details</TabsTrigger><TabsTrigger value="customize">Customize</TabsTrigger></TabsList>
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="space-y-2"><Label>Store Name *</Label><Input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} placeholder="e.g. TechHub NG" /></div>
              <div className="space-y-2">
                <Label>Store Type *</Label>
                <Select value={form.store_type} onValueChange={(v) => setForm({ ...form, store_type: v as StoreType })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {CATALOGUE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}><span className="flex items-center gap-2">{categoryIcons[cat]}{CATALOGUE_CATEGORY_LABELS[cat]}</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="What do you sell?" /></div>
            </TabsContent>
            <TabsContent value="customize" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Welcome Message</Label>
                <Textarea value={form.welcome_message} onChange={(e) => setForm({ ...form, welcome_message: e.target.value })} rows={2} placeholder="Welcome to my store..." />
              </div>
              <div className="space-y-2">
                <Label>Banner Color</Label>
                <div className="flex flex-wrap gap-2">
                  {BANNER_COLORS.map((color) => (
                    <button key={color.value} className={`h-8 w-8 rounded-full border-2 transition-all ${color.value || "bg-gradient-profit"} ${form.banner_color === color.value ? "ring-2 ring-primary ring-offset-2" : ""}`} onClick={() => setForm({ ...form, banner_color: color.value })} title={color.label} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div><Label>Public Store</Label><p className="text-xs text-muted-foreground">Visible to customers.</p></div>
                <Switch checked={form.is_public} onCheckedChange={(v) => setForm({ ...form, is_public: v })} />
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}><X className="h-4 w-4 mr-1" /> Cancel</Button>
            <Button className="btn-profit" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Create Store
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) { setEditingId(null); setForm(emptyForm); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Store</DialogTitle><DialogDescription>Update your store details.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Store Name *</Label><Input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Store Type *</Label>
              <Select value={form.store_type} onValueChange={(v) => setForm({ ...form, store_type: v as StoreType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATALOGUE_CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat}>{CATALOGUE_CATEGORY_LABELS[cat]}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}><X className="h-4 w-4 mr-1" /> Cancel</Button>
            <Button className="btn-profit" onClick={handleEdit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customize Dialog */}
      <Dialog open={customizeOpen} onOpenChange={(o) => { setCustomizeOpen(o); if (!o) { setEditingId(null); setForm(emptyForm); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Customize Store</DialogTitle><DialogDescription>Personalize how your store appears to customers.</DialogDescription></DialogHeader>
          <div className="space-y-5">
            <div className="space-y-2"><Label>Welcome Message</Label><Textarea value={form.welcome_message} onChange={(e) => setForm({ ...form, welcome_message: e.target.value })} rows={3} placeholder="Welcome to my store..." /></div>
            <div className="space-y-2">
              <Label>Banner Color</Label>
              <div className="flex flex-wrap gap-2">
                {BANNER_COLORS.map((color) => (
                  <button key={color.value} className={`h-8 w-8 rounded-full border-2 transition-all ${color.value || "bg-gradient-profit"} ${form.banner_color === color.value ? "ring-2 ring-primary ring-offset-2" : ""}`} onClick={() => setForm({ ...form, banner_color: color.value })} title={color.label} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div><Label>Public Visibility</Label><p className="text-xs text-muted-foreground">Anyone with the link can view this store.</p></div>
              <Switch checked={form.is_public} onCheckedChange={(v) => setForm({ ...form, is_public: v })} />
            </div>
            <div className="space-y-2">
              <Label>Preview</Label>
              <Card className="overflow-hidden">
                <div className={`h-16 flex items-end p-3 ${form.banner_color || "bg-gradient-profit"}`}>
                  <span className="text-white font-semibold text-sm drop-shadow">{form.store_name || "Store Name"}</span>
                </div>
                <CardContent className="p-3">
                  {form.welcome_message && <p className="text-xs text-muted-foreground italic mb-2">"{form.welcome_message}"</p>}
                  <p className="text-xs text-muted-foreground">Products will appear here...</p>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" onClick={() => setCustomizeOpen(false)}><X className="h-4 w-4 mr-1" /> Cancel</Button>
            <Button className="btn-profit" onClick={handleCustomizeSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={(o) => { setShareOpen(o); if (!o) setEditingId(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Share Store</DialogTitle><DialogDescription>{currentShareStore ? `Share "${currentShareStore.store_name}" with customers.` : "Share this store."}</DialogDescription></DialogHeader>
          {editingId && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Public Link</Label>
                <div className="flex gap-2">
                  <Input readOnly value={getStoreLink(editingId)} className="text-xs font-mono" />
                  <Button variant="outline" size="icon" className="shrink-0" onClick={() => copyLink(editingId)}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
              <Button className="w-full gap-1.5" variant="outline" onClick={() => copyLink(editingId)}><Copy className="h-4 w-4" /> Copy Link</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(o) => { if (!o) setDeleteConfirmId(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Store</DialogTitle><DialogDescription>This will permanently delete the store and all its data. This cannot be undone.</DialogDescription></DialogHeader>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
