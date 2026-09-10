import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router";
import {
  Alert,
  Box,
  ListingTable,
  MenuItem,
  PageContent,
  PageTitle,
  Stack,
  TextField,
} from "@wso2/oxygen-ui";
import { listRecipes, type Recipe } from "../dietApi";

// Recipe (per diet-api's schema) carries no meal-type/slot of its own — that
// belongs to a MealPlanEntry, not a Recipe. This select cannot filter the
// list against a field the API does not have, so it instead picks the
// mealSlot used later when this recipe is added to the meal plan.
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

export default function Recipes(): JSX.Element {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [mealType, setMealType] = useState<string>("lunch");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const timeout = setTimeout(() => {
      listRecipes(search)
        .then((data) => {
          if (!cancelled) setRecipes(data);
        })
        .catch((e) => {
          if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load recipes");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search]);

  function openRecipe(recipe: Recipe) {
    // carry the chosen meal slot forward for "Add to meal plan" on RecipeDetail
    navigate(`/recipes/${recipe.id}?mealSlot=${mealType}`);
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Recipes</PageTitle.Header>
        <PageTitle.SubHeader>Browse the recipe catalog</PageTitle.SubHeader>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Search recipes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <Box sx={{ ml: "auto" }}>
          <TextField select label="Meal type" value={mealType} onChange={(e) => setMealType(e.target.value)} sx={{ minWidth: 160 }}>
            {MEAL_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t[0].toUpperCase() + t.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Stack>

      <ListingTable.Container>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Recipe</ListingTable.Cell>
              <ListingTable.Cell>Calories</ListingTable.Cell>
              <ListingTable.Cell>Protein</ListingTable.Cell>
              <ListingTable.Cell>Carbs</ListingTable.Cell>
              <ListingTable.Cell>Fat</ListingTable.Cell>
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {recipes.map((r) => (
              <ListingTable.Row key={r.id} clickable onClick={() => openRecipe(r)}>
                <ListingTable.Cell>{r.name}</ListingTable.Cell>
                <ListingTable.Cell>{r.calories}</ListingTable.Cell>
                <ListingTable.Cell>{r.proteinG ?? "—"}g</ListingTable.Cell>
                <ListingTable.Cell>{r.carbG ?? "—"}g</ListingTable.Cell>
                <ListingTable.Cell>{r.fatG ?? "—"}g</ListingTable.Cell>
              </ListingTable.Row>
            ))}
          </ListingTable.Body>
        </ListingTable>
        {!loading && recipes.length === 0 && (
          <ListingTable.EmptyState title="No recipes found" description="Try a different search." />
        )}
      </ListingTable.Container>
    </PageContent>
  );
}
