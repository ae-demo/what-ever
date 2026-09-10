// diet-api's committed openapi.yaml exposes POST /meal-plans and
// POST /meal-plans/{id}/entries (create), but NO GET to list a meal plan's
// entries and no GET for a single meal plan or a single entry — see the
// component's report for this gap. Without a list-back endpoint the only way
// to show a meal plan's entries after creating them is to remember what this
// browser created, so this is a client-side display cache (not a data store
// standing in for the backend — diet-api still holds the authoritative
// records, we just cannot read them back). It persists in localStorage so a
// reload of MealPlan/MealPlanEntry does not lose what was just planned; it
// carries no weight for correctness beyond this browser/session.
import type { components } from "../generated/diet-api";

type MealPlanEntry = components["schemas"]["MealPlanEntry"];

export interface CachedEntry {
  entry: MealPlanEntry;
  recipeName: string;
  recipeCalories: number;
}

const PLAN_ID_KEY = "diet-webapp:current-meal-plan-id";
const ENTRIES_KEY_PREFIX = "diet-webapp:meal-plan-entries:";

export function getCurrentMealPlanId(): string | null {
  return localStorage.getItem(PLAN_ID_KEY);
}

export function setCurrentMealPlanId(id: string): void {
  localStorage.setItem(PLAN_ID_KEY, id);
}

function entriesKey(mealPlanId: string): string {
  return `${ENTRIES_KEY_PREFIX}${mealPlanId}`;
}

export function listCachedEntries(mealPlanId: string): CachedEntry[] {
  const raw = localStorage.getItem(entriesKey(mealPlanId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CachedEntry[];
  } catch {
    return [];
  }
}

export function addCachedEntry(mealPlanId: string, cached: CachedEntry): void {
  const existing = listCachedEntries(mealPlanId);
  localStorage.setItem(entriesKey(mealPlanId), JSON.stringify([...existing, cached]));
}

export function removeCachedEntry(mealPlanId: string, entryId: string): void {
  const existing = listCachedEntries(mealPlanId);
  localStorage.setItem(
    entriesKey(mealPlanId),
    JSON.stringify(existing.filter((c) => c.entry.id !== entryId)),
  );
}

export function findCachedEntry(mealPlanId: string, entryId: string): CachedEntry | undefined {
  return listCachedEntries(mealPlanId).find((c) => c.entry.id === entryId);
}
