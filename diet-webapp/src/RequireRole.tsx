import { Box, Typography } from "@wso2/oxygen-ui";
import type { JSX, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import GateLayout from "./layouts/GateLayout";
import type { Role } from "./auth";

/**
 * Gates a route to one role. Backend authorization is the real enforcement
 * (diet-api answers 403); this is presentation-only, per thunder-authentication.
 */
export default function RequireRole({
  role,
  children,
}: {
  role: Exclude<Role, null>;
  children: ReactNode;
}): JSX.Element {
  const { loading, role: current } = useAuth();

  if (loading) return <GateLayout message="Signing in…" />;

  if (current !== role) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6">This screen is for {role === "Coach" ? "Coaches" : "Dieters"}</Typography>
        <Typography variant="body2" color="text.secondary">
          {current
            ? `Your account is signed in as ${current}, which does not have access here.`
            : "Your account has no Dieter or Coach role yet."}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
