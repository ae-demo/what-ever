import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router";
import { Alert, Button, Chip, List, ListItem, ListItemText, PageContent, PageTitle, Typography } from "@wso2/oxygen-ui";
import { listCoachConnections, type CoachConnection } from "../dietApi";

const STATUS_COLOR: Record<CoachConnection["status"], "success" | "warning" | "default"> = {
  active: "success",
  pending: "warning",
  ended: "default",
};

export default function Coaches(): JSX.Element {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<CoachConnection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listCoachConnections()
      .then((data) => {
        if (!cancelled) setConnections(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load coaches");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Connected coaches</PageTitle.Header>
        <PageTitle.Actions>
          <Button variant="contained" onClick={() => navigate("/coaches/invite")}>
            Invite a coach
          </Button>
        </PageTitle.Actions>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* diet-api's CoachConnection carries only an opaque coachId — there is no
          directory endpoint to resolve a coach's display name (see report). */}
      {!loading && connections.length === 0 ? (
        <Typography color="text.secondary">No coaches connected yet.</Typography>
      ) : (
        <List>
          {connections.map((c) => (
            <ListItem key={c.id} secondaryAction={<Chip label={c.status} color={STATUS_COLOR[c.status]} size="small" />}>
              <ListItemText primary={`Coach ${c.coachId}`} />
            </ListItem>
          ))}
        </List>
      )}
    </PageContent>
  );
}
