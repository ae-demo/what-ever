import { useState, type JSX } from "react";
import { useNavigate } from "react-router";
import { Alert, Button, Form, PageContent, PageTitle, Stack, TextField } from "@wso2/oxygen-ui";
import { inviteCoach } from "../dietApi";

export default function InviteCoach(): JSX.Element {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setSaving(true);
    setError(null);
    try {
      await inviteCoach(email);
      navigate("/coaches");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send invite");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Invite a coach</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Form.Section>
        <Form.Stack spacing={2} sx={{ maxWidth: 420 }}>
          <TextField label="Coach's email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Form.Stack>
      </Form.Section>

      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3, maxWidth: 420 }}>
        <Button variant="outlined" onClick={() => navigate("/coaches")}>
          Cancel
        </Button>
        <Button variant="contained" disabled={saving || !email} onClick={() => void handleSend()}>
          Send invite
        </Button>
      </Stack>
    </PageContent>
  );
}
