import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router";
import { Alert, Box, Button, PageContent, PageTitle, Stack, Typography } from "@wso2/oxygen-ui";
import { LineChart, XAxis, YAxis, CartesianGrid, ChartTooltip } from "@wso2/oxygen-ui-charts-react";
import { listWeightEntries, type WeightEntry } from "../dietApi";

export default function WeightProgress(): JSX.Element {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listWeightEntries()
      .then((data) => {
        if (!cancelled) setEntries([...data].sort((a, b) => a.recordedOn.localeCompare(b.recordedOn)));
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load weight history");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = entries.map((e) => ({ day: e.recordedOn, weightKg: e.weightKg }));

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Weight trend</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        {!loading && chartData.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No weight recorded yet.
          </Typography>
        ) : (
          <LineChart
            data={chartData}
            xAxisDataKey="day"
            lines={[{ dataKey: "weightKg", name: "Weight (kg)", stroke: "var(--mui-palette-primary-main)" }]}
            height={260}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={["auto", "auto"]} />
            <ChartTooltip />
          </LineChart>
        )}
      </Box>

      <Stack direction="row" justifyContent="flex-end">
        <Button variant="contained" onClick={() => navigate("/weight/new")}>
          Record weight
        </Button>
      </Stack>
    </PageContent>
  );
}
