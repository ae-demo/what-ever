import { createContext, useContext, useEffect, useState, type JSX, type ReactNode } from "react";
import { currentUser, getRoles, resolveRole, signIn, type Role } from "./auth";

interface AuthState {
  loading: boolean;
  signedIn: boolean;
  displayName: string;
  email: string;
  role: Role;
}

const AuthCtx = createContext<AuthState>({
  loading: true,
  signedIn: false,
  displayName: "",
  email: "",
  role: null,
});

export function useAuth(): AuthState {
  return useContext(AuthCtx);
}

/**
 * Gates the whole app on sign-in. A signed-out visitor is redirected to
 * Thunder immediately; a signed-in one renders the app with their role
 * resolved from `user.profile.groups` (case-insensitive substring match on
 * "dieter"/"coach", per thunder-authentication and security.json).
 */
export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, setState] = useState<AuthState>({
    loading: true,
    signedIn: false,
    displayName: "",
    email: "",
    role: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await currentUser();
      if (cancelled) return;
      if (!user) {
        await signIn();
        return;
      }
      const groups = await getRoles();
      setState({
        loading: false,
        signedIn: true,
        displayName: (user.profile?.name as string) ?? (user.profile?.sub as string) ?? "Signed in",
        email: (user.profile?.email as string) ?? "",
        role: resolveRole(groups),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>;
}
