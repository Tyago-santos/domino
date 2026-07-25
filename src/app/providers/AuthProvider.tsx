import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { auth } from "../../shared/config/firebase";
import { db } from "../../shared/config/firestore";
import { seedDatabase } from "../../shared/config/seed";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { uid: string; nickname: string } | null;
  login: (nickname: string, password: string) => Promise<void>;
  register: (nickname: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ uid: string; nickname: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const fallbackNickname = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Jogador";

        // Set user immediately with fallback nickname
        setUser({ uid: firebaseUser.uid, nickname: fallbackNickname });
        clearTimeout(timeout);
        setIsLoading(false);

        // Try to get nickname from DB in background
        get(ref(db, `players/${firebaseUser.uid}`)).then((playerSnap) => {
          if (playerSnap.exists()) {
            const dbNickname = playerSnap.val().nickname;
            if (dbNickname) {
              setUser({ uid: firebaseUser.uid, nickname: dbNickname });
            }
          }
        }).catch(() => {});
      } else {
        setUser(null);
        clearTimeout(timeout);
        setIsLoading(false);
      }
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (nickname: string, password: string) => {
    const email = `${nickname.toLowerCase().replace(/\s/g, "")}@domino.local`;
    const credential = await signInWithEmailAndPassword(auth, email, password);

    // Set user immediately so the app unblocks
    setUser({ uid: credential.user.uid, nickname });

    // Seed and read profile in background (non-blocking)
    seedDatabase().catch(() => {});

    get(ref(db, `players/${credential.user.uid}`)).then((playerSnap) => {
      if (playerSnap.exists()) {
        setUser({
          uid: credential.user.uid,
          nickname: playerSnap.val().nickname || nickname,
        });
      }
    }).catch(() => {});
  }, []);

  const register = useCallback(async (nickname: string, password: string) => {
    const email = `${nickname.toLowerCase().replace(/\s/g, "")}@domino.local`;
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: nickname });

    // Set user immediately so the app unblocks
    setUser({ uid: credential.user.uid, nickname });

    // Seed and create player in background (non-blocking)
    seedDatabase().catch(() => {});

    set(ref(db, `players/${credential.user.uid}`), {
      uid: credential.user.uid,
      name: nickname,
      nickname,
      avatar: "",
      city: "",
      state: "",
      club: "",
      category: "Iniciante",
      bio: "",
      registrationDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }).catch(() => {});
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
