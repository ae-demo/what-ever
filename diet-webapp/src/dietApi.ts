// Typed operations against diet-api, one function per openapi.yaml operation
// this app calls. Every shape comes from src/generated/diet-api.ts — never
// hand-rolled. `withUserHeader` (src/api.ts) satisfies the generated client's
// required `X-User-Id` header type; the real value is gateway-injected.
import { dietApiClient, withUserHeader } from "./api";
import type { components } from "./generated/diet-api";

export type Goal = components["schemas"]["Goal"];
export type GoalInput = components["schemas"]["GoalInput"];
export type Recipe = components["schemas"]["Recipe"];
export type MealPlan = components["schemas"]["MealPlan"];
export type MealPlanEntry = components["schemas"]["MealPlanEntry"];
export type LunchOrder = components["schemas"]["LunchOrder"];
export type FoodLogEntry = components["schemas"]["FoodLogEntry"];
export type FoodLogPage = components["schemas"]["FoodLogPage"];
export type WeightEntry = components["schemas"]["WeightEntry"];
export type CoachConnection = components["schemas"]["CoachConnection"];
export type Feedback = components["schemas"]["Feedback"];

function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (result.error !== undefined || !result.data) {
    const message =
      result.error && typeof result.error === "object" && "message" in result.error
        ? String((result.error as { message?: unknown }).message)
        : `request failed with status ${result.response.status}`;
    throw new Error(message);
  }
  return result.data;
}

export async function getGoal(): Promise<Goal | null> {
  const res = await dietApiClient.GET("/goal", { params: withUserHeader() });
  if (res.response.status === 404) return null;
  return unwrap(res);
}

export async function setGoal(input: GoalInput): Promise<Goal> {
  const res = await dietApiClient.PUT("/goal", {
    params: withUserHeader(),
    body: input,
  });
  return unwrap(res);
}

export async function listRecipes(search?: string): Promise<Recipe[]> {
  const res = await dietApiClient.GET("/recipes", {
    params: { query: { limit: 100, search: search || undefined } },
  });
  return unwrap(res).data;
}

export async function getRecipe(recipeId: string): Promise<Recipe> {
  const res = await dietApiClient.GET("/recipes/{recipeId}", {
    params: { path: { recipeId } },
  });
  return unwrap(res);
}

export async function listMealPlans(): Promise<MealPlan[]> {
  const res = await dietApiClient.GET("/meal-plans", {
    params: withUserHeader({ query: { limit: 100 } } as never),
  });
  return unwrap(res).data;
}

export async function createMealPlan(weekStarting: string): Promise<MealPlan> {
  const res = await dietApiClient.POST("/meal-plans", {
    params: withUserHeader(),
    body: { weekStarting },
  });
  return unwrap(res);
}

export async function addMealPlanEntry(
  mealPlanId: string,
  input: components["schemas"]["MealPlanEntryInput"],
): Promise<MealPlanEntry> {
  const res = await dietApiClient.POST("/meal-plans/{mealPlanId}/entries", {
    params: { ...withUserHeader(), path: { mealPlanId } },
    body: input,
  });
  return unwrap(res);
}

export async function orderLunch(entryId: string): Promise<LunchOrder> {
  const res = await dietApiClient.POST("/meal-plan-entries/{entryId}/order", {
    params: { ...withUserHeader(), path: { entryId } },
  });
  return unwrap(res);
}

export async function listFoodLogEntries(day?: string): Promise<FoodLogPage> {
  const res = await dietApiClient.GET("/food-log", {
    params: withUserHeader({ query: { limit: 100, day } } as never),
  });
  return unwrap(res);
}

export async function logFood(
  input: components["schemas"]["FoodLogEntryInput"],
): Promise<FoodLogEntry> {
  const res = await dietApiClient.POST("/food-log", {
    params: withUserHeader(),
    body: input,
  });
  return unwrap(res);
}

export async function listWeightEntries(): Promise<WeightEntry[]> {
  const res = await dietApiClient.GET("/weight-entries", {
    params: withUserHeader({ query: { limit: 100 } } as never),
  });
  return unwrap(res).data;
}

export async function recordWeight(
  input: components["schemas"]["WeightEntryInput"],
): Promise<WeightEntry> {
  const res = await dietApiClient.POST("/weight-entries", {
    params: withUserHeader(),
    body: input,
  });
  return unwrap(res);
}

export async function listCoachConnections(): Promise<CoachConnection[]> {
  const res = await dietApiClient.GET("/coach-connections", {
    params: withUserHeader({ query: { limit: 100 } } as never),
  });
  return unwrap(res).data;
}

export async function inviteCoach(coachEmail: string): Promise<CoachConnection> {
  const res = await dietApiClient.POST("/coach-connections", {
    params: withUserHeader(),
    body: { coachEmail },
  });
  return unwrap(res);
}

export async function listFeedback(connectionId: string): Promise<Feedback[]> {
  const res = await dietApiClient.GET("/coach-connections/{connectionId}/feedback", {
    params: { ...withUserHeader(), path: { connectionId } },
  });
  return unwrap(res).data;
}

export async function leaveFeedback(connectionId: string, message: string): Promise<Feedback> {
  const res = await dietApiClient.POST("/coach-connections/{connectionId}/feedback", {
    params: { ...withUserHeader(), path: { connectionId } },
    body: { message },
  });
  return unwrap(res);
}
