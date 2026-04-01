import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User, Briefcase, LogOut, ShoppingBag, Star,
  Users, Settings, BadgeCheck, Store,
} from "lucide-react";

interface UserProfileDropdownProps {
  /** Size of the avatar trigger button */
  size?: "sm" | "md";
}

export function UserProfileDropdown({ size = "md" }: UserProfileDropdownProps) {
  const { state, logout, switchMode } = useAuth();
  const navigate = useNavigate();
  const user = state.currentUser;

  if (!user) return null;

  const avatarSize = size === "sm" ? "h-7 w-7 text-xs" : "h-8 w-8 text-sm";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full shrink-0">
          <div className={`${avatarSize} rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden`}>
            {user.avatar
              ? <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              : (user.name?.[0] ?? "U").toUpperCase()
            }
          </div>
          {user.isPro && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-amber-500 rounded-full border-2 border-background" title="PRO" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* Profile header */}
        <div className="px-3 py-2.5 space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
              {user.avatar
                ? <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                : (user.name?.[0] ?? "U").toUpperCase()
              }
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                {user.isPro && <BadgeCheck className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          {/* Mode badge */}
          {user.userType !== "buyer" && (
            <Badge variant="secondary" className="text-xs capitalize">
              {state.currentMode === "seller" ? "🏪 Seller Mode" : "🛍️ Buyer Mode"}
            </Badge>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Seller dashboard */}
        {(user.userType === "seller" || user.userType === "both") && (
          <DropdownMenuItem onClick={() => { navigate("/seller/dashboard"); switchMode("seller"); }}>
            <Briefcase className="h-4 w-4 mr-2" /> Seller Dashboard
          </DropdownMenuItem>
        )}

        {/* Buyer Hub */}
        <DropdownMenuItem onClick={() => { navigate("/buyer/dashboard"); switchMode("buyer"); }}>
          <ShoppingBag className="h-4 w-4 mr-2" /> Buyer Hub
        </DropdownMenuItem>

        {/* Switch mode — only for "both" users */}
        {user.userType === "both" && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Switch Mode</div>
            <DropdownMenuItem
              onClick={() => { switchMode("buyer"); navigate("/buyer/dashboard"); }}
              className={state.currentMode === "buyer" ? "bg-primary/10 text-primary" : ""}
            >
              <User className="h-3.5 w-3.5 mr-2" /> Buyer Mode
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => { switchMode("seller"); navigate("/seller/dashboard"); }}
              className={state.currentMode === "seller" ? "bg-primary/10 text-primary" : ""}
            >
              <Briefcase className="h-3.5 w-3.5 mr-2" /> Seller Mode
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Seller Hub / Settings */}
        <DropdownMenuItem onClick={() => {
          if (state.currentMode === "seller") {
            navigate("/seller/dashboard");
          } else {
            navigate("/buyer/dashboard");
          }
        }}>
          {state.currentMode === "seller" ? (
            <><Store className="h-4 w-4 mr-2" /> Seller Hub</>
          ) : (
            <><Settings className="h-4 w-4 mr-2" /> Settings</>
          )}
        </DropdownMenuItem>

        {/* Sign out */}
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => { logout(); navigate("/"); }}
        >
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
