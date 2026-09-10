import { useEffect, useState, type JSX } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  PageContent,
  PageTitle,
  Typography,
} from "@wso2/oxygen-ui";
import { listCoachConnections, listFeedback, type CoachConnection, type Feedback } from "../dietApi";

export default function DieterProgress(): JSX.Element {
  const { connectionId } = useParams<{ connectionId: string }>();
  const navigate = useNavigate();
  const [connection, setConnection] = useState<CoachConnection | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!connectionId) return;
    let cancelled = false;
    (async () => {
      try {
        const [connections, fb] = await Promise.all([listCoachConnections(), listFeedback(connectionId)]);
        if (cancelled) return;
        setConnection(connections.find((c) => c.id === connectionId) ?? null);
        setFeedback(fb);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load dieter progress");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connectionId]);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Dieter {connection?.dieterId ?? connectionId}</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        diet-api's /goal, /food-log, /meal-plans and /weight-entries are all
        scoped to the caller — there is no endpoint for a Coach to read a
        specific Dieter's plan, log or weight history, so today&apos;s totals,
        the weight trend and the meal plan below can&apos;t be built from this
        contract (see report). What IS available for this connection: its
        status and the feedback already left on it.
      </Alert>

      <Box sx={{ mb: 3, maxWidth: 320 }}>
        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Connection status
            </Typography>
            <Typography variant="h5" sx={{ textTransform: "capitalize" }}>
              {connection?.status ?? "…"}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Feedback history
      </Typography>
      {feedback.length === 0 ? (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          No feedback left yet.
        </Typography>
      ) : (
        <List sx={{ mb: 3 }}>
          {feedback.map((f) => (
            <ListItem key={f.id} divider>
              <ListItemText primary={f.message} secondary={new Date(f.sentAt).toLocaleString()} />
            </ListItem>
          ))}
        </List>
      )}

      <Button variant="contained" onClick={() => connectionId && navigate(`/dieters/${connectionId}/feedback`)}>
        Leave feedback
      </Button>
    </PageContent>
  );
}
