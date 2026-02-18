import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";

export interface UserAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  userType: "buyer" | "seller" | "both";
  businessName?: string;
  avatar?: string;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  isPro: boolean;
  createdAt: string;
  followedSellers: string[]; // Array of seller IDs/emails followed
  purchasedProductIds: string[]; // Array of product IDs purchased
}

interface AuthState {
  users: UserAccount[];
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  currentMode: "buyer" | "seller" | null; // Current mode the user is viewing (for "both" account types)
}

type AuthAction =
  | { type: "REGISTER"; payload: UserAccount }
  | { type: "LOGIN"; payload: UserAccount; mode?: "buyer" | "seller" }
  | { type: "LOGOUT" }
  | { type: "UPDATE_PROFILE"; payload: Partial<UserAccount> }
  | { type: "SWITCH_MODE"; payload: "buyer" | "seller" }
  | { type: "FOLLOW_SELLER"; payload: string }
  | { type: "UNFOLLOW_SELLER"; payload: string }
  | { type: "ADD_PURCHASED_PRODUCT"; payload: string };

const demoUser: UserAccount = {
  id: "demo-001",
  email: "demo@ribamarket.com",
  password: "password123",
  name: "Demo User",
  phone: "+234 800 000 0000",
  userType: "both",
  businessName: "Demo Store",
  isPro: false,
  bio: "This is a demo account for testing Riba Market.",
  address: "123 Lekki Street",
  city: "Lagos",
  state: "Lagos",
  createdAt: new Date().toISOString(),
  followedSellers: ["demo-seller-001", "seller@ribamarket.com"],
  purchasedProductIds: ["1", "4", "7"],
};

const demoSellerUser: UserAccount = {
  id: "demo-seller-001",
  email: "seller@ribamarket.com",
  password: "password123",
  name: "Demo Seller",
  phone: "+234 800 111 1111",
  userType: "seller",
  businessName: "Demo Seller Store",
  isPro: true,
  bio: "This is a demo seller account for testing the seller hub.",
  address: "456 Victoria Island Road",
  city: "Lagos",
  state: "Lagos",
  createdAt: new Date().toISOString(),
  followedSellers: [],
  purchasedProductIds: [],
};

const demoBuyerUser: UserAccount = {
  id: "demo-buyer-001",
  email: "buyer@ribamarket.com",
  password: "password123",
  name: "Demo Buyer",
  phone: "+234 800 222 2222",
  userType: "buyer",
  isPro: false,
  bio: "This is a demo buyer account for testing the buyer dashboard.",
  address: "789 Ajah Road",
  city: "Lagos",
  state: "Lagos",
  createdAt: new Date().toISOString(),
  followedSellers: ["demo-seller-001"],
  purchasedProductIds: ["2", "5", "8", "10"],
};

const initialState: AuthState = {
  users: [demoUser, demoSellerUser, demoBuyerUser],
  currentUser: null,
  isAuthenticated: false,
  currentMode: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "REGISTER":
      return {
        ...state,
        users: [...state.users, action.payload],
        currentUser: action.payload,
        isAuthenticated: true,
        currentMode: action.payload.userType === "both" ? "buyer" : action.payload.userType,
      };
    case "LOGIN": {
      const mode = action.mode || (action.payload.userType === "both" ? "buyer" : action.payload.userType);
      return { ...state, currentUser: action.payload, isAuthenticated: true, currentMode: mode };
    }
    case "LOGOUT":
      return { ...state, currentUser: null, isAuthenticated: false, currentMode: null };
    case "SWITCH_MODE":
      if (state.currentUser?.userType === "both") {
        return { ...state, currentMode: action.payload };
      }
      return state;
    case "UPDATE_PROFILE":
      const updated = { ...state.currentUser!, ...action.payload };
      return {
        ...state,
        currentUser: updated,
        users: state.users.map((u) => (u.id === updated.id ? updated : u)),
      };
    case "FOLLOW_SELLER": {
      if (!state.currentUser) return state;
      const currentUser = { ...state.currentUser };
      if (!currentUser.followedSellers.includes(action.payload)) {
        currentUser.followedSellers.push(action.payload);
      }
      return {
        ...state,
        currentUser,
        users: state.users.map((u) => (u.id === currentUser.id ? currentUser : u)),
      };
    }
    case "UNFOLLOW_SELLER": {
      if (!state.currentUser) return state;
      const currentUser = { ...state.currentUser };
      currentUser.followedSellers = currentUser.followedSellers.filter((id) => id !== action.payload);
      return {
        ...state,
        currentUser,
        users: state.users.map((u) => (u.id === currentUser.id ? currentUser : u)),
      };
    }
    case "ADD_PURCHASED_PRODUCT": {
      if (!state.currentUser) return state;
      const currentUser = { ...state.currentUser };
      if (!currentUser.purchasedProductIds.includes(action.payload)) {
        currentUser.purchasedProductIds.push(action.payload);
      }
      return {
        ...state,
        currentUser,
        users: state.users.map((u) => (u.id === currentUser.id ? currentUser : u)),
      };
    }
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string, mode?: "buyer" | "seller") => { success: boolean; error?: string };
  register: (user: Omit<UserAccount, "id" | "isPro" | "createdAt">) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: Partial<UserAccount>) => void;
  switchMode: (mode: "buyer" | "seller") => void;
  followSeller: (sellerId: string) => void;
  unfollowSeller: (sellerId: string) => void;
  addPurchasedProduct: (productId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(
    (email: string, password: string, mode?: "buyer" | "seller") => {
      const user = state.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (!user) return { success: false, error: "Invalid email or password" };
      dispatch({ type: "LOGIN", payload: user, mode });
      return { success: true };
    },
    [state.users]
  );

  const register = useCallback(
    (userData: Omit<UserAccount, "id" | "isPro" | "createdAt">) => {
      const exists = state.users.some(
        (u) => u.email.toLowerCase() === userData.email.toLowerCase()
      );
      if (exists) return { success: false, error: "An account with this email already exists" };
      // Auto-assign a business name for sellers if not provided
      const businessName =
        (userData.userType === "seller" || userData.userType === "both")
          ? (userData.businessName || `${userData.name}'s Business`)
          : userData.businessName;
      const newUser: UserAccount = {
        ...userData,
        businessName,
        id: `user-${Date.now()}`,
        isPro: false,
        createdAt: new Date().toISOString(),
        followedSellers: [],
        purchasedProductIds: [],
      };
      dispatch({ type: "REGISTER", payload: newUser });
      return { success: true };
    },
    [state.users]
  );

  const logout = useCallback(() => dispatch({ type: "LOGOUT" }), []);
  const updateProfile = useCallback(
    (data: Partial<UserAccount>) => dispatch({ type: "UPDATE_PROFILE", payload: data }),
    []
  );

  const switchMode = useCallback((mode: "buyer" | "seller") => {
    dispatch({ type: "SWITCH_MODE", payload: mode });
  }, []);

  const followSeller = useCallback((sellerId: string) => {
    dispatch({ type: "FOLLOW_SELLER", payload: sellerId });
  }, []);

  const unfollowSeller = useCallback((sellerId: string) => {
    dispatch({ type: "UNFOLLOW_SELLER", payload: sellerId });
  }, []);

  const addPurchasedProduct = useCallback((productId: string) => {
    dispatch({ type: "ADD_PURCHASED_PRODUCT", payload: productId });
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, register, logout, updateProfile, switchMode, followSeller, unfollowSeller, addPurchasedProduct }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
