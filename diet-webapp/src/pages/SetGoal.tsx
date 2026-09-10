import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router";
import {
  Alert,
  Button,
  Form,
  PageContent,
  PageTitle,
  Stack,
  TextField,
} from "@wso2/oxygen-ui";
import { getGoal, setGoal } from "../dietApi";

export default function SetGoal(): JSX.Element {
  const navigate = useNavigate();
  const [calorieTarget, setCalorieTarget] = useState("2000");
  const [proteinTargetG, setProteinTargetG] = useState("120");
  const [carbTargetG, setCarbTargetG] = useState("220");
  const [fatTargetG, setFatTargetG] = useState("65");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const goal = await getGoal();
      if (cancelled || !goal) return;
      setCalorieTarget(String(goal.calorieTarget));
      if (goal.proteinTargetG != null) setProteinTargetG(String(goal.proteinTargetG));
      if (goal.carbTargetG != null) setCarbTargetG(String(goal.carbTargetG));
      if (goal.fatTargetG != null) setFatTargetG(String(goal.fatTargetG));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await setGoal({
        calorieTarget: Number(calorieTarget),
        proteinTargetG: Number(proteinTargetG),
        carbTargetG: Number(carbTargetG),
        fatTargetG: Number(fatTargetG),
      });
      navigate("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save goal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Diet goal</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Form.Section>
        <Form.Stack spacing={2} sx={{ maxWidth: 420 }}>
          <TextField
            label="Calorie target"
            type="number"
            value={calorieTarget}
            onChange={(e) => setCalorieTarget(e.target.value)}
          />
          <TextField
            label="Protein target (g)"
            type="number"
            value={proteinTargetG}
            onChange={(e) => setProteinTargetG(e.target.value)}
          />
          <TextField
            label="Carb target (g)"
            type="number"
            value={carbTargetG}
            onChange={(e) => setCarbTargetG(e.target.value)}
          />
          <TextField
            label="Fat target (g)"
            type="number"
            value={fatTargetG}
            onChange={(e) => setFatTargetG(e.target.value)}
          />
        </Form.Stack>
      </Form.Section>

      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3, maxWidth: 420 }}>
        <Button variant="outlined" onClick={() => navigate("/dashboard")}>
          Cancel
        </Button>
        <Button variant="contained" disabled={saving} onClick={() => void handleSave()}>
          Save
        </Button>
      </Stack>
    </PageContent>
  );
}
