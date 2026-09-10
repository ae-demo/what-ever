# Domain Model

The core entities behind meal planning, logging, progress tracking, and the
coach relationship.

```mermaid
erDiagram
    DIETER ||--|| GOAL : sets
    DIETER ||--o{ MEAL_PLAN : builds
    MEAL_PLAN ||--o{ MEAL_PLAN_ENTRY : contains
    MEAL_PLAN_ENTRY }o--|| RECIPE : references
    DIETER ||--o{ FOOD_LOG_ENTRY : logs
    FOOD_LOG_ENTRY }o--|| RECIPE : references
    DIETER ||--o{ WEIGHT_ENTRY : records
    DIETER ||--o{ COACH_CONNECTION : has
    COACH ||--o{ COACH_CONNECTION : has
    COACH_CONNECTION ||--o{ FEEDBACK : carries
    COACH ||--o{ FEEDBACK : writes
    MEAL_PLAN_ENTRY ||--o| LUNCH_ORDER : "ordered as"

    DIETER {
        string id
        string name
        string email
    }
    COACH {
        string id
        string name
        string email
    }
    GOAL {
        string id
        string dieterId
        int calorieTarget
        int proteinTargetG
        int carbTargetG
        int fatTargetG
    }
    RECIPE {
        string id
        string name
        int calories
        int proteinG
        int carbG
        int fatG
    }
    MEAL_PLAN {
        string id
        string dieterId
        date weekStarting
    }
    MEAL_PLAN_ENTRY {
        string id
        string mealPlanId
        string recipeId
        date day
        string mealSlot
    }
    FOOD_LOG_ENTRY {
        string id
        string dieterId
        string recipeId
        datetime loggedAt
        int quantity
    }
    WEIGHT_ENTRY {
        string id
        string dieterId
        date recordedOn
        decimal weightKg
    }
    COACH_CONNECTION {
        string id
        string dieterId
        string coachId
        string status
    }
    FEEDBACK {
        string id
        string coachConnectionId
        string message
        datetime sentAt
    }
    LUNCH_ORDER {
        string id
        string mealPlanEntryId
        string uberEatsOrderId
        string status
    }
```

A **Dieter** sets one active **Goal**, builds **MealPlan**s from the
**Recipe** catalog, and logs actual meals as **FoodLogEntry** rows. A
**WeightEntry** records progress over time. A **CoachConnection** links a
Dieter to a **Coach** (many-to-many); a Coach leaves **Feedback** on a
connection. A **MealPlanEntry** may be ordered through Uber Eats, recorded as
a **LunchOrder**.