import { useState, type JSX } from "react";
import { useNavigate } from "react-router";
import { Alert, Button, Form, PageContent, PageTitle, Stack, TextField } from "@wso2/oxygen-ui";
import { recordWeight } from "../dietApi";
import { today } from "../lib/date";

export default function RecordWeight(): JSX.Element {
  const navigate = useNavigate();
  const [weightKg, setWeightKg] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await recordWeight({ recordedOn: today(), weightKg: Number(weightKg) });
      navigate("/weight");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to record weight");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Record weight</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Form.Section>
        <Form.Stack spacing={2} sx={{ maxWidth: 420 }}>
          <TextField
            label="Weight (kg)"
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
        </Form.Stack>
      </Form.Section>

      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3, maxWidth: 420 }}>
        <Button variant="outlined" onClick={() => navigate("/weight")}>
          Cancel
        </Button>
        <Button variant="contained" disabled={saving || !weightKg} onClick={() => void handleSave()}>
          Save
        </Button>
      </Stack>
    </PageContent>
  );
}
