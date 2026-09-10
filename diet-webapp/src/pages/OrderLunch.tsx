import { useState, type JSX } from "react";
import { useNavigate, useParams } from "react-router";
import { Alert, Chip, PageContent, PageTitle, Stack, Button, Typography } from "@wso2/oxygen-ui";
import { orderLunch } from "../dietApi";
import { getCurrentMealPlanId, findCachedEntry } from "../lib/planStore";

export default function OrderLunch(): JSX.Element {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const planId = getCurrentMealPlanId();
  const cached = entryId && planId ? findCachedEntry(planId, entryId) : undefined;
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePlaceOrder() {
    if (!entryId) return;
    setPlacing(true);
    setError(null);
    try {
      const order = await orderLunch(entryId);
      navigate(`/orders/${order.id}/confirmation`, { state: { order, recipeName: cached?.recipeName } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Order for lunch</PageTitle.Header>
      </PageTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography sx={{ mb: 2 }}>
        {cached?.recipeName ?? "This meal"} will be sent as a WhatsApp message to the restaurant.
      </Typography>
      <Chip label="WhatsApp" color="info" size="small" sx={{ mb: 3 }} />

      <Stack direction="row" justifyContent="flex-end" spacing={2}>
        <Button variant="outlined" onClick={() => navigate(entryId ? `/meal-plan/entries/${entryId}` : "/meal-plan")}>
          Cancel
        </Button>
        <Button variant="contained" disabled={placing} onClick={() => void handlePlaceOrder()}>
          Place order
        </Button>
      </Stack>
    </PageContent>
  );
}
