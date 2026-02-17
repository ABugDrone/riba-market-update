import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, X, ExternalLink, Play } from "lucide-react";

export interface VideoEmbed {
  url: string;
  embedUrl: string;
  platform: "youtube" | "tiktok" | "facebook" | "vimeo" | "instagram" | "unknown";
  thumbnail?: string;
}

interface VideoEmbedFieldProps {
  value?: VideoEmbed | null;
  onChange: (video: VideoEmbed | null) => void;
}

export function VideoEmbedField({ value, onChange }: VideoEmbedFieldProps) {
  const [inputUrl, setInputUrl] = useState(value?.url || "");
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (value) {
      setInputUrl(value.url);
    }
  }, [value]);

  const parseVideoUrl = (url: string): VideoEmbed | null => {
    if (!url.trim()) return null;

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase().replace("www.", "");

      // YouTube
      if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
        let videoId = "";
        if (hostname.includes("youtu.be")) {
          videoId = urlObj.pathname.slice(1).split("?")[0];
        } else {
          videoId = urlObj.searchParams.get("v") || "";
        }
        if (videoId) {
          return {
            url,
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            platform: "youtube",
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          };
        }
      }

      // Vimeo
      if (hostname.includes("vimeo.com")) {
        const videoId = urlObj.pathname.split("/").filter(Boolean)[0];
        if (videoId) {
          return {
            url,
            embedUrl: `https://player.vimeo.com/video/${videoId}`,
            platform: "vimeo",
          };
        }
      }

      // TikTok
      if (hostname.includes("tiktok.com")) {
        const match = url.match(/\/video\/(\d+)/);
        if (match) {
          return {
            url,
            embedUrl: `https://www.tiktok.com/embed/v2/${match[1]}`,
            platform: "tiktok",
          };
        }
      }

      // Facebook
      if (hostname.includes("facebook.com") || hostname.includes("fb.watch")) {
        const encoded = encodeURIComponent(url);
        return {
          url,
          embedUrl: `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false`,
          platform: "facebook",
        };
      }

      // Instagram
      if (hostname.includes("instagram.com")) {
        const match = url.match(/\/p\/([A-Za-z0-9_-]+)/);
        if (match) {
          return {
            url,
            embedUrl: `https://www.instagram.com/p/${match[1]}/embed`,
            platform: "instagram",
          };
        }
      }

      return null;
    } catch {
      return null;
    }
  };

  const handleUrlChange = (url: string) => {
    setInputUrl(url);
    setError("");

    if (!url.trim()) {
      onChange(null);
      return;
    }

    const parsed = parseVideoUrl(url);
    if (parsed) {
      onChange(parsed);
      setShowPreview(false);
    } else {
      setError("Unsupported video URL. Please use YouTube, Vimeo, TikTok, Facebook, or Instagram.");
      onChange(null);
    }
  };

  const getPlatformColor = (platform: VideoEmbed["platform"]) => {
    const colors = {
      youtube: "bg-red-500/10 text-red-700 dark:text-red-400",
      vimeo: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      tiktok: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
      facebook: "bg-blue-600/10 text-blue-800 dark:text-blue-500",
      instagram: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      unknown: "bg-muted text-muted-foreground",
    };
    return colors[platform] || colors.unknown;
  };

  return (
    <div className="space-y-3">
      {/* URL Input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Paste video URL (YouTube, Vimeo, TikTok, Facebook, Instagram)"
            value={inputUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className={error ? "border-destructive" : ""}
          />
          {value && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setInputUrl("");
                onChange(null);
                setError("");
              }}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <X className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>

      {/* Video Preview */}
      {value && !error && (
        <Card className="overflow-hidden">
          <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Video Preview</span>
              <Badge variant="secondary" className={`text-xs capitalize ${getPlatformColor(value.platform)}`}>
                {value.platform}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Play className="h-3 w-3" />
                {showPreview ? "Hide" : "Show"} Player
              </Button>
              <a
                href={value.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-2"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {showPreview ? (
            <div className="aspect-video bg-black relative">
              <iframe
                src={value.embedUrl}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video preview"
              />
            </div>
          ) : (
            <div
              className="aspect-video bg-muted relative cursor-pointer group"
              onClick={() => setShowPreview(true)}
            >
              {value.thumbnail ? (
                <img
                  src={value.thumbnail}
                  alt="Video thumbnail"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-primary text-primary-foreground rounded-full p-4">
                    <Play className="h-8 w-8 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 text-xs text-muted-foreground truncate">
            {value.url}
          </div>
        </Card>
      )}

      {/* Instructions */}
      {!value && !error && (
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <Video className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Supported platforms:</strong> YouTube, Vimeo, TikTok, Facebook, Instagram
            </p>
            <p className="text-[10px]">
              Video will be embedded and playable directly on your product page without redirecting customers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
