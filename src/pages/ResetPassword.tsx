import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type PageState = "verifying" | "ready" | "done" | "expired";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pageState, setPageState] = useState<PageState>("verifying");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Exchange the token from the URL hash so the session is active
  useEffect(() => {
    const hash = window.location.hash;

    // Check for error in hash (expired / invalid link)
    if (hash.includes("error=") || hash.includes("error_code=")) {
      setPageState("expired");
      return;
    }

    // Supabase puts access_token in the hash for password recovery
    if (hash.includes("access_token")) {
      const params = new URLSearchParams(hash.replace("#", ""));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ error }) => {
            if (error) setPageState("expired");
            else setPageState("ready");
          });
      } else {
        setPageState("expired");
      }
      return;
    }

    // Also listen for PASSWORD_RECOVERY event (some Supabase versions use this)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setPageState("ready");
    });

    // Give it a moment to fire, then fall back to expired
    const timer = setTimeout(() => {
      setPageState((prev) => prev === "verifying" ? "expired" : prev);
    }, 1500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      setPageState("done");
      toast({ title: "Password saved successfully!" });
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-profit mb-2">
              <span className="text-lg font-bold text-white">R</span>
            </div>
            <CardTitle className="text-2xl">
              {pageState === "done" ? "Password saved!" : "Set new password"}
            </CardTitle>
            <CardDescription>
              {pageState === "done"
                ? "Redirecting you to login…"
                : "Enter your new password below"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Verifying token */}
            {pageState === "verifying" && (
              <div className="flex flex-col items-center py-8 gap-3 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Verifying your reset link…</p>
              </div>
            )}

            {/* Expired / invalid link */}
            {pageState === "expired" && (
              <div className="flex flex-col items-center py-8 gap-4 text-center">
                <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-7 w-7 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold">Link expired or invalid</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Reset links expire after a few minutes.
                  </p>
                </div>
                <Link to="/forgot-password">
                  <Button className="btn-profit">Request a new link</Button>
                </Link>
              </div>
            )}

            {/* Success */}
            {pageState === "done" && (
              <div className="flex flex-col items-center py-8 gap-4 text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Your password has been updated. Taking you to login now.
                </p>
                <Link to="/login">
                  <Button className="btn-profit">Go to Login</Button>
                </Link>
              </div>
            )}

            {/* Form */}
            {pageState === "ready" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Toggle visibility"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repeat your password"
                      className="pl-10"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                  </div>
                  {confirm && password !== confirm && (
                    <p className="text-xs text-destructive">Passwords don't match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full btn-profit"
                  disabled={loading || !password || password !== confirm}
                >
                  {loading
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</>
                    : "Save New Password"
                  }
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
