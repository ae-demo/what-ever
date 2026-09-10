import { useEffect, useState, type JSX } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Alert, Box, Button, Card, CardContent, Grid, PageContent, PageTitle, Stack, Typography } from "@wso2/oxygen-ui";
import { getRecipe, addMealPlanEntry, type Recipe } from "../dietApi";
import { getOrCreateCurrentMealPlan } from "../lib/mealPlan";
import { addCachedEntry } from "../lib/planStore";
import { today } from "../lib/date";

function StatTile({ label, value, caption }: { label: string; value: string; caption?: string }): JSX.Element {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4">{value}</Typography>
        {caption && (
          <Typography variant="caption" color="text.secondary">
            {caption}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function RecipeDetail(): JSX.Element {
  const { recipeId } = useParams<{ recipeId: string }>();
  const [searchParams] = useSearchParams();
  const mealSlot = (searchParams.get("mealSlot") as "breakfast" | "lunch" | "dinner" | "snack") || "lunch";
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"add" | "order" | null>(null);

  useEffect(() => {
    if (!recipeId) return;
    let cancelled = false;
    getRecipe(recipeId)
      .then((r) => {
        if (!cancelled) setRecipe(r);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Recipe not found");
      });
    return () => {
      cancelled = true;
    };
  }, [recipeId]);

  async function planEntry() {
    if (!recipe) throw new Error("recipe not loaded");
    const plan = await getOrCreateCurrentMealPlan();
    const entry = await addMealPlanEntry(plan.id, { recipeId: recipe.id, day: today(), mealSlot });
    addCachedEntry(plan.id, { entry, recipeName: recipe.name, recipeCalories: recipe.calories });
    return entry;
  }

  async function handleAddToMealPlan() {
    setBusy("add");
    setError(null);
    try {
      await planEntry();
      navigate("/meal-plan");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add to meal plan");
    } finally {
      setBusy(null);
    }
  }

  async function handleOrderForLunch() {
    setBusy("order");
    setError(null);
    try {
      const entry = await planEntry();
      navigate(`/meal-plan/entries/${entry.id}/order`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start order");
    } finally {
      setBusy(null);
    }
  }

  if (error && !recipe) {
    return (
      <PageContent>
        <Alert severity="error">{error}</Alert>
      </PageContent>
    );
  }

  if (!recipe) {
    return (
      <PageContent>
        <Typography color="text.secondary">Loading…</Typography>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>{recipe.name}</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2, maxWidth: 240 }}>
        <StatTile label="Calories" value={String(recipe.calories)} caption="per serving" />
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatTile label="Protein" value={`${recipe.proteinG ?? "—"}g`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatTile label="Carbs" value={`${recipe.carbG ?? "—"}g`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatTile label="Fat" value={`${recipe.fatG ?? "—"}g`} />
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="flex-end" spacing={2}>
        <Button variant="outlined" disabled={busy !== null} onClick={() => void handleOrderForLunch()}>
          Order for lunch
        </Button>
        <Button variant="contained" disabled={busy !== null} onClick={() => void handleAddToMealPlan()}>
          Add to meal plan
        </Button>
      </Stack>
    </PageContent>
  );
}
