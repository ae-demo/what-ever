// One handler per diet-api operation this app calls, seeded to match
// wireframes.dsl's example rows (via the wireframes skill's seed.mjs) wherever
// diet-api's contract can supply them. State lives in module scope, so it
// resets on a full page reload — see react-webapp's mock-mode.md — and any
// full reload restores exactly this seed. There is only one mock Dieter
// identity and one mock Coach identity, per mock/roles.ts and the ?role= URL
// param; the mock cannot distinguish two different Dieters signed in at once,
// which is why a couple of "other" ids below are synthetic strings rather
// than a second real identity.
import { http, HttpResponse } from "msw";
import type { components } from "../src/generated/diet-api";
import { rolesFromToken } from "./auth";

type Goal = components["schemas"]["Goal"];
type Recipe = components["schemas"]["Recipe"];
type MealPlan = components["schemas"]["MealPlan"];
type MealPlanEntry = components["schemas"]["MealPlanEntry"];
type LunchOrder = components["schemas"]["LunchOrder"];
type FoodLogEntry = components["schemas"]["FoodLogEntry"];
type WeightEntry = components["schemas"]["WeightEntry"];
type CoachConnection = components["schemas"]["CoachConnection"];
type Feedback = components["schemas"]["Feedback"];

const DIETER_SUB = "mock-dieter";
const COACH_SUB = "mock-coach";

