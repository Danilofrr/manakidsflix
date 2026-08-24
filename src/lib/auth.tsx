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
  // guarda a role já resolvida junto com o id do usuário dono dela,
  // para que nunca exista um instante em que a role parece "resolvida"
  // para um usuário diferente do da sessão atual.
  const [resolved, setResolved] = useState<{ userId: string | null; role: AppRole | null }>({
    userId: null,
    role: null,
  });
  const [loading, setLoading] = useState(true);

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
      setResolved({ userId: null, role: null });
      return;
    }
    let active = true;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (!active) return;
        const roles = (data ?? []).map((r) => r.role as AppRole);
        setResolved({
          userId,
          role: roles.includes("admin") ? "admin" : (roles[0] ?? "cliente"),
        });
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const roleLoading = Boolean(userId) && resolved.userId !== userId;
  const role = roleLoading ? null : resolved.role;

  async function signOut() {
    await supabase.auth.signOut();
    setResolved({ userId: null, role: null });
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
