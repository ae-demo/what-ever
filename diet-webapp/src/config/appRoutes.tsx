import { type RouteProps } from "react-router";
import AppLayout from "../layouts/AppLayout";
import RequireRole from "../RequireRole";
import Home from "../pages/Home";
import Callback from "../pages/Callback";
import Dashboard from "../pages/Dashboard";
import SetGoal from "../pages/SetGoal";
import Recipes from "../pages/Recipes";
import RecipeDetail from "../pages/RecipeDetail";
import MealPlan from "../pages/MealPlan";
import MealPlanEntry from "../pages/MealPlanEntry";
import OrderLunch from "../pages/OrderLunch";
import OrderConfirmation from "../pages/OrderConfirmation";
import FoodLog from "../pages/FoodLog";
import LogMeal from "../pages/LogMeal";
import WeightProgress from "../pages/WeightProgress";
import RecordWeight from "../pages/RecordWeight";
import Coaches from "../pages/Coaches";
import InviteCoach from "../pages/InviteCoach";
import ConnectedDieters from "../pages/ConnectedDieters";
import DieterProgress from "../pages/DieterProgress";
import LeaveFeedback from "../pages/LeaveFeedback";

export interface AppRoute extends Omit<RouteProps, "children"> {
  children?: AppRoute[];
  label?: string;
}

const appRoutes: AppRoute[] = [
  { path: "/callback", element: <Callback /> },
  { path: "/", element: <Home />, label: "Home" },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/dashboard",
        label: "Dashboard",
        element: (
          <RequireRole role="Dieter">
            <Dashboard />
          </RequireRole>
        ),
      },
      {
        path: "/goal",
        label: "SetGoal",
        element: (
          <RequireRole role="Dieter">
            <SetGoal />
          </RequireRole>
        ),
      },
      {
        path: "/recipes",
        label: "Recipes",
        element: (
          <RequireRole role="Dieter">
            <Recipes />
          </RequireRole>
        ),
      },
      {
        path: "/recipes/:recipeId",
        label: "RecipeDetail",
        element: (
          <RequireRole role="Dieter">
            <RecipeDetail />
          </RequireRole>
        ),
      },
      {
        path: "/meal-plan",
        label: "MealPlan",
        element: (
          <RequireRole role="Dieter">
            <MealPlan />
          </RequireRole>
        ),
      },
      {
        path: "/meal-plan/entries/:entryId",
        label: "MealPlanEntry",
        element: (
          <RequireRole role="Dieter">
            <MealPlanEntry />
          </RequireRole>
        ),
      },
      {
        path: "/meal-plan/entries/:entryId/order",
        label: "OrderLunch",
        element: (
          <RequireRole role="Dieter">
            <OrderLunch />
          </RequireRole>
        ),
      },
      {
        path: "/orders/:orderId/confirmation",
        label: "OrderConfirmation",
        element: (
          <RequireRole role="Dieter">
            <OrderConfirmation />
          </RequireRole>
        ),
      },
      {
        path: "/food-log",
        label: "FoodLog",
        element: (
          <RequireRole role="Dieter">
            <FoodLog />
          </RequireRole>
        ),
      },
      {
        path: "/food-log/new",
        label: "LogMeal",
        element: (
          <RequireRole role="Dieter">
            <LogMeal />
          </RequireRole>
        ),
      },
      {
        path: "/weight",
        label: "WeightProgress",
        element: (
          <RequireRole role="Dieter">
            <WeightProgress />
          </RequireRole>
        ),
      },
      {
        path: "/weight/new",
        label: "RecordWeight",
        element: (
          <RequireRole role="Dieter">
            <RecordWeight />
          </RequireRole>
        ),
      },
      {
        path: "/coaches",
        label: "Coaches",
        element: (
          <RequireRole role="Dieter">
            <Coaches />
          </RequireRole>
        ),
      },
      {
        path: "/coaches/invite",
        label: "InviteCoach",
        element: (
          <RequireRole role="Dieter">
            <InviteCoach />
          </RequireRole>
        ),
      },
      {
        path: "/dieters",
        label: "ConnectedDieters",
        element: (
          <RequireRole role="Coach">
            <ConnectedDieters />
          </RequireRole>
        ),
      },
      {
        path: "/dieters/:connectionId",
        label: "DieterProgress",
        element: (
          <RequireRole role="Coach">
            <DieterProgress />
          </RequireRole>
        ),
      },
      {
        path: "/dieters/:connectionId/feedback",
        label: "LeaveFeedback",
        element: (
          <RequireRole role="Coach">
            <LeaveFeedback />
          </RequireRole>
        ),
      },
    ],
  },
];

export default appRoutes;