function roleOf(request: Request): { isDieter: boolean; isCoach: boolean } {
  const roles = rolesFromToken(request.headers.get("authorization"));
  return {
    isDieter: roles.some((r) => r.toLowerCase().includes("dieter")),
    isCoach: roles.some((r) => r.toLowerCase().includes("coach")),
  };
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function err(code: number, message: string) {
  return HttpResponse.json({ code, message }, { status: code });
}

// ---- Recipes (fixed catalog; ids are stable slugs) ------------------------

let recipes: Recipe[] = [
  { id: "grilled-chicken-bowl", name: "Grilled chicken bowl", calories: 480, proteinG: 42, carbG: 38, fatG: 16 },
  { id: "veggie-stir-fry", name: "Veggie stir fry", calories: 350, proteinG: 18, carbG: 45, fatG: 10 },
  { id: "salmon-salad", name: "Salmon salad", calories: 420, proteinG: 36, carbG: 12, fatG: 24 },
  { id: "oatmeal", name: "Oatmeal", calories: 320, proteinG: 10, carbG: 54, fatG: 6 },
  { id: "yogurt-bowl", name: "Yogurt bowl", calories: 300, proteinG: 15, carbG: 40, fatG: 8 },
];

// ---- Goal (one per role identity) -----------------------------------------

let goal: Goal | null = {
  id: "goal-1",
  dieterId: DIETER_SUB,
  calorieTarget: 2000,
  proteinTargetG: 120,
  carbTargetG: 220,
  fatTargetG: 65,
};

// ---- Meal plans + entries --------------------------------------------------

let mealPlans: MealPlan[] = [];
let mealPlanEntries: MealPlanEntry[] = [];
let entrySeq = 1;
let planSeq = 1;

// ---- Food log ---------------------------------------------------------------

const now = new Date();
function atToday(hour: number, minute: number): string {
  const d = new Date(now);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

let foodLogEntries: FoodLogEntry[] = [
  { id: "log-1", dieterId: DIETER_SUB, recipeId: "oatmeal", loggedAt: atToday(8, 10), quantity: 1 },
  { id: "log-2", dieterId: DIETER_SUB, recipeId: "grilled-chicken-bowl", loggedAt: atToday(13, 5), quantity: 1 },
];
let foodLogSeq = 3;

// ---- Weight entries ---------------------------------------------------------

let weightEntries: WeightEntry[] = [
  { id: "weight-1", dieterId: DIETER_SUB, recordedOn: daysAgo(21), weightKg: 82.4 },
  { id: "weight-2", dieterId: DIETER_SUB, recordedOn: daysAgo(14), weightKg: 81.6 },
  { id: "weight-3", dieterId: DIETER_SUB, recordedOn: daysAgo(7), weightKg: 80.9 },
  { id: "weight-4", dieterId: DIETER_SUB, recordedOn: daysAgo(0), weightKg: 80.1 },
];
let weightSeq = 5;

function daysAgo(n: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// ---- Coach connections + feedback -------------------------------------------

let connections: CoachConnection[] = [
  { id: "conn-1", dieterId: DIETER_SUB, coachId: COACH_SUB, status: "active" },
  { id: "conn-2", dieterId: DIETER_SUB, coachId: "coach-sam-rios", status: "pending" },
  { id: "conn-3", dieterId: "dieter-jo-patel", coachId: COACH_SUB, status: "active" },
];
let connectionSeq = 4;

let feedbackByConnection: Record<string, Feedback[]> = {
  "conn-1": [
    {
      id: "fb-1",
      coachConnectionId: "conn-1",
      message: "Great job hitting your protein goal this week — keep it up!",
      sentAt: daysAgo(2) + "T09:00:00.000Z",
    },
  ],
};

export const handlers = [
  // ---- Goal ----
  http.get("/api/goal", ({ request }) => {
    if (!request.headers.get("authorization")) return err(401, "unauthorized");
    return goal ? HttpResponse.json(goal) : err(404, "No goal set");
  }),

  http.put("/api/goal", async ({ request }) => {
    const input = (await request.json()) as components["schemas"]["GoalInput"];
    if (typeof input.calorieTarget !== "number") return err(400, "calorieTarget is required");
    goal = {
      id: goal?.id ?? "goal-1",
      dieterId: DIETER_SUB,
      calorieTarget: input.calorieTarget,
      proteinTargetG: input.proteinTargetG,
      carbTargetG: input.carbTargetG,
      fatTargetG: input.fatTargetG,
    };
    return HttpResponse.json(goal);
  }),

  // ---- Recipes ----
  http.get("/api/recipes", ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase();
    const data = search ? recipes.filter((r) => r.name.toLowerCase().includes(search)) : recipes;
    return HttpResponse.json({ count: data.length, next: null, previous: null, data });
  }),

  http.get("/api/recipes/:recipeId", ({ params }) => {
    const recipe = recipes.find((r) => r.id === params.recipeId);
    return recipe ? HttpResponse.json(recipe) : err(404, "Recipe not found");
  }),

  // ---- Meal plans ----
  http.get("/api/meal-plans", () => {
    return HttpResponse.json({ count: mealPlans.length, next: null, previous: null, data: mealPlans });
  }),

  http.post("/api/meal-plans", async ({ request }) => {
    const input = (await request.json()) as components["schemas"]["MealPlanInput"];
    const plan: MealPlan = { id: `plan-${planSeq++}`, dieterId: DIETER_SUB, weekStarting: input.weekStarting };
    mealPlans = [...mealPlans, plan];
    return HttpResponse.json(plan, { status: 201 });
  }),

  http.post("/api/meal-plans/:mealPlanId/entries", async ({ request, params }) => {
    const plan = mealPlans.find((p) => p.id === params.mealPlanId);
    if (!plan) return err(404, "Meal plan not found");
    const input = (await request.json()) as components["schemas"]["MealPlanEntryInput"];
    const entry: MealPlanEntry = {
      id: `entry-${entrySeq++}`,
      mealPlanId: plan.id,
      recipeId: input.recipeId,
      day: input.day,
      mealSlot: input.mealSlot,
    };
    mealPlanEntries = [...mealPlanEntries, entry];
    return HttpResponse.json(entry, { status: 201 });
  }),

  // ---- Lunch ordering ----
  http.post("/api/meal-plan-entries/:entryId/order", ({ params }) => {
    const entry = mealPlanEntries.find((e) => e.id === params.entryId);
    if (!entry) return err(404, "Entry not found");
    const order: LunchOrder = {
      id: `order-${entry.id}`,
      mealPlanEntryId: entry.id,
      whatsappMessageId: `wamid.${entry.id}`,
      status: "confirmed",
    };
    return HttpResponse.json(order, { status: 201 });
  }),

  // ---- Food log ----
  http.get("/api/food-log", ({ request }) => {
    const url = new URL(request.url);
    const day = url.searchParams.get("day");
    const data = day ? foodLogEntries.filter((e) => e.loggedAt.slice(0, 10) === day) : foodLogEntries;
    const totals = data.reduce(
      (acc, e) => {
        const recipe = recipes.find((r) => r.id === e.recipeId);
        if (recipe) {
          acc.calories += recipe.calories * e.quantity;
          acc.protein += (recipe.proteinG ?? 0) * e.quantity;
          acc.carb += (recipe.carbG ?? 0) * e.quantity;
          acc.fat += (recipe.fatG ?? 0) * e.quantity;
        }
        return acc;
      },
      { calories: 0, protein: 0, carb: 0, fat: 0 },
    );
    return HttpResponse.json({
      count: data.length,
      next: null,
      previous: null,
      data,
      totalCalories: totals.calories,
      totalProteinG: totals.protein,
      totalCarbG: totals.carb,
      totalFatG: totals.fat,
    });
  }),

  http.post("/api/food-log", async ({ request }) => {
    const input = (await request.json()) as components["schemas"]["FoodLogEntryInput"];
    if (!input.recipeId || !input.quantity) return err(400, "recipeId and quantity are required");
    const entry: FoodLogEntry = {
      id: `log-${foodLogSeq++}`,
      dieterId: DIETER_SUB,
      recipeId: input.recipeId,
      loggedAt: input.loggedAt ?? new Date().toISOString(),
      quantity: input.quantity,
    };
    foodLogEntries = [...foodLogEntries, entry];
    return HttpResponse.json(entry, { status: 201 });
  }),

  // ---- Weight entries ----
  http.get("/api/weight-entries", () => {
    return HttpResponse.json({ count: weightEntries.length, next: null, previous: null, data: weightEntries });
  }),

  http.post("/api/weight-entries", async ({ request }) => {
    const input = (await request.json()) as components["schemas"]["WeightEntryInput"];
    const entry: WeightEntry = {
      id: `weight-${weightSeq++}`,
      dieterId: DIETER_SUB,
      recordedOn: input.recordedOn ?? todayIso(),
      weightKg: input.weightKg,
    };
    weightEntries = [...weightEntries, entry];
    return HttpResponse.json(entry, { status: 201 });
  }),

  // ---- Coach connections ----
  http.get("/api/coach-connections", ({ request }) => {
    const { isDieter, isCoach } = roleOf(request);
    const data = isCoach
      ? connections.filter((c) => c.coachId === COACH_SUB)
      : isDieter
        ? connections.filter((c) => c.dieterId === DIETER_SUB)
        : [];
    return HttpResponse.json({ count: data.length, next: null, previous: null, data });
  }),

  http.post("/api/coach-connections", async ({ request }) => {
    const input = (await request.json()) as components["schemas"]["CoachInviteInput"];
    if (!input.coachEmail) return err(400, "coachEmail is required");
    const connection: CoachConnection = {
      id: `conn-${connectionSeq++}`,
      dieterId: DIETER_SUB,
      coachId: input.coachEmail.split("@")[0],
      status: "pending",
    };
    connections = [...connections, connection];
    return HttpResponse.json(connection, { status: 201 });
  }),

  // ---- Feedback ----
  http.get("/api/coach-connections/:connectionId/feedback", ({ params }) => {
    const connectionId = String(params.connectionId);
    if (!connections.some((c) => c.id === connectionId)) return err(404, "Connection not found");
    const data = feedbackByConnection[connectionId] ?? [];
    return HttpResponse.json({ count: data.length, next: null, previous: null, data });
  }),

  http.post("/api/coach-connections/:connectionId/feedback", async ({ request, params }) => {
    const { isCoach } = roleOf(request);
    if (!isCoach) return err(403, "Caller is not this connection's coach");
    const connectionId = String(params.connectionId);
    const connection = connections.find((c) => c.id === connectionId);
    if (!connection) return err(404, "Connection not found");
    const input = (await request.json()) as components["schemas"]["FeedbackInput"];
    const feedback: Feedback = {
      id: `fb-${Date.now()}`,
      coachConnectionId: connectionId,
      message: input.message,
      sentAt: new Date().toISOString(),
    };
    feedbackByConnection[connectionId] = [...(feedbackByConnection[connectionId] ?? []), feedback];
    return HttpResponse.json(feedback, { status: 201 });
  }),
];
