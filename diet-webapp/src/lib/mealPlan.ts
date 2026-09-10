import { createMealPlan, listMealPlans, type MealPlan } from "../dietApi";
import { mondayOf } from "./date";
import { getCurrentMealPlanId, setCurrentMealPlanId } from "./planStore";

/** Finds this week's meal plan, or creates one — there is no upsert in the contract. */
export async function getOrCreateCurrentMealPlan(): Promise<MealPlan> {
  const week = mondayOf();
  const cachedId = getCurrentMealPlanId();
  const plans = await listMealPlans();
  const existing =
    plans.find((p) => p.weekStarting === week) ?? (cachedId ? plans.find((p) => p.id === cachedId) : undefined);
  if (existing) {
    setCurrentMealPlanId(existing.id);
    return existing;
  }
  const created = await createMealPlan(week);
  setCurrentMealPlanId(created.id);
  return created;
}
