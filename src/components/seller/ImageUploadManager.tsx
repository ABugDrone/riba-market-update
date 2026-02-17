import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon, Star } from "lucide-react";

export interface UploadedImage {
  id: string;
  dataUrl: string;
  name: string;
  size: number;
  isMain: boolean;
}

interface ImageUploadManagerProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export function ImageUploadManager({
  images,
  onChange,
  maxImages = 5,
  maxSizeMB = 5,
}: ImageUploadManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError("");

    // Check if adding these files exceeds max limit
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImages: UploadedImage[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} is not an image file`);
        continue;
      }

      // Validate file size
      if (file.size > maxSizeBytes) {
        setError(`${file.name} exceeds ${maxSizeMB}MB limit`);
        continue;
      }

      // Convert to base64
      try {
        const dataUrl = await readFileAsDataURL(file);
        newImages.push({
          id: `${Date.now()}-${i}`,
          dataUrl,
          name: file.name,
          size: file.size,
          isMain: images.length === 0 && i === 0, // First image is main by default
        });
      } catch (err) {
        setError(`Failed to process ${file.name}`);
      }
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    const filtered = images.filter((img) => img.id !== id);
    // If we removed the main image, set first remaining as main
    if (filtered.length > 0 && !filtered.some((img) => img.isMain)) {
      filtered[0].isMain = true;
    }
    onChange(filtered);
  };

  const setMainImage = (id: string) => {
    onChange(images.map((img) => ({ ...img, isMain: img.id === id })));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    // Simulate file input change
    const input = fileInputRef.current;
    if (input) {
      // Create a new FileList-like object
      const dt = new DataTransfer();
      for (let i = 0; i < files.length; i++) {
        dt.items.add(files[i]);
      }
      input.files = dt.files;
      handleFileSelect({ target: input } as any);
    }
  };

  const mainImage = images.find((img) => img.isMain);
  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canAddMore && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="relative border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
          <p className="text-sm font-medium mb-1">
            Drop images here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Up to {maxImages} images, {maxSizeMB}MB each ({images.length}/{maxImages} uploaded)
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-lg flex items-center gap-2">
          <X className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Uploaded Images ({images.length}/{maxImages})
            </p>
            <p className="text-xs text-muted-foreground">
              Click image to set as main display
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {images.map((img) => (
              <Card
                key={img.id}
                className={`relative group overflow-hidden cursor-pointer transition-all ${
                  img.isMain
                    ? "ring-2 ring-primary shadow-lg"
                    : "hover:ring-2 hover:ring-primary/50"
                }`}
                onClick={() => !img.isMain && setMainImage(img.id)}
              >
                <div className="aspect-square relative">
                  <img
                    src={img.dataUrl}
                    alt={img.name}
                    className="h-full w-full object-cover"
                  />
                  {/* Main Badge */}
                  {img.isMain && (
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground gap-1 text-[10px] px-1.5 py-0.5">
                      <Star className="h-3 w-3 fill-current" />
                      Main
                    </Badge>
                  )}
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(img.id);
                    }}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    {!img.isMain && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 py-0.5">
                          <Star className="h-3 w-3" />
                          Set as main
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-2 bg-card border-t">
                  <p className="text-[10px] font-medium truncate">{img.name}</p>
                  <p className="text-[9px] text-muted-foreground">
                    {(img.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {images.length === 0 && !error && (
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <ImageIcon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Tips:</strong> Upload high-quality product images
            </p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>First image will be set as main display automatically</li>
              <li>Click any image to set it as main display</li>
              <li>Supported formats: JPG, PNG, GIF, WebP</li>
              <li>Images are stored locally until you submit</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
