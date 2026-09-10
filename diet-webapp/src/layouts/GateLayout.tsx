import { Box, CircularProgress, Layout, ParticleBackground, Stack, Typography } from "@wso2/oxygen-ui";
import type { JSX } from "react";

/** Shown while the app redirects to Thunder, or waits on the OIDC callback. */
export default function GateLayout({ message }: { message: string }): JSX.Element {
  return (
    <Layout.Content>
      <ParticleBackground opacity={0.5} />
      <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body1" color="text.secondary">
            {message}
          </Typography>
        </Stack>
      </Box>
    </Layout.Content>
  );
}
