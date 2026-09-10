import { Navigate } from "react-router";
import { useAuth } from "../AuthContext";
import GateLayout from "../layouts/GateLayout";
import { Box, Typography } from "@wso2/oxygen-ui";

/** Root route: sends each role to its own home screen. */
export default function Home() {
  const { loading, role } = useAuth();

  if (loading) return <GateLayout message="Signing in…" />;
  if (role === "Dieter") return <Navigate to="/dashboard" replace />;
  if (role === "Coach") return <Navigate to="/dieters" replace />;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h6">No role assigned</Typography>
      <Typography variant="body2" color="text.secondary">
        Your account has neither the Dieter nor the Coach role, so there is no
        home screen to show.
      </Typography>
    </Box>
  );
}
