import { useEffect, useState, type JSX } from "react";
import { useNavigate, useParams } from "react-router";
import { Alert, Box, Button, Card, CardContent, PageContent, PageTitle, Stack, Typography } from "@wso2/oxygen-ui";
import { getCurrentMealPlanId, findCachedEntry, removeCachedEntry, type CachedEntry } from "../lib/planStore";
import { weekdayLabel } from "../lib/date";

export default function MealPlanEntry(): JSX.Element {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const [cached, setCached] = useState<CachedEntry | null | undefined>(undefined);
  const planId = getCurrentMealPlanId();

  useEffect(() => {
    if (!entryId || !planId) {
      setCached(null);
      return;
    }
    setCached(findCachedEntry(planId, entryId) ?? null);
  }, [entryId, planId]);

  if (cached === undefined) {
    return (
      <PageContent>
        <Typography color="text.secondary">Loading…</Typography>
      </PageContent>
    );
  }

  if (!cached) {
    return (
      <PageContent>
        <Alert severity="warning">
          This entry isn&apos;t in this browser&apos;s meal-plan cache (diet-api has no GET
          to read a meal plan entry back — see report). Go back to the meal plan
          and open it from there.
        </Alert>
      </PageContent>
    );
  }

  const { entry, recipeName, recipeCalories } = cached;

  function handleRemove() {
    // diet-api's openapi.yaml declares no DELETE for a meal-plan entry, so this
    // clears it from the local display cache only — the record diet-api
    // created still exists server-side (see report).
    removeCachedEntry(planId!, entry.id);
    navigate("/meal-plan");
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>
          {weekdayLabel(entry.day)} {entry.mealSlot}: {recipeName}
        </PageTitle.Header>
      </PageTitle>

      <Box sx={{ mb: 3, maxWidth: 240 }}>
        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Calories
            </Typography>
            <Typography variant="h4">{recipeCalories}</Typography>
          </CardContent>
        </Card>
      </Box>

      <Stack direction="row" justifyContent="flex-end" spacing={2}>
        <Button variant="outlined" color="error" onClick={handleRemove}>
          Remove
        </Button>
        <Button variant="contained" onClick={() => navigate(`/meal-plan/entries/${entry.id}/order`)}>
          Order for lunch
        </Button>
      </Stack>
    </PageContent>
  );
}
