import { useState, type JSX } from "react";
import { useNavigate, useParams } from "react-router";
import { Alert, Button, Form, PageContent, PageTitle, Stack, TextField, Typography } from "@wso2/oxygen-ui";
import { leaveFeedback } from "../dietApi";

export default function LeaveFeedback(): JSX.Element {
  const { connectionId } = useParams<{ connectionId: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!connectionId) return;
    setSaving(true);
    setError(null);
    try {
      await leaveFeedback(connectionId, message);
      navigate(`/dieters/${connectionId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send feedback");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Feedback for dieter</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Form.Section>
        <Form.Stack spacing={2} sx={{ maxWidth: 480 }}>
          <TextField
            label="Write your feedback"
            multiline
            minRows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Form.Stack>
      </Form.Section>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 480 }}>
        The dieter will be notified on WhatsApp.
      </Typography>

      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3, maxWidth: 480 }}>
        <Button variant="outlined" onClick={() => connectionId && navigate(`/dieters/${connectionId}`)}>
          Cancel
        </Button>
        <Button variant="contained" disabled={saving || !message} onClick={() => void handleSend()}>
          Send
        </Button>
      </Stack>
    </PageContent>
  );
}
