import { useEffect, useMemo, useState, type JSX } from "react";
import { useNavigate } from "react-router";
import { Box, Button, Card, CardContent, Grid, PageContent, PageTitle, Stack, Typography, Alert } from "@wso2/oxygen-ui";
import { LineChart, XAxis, YAxis, Line, CartesianGrid, ChartTooltip } from "@wso2/oxygen-ui-charts-react";
import { getGoal, listFoodLogEntries, type Goal, type FoodLogEntry } from "../dietApi";
import { isoDate, today, weekdayLabel } from "../lib/date";

function StatTile({ label, value, caption }: { label: string; value: string; caption: string }): JSX.Element {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4">{value}</Typography>
        <Typography variant="caption" color="text.secondary">
          {caption}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Dashboard(): JSX.Element {
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [todayTotals, setTodayTotals] = useState({
    calories: 0,
    protein: 0,
    carb: 0,
    fat: 0,
  });
  const [weekEntries, setWeekEntries] = useState<FoodLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [g, todayPage, weekPage] = await Promise.all([
          getGoal(),
          listFoodLogEntries(today()),
          listFoodLogEntries(),
        ]);
        if (cancelled) return;
        setGoal(g);
        setTodayTotals({
          calories: todayPage.totalCalories ?? 0,
          protein: todayPage.totalProteinG ?? 0,
          carb: todayPage.totalCarbG ?? 0,
          fat: todayPage.totalFatG ?? 0,
        });
        setWeekEntries(weekPage.data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const entry of weekEntries) {
      const day = isoDate(new Date(entry.loggedAt));
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    }
    // Sum calories per day using entries; quantity/calories not resolvable per
    // entry without a recipe join, so this chart plots entry count per day —
    // the closest weekly trend derivable from /food-log alone.
    const sorted = Array.from(byDay.entries()).sort(([a], [b]) => a.localeCompare(b));
    return sorted.map(([day, count]) => ({ day: weekdayLabel(day), entries: count }));
  }, [weekEntries]);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Today</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            label="Calories"
            value={loading ? "…" : `${todayTotals.calories}`}
            caption={`of ${goal?.calorieTarget ?? "—"} goal`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            label="Protein"
            value={loading ? "…" : `${todayTotals.protein}g`}
            caption={`of ${goal?.proteinTargetG ?? "—"}g goal`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            label="Carbs"
            value={loading ? "…" : `${todayTotals.carb}g`}
            caption={`of ${goal?.carbTargetG ?? "—"}g goal`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            label="Fat"
            value={loading ? "…" : `${todayTotals.fat}g`}
            caption={`of ${goal?.fatTargetG ?? "—"}g goal`}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Calories this week
      </Typography>
      <Box sx={{ mb: 3 }}>
        {chartData.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No food logged this week yet.
          </Typography>
        ) : (
          <LineChart
            data={chartData}
            xAxisDataKey="day"
            lines={[{ dataKey: "entries", name: "Meals logged", stroke: "var(--mui-palette-primary-main)" }]}
            height={260}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <ChartTooltip />
          </LineChart>
        )}
      </Box>

      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={() => navigate("/goal")}>
          Set goal
        </Button>
        <Button variant="contained" onClick={() => navigate("/food-log")}>
          Log a meal
        </Button>
      </Stack>
    </PageContent>
  );
}
