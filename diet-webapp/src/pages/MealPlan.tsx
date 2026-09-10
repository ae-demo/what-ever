import { useEffect, useMemo, useState, type JSX } from "react";
import { useNavigate } from "react-router";
import { Box, Button, ListingTable, PageContent, PageTitle, Typography } from "@wso2/oxygen-ui";
import { getOrCreateCurrentMealPlan } from "../lib/mealPlan";
import { listCachedEntries, type CachedEntry } from "../lib/planStore";
import { WEEKDAY_LABELS, mondayOf } from "../lib/date";

const SLOTS = ["breakfast", "lunch", "dinner"] as const;

export default function MealPlan(): JSX.Element {
  const navigate = useNavigate();
  const [weekStarting, setWeekStarting] = useState(mondayOf());
  const [entries, setEntries] = useState<CachedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const plan = await getOrCreateCurrentMealPlan();
        if (cancelled) return;
        setWeekStarting(plan.weekStarting);
        setEntries(listCachedEntries(plan.id));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load meal plan");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const byDay = useMemo(() => {
    const map = new Map<number, Record<(typeof SLOTS)[number], CachedEntry | undefined>>();
    for (let i = 0; i < 7; i++) map.set(i, { breakfast: undefined, lunch: undefined, dinner: undefined });
    const monday = new Date(weekStarting + "T00:00:00");
    for (const cached of entries) {
      if (!SLOTS.includes(cached.entry.mealSlot as (typeof SLOTS)[number])) continue;
      const dayDate = new Date(cached.entry.day + "T00:00:00");
      const offset = Math.round((dayDate.getTime() - monday.getTime()) / 86400000);
      if (offset < 0 || offset > 6) continue;
      const row = map.get(offset);
      if (row) row[cached.entry.mealSlot as (typeof SLOTS)[number]] = cached;
    }
    return map;
  }, [entries, weekStarting]);

  const weekLabel = new Date(weekStarting + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Week of {weekLabel}</PageTitle.Header>
        <PageTitle.Actions>
          <Button variant="contained" onClick={() => navigate("/recipes")}>
            Add recipe to plan
          </Button>
        </PageTitle.Actions>
      </PageTitle>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          diet-api has no endpoint to list a meal plan&apos;s entries — this table shows
          only meals added from this browser since diet-api has no GET for meal
          plan entries (see report).
        </Typography>
      </Box>

      <ListingTable.Container>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Day</ListingTable.Cell>
              <ListingTable.Cell>Breakfast</ListingTable.Cell>
              <ListingTable.Cell>Lunch</ListingTable.Cell>
              <ListingTable.Cell>Dinner</ListingTable.Cell>
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {WEEKDAY_LABELS.map((label, i) => {
              const row = byDay.get(i)!;
              return (
                <ListingTable.Row key={label}>
                  <ListingTable.Cell>{label}</ListingTable.Cell>
                  {SLOTS.map((slot) => (
                    <ListingTable.Cell key={slot}>
                      {row[slot] ? (
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => navigate(`/meal-plan/entries/${row[slot]!.entry.id}`)}
                        >
                          {row[slot]!.recipeName}
                        </Button>
                      ) : (
                        "—"
                      )}
                    </ListingTable.Cell>
                  ))}
                </ListingTable.Row>
              );
            })}
          </ListingTable.Body>
        </ListingTable>
        {!loading && entries.length === 0 && (
          <ListingTable.EmptyState
            title="No meals planned yet"
            description="Add a recipe to this week's plan."
          />
        )}
      </ListingTable.Container>
    </PageContent>
  );
}
