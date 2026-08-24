import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "cliente";

type AuthValue = {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  isAdmin: boolean;
  /** true enquanto a sessão está sendo carregada */
  loading: boolean;
  /** true enquanto a role do usuário ainda não foi resolvida no banco */
  roleLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) {
      setRole(null);
      setRoleLoading(false);
      return;
    }
    let active = true;
    setRoleLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (!active) return;
        const roles = (data ?? []).map((r) => r.role as AppRole);
        setRole(roles.includes("admin") ? "admin" : (roles[0] ?? "cliente"));
        setRoleLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  async function signOut() {
    await supabase.auth.signOut();
    setRole(null);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        role,
        isAdmin: role === "admin",
        loading,
        roleLoading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
