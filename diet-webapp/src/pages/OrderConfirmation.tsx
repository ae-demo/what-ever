import type { JSX } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button, Chip, PageContent, PageTitle, Typography } from "@wso2/oxygen-ui";
import type { LunchOrder } from "../dietApi";

interface LocationState {
  order?: LunchOrder;
  recipeName?: string;
}

export default function OrderConfirmation(): JSX.Element {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { order, recipeName } = (state as LocationState) ?? {};

  const status = order?.status ?? "placed";
  const isFailed = status === "failed";

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>{isFailed ? "Order failed" : "Order sent"}</PageTitle.Header>
      </PageTitle>

      <Chip
        label={isFailed ? "Failed" : status === "confirmed" ? "Confirmed" : "Sent"}
        color={isFailed ? "error" : "success"}
        size="small"
        sx={{ mb: 2 }}
      />

      <Typography sx={{ mb: 3 }}>
        {isFailed
          ? `Your lunch order${recipeName ? ` for ${recipeName}` : ""} could not be sent to the restaurant on WhatsApp. Please try again.`
          : `Your lunch order${recipeName ? ` for ${recipeName}` : ""} has been sent to the restaurant on WhatsApp.`}
      </Typography>

      <Button variant="contained" onClick={() => navigate("/meal-plan")}>
        Back to meal plan
      </Button>
    </PageContent>
  );
}
