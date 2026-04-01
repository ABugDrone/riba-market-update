import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import type { Profile, ProfileUpdate, UserType } from "@/lib/supabase.types";

// ─── Public shape ─────────────────────────────────────────────
export interface UserAccount {
  id: string;           // profiles.id (PK)
  authId: string;       // auth.users.id = profiles.user_id
  email: string;
  name: string;
  phone: string;
  userType: UserType;
  businessName?: string;
  avatar?: string;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  isPro: boolean;
  createdAt: string;
  followedSellers: string[];
  purchasedProductIds: string[];
}

interface AuthState {
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentMode: "buyer" | "seller" | null;
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string, mode?: "buyer" | "seller") => Promise<{ success: boolean; error?: string; userType?: UserType }>;
  register: (userData: Omit<UserAccount, "id" | "authId" | "isPro" | "createdAt"> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserAccount>) => Promise<void>;
  switchMode: (mode: "buyer" | "seller") => void;
  followSeller: (sellerId: string) => Promise<void>;
  unfollowSeller: (sellerId: string) => Promise<void>;
  addPurchasedProduct: (productId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────
function profileToAccount(profile: Profile, authId: string): UserAccount {
  // All sellers get PRO features by default
  const isSeller = profile.user_type === "seller" || profile.user_type === "both";
  return {
    id: profile.id,
    authId,
    email: profile.email,
    name: profile.full_name ?? "",
    phone: profile.phone ?? "",
    userType: profile.user_type,
    businessName: profile.business_name ?? undefined,
    avatar: profile.avatar_url ?? undefined,
    bio: profile.bio ?? undefined,
    address: profile.address ?? undefined,
    city: profile.city ?? undefined,
    state: profile.state ?? undefined,
    isPro: profile.is_pro ?? isSeller,
    createdAt: profile.created_at,
    followedSellers: profile.followed_sellers ?? [],
    purchasedProductIds: profile.purchased_product_ids ?? [],
  };
}

// Fetch profile by auth user id (user_id column)
async function fetchProfile(authUserId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", authUserId)
    .single();
  if (error) { console.error("fetchProfile:", error.message); return null; }
  return data as Profile;
}

// ─── Context ──────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMode, setCurrentMode] = useState<"buyer" | "seller" | null>(null);

  // Bootstrap session
  useEffect(() => {
    let mounted = true;

    // Hard timeout — never block the UI for more than 3 seconds
    const timeout = setTimeout(() => {
      if (mounted) setIsLoading(false);
    }, 3000);

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) await loadUser(session.user);
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        if (mounted) {
          clearTimeout(timeout);
          setIsLoading(false);
        }
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          await loadUser(session.user);
        } else {
          setCurrentUser(null);
          setCurrentMode(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const loadUser = async (authUser: User) => {
    try {
      // Race the profile fetch against a 2s timeout
      const profilePromise = fetchProfile(authUser.id);
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
      const profile = await Promise.race([profilePromise, timeoutPromise]);

      if (profile) {
        const account = profileToAccount(profile, authUser.id);
        setCurrentUser(account);
        setCurrentMode(account.userType === "both" ? "buyer" : account.userType);
      } else {
        // Fallback to auth metadata while profile loads in background
        const meta = authUser.user_metadata ?? {};
        const fallback: UserAccount = {
          id: "",
          authId: authUser.id,
          email: authUser.email ?? "",
          name: meta.full_name ?? authUser.email ?? "",
          phone: "",
          userType: (meta.user_type as UserType) ?? "buyer",
          isPro: false,
          createdAt: authUser.created_at,
          followedSellers: [],
          purchasedProductIds: [],
        };
        setCurrentUser(fallback);
        // Sellers default to seller mode, buyers to buyer mode
        const fallbackType = fallback.userType;
        setCurrentMode(fallbackType === "both" ? "seller" : fallbackType);

        // Try fetching profile in background and update when ready
        fetchProfile(authUser.id).then((p) => {
          if (p) {
            setCurrentUser(profileToAccount(p, authUser.id));
          }
        });
      }
    } catch (e) {
      console.error("loadUser error:", e);
    }
  };

  // ── Login ─────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string, mode?: "buyer" | "seller") => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };

    if (data.user) {
      const profile = await fetchProfile(data.user.id);
      let account: UserAccount;
      if (profile) {
        account = profileToAccount(profile, data.user.id);
      } else {
        const meta = data.user.user_metadata ?? {};
        account = {
          id: "",
          authId: data.user.id,
          email: data.user.email ?? "",
          name: meta.full_name ?? data.user.email ?? "",
          phone: "",
          userType: (meta.user_type as UserType) ?? "buyer",
          isPro: false,
          createdAt: data.user.created_at,
          followedSellers: [],
          purchasedProductIds: [],
        };
      }
      const resolvedMode = mode ?? (account.userType === "both" ? "seller" : account.userType);
      setCurrentUser(account);
      setCurrentMode(resolvedMode);
      return { success: true, userType: account.userType };
    }
    return { success: true };
  }, []);

  // ── Register ──────────────────────────────────────────────
  // The existing DB trigger (handle_new_user) auto-creates the profile row on signup.
  // We just need to pass metadata so the trigger can populate it.
  const register = useCallback(async (
    userData: Omit<UserAccount, "id" | "authId" | "isPro" | "createdAt"> & { password: string }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.name,
          user_type: userData.userType,
          avatar_url: userData.avatar ?? null,
        },
      },
    });

    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: "Signup failed" };

    // The trigger creates the profile row automatically.
    // Set is_pro = true for all sellers by default
    const isSeller = userData.userType === "seller" || userData.userType === "both";
    const updates: any = {
      updated_at: new Date().toISOString(),
    };
    if (userData.phone) updates.phone = userData.phone;
    if (userData.businessName) updates.business_name = userData.businessName;
    if (isSeller) updates.is_pro = true;

    if (Object.keys(updates).length > 1) {
      await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", data.user.id);
    }

    return { success: true };
  }, []);

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentMode(null);
  }, []);

  // ── Update profile ────────────────────────────────────────
  const updateProfile = useCallback(async (data: Partial<UserAccount>) => {
    if (!currentUser?.authId) return;

    const updates: ProfileUpdate = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) updates.full_name = data.name;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.avatar !== undefined) updates.avatar_url = data.avatar;
    if (data.bio !== undefined) updates.bio = data.bio;
    if (data.address !== undefined) updates.address = data.address;
    if (data.city !== undefined) updates.city = data.city;
    if (data.state !== undefined) updates.state = data.state;
    if (data.userType !== undefined) updates.user_type = data.userType;
    if (data.businessName !== undefined) updates.business_name = data.businessName;
    if (data.followedSellers !== undefined) updates.followed_sellers = data.followedSellers;
    if (data.purchasedProductIds !== undefined) updates.purchased_product_ids = data.purchasedProductIds;

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", currentUser.authId);

    if (error) { console.error("updateProfile:", error.message); return; }
    setCurrentUser((prev) => prev ? { ...prev, ...data } : prev);
  }, [currentUser]);

  // ── Switch mode ───────────────────────────────────────────
  const switchMode = useCallback((mode: "buyer" | "seller") => {
    if (currentUser?.userType === "both") setCurrentMode(mode);
  }, [currentUser]);

  // ── Follow / Unfollow ─────────────────────────────────────
  const followSeller = useCallback(async (sellerId: string) => {
    if (!currentUser) return;
    const updated = currentUser.followedSellers.includes(sellerId)
      ? currentUser.followedSellers
      : [...currentUser.followedSellers, sellerId];
    await updateProfile({ followedSellers: updated });
  }, [currentUser, updateProfile]);

  const unfollowSeller = useCallback(async (sellerId: string) => {
    if (!currentUser) return;
    const updated = currentUser.followedSellers.filter((id) => id !== sellerId);
    await updateProfile({ followedSellers: updated });
  }, [currentUser, updateProfile]);

  // ── Add purchased product ─────────────────────────────────
  const addPurchasedProduct = useCallback(async (productId: string) => {
    if (!currentUser) return;
    const updated = currentUser.purchasedProductIds.includes(productId)
      ? currentUser.purchasedProductIds
      : [...currentUser.purchasedProductIds, productId];
    await updateProfile({ purchasedProductIds: updated });
  }, [currentUser, updateProfile]);

  // ── Refresh profile from DB ───────────────────────────────
  const refreshProfile = useCallback(async () => {
    if (!currentUser?.authId) return;
    const profile = await fetchProfile(currentUser.authId);
    if (profile) setCurrentUser(profileToAccount(profile, currentUser.authId));
  }, [currentUser?.authId]);

  const state: AuthState = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    currentMode,
  };

  return (
    <AuthContext.Provider value={{ state, login, register, logout, updateProfile, switchMode, followSeller, unfollowSeller, addPurchasedProduct, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
