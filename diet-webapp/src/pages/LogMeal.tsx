import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router";
import {
  Alert,
  Button,
  Form,
  List,
  ListItemButton,
  ListItemText,
  PageContent,
  PageTitle,
  Stack,
  TextField,
  Typography,
} from "@wso2/oxygen-ui";
import { listRecipes, logFood, type Recipe } from "../dietApi";

export default function LogMeal(): JSX.Element {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!search) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timeout = setTimeout(() => {
      listRecipes(search).then((r) => {
        if (!cancelled) setResults(r);
      });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search]);

  async function handleSave() {
    if (!selected) {
      setError("Pick a recipe first");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await logFood({
        recipeId: selected.id,
        quantity: Number(quantity),
        loggedAt: new Date().toISOString(),
      });
      navigate("/food-log");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to log meal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Log a meal</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Form.Section>
        <Form.Stack spacing={2} sx={{ maxWidth: 420 }}>
          <TextField
            label="Find recipe"
            placeholder="Find recipe"
            value={selected ? selected.name : search}
            onChange={(e) => {
              setSelected(null);
              setSearch(e.target.value);
            }}
          />
          {!selected && results.length > 0 && (
            <List dense sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
              {results.map((r) => (
                <ListItemButton
                  key={r.id}
                  onClick={() => {
                    setSelected(r);
                    setResults([]);
                  }}
                >
                  <ListItemText primary={r.name} secondary={`${r.calories} cal`} />
                </ListItemButton>
              ))}
            </List>
          )}
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </Form.Stack>
      </Form.Section>

      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3, maxWidth: 420 }}>
        <Button variant="outlined" onClick={() => navigate("/food-log")}>
          Cancel
        </Button>
        <Button variant="contained" disabled={saving} onClick={() => void handleSave()}>
          Save
        </Button>
      </Stack>
    </PageContent>
  );
}
