import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocalCache } from "@/hooks/useLocalCache";
import { formatNaira } from "@/data/mock";
import { Plus, Trash2, Edit, Package, X, Save, Wifi, WifiOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { type VideoEmbed } from "./VideoEmbedField";

export interface CatalogueItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images?: string[]; // Array of image data URLs
  video?: VideoEmbed; // Video embed information
  status: "draft" | "published";
  createdAt: string;
}

const emptyCatalogue: CatalogueItem = {
  id: "",
  name: "",
  description: "",
  price: 0,
  category: "",
  image: "",
  status: "draft",
  createdAt: "",
};

interface CatalogueManagerProps {
  catalogueId?: string;
  /** @deprecated Use catalogueId instead */
  storeId?: string;
}

export default function CatalogueManager({ catalogueId, storeId }: CatalogueManagerProps) {
  const id = catalogueId || storeId;
  const cacheKey = id ? `riba_catalogue_${id}` : "riba_catalogue";
  const { data: items, update: setItems } = useLocalCache<CatalogueItem[]>(cacheKey, []);
  const [editing, setEditing] = useState<CatalogueItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const [isOnline] = useState(navigator.onLine);

  const handleSave = () => {
    if (!editing?.name || !editing?.price) {
      toast({ title: "Missing fields", description: "Name and price are required.", variant: "destructive" });
      return;
    }
    setItems((prev) => {
      if (editing.id) {
        return prev.map((i) => (i.id === editing.id ? editing : i));
      }
      return [...prev, { ...editing, id: crypto.randomUUID(), createdAt: new Date().toISOString() }];
    });
    setEditing(null);
    setDialogOpen(false);
    toast({ title: "Catalogue saved", description: "Cached locally for offline access." });
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Item removed" });
  };

  const toggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: i.status === "draft" ? "published" : "draft" } : i))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">Catalogue</h2>
          <Badge variant="outline" className="text-xs gap-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="btn-profit" onClick={() => setEditing({ ...emptyCatalogue })}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing?.id ? "Edit" : "Add"} Catalogue Item</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Samsung Galaxy A54" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} placeholder="Brief description..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (₦) *</Label>
                    <Input type="number" value={editing.price || ""} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="Electronics" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="https://..." />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => { setDialogOpen(false); setEditing(null); }}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button className="btn-profit" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No catalogue items yet. Add your first product!</p>
            <p className="text-xs text-muted-foreground mt-1">All items are cached locally for offline access.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-primary font-semibold text-sm">{formatNaira(item.price)}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs cursor-pointer ${item.status === "published" ? "status-active" : "status-pending"}`}
                        onClick={() => toggleStatus(item.id)}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    {item.category && <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>}
                    <div className="flex gap-1 mt-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(item); setDialogOpen(true); }}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
