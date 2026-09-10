import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router";
import { Box, Button, Card, CardContent, ListingTable, PageContent, PageTitle, Typography, Alert } from "@wso2/oxygen-ui";
import { getGoal, getRecipe, listFoodLogEntries, type FoodLogEntry, type Goal, type Recipe } from "../dietApi";
import { formatTime, today } from "../lib/date";

export default function FoodLog(): JSX.Element {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<FoodLogEntry[]>([]);
  const [recipes, setRecipes] = useState<Record<string, Recipe>>({});
  const [totalCalories, setTotalCalories] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [page, g] = await Promise.all([listFoodLogEntries(today()), getGoal()]);
        if (cancelled) return;
        setEntries(page.data);
        setTotalCalories(page.totalCalories ?? 0);
        setGoal(g);

        const uniqueIds = Array.from(new Set(page.data.map((e) => e.recipeId)));
        const fetched = await Promise.all(
          uniqueIds.map((id) =>
            getRecipe(id)
              .then((r) => [id, r] as const)
              .catch(() => [id, { id, name: id, calories: 0 } as Recipe] as const),
          ),
        );
        if (!cancelled) setRecipes(Object.fromEntries(fetched));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load food log");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Food Log</PageTitle.Header>
        <PageTitle.Actions>
          <Button variant="contained" onClick={() => navigate("/food-log/new")}>
            Log a meal
          </Button>
        </PageTitle.Actions>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <ListingTable.Container sx={{ mb: 3 }}>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Time</ListingTable.Cell>
              <ListingTable.Cell>Meal</ListingTable.Cell>
              <ListingTable.Cell>Calories</ListingTable.Cell>
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {entries.map((e) => {
              const recipe = recipes[e.recipeId];
              return (
                <ListingTable.Row key={e.id}>
                  <ListingTable.Cell>{formatTime(e.loggedAt)}</ListingTable.Cell>
                  <ListingTable.Cell>{recipe?.name ?? e.recipeId}</ListingTable.Cell>
                  <ListingTable.Cell>{recipe ? recipe.calories * e.quantity : "—"}</ListingTable.Cell>
                </ListingTable.Row>
              );
            })}
          </ListingTable.Body>
        </ListingTable>
        {!loading && entries.length === 0 && (
          <ListingTable.EmptyState title="Nothing logged today" description="Log a meal to get started." />
        )}
      </ListingTable.Container>

      <Box sx={{ maxWidth: 260 }}>
        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Today&apos;s total
            </Typography>
            <Typography variant="h4">{totalCalories}</Typography>
            <Typography variant="caption" color="text.secondary">
              of {goal?.calorieTarget ?? "—"} goal
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </PageContent>
  );
}
