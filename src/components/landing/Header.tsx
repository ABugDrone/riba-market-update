import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, User, Search, Menu, LogOut, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { label: "Categories", href: "/products" },
  { label: "Deals", href: "/products?filter=deals" },
  { label: "Sell on Riba", href: "/seller/dashboard" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state, logout, switchMode } = useAuth();
  const navigate = useNavigate();
  const user = state.currentUser;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-profit">
            <span className="text-lg font-bold text-white">R</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-bold text-foreground">Riba</span>
            <span className="text-xl font-bold text-primary"> Market</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
              3
            </Badge>
          </Button>

          {state.isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  {user.userType === "both" && (
                    <Badge variant="secondary" className="mt-1.5 capitalize">
                      {state.currentMode === "seller" ? "🏪 Seller Mode" : "🛍️ Buyer Mode"}
                    </Badge>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { navigate("/buyer/dashboard"); state.currentMode !== "buyer" && switchMode("buyer"); }}>
                  <User className="h-4 w-4 mr-2" /> My Account
                </DropdownMenuItem>
                {(user.userType === "seller" || user.userType === "both") && (
                  <DropdownMenuItem onClick={() => { navigate("/seller/dashboard"); state.currentMode !== "seller" && switchMode("seller"); }}>
                    <Briefcase className="h-4 w-4 mr-2" /> Seller Dashboard
                  </DropdownMenuItem>
                )}
                {user.userType === "both" && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-2 text-xs font-medium text-muted-foreground">Switch Mode</div>
                    <DropdownMenuItem onClick={() => { switchMode("buyer"); navigate("/buyer/dashboard"); }} className={state.currentMode === "buyer" ? "bg-primary/10" : ""}>
                      <User className="h-3 w-3 mr-2" /> Buyer Mode
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { switchMode("seller"); navigate("/seller/dashboard"); }} className={state.currentMode === "seller" ? "bg-primary/10" : ""}>
                      <Briefcase className="h-3 w-3 mr-2" /> Seller Mode
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); navigate("/"); }}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <ThemeToggle />

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex flex-col gap-4 mt-8">
                <Link to="/" className="flex items-center gap-2 mb-4" onClick={() => setMobileOpen(false)}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-profit">
                    <span className="text-lg font-bold text-white">R</span>
                  </div>
                  <span className="text-xl font-bold">Riba Market</span>
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-base font-medium text-muted-foreground hover:text-primary py-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <hr className="my-2" />
                {state.isAuthenticated ? (
                  <button
                    className="text-base font-medium hover:text-primary py-2 text-left text-muted-foreground"
                    onClick={() => { logout(); navigate("/"); setMobileOpen(false); }}
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link to="/login" className="text-base font-medium hover:text-primary py-2" onClick={() => setMobileOpen(false)}>
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
